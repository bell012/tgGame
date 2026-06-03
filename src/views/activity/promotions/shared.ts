import type { ActivityLanguageTextItem, ActivityListItem } from '@/api/interface/activity'
import i18n from '@/i18n'
import { getStorageLanguageCode } from '@/utils/locale'

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
