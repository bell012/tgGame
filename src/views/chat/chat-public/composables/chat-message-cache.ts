import type { ChatMessage } from '../types'

/** 客服聊天 IndexedDB 数据库名。 */
const CHAT_CACHE_DATABASE_NAME = 'tg-game-chat'
/** 旧版按会话存储消息数组的对象仓库，升级时用于迁移历史数据。 */
const CHAT_CACHE_CONVERSATION_STORE_NAME = 'conversations'
/** 当前按单条消息存储的对象仓库。 */
const CHAT_CACHE_MESSAGE_STORE_NAME = 'messages'
/** 缓存 schema 版本；v3 新增过期时间、身份范围和容量治理字段。 */
const CHAT_CACHE_VERSION = 3

/** 界面首次加载或继续上拉时，每页读取的本地消息数量。 */
export const CHAT_CACHE_PAGE_SIZE = 30
/** 单个客服会话允许保留的最大消息条数。 */
export const CHAT_CACHE_MAX_MESSAGES_PER_CONVERSATION = 500
/** 当前站点下所有客服会话允许保留的最大消息条数。 */
export const CHAT_CACHE_MAX_MESSAGES = 5000
/** 已登录会员消息的本地缓存保留时长。 */
export const CHAT_CACHE_MEMBER_RETENTION_MS = 30 * 24 * 60 * 60 * 1000
/** 游客消息的本地缓存保留时长。 */
export const CHAT_CACHE_GUEST_RETENTION_MS = 7 * 24 * 60 * 60 * 1000
/** 聊天缓存的应用级容量硬上限（100 MiB）。 */
export const CHAT_CACHE_MAX_BYTES = 100 * 1024 * 1024

/** 容量达到该水位后开始执行常规回收，避免临近硬上限才处理。 */
const CHAT_CACHE_SIZE_CLEANUP_THRESHOLD = 90 * 1024 * 1024
/** 常规容量回收后的目标水位。 */
const CHAT_CACHE_SIZE_CLEANUP_TARGET = 80 * 1024 * 1024
/** 浏览器报配额不足时，紧急回收后的目标水位，为本次写入预留空间。 */
const CHAT_CACHE_EMERGENCY_CLEANUP_TARGET = 75 * 1024 * 1024
/** 单会话超过上限后，裁剪到该条数，形成回收缓冲区。 */
const CHAT_CACHE_CONVERSATION_CLEANUP_TARGET = 450
/** 全库超过上限后，裁剪到该条数，形成回收缓冲区。 */
const CHAT_CACHE_GLOBAL_CLEANUP_TARGET = 4750
/** 每个异步清理事务最多删除的过期消息数，避免长事务影响聊天滚动。 */
const CHAT_CACHE_EXPIRY_CLEANUP_BATCH_SIZE = 200
/** 估算单条 IndexedDB 记录容量时预留的索引与结构开销。 */
const CHAT_CACHE_ESTIMATED_RECORD_OVERHEAD_BYTES = 256

type ChatCacheScope = 'member' | 'guest'

interface LegacyChatMessageCacheRecord {
  key: string
  messages?: ChatMessage[]
}

interface ChatMessageCacheRecord {
  key: string
  conversationKey: string
  messageId: string
  timestamp: number
  message: ChatMessage
  updatedAt: number
  scope: ChatCacheScope
  expiresAt: number
  byteSize: number
}

interface ChatCacheStatistics {
  totalCount: number
  totalBytes: number
  conversationCounts: Map<string, number>
}

export interface ChatMessageCacheCursor {
  timestamp: number
  messageId: string
}

interface CachedChatMessagePage {
  messages: ChatMessage[]
  hasMore: boolean
}

/** 当前页面会话内的缓存用量快照，定期重新扫描以纠正跨标签页写入的偏差。 */
let cacheStatistics: ChatCacheStatistics | null = null
/** 自上次完整统计后成功写入的消息数。 */
let writesSinceStatisticsRefresh = 0
/** 待执行的下一轮分批清理计时器，防止重复安排。 */
let scheduledCleanupTimer: number | null = null

const getMessageCacheKey = (conversationKey: string, messageId: string) =>
  conversationKey + ':' + messageId

const getScopeFromConversationKey = (conversationKey: string): ChatCacheScope =>
  conversationKey.startsWith('TEMP_') ? 'guest' : 'member'

const getRetentionMs = (scope: ChatCacheScope) =>
  scope === 'guest' ? CHAT_CACHE_GUEST_RETENTION_MS : CHAT_CACHE_MEMBER_RETENTION_MS

const getMessageTimestamp = (message: ChatMessage, fallback = Date.now()) => {
  const timestamp = Number(message.timestamp)
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : fallback
}

const getMessageExpiresAt = (message: ChatMessage, scope: ChatCacheScope, fallback = Date.now()) =>
  getMessageTimestamp(message, fallback) + getRetentionMs(scope)

const cloneChatMessage = (message: ChatMessage): ChatMessage =>
  JSON.parse(JSON.stringify(message)) as ChatMessage

/**
 * IndexedDB 无法取得单条记录的真实占用。以 UTF-8 JSON 载荷加固定索引开销维护应用级
 * 100 MiB 预算；浏览器实际配额不足时仍会走紧急清理和重试。
 */
const estimateMessageByteSize = (message: ChatMessage) => {
  const source = JSON.stringify(message)

  try {
    return new Blob([source]).size + CHAT_CACHE_ESTIMATED_RECORD_OVERHEAD_BYTES
  } catch {
    return source.length * 2 + CHAT_CACHE_ESTIMATED_RECORD_OVERHEAD_BYTES
  }
}

const getRecordByteSize = (record: ChatMessageCacheRecord) => {
  const byteSize = Number(record.byteSize)
  return Number.isFinite(byteSize) && byteSize > 0
    ? byteSize
    : estimateMessageByteSize(record.message)
}

const isExpiredCacheRecord = (record: ChatMessageCacheRecord, now = Date.now()) => {
  const expiresAt = Number(record.expiresAt)
  if (Number.isFinite(expiresAt) && expiresAt > 0) return expiresAt <= now

  const scope = record.scope ?? getScopeFromConversationKey(record.conversationKey)
  return getMessageExpiresAt(record.message, scope, Number(record.updatedAt) || now) <= now
}

const createMessageCacheRecord = (
  conversationKey: string,
  message: ChatMessage,
  scope = getScopeFromConversationKey(conversationKey)
): ChatMessageCacheRecord => {
  const snapshot = cloneChatMessage(message)

  return {
    key: getMessageCacheKey(conversationKey, snapshot.id),
    conversationKey,
    messageId: snapshot.id,
    timestamp: getMessageTimestamp(snapshot, 0),
    message: snapshot,
    updatedAt: Date.now(),
    scope,
    expiresAt: getMessageExpiresAt(snapshot, scope),
    byteSize: estimateMessageByteSize(snapshot)
  }
}

const updateStatisticsForRecord = (record: ChatMessageCacheRecord, delta: 1 | -1 = 1) => {
  if (!cacheStatistics) return

  cacheStatistics.totalCount = Math.max(0, cacheStatistics.totalCount + delta)
  cacheStatistics.totalBytes = Math.max(
    0,
    cacheStatistics.totalBytes + getRecordByteSize(record) * delta
  )
  const count = (cacheStatistics.conversationCounts.get(record.conversationKey) ?? 0) + delta
  if (count > 0) {
    cacheStatistics.conversationCounts.set(record.conversationKey, count)
  } else {
    cacheStatistics.conversationCounts.delete(record.conversationKey)
  }
}

/** 打开客服 IndexedDB，并把旧版本记录升级为带过期和容量字段的单条消息缓存。 */
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
      if (!messageStore.indexNames.contains('byExpiresAt')) {
        messageStore.createIndex('byExpiresAt', 'expiresAt', { unique: false })
      }
      if (!messageStore.indexNames.contains('byTimestamp')) {
        messageStore.createIndex('byTimestamp', ['timestamp', 'messageId'], { unique: false })
      }

      if (event.oldVersion < 2) {
        const legacyCursor = conversationStore.openCursor()
        legacyCursor.onsuccess = () => {
          const cursor = legacyCursor.result
          if (!cursor) return

          const legacyRecord = cursor.value as LegacyChatMessageCacheRecord
          const conversationKey = String(legacyRecord.key ?? '')
          const scope = getScopeFromConversationKey(conversationKey)
          legacyRecord.messages?.forEach(message => {
            if (message?.id) {
              messageStore.put(createMessageCacheRecord(conversationKey, message, scope))
            }
          })
          cursor.continue()
        }
      }

      if (event.oldVersion < 3) {
        const cacheCursor = messageStore.openCursor()
        cacheCursor.onsuccess = () => {
          const cursor = cacheCursor.result
          if (!cursor) return

          const record = cursor.value as Partial<ChatMessageCacheRecord>
          const message = record.message
          const conversationKey = String(record.conversationKey ?? '')
          if (message && conversationKey) {
            const scope = record.scope ?? getScopeFromConversationKey(conversationKey)
            const updatedRecord: ChatMessageCacheRecord = {
              key: String(record.key ?? getMessageCacheKey(conversationKey, String(message.id))),
              conversationKey,
              messageId: String(record.messageId ?? message.id),
              timestamp: Number(record.timestamp) || getMessageTimestamp(message, 0),
              message,
              updatedAt: Number(record.updatedAt) || Date.now(),
              scope,
              expiresAt:
                Number(record.expiresAt) ||
                getMessageExpiresAt(message, scope, Number(record.updatedAt) || Date.now()),
              byteSize: Number(record.byteSize) || estimateMessageByteSize(message)
            }
            cursor.update(updatedRecord)
          }
          cursor.continue()
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })

const calculateCacheStatistics = (database: IDBDatabase) =>
  new Promise<ChatCacheStatistics>(resolve => {
    const statistics: ChatCacheStatistics = {
      totalCount: 0,
      totalBytes: 0,
      conversationCounts: new Map()
    }
    const transaction = database.transaction(CHAT_CACHE_MESSAGE_STORE_NAME, 'readonly')
    const request = transaction.objectStore(CHAT_CACHE_MESSAGE_STORE_NAME).openCursor()

    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) return

      const record = cursor.value as ChatMessageCacheRecord
      statistics.totalCount += 1
      statistics.totalBytes += getRecordByteSize(record)
      statistics.conversationCounts.set(
        record.conversationKey,
        (statistics.conversationCounts.get(record.conversationKey) ?? 0) + 1
      )
      cursor.continue()
    }
    transaction.oncomplete = () => resolve(statistics)
    transaction.onerror = () => resolve(statistics)
    transaction.onabort = () => resolve(statistics)
  })

const ensureCacheStatistics = async (database: IDBDatabase, forceRefresh = false) => {
  if (!cacheStatistics || forceRefresh) {
    cacheStatistics = await calculateCacheStatistics(database)
    writesSinceStatisticsRefresh = 0
  }

  return cacheStatistics
}

const deleteExpiredRecords = (
  database: IDBDatabase,
  limit = CHAT_CACHE_EXPIRY_CLEANUP_BATCH_SIZE
) =>
  new Promise<{ hasMore: boolean }>(resolve => {
    const transaction = database.transaction(CHAT_CACHE_MESSAGE_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(CHAT_CACHE_MESSAGE_STORE_NAME)
    const request = store.index('byExpiresAt').openCursor(IDBKeyRange.upperBound(Date.now()))
    let deleted = 0
    let hasMore = false

    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) return
      if (deleted >= limit) {
        hasMore = true
        return
      }

      const record = cursor.value as ChatMessageCacheRecord
      if (isExpiredCacheRecord(record)) {
        store.delete(cursor.primaryKey)
        updateStatisticsForRecord(record, -1)
        deleted += 1
      }
      cursor.continue()
    }
    transaction.oncomplete = () => resolve({ hasMore })
    transaction.onerror = () => resolve({ hasMore })
    transaction.onabort = () => resolve({ hasMore })
  })

const deleteOldestConversationRecords = (
  database: IDBDatabase,
  conversationKey: string,
  count: number
) =>
  new Promise<void>(resolve => {
    if (count <= 0) {
      resolve()
      return
    }

    const transaction = database.transaction(CHAT_CACHE_MESSAGE_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(CHAT_CACHE_MESSAGE_STORE_NAME)
    const range = IDBKeyRange.bound(
      [conversationKey, 0, ''],
      [conversationKey, Number.MAX_SAFE_INTEGER, '\uffff']
    )
    const request = store.index('byConversationTimestamp').openCursor(range, 'next')
    let deleted = 0

    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor || deleted >= count) return

      const record = cursor.value as ChatMessageCacheRecord
      store.delete(cursor.primaryKey)
      updateStatisticsForRecord(record, -1)
      deleted += 1
      cursor.continue()
    }
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => resolve()
    transaction.onabort = () => resolve()
  })

const deleteOldestRecords = (
  database: IDBDatabase,
  shouldContinue: () => boolean,
  maxDeletes = Number.MAX_SAFE_INTEGER
) =>
  new Promise<{ hasMore: boolean }>(resolve => {
    const transaction = database.transaction(CHAT_CACHE_MESSAGE_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(CHAT_CACHE_MESSAGE_STORE_NAME)
    const request = store.index('byTimestamp').openCursor(null, 'next')
    let deleted = 0
    let hasMore = false

    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) return
      if (!shouldContinue() || deleted >= maxDeletes) {
        hasMore = shouldContinue()
        return
      }

      const record = cursor.value as ChatMessageCacheRecord
      store.delete(cursor.primaryKey)
      updateStatisticsForRecord(record, -1)
      deleted += 1
      cursor.continue()
    }
    transaction.oncomplete = () => resolve({ hasMore })
    transaction.onerror = () => resolve({ hasMore })
    transaction.onabort = () => resolve({ hasMore })
  })

const scheduleCacheCleanup = () => {
  if (scheduledCleanupTimer || typeof window === 'undefined') return

  scheduledCleanupTimer = window.setTimeout(() => {
    scheduledCleanupTimer = null
    void pruneCachedChatMessages()
  }, 0)
}

const enforceCacheLimits = async (
  database: IDBDatabase,
  conversationKey?: string,
  { emergency = false }: { emergency?: boolean } = {}
) => {
  const statistics = await ensureCacheStatistics(database, emergency)
  const expiryResult = await deleteExpiredRecords(database)

  if (conversationKey) {
    const count = statistics.conversationCounts.get(conversationKey) ?? 0
    if (count > CHAT_CACHE_MAX_MESSAGES_PER_CONVERSATION) {
      await deleteOldestConversationRecords(
        database,
        conversationKey,
        count - CHAT_CACHE_CONVERSATION_CLEANUP_TARGET
      )
    }
  } else {
    for (const [key, count] of [...statistics.conversationCounts]) {
      if (count > CHAT_CACHE_MAX_MESSAGES_PER_CONVERSATION) {
        await deleteOldestConversationRecords(
          database,
          key,
          count - CHAT_CACHE_CONVERSATION_CLEANUP_TARGET
        )
      }
    }
  }

  if (statistics.totalCount > CHAT_CACHE_MAX_MESSAGES) {
    await deleteOldestRecords(
      database,
      () => (cacheStatistics?.totalCount ?? 0) > CHAT_CACHE_GLOBAL_CLEANUP_TARGET,
      statistics.totalCount - CHAT_CACHE_GLOBAL_CLEANUP_TARGET
    )
  }

  const byteTarget = emergency
    ? CHAT_CACHE_EMERGENCY_CLEANUP_TARGET
    : CHAT_CACHE_SIZE_CLEANUP_TARGET
  const needsByteCleanup = emergency
    ? statistics.totalBytes > CHAT_CACHE_EMERGENCY_CLEANUP_TARGET
    : statistics.totalBytes > CHAT_CACHE_SIZE_CLEANUP_THRESHOLD
  if (needsByteCleanup) {
    const result = await deleteOldestRecords(
      database,
      () => (cacheStatistics?.totalBytes ?? 0) > byteTarget,
      emergency || statistics.totalBytes > CHAT_CACHE_MAX_BYTES
        ? Number.MAX_SAFE_INTEGER
        : CHAT_CACHE_EXPIRY_CLEANUP_BATCH_SIZE
    )
    if (result.hasMore) scheduleCacheCleanup()
  }

  if (expiryResult.hasMore) scheduleCacheCleanup()
}

const writeCacheRecord = (database: IDBDatabase, record: ChatMessageCacheRecord) =>
  new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(CHAT_CACHE_MESSAGE_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(CHAT_CACHE_MESSAGE_STORE_NAME)
    const existingRequest = store.get(record.key)
    let existingRecord: ChatMessageCacheRecord | undefined

    existingRequest.onsuccess = () => {
      existingRecord = existingRequest.result as ChatMessageCacheRecord | undefined
      store.put(record)
    }
    existingRequest.onerror = () => transaction.abort()
    transaction.oncomplete = () => {
      if (existingRecord) updateStatisticsForRecord(existingRecord, -1)
      updateStatisticsForRecord(record, 1)
      resolve()
    }
    transaction.onerror = () => reject(transaction.error ?? new Error('Failed to write chat cache'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Failed to write chat cache'))
  })

/** 主动运行一次缓存治理；客服页面初始化时调用，并在有剩余过期记录时继续分批执行。 */
export const pruneCachedChatMessages = async () => {
  const database = await openChatCacheDatabase()
  if (!database) return

  try {
    await enforceCacheLimits(database)
  } finally {
    database.close()
  }
}

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
      if (isExpiredCacheRecord(record)) {
        cursor.continue()
        return
      }
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
      resolve(record && !isExpiredCacheRecord(record) ? record.message : null)
    }
    request.onerror = () => resolve(null)
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => database.close()
    transaction.onabort = () => database.close()
  })
}

/** 增量写入或更新单条会话消息，同时执行缓存上限治理。 */
export const saveCachedChatMessage = async (
  conversationKey: string,
  message: ChatMessage,
  { isGuest = getScopeFromConversationKey(conversationKey) === 'guest' }: { isGuest?: boolean } = {}
) => {
  const database = await openChatCacheDatabase()
  if (!database) return

  const record = createMessageCacheRecord(conversationKey, message, isGuest ? 'guest' : 'member')

  try {
    await ensureCacheStatistics(database, writesSinceStatisticsRefresh >= 50)
    await writeCacheRecord(database, record)
    writesSinceStatisticsRefresh += 1
    await enforceCacheLimits(database, conversationKey)
  } catch {
    cacheStatistics = null
    try {
      await enforceCacheLimits(database, conversationKey, { emergency: true })
      await ensureCacheStatistics(database, true)
      await writeCacheRecord(database, record)
      writesSinceStatisticsRefresh += 1
      await enforceCacheLimits(database, conversationKey)
    } catch {
      // 缓存不可用不应影响在线聊天；后续 Socket 或历史接口同步时会再次尝试写入。
    }
  } finally {
    database.close()
  }
}
