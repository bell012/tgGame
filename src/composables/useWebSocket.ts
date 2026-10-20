import {
  createWebSocketConnection,
  type CreateWebSocketConnectionOptions,
  type WebSocketConnectionState
} from '@/utils/websocket'
import { getCurrentScope, onScopeDispose, ref } from 'vue'

export type UseWebSocketOptions<TMessage = unknown> = Omit<
  CreateWebSocketConnectionOptions<TMessage>,
  'onStateChange' | 'onErrorMessageChange'
> & {
  /** 默认随当前 Vue scope 销毁连接；全局或手动管理的连接可设为 false。 */
  autoDisconnect?: boolean
}

/**
 * Vue 对原生 WebSocket 公共控制器的响应式适配层。
 *
 * 每次调用都会创建独立连接；不同模块可各自传入不同的心跳、重连与消息解析策略。
 */
export function useWebSocket<TMessage = unknown>(options: UseWebSocketOptions<TMessage> = {}) {
  const state = ref<WebSocketConnectionState>('idle')
  const errorMessage = ref('')
  const { autoDisconnect = true, ...connectionOptions } = options
  const connection = createWebSocketConnection<TMessage>({
    ...connectionOptions,
    onStateChange: nextState => {
      state.value = nextState
    },
    onErrorMessageChange: nextMessage => {
      errorMessage.value = nextMessage
    }
  })

  if (autoDisconnect && getCurrentScope()) {
    onScopeDispose(connection.disconnect)
  }

  return {
    state,
    errorMessage,
    connection,
    connect: connection.connect,
    send: connection.send,
    sendJson: connection.sendJson,
    disconnect: connection.disconnect
  }
}
