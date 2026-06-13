import { defineStore } from 'pinia'
import { ref } from 'vue'
import Api from '@/api'
import type { ActivityGroupItem, ActivityListItem } from '@/api/interface/activity'
import {
  getPromotionGroupRouteKey,
  toPromotionGroupIconUrl
} from '@/views/activity/promotions/shared'
import { getLanguageCode } from '@/utils/locale'

/** 侧栏菜单只展示前 3 个分组 */
export const PROMOTIONS_MENU_GROUP_LIMIT = 3

let sourceGroups: ActivityGroupItem[] = []

const normalizeActivityGroup = (group: ActivityGroupItem): ActivityGroupItem => {
  const defaultIcon = toPromotionGroupIconUrl(group.defaultIcon)
  const activeIcon = toPromotionGroupIconUrl(group.activeIcon)

  return {
    ...group,
    ...(defaultIcon ? { defaultIcon } : {}),
    ...(activeIcon ? { activeIcon } : {})
  }
}

const buildGroups = (list: ActivityGroupItem[], languageCode: string) => {
  const result: ActivityGroupItem[] = []
  const seenRowIds = new Set<string>()

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item.enable === 0 || item.legacyGroup === true) {
      continue
    }

    const rowId = getPromotionGroupRouteKey(item)
    if (!rowId || seenRowIds.has(rowId)) {
      continue
    }

    const groupName = (item.groupName ?? []).filter(
      entry => entry.languageCode === languageCode && entry.name
    )
    if (!groupName.length) {
      continue
    }

    seenRowIds.add(rowId)
    result.push({ ...item, groupName })
  }

  result.sort((a, b) => Number(a.sortNo ?? 0) - Number(b.sortNo ?? 0))
  return result
}

export const usePromotionsStore = defineStore('promotions', () => {
  const groups = ref<ActivityGroupItem[]>([])
  const groupsLoaded = ref(false)
  const groupsLoading = ref(false)

  /** 列表行缓存，详情页用 rowId 取 */
  const activityById = ref<Record<string, ActivityListItem>>({})

  /** H5 列表当前分组（replaceState 切 tab 后 router params 会滞后，以 store 为准） */
  const h5ListGroupCode = ref('')

  const setH5ListGroupCode = (groupCode: string) => {
    const code = String(groupCode || '').trim()
    if (code) {
      h5ListGroupCode.value = code
    }
  }

  const applyGroups = () => {
    groups.value = buildGroups(sourceGroups, getLanguageCode())
  }

  /** 切换语言后按当前 languageCode 重新筛选分组 */
  const syncGroupsLanguage = () => {
    if (!sourceGroups.length) {
      return
    }
    applyGroups()
  }

  const loadGroups = async (force = false) => {
    if (groupsLoaded.value && !force) {
      return groups.value
    }

    if (groupsLoading.value) {
      return groups.value
    }

    groupsLoading.value = true
    try {
      const response = await Api.activity.queryActivityGroupPage({
        current: 1,
        size: 100
      })
      sourceGroups = (response.result?.records ?? []).map(normalizeActivityGroup)
      applyGroups()
      groupsLoaded.value = true
    } catch {
      sourceGroups = []
      groups.value = []
      groupsLoaded.value = false
    } finally {
      groupsLoading.value = false
    }

    return groups.value
  }

  const saveActivityItem = (item: ActivityListItem) => {
    if (item.rowId == null) {
      return
    }
    activityById.value[String(item.rowId)] = item
  }

  const getActivityItem = (activityId: string | number) => {
    return activityById.value[String(activityId)]
  }

  const getDefaultGroupCode = () => {
    const firstGroup = groups.value[0]
    return firstGroup ? getPromotionGroupRouteKey(firstGroup) : ''
  }

  const getMenuGroups = () => {
    return groups.value.slice(0, PROMOTIONS_MENU_GROUP_LIMIT)
  }

  return {
    groups,
    groupsLoaded,
    groupsLoading,
    activityById,
    h5ListGroupCode,
    loadGroups,
    syncGroupsLanguage,
    setH5ListGroupCode,
    saveActivityItem,
    getActivityItem,
    getDefaultGroupCode,
    getMenuGroups
  }
})
