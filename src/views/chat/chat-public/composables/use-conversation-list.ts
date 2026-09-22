import { ref } from 'vue'
import { MOCK_CONVERSATIONS } from '../mock'
import type { ConversationItem } from '../types'

/** 管理客服会话列表的本地 mock 数据与后续分页刷新入口。 */
export function useConversationList() {
  const conversations = ref<ConversationItem[]>(MOCK_CONVERSATIONS.map(item => ({ ...item })))
  const loading = ref(false)
  const hasMore = ref(false)

  /** 重新读取本地客服会话 mock 数据，预留为后续真实列表刷新入口。 */
  const refresh = async () => {
    // 后续替换为真实客服会话列表接口。
    loading.value = true
    await Promise.resolve()
    conversations.value = MOCK_CONVERSATIONS.map(item => ({ ...item }))
    loading.value = false
  }

  /** 预留分页加载接口，接入后按游标或页码追加历史会话。 */
  const loadMore = async () => {
    // 后续接入会话列表分页接口。
  }

  return {
    conversations,
    loading,
    hasMore,
    refresh,
    loadMore
  }
}
