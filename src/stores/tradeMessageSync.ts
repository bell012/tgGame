import Api from '@/api'
import type {
  QueryMemberPayOrderPageRecord,
  QueryMemberPayOrderSyncReq,
  QueryMemberPayOrderSyncResp,
  TradePushMessage
} from '@/api/interface/wallet'
import mqtt, { type MqttClient } from 'mqtt'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
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

const TRADE_MESSAGE_SYNC_STORAGE_KEY = 'memberTradeMessageSync'
const MQTT_RECONNECT_PERIOD_MS = 3000
const MQTT_KEEP_ALIVE_SECONDS = 55
const MQTT_PORT = 443
const MAX_SYNC_BATCHES = 20
const MAX_MESSAGE_STREAM_SIZE = 200
const MQTT_TOPIC_CONFIG_KEYS = [
  'push.msg.topic',
  'push.msg.trade.topic',
  'member.pay.order.topic'
] as const

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

export const useTradeMessageSyncStore = defineStore('tradeMessageSync', () => {
  const siteConfigStore = useSiteConfigStore()
  const userStore = useUserStore()

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
  let activeMemberId = ''
  let activeTraceId = ''
  let activeMqttTopics: string[] = []
  let syncPromise: Promise<void> | null = null
  let connectPromise: Promise<void> | null = null
  let initializedWatchers = false
  let hasConnectedOnce = false
  let shouldSyncAfterReconnect = false

  const activeUserMemberId = computed(() => String(userStore.userInfo?.memberId ?? '').trim())
  const activeUserTraceId = computed(() => String(userStore.userInfo?.traceId ?? '').trim())
  const mqttConfig = computed(() => siteConfigStore.getPushMessageMqttConfig())
  const hasActiveSession = computed(
    () =>
      !!activeUserMemberId.value &&
      !!activeUserTraceId.value &&
      !!mqttConfig.value.host &&
      !!mqttConfig.value.username &&
      !!mqttConfig.value.password
  )

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

  const resolveTopicTemplate = (template: string) => {
    const trimmedTemplate = template.trim()

    if (!trimmedTemplate) {
      return ''
    }

    return trimmedTemplate
      .split('{traceId}')
      .join(activeTraceId)
      .split('{memberId}')
      .join(activeMemberId)
  }

  const resolveMqttTopics = () => {
    const configuredTopics = MQTT_TOPIC_CONFIG_KEYS.flatMap(key => {
      const value = siteConfigStore.getConfigString(key)
      return value
        .split(',')
        .map(topic => resolveTopicTemplate(topic))
        .filter(Boolean)
    })

    const fallbackTopics = [activeTraceId, activeMemberId].filter(Boolean)
    return Array.from(new Set([...configuredTopics, ...fallbackTopics]))
  }

  const closeMqttClient = () => {
    connectPromise = null
    isConnected.value = false
    activeMqttTopics = []
    shouldSyncAfterReconnect = false
    hasConnectedOnce = false

    if (!mqttClient) {
      return
    }

    const nextClient = mqttClient
    mqttClient = null
    nextClient.removeAllListeners()
    nextClient.end(true)
  }

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

  const handleTradePushPayload = (payload: unknown) => {
    const messages = normalizeTradePushMessagePayload(payload)
      .filter(message => isTradeMessageTypeSupported(message.msgType))
      .map(message => normalizeTradePushMessage(message))

    applyTradeMessages(messages)
  }

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

  const connectMqttClient = async () => {
    if (!activeMemberId || !activeTraceId) {
      return
    }

    if (mqttClient?.connected) {
      return
    }

    if (connectPromise) {
      return connectPromise
    }

    const { host, username, password } = mqttConfig.value

    if (!host || !username || !password) {
      return
    }

    const brokerUrl = `wss://${host}/mqtt`

    connectPromise = new Promise<void>((resolve, reject) => {
      const client = mqtt.connect(brokerUrl, {
        clientId: activeTraceId,
        username,
        password,
        port: MQTT_PORT,
        keepalive: MQTT_KEEP_ALIVE_SECONDS,
        reconnectPeriod: MQTT_RECONNECT_PERIOD_MS,
        resubscribe: true
      })

      let settled = false

      client.on('connect', () => {
        mqttClient = client
        isConnected.value = true
        connectionError.value = ''

        const topics = resolveMqttTopics()
        activeMqttTopics = topics

        if (topics.length > 0) {
          client.subscribe(topics, error => {
            if (error) {
              console.error(error)
            }
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

        if (!settled) {
          settled = true
          reject(error)
        }
      })

      client.on('message', (_topic, payload) => {
        try {
          const decodedPayload = payload.toString()
          const parsedPayload = JSON.parse(decodedPayload)
          handleTradePushPayload(parsedPayload)
        } catch (error) {
          console.error(error)
        }
      })
    })
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        connectPromise = null
      })

    return connectPromise
  }

  const startActiveSession = async (reason: string) => {
    if (!activeMemberId || !activeTraceId) {
      return
    }

    await connectMqttClient()
    await syncTradeMessages(reason, true)
  }

  const handleSessionChange = async () => {
    const nextMemberId = activeUserMemberId.value
    const nextTraceId = activeUserTraceId.value

    if (!nextMemberId || !nextTraceId) {
      activeMemberId = ''
      activeTraceId = ''
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
      activeMqttTopics.length === 0 ||
      !mqttClient

    activeMemberId = nextMemberId
    activeTraceId = nextTraceId

    if (!hasActiveSession.value) {
      closeMqttClient()
      return
    }

    if (shouldReconnect) {
      closeMqttClient()
    }

    await startActiveSession(shouldReconnect ? 'session-change' : 'session-refresh')
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void syncTradeMessages('foreground', true)
    }
  }

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

  const forceSyncTradeMessages = async () => {
    await syncTradeMessages('manual', true)
  }

  const markTradeMessageAsRead = (messageKey: string) => {
    if (!messageKey || readMessageKeys.value.includes(messageKey)) {
      return
    }

    readMessageKeys.value = [...readMessageKeys.value, messageKey]
    persistState()
  }

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

  const clearTradeMessageBadge = (messageKey: string) => {
    if (!messageKey || clearedBadgeMessageKeys.value.includes(messageKey)) {
      return
    }

    clearedBadgeMessageKeys.value = [...clearedBadgeMessageKeys.value, messageKey]
    persistState()
  }

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

  const markTradeMessageAsDeleted = (messageKey: string) => {
    if (!messageKey || deletedMessageKeys.value.includes(messageKey)) {
      return
    }

    deletedMessageKeys.value = [...deletedMessageKeys.value, messageKey]
    persistState()
  }

  const handleIncomingTradePushMessage = (payload: unknown) => {
    handleTradePushPayload(payload)
  }

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
