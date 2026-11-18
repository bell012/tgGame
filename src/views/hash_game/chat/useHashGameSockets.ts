import { useWebSocket } from '@/composables/useWebSocket'
import { ref, shallowRef, watch, type Ref } from 'vue'
import type { HashWsDefaultEvent, HashWsErrorEvent, HashWsEvent, HashWsServerEvent } from './types'

/** Hash 游戏匿名连接使用的站点标识；正式环境可由 VITE_SITE_CODE 覆盖。 */
const DEFAULT_SITE_CODE = 'gifphcb9'

/** 将 HTTP 协议转换为浏览器可用的 WS 协议。 */
function resolveWebSocketProtocol(protocol: string) {
  return protocol === 'https:' || protocol === 'wss:' ? 'wss:' : 'ws:'
}

/** 将接口路径规范化为带前缀斜杠且没有尾部斜杠的路径。 */
function normalizePath(value: string) {
  const path = value.trim().replace(/^\/+|\/+$/g, '')
  return path ? `/${path}` : ''
}

/** 使用当前页面域名和统一 API 路径解析交易 WS 基地址。 */
function resolveHashGameSocketBaseUrl() {
  const apiPath = normalizePath(import.meta.env.VITE_API_BASE_URL || '/v1') || '/v1'
  const browserOrigin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
  const socketUrl = new URL(browserOrigin)

  socketUrl.protocol = resolveWebSocketProtocol(socketUrl.protocol)
  socketUrl.pathname = `${apiPath}/ws`
  socketUrl.search = ''
  socketUrl.hash = ''
  return socketUrl
}

/** 将 WebSocket 原始消息安全地转换为对象协议数据。 */
function parseSocketMessage(event: MessageEvent): HashWsServerEvent {
  const source = typeof event.data === 'string' ? event.data : String(event.data)
  return JSON.parse(source) as HashWsServerEvent
}

/** 判断服务端原始消息是否为心跳响应。 */
function isPongMessage(rawMessage: unknown) {
  try {
    const message = JSON.parse(String(rawMessage)) as { type?: unknown }
    return message.type === 'PONG'
  } catch {
    return false
  }
}

/** 判断事件是否属于 hashchat 公共房间通道。 */
function isChatEvent(event: HashWsServerEvent): event is HashWsEvent {
  return (
    event.type === 'CHAT_MESSAGE' ||
    event.type === 'CHAIN_LOTTERY_ONLINE' ||
    event.type === 'CHAIN_LOTTERY_BET_STATS'
  )
}

/** 判断事件是否属于默认业务通道。 */
function isDefaultEvent(event: HashWsServerEvent): event is HashWsDefaultEvent {
  return (
    event.type === 'BLOCK_RESULT' ||
    event.type === 'CHAIN_LOTTERY_SETTLE' ||
    event.type === 'CHAIN_LOTTERY_STREAK' ||
    event.type === 'CHAT_PRIVATE'
  )
}

/** 判断事件是否为服务端明确返回的协议错误。 */
function isErrorEvent(event: HashWsServerEvent): event is HashWsErrorEvent {
  return event.type === 'ERROR'
}

type UseHashGameSocketsOptions = {
  /** 当前房间接收到的公共聊天室事件。 */
  onChatEvent: (event: HashWsEvent) => void
  /** 默认业务通道事件；由游戏页面决定如何刷新倒计时、开奖结果或结算。 */
  onDefaultEvent?: (event: HashWsDefaultEvent) => void
  /** 聊天通道重连后重置本次实时消息。 */
  onChatReconnect?: () => void
}

/** 管理 Hash 游戏默认业务通道与 hashchat 通道的两条独立 WS 连接。 */
export function useHashGameSockets(
  gameCode: Ref<string>,
  accessToken: Readonly<Ref<string>>,
  options: UseHashGameSocketsOptions
) {
  const protocolError = ref('')
  const hasOpenedChatSocket = ref(false)
  const latestDefaultEvent = shallowRef<HashWsDefaultEvent | null>(null)

  /** 构建默认业务或 hashchat 通道的鉴权连接地址。 */
  function buildSocketUrl(channel?: 'hashchat') {
    const socketUrl = resolveHashGameSocketBaseUrl()
    const token = accessToken.value.trim()
    const site = String(import.meta.env.VITE_SITE_CODE ?? DEFAULT_SITE_CODE).trim()

    if (channel) socketUrl.searchParams.set('channel', channel)
    if (token) {
      socketUrl.searchParams.set('token', token)
    } else {
      socketUrl.searchParams.set('site', site || DEFAULT_SITE_CODE)
    }
    return socketUrl.toString()
  }

  /** 发送当前游戏对应的公共聊天室订阅指令。 */
  function subscribeCurrentRoom() {
    const code = gameCode.value.trim()
    if (!code) return false
    return chatSocket.sendJson({ type: 'SUBSCRIBE_ROOM', room: `CHAT:${code}` })
  }

  /** 接收默认业务通道的协议消息并交给页面业务层。 */
  function handleDefaultMessage(event: HashWsServerEvent) {
    if (isErrorEvent(event)) {
      protocolError.value = event.message || 'WebSocket protocol error'
      return
    }
    if (isDefaultEvent(event)) {
      latestDefaultEvent.value = event
      options.onDefaultEvent?.(event)
    }
  }

  /** 接收 hashchat 通道的协议消息并交给聊天室状态层。 */
  function handleChatMessage(event: HashWsServerEvent) {
    if (isErrorEvent(event)) {
      protocolError.value = event.message || 'WebSocket protocol error'
      return
    }
    if (isChatEvent(event)) options.onChatEvent(event)
  }

  const defaultSocket = useWebSocket<HashWsServerEvent>({
    reconnect: { maxAttempts: Infinity, initialDelayMs: 1_000, maxDelayMs: 10_000 },
    heartbeat: {
      intervalMs: 20_000,
      timeoutMs: 60_000,
      payload: () => JSON.stringify({ type: 'PING' }),
      isResponse: message => isPongMessage(message)
    },
    parseMessage: parseSocketMessage,
    onMessageError: () => {
      protocolError.value = 'WebSocket message parsing failed'
    }
  })
  const chatSocket = useWebSocket<HashWsServerEvent>({
    reconnect: { maxAttempts: Infinity, initialDelayMs: 1_000, maxDelayMs: 10_000 },
    heartbeat: {
      intervalMs: 20_000,
      timeoutMs: 60_000,
      payload: () => JSON.stringify({ type: 'PING' }),
      isResponse: message => isPongMessage(message)
    },
    parseMessage: parseSocketMessage,
    onMessageError: () => {
      protocolError.value = 'WebSocket message parsing failed'
    }
  })

  /** 建立默认业务通道，默认通道不需要订阅房间。 */
  function connectDefaultSocket() {
    defaultSocket.connect({
      url: buildSocketUrl(),
      onMessage: handleDefaultMessage
    })
  }

  /** 建立 hashchat 通道，并在每次打开后订阅当前游戏房间。 */
  function connectChatSocket() {
    chatSocket.connect({
      url: buildSocketUrl('hashchat'),
      onOpen: () => {
        const isReconnect = hasOpenedChatSocket.value
        hasOpenedChatSocket.value = true
        subscribeCurrentRoom()
        if (isReconnect) options.onChatReconnect?.()
      },
      onMessage: handleChatMessage
    })
  }

  /** 在认证信息变化时以最新 token 或 site 身份重新建立两条连接。 */
  function reconnectWithLatestIdentity() {
    protocolError.value = ''
    connectDefaultSocket()
    connectChatSocket()
  }

  /** 主动关闭两条 WS 连接，路由离开时 Vue scope 也会自动执行该释放。 */
  function disconnect() {
    defaultSocket.disconnect()
    chatSocket.disconnect()
  }

  watch(accessToken, reconnectWithLatestIdentity, { immediate: true })
  watch(gameCode, subscribeCurrentRoom)

  return {
    defaultSocketState: defaultSocket.state,
    chatSocketState: chatSocket.state,
    protocolError,
    latestDefaultEvent,
    reconnect: reconnectWithLatestIdentity,
    disconnect
  }
}
