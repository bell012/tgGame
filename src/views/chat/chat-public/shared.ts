import type { ChatMessage, ConversationStatus, QuickIssue } from './types'

export const QUICK_ISSUES: QuickIssue[] = [
  {
    id: 'deposit',
    labelKey: 'depositIssues',
    questionKey: 'depositQuestion'
  },
  {
    id: 'withdrawal',
    labelKey: 'withdrawalIssues',
    questionKey: 'withdrawalQuestion'
  },
  {
    id: 'account',
    labelKey: 'accountIssues',
    questionKey: 'accountQuestion'
  }
]

export const EMOJI_OPTIONS = [
  '😀',
  '🥺',
  '😍',
  '🙄',
  '😎',
  '😭',
  '😡',
  '😴',
  '😤',
  '🥵',
  '😠',
  '😜',
  '😁',
  '🥹',
  '😆',
  '🥳',
  '🤔',
  '😊',
  '😮',
  '😕',
  '🥺',
  '😁',
  '🥲',
  '🤭',
  '🤩',
  '😵',
  '🥰',
  '😳',
  '🥸',
  '😆',
  '😲',
  '🤫',
  '😵',
  '😵',
  '😎'
]

export const SEARCH_RESULTS = Array.from({ length: 6 }, (_, index) => ({
  id: `search-${index}`,
  name: 'Customer Service Luna',
  time: '20:20',
  content: 'Is the image you sent me yesterday still there?'
}))

/** 根据客服在线状态返回对应的国际化键。 */
export function getConversationStatusKey(status: ConversationStatus) {
  if (status === 'typing') return 'chatPublic.typing'
  if (status === 'offline') return 'chatPublic.offline'
  return 'chatPublic.online'
}

/** 为本地静态消息生成临时唯一标识，接口接入后以服务端消息 ID 为准。 */
export function createMessageId() {
  return `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** 根据消息类型返回引用回复中使用的简短预览文本。 */
export function getMessagePreview(message: ChatMessage) {
  if (message.type === 'image') return '1 Photo'
  return message.text || ''
}
