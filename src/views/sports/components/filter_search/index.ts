import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useSportsStore } from '@/stores/sports'

// 滚球  今日  早盘  串关
export type FilterTabKey = 'rolling' | 'today' | 'early' | 'parlay'

export type FilterTabItem = {
  key: FilterTabKey
  label: string
  count: number
}

export type FilterTabCounts = Record<FilterTabKey, number>

const FILTER_TAB_KEYS: FilterTabKey[] = ['rolling', 'today', 'early', 'parlay']

export const buildFilterTabs = (
  counts: FilterTabCounts,
  translate: (key: string) => string
): FilterTabItem[] =>
  FILTER_TAB_KEYS.map(key => ({
    key,
    label: translate(`sports.filterTabs.${key}`),
    count: counts[key]
  }))

export const useFilterTabs = () => {
  const sportsStore = useSportsStore()
  const { totalFilterCounts } = storeToRefs(sportsStore)
  const { t } = useI18n()

  return computed(() => buildFilterTabs(totalFilterCounts.value, t))
}
