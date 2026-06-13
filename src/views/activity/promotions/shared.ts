import type {
  ActivityGroupItem,
  ActivityLanguageTextItem,
  ActivityListItem,
  CheckInActivityCurrencyConfig
} from '@/api/interface/activity'
import { getCurrentLocale } from '@/utils/router'
import {
  getCurrentCurrency,
  getLanguageCode,
  stripLocalePrefix,
  withLocalePrefix
} from '@/utils/locale'

/** 活动分组图标转图片 URL（支持绝对地址或相对路径拼接 CDN 基址） */
export const toPromotionGroupIconUrl = (value?: string) => {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue
  }

  const baseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
  const imagePath = normalizedValue.replace(/^\/+/, '')

  return baseUrl ? `${baseUrl}/${imagePath}` : normalizedValue
}

/** 活动列表/详情封面图，与分组 tab 图标同一套 CDN 前缀规则 */
export const toPromotionImageUrl = (value?: string) => toPromotionGroupIconUrl(value)

/** 从地址栏解析优惠中心路径（兼容语言前缀；H5 tab replaceState 后以地址栏为准） */
export const parsePromotionsPath = (path = window.location.pathname) => {
  const normalizedPath = stripLocalePrefix(path)
  const match = normalizedPath.match(/^\/promotions(?:\/([^/]+))?(?:\/([^/]+))?$/)

  return {
    groupCode: match?.[1] || '',
    activityId: match?.[2] || ''
  }
}

/** H5 切换分组 tab：只改地址栏，不触发 vue-router，避免 MainLayout 滑动叠层 */
export const replacePromotionsListUrl = (groupCode: string) => {
  const normalizedGroupCode = String(groupCode || '').trim()
  if (!normalizedGroupCode) {
    return
  }

  const fullPath = withLocalePrefix(`/promotions/${normalizedGroupCode}`, getCurrentLocale())
  window.history.replaceState(window.history.state, '', fullPath)
}

/** 从 store 缓存或当前列表里取活动详情数据 */
export const resolveActivityById = (
  id: string,
  list: ActivityListItem[],
  getFromStore: (activityId: string | number) => ActivityListItem | undefined,
  saveToStore?: (item: ActivityListItem) => void
) => {
  if (!id) {
    return null
  }

  const cached = getFromStore(id)
  if (cached) {
    return cached
  }

  const fromList = list.find(item => String(item.rowId) === id)
  if (fromList) {
    saveToStore?.(fromList)
    return fromList
  }

  return null
}

/** H5 横向分组 Tab（Figma：高 36、圆角 18、px-4 py-2；选中实心绿底，未选中 bg-2） */
export const getPromotionGroupMobileTabClass = (isActive: boolean) => {
  const base =
    'box-border flex h-9 shrink-0 items-center gap-1.5 rounded-[18px] px-4 py-2 transition-colors'

  if (isActive) {
    return `${base} bg-theme-primary`
  }

  return `${base} bg-bg-2`
}

export const getPromotionGroupMobileTabTextClass = (isActive: boolean) => {
  return isActive ? 'text-xs font-[700] text-text-4' : 'text-xs font-[500] text-text-2'
}

/** PC 左侧分组 Tab（Figma：高 48、圆角 8、选中实心绿底黑字） */
export const getPromotionGroupDesktopTabClass = (isActive: boolean) => {
  const base = 'flex h-12 items-center gap-4 rounded-lg px-4 cursor-pointer transition-colors'

  if (isActive) {
    return `${base} bg-theme-primary font-bold text-text-4`
  }

  return `${base} font-normal text-text-2`
}

/** 路由 / 列表请求用的分组标识：/activity/api/list 的 groupCode 传 rowId */
export const getPromotionGroupRouteKey = (group: ActivityGroupItem) =>
  group.rowId != null ? String(group.rowId) : ''

export const findPromotionGroupByRouteKey = (groups: ActivityGroupItem[], routeKey: string) => {
  const key = String(routeKey ?? '').trim()
  if (!key) {
    return undefined
  }

  return (
    groups.find(group => getPromotionGroupRouteKey(group) === key) ??
    groups.find(group => String(group.groupCode ?? '') === key)
  )
}

/** /activity/api/list 请求体 groupCode 取分组 rowId */
export const resolveActivityListGroupCode = (groups: ActivityGroupItem[], routeKey: string) => {
  const group = findPromotionGroupByRouteKey(groups, routeKey)
  return group?.rowId != null ? String(group.rowId) : ''
}

export const isPromotionGroupActive = (group: ActivityGroupItem, routeKey?: string) =>
  Boolean(routeKey && getPromotionGroupRouteKey(group) === routeKey)

/** 分组侧栏/菜单图标：选中态优先 activeIcon，否则 defaultIcon */
export const getPromotionGroupIcon = (group: ActivityGroupItem, activeRouteKey?: string) => {
  const isActive = isPromotionGroupActive(group, activeRouteKey)

  if (isActive && group.activeIcon) {
    return toPromotionGroupIconUrl(group.activeIcon)
  }

  return toPromotionGroupIconUrl(group.defaultIcon)
}

/** 从多语言数组里取当前语言文案（zh / eng，与请求头 languageCode 一致） */
export const getLanguageName = (items?: ActivityLanguageTextItem[]) => {
  if (!items || items.length === 0) {
    return ''
  }

  const languageCode = getLanguageCode()
  const matched = items.find(item => item.languageCode === languageCode && item.name)
  return matched?.name || items[0]?.name || ''
}

/** 活动列表按 sortNo 升序，置顶优先 */
export const sortActivityList = (list: ActivityListItem[]) => {
  const copied = list.slice()

  copied.sort((a, b) => {
    const topA = Number(a.isTop ?? 0)
    const topB = Number(b.isTop ?? 0)
    if (topA !== topB) {
      return topB - topA
    }
    return Number(a.sortNo ?? 0) - Number(b.sortNo ?? 0)
  })

  return copied
}

export const getActivityTitle = (item: ActivityListItem) => {
  const fromList = getLanguageName(item.activityName)
  if (fromList) {
    return fromList
  }
  return item.activiName || ''
}

export const getActivityDescription = (item: ActivityListItem) => {
  return getLanguageName(item.activityDesc)
}

const normalizePromotionCurrencyCode = (value?: string) =>
  String(value ?? getCurrentCurrency())
    .trim()
    .toUpperCase()

/** 活动详情 config：优先当前币种，其次 currencyList，再兜底首个 config key */
export const resolvePromotionActivityConfig = (
  activity?: ActivityListItem,
  currencyCode?: string
): CheckInActivityCurrencyConfig | undefined => {
  const configMap = activity?.config
  if (!configMap) {
    return undefined
  }

  const normalizedCurrencyCode = normalizePromotionCurrencyCode(currencyCode)

  if (normalizedCurrencyCode && configMap[normalizedCurrencyCode]) {
    return configMap[normalizedCurrencyCode]
  }

  const firstConfigCurrency = activity?.currencyList?.[0]
  if (firstConfigCurrency && configMap[firstConfigCurrency]) {
    return configMap[firstConfigCurrency]
  }

  const firstConfigEntry = Object.entries(configMap).find(([, config]) => Boolean(config))
  return firstConfigEntry?.[1]
}

/** 活动详情富文本：config[当前币种].ruleDesc */
export const getActivityRuleDesc = (item: ActivityListItem, currencyCode?: string) => {
  const ruleDesc = resolvePromotionActivityConfig(item, currencyCode)?.ruleDesc
  return String(ruleDesc ?? '').trim()
}

/** jumpType: 2-外链直接打开，其余统一进详情页 */
export const shouldOpenDetailPage = (item: ActivityListItem) => {
  return item.jumpType !== 2
}

export const getExternalJumpUrl = (item: ActivityListItem) => {
  const url = item.jumpConfig?.url
  if (!url) {
    return ''
  }
  return url
}

/** 外链或弹窗式打开 */
export const openActivityExternalJump = (item: ActivityListItem) => {
  const url = getExternalJumpUrl(item)
  if (!url) {
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
