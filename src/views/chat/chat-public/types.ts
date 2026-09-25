export type ConversationStatus = 'online' | 'offline' | 'typing'
export type MessageDirection = 'incoming' | 'outgoing'
export type MessageType = 'text' | 'image' | 'reply' | 'auto-reply'
export type ChatComposerMode = 'idle' | 'typing' | 'emoji' | 'media' | 'reply'
export type ChatMessageStatus = 'sending' | 'sent' | 'failed'

export interface ConversationItem {
  id: string
  account?: string
  avatar?: string
  dealerCode?: string
  nickName?: string
  onlineStatus?: number
  unreadCount?: number
  lastMessageTime?: number
  lastMessage?: string
  sort?: number
}

export interface ChatReplyTarget {
  id: string
  author: string
  preview: string
  photoCount?: number
}

export interface ChatMessage {
  id: string
  direction: MessageDirection
  type: MessageType
  text?: string
  image?: string
  time: string
  period?: string
  read?: boolean
  reply?: ChatReplyTarget
  status?: ChatMessageStatus
  timestamp?: number
  contentType?: string
  imageList?: ChatImageItem[]
}

export interface QuickIssue {
  id: string | number
  created?: number
  typeName?: string
}

/** 聊天图片的上传与消息展示数据。 */
export interface ChatImageItem {
  imgUrl: string
  fileName: string
  fileFormat: string
  imgSize: string
  imageWidth: number
  imageHeight: number
}

/** Socket 中的会员或客服身份信息。 */
export interface ChatParticipant {
  avatar: string
  dealerCode: string
  nickName: string
  type: 'member' | 'customer'
  account: string
  userId: string
}

/** 客服 Socket 业务消息。 */
export interface ChatSocketMessage {
  type: 'msg'
  messageId: string
  content: string
  contentType: 'text' | 'image' | 'autoReplyReq' | 'autoReplyResp' | string
  mine: ChatParticipant
  to: ChatParticipant
  imageList?: ChatImageItem[]
  conversationId?: string
  timestamp?: number
}
