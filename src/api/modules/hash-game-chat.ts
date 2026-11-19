import request from '@/utils/request'
import type { HashChatHistoryResponse } from '@/views/hash_game/chat/types'

/** 发送成功后等待 CHAT_MESSAGE 广播，本地不重复插入消息。 */
export function sendHashChatMessage(data: {
  gameCode: string
  content: string
  custom: boolean
}): Promise<{ success: boolean; message?: string }> {
  return request({
    url: '/chain-lottery/chat/send',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 进入哈希游戏房间时获取该游戏的聊天室历史消息。 */
export function queryHashChatHistory(gameCode: string): Promise<HashChatHistoryResponse> {
  return request({
    url: '/chain-lottery/chat/history',
    method: 'post',
    data: { gameCode },
    showSuccessToast: false,
    showErrorToast: false
  })
}

export function queryHashChatConfig(
  gameCode: string
): Promise<{ success: boolean; result?: import('@/views/hash_game/chat/config').HashChatConfig }> {
  return request({
    url: '/chain-lottery/chat/config',
    method: 'post',
    data: { gameCode },
    showSuccessToast: false,
    showErrorToast: false
  })
}
