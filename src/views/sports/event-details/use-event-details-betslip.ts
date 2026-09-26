import { computed, onMounted, type Ref } from 'vue'
import type { SportCompetitionGroup } from '@/api/interface/sport'
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

  const betSlip = useBetSlip({ getMatch, getTeamLogoUrl })

  const pickOdds = (payload: OddsSelectPayload) => {
    const matchId = currentMatchId.value
    if (!matchId) {
      return
    }
    betSlip.selectOdds(matchId, payload)
  }

  const openBetSlip = () => {
    betSlip.betSlipOpen.value = true
    void betSlip.refreshBalance()
  }

  onMounted(() => {
    void betSlip.refreshBalance()
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
