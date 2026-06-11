import { defineStore } from 'pinia'
import { ref } from 'vue'
import Api from '@/api'
import type { ActivityGroupItem, ActivityListItem } from '@/api/interface/activity'
import { toPromotionGroupIconUrl } from '@/views/activity/promotions/shared'

/** 侧栏菜单只展示前 3 个分组 */
export const PROMOTIONS_MENU_GROUP_LIMIT = 3

const sortActivityGroups = (list: ActivityGroupItem[]) => {
  const enabled: ActivityGroupItem[] = []

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    // enable: 0-禁用，1-启用；legacyGroup: true 为旧版分组
    if (item.enable === 0) {
      continue
    }
    if (item.legacyGroup === true) {
      continue
    }
    enabled.push(item)
  }

  enabled.sort((a, b) => Number(a.sortNo ?? 0) - Number(b.sortNo ?? 0))
  return enabled
}

const normalizeActivityGroup = (group: ActivityGroupItem): ActivityGroupItem => {
  const defaultIcon = toPromotionGroupIconUrl(group.defaultIcon)
  const activeIcon = toPromotionGroupIconUrl(group.activeIcon)

  return {
    ...group,
    ...(defaultIcon ? { defaultIcon } : {}),
    ...(activeIcon ? { activeIcon } : {})
  }
}

export const usePromotionsStore = defineStore('promotions', () => {
  const groups = ref<ActivityGroupItem[]>([])
  const groupsLoaded = ref(false)
  const groupsLoading = ref(false)

  /** 列表行缓存，详情页用 rowId 取 */
  const activityById = ref<Record<string, ActivityListItem>>({})

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
      groups.value = sortActivityGroups(response.result?.records ?? []).map(normalizeActivityGroup)
      groupsLoaded.value = true
    } catch {
      groups.value = []
      groupsLoaded.value = false
    } finally {
      groupsLoading.value = false
    }

    return groups.value
  }

  const saveActivityItem = (item: ActivityListItem) => {
    if (!item.rowId) {
      return
    }
    activityById.value[String(item.rowId)] = item
  }

  const getActivityItem = (activityId: string | number) => {
    return activityById.value[String(activityId)]
  }

  const getDefaultGroupCode = () => {
    return groups.value[0]?.groupCode || ''
  }

  const getMenuGroups = () => {
    return groups.value.slice(0, PROMOTIONS_MENU_GROUP_LIMIT)
  }

  return {
    groups,
    groupsLoaded,
    groupsLoading,
    activityById,
    loadGroups,
    saveActivityItem,
    getActivityItem,
    getDefaultGroupCode,
    getMenuGroups
  }
})
