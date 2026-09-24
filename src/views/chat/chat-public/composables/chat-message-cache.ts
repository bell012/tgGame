import type { ChatMessage } from '../types'

const CHAT_CACHE_DATABASE_NAME = 'tg-game-chat'
const CHAT_CACHE_STORE_NAME = 'conversations'
const CHAT_CACHE_VERSION = 1
const CHAT_CACHE_MAX_MESSAGES = 200

interface ChatMessageCacheRecord {
  key: string
  messages: ChatMessage[]
  updatedAt: number
}

/** 打开客服消息 IndexedDB；浏览器不支持时返回空值并降级为仅内存展示。 */
const openChatCacheDatabase = () =>
  new Promise<IDBDatabase | null>(resolve => {
    if (typeof indexedDB === 'undefined') {
      resolve(null)
      return
    }

    const request = indexedDB.open(CHAT_CACHE_DATABASE_NAME, CHAT_CACHE_VERSION)

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(CHAT_CACHE_STORE_NAME)) {
        request.result.createObjectStore(CHAT_CACHE_STORE_NAME, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })

/** 从 IndexedDB 读取指定会员与客服会话的本地消息。 */
export const loadCachedChatMessages = async (key: string): Promise<ChatMessage[]> => {
  const database = await openChatCacheDatabase()
  if (!database) return []

  return new Promise(resolve => {
    const transaction = database.transaction(CHAT_CACHE_STORE_NAME, 'readonly')
    const request = transaction.objectStore(CHAT_CACHE_STORE_NAME).get(key)

    request.onsuccess = () => {
      const record = request.result as ChatMessageCacheRecord | undefined
      resolve(Array.isArray(record?.messages) ? record.messages : [])
    }
    request.onerror = () => resolve([])
    transaction.oncomplete = () => database.close()
  })
}

/** 将会话消息限制数量后写入 IndexedDB，避免本地缓存无限增长。 */
export const saveCachedChatMessages = async (key: string, messages: ChatMessage[]) => {
  const database = await openChatCacheDatabase()
  if (!database) return

  return new Promise<void>(resolve => {
    const transaction = database.transaction(CHAT_CACHE_STORE_NAME, 'readwrite')
    transaction.objectStore(CHAT_CACHE_STORE_NAME).put({
      key,
      messages: messages.slice(-CHAT_CACHE_MAX_MESSAGES),
      updatedAt: Date.now()
    } satisfies ChatMessageCacheRecord)

    const finish = () => {
      database.close()
      resolve()
    }

    transaction.oncomplete = finish
    transaction.onerror = finish
    transaction.onabort = finish
  })
}
