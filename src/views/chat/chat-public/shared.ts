import { getStoredLocale } from '@/utils/locale'
import { globalShowToast } from '@/utils/toast'
import i18n from '@/i18n'
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
  if (message.type === 'video') return '1 Video'
  return message.text || ''
}

/** 将文本按搜索词拆分为安全的普通片段和高亮片段，避免使用 v-html 渲染用户消息。 */
export const getChatTextHighlightParts = (value: unknown, keyword: unknown) => {
  const text = String(value ?? '')
  const normalizedKeyword = String(keyword ?? '').trim()
  if (!text || !normalizedKeyword) {
    return [{ text, matched: false }]
  }

  const normalizedText = text.toLocaleLowerCase()
  const normalizedSearch = normalizedKeyword.toLocaleLowerCase()
  const parts: Array<{ text: string; matched: boolean }> = []
  let startIndex = 0
  let matchIndex = normalizedText.indexOf(normalizedSearch, startIndex)

  while (matchIndex !== -1) {
    if (matchIndex > startIndex) {
      parts.push({ text: text.slice(startIndex, matchIndex), matched: false })
    }
    parts.push({
      text: text.slice(matchIndex, matchIndex + normalizedKeyword.length),
      matched: true
    })
    startIndex = matchIndex + normalizedKeyword.length
    matchIndex = normalizedText.indexOf(normalizedSearch, startIndex)
  }

  if (startIndex < text.length) {
    parts.push({ text: text.slice(startIndex), matched: false })
  }

  return parts.length ? parts : [{ text, matched: false }]
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

/** 将客服图片或视频下载为本地文件，完成浏览器保存触发后返回。 */
export const downloadChatMedia = async (source: string, fallbackFileName = 'chat-media') => {
  const url = String(source ?? '').trim()
  if (!url) {
    throw new Error('Media URL is unavailable')
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Media download failed')
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const sourceName = url.split('?')[0]?.split('/').pop() || ''

  anchor.href = objectUrl
  anchor.download = sourceName || fallbackFileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)

  globalShowToast({ message: i18n.global.t('chatPublic.SavedSuccessfully'), type: 'success' })
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

/** 格式化聊天气泡的时分，不包含上午或下午文案。 */
export const formatChatMessageTime = (timestamp = Date.now()) => {
  const date = new Date(timestamp)
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${hour}:${minute}`
}

/** 根据当前站点语言返回聊天气泡的上午或下午文案。 */
export const getChatTimePeriod = (timestamp = Date.now()) => {
  const isMorning = new Date(timestamp).getHours() < 12

  if (getStoredLocale() === 'zh') {
    return isMorning ? '上午' : '下午'
  }

  return isMorning ? 'AM' : 'PM'
}
