import Api from '@/api'
import type { ActivityListItem, QueryCheckInStatusResult } from '@/api/interface/activity'
import { createCheckInViewData, type CheckInViewData } from './shared'

export interface LoadActiveCheckInOptions {
  channelId?: string
  currencyCode?: string
  languageCode?: string
  requireAutoPopup?: boolean
  isLoggedIn?: boolean
}

export interface ActiveCheckInData {
  activity: ActivityListItem
  status: QueryCheckInStatusResult
  viewData: CheckInViewData
}

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
  const startDate = Number(activity.startDate ?? 0)
  const endDate = Number(activity.endDate ?? 0)

  if (Number.isFinite(startDate) && startDate > 0 && now < startDate) {
    return false
  }

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
  return getCheckInPopWay(activity, isLoggedIn) > 0
}

// 筛选当前可用的签到活动。
export const selectActiveCheckInActivity = (
  records: ActivityListItem[],
  options: LoadActiveCheckInOptions = {}
) => {
  return records
    .filter(activity => {
      if (Number(activity.type) !== 5) return false
      if (Number(activity.status) !== 2) return false
      if (activity.ended === true) return false
      if (!activity.rowId) return false
      if (!isActivityInRange(activity)) return false
      if (!isActivityChannelMatched(activity, options.channelId)) return false
      if (options.requireAutoPopup && !canAutoPopupActivity(activity, options.isLoggedIn)) {
        return false
      }

      return true
    })
    .sort((first, second) => {
      const firstSortNo = Number(first.sortNo ?? Number.MAX_SAFE_INTEGER)
      const secondSortNo = Number(second.sortNo ?? Number.MAX_SAFE_INTEGER)

      return firstSortNo - secondSortNo
    })[0]
}

// 拉取当前可用签到活动，并转换成页面视图数据。
export const loadActiveCheckInData = async (
  options: LoadActiveCheckInOptions = {}
): Promise<ActiveCheckInData | null> => {
  const activityListResponse = await Api.activity.queryActivityList({
    size: 100,
    current: 1
  })
  const records = activityListResponse.result?.records ?? []
  const activity = selectActiveCheckInActivity(records, options)

  if (!activity?.rowId) {
    return null
  }

  const checkInStatusResponse = await Api.activity.queryCheckInStatus({
    activityId: activity.rowId
  })
  const status = checkInStatusResponse.result

  if (!status) {
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
