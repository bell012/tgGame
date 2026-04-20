const LEGACY_NOTIFICATION_READ_IDS_KEY = 'notificationReadIds'
const LEGACY_NOTIFICATION_DELETED_IDS_KEY = 'notificationDeletedIds'
const NOTIFICATION_READ_IDS_KEY_PREFIX = `${LEGACY_NOTIFICATION_READ_IDS_KEY}:`
const NOTIFICATION_DELETED_IDS_KEY_PREFIX = `${LEGACY_NOTIFICATION_DELETED_IDS_KEY}:`
const ACCT_INFO_STORAGE_KEY = 'acctInfo'

export const NOTIFICATION_CACHE_STORAGE_PREFIXES = [
  NOTIFICATION_READ_IDS_KEY_PREFIX,
  NOTIFICATION_DELETED_IDS_KEY_PREFIX
] as const

/**
 * 将 localStorage 的值解析为有效的正整数 ID 集合。
 */
const parseIds = (rawValue: string | null) => {
  if (!rawValue) {
    return new Set<number>()
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsedValue)) {
      return new Set<number>()
    }

    return new Set(
      parsedValue.map(value => Number(value)).filter(value => Number.isInteger(value) && value > 0)
    )
  } catch (error) {
    console.error('parse notification cache failed', error)
    return new Set<number>()
  }
}

const parseStoredMemberId = (rawValue: string | null) => {
  if (!rawValue) {
    return ''
  }

  try {
    const parsedValue = JSON.parse(rawValue) as { memberId?: unknown }
    return String(parsedValue?.memberId ?? '').trim()
  } catch (error) {
    console.error('parse notification cache memberId failed', error)
    return ''
  }
}

/**
 * 获取当前登录账号的 memberId，缺失时回退为空字符串。
 */
const getCurrentMemberId = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return (
    parseStoredMemberId(window.localStorage.getItem('userInfo')) ||
    parseStoredMemberId(window.localStorage.getItem(ACCT_INFO_STORAGE_KEY))
  )
}

/**
 * 将旧版全局缓存迁移到当前账号维度的缓存键，避免不同账号互相污染。
 */
const resolveScopedStorageKey = (legacyKey: string, scopedKeyPrefix: string) => {
  const memberId = getCurrentMemberId()

  if (!memberId) {
    return legacyKey
  }

  const scopedKey = `${scopedKeyPrefix}${memberId}`
  const scopedValue = localStorage.getItem(scopedKey)

  if (scopedValue) {
    if (localStorage.getItem(legacyKey)) {
      localStorage.removeItem(legacyKey)
    }

    return scopedKey
  }

  const legacyValue = localStorage.getItem(legacyKey)
  if (!legacyValue) {
    return scopedKey
  }

  const legacyIds = parseIds(legacyValue)
  if (legacyIds.size > 0) {
    localStorage.setItem(scopedKey, JSON.stringify([...legacyIds]))
  }
  localStorage.removeItem(legacyKey)

  return scopedKey
}

/**
 * 根据 key 从 localStorage 读取并解析 ID 集合。
 */
const getIds = (key: string) => {
  return parseIds(localStorage.getItem(key))
}

/**
 * 根据 key 将 ID 集合持久化到 localStorage。
 */
const saveIds = (key: string, ids: Set<number>) => {
  localStorage.setItem(key, JSON.stringify([...ids]))
}

/**
 * 将有效 ID 合并到缓存集合并持久化保存。
 */
const addIds = (key: string, rowIds: number[]) => {
  if (rowIds.length === 0) {
    return
  }

  const ids = getIds(key)
  rowIds.forEach(rowId => {
    if (Number.isInteger(rowId) && rowId > 0) {
      ids.add(rowId)
    }
  })

  saveIds(key, ids)
}

const getReadIdsStorageKey = () =>
  resolveScopedStorageKey(LEGACY_NOTIFICATION_READ_IDS_KEY, NOTIFICATION_READ_IDS_KEY_PREFIX)

const getDeletedIdsStorageKey = () =>
  resolveScopedStorageKey(LEGACY_NOTIFICATION_DELETED_IDS_KEY, NOTIFICATION_DELETED_IDS_KEY_PREFIX)

/**
 * 获取缓存中的已读通知 ID 集合。
 */
export const getReadNotificationIds = () => {
  return getIds(getReadIdsStorageKey())
}

/**
 * 获取缓存中的已删除通知 ID 集合。
 */
export const getDeletedNotificationIds = () => {
  return getIds(getDeletedIdsStorageKey())
}

/**
 * 标记单条通知为已读。
 */
export const markNotificationAsRead = (rowId: number) => {
  addIds(getReadIdsStorageKey(), [rowId])
}

/**
 * 批量标记通知为已读。
 */
export const markNotificationsAsRead = (rowIds: number[]) => {
  addIds(getReadIdsStorageKey(), rowIds)
}

/**
 * 标记单条通知为已删除。
 */
export const markNotificationAsDeleted = (rowId: number) => {
  addIds(getDeletedIdsStorageKey(), [rowId])
}

/**
 * 清空所有通知状态缓存。
 */
export const clearNotificationStateCache = () => {
  localStorage.removeItem(getReadIdsStorageKey())
  localStorage.removeItem(getDeletedIdsStorageKey())
  localStorage.removeItem(LEGACY_NOTIFICATION_READ_IDS_KEY)
  localStorage.removeItem(LEGACY_NOTIFICATION_DELETED_IDS_KEY)
}
