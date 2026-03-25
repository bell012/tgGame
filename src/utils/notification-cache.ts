const NOTIFICATION_READ_IDS_KEY = 'notificationReadIds'
const NOTIFICATION_DELETED_IDS_KEY = 'notificationDeletedIds'

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

/**
 * 获取缓存中的已读通知 ID 集合。
 */
export const getReadNotificationIds = () => {
  return getIds(NOTIFICATION_READ_IDS_KEY)
}

/**
 * 获取缓存中的已删除通知 ID 集合。
 */
export const getDeletedNotificationIds = () => {
  return getIds(NOTIFICATION_DELETED_IDS_KEY)
}

/**
 * 标记单条通知为已读。
 */
export const markNotificationAsRead = (rowId: number) => {
  addIds(NOTIFICATION_READ_IDS_KEY, [rowId])
}

/**
 * 批量标记通知为已读。
 */
export const markNotificationsAsRead = (rowIds: number[]) => {
  addIds(NOTIFICATION_READ_IDS_KEY, rowIds)
}

/**
 * 标记单条通知为已删除。
 */
export const markNotificationAsDeleted = (rowId: number) => {
  addIds(NOTIFICATION_DELETED_IDS_KEY, [rowId])
}

/**
 * 清空所有通知状态缓存。
 */
export const clearNotificationStateCache = () => {
  localStorage.removeItem(NOTIFICATION_READ_IDS_KEY)
  localStorage.removeItem(NOTIFICATION_DELETED_IDS_KEY)
}
