import { computed, onMounted, onScopeDispose, type Ref } from 'vue'
import type { SportCompetitionGroup } from '@/api/interface/sport'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useBetSlip } from '../components/bet-slip/useBetSlip'
import type { OddsSelectPayload } from '../components/match-odds/types'
import { getTeamLogoUrl } from '../index'
import type { SportsPageState } from '../index'
import { mapSportsMatches } from '../shared/match'

export function useEventDetailsBetSlip(deps: {
  groups: Ref<SportCompetitionGroup[]>
  selectedSportId: Ref<number>
  activeMatchId: Ref<string>
}) {
  const matches = computed(() =>
    mapSportsMatches(deps.groups.value, deps.selectedSportId.value, getTeamLogoUrl)
  )

  const currentMatch = computed(() => {
    const sportId = deps.selectedSportId.value
    const activeId = deps.activeMatchId.value
    const list = matches.value
    if (!list.length) {
      return undefined
    }
    if (activeId) {
      return (
        list.find(item => item.id === `${sportId}:${activeId}`) ??
        list.find(item => String(item.EventId) === activeId) ??
        list[0]
      )
    }
    return list[0]
  })

  const currentMatchId = computed(() => currentMatch.value?.id ?? '')

  const getMatch = (id: string) => matches.value.find(item => item.id === id)

  const { isLoggedIn } = useRequireLoginAction()
  const siteConfigStore = useSiteConfigStore()
  const betSlip = useBetSlip({ getMatch, getTeamLogoUrl })
  let disposed = false
  onScopeDispose(() => {
    disposed = true
  })

  const refreshBalanceWhenLoggedIn = () => {
    if (!isLoggedIn.value) {
      return
    }
    void betSlip.refreshBalance()
  }

  const pickOdds = (payload: OddsSelectPayload) => {
    const matchId = currentMatchId.value
    if (!matchId) {
      return
    }
    betSlip.selectOdds(matchId, payload)
  }

  const openBetSlip = () => {
    betSlip.betSlipOpen.value = true
    refreshBalanceWhenLoggedIn()
  }

  onMounted(async () => {
    await siteConfigStore.initSiteConfig()
    if (!disposed) refreshBalanceWhenLoggedIn()
  })

  const page = betSlip as unknown as SportsPageState

  const cartCount = computed(() => betSlip.selections.value.length)

  return {
    page,
    ...betSlip,
    currentMatch,
    currentMatchId,
    pickOdds,
    openBetSlip,
    cartCount
  }
}

export type EventDetailsBetSlipState = ReturnType<typeof useEventDetailsBetSlip>
