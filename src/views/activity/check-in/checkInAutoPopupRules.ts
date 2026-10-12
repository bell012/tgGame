import type { ActivityListItem } from '@/api/interface/activity'
import { getTodayKey } from '@/utils/date'

/** 登录后弹出方式，与首页公告 loginAfterPopWay 一致。 */
export const CHECK_IN_POP_WAY = {
  NONE: 0,
  DAILY: 1,
  EACH_LOGIN: 2,
  ONCE: 3,
  EACH_HOME_VISIT: 4
} as const

const STORAGE_PREFIX = 'checkInAutoPopup'

const activityIdOf = (activity: ActivityListItem) => {
  const id = Number(activity.rowId ?? 0)
  return Number.isFinite(id) && id > 0 ? String(id) : ''
}

const storageKey = (kind: 'daily' | 'login' | 'once', memberId: string, activityId: string) =>
  `${STORAGE_PREFIX}:${kind}:${memberId}:${activityId}`

export const getCheckInLoginPopWay = (activity: ActivityListItem) =>
  Number(activity.loginAfterPopWay ?? 0)

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 本地存储不可用时本次仍可弹出，下次进入首页会再判断。
  }
}

/** 按 loginAfterPopWay 判断这次首页访问是否还应该自动弹出。 */
export const shouldShowCheckInAutoPopup = (
  activity: ActivityListItem,
  memberId: string,
  loginToken: string
) => {
  const activityId = activityIdOf(activity)
  if (!memberId || !activityId) {
    return false
  }

  switch (getCheckInLoginPopWay(activity)) {
    case CHECK_IN_POP_WAY.EACH_HOME_VISIT:
      return true
    case CHECK_IN_POP_WAY.DAILY:
      return readStorage(storageKey('daily', memberId, activityId)) !== getTodayKey()
    case CHECK_IN_POP_WAY.EACH_LOGIN:
      return (
        Boolean(loginToken) && readStorage(storageKey('login', memberId, activityId)) !== loginToken
      )
    case CHECK_IN_POP_WAY.ONCE:
      return readStorage(storageKey('once', memberId, activityId)) !== '1'
    default:
      return false
  }
}

/** 弹窗真正打开后写入次数记录。每次进入首页不写持久记录。 */
export const markCheckInAutoPopupShown = (
  activity: ActivityListItem,
  memberId: string,
  loginToken: string
) => {
  const activityId = activityIdOf(activity)
  if (!memberId || !activityId) {
    return
  }

  switch (getCheckInLoginPopWay(activity)) {
    case CHECK_IN_POP_WAY.DAILY:
      writeStorage(storageKey('daily', memberId, activityId), getTodayKey())
      return
    case CHECK_IN_POP_WAY.EACH_LOGIN:
      if (loginToken) {
        writeStorage(storageKey('login', memberId, activityId), loginToken)
      }
      return
    case CHECK_IN_POP_WAY.ONCE:
      writeStorage(storageKey('once', memberId, activityId), '1')
      return
    default:
  }
}

let openedActivityIds: number[] | null = null

/** 本次决定弹出的活动。弹窗内容按这份名单展示，避免写入记录后被次数规则滤掉。 */
export const setOpenedCheckInActivityIds = (ids: number[]) => {
  openedActivityIds = ids
}

export const filterOpenedCheckInActivities = <T extends { activity: ActivityListItem }>(
  queue: T[]
) => {
  if (!openedActivityIds) {
    return queue
  }

  const allowed = new Set(openedActivityIds)
  return queue.filter(item => allowed.has(Number(item.activity.rowId ?? 0)))
}
