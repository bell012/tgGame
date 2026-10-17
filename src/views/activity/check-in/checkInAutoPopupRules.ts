import type { ActivityListItem } from '@/api/interface/activity'
import {
  markPopupShown,
  shouldShowPopup,
  resolvePopupMode,
  popupKey,
  type PopupFrequencyContext
} from '@/utils/popupFrequency'

/** 登录后弹出方式，与首页公告 loginAfterPopWay 一致。 */
export const CHECK_IN_POP_WAY = {
  NONE: 0,
  DAILY: 1,
  EACH_LOGIN: 2,
  /** 高频：每次进入或刷新首页都弹，不写本地次数。 */
  EACH_HOME_VISIT: 4
} as const

export const getCheckInLoginPopWay = (activity: ActivityListItem) =>
  Number(activity.loginAfterPopWay ?? 0)

const optionsFor = (activity: ActivityListItem, context: PopupFrequencyContext) => ({
  ...context,
  key: popupKey('check-in', activity.rowId),
  mode: resolvePopupMode(getCheckInLoginPopWay(activity), 'authenticated')
})

export const shouldShowCheckInAutoPopup = (
  activity: ActivityListItem,
  context: PopupFrequencyContext
) => Boolean(context.memberId) && shouldShowPopup(optionsFor(activity, context))

export const markCheckInAutoPopupShown = (
  activity: ActivityListItem,
  context: PopupFrequencyContext
) => {
  if (context.memberId) markPopupShown(optionsFor(activity, context))
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
