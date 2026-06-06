import Api from '@/api'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import type { ActivityListItem, QueryCheckInStatusResult } from '@/api/interface/activity'
import { createCheckInViewData, resolveCheckInActivityDesc, type CheckInViewData } from './shared'

// 加载签到活动时的筛选上下文。
export interface LoadActiveCheckInOptions {
  channelId?: string
  currencyCode?: string
  languageCode?: string
  requireAutoPopup?: boolean
  excludeTodaySigned?: boolean
  isLoggedIn?: boolean
}

// 当前命中的签到活动、签到状态和页面视图数据。
export interface ActiveCheckInData {
  activity: ActivityListItem
  status: QueryCheckInStatusResult
  viewData: CheckInViewData
}

// 活动类型枚举：5 表示签到活动。
const CHECK_IN_ACTIVITY_TYPE = 5

// 活动状态枚举：1 未开始，2 进行中；这两种状态都允许展示弹窗内容。
const CHECK_IN_VISIBLE_ACTIVITY_STATUSES = [1, 2]

// 首页展示开关枚举：1 表示允许首页展示/弹出。
const HOME_DISPLAY_ENABLED = 1

// 将后端的字符串数组字段解析成可比较的数组。
const parseStringArrayField = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).filter(Boolean)
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return []
  }

  try {
    const parsedValue = JSON.parse(value) as unknown
    return Array.isArray(parsedValue) ? parsedValue.map(item => String(item)).filter(Boolean) : []
  } catch {
    return []
  }
}

// 判断活动是否处于可用时间范围。
const isActivityInRange = (activity: ActivityListItem) => {
  const now = Date.now()
  const endDate = Number(activity.endDate ?? 0)

  if (Number.isFinite(endDate) && endDate > 0 && now > endDate) {
    return false
  }

  return true
}

// 判断当前端是否命中活动渠道配置，空渠道配置视为不限制。
const isActivityChannelMatched = (activity: ActivityListItem, channelId?: string) => {
  const channels = parseStringArrayField(activity.channel)

  if (channels.length === 0 || !channelId) {
    return true
  }

  return channels.includes(String(channelId))
}

// 根据登录态读取活动配置中的弹出方式。
const getCheckInPopWay = (activity: ActivityListItem, isLoggedIn?: boolean) => {
  return Number(isLoggedIn ? activity.loginAfterPopWay : (activity.loginBeforePopWay ?? 0))
}

// 自动弹窗只关心是否允许弹，关闭弹窗不写入本地禁用状态。
const canAutoPopupActivity = (activity: ActivityListItem, isLoggedIn?: boolean) => {
  if (Number(activity.homeDisplay) !== HOME_DISPLAY_ENABLED) {
    return false
  }

  return getCheckInPopWay(activity, isLoggedIn) > 0
}

// 判断活动是否存在当前语言的活动简介。
const isActivityLanguageMatched = (activity: ActivityListItem, languageCode?: string) => {
  if (!languageCode) {
    return true
  }

  return Boolean(resolveCheckInActivityDesc(activity, languageCode))
}

// 筛选当前可用的签到活动，并按照 sortNo 从小到大排序。
export const selectActiveCheckInActivities = (
  records: ActivityListItem[],
  options: LoadActiveCheckInOptions = {}
) => {
  return records
    .filter(activity => {
      if (Number(activity.type) !== CHECK_IN_ACTIVITY_TYPE) return false
      if (!CHECK_IN_VISIBLE_ACTIVITY_STATUSES.includes(Number(activity.status))) return false
      if (activity.ended === true) return false
      if (!activity.rowId) return false
      if (!isActivityInRange(activity)) return false
      if (!isActivityChannelMatched(activity, options.channelId)) return false
      if (!isActivityLanguageMatched(activity, options.languageCode)) return false
      if (options.requireAutoPopup && !canAutoPopupActivity(activity, options.isLoggedIn)) {
        return false
      }

      return true
    })
    .sort((first, second) => {
      const firstSortNo = Number(first.sortNo ?? Number.MAX_SAFE_INTEGER)
      const secondSortNo = Number(second.sortNo ?? Number.MAX_SAFE_INTEGER)

      return firstSortNo - secondSortNo
    })
}

// 筛选排序后的第一个可用签到活动，保留给单活动调用场景。
export const selectActiveCheckInActivity = (
  records: ActivityListItem[],
  options: LoadActiveCheckInOptions = {}
) => {
  return selectActiveCheckInActivities(records, options)[0]
}

// 查询指定签到活动的会员签到状态，并转换成页面视图数据。
export const loadCheckInActivityData = async (
  activity: ActivityListItem,
  options: LoadActiveCheckInOptions = {}
): Promise<ActiveCheckInData | null> => {
  if (!activity?.rowId) {
    return null
  }

  const checkInStatusResponse = ensureApiBusinessSuccess(
    await Api.activity.queryCheckInStatus({
      activityId: activity.rowId
    })
  )
  const status = checkInStatusResponse.result

  if (!status || (options.excludeTodaySigned && status.todayIsSign)) {
    return null
  }

  return {
    activity,
    status,
    viewData: createCheckInViewData(activity, status, {
      currencyCode: options.currencyCode,
      languageCode: options.languageCode
    })
  }
}

// 拉取所有当前可用签到活动，并按 sortNo 顺序转换成签到页面队列。
export const loadActiveCheckInDataList = async (
  options: LoadActiveCheckInOptions = {}
): Promise<ActiveCheckInData[]> => {
  const activityListResponse = ensureApiBusinessSuccess(
    await Api.activity.queryActivityList({
      size: 100,
      current: 1,
      type: 5
    })
  )
  const records = activityListResponse.result?.records ?? []
  const activities = selectActiveCheckInActivities(records, options)
  const activityDataList = await Promise.all(
    activities.map(activity => loadCheckInActivityData(activity, options))
  )

  return activityDataList.filter((item): item is ActiveCheckInData => Boolean(item))
}

// 拉取排序后的第一个当前可用签到活动，保留给单活动调用场景。
export const loadActiveCheckInData = async (
  options: LoadActiveCheckInOptions = {}
): Promise<ActiveCheckInData | null> => {
  return (await loadActiveCheckInDataList(options))[0] ?? null
}
