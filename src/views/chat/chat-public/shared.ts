import type { ChatMessage, ConversationStatus } from './types'

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

/** 将客服接口的在线状态值转换为页面展示状态，不修改原始接口对象。 */
export function resolveConversationStatus(onlineStatus: unknown): ConversationStatus {
  return Number(onlineStatus) === 0 ? 'online' : 'offline'
}

/** 为发送中的 Socket 消息生成时间戳加随机字符串的唯一标识。 */
export function createMessageId() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

/** 根据消息类型返回引用回复中使用的简短预览文本。 */
export function getMessagePreview(message: ChatMessage) {
  if (message.type === 'image') return '1 Photo'
  return message.text || ''
}

/** 将服务端文件名或相对图片路径转换为项目当前图片域名下的完整地址。 */
export const resolveChatMediaUrl = (value: unknown) => {
  const source = String(value ?? '').trim()
  if (!source || /^(data:|blob:|https?:\/\/|\/)/i.test(source)) {
    return source
  }

  const baseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
  return baseUrl ? `${baseUrl}/${source.replace(/^\/+/, '')}` : source
}

/** 将服务端富文本自动回复降级为安全纯文本，避免直接渲染未受信任 HTML。 */
export const getChatPlainText = (value: unknown) => {
  const source = String(value ?? '').trim()
  if (!source) return ''

  if (typeof DOMParser === 'undefined') {
    return source.replace(/<[^>]+>/g, '').trim()
  }

  const documentNode = new DOMParser().parseFromString(source, 'text/html')
  documentNode.querySelector('#h5SysMsg')?.remove()
  return (documentNode.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}

/** 格式化消息列表和气泡中使用的本地时分。 */
export const formatChatTime = (timestamp = Date.now()) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
