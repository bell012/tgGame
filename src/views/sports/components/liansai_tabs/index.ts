import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useSportsStore } from '@/stores/sports'
import type { SportCompetitionGroup, SportsSortType } from '@/api/interface/sport'

export const ALL_LEAGUES_KEY = 'all'

export type LiansaiFilterKey = 'league' | 'time'

export type LiansaiFilterTabItem = {
  key: LiansaiFilterKey
  label: string
}

export type LeagueTabItem = {
  key: string
  id: number | null
  label: string
  count: number
  raw?: SportCompetitionGroup
}

export type LiansaiFilterPayload = {
  key: LiansaiFilterKey
  sortType: SportsSortType
}

export type LeagueSelectionPayload = {
  key: string
  id: number | null
  ids: number[]
  label: string
  item: LeagueTabItem
  isAllSelected: boolean
}

export type LeagueFilterPayload = {
  keys: string[]
  ids: number[]
  items: LeagueTabItem[]
  isAllSelected: boolean
}

const FILTER_TAB_KEYS: LiansaiFilterKey[] = ['league', 'time']

const SORT_TYPE_BY_FILTER_KEY: Record<LiansaiFilterKey, SportsSortType> = {
  league: 1,
  time: 2
}

const FILTER_KEY_BY_SORT_TYPE: Record<SportsSortType, LiansaiFilterKey> = {
  1: 'league',
  2: 'time'
}

// 将接口返回的联赛 ID 统一转换成组件中使用的 key。
const toLeagueKey = (id: number) => String(id)

// 统一处理联赛数量，接口数量异常时回退到赛事列表长度。
const normalizeCount = (group: SportCompetitionGroup) => {
  const count = Number(group.competitionCount)
  return Number.isFinite(count) ? count : (group.Sports?.length ?? 0)
}

// 构建“联赛/时间”切换项，并通过 i18n 获取展示文案。
export const buildLiansaiFilterTabs = (
  translate: (key: string) => string
): LiansaiFilterTabItem[] =>
  FILTER_TAB_KEYS.map(key => ({
    key,
    label: translate(`sports.leagueTabs.filters.${key}`)
  }))

// 根据 getSportsV2 返回的联赛分组构建 PC/H5 共用的联赛列表。
export const buildLeagueTabs = (
  groups: SportCompetitionGroup[],
  translate: (key: string) => string
): LeagueTabItem[] => {
  const tabs = new Map<number, LeagueTabItem>()

  groups.forEach(group => {
    const id = Number(group.CompetitionId)
    if (!Number.isFinite(id)) return

    const existing = tabs.get(id)
    const count = normalizeCount(group)
    if (existing) {
      existing.count += count
      return
    }

    tabs.set(id, {
      key: toLeagueKey(id),
      id,
      label: group.CompetitionName?.trim() || toLeagueKey(id),
      count,
      raw: group
    })
  })

  const leagueItems = [...tabs.values()]
  const totalCount = leagueItems.reduce((total, item) => total + item.count, 0)

  return [
    {
      key: ALL_LEAGUES_KEY,
      id: null,
      label: translate('sports.leagueTabs.allLeagues'),
      count: totalCount
    },
    ...leagueItems
  ]
}

// 汇总联赛 tabs 相关状态与操作，供 PC/H5 组件复用。
export const useLiansaiTabs = () => {
  const sportsStore = useSportsStore()
  const { leagueGroups, sortType, competitionIds } = storeToRefs(sportsStore)
  const { t } = useI18n()

  const filterTabs = computed(() => buildLiansaiFilterTabs(t))
  const leagueTabs = computed(() => buildLeagueTabs(leagueGroups.value, t))
  const leagueFilterItems = computed(() =>
    leagueTabs.value.filter(item => item.key !== ALL_LEAGUES_KEY)
  )
  // 将 store 中的 SortType 转换为当前选中的排序 tab。
  const activeFilterKey = computed<LiansaiFilterKey>({
    get: () => FILTER_KEY_BY_SORT_TYPE[sortType.value] ?? 'league',
    set: key => {
      sortType.value = SORT_TYPE_BY_FILTER_KEY[key]
    }
  })
  // 将 store 中的 CompetitionIds 转换为 PC 单选联赛 key。
  const activeLeagueKey = computed<string>({
    get: () => {
      if (competitionIds.value.length !== 1) return ALL_LEAGUES_KEY
      return toLeagueKey(competitionIds.value[0])
    },
    set: key => {
      competitionIds.value = key === ALL_LEAGUES_KEY ? [] : [Number(key)].filter(Number.isFinite)
    }
  })

  // 按 key 查找联赛项，找不到时回退到“所有联赛”。
  const findLeagueItem = (key: string) =>
    leagueTabs.value.find(item => item.key === key) ?? leagueTabs.value[0]

  // 选择“联赛/时间”排序项，并返回给外层组件可监听的 payload。
  const selectFilterKey = (key: LiansaiFilterKey): LiansaiFilterPayload => {
    activeFilterKey.value = key
    return {
      key,
      sortType: sortType.value
    }
  }

  // 选择 PC 联赛项，并同步 CompetitionIds 与返回当前选择结果。
  const selectLeagueKey = (key: string): LeagueSelectionPayload => {
    const item = findLeagueItem(key)
    activeLeagueKey.value = item.key

    return {
      key: item.key,
      id: item.id,
      ids: item.id === null ? [] : [item.id],
      label: item.label,
      item,
      isAllSelected: item.key === ALL_LEAGUES_KEY
    }
  }

  // 应用 H5 弹窗的多选联赛筛选，并返回已选择的联赛数据。
  const applyLeagueFilter = (keys: string[]): LeagueFilterPayload => {
    const uniqueKeys = Array.from(new Set(keys))
    const selectedItems = uniqueKeys
      .map(key => leagueFilterItems.value.find(item => item.key === key))
      .filter((item): item is LeagueTabItem => Boolean(item))
    const allKeys = leagueFilterItems.value.map(item => item.key)
    const isAllSelected = allKeys.length > 0 && allKeys.every(key => uniqueKeys.includes(key))
    const ids = selectedItems
      .map(item => item.id)
      .filter((id): id is number => typeof id === 'number')

    competitionIds.value = isAllSelected ? [] : ids

    return {
      keys: uniqueKeys,
      ids,
      items: selectedItems,
      isAllSelected
    }
  }

  return {
    filterTabs,
    leagueTabs,
    leagueFilterItems,
    activeFilterKey,
    activeLeagueKey,
    selectFilterKey,
    selectLeagueKey,
    applyLeagueFilter
  }
}
