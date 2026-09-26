import { onMounted, onScopeDispose } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import type { CollectOnlyPayload, FilterTabChangePayload } from './components/filter_search'
import type {
  LeagueFilterPayload,
  LeagueSelectionPayload,
  LiansaiFilterPayload
} from './components/liansai_tabs'
import { sportItems } from './components/sports-navigation/sport-items'
import { useBetSlip } from './components/bet-slip/useBetSlip'
import { useSportsData } from './composables/useSportsData'
import type { SportsMatch } from './shared/types'

export type { SportsMatch, SportsBetMode, SportsBetSelection, SportsParlay } from './shared/types'
export { mapSportsMatches } from './shared/match'
export { parseSportsStake } from './components/bet-slip/shared'

/** 配置已包含队标目录，只追加图片文件名。 */
export const getTeamLogoUrl = (id: string | number | null | undefined): string => {
  if (typeof id === 'number' && !Number.isFinite(id)) return ''

  const teamId = String(id ?? '').trim()
  if (!teamId) return ''

  const siteConfigStore = useSiteConfigStore()
  const baseUrl = siteConfigStore.getConfigString('IM.sport_team_logo').replace(/\/+$/, '')
  if (!baseUrl) return ''

  return `${baseUrl}/${encodeURIComponent(teamId)}.png`
}

export const useSportsPage = () => {
  const sportsStore = useSportsStore()
  const { requireLogin } = useRequireLoginAction()
  const { t } = useI18n()
  const { refreshTargets, ...betSlip } = useBetSlip({
    getMatch: (id): SportsMatch | undefined => data.matchById.value.get(id),
    getTeamLogoUrl
  })
  const data = useSportsData({
    getTeamLogoUrl,
    getBetTargets: () => refreshTargets.value
  })
  const { matchById, isPageActive, ...pageData } = data
  const {
    selectedSportId,
    selectedFilterKey,
    sortType,
    competitionIds,
    collectOnly,
    matches,
    expandedMatchId
  } = data
  const { betSlipOpen } = betSlip

  const isMatchFavoritePending = (id: string) => {
    const match = matchById.value.get(id)
    return match ? sportsStore.isFavouritePending(match.EventId) : false
  }
  // Store 更新收藏状态，页面处理登录和失败提示。
  const handleMatchFavorite = async (id: string) => {
    if (!requireLogin() || !isPageActive()) return
    const match = matchById.value.get(id)
    if (!match || sportsStore.isFavouritePending(match.EventId)) return
    const result = await sportsStore.toggleFavouriteEvent(match.EventId)
    if (!isPageActive()) return
    if (result === 'login-failed' || result === 'failed' || result === 'auth-expired') {
      globalShowToast({
        type: 'fail',
        message: t(
          result === 'login-failed' ? 'sports.platformLoginFailed' : 'sports.favouriteFailed'
        )
      })
    }
  }
  const setMatchExpanded = (matchId: string, expanded: boolean) => {
    const sourceId = matchId.startsWith('live:') ? matchId.slice(5) : matchId
    if (!matches.value.some(match => match.id === sourceId)) return
    if (expanded) expandedMatchId.value = matchId
    else if (expandedMatchId.value === matchId) expandedMatchId.value = null
  }
  // 投注单打开弹窗，投注历史跳转页面。
  const handleFloatingEntry = (entry: 'history' | 'bet-slip') => {
    if (entry === 'bet-slip') {
      betSlipOpen.value = true
      return
    }
    navigateTo('/sports/bet-history')
  }
  // 组件已更新球种时，不重复赋值。
  const handleSportChange = (_index: number, key: string) => {
    const sport = sportItems.find(item => item.key === key)
    if (sport && selectedSportId.value !== sport.sportId) {
      selectedSportId.value = sport.sportId
    }
  }
  const handleMatchFilterChange = (payload: FilterTabChangePayload) => {
    if (selectedFilterKey.value !== payload.key) selectedFilterKey.value = payload.key
  }
  const handleLeagueSortChange = (payload: LiansaiFilterPayload) => {
    if (sortType.value !== payload.sortType) sortType.value = payload.sortType
  }
  // 全部联赛统一使用空数组；避免 H5 全选的全部 ID 覆盖组件已归一化的值。
  const syncCompetitionIds = (ids: number[], isAllSelected: boolean) => {
    const nextIds = isAllSelected ? [] : ids
    if (
      nextIds.length === competitionIds.value.length &&
      nextIds.every((id, index) => id === competitionIds.value[index])
    ) {
      return
    }
    competitionIds.value = [...nextIds]
  }
  const handleLeagueChange = (payload: LeagueSelectionPayload) => {
    syncCompetitionIds(payload.ids, payload.isAllSelected)
  }
  const handleLeagueFilter = (payload: LeagueFilterPayload) => {
    syncCompetitionIds(payload.ids, payload.isAllSelected)
  }
  // 沿用组件的 collectOnly 事件字段，统一写入 Store 收藏置顶状态，不发起收藏写操作。
  const handleCollectChange = (payload: CollectOnlyPayload) => {
    collectOnly.value = payload.collectOnly
  }
  const closeOnOutside = (event: PointerEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (
      target.closest('[data-sports-match]')?.getAttribute('data-sports-match') !==
      expandedMatchId.value
    ) {
      expandedMatchId.value = null
    }
  }
  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    if (expandedMatchId.value) expandedMatchId.value = null
    else betSlipOpen.value = false
  }

  onMounted(() => {
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
  })
  onScopeDispose(() => {
    document.removeEventListener('pointerdown', closeOnOutside)
    document.removeEventListener('keydown', closeOnEscape)
  })

  return {
    ...pageData,
    ...betSlip,
    handleMatchFavorite,
    isMatchFavoritePending,
    setMatchExpanded,
    handleFloatingEntry,
    handleSportChange,
    handleMatchFilterChange,
    handleLeagueSortChange,
    handleLeagueChange,
    handleLeagueFilter,
    handleCollectChange
  }
}

export type SportsPageState = ReturnType<typeof useSportsPage>
