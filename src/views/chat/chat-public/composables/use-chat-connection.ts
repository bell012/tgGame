import { useWebSocket } from '@/composables/useWebSocket'
import type { WebSocketConnectionState } from '@/utils/websocket'

interface ChatConnectionOptions {
  url: string
  onMessage: (payload: unknown) => void
  onConnected?: () => void
}

export type ChatConnectionState = WebSocketConnectionState
const RECONNECT_MAX_ATTEMPTS = 5

const HEARTBEAT_INTERVAL_MS = 20_000
const HEARTBEAT_TIMEOUT_MS = 45_000

/** 将客服聊天协议适配到通用 WebSocket 连接：JSON 消息与 2/3 心跳仅属于聊天业务。 */
export function useChatConnection() {
  const {
    state,
    errorMessage,
    connect: connectSocket,
    sendJson,
    disconnect
  } = useWebSocket<unknown>({
    heartbeat: {
      intervalMs: HEARTBEAT_INTERVAL_MS,
      timeoutMs: HEARTBEAT_TIMEOUT_MS,
      payload: '2',
      isResponse: data => data === '3'
    },
    reconnect: {
      maxAttempts: RECONNECT_MAX_ATTEMPTS,
      initialDelayMs: 1_000,
      maxDelayMs: 10_000
    },
    parseMessage: event => JSON.parse(String(event.data))
  })

  /** 记录当前客服会话的连接参数，并建立对应 Socket 连接。 */
  const connect = (options: ChatConnectionOptions) => {
    connectSocket({
      url: options.url,
      onMessage: options.onMessage,
      onOpen: () => options.onConnected?.()
    })
  }

  return {
    state,
    errorMessage,
    connect,
    send: sendJson,
    disconnect
  }
}
