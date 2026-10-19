import { globalShowToast } from '@/utils/toast'
import i18n from '@/i18n'
import { resolveGameImageUrl } from '@/utils/image'
import type { ChatMessage, ConversationStatus } from './types'

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
  if (message.type === 'image') return i18n.global.t('chatPublic.onePhoto')
  if (message.type === 'video') return i18n.global.t('chatPublic.oneVideo')
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
  return resolveGameImageUrl(value)
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

  globalShowToast({ message: i18n.global.t('chatPublic.savedSuccessfully'), type: 'success' })
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

/**
 * 对客服端消息做严格白名单过滤后再用于 v-html。
 *
 * 用户发送的消息不会调用此方法，始终以 Vue 文本插值展示。这里仍然过滤客服端内容，
 * 防止后台录入或第三方数据意外带入脚本、事件属性和危险链接。
 */
export const sanitizeChatRichText = (value: unknown) => {
  const source = String(value ?? '').trim()
  if (!source) return ''

  if (typeof DOMParser === 'undefined' || typeof document === 'undefined') {
    return source.replace(/[&<>"']/g, character => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }
      return entities[character] || character
    })
  }

  const parser = new DOMParser()
  // 某些服务端会把 HTML 实体编码后再下发；只对服务端富文本解码一次，再统一过滤。
  const decodedSource = /&(?:lt|#0*60);/i.test(source)
    ? parser.parseFromString(source, 'text/html').body.textContent || source
    : source
  const input = parser.parseFromString(decodedSource, 'text/html')
  const output = document.implementation.createHTMLDocument('')
  const allowedTags = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'BR', 'A', 'UL', 'OL', 'LI'])
  const discardedTags = new Set([
    'SCRIPT',
    'STYLE',
    'TEMPLATE',
    'NOSCRIPT',
    'IFRAME',
    'OBJECT',
    'EMBED'
  ])

  const sanitizeNode = (node: Node, parent: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(output.createTextNode(node.textContent || ''))
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const element = node as HTMLElement
    // 与纯文本预览保持一致，忽略服务端用于 H5 系统提示的隐藏节点。
    if (element.id === 'h5SysMsg' || discardedTags.has(element.tagName)) return

    const target = allowedTags.has(element.tagName)
      ? output.createElement(element.tagName.toLowerCase())
      : parent

    if (element.tagName === 'A' && target instanceof HTMLAnchorElement) {
      const href = element.getAttribute('href') || ''
      try {
        const url = new URL(href, window.location.origin)
        if (url.protocol === 'https:' || url.protocol === 'http:') {
          target.href = url.href
          target.target = '_blank'
          target.rel = 'noopener noreferrer'
        }
      } catch {
        // 无效链接降级为普通文本链接标签。
      }
    }

    Array.from(element.childNodes).forEach(child => sanitizeNode(child, target))
    if (target !== parent) parent.appendChild(target)
  }

  Array.from(input.body.childNodes).forEach(node => sanitizeNode(node, output.body))
  return output.body.innerHTML
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

  return i18n.global.t(isMorning ? 'chatPublic.morning' : 'chatPublic.afternoon')
}
