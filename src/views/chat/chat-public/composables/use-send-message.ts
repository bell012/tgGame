import type { Ref } from 'vue'
import { createMessageId } from '../shared'
import type { ChatMessage, ChatReplyTarget } from '../types'

/** 管理本地静态消息发送，后续在此统一接入文本和图片发送接口。 */
export function useSendMessage(messages: Ref<ChatMessage[]>) {
  /** 将文本消息追加至本地列表，接口接入后在此处改为提交成功再更新。 */
  const sendText = (text: string, reply?: ChatReplyTarget | null) => {
    const trimmed = text.trim()
    if (!trimmed) return

    // 后续接入真实发送接口后，仅在服务端确认成功时更新本地消息列表。
    messages.value.push({
      id: createMessageId(),
      direction: 'outgoing',
      type: reply ? 'reply' : 'text',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      reply: reply || undefined
    })
  }

  /** 将图片消息追加至本地列表，接口接入后使用上传返回的 CDN 地址。 */
  const sendImage = (image: string) => {
    // 后续先上传图片，再使用接口返回的 CDN 地址创建消息内容。
    messages.value.push({
      id: createMessageId(),
      direction: 'outgoing',
      type: 'image',
      image,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    })
  }

  return {
    sendText,
    sendImage
  }
}
