import request from '@/utils/request'
import type { HashChatHistoryResponse } from '@/views/hash_game/chat/types'

/** 进入哈希游戏房间时获取该游戏的聊天室历史消息。 */
export function queryHashChatHistory(gameCode: string): Promise<HashChatHistoryResponse> {
  return request({
    url: '/trade-platform/chain-lottery/chat/history',
    method: 'post',
    data: { gameCode },
    showSuccessToast: false,
    showErrorToast: false
  })
}
