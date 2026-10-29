import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSportsStore } from '@/stores/sports'
import { useSportsOddsStore } from '@/stores/sportsOdds'
import { stripLocalePrefix } from '@/utils/locale'
import type { SportsOddsType } from '@/api/interface/sport'

/** 详情以导航来源判定串关场景，不受后台首页的筛选变化影响。 */
export const useSportsOdds = () => {
  const route = useRoute()
  const sports = useSportsStore()
  const odds = useSportsOddsStore()
  const parlayContext = computed(() =>
    stripLocalePrefix(route.path) === '/sports/event-details'
      ? route.query.combo === '1'
      : sports.market === 4
  )
  const oddsType = computed<SportsOddsType>(() => (parlayContext.value ? 3 : odds.preference))
  const disabled = computed(() => parlayContext.value || odds.locked)
  const select = (type: SportsOddsType) => {
    if (!disabled.value) odds.select(type)
  }
  return { oddsType, parlayContext, disabled, select }
}
