import { onBeforeUnmount, ref } from 'vue'

export type ChatConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting'

/** 预留聊天连接状态管理，后续接入项目实际的消息传输协议。 */
export function useChatConnection() {
  const state = ref<ChatConnectionState>('idle')

  /** 模拟建立聊天连接，后续在此接入项目实际的长连接或轮询能力。 */
  const connect = async () => {
    // 后续在此接入项目实际的轮询、WebSocket 或 MQTT 通信能力。
    state.value = 'connecting'
    await Promise.resolve()
    state.value = 'connected'
  }

  /** 关闭聊天连接，并将连接状态还原为空闲。 */
  const disconnect = () => {
    state.value = 'idle'
  }

  onBeforeUnmount(disconnect)

  return {
    state,
    connect,
    disconnect
  }
}
