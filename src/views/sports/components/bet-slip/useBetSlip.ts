import { computed, onScopeDispose, ref, watch } from 'vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useSportsStore } from '@/stores/sports'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import type { OddsSelectPayload } from '../match-odds/types'
import type {
  SportsMatch,
  SportsBetMode,
  SportsBetSelection,
  SportsParlay
} from '../../shared/types'
import { mapSportsMatches } from '../../shared/match'
import {
  MOCK_BALANCE,
  MAX_SELECTIONS,
  NOTICE_MESSAGES,
  parseSportsStake,
  moneyRound,
  getSportsCombinations
} from './shared'
import type { NoticeKey } from './shared'

type SelectedOutcome = {
  id: string
  matchId: string
  MarketlineId: number
  WagerSelectionId: number
  odds: number
  stake: string
  sportId: number
  eventId: number
  snapshot: SportsBetSelection
}

type BetSlipOptions = {
  getMatch: (id: string) => SportsMatch | undefined
  getTeamLogoUrl: (id: number) => string
}

export const useBetSlip = ({ getMatch, getTeamLogoUrl }: BetSlipOptions) => {
  const sportsStore = useSportsStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  const betSlipOpen = ref(false)
  const mode = ref<SportsBetMode>('single')
  const outcomes = ref<SelectedOutcome[]>([])
  const parlayStakes = ref<Record<string, string>>({})
  const focusedStakeId = ref('')
  const noticeKey = ref<NoticeKey>('')
  const refreshing = ref(false)
  let refreshTimer: ReturnType<typeof setTimeout> | undefined

  const refreshTargets = computed(() =>
    outcomes.value.map(({ sportId, eventId }) => ({ sportId, eventId }))
  )
  const getSelectedWagerSelectionId = (matchId: string) =>
    outcomes.value.find(outcome => outcome.matchId === matchId)?.WagerSelectionId
  const getOutcomeSnapshot = (outcome: SelectedOutcome): SportsBetSelection => {
    const event = sportsStore.getRefreshEvent(outcome.sportId, outcome.eventId)
    const refreshedMatch = event
      ? mapSportsMatches(
          [{ ...event.Competition, competitionCount: 1, Sports: [event] }],
          outcome.sportId,
          getTeamLogoUrl
        )[0]
      : undefined
    const match = refreshedMatch ?? getMatch(outcome.matchId)
    const line = match?.MarketLines.find(item => item.MarketlineId === outcome.MarketlineId)
    const selection = line?.WagerSelections.find(
      item => item.WagerSelectionId === outcome.WagerSelectionId
    )
    if (!match) return outcome.snapshot
    if (!line || !selection) return { ...outcome.snapshot, mockBetStatus: 'closed' }
    const odds = Number.isFinite(selection.Odds) ? selection.Odds : outcome.snapshot.odds
    return {
      id: outcome.id,
      matchId: outcome.matchId,
      odds,
      trend:
        odds === outcome.snapshot.odds
          ? outcome.snapshot.trend
          : odds > outcome.snapshot.odds
            ? 'up'
            : 'down',
      stake: outcome.stake,
      selection: [
        selection.SelectionName,
        line.BetTypeId !== 3 && Number.isFinite(selection.Handicap)
          ? String(selection.Handicap)
          : ''
      ]
        .filter(Boolean)
        .join(' '),
      market: line.BetTypeName,
      marketTitle: line.BetTypeName,
      fixture: `${match.HomeTeam} — ${match.AwayTeam}`,
      homeTeam: match.HomeTeam,
      awayTeam: match.AwayTeam,
      league: match.league,
      live: match.live,
      mockBetStatus:
        event?.EventStatusId === 2 || line.MarketlineStatusId === 2 || line.IsLocked === true
          ? 'closed'
          : line.MarketlineStatusId === 1 && line.IsLocked === false
            ? 'open'
            : outcome.snapshot.mockBetStatus
    }
  }
  // 列表切换不删除投注项；新数据只更新展示信息，金额保留。
  watch(
    () => outcomes.value.map(outcome => getOutcomeSnapshot(outcome)),
    snapshots => {
      snapshots.forEach((snapshot, index) => {
        const outcome = outcomes.value[index]
        if (!outcome || JSON.stringify(outcome.snapshot) === JSON.stringify(snapshot)) return
        outcome.snapshot = snapshot
        outcome.odds = snapshot.odds
      })
    }
  )
  const selections = computed<SportsBetSelection[]>(() =>
    outcomes.value.map(outcome => ({ ...outcome.snapshot, stake: outcome.stake }))
  )
  const parlays = computed<SportsParlay[]>(() => {
    const odds = outcomes.value.map(item => item.odds)
    return Array.from({ length: Math.max(0, odds.length - 1) }, (_, index) => {
      const size = index + 2
      const products = getSportsCombinations(odds, size)
      return {
        id: `parlay-${size}`,
        size,
        combinationCount: products.length,
        odds: products.length ? products.reduce((sum, odd) => sum + odd, 0) / products.length : 0,
        stake: parlayStakes.value[`parlay-${size}`] ?? ''
      }
    })
  })
  const activeRows = computed(() =>
    mode.value === 'single'
      ? selections.value.map(item => ({ ...item, combinationCount: 1 }))
      : parlays.value
  )
  const invalidStake = computed(() =>
    activeRows.value.some(item => parseSportsStake(item.stake) === null)
  )
  const totalStake = computed(() =>
    moneyRound(
      activeRows.value.reduce(
        (sum, item) => sum + (parseSportsStake(item.stake) ?? 0) * item.combinationCount,
        0
      )
    )
  )
  const potentialReturn = computed(() =>
    moneyRound(
      activeRows.value.reduce(
        (sum, item) =>
          sum + (parseSportsStake(item.stake) ?? 0) * item.odds * item.combinationCount,
        0
      )
    )
  )
  const canSubmit = computed(
    () =>
      !invalidStake.value &&
      totalStake.value > 0 &&
      totalStake.value <= MOCK_BALANCE &&
      !selections.value.some(item => item.mockBetStatus === 'closed')
  )
  const currencySymbol = computed(() => getCurrencySymbol(currentCurrencyCode.value))
  const formatMoney = (value: number) => getFormattedBalance(value, currentCurrencyCode.value, 2)
  const balanceText = computed(() => formatMoney(MOCK_BALANCE))
  const totalStakeText = computed(() => formatMoney(totalStake.value))
  const potentialReturnText = computed(() => formatMoney(potentialReturn.value))
  const notice = computed(() => {
    if (invalidStake.value)
      return 'Enter a valid non-negative amount with up to two decimal places.'
    if (totalStake.value > MOCK_BALANCE) return 'Total stake exceeds the mock balance.'
    return noticeKey.value ? NOTICE_MESSAGES[noticeKey.value] : ''
  })
  const clearBets = () => {
    clearTimeout(refreshTimer)
    refreshing.value = false
    outcomes.value = []
    parlayStakes.value = {}
    focusedStakeId.value = ''
    mode.value = 'single'
    noticeKey.value = ''
  }
  const setMode = (value: SportsBetMode, allowIncomplete = false) => {
    if (value === 'parlay' && outcomes.value.length < 2 && !allowIncomplete) {
      noticeKey.value = 'needTwoSelections'
      return
    }
    mode.value = value
    focusedStakeId.value =
      value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
    noticeKey.value = ''
  }
  const removeSelection = (id: string) => {
    outcomes.value = outcomes.value.filter(item => item.id !== id)
    parlayStakes.value = {}
    if (outcomes.value.length < 2) mode.value = 'single'
    focusedStakeId.value =
      mode.value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
    noticeKey.value = ''
  }
  // 严格消费盘口组件回传的原始盘口/选项；同赛事只保留一个选项，不触发真实下注。
  const selectOdds = (matchId: string, payload: OddsSelectPayload) => {
    const match = getMatch(matchId)
    const line = (match?.MarketLines ?? []).find(
      item => item.MarketlineId === payload.market.MarketlineId
    )
    const selection = line?.WagerSelections.find(
      item => item.WagerSelectionId === payload.option.WagerSelectionId
    )
    if (!match || !line || !selection) return
    const odds = Number(selection.Odds)
    if (!Number.isFinite(odds)) return
    const id = `${matchId}:${line.MarketlineId}:${selection.WagerSelectionId}`
    const previous = outcomes.value.find(item => item.matchId === matchId)
    if (previous?.id === id) {
      removeSelection(id)
      return
    }
    if (!previous && outcomes.value.length >= MAX_SELECTIONS) {
      noticeKey.value = 'selectionLimit'
      betSlipOpen.value = true
      return
    }
    const snapshot: SportsBetSelection = {
      id,
      matchId,
      odds,
      stake: '',
      selection: [
        selection.SelectionName,
        line.BetTypeId !== 3 && Number.isFinite(selection.Handicap)
          ? String(selection.Handicap)
          : ''
      ]
        .filter(Boolean)
        .join(' '),
      market: line.BetTypeName,
      marketTitle: line.BetTypeName,
      fixture: `${match.HomeTeam} — ${match.AwayTeam}`,
      homeTeam: match.HomeTeam,
      awayTeam: match.AwayTeam,
      league: match.league,
      live: match.live
    }
    const next: SelectedOutcome = {
      id,
      matchId,
      MarketlineId: line.MarketlineId,
      WagerSelectionId: selection.WagerSelectionId,
      odds,
      stake: '',
      sportId: match.sportId,
      eventId: match.EventId,
      snapshot
    }
    outcomes.value = previous
      ? outcomes.value.map(item => (item.matchId === matchId ? next : item))
      : [...outcomes.value, next]
    parlayStakes.value = {}
    focusedStakeId.value = mode.value === 'single' ? id : 'parlay-2'
    betSlipOpen.value = true
    noticeKey.value = ''
  }
  const updateStake = (id: string, value: string) => {
    outcomes.value = outcomes.value.map(item => (item.id === id ? { ...item, stake: value } : item))
    noticeKey.value = ''
  }
  const updateParlayStake = (id: string, value: string) => {
    if (!parlays.value.some(item => item.id === id)) return
    parlayStakes.value = { ...parlayStakes.value, [id]: value }
    noticeKey.value = ''
  }
  const focusStake = (id: string, kind: SportsBetMode) => {
    if (kind === mode.value && activeRows.value.some(row => row.id === id))
      focusedStakeId.value = id
  }
  const maxStake = (id: string, kind: SportsBetMode) => {
    if (kind !== mode.value) return
    const row = activeRows.value.find(item => item.id === id)
    if (!row) return
    const otherStake = activeRows.value.reduce(
      (sum, item) =>
        item.id === id ? sum : sum + (parseSportsStake(item.stake) ?? 0) * item.combinationCount,
      0
    )
    const availableCents = Math.max(0, Math.round((MOCK_BALANCE - otherStake) * 100))
    const value = (Math.floor(availableCents / row.combinationCount) / 100).toFixed(2)
    if (kind === 'single') updateStake(id, value)
    else updateParlayStake(id, value)
    focusStake(id, kind)
  }
  const quickAmount = (amount: number) => {
    if (parseSportsStake(String(amount)) === null) return
    const target =
      activeRows.value.find(item => item.id === focusedStakeId.value) ?? activeRows.value[0]
    if (!target) return
    if (mode.value === 'single') updateStake(target.id, String(amount))
    else updateParlayStake(target.id, String(amount))
    focusedStakeId.value = target.id
  }
  const submitMockBet = () => {
    if (!canSubmit.value) return
    // 本地提交仅清理选择，不扣余额、不创建订单、不请求下注接口。
    clearBets()
    noticeKey.value = 'submitted'
  }
  const refreshBalance = () => {
    if (refreshing.value) return
    refreshing.value = true
    noticeKey.value = ''
    refreshTimer = setTimeout(() => {
      refreshing.value = false
      if (!noticeKey.value) noticeKey.value = 'balanceRefreshed'
    }, 400)
  }
  const showUnsupported = () => {
    noticeKey.value = 'notImplemented'
  }
  watch(currentCurrencyCode, () => {
    clearBets()
    noticeKey.value = 'currencyChanged'
  })

  onScopeDispose(() => clearTimeout(refreshTimer))

  return {
    betSlipOpen,
    mode,
    selections,
    parlays,
    balanceText,
    balance: MOCK_BALANCE,
    totalStake,
    potentialReturn,
    currencySymbol,
    totalStakeText,
    potentialReturnText,
    canSubmit,
    notice,
    refreshing,
    focusedStakeId,
    getSelectedWagerSelectionId,
    selectOdds,
    removeSelection,
    updateStake,
    updateParlayStake,
    focusStake,
    maxStake,
    quickAmount,
    setMode,
    clearBets,
    submitMockBet,
    refreshBalance,
    showUnsupported,
    refreshTargets
  }
}
