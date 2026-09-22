import avatarUrl from '@/static/img/chat/public/customer-service-luna.jpg'
import messageImageUrl from '@/static/img/chat/public/chat-image-sample.jpg'
import type { ChatMessage, ConversationItem } from './types'

export const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'luna-01',
    name: 'Luna',
    status: 'online',
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    time: '19:36',
    unread: 99
  },
  {
    id: 'luna-02',
    name: 'Luna',
    status: 'online',
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    time: '19:36',
    unread: 3
  },
  {
    id: 'luna-03',
    name: 'Luna',
    status: 'online',
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    time: '19:36',
    unread: 3
  },
  {
    id: 'luna-04',
    name: 'Luna',
    status: 'online',
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    time: '19:36',
    unread: 3
  },
  {
    id: 'luna-05',
    name: 'Luna',
    status: 'online',
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    time: '19:36',
    unread: 3
  },
  {
    id: 'luna-06',
    name: 'Luna',
    status: 'online',
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    time: '19:36',
    unread: 3
  },
  {
    id: 'luna-07',
    name: 'Luna',
    status: 'online',
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    time: '19:36',
    unread: 3
  },
  {
    id: 'luna-08',
    name: 'Luna',
    status: 'online',
    avatar: avatarUrl,
    lastMessage: 'Your order of RMB 1,000 has been received.',
    time: '19:36',
    unread: 3
  }
]

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    direction: 'incoming',
    type: 'text',
    text: 'Hello! How may I assist you today?',
    time: '13:06 PM'
  },
  {
    id: 'm-2',
    direction: 'outgoing',
    type: 'text',
    text: 'May I ask how to register an account?',
    time: '13:06 PM',
    read: true
  },
  {
    id: 'm-3',
    direction: 'incoming',
    type: 'text',
    text: 'Hello! How may I assist you today?',
    time: '13:06 PM'
  },
  {
    id: 'm-4',
    direction: 'outgoing',
    type: 'text',
    text: 'May I ask how to register an account?',
    time: '13:06 PM',
    read: true
  },
  {
    id: 'm-5',
    direction: 'outgoing',
    type: 'image',
    image: messageImageUrl,
    time: '03:48 PM',
    read: true
  }
]
