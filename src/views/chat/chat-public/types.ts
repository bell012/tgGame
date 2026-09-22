export type ConversationStatus = 'online' | 'offline' | 'typing'
export type MessageDirection = 'incoming' | 'outgoing'
export type MessageType = 'text' | 'image' | 'reply'
export type ChatComposerMode = 'idle' | 'typing' | 'emoji' | 'media' | 'reply'

export interface ConversationItem {
  id: string
  name: string
  status: ConversationStatus
  avatar: string
  lastMessage: string
  time: string
  unread: number
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
  read?: boolean
  reply?: ChatReplyTarget
}

export interface QuickIssue {
  id: string
  labelKey: string
  questionKey: string
}
