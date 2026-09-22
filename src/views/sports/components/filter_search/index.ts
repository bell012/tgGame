import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useSportsStore } from '@/stores/sports'
import type { FilterTabKey } from '@/stores/sports'

export type { FilterTabKey } from '@/stores/sports'

export type FilterTabItem = {
  key: FilterTabKey
  label: string
  count: number
}

export type FilterTabCounts = Record<FilterTabKey, number>

export type FilterTabChangePayload = {
  key: FilterTabKey
  item: FilterTabItem | undefined
}

export type CollectOnlyPayload = {
  collectOnly: boolean
}

const FILTER_TAB_KEYS: FilterTabKey[] = ['rolling', 'today', 'early', 'parlay']

// 根据接口统计数量和 i18n 文案，构建滚球/今日/早盘/串关四个筛选 tab。
export const buildFilterTabs = (
  counts: FilterTabCounts,
  translate: (key: string) => string
): FilterTabItem[] =>
  FILTER_TAB_KEYS.map(key => ({
    key,
    label: translate(`sports.filterTabs.${key}`),
    count: counts[key]
  }))

// 汇总赛事筛选 tab 数据，供 PC/H5 共用。
export const useFilterTabs = () => {
  const sportsStore = useSportsStore()
  const { currentFilterCounts } = storeToRefs(sportsStore)
  const { t } = useI18n()

  return computed(() => buildFilterTabs(currentFilterCounts.value, t))
}
