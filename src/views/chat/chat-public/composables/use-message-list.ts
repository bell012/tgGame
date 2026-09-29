import { ref } from 'vue'
import { createMockMessages } from '../mock'
import type { ChatMessage } from '../types'

/** 管理当前会话的本地消息记录与后续历史消息加载入口。 */
export function useMessageList() {
  const messages = ref<ChatMessage[]>(createMockMessages())
  const loadingHistory = ref(false)
  const hasMoreHistory = ref(false)

  /** 预留历史消息加载入口，后续以真实接口的游标或页码替换。 */
  const loadHistory = async () => {
    // 后续使用真实接口的游标或页码加载历史消息。
  }

  return {
    messages,
    loadingHistory,
    hasMoreHistory,
    loadHistory
  }
}
