import { onBeforeUnmount, ref } from 'vue'

export type ChatConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed'

const HEARTBEAT_INTERVAL_MS = 20_000
const HEARTBEAT_TIMEOUT_MS = 45_000
const RECONNECT_MAX_ATTEMPTS = 5

interface ChatConnectionOptions {
  url: string
  onMessage: (payload: unknown) => void
}

/** 管理单个客服会话的 WebSocket、心跳、断线重连与消息分发。 */
export function useChatConnection() {
  const state = ref<ChatConnectionState>('idle')
  const errorMessage = ref('')
  let socket: WebSocket | null = null
  let heartbeatTimer: number | null = null
  let reconnectTimer: number | null = null
  let lastHeartbeatResponseAt = 0
  let reconnectAttempts = 0
  let shouldReconnect = false
  let latestOptions: ChatConnectionOptions | null = null

  /** 清除心跳与重连定时器，避免关闭会话后继续发送请求。 */
  const clearTimers = () => {
    if (heartbeatTimer !== null) {
      window.clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }

    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  /** 启动协议约定的 2/3 字符串心跳，超时后主动重建连接。 */
  const startHeartbeat = () => {
    lastHeartbeatResponseAt = Date.now()

    heartbeatTimer = window.setInterval(() => {
      if (Date.now() - lastHeartbeatResponseAt > HEARTBEAT_TIMEOUT_MS) {
        socket?.close()
        return
      }

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send('2')
      }
    }, HEARTBEAT_INTERVAL_MS)
  }

  /** 按有限次数和递增延迟安排断线后的重连。 */
  const scheduleReconnect = () => {
    if (!shouldReconnect || !latestOptions || reconnectAttempts >= RECONNECT_MAX_ATTEMPTS) {
      state.value = 'failed'
      return
    }

    reconnectAttempts += 1
    state.value = 'reconnecting'
    const delay = Math.min(1_000 * 2 ** (reconnectAttempts - 1), 10_000)
    reconnectTimer = window.setTimeout(() => {
      if (latestOptions) {
        openSocket(latestOptions)
      }
    }, delay)
  }

  /** 打开 Socket 并注册服务端消息、心跳响应和关闭回调。 */
  const openSocket = (options: ChatConnectionOptions) => {
    clearTimers()
    state.value = reconnectAttempts > 0 ? 'reconnecting' : 'connecting'
    errorMessage.value = ''

    let nextSocket: WebSocket

    try {
      nextSocket = new WebSocket(options.url)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'WebSocket connection failed'
      scheduleReconnect()
      return
    }

    socket = nextSocket

    nextSocket.onopen = () => {
      if (socket !== nextSocket) return
      reconnectAttempts = 0
      state.value = 'connected'
      startHeartbeat()
    }

    nextSocket.onmessage = event => {
      if (socket !== nextSocket) return
      if (event.data === '3') {
        lastHeartbeatResponseAt = Date.now()
        return
      }

      try {
        options.onMessage(JSON.parse(String(event.data)))
      } catch {
        // 非 JSON 的业务数据不进入消息列表，避免破坏当前会话状态。
      }
    }

    nextSocket.onerror = () => {
      if (socket !== nextSocket) return
      errorMessage.value = 'WebSocket connection failed'
    }

    nextSocket.onclose = () => {
      if (socket !== nextSocket) return
      clearTimers()
      socket = null
      if (shouldReconnect) {
        scheduleReconnect()
      } else {
        state.value = 'idle'
      }
    }
  }

  /** 记录最新连接参数并建立当前客服会话的 WebSocket 连接。 */
  const connect = (options: ChatConnectionOptions) => {
    shouldReconnect = true
    latestOptions = options
    reconnectAttempts = 0
    socket?.close()
    openSocket(options)
  }

  /** 发送 Socket 业务 JSON；连接未就绪时返回失败供调用方标记消息状态。 */
  const send = (payload: unknown) => {
    if (socket?.readyState !== WebSocket.OPEN) {
      return false
    }

    socket.send(JSON.stringify(payload))
    return true
  }

  /** 主动关闭当前客服会话连接，并禁止其继续自动重连。 */
  const disconnect = () => {
    shouldReconnect = false
    latestOptions = null
    reconnectAttempts = 0
    clearTimers()
    socket?.close()
    socket = null
    state.value = 'idle'
  }

  onBeforeUnmount(disconnect)

  return {
    state,
    errorMessage,
    connect,
    send,
    disconnect
  }
}
