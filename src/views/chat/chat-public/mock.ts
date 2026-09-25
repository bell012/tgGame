import avatarUrl from '@/static/img/chat/public/customer-service-luna.jpg'
import messageImageUrl from '@/static/img/chat/public/chat-image-sample.jpg'
import type { ChatMessage, ConversationItem } from './types'

export const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'luna-01',
    account: 'luna-01',
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    lastMessageTime: Date.now(),
    unreadCount: 99
  },
  {
    id: 'luna-02',
    account: 'luna-02',
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    lastMessageTime: Date.now(),
    unreadCount: 3
  },
  {
    id: 'luna-03',
    account: 'luna-03',
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    lastMessageTime: Date.now(),
    unreadCount: 3
  },
  {
    id: 'luna-04',
    account: 'luna-04',
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    lastMessageTime: Date.now(),
    unreadCount: 3
  },
  {
    id: 'luna-05',
    account: 'luna-05',
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    lastMessageTime: Date.now(),
    unreadCount: 3
  },
  {
    id: 'luna-06',
    account: 'luna-06',
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    lastMessageTime: Date.now(),
    unreadCount: 3
  },
  {
    id: 'luna-07',
    account: 'luna-07',
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    lastMessageTime: Date.now(),
    unreadCount: 3
  },
  {
    id: 'luna-08',
    account: 'luna-08',
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    lastMessageTime: Date.now(),
    unreadCount: 3
  }
]

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    direction: 'incoming',
    type: 'text',
    text: 'Hello! How may I assist you today?',
    time: '13:06',
    period: 'PM'
  },
  {
    id: 'm-2',
    direction: 'outgoing',
    type: 'text',
    text: 'May I ask how to register an account?',
    time: '13:06',
    period: 'PM',
    read: true
  },
  {
    id: 'm-3',
    direction: 'incoming',
    type: 'text',
    text: 'Hello! How may I assist you today?',
    time: '13:06',
    period: 'PM'
  },
  {
    id: 'm-4',
    direction: 'outgoing',
    type: 'text',
    text: 'May I ask how to register an account?',
    time: '13:06',
    period: 'PM',
    read: true
  },
  {
    id: 'm-5',
    direction: 'outgoing',
    type: 'image',
    image: messageImageUrl,
    time: '03:48',
    period: 'PM',
    read: true
  }
]
