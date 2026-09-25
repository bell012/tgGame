import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useSportsStore } from '@/stores/sports'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { globalShowToast } from '@/utils/toast'
import type { OddsSelectPayload } from '../match-odds/types'
import type {
  SportsMatch,
  SportsBetMode,
  SportsBetSelection,
  SportsParlay
} from '../../shared/types'
import { mapSportsMatches } from '../../shared/match'
import { MAX_SELECTIONS, NOTICE_MESSAGES, parseSportsStake, moneyRound } from './shared'
import type { NoticeKey } from './shared'
import { useBetInfo } from './useBetInfo'
import type { BetInfoSource } from './useBetInfo'
import { comboLabel } from './bet-info'

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
  source: BetInfoSource
}

type BetSlipOptions = {
  getMatch: (id: string) => SportsMatch | undefined
  getTeamLogoUrl: (id: number) => string
}

export const useBetSlip = ({ getMatch, getTeamLogoUrl }: BetSlipOptions) => {
  const sportsStore = useSportsStore()
  const {
    sportsBalance: balance,
    sportsBalanceLoading: refreshing,
    sportsBalanceError
  } = storeToRefs(sportsStore)
  const { t } = useI18n()
  const { requireLogin } = useRequireLoginAction()
  const { currentCurrencyCode } = useDisplayCurrency()
  const betSlipOpen = ref(false)
  const mode = ref<SportsBetMode>('single')
  const outcomes = ref<SelectedOutcome[]>([])
  const parlayStakes = ref<Record<string, string>>({})
  const focusedStakeId = ref('')
  const noticeKey = ref<NoticeKey>('')
  // 使用加入投注单时的资格；后续以报价接口的状态为准。
  const parlayEligible = computed(() => outcomes.value.every(outcome => outcome.source.openParlay))
  const showParlayUnsupported = () => {
    globalShowToast({ type: 'fail', message: t('sports.betParlayUnsupported') })
  }
  const {
    betInfoLoading,
    betInfoError,
    betInfoState,
    betInfoItemErrors,
    betInfoChangedIds,
    betInfoAvailable,
    betInfoReady,
    betInfoQuotes,
    betInfoTrends,
    betInfoSettings,
    betInfoChanged,
    acceptBetterOdds,
    acceptBetChanges
  } = useBetInfo({
    open: betSlipOpen,
    mode,
    parlayEligible,
    selectionKey: computed(() => outcomes.value.map(outcome => outcome.id).join(',')),
    getSources: () =>
      outcomes.value.map(outcome => {
        const event = sportsStore.getRefreshEvent(outcome.sportId, outcome.eventId)
        const match = event ? undefined : getMatch(outcome.matchId)
        const openParlay = outcome.source.openParlay
        const lines = event?.MarketLines ?? match?.MarketLines
        if (!lines) return { ...outcome.source, openParlay }
        const market = lines.find(line => line.MarketlineId === outcome.MarketlineId)
        const option = market?.WagerSelections.find(
          selection => selection.WagerSelectionId === outcome.WagerSelectionId
        )
        return market && option
          ? {
              sportId: outcome.sportId,
              eventId: outcome.eventId,
              market,
              option,
              openParlay,
              eventMarket: event?.Market ?? match?.Market ?? outcome.source.eventMarket
            }
          : { ...outcome.source, openParlay }
      })
  })

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
    if (!line || !selection) return outcome.snapshot
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
      live: match.live
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
  const getStakeError = (stake: string, min?: number, max?: number) => {
    const amount = parseSportsStake(stake)
    if (amount === null) return t('sports.betAmountInvalid')
    if (!amount) return ''
    if (min === undefined || max === undefined) return t('sports.betInfoIncomplete')
    return amount < min || amount > max
      ? t('sports.betLimit', { min: min.toFixed(2), max: max.toFixed(2) })
      : ''
  }
  const limitText = (min?: number, max?: number) =>
    min === undefined || max === undefined
      ? t('sports.betInfoIncomplete')
      : t('sports.betLimit', { min: min.toFixed(2), max: max.toFixed(2) })
  const selections = computed<SportsBetSelection[]>(() =>
    outcomes.value.map(outcome => {
      const quote = betInfoQuotes.value.find(item => item.rid === outcome.WagerSelectionId)
      const setting =
        mode.value === 'single'
          ? betInfoSettings.value.find(
              item => item.rid === outcome.WagerSelectionId && item.combs === 0
            )
          : undefined
      const parlayUnsupported =
        mode.value === 'parlay' && (!outcome.source.openParlay || quote?.st === 439)
      const itemError = betInfoItemErrors.value[outcome.WagerSelectionId]
      const getStatus = (): NonNullable<SportsBetSelection['betStatus']> => {
        if (parlayUnsupported) return 'unavailable'
        if (betInfoError.value) return 'error'
        if (itemError === 'sports.betMarketClosed') return 'closed'
        if (itemError === 'sports.betInfoIncomplete') return 'incomplete'
        if (itemError) return 'unavailable'
        if (!quote) {
          if (['queued', 'loading'].includes(betInfoState.value)) return 'pending'
          return betInfoState.value === 'idle' ? 'idle' : 'incomplete'
        }
        if (quote.st === 380 && quote.mlsid === 2) return 'closed'
        if (![100, 381].includes(quote.st) || quote.mlsid !== 1) return 'unavailable'
        if (mode.value === 'single' && !setting) return 'incomplete'
        if (betInfoChangedIds.value.includes(outcome.WagerSelectionId)) return 'changed'
        return 'open'
      }
      const status = getStatus()
      const statusMessages = {
        idle: 'sports.betInfoNotRequested',
        pending: betInfoState.value === 'queued' ? 'sports.betInfoQueued' : 'sports.betInfoPending',
        open: '',
        closed: 'sports.betMarketClosed',
        unavailable: parlayUnsupported
          ? 'sports.betParlayUnsupported'
          : 'sports.betInfoSelectionUnavailable',
        incomplete: 'sports.betInfoIncomplete',
        changed: 'sports.betInfoChanged',
        error: betInfoError.value || 'sports.betInfoFailed'
      }
      const statusMessage = statusMessages[status] ? t(statusMessages[status]) : ''
      const odds = quote?.o ?? outcome.odds
      const handicap =
        quote?.dih ?? (quote?.h === null || quote?.h === undefined ? '' : String(quote.h))
      return {
        ...outcome.snapshot,
        stake: outcome.stake,
        odds,
        trend: quote ? betInfoTrends.value[quote.rid] : outcome.snapshot.trend,
        oddsType: quote?.ot ?? outcome.source.option.OddsType,
        selection: quote
          ? [
              outcome.source.option.SelectionName,
              outcome.source.market.BetTypeId === 3 ? '' : handicap
            ]
              .filter(Boolean)
              .join(' ')
          : outcome.snapshot.selection,
        betStatus: status,
        minStake: setting?.misa,
        maxStake: setting?.masa,
        payoutPerUnit: setting?.epa,
        limitText: setting ? limitText(setting.misa, setting.masa) : statusMessage,
        stakeError:
          statusMessage ||
          (mode.value === 'single'
            ? getStakeError(outcome.stake, setting?.misa, setting?.masa)
            : '')
      }
    })
  )
  const parlays = computed<SportsParlay[]>(() => {
    if (mode.value !== 'parlay') return []
    return betInfoSettings.value
      .filter(item => item.combs !== 0 && item.noc > 0)
      .map(item => {
        const id = `parlay-${item.combs}`
        const stake = parlayStakes.value[id] ?? ''
        return {
          id,
          size: item.combs >= 9 && item.combs <= 17 ? item.combs - 7 : outcomes.value.length,
          label: comboLabel(item.combs, outcomes.value.length),
          comboSelection: item.combs,
          combinationCount: item.noc,
          // 多注组合没有单一赔率，不把预计盈利当赔率展示。
          odds: item.noc === 1 ? item.epa + 1 : undefined,
          stake,
          minStake: item.misa,
          maxStake: item.masa,
          payoutPerUnit: item.epa,
          stakeError: getStakeError(stake, item.misa, item.masa),
          limitText: limitText(item.misa, item.masa)
        }
      })
  })
  const activeRows = computed(() =>
    mode.value === 'single'
      ? selections.value.map(item => ({ ...item, combinationCount: 1 }))
      : parlays.value
  )
  // 空金额和零金额不参与单关汇总；格式错误的非空金额仍需提示。
  const hasStake = (stake: string) => stake.trim() !== '' && parseSportsStake(stake) !== 0
  const fundedRows = computed(() => activeRows.value.filter(item => hasStake(item.stake)))
  const checkedSelections = computed(() =>
    mode.value === 'single'
      ? selections.value.filter(item => hasStake(item.stake))
      : selections.value
  )
  const invalidStake = computed(() => fundedRows.value.some(item => Boolean(item.stakeError)))
  const totalStake = computed(() =>
    moneyRound(
      fundedRows.value.reduce(
        (sum, item) => sum + (parseSportsStake(item.stake) ?? 0) * item.combinationCount,
        0
      )
    )
  )
  const potentialReturn = computed(() =>
    moneyRound(
      fundedRows.value.reduce(
        (sum, item) => sum + (parseSportsStake(item.stake) ?? 0) * (item.payoutPerUnit ?? 0),
        0
      )
    )
  )
  const canPrepareBet = computed(
    () =>
      !invalidStake.value &&
      (mode.value !== 'parlay' || parlayEligible.value) &&
      betInfoAvailable.value &&
      (mode.value === 'single' || betInfoReady.value) &&
      !betInfoLoading.value &&
      fundedRows.value.length > 0 &&
      fundedRows.value.every(item => item.payoutPerUnit !== undefined) &&
      totalStake.value > 0 &&
      balance.value !== null &&
      totalStake.value <= balance.value &&
      checkedSelections.value.every(item => item.betStatus === 'open')
  )
  // 下单接口尚未接入，不能用模拟成功代替真实结果。
  const canSubmit = computed(() => false)
  const currencySymbol = computed(() => getCurrencySymbol(currentCurrencyCode.value))
  const formatMoney = (value: number) => getFormattedBalance(value, currentCurrencyCode.value, 2)
  const balanceText = computed(() => (balance.value === null ? '--' : formatMoney(balance.value)))
  const totalStakeText = computed(() => formatMoney(totalStake.value))
  const potentialReturnText = computed(() =>
    fundedRows.value.length &&
    (invalidStake.value ||
      checkedSelections.value.some(item => item.betStatus !== 'open') ||
      fundedRows.value.some(item => item.payoutPerUnit === undefined))
      ? '--'
      : formatMoney(potentialReturn.value)
  )
  const validationError = computed(() => {
    if (mode.value === 'parlay' && selections.value.length < 2)
      return selections.value.length ? t('sports.betParlayNeedTwo') : ''
    const selectionError = checkedSelections.value.find(item => item.stakeError)
    if (selectionError)
      return t('sports.betSelectionError', {
        selection: `${selectionError.fixture} / ${selectionError.selection}`,
        reason: selectionError.stakeError
      })
    const amountError = fundedRows.value.find(item => item.stakeError)
    if (amountError) return amountError.stakeError ?? ''
    if (!fundedRows.value.length) return ''
    if (betInfoError.value) return t(betInfoError.value)
    if (sportsBalanceError.value) return t('sports.balanceRefreshFailed')
    if (balance.value === null) return t('sports.balanceUnavailable')
    if (balance.value !== null && totalStake.value > balance.value)
      return t('sports.insufficientBalance')
    return ''
  })
  const notice = computed(() => {
    if (validationError.value) return validationError.value
    return noticeKey.value
      ? NOTICE_MESSAGES[noticeKey.value]
      : selections.value.length
        ? t(fundedRows.value.length ? 'sports.betSubmitUnavailable' : 'sports.betEnterStake')
        : ''
  })
  const clearBets = () => {
    outcomes.value = []
    parlayStakes.value = {}
    focusedStakeId.value = ''
    mode.value = 'single'
    noticeKey.value = ''
  }
  const setMode = (value: SportsBetMode, allowIncomplete = false) => {
    if (value === 'parlay' && outcomes.value.length < 2 && !allowIncomplete) {
      noticeKey.value = 'needTwoSelections'
      return false
    }
    mode.value = value
    focusedStakeId.value =
      value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
    noticeKey.value = ''
    return true
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
    const event = sportsStore.getRefreshEvent(match.sportId, match.EventId)
    const openParlay = (event ? event.OpenParlay : match.OpenParlay) === true
    if (mode.value === 'parlay' && !openParlay) {
      showParlayUnsupported()
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
      source: {
        sportId: match.sportId,
        eventId: match.EventId,
        market: line,
        option: selection,
        openParlay,
        eventMarket: match.Market
      },
      snapshot
    }
    outcomes.value = previous
      ? outcomes.value.map(item => (item.matchId === matchId ? next : item))
      : [...outcomes.value, next]
    parlayStakes.value = {}
    focusedStakeId.value = mode.value === 'single' ? id : ''
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
    if (kind !== mode.value || balance.value === null) return
    const row = activeRows.value.find(item => item.id === id)
    if (!row || row.maxStake === undefined || row.minStake === undefined) return
    const otherStake = activeRows.value.reduce(
      (sum, item) =>
        item.id === id ? sum : sum + (parseSportsStake(item.stake) ?? 0) * item.combinationCount,
      0
    )
    const availableCents = Math.max(0, Math.round((balance.value - otherStake) * 100))
    const maximum = Math.min(row.maxStake, Math.floor(availableCents / row.combinationCount) / 100)
    const value = maximum >= row.minStake ? maximum.toFixed(2) : ''
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
  const refreshBalance = async () => {
    if (refreshing.value || !requireLogin()) return
    const version = sportsStore.sportsSessionVersion
    noticeKey.value = ''
    const success = await sportsStore.fetchSportsBalance()
    if (success || version !== sportsStore.sportsSessionVersion) return
    if (!sportsBalanceError.value && balance.value === null) return
    globalShowToast({
      type: 'fail',
      message: t('sports.balanceRefreshFailed')
    })
  }
  const showUnsupported = () => {
    noticeKey.value = 'notImplemented'
  }
  watch(currentCurrencyCode, () => {
    clearBets()
    noticeKey.value = 'currencyChanged'
  })

  return {
    betSlipOpen,
    mode,
    selections,
    parlays,
    balanceText,
    balance,
    totalStake,
    potentialReturn,
    currencySymbol,
    totalStakeText,
    potentialReturnText,
    canSubmit,
    notice,
    validationError,
    refreshing,
    betInfoLoading,
    betInfoReady,
    betInfoChanged,
    acceptBetterOdds,
    acceptBetChanges,
    canPrepareBet,
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
