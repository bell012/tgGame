import type {
  ActivityGroupItem,
  ActivityLanguageTextItem,
  ActivityListItem
} from '@/api/interface/activity'
import i18n from '@/i18n'
import { getCurrentLocale } from '@/utils/router'
import { getStorageLanguageCode, withLocalePrefix } from '@/utils/locale'

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

/** H5 切换分组时只改地址栏，不触发 vue-router，避免 MainLayout 滑动叠层 */
export const replacePromotionsListUrl = (groupCode: string) => {
  const normalizedGroupCode = String(groupCode || '').trim()
  if (!normalizedGroupCode) {
    return
  }

  const fullPath = withLocalePrefix(`/promotions/${normalizedGroupCode}`, getCurrentLocale())
  window.history.replaceState(window.history.state, '', fullPath)
}

/** H5 横向分组 Tab（Figma：高 36、圆角 18、选中绿边 + 15% 绿底） */
export const getPromotionGroupMobileTabClass = (isActive: boolean) => {
  const base =
    'box-border flex h-9 shrink-0 items-center gap-1.5 rounded-[18px] px-4 py-2 transition-colors'

  if (isActive) {
    return `${base} border border-solid border-theme-primary bg-theme-3`
  }

  return `${base} border border-transparent bg-bg-2`
}

export const getPromotionGroupMobileTabTextClass = (isActive: boolean) => {
  return isActive ? 'text-xs font-[700] text-text-1' : 'text-xs font-[500] text-text-2'
}

/** PC 左侧分组 Tab（Figma：高 48、圆角 8、选中实心绿底黑字） */
export const getPromotionGroupDesktopTabClass = (isActive: boolean) => {
  const base = 'flex h-12 items-center gap-4 rounded-lg px-4 cursor-pointer transition-colors'

  if (isActive) {
    return `${base} bg-theme-primary font-bold text-text-4`
  }

  return `${base} font-normal text-text-2`
}

/** 分组侧栏/菜单图标：选中态优先 activeIcon，否则 defaultIcon */
export const getPromotionGroupIcon = (group: ActivityGroupItem, activeGroupCode?: string) => {
  const isActive = Boolean(activeGroupCode && activeGroupCode === group.groupCode)

  if (isActive && group.activeIcon) {
    return toPromotionGroupIconUrl(group.activeIcon)
  }

  return toPromotionGroupIconUrl(group.defaultIcon)
}

/** 从多语言数组里取当前语言文案 */
export const getLanguageName = (items?: ActivityLanguageTextItem[]) => {
  if (!items || items.length === 0) {
    return ''
  }

  const locale = getStorageLanguageCode(String(i18n.global.locale.value))

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.languageCode === locale && item.name) {
      return item.name
    }
  }

  if (locale === 'zh') {
    for (let i = 0; i < items.length; i++) {
      const code = items[i].languageCode || ''
      if (code === 'zh' || code.startsWith('zh-')) {
        if (items[i].name) {
          return items[i].name
        }
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    const code = items[i].languageCode || ''
    if (code.startsWith('en') && items[i].name) {
      return items[i].name
    }
  }

  return items[0].name || ''
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
