/** 原生 WebSocket 连接的通用状态。 */
export type WebSocketConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'

/** 浏览器原生 WebSocket 支持发送的原始数据类型。 */
export type WebSocketSendData = Parameters<WebSocket['send']>[0]

export interface WebSocketReconnectOptions {
  /** 最大重连次数；未设置时为 5 次。 */
  maxAttempts?: number
  /** 首次重连等待时间；未设置时为 1 秒。 */
  initialDelayMs?: number
  /** 重连等待时间上限；未设置时为 10 秒。 */
  maxDelayMs?: number
  /** 自定义某次重连的等待时间，attempt 从 1 开始。 */
  getDelayMs?: (attempt: number) => number
}

export interface WebSocketHeartbeatOptions {
  /** 心跳发送间隔。 */
  intervalMs: number
  /** 超过该时间未收到心跳响应时主动关闭连接并触发重连。 */
  timeoutMs?: number
  /** 心跳原始报文，或每次发送时动态生成报文的函数。 */
  payload: WebSocketSendData | (() => WebSocketSendData)
  /** 判断一条服务端报文是否为心跳响应；响应不会继续分发给业务 onMessage。 */
  isResponse?: (data: unknown, event: MessageEvent) => boolean
}

export interface WebSocketConnectOptions<TMessage = unknown> {
  url: string
  protocols?: string | string[]
  binaryType?: BinaryType
  onMessage?: (message: TMessage, event: MessageEvent) => void
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
}

export interface CreateWebSocketConnectionOptions<TMessage = unknown> {
  /** false 或未设置时，连接异常关闭后不自动重连。 */
  reconnect?: false | WebSocketReconnectOptions
  heartbeat?: WebSocketHeartbeatOptions
  /** 将原始 MessageEvent 转换为业务消息；默认直接传递 event.data。 */
  parseMessage?: (event: MessageEvent) => TMessage
  /** 消息转换失败时触发，默认忽略该条消息。 */
  onMessageError?: (error: unknown, event: MessageEvent) => void
  /** 供非 Vue 使用方订阅状态变化。 */
  onStateChange?: (state: WebSocketConnectionState) => void
  /** 供非 Vue 使用方订阅连接错误文案变化。 */
  onErrorMessageChange?: (message: string) => void
}

export interface WebSocketConnection<TMessage = unknown> {
  readonly state: WebSocketConnectionState
  readonly errorMessage: string
  readonly socket: WebSocket | null
  connect: (options: WebSocketConnectOptions<TMessage>) => void
  send: (data: WebSocketSendData) => boolean
  sendJson: (payload: unknown) => boolean
  disconnect: () => void
}

const DEFAULT_RECONNECT_MAX_ATTEMPTS = 5
const DEFAULT_RECONNECT_INITIAL_DELAY_MS = 1_000
const DEFAULT_RECONNECT_MAX_DELAY_MS = 10_000
const DEFAULT_CONNECTION_ERROR_MESSAGE = 'WebSocket connection failed'

const getErrorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : DEFAULT_CONNECTION_ERROR_MESSAGE

const getReconnectMaxAttempts = (options: WebSocketReconnectOptions) => {
  const value = options.maxAttempts ?? DEFAULT_RECONNECT_MAX_ATTEMPTS
  if (value === Infinity) return Infinity
  if (!Number.isFinite(value)) return DEFAULT_RECONNECT_MAX_ATTEMPTS
  return Math.max(0, Math.floor(value))
}

const getReconnectDelay = (options: WebSocketReconnectOptions, attempt: number) => {
  const fallbackDelay = Math.min(
    (options.initialDelayMs ?? DEFAULT_RECONNECT_INITIAL_DELAY_MS) * 2 ** (attempt - 1),
    options.maxDelayMs ?? DEFAULT_RECONNECT_MAX_DELAY_MS
  )
  const requestedDelay = options.getDelayMs?.(attempt) ?? fallbackDelay

  return Number.isFinite(requestedDelay) ? Math.max(0, requestedDelay) : fallbackDelay
}

/**
 * 创建一个独立的原生 WebSocket 控制器。
 *
 * 该控制器不假定业务协议：JSON、心跳格式、重连策略都由调用方配置；每次创建的
 * 控制器只维护一条连接，因此不同模块可以各自使用不同的服务端协议。
 */
export function createWebSocketConnection<TMessage = unknown>(
  config: CreateWebSocketConnectionOptions<TMessage> = {}
): WebSocketConnection<TMessage> {
  let state: WebSocketConnectionState = 'idle'
  let errorMessage = ''
  let socket: WebSocket | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let lastHeartbeatResponseAt = 0
  let reconnectAttempts = 0
  let shouldReconnect = false
  let latestConnectOptions: WebSocketConnectOptions<TMessage> | null = null
  let connectionGeneration = 0

  const updateState = (nextState: WebSocketConnectionState) => {
    state = nextState
    config.onStateChange?.(nextState)
  }

  const updateErrorMessage = (nextMessage: string) => {
    errorMessage = nextMessage
    config.onErrorMessageChange?.(nextMessage)
  }

  const clearTimers = () => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }

    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const closeCurrentSocket = () => {
    const currentSocket = socket
    socket = null
    currentSocket?.close()
  }

  const send = (data: WebSocketSendData) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false

    try {
      socket.send(data)
      return true
    } catch (error) {
      updateErrorMessage(getErrorMessage(error))
      return false
    }
  }

  const sendJson = (payload: unknown) => {
    try {
      const serializedPayload = JSON.stringify(payload)
      if (typeof serializedPayload !== 'string') return false
      return send(serializedPayload)
    } catch (error) {
      updateErrorMessage(getErrorMessage(error))
      return false
    }
  }

  const startHeartbeat = (activeSocket: WebSocket, generation: number) => {
    const heartbeat = config.heartbeat
    if (!heartbeat || !Number.isFinite(heartbeat.intervalMs) || heartbeat.intervalMs <= 0) return
    if (connectionGeneration !== generation || socket !== activeSocket) return

    lastHeartbeatResponseAt = Date.now()
    heartbeatTimer = setInterval(() => {
      if (connectionGeneration !== generation || socket !== activeSocket) return

      if (
        heartbeat.timeoutMs &&
        heartbeat.timeoutMs > 0 &&
        Date.now() - lastHeartbeatResponseAt > heartbeat.timeoutMs
      ) {
        activeSocket.close()
        return
      }

      try {
        const payload =
          typeof heartbeat.payload === 'function' ? heartbeat.payload() : heartbeat.payload
        send(payload)
      } catch (error) {
        updateErrorMessage(getErrorMessage(error))
      }
    }, heartbeat.intervalMs)
  }

  const scheduleReconnect = (generation = connectionGeneration) => {
    const reconnectOptions = config.reconnect
    if (generation !== connectionGeneration || !shouldReconnect || !latestConnectOptions) return

    if (!reconnectOptions || reconnectAttempts >= getReconnectMaxAttempts(reconnectOptions)) {
      updateState('failed')
      return
    }

    reconnectAttempts += 1
    updateState('reconnecting')
    if (generation !== connectionGeneration || !shouldReconnect || !latestConnectOptions) return

    const delay = getReconnectDelay(reconnectOptions, reconnectAttempts)
    if (generation !== connectionGeneration || !shouldReconnect || !latestConnectOptions) return

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      if (generation === connectionGeneration && shouldReconnect && latestConnectOptions) {
        openSocket(latestConnectOptions, generation)
      }
    }, delay)
  }

  const openSocket = (
    connectOptions: WebSocketConnectOptions<TMessage>,
    generation = connectionGeneration
  ) => {
    if (generation !== connectionGeneration) return

    clearTimers()
    updateState(reconnectAttempts > 0 ? 'reconnecting' : 'connecting')
    if (generation !== connectionGeneration) return

    updateErrorMessage('')
    if (generation !== connectionGeneration) return

    if (typeof WebSocket === 'undefined') {
      updateErrorMessage('WebSocket is not supported in this environment')
      updateState('failed')
      return
    }

    let nextSocket: WebSocket

    try {
      nextSocket =
        connectOptions.protocols === undefined
          ? new WebSocket(connectOptions.url)
          : new WebSocket(connectOptions.url, connectOptions.protocols)
      if (connectOptions.binaryType) {
        nextSocket.binaryType = connectOptions.binaryType
      }
    } catch (error) {
      updateErrorMessage(getErrorMessage(error))
      if (generation !== connectionGeneration) return
      scheduleReconnect(generation)
      return
    }

    socket = nextSocket

    nextSocket.onopen = event => {
      if (generation !== connectionGeneration || socket !== nextSocket) return
      reconnectAttempts = 0
      updateState('connected')
      if (generation !== connectionGeneration || socket !== nextSocket) return

      startHeartbeat(nextSocket, generation)
      connectOptions.onOpen?.(event)
    }

    nextSocket.onmessage = event => {
      if (generation !== connectionGeneration || socket !== nextSocket) return

      try {
        const isHeartbeatResponse = config.heartbeat?.isResponse?.(event.data, event)
        if (generation !== connectionGeneration || socket !== nextSocket) return

        if (isHeartbeatResponse) {
          lastHeartbeatResponseAt = Date.now()
          return
        }
      } catch (error) {
        config.onMessageError?.(error, event)
        return
      }

      try {
        const message = config.parseMessage ? config.parseMessage(event) : (event.data as TMessage)
        if (generation !== connectionGeneration || socket !== nextSocket) return

        connectOptions.onMessage?.(message, event)
      } catch (error) {
        config.onMessageError?.(error, event)
      }
    }

    nextSocket.onerror = event => {
      if (generation !== connectionGeneration || socket !== nextSocket) return
      updateErrorMessage(DEFAULT_CONNECTION_ERROR_MESSAGE)
      if (generation !== connectionGeneration || socket !== nextSocket) return

      connectOptions.onError?.(event)
    }

    nextSocket.onclose = event => {
      if (generation !== connectionGeneration || socket !== nextSocket) return
      clearTimers()
      socket = null

      try {
        connectOptions.onClose?.(event)
      } finally {
        // onClose 内可能已主动建立新连接，此时不应为旧连接再安排一次重连。
        if (generation === connectionGeneration && !socket) scheduleReconnect(generation)
      }
    }
  }

  const connect = (connectOptions: WebSocketConnectOptions<TMessage>) => {
    connectionGeneration += 1
    shouldReconnect = true
    latestConnectOptions = connectOptions
    reconnectAttempts = 0
    clearTimers()
    closeCurrentSocket()
    openSocket(connectOptions, connectionGeneration)
  }

  const disconnect = () => {
    connectionGeneration += 1
    shouldReconnect = false
    latestConnectOptions = null
    reconnectAttempts = 0
    clearTimers()
    closeCurrentSocket()
    updateState('idle')
  }

  return {
    get state() {
      return state
    },
    get errorMessage() {
      return errorMessage
    },
    get socket() {
      return socket
    },
    connect,
    send,
    sendJson,
    disconnect
  }
}
