import type { ChatMessage } from '../types'

const CHAT_CACHE_DATABASE_NAME = 'tg-game-chat'
const CHAT_CACHE_CONVERSATION_STORE_NAME = 'conversations'
const CHAT_CACHE_MESSAGE_STORE_NAME = 'messages'
const CHAT_CACHE_VERSION = 2
export const CHAT_CACHE_PAGE_SIZE = 30

interface LegacyChatMessageCacheRecord {
  key: string
  messages?: ChatMessage[]
  updatedAt: number
}

interface ChatMessageCacheRecord {
  key: string
  conversationKey: string
  messageId: string
  timestamp: number
  message: ChatMessage
  updatedAt: number
}

export interface ChatMessageCacheCursor {
  timestamp: number
  messageId: string
}

interface CachedChatMessagePage {
  messages: ChatMessage[]
  hasMore: boolean
}

/** 为单条消息生成 IndexedDB 主键，避免不同客服会话的消息互相覆盖。 */
const getMessageCacheKey = (conversationKey: string, messageId: string) =>
  `${conversationKey}:${messageId}`

/** 将 Vue 响应式消息递归转换为 IndexedDB 可结构化克隆的普通 JSON 对象。 */
const cloneChatMessage = (message: ChatMessage): ChatMessage =>
  JSON.parse(JSON.stringify(message)) as ChatMessage

/** 将消息转换为可写入 IndexedDB 的独立快照，避免后续响应式修改影响缓存。 */
const createMessageCacheRecord = (
  conversationKey: string,
  message: ChatMessage
): ChatMessageCacheRecord => ({
  key: getMessageCacheKey(conversationKey, message.id),
  conversationKey,
  messageId: message.id,
  timestamp: Number(message.timestamp) || 0,
  message: cloneChatMessage(message),
  updatedAt: Date.now()
})

/** 打开客服消息 IndexedDB，并在升级时将旧数组缓存迁移到单消息表。 */
const openChatCacheDatabase = () =>
  new Promise<IDBDatabase | null>(resolve => {
    if (typeof indexedDB === 'undefined') {
      resolve(null)
      return
    }

    const request = indexedDB.open(CHAT_CACHE_DATABASE_NAME, CHAT_CACHE_VERSION)

    request.onupgradeneeded = event => {
      const database = request.result
      const transaction = request.transaction
      if (!transaction) return

      const conversationStore = database.objectStoreNames.contains(
        CHAT_CACHE_CONVERSATION_STORE_NAME
      )
        ? transaction.objectStore(CHAT_CACHE_CONVERSATION_STORE_NAME)
        : database.createObjectStore(CHAT_CACHE_CONVERSATION_STORE_NAME, { keyPath: 'key' })
      const messageStore = database.objectStoreNames.contains(CHAT_CACHE_MESSAGE_STORE_NAME)
        ? transaction.objectStore(CHAT_CACHE_MESSAGE_STORE_NAME)
        : database.createObjectStore(CHAT_CACHE_MESSAGE_STORE_NAME, { keyPath: 'key' })

      if (!messageStore.indexNames.contains('byConversationTimestamp')) {
        messageStore.createIndex(
          'byConversationTimestamp',
          ['conversationKey', 'timestamp', 'messageId'],
          { unique: false }
        )
      }

      // 旧版本按会话保存整个 messages 数组；升级时仅迁移一次为逐条消息记录。
      if (event.oldVersion < 2) {
        const cursorRequest = conversationStore.openCursor()
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result
          if (!cursor) return

          const legacyRecord = cursor.value as LegacyChatMessageCacheRecord
          const conversationKey = String(legacyRecord.key ?? '')
          legacyRecord.messages?.forEach(message => {
            if (message?.id) {
              messageStore.put(createMessageCacheRecord(conversationKey, message))
            }
          })
          cursor.continue()
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })

/** 从 IndexedDB 读取指定会话的一页历史消息，默认返回最新消息。 */
export const loadCachedChatMessages = async (
  conversationKey: string,
  options: { before?: ChatMessageCacheCursor; limit?: number } = {}
): Promise<CachedChatMessagePage> => {
  const database = await openChatCacheDatabase()
  if (!database) return { messages: [], hasMore: false }

  const limit = options.limit ?? CHAT_CACHE_PAGE_SIZE
  return new Promise(resolve => {
    const transaction = database.transaction(CHAT_CACHE_MESSAGE_STORE_NAME, 'readonly')
    const messageStore = transaction.objectStore(CHAT_CACHE_MESSAGE_STORE_NAME)
    const messageIndex = messageStore.index('byConversationTimestamp')
    const lowerBound: [string, number, string] = [conversationKey, 0, '']
    const upperBound: [string, number, string] = options.before
      ? [conversationKey, options.before.timestamp, options.before.messageId]
      : [conversationKey, Number.MAX_SAFE_INTEGER, '\uffff']
    const range = IDBKeyRange.bound(lowerBound, upperBound, false, Boolean(options.before))
    const cachedMessages: ChatMessage[] = []
    let hasMore = false
    const request = messageIndex.openCursor(range, 'prev')

    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) return

      const record = cursor.value as ChatMessageCacheRecord
      if (cachedMessages.length >= limit) {
        hasMore = true
        return
      }

      cachedMessages.push(record.message)
      cursor.continue()
    }
    request.onerror = () => {
      hasMore = false
    }
    transaction.oncomplete = () => {
      database.close()
      resolve({ messages: cachedMessages.reverse(), hasMore })
    }
    transaction.onerror = () => {
      database.close()
      resolve({ messages: [], hasMore: false })
    }
    transaction.onabort = () => {
      database.close()
      resolve({ messages: [], hasMore: false })
    }
  })
}

/** 读取指定会话的全部本地消息，供聊天历史搜索使用而不影响列表分页显示。 */
export const loadAllCachedChatMessages = async (conversationKey: string) => {
  const messages: ChatMessage[] = []
  let before: ChatMessageCacheCursor | undefined

  do {
    const page = await loadCachedChatMessages(conversationKey, {
      before,
      limit: CHAT_CACHE_PAGE_SIZE
    })
    messages.unshift(...page.messages)
    const oldestMessage = page.messages[0]
    before =
      page.hasMore && oldestMessage?.id
        ? {
            timestamp: Number(oldestMessage.timestamp) || 0,
            messageId: oldestMessage.id
          }
        : undefined
  } while (before)

  return messages
}

/** 按会话缓存主键和消息 ID 读取单条历史消息，用于搜索结果定位。 */
export const loadCachedChatMessageById = async (conversationKey: string, messageId: string) => {
  const database = await openChatCacheDatabase()
  if (!database) return null

  return new Promise<ChatMessage | null>(resolve => {
    const transaction = database.transaction(CHAT_CACHE_MESSAGE_STORE_NAME, 'readonly')
    const request = transaction
      .objectStore(CHAT_CACHE_MESSAGE_STORE_NAME)
      .get(getMessageCacheKey(conversationKey, messageId))

    request.onsuccess = () => {
      const record = request.result as ChatMessageCacheRecord | undefined
      resolve(record?.message ?? null)
    }
    request.onerror = () => resolve(null)
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => database.close()
    transaction.onabort = () => database.close()
  })
}

/** 增量写入或更新单条会话消息，不再重写整段消息历史。 */
export const saveCachedChatMessage = async (conversationKey: string, message: ChatMessage) => {
  const database = await openChatCacheDatabase()
  if (!database) return

  return new Promise<void>(resolve => {
    const transaction = database.transaction(CHAT_CACHE_MESSAGE_STORE_NAME, 'readwrite')
    transaction
      .objectStore(CHAT_CACHE_MESSAGE_STORE_NAME)
      .put(createMessageCacheRecord(conversationKey, message))

    const finish = () => {
      database.close()
      resolve()
    }

    transaction.oncomplete = finish
    transaction.onerror = finish
    transaction.onabort = finish
  })
}
