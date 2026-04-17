import Api from '@/api'
import type {
  QueryMemberPayOrderPageRecord,
  QueryMemberPayOrderSyncReq,
  QueryMemberPayOrderSyncResp,
  TradePushMessage
} from '@/api/interface/wallet'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import type { OrderStatusMap, TradeMessageStreamItem } from '@/utils/payOrderSync'
import {
  compareTradeMessageStreamItem,
  getTradeMessageDedupKey,
  isTradeMessageTypeSupported,
  isTradePushMessage,
  normalizeMemberPayOrderSyncRecord,
  normalizePayOrderStatus,
  normalizeTradePushMessage,
  shouldReplaceOrderStatusCacheItem
} from '@/utils/payOrderSync'
import mqtt, { type MqttClient, type Packet } from 'mqtt'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

const TRADE_MESSAGE_SYNC_STORAGE_KEY = 'memberTradeMessageSync'
const MQTT_RECONNECT_PERIOD_MS = 3000
const MQTT_KEEP_ALIVE_SECONDS = 55
const MQTT_PORT = 443
const MQTT_CONNECT_TIMEOUT_MS = 15000
const MQTT_DEBUG_STORAGE_KEY = 'mqtt.debug.all'
const MAX_SYNC_BATCHES = 20
const MAX_MESSAGE_STREAM_SIZE = 200

interface TradeMessageSyncPersistedState {
  memberId: string
  lastSyncTime?: number
  latestOrderId?: string
  messageStream: TradeMessageStreamItem[]
  orderStatusMap: OrderStatusMap
  readMessageKeys: string[]
  clearedBadgeMessageKeys: string[]
  deletedMessageKeys: string[]
}

// 从本地存储中解析交易消息同步状态，并兜底处理异常或脏数据。
const parseStoredTradeMessageSyncState = (): TradeMessageSyncPersistedState | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const storedValue = window.localStorage.getItem(TRADE_MESSAGE_SYNC_STORAGE_KEY)

  if (!storedValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(storedValue) as TradeMessageSyncPersistedState

    if (!parsedValue || typeof parsedValue !== 'object' || !parsedValue.memberId) {
      return null
    }

    return {
      memberId: String(parsedValue.memberId),
      lastSyncTime: Number(parsedValue.lastSyncTime) || undefined,
      latestOrderId: parsedValue.latestOrderId ? String(parsedValue.latestOrderId) : undefined,
      messageStream: Array.isArray(parsedValue.messageStream) ? parsedValue.messageStream : [],
      orderStatusMap:
        parsedValue.orderStatusMap && typeof parsedValue.orderStatusMap === 'object'
          ? parsedValue.orderStatusMap
          : {},
      readMessageKeys: Array.isArray(parsedValue.readMessageKeys)
        ? parsedValue.readMessageKeys.map(value => String(value))
        : [],
      clearedBadgeMessageKeys: Array.isArray(parsedValue.clearedBadgeMessageKeys)
        ? parsedValue.clearedBadgeMessageKeys.map(value => String(value))
        : [],
      deletedMessageKeys: Array.isArray(parsedValue.deletedMessageKeys)
        ? parsedValue.deletedMessageKeys.map(value => String(value))
        : []
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

// 生成查询最近一条充值或提现订单时使用的分页参数。
const toOrderPageQueryParams = (orderType: 0 | 1) => ({
  page: {
    current: 1,
    size: 1
  },
  columnCode: '',
  status: '',
  startTime: null,
  endTime: null,
  param: {
    orderType
  }
})

// 递归展开后端可能返回的多层消息结构，统一提取成交易推送消息数组。
const normalizeTradePushMessagePayload = (payload: unknown): TradePushMessage[] => {
  if (Array.isArray(payload)) {
    return payload.flatMap(item => normalizeTradePushMessagePayload(item))
  }

  if (isTradePushMessage(payload)) {
    return [payload]
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if ('data' in payload) {
    const nextData = payload.data

    if (typeof nextData === 'string') {
      try {
        return normalizeTradePushMessagePayload(JSON.parse(nextData))
      } catch (error) {
        console.error(error)
      }
    }

    return normalizeTradePushMessagePayload(nextData)
  }

  if ('result' in payload) {
    return normalizeTradePushMessagePayload(payload.result)
  }

  if ('records' in payload) {
    return normalizeTradePushMessagePayload(payload.records)
  }

  return []
}

// 读取本地调试开关，决定是否打印 MQTT 收发包日志。
const isMqttDebugEnabled = () => {
  if (typeof window === 'undefined') {
    return false
  }

  const value = window.localStorage.getItem(MQTT_DEBUG_STORAGE_KEY)
  return value === '1' || value === 'true'
}

const toMqttErrorPayload = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: (error as Error & { cause?: unknown }).cause
    }
  }

  if (error && typeof error === 'object') {
    return error
  }

  return { error }
}

interface MqttBrokerEndpoint {
  brokerUrl: string
  port?: number
}

interface DebuggableEventTarget {
  addEventListener: (
    type: string,
    listener: (event: unknown) => void,
    options?: boolean | AddEventListenerOptions
  ) => void
}

interface DebuggableOnEmitter {
  on: (event: string, listener: (...args: unknown[]) => void) => void
}

const ensureWsProtocol = (value: string) => {
  if (/^wss?:\/\//i.test(value)) {
    return value
  }

  if (/^https?:\/\//i.test(value)) {
    return value.replace(/^http/i, 'ws')
  }

  return `wss://${value}`
}

const resolveMqttBrokerEndpoint = (rawHost: string): MqttBrokerEndpoint => {
  const trimmedHost = rawHost.trim()
  const hostWithProtocol = ensureWsProtocol(trimmedHost)

  try {
    const endpointUrl = new URL(hostWithProtocol)

    if (!endpointUrl.pathname || endpointUrl.pathname === '/') {
      endpointUrl.pathname = '/mqtt'
    }

    const parsedPort = Number(endpointUrl.port)
    const resolvedPort =
      Number.isFinite(parsedPort) && parsedPort > 0 ? Math.trunc(parsedPort) : undefined

    return {
      brokerUrl: endpointUrl.toString(),
      port: resolvedPort
    }
  } catch (error) {
    console.error(error)

    const normalizedHost = hostWithProtocol.replace(/\/+$/, '')

    return {
      brokerUrl: normalizedHost.endsWith('/mqtt') ? normalizedHost : `${normalizedHost}/mqtt`,
      port: MQTT_PORT
    }
  }
}

const sanitizeMqttPacket = (packet: Packet) => {
  if (packet.cmd !== 'connect') {
    return packet
  }

  const connectPacket = packet as Packet & {
    password?: unknown
  }

  return {
    ...connectPacket,
    password: connectPacket.password ? '***' : connectPacket.password
  }
}

const hasAddEventListener = (value: unknown): value is DebuggableEventTarget => {
  return !!value && typeof value === 'object' && 'addEventListener' in value
}

const hasOnEmitter = (value: unknown): value is DebuggableOnEmitter => {
  return !!value && typeof value === 'object' && 'on' in value
}

const attachUnderlyingWebSocketDebug = (client: MqttClient) => {
  const streamCandidate = (client as MqttClient & { stream?: unknown }).stream
  const nestedSocketCandidate =
    (streamCandidate as { socket?: unknown } | undefined)?.socket ??
    (streamCandidate as { stream?: unknown } | undefined)?.stream

  const candidates = [streamCandidate, nestedSocketCandidate]
  const eventTargetCandidate = candidates.find(hasAddEventListener)
  const onEmitterCandidate = candidates.find(hasOnEmitter)

  if (!eventTargetCandidate && !onEmitterCandidate) {
    console.warn('[MQTT][WS_DEBUG_UNAVAILABLE]', {
      streamType: typeof streamCandidate
    })
    return
  }

  if (eventTargetCandidate) {
    eventTargetCandidate.addEventListener('open', () => {
      console.log('[MQTT][WS_OPEN]')
    })

    eventTargetCandidate.addEventListener('close', event => {
      const closeEvent = event as { code?: unknown; reason?: unknown; wasClean?: unknown }

      console.warn('[MQTT][WS_CLOSE]', {
        code: closeEvent?.code,
        reason: closeEvent?.reason,
        wasClean: closeEvent?.wasClean
      })
    })

    eventTargetCandidate.addEventListener('error', event => {
      console.error('[MQTT][WS_ERROR]', event)
    })
  }

  if (onEmitterCandidate) {
    onEmitterCandidate.on('open', (...args) => {
      console.log('[MQTT][STREAM_OPEN]', args)
    })

    onEmitterCandidate.on('close', (...args) => {
      console.warn('[MQTT][STREAM_CLOSE]', args)
    })

    onEmitterCandidate.on('error', (...args) => {
      console.error('[MQTT][STREAM_ERROR]', args)
    })
  }
}

// 统一打印 MQTT 收发包的关键字段，便于排查连接和订阅问题。
const printMqttPacket = (direction: 'SEND' | 'RECV', packet: Packet) => {
  console.log(`[MQTT][${direction}]`, {
    cmd: packet.cmd,
    topic: 'topic' in packet ? packet.topic : undefined,
    qos: 'qos' in packet ? packet.qos : undefined,
    messageId: 'messageId' in packet ? packet.messageId : undefined,
    returnCode: 'returnCode' in packet ? packet.returnCode : undefined,
    reasonCode: 'reasonCode' in packet ? packet.reasonCode : undefined,
    packet: sanitizeMqttPacket(packet)
  })
}

export const useTradeMessageSyncStore = defineStore('tradeMessageSync', () => {
  const siteConfigStore = useSiteConfigStore()
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)

  const messageStream = ref<TradeMessageStreamItem[]>([])
  const orderStatusMap = ref<OrderStatusMap>({})
  const lastSyncTime = ref<number>()
  const latestOrderId = ref<string>()
  const readMessageKeys = ref<string[]>([])
  const clearedBadgeMessageKeys = ref<string[]>([])
  const deletedMessageKeys = ref<string[]>([])
  const isInitialized = ref(false)
  const isSyncing = ref(false)
  const isConnected = ref(false)
  const connectionError = ref('')

  let mqttClient: MqttClient | null = null
  let connectingMqttClient: MqttClient | null = null
  let activeMemberId = ''
  let activeTraceId = ''
  let activeMqttUserTopic = ''
  let activeMqttTopics: string[] = []
  let syncPromise: Promise<void> | null = null
  let connectPromise: Promise<void> | null = null
  let initializedWatchers = false
  let hasConnectedOnce = false
  let shouldSyncAfterReconnect = false

  const activeUserMemberId = computed(() => String(userInfo.value?.memberId ?? '').trim())
  const activeUserTraceId = computed(() => String(userInfo.value?.traceId ?? '').trim())
  const activeUserMqttTopic = computed(() => {
    const rowId = String(userInfo.value?.rowId ?? '').trim()
    if (!rowId) {
      return ''
    }

    return `${String(import.meta.env.VITE_SITE_CODE ?? '')}_${rowId}`
  })
  const mqttConfig = computed(() => siteConfigStore.getPushMessageMqttConfig())
  const hasActiveSession = computed(
    () =>
      !!activeUserMemberId.value &&
      !!activeUserTraceId.value &&
      !!activeUserMqttTopic.value &&
      !!mqttConfig.value.host &&
      !!mqttConfig.value.username &&
      !!mqttConfig.value.password
  )

  // 将当前会员的同步状态持久化到本地，方便刷新后恢复消息和已读状态。
  const persistState = () => {
    if (typeof window === 'undefined' || !activeMemberId) {
      return
    }

    const payload: TradeMessageSyncPersistedState = {
      memberId: activeMemberId,
      lastSyncTime: lastSyncTime.value,
      latestOrderId: latestOrderId.value,
      messageStream: messageStream.value,
      orderStatusMap: orderStatusMap.value,
      readMessageKeys: readMessageKeys.value,
      clearedBadgeMessageKeys: clearedBadgeMessageKeys.value,
      deletedMessageKeys: deletedMessageKeys.value
    }

    window.localStorage.setItem(TRADE_MESSAGE_SYNC_STORAGE_KEY, JSON.stringify(payload))
  }

  // 清空当前运行时缓存，通常用于切换账号或登出后的状态重置。
  const clearRuntimeState = () => {
    messageStream.value = []
    orderStatusMap.value = {}
    lastSyncTime.value = undefined
    latestOrderId.value = undefined
    readMessageKeys.value = []
    clearedBadgeMessageKeys.value = []
    deletedMessageKeys.value = []
    connectionError.value = ''
  }

  // 按会员 ID 恢复本地缓存的同步状态，不匹配时直接重置运行时状态。
  const restorePersistedState = (memberId: string) => {
    const storedState = parseStoredTradeMessageSyncState()

    if (!storedState || storedState.memberId !== memberId) {
      clearRuntimeState()
      return
    }

    messageStream.value = [...storedState.messageStream].sort(compareTradeMessageStreamItem)
    orderStatusMap.value = { ...storedState.orderStatusMap }
    lastSyncTime.value = storedState.lastSyncTime
    latestOrderId.value = storedState.latestOrderId
    readMessageKeys.value = [...storedState.readMessageKeys]
    clearedBadgeMessageKeys.value = [...storedState.clearedBadgeMessageKeys]
    deletedMessageKeys.value = [...storedState.deletedMessageKeys]
  }

  // 仅订阅当前用户主题：`${VITE_SITE_CODE}_${rowId}`。
  const resolveMqttTopics = () => {
    return activeMqttUserTopic ? [activeMqttUserTopic] : []
  }

  // 关闭当前所有 MQTT 客户端实例，并重置连接相关的运行时标记。
  const closeMqttClient = () => {
    connectPromise = null
    isConnected.value = false
    activeMqttTopics = []
    shouldSyncAfterReconnect = false
    hasConnectedOnce = false

    const clientsToClose = Array.from(
      new Set([mqttClient, connectingMqttClient].filter(Boolean) as MqttClient[])
    )

    mqttClient = null
    connectingMqttClient = null

    clientsToClose.forEach(client => {
      client.removeAllListeners()
      client.end(true)
    })
  }

  // 将新消息按去重键合并进消息流，并限制本地缓存的最大数量。
  const upsertTradeMessageStream = (items: TradeMessageStreamItem[]) => {
    if (items.length === 0) {
      return
    }

    const existingItems = [...messageStream.value]
    const existingKeys = new Set(existingItems.map(item => item.key))

    items.forEach(item => {
      if (existingKeys.has(item.key)) {
        return
      }

      existingKeys.add(item.key)
      existingItems.push(item)
    })

    existingItems.sort(compareTradeMessageStreamItem)
    messageStream.value = existingItems.slice(0, MAX_MESSAGE_STREAM_SIZE)
  }

  // 根据消息内容增量更新订单状态缓存，只保留每笔订单的最新状态。
  const upsertOrderStatusMap = (items: TradeMessageStreamItem[]) => {
    if (items.length === 0) {
      return
    }

    const nextMap: OrderStatusMap = { ...orderStatusMap.value }

    items.forEach(item => {
      const nextCacheItem = {
        orderId: item.orderId,
        orderType: item.orderType,
        status: item.status,
        messageTime: item.messageTime,
        busiAmount: item.busiAmount,
        currency: item.currency
      }

      if (shouldReplaceOrderStatusCacheItem(nextMap[item.orderId], nextCacheItem)) {
        nextMap[item.orderId] = nextCacheItem
      }
    })

    orderStatusMap.value = nextMap
  }

  // 把标准化后的交易消息同时写入消息流、订单状态和本地持久化状态。
  const applyTradeMessages = (items: TradeMessageStreamItem[]) => {
    if (items.length === 0) {
      return
    }

    upsertTradeMessageStream(items)
    upsertOrderStatusMap(items)

    const newestMessage = [...items].sort(compareTradeMessageStreamItem)[0]

    if (newestMessage) {
      latestOrderId.value = newestMessage.orderId

      if (
        Number.isFinite(newestMessage.messageTime) &&
        newestMessage.messageTime > Number(lastSyncTime.value ?? 0)
      ) {
        lastSyncTime.value = newestMessage.messageTime
      }
    }

    persistState()
  }

  // 处理任意来源的交易推送负载，过滤不支持的类型后统一入库。
  const handleTradePushPayload = (payload: unknown) => {
    const messages = normalizeTradePushMessagePayload(payload)
      .filter(message => isTradeMessageTypeSupported(message.msgType))
      .map(message => normalizeTradePushMessage(message))

    applyTradeMessages(messages)
  }

  // 当本地没有同步锚点时，主动查询最近一条订单作为首次同步基准。
  const resolveInitialLatestOrderId = async () => {
    if (latestOrderId.value) {
      return latestOrderId.value
    }

    const [depositResponse, withdrawResponse] = await Promise.all([
      Api.wallet.queryMemberPayOrderPage(toOrderPageQueryParams(0)),
      Api.wallet.queryMemberPayOrderPage(toOrderPageQueryParams(1))
    ])

    const candidates: QueryMemberPayOrderPageRecord[] = [
      ...(depositResponse.result?.records ?? []),
      ...(withdrawResponse.result?.records ?? [])
    ]

    const latestRecord = [...candidates].sort((left, right) => {
      const timeDelta = Number(right.createTime ?? 0) - Number(left.createTime ?? 0)

      if (timeDelta !== 0) {
        return timeDelta
      }

      return String(left.orderId).localeCompare(String(right.orderId))
    })[0]

    latestOrderId.value = latestRecord ? String(latestRecord.orderId) : undefined
    persistState()

    return latestOrderId.value
  }

  // 根据当前缓存状态构建同步请求，优先使用时间戳，其次回退到最新订单号。
  const buildSyncRequest = async (): Promise<QueryMemberPayOrderSyncReq | null> => {
    if (lastSyncTime.value) {
      return {
        lastSyncTime: lastSyncTime.value
      }
    }

    const fallbackLatestOrderId = latestOrderId.value ?? (await resolveInitialLatestOrderId())

    if (!fallbackLatestOrderId) {
      return null
    }

    return {
      latestOrderId: fallbackLatestOrderId
    }
  }

  // 合并增量同步接口返回的数据，并更新下一次同步所需的时间戳。
  const mergeSyncResponse = (result: QueryMemberPayOrderSyncResp | undefined) => {
    if (!result) {
      return
    }

    const records = Array.isArray(result.records)
      ? result.records.map(item => normalizeMemberPayOrderSyncRecord(item))
      : []

    applyTradeMessages(records)

    if (Number.isFinite(Number(result.nextSyncTime)) && Number(result.nextSyncTime) > 0) {
      lastSyncTime.value = Number(result.nextSyncTime)
    }

    persistState()
  }

  // 拉取交易消息增量数据，串行处理多批次分页结果并避免重复并发同步。
  const syncTradeMessages = async (_reason: string, force = false) => {
    if (!activeMemberId || !activeTraceId) {
      return
    }

    if (syncPromise && !force) {
      return syncPromise
    }

    syncPromise = (async () => {
      isSyncing.value = true

      try {
        let requestPayload = await buildSyncRequest()

        if (!requestPayload) {
          return
        }

        for (let index = 0; index < MAX_SYNC_BATCHES; index += 1) {
          const response = await Api.wallet.queryMemberPayOrderSync(requestPayload)

          if (!response.success) {
            throw new Error(response.message || 'queryMemberPayOrderSync failed')
          }

          mergeSyncResponse(response.result)

          if (!response.result?.hasMore) {
            break
          }

          requestPayload = {
            lastSyncTime: response.result.nextSyncTime
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        isSyncing.value = false
        syncPromise = null
      }
    })()

    return syncPromise
  }

  // 建立 MQTT 连接并注册事件监听，在重连后触发一次强制补同步。
  const connectMqttClient = async () => {
    if (!activeMemberId || !activeTraceId) {
      return
    }

    if (mqttClient?.connected) {
      return
    }

    // mqtt.js handles reconnect internally. If a client instance already exists,
    // do not create a second one for the same session.
    if (mqttClient || connectingMqttClient) {
      return connectPromise
    }

    if (connectPromise) {
      return connectPromise
    }

    const { host, username, password } = mqttConfig.value

    if (!host || !username || !password) {
      return
    }

    const { brokerUrl, port: brokerPort } = resolveMqttBrokerEndpoint(host)
    const resolvedPort = brokerPort ?? MQTT_PORT
    const shouldPrintMqttDebugLog = isMqttDebugEnabled()
    let currentClient: MqttClient | null = null
    const resolvedTopics = resolveMqttTopics()

    if (shouldPrintMqttDebugLog) {
      console.log('[MQTT][CONNECT_ATTEMPT]', {
        host,
        brokerUrl,
        clientId: activeTraceId,
        username,
        hasPassword: Boolean(password),
        port: resolvedPort,
        keepalive: MQTT_KEEP_ALIVE_SECONDS,
        reconnectPeriod: MQTT_RECONNECT_PERIOD_MS,
        resubscribe: true,
        activeMemberId,
        activeTraceId,
        activeMqttUserTopic,
        topics: resolvedTopics
      })
    }

    connectPromise = new Promise<void>((resolve, reject) => {
      const client = mqtt.connect(brokerUrl, {
        clientId: activeTraceId,
        username,
        password,
        port: resolvedPort,
        keepalive: MQTT_KEEP_ALIVE_SECONDS,
        connectTimeout: MQTT_CONNECT_TIMEOUT_MS,
        reconnectPeriod: MQTT_RECONNECT_PERIOD_MS,
        resubscribe: true
      })

      let hasConnack = false

      client.on('connect', connack => {
        hasConnack = true
        console.log('[MQTT] connect success')
        if (shouldPrintMqttDebugLog) {
          console.log('[MQTT][CONNACK]', connack)
        }
      })

      client.on('reconnect', () => {
        console.log('[MQTT] reconnecting...')
      })

      client.on('close', () => {
        console.log('[MQTT] connection closed')
        if (shouldPrintMqttDebugLog && !hasConnack) {
          console.warn('[MQTT][CLOSE_BEFORE_CONNACK]')
        }
      })

      client.on('offline', () => {
        if (shouldPrintMqttDebugLog) {
          console.warn('[MQTT][OFFLINE]')
        }
      })

      client.on('disconnect', packet => {
        if (shouldPrintMqttDebugLog) {
          console.warn('[MQTT][DISCONNECT]', packet)
        }
      })

      client.on('end', () => {
        if (shouldPrintMqttDebugLog) {
          console.warn('[MQTT][END]')
        }
      })

      client.on('error', error => {
        console.error('[MQTT] error =>', error)
        if (shouldPrintMqttDebugLog) {
          console.error('[MQTT][ERROR_DETAIL]', toMqttErrorPayload(error))
        }
      })

      currentClient = client
      connectingMqttClient = client
      let settled = false

      if (shouldPrintMqttDebugLog) {
        attachUnderlyingWebSocketDebug(client)

        client.on('packetsend', packet => {
          printMqttPacket('SEND', packet)
        })

        client.on('packetreceive', packet => {
          printMqttPacket('RECV', packet)
        })
      }

      client.on('connect', () => {
        connectingMqttClient = null
        mqttClient = client
        isConnected.value = true
        connectionError.value = ''

        const topics = resolveMqttTopics()
        activeMqttTopics = topics

        if (shouldPrintMqttDebugLog) {
          console.log('[MQTT][SUBSCRIBE_TOPICS]', topics)
        }

        if (topics.length > 0) {
          client.subscribe(topics, (error, granted) => {
            if (error) {
              console.error('[MQTT][SUBSCRIBE_ERROR]', error)
              if (shouldPrintMqttDebugLog) {
                console.error('[MQTT][SUBSCRIBE_ERROR_DETAIL]', toMqttErrorPayload(error))
              }
              return
            }

            console.log('[MQTT][SUBSCRIBE_GRANTED]', granted)
          })
        }

        if (shouldSyncAfterReconnect) {
          shouldSyncAfterReconnect = false
          void syncTradeMessages('mqtt-reconnect', true)
        }

        hasConnectedOnce = true

        if (!settled) {
          settled = true
          resolve()
        }
      })

      client.on('reconnect', () => {
        isConnected.value = false

        if (hasConnectedOnce) {
          shouldSyncAfterReconnect = true
        }
      })

      client.on('close', () => {
        isConnected.value = false

        if (hasConnectedOnce) {
          shouldSyncAfterReconnect = true
        }
      })

      client.on('error', error => {
        console.error(error)
        connectionError.value = error.message
        if (shouldPrintMqttDebugLog) {
          console.error('[MQTT][CONNECT_FLOW_ERROR_DETAIL]', toMqttErrorPayload(error))
        }

        if (!settled) {
          settled = true
          reject(error)
        }
      })

      client.on('message', (topic, payload, packet) => {
        try {
          const decodedPayload = payload.toString()

          console.log('[MQTT][MESSAGE]', {
            topic,
            qos: packet.qos,
            retain: packet.retain,
            dup: packet.dup,
            raw: decodedPayload,
            packet
          })

          const parsedPayload = JSON.parse(decodedPayload)
          handleTradePushPayload(parsedPayload)
          console.log(parsedPayload)
        } catch (error) {
          if (shouldPrintMqttDebugLog) {
            console.warn('[MQTT][MESSAGE][NON_JSON_OR_ERROR]', { topic, packet })
          }
          console.error(error)
        }
      })
    })
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        if (currentClient && connectingMqttClient === currentClient) {
          connectingMqttClient = null
        }
        connectPromise = null
      })

    return connectPromise
  }

  // 启动当前会话的消息同步流程，先连 MQTT 再主动拉取一次全量增量数据。
  const startActiveSession = async (reason: string) => {
    if (!activeMemberId || !activeTraceId) {
      return
    }

    await connectMqttClient()
    await syncTradeMessages(reason, true)
  }

  // 响应用户会话变化，处理账号切换、重连以及本地状态恢复逻辑。
  const handleSessionChange = async () => {
    const nextMemberId = activeUserMemberId.value
    const nextTraceId = activeUserTraceId.value
    const nextMqttUserTopic = activeUserMqttTopic.value

    if (!nextMemberId || !nextTraceId || !nextMqttUserTopic) {
      if (isMqttDebugEnabled()) {
        console.warn('[MQTT][SESSION_BLOCKED]', {
          nextMemberId,
          nextTraceId,
          nextMqttUserTopic,
          hasHost: Boolean(mqttConfig.value.host),
          hasUsername: Boolean(mqttConfig.value.username),
          hasPassword: Boolean(mqttConfig.value.password)
        })
      }
      activeMemberId = ''
      activeTraceId = ''
      activeMqttUserTopic = ''
      closeMqttClient()
      clearRuntimeState()
      return
    }

    if (activeMemberId !== nextMemberId) {
      restorePersistedState(nextMemberId)
    }

    const shouldReconnect =
      activeMemberId !== nextMemberId ||
      activeTraceId !== nextTraceId ||
      activeMqttUserTopic !== nextMqttUserTopic ||
      activeMqttTopics.length === 0 ||
      !mqttClient

    if (isMqttDebugEnabled()) {
      console.log('[MQTT][SESSION_CHANGE]', {
        current: {
          activeMemberId,
          activeTraceId,
          activeMqttUserTopic,
          activeMqttTopics
        },
        next: {
          nextMemberId,
          nextTraceId,
          nextMqttUserTopic
        },
        shouldReconnect,
        hasClient: Boolean(mqttClient)
      })
    }

    activeMemberId = nextMemberId
    activeTraceId = nextTraceId
    activeMqttUserTopic = nextMqttUserTopic

    if (!hasActiveSession.value) {
      closeMqttClient()
      return
    }

    if (shouldReconnect) {
      closeMqttClient()
    }

    await startActiveSession(shouldReconnect ? 'session-change' : 'session-refresh')
  }

  // 页面回到前台时主动触发一次同步，减少后台期间遗漏的消息。
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void syncTradeMessages('foreground', true)
    }
  }

  // 初始化 store 所需的配置、用户信息和监听器，确保只执行一次。
  const init = () => {
    if (isInitialized.value) {
      return
    }

    isInitialized.value = true
    siteConfigStore.syncStoredConfig()
    userStore.syncStoredUserData()
    void siteConfigStore.initSiteConfig()

    if (!initializedWatchers) {
      initializedWatchers = true

      watch(
        () => [
          activeUserMemberId.value,
          activeUserTraceId.value,
          activeUserMqttTopic.value,
          mqttConfig.value.host,
          mqttConfig.value.username,
          mqttConfig.value.password
        ],
        () => {
          void handleSessionChange()
        },
        { immediate: true }
      )

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }

  // 对外暴露的手动强制同步入口。
  const forceSyncTradeMessages = async () => {
    await syncTradeMessages('manual', true)
  }

  // 标记单条交易消息为已读，并同步更新本地持久化状态。
  const markTradeMessageAsRead = (messageKey: string) => {
    if (!messageKey || readMessageKeys.value.includes(messageKey)) {
      return
    }

    readMessageKeys.value = [...readMessageKeys.value, messageKey]
    persistState()
  }

  // 批量标记交易消息为已读，内部自动去重并跳过空值。
  const markTradeMessagesAsRead = (messageKeys: string[]) => {
    if (messageKeys.length === 0) {
      return
    }

    const nextKeys = Array.from(new Set([...readMessageKeys.value, ...messageKeys.filter(Boolean)]))

    if (nextKeys.length === readMessageKeys.value.length) {
      return
    }

    readMessageKeys.value = nextKeys
    persistState()
  }

  // 清除单条交易消息的小红点状态，并持久化记录。
  const clearTradeMessageBadge = (messageKey: string) => {
    if (!messageKey || clearedBadgeMessageKeys.value.includes(messageKey)) {
      return
    }

    clearedBadgeMessageKeys.value = [...clearedBadgeMessageKeys.value, messageKey]
    persistState()
  }

  // 批量清除交易消息的小红点状态，避免重复写入相同 key。
  const clearTradeMessageBadges = (messageKeys: string[]) => {
    if (messageKeys.length === 0) {
      return
    }

    const nextKeys = Array.from(
      new Set([...clearedBadgeMessageKeys.value, ...messageKeys.filter(Boolean)])
    )

    if (nextKeys.length === clearedBadgeMessageKeys.value.length) {
      return
    }

    clearedBadgeMessageKeys.value = nextKeys
    persistState()
  }

  // 标记单条交易消息为已删除，用于前端列表展示过滤。
  const markTradeMessageAsDeleted = (messageKey: string) => {
    if (!messageKey || deletedMessageKeys.value.includes(messageKey)) {
      return
    }

    deletedMessageKeys.value = [...deletedMessageKeys.value, messageKey]
    persistState()
  }

  // 对外暴露原始推送消息入口，统一复用内部的负载处理逻辑。
  const handleIncomingTradePushMessage = (payload: unknown) => {
    handleTradePushPayload(payload)
  }

  // 对外接收单条交易推送消息，标准化后补齐去重键再写入状态。
  const ingestTradePushMessage = (message: TradePushMessage) => {
    if (!isTradeMessageTypeSupported(message.msgType)) {
      return
    }

    const normalizedMessage = normalizeTradePushMessage(message)
    normalizedMessage.key = getTradeMessageDedupKey(
      normalizedMessage.messageTime,
      normalizedMessage.orderId,
      normalizePayOrderStatus(normalizedMessage.status)
    )
    applyTradeMessages([normalizedMessage])
  }

  return {
    messageStream,
    orderStatusMap,
    lastSyncTime,
    latestOrderId,
    readMessageKeys,
    clearedBadgeMessageKeys,
    deletedMessageKeys,
    isInitialized,
    isSyncing,
    isConnected,
    connectionError,
    init,
    forceSyncTradeMessages,
    markTradeMessageAsRead,
    markTradeMessagesAsRead,
    clearTradeMessageBadge,
    clearTradeMessageBadges,
    markTradeMessageAsDeleted,
    handleIncomingTradePushMessage,
    ingestTradePushMessage
  }
})
