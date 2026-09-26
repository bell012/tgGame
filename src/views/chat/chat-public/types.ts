export type ConversationStatus = 'online' | 'offline' | 'typing'
export type MessageDirection = 'incoming' | 'outgoing'
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'reply'
  | 'auto-reply'
  | 'red-pack'
  | 'system'
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
  replyToUserId?: string
  replyToUserName?: string
  replyToType?: 'text' | 'image'
}

export interface ChatMessage {
  id: string
  direction: MessageDirection
  type: MessageType
  text?: string
  image?: string
  video?: string
  time: string
  period?: string
  read?: boolean
  reply?: ChatReplyTarget
  status?: ChatMessageStatus
  timestamp?: number
  contentType?: string
  socketContent?: string
  imageList?: ChatImageItem[]
  authorId?: string
  authorName?: string
  redPacket?: ChatRedPacket
  system?: ChatSystemMessage
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
  replyInfo?: ChatReplyInfo
}

/** Socket 引用回复携带的原始被回复消息信息。 */
export interface ChatReplyInfo {
  replyToMsgId: string
  replyToContent: string
  replyToType?: 'text' | 'image'
  replyToUserId: string
  replyToUserName: string
  quoteText: string
}

/** WebSocket 红包消息 content 中的结构化数据。 */
export interface ChatRedPacket {
  id: string | number
  status: 0 | 1
  amount: string | number
}

/** 系统提示消息的页面展示信息。 */
export interface ChatSystemMessage {
  type: 'red-packet-claimed'
  serviceName: string
}
