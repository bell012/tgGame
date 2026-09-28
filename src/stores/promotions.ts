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
let previousGroups: ActivityGroupItem[] = []
// 语言切换后接口可能给同一业务分组返回不同 rowId，用别名表保留旧 rowId 到新 rowId 的关系。
const groupRouteKeyAliases = new Map<string, string>()

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

const findEquivalentGroup = (
  group: ActivityGroupItem,
  index: number,
  targetGroups: ActivityGroupItem[]
) => {
  // 同一业务分组优先用 groupCode 对齐；接口没给稳定 groupCode 时再用 sortNo 和位置兜底。
  const groupCode = String(group.groupCode ?? '').trim()
  if (groupCode) {
    const matchedGroup = targetGroups.find(
      item => String(item.groupCode ?? '').trim() === groupCode
    )
    if (matchedGroup) {
      return matchedGroup
    }
  }

  const sortNo = String(group.sortNo ?? '').trim()
  if (sortNo) {
    const matchedGroup = targetGroups.find(item => String(item.sortNo ?? '').trim() === sortNo)
    if (matchedGroup) {
      return matchedGroup
    }
  }

  return targetGroups[index]
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

  const applyGroups = (rememberPrevious = false) => {
    if (rememberPrevious) {
      previousGroups = groups.value.slice()
    }
    const nextGroups = buildGroups(sourceGroups, getLanguageCode())

    if (rememberPrevious) {
      // 在替换为新语言列表之前，记录旧分组 rowId 到新分组 rowId 的映射，避免 tab 选中态丢失。
      previousGroups.forEach((group, index) => {
        const previousKey = getPromotionGroupRouteKey(group)
        const nextKey = getPromotionGroupRouteKey(
          findEquivalentGroup(group, index, nextGroups) ?? {}
        )
        if (previousKey && nextKey) {
          groupRouteKeyAliases.set(previousKey, nextKey)
        }
      })
    }

    groups.value = nextGroups
  }

  /** 切换语言后按当前 languageCode 重新筛选分组 */
  const syncGroupsLanguage = () => {
    if (!sourceGroups.length) {
      return
    }
    applyGroups(true)
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

  /** 获取当前语言下可用的分组 routeKey，兼容切语言后 rowId 变化的情况。 */
  const resolveCurrentGroupRouteKey = (routeKey: string | number) => {
    const key = String(routeKey ?? '').trim()
    if (!key) {
      return ''
    }

    const currentGroup = groups.value.find(group => getPromotionGroupRouteKey(group) === key)
    if (currentGroup) {
      return key
    }

    // 优先使用切语言时记录的 rowId 映射，命中后可以直接恢复选中态。
    const aliasedKey = groupRouteKeyAliases.get(key)
    if (aliasedKey && groups.value.some(group => getPromotionGroupRouteKey(group) === aliasedKey)) {
      return aliasedKey
    }

    const previousGroup = previousGroups.find(group => getPromotionGroupRouteKey(group) === key)
    const sourceGroup =
      sourceGroups.find(
        group => getPromotionGroupRouteKey(group) === key || String(group.groupCode ?? '') === key
      ) ?? previousGroup

    const sourceGroupCode = String(sourceGroup?.groupCode ?? '').trim()
    if (sourceGroupCode) {
      const matchedGroup = groups.value.find(
        group => String(group.groupCode ?? '').trim() === sourceGroupCode
      )
      if (matchedGroup) {
        return getPromotionGroupRouteKey(matchedGroup)
      }
    }

    if (!previousGroup) {
      return ''
    }

    const previousSortNo = String(previousGroup.sortNo ?? '').trim()
    if (previousSortNo) {
      const matchedGroup = groups.value.find(
        group => String(group.sortNo ?? '').trim() === previousSortNo
      )
      if (matchedGroup) {
        return getPromotionGroupRouteKey(matchedGroup)
      }
    }

    const previousIndex = previousGroups.findIndex(
      group => getPromotionGroupRouteKey(group) === key
    )
    const matchedGroup = previousIndex >= 0 ? groups.value[previousIndex] : undefined

    return matchedGroup ? getPromotionGroupRouteKey(matchedGroup) : ''
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
    resolveCurrentGroupRouteKey,
    getMenuGroups
  }
})
