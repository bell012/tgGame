import { ref } from 'vue'

import type { ChatMessage } from '../types'

/** 管理当前会话的消息记录，并预留历史消息加载入口。 */
export function useMessageList() {
  const messages = ref<ChatMessage[]>([])
  const loadingHistory = ref(false)
  const hasMoreHistory = ref(false)

  /** 后续以真实接口的游标或页码替换。 */
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
