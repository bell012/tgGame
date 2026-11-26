import request from '@/utils/request'
import i18n from '@/i18n'
import { globalShowToast } from '@/utils/toast'
import type { HashChatHistoryResponse } from '@/views/hash_game/chat/types'

const CHAT_SEND_INTERVAL_MS = 1000
const FREQUENT_MESSAGE = '发言过于频繁'
let lastChatSendAt = 0
type HashChatSendResponse = { code?: string; success: boolean; message?: string }

/** 发送成功后等待 CHAT_MESSAGE 广播，本地不重复插入消息。 */
export async function sendHashChatMessage(data: {
  gameCode: string
  content: string
  custom: boolean
}): Promise<HashChatSendResponse> {
  const now = Date.now()
  if (now - lastChatSendAt < CHAT_SEND_INTERVAL_MS) {
    globalShowToast({ message: i18n.global.t('hashGame.chatTooFrequent'), type: 'fail' })
    return { code: 'C1', success: false, message: FREQUENT_MESSAGE }
  }
  lastChatSendAt = now

  const response = await (request({
    url: '/chain-lottery/chat/send',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false,
    preserveResponseMessage: true
  }) as Promise<HashChatSendResponse>)
  if ((response.code === 'C1' || !response.success) && response.message) {
    globalShowToast({
      message:
        response.code === 'C1' && response.message === FREQUENT_MESSAGE
          ? i18n.global.t('hashGame.chatTooFrequent')
          : response.message,
      type: 'fail'
    })
  }
  return response
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
