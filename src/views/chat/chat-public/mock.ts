import avatarUrl from '@/static/img/chat/public/customer-service-luna.jpg'
import i18n from '@/i18n'
import messageImageUrl from '@/static/img/chat/public/chat-image-sample.jpg'
import type { ChatMessage, ConversationItem } from './types'

/** 根据当前语言生成旧版会话列表的调试数据。 */
export const createMockConversations = (): ConversationItem[] =>
  Array.from({ length: 8 }, (_, index) => ({
    id: `luna-${String(index + 1).padStart(2, '0')}`,
    account: `luna-${String(index + 1).padStart(2, '0')}`,
    dealerCode: 'mock',
    nickName: 'Luna',
    onlineStatus: 0,
    avatar: avatarUrl,
    lastMessage: i18n.global.t('chatPublic.mockLastMessage'),
    lastMessageTime: Date.now(),
    unreadCount: index === 0 ? 99 : 3
  }))

/** 根据当前语言生成旧版会话消息的调试数据。 */
export const createMockMessages = (): ChatMessage[] => [
  {
    id: 'm-1',
    direction: 'incoming',
    type: 'text',
    text: i18n.global.t('chatPublic.mockServiceGreeting'),
    time: '13:06',
    period: 'PM'
  },
  {
    id: 'm-2',
    direction: 'outgoing',
    type: 'text',
    text: i18n.global.t('chatPublic.mockUserQuestion'),
    time: '13:06',
    period: 'PM',
    read: true
  },
  {
    id: 'm-3',
    direction: 'incoming',
    type: 'text',
    text: i18n.global.t('chatPublic.mockServiceGreeting'),
    time: '13:06',
    period: 'PM'
  },
  {
    id: 'm-4',
    direction: 'outgoing',
    type: 'text',
    text: i18n.global.t('chatPublic.mockUserQuestion'),
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
