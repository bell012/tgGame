import { computed, onDeactivated, onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useSportsStore } from '@/stores/sports'
import { useUserStore } from '@/stores/user'
import type { PlaceBetParams } from '@/api/interface/sport'
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
import { MAX_SELECTIONS, parseSportsStake, moneyRound } from './shared'
import { useBetInfo } from './useBetInfo'
import type { BetInfoSource } from './useBetInfo'
import { getPlaceBetFailure, getPlaceBetResult, toPlaceBetSelection } from './place-bet'
import type { BetSubmissionState } from './place-bet'

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
  const userStore = useUserStore()
  const {
    sportsBalance: balance,
    sportsBalanceLoading: refreshing,
    sportsBalanceError
  } = storeToRefs(sportsStore)
  const { t } = useI18n()
  const comboLabel = (combo: number, count: number) => {
    if (combo >= 9 && combo <= 17) return t('sports.betSlip.fold', { count: combo - 7 })
    if (combo >= 1 && combo <= 8) return t(`sports.betSlip.systems.${combo}`)
    if (combo === 18) return t('sports.betSlip.fold', { count })
    return t('sports.betSlip.combo', { count: combo })
  }
  const { requireLogin } = useRequireLoginAction()
  const { currentCurrencyCode } = useDisplayCurrency()
  const betSlipOpen = ref(false)
  const mode = ref<SportsBetMode>('single')
  const outcomes = ref<SelectedOutcome[]>([])
  const availability = ref<Record<string, 'checking' | 'unknown' | 'expired'>>({})
  const selectionBlocked = (id: string) =>
    availability.value[id] === 'checking' || availability.value[id] === 'expired'
  const parlayStakes = ref<Record<string, string>>({})
  const focusedStakeId = ref('')
  const submitting = ref(false)
  // 待处理或结果未知的投注，删除重加、切换模式后也不能重复提交。
  const submittedSelections = ref<Record<string, 'pending' | 'unknown'>>({})
  const submittedCombos = ref<Record<string, Exclude<BetSubmissionState, 'failed'>>>({})
  const accountKey = computed(() =>
    JSON.stringify([
      userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId,
      currentCurrencyCode.value
    ])
  )
  const selectionSubmissionKey = (id: string) => `${accountKey.value}:${id}`
  const parlaySubmissionKey = computed(
    () =>
      `${accountKey.value}:${outcomes.value
        .map(item => item.id)
        .sort()
        .join('|')}`
  )
  const getSubmissionState = (id: string) => submittedSelections.value[selectionSubmissionKey(id)]
  // 加入时检查串关资格，之后以报价状态为准。
  const parlayEligible = computed(() =>
    outcomes.value.every(outcome => outcome.source.openParlay && !selectionBlocked(outcome.id))
  )
  const showParlayUnsupported = () => {
    globalShowToast({ type: 'fail', message: t('sports.betParlayUnsupported') })
  }
  const {
    betInfoLoading,
    betInfoError,
    betInfoState,
    betInfoReplacedIds,
    betInfoReady,
    betInfoQuotes,
    betInfoTrends,
    betInfoSettings,
    refreshBetInfo
  } = useBetInfo({
    open: betSlipOpen,
    mode,
    parlayEligible,
    selectionKey: computed(() =>
      outcomes.value
        .filter(outcome => !selectionBlocked(outcome.id))
        .map(outcome => outcome.id)
        .join(',')
    ),
    getSources: () =>
      outcomes.value
        .filter(outcome => !selectionBlocked(outcome.id))
        .map(outcome => {
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

  let disposed = false
  let selectionVersion = 0
  let preparingSelection = false
  const checkedQuoteIds = new Set<string>()
  onDeactivated(() => {
    selectionVersion += 1
  })
  onScopeDispose(() => {
    disposed = true
  })
  const confirmSelection = async (outcome: SelectedOutcome) => {
    if (['checking', 'expired'].includes(availability.value[outcome.id])) return
    const version = sportsStore.sportsSessionVersion
    checkedQuoteIds.add(outcome.id)
    availability.value[outcome.id] = 'checking'
    const result = await sportsStore.confirmBetSelection({
      sportId: outcome.sportId,
      eventId: outcome.eventId,
      market: outcome.source.market,
      wagerSelectionId: outcome.WagerSelectionId
    })
    if (disposed || !outcomes.value.includes(outcome)) return
    if (version !== sportsStore.sportsSessionVersion || result === null) {
      availability.value[outcome.id] = 'unknown'
      return
    }
    if (result === 'missing') availability.value[outcome.id] = 'expired'
    else {
      checkedQuoteIds.add(outcome.id)
      delete availability.value[outcome.id]
      refreshBetInfo()
    }
  }
  // 只监听投注单内的选项，不遍历整个赛事列表。
  watch(
    () => ({
      open: betSlipOpen.value,
      version: sportsStore.sportsSessionVersion,
      rows: outcomes.value.map(outcome => {
        const event = sportsStore.getRefreshEvent(outcome.sportId, outcome.eventId)
        const line = event?.MarketLines?.find(item => item.MarketlineId === outcome.MarketlineId)
        const option = line?.WagerSelections?.find(
          item => item.WagerSelectionId === outcome.WagerSelectionId
        )
        return {
          outcome,
          missing: Boolean(event && !option),
          key: option
            ? JSON.stringify([
                line?.MarketlineStatusId,
                event?.Market,
                option.Odds,
                option.OddsType,
                option.Handicap,
                option.Specifiers
              ])
            : '',
          // 缺失时，下一次该赛事刷新可重试补查。
          lines: event?.MarketLines
        }
      })
    }),
    (current, previous) => {
      if (!current.open) return
      if (!previous?.open || current.version !== previous.version) checkedQuoteIds.clear()
      let changed = false
      for (const row of current.rows) {
        if (availability.value[row.outcome.id] === 'expired') continue
        const before = previous?.rows.find(item => item.outcome === row.outcome)
        if (before && row.key !== before.key) checkedQuoteIds.delete(row.outcome.id)
        if (row.missing || availability.value[row.outcome.id] === 'unknown')
          void confirmSelection(row.outcome)
        else {
          if (before && row.key && row.key !== before.key) changed = true
        }
      }
      if (changed) refreshBetInfo()
    }
  )
  watch(betInfoReplacedIds, ids => {
    for (const outcome of outcomes.value) {
      // 两个接口暂时不一致时，避免报价与补查互相触发。
      if (ids.includes(outcome.WagerSelectionId) && !checkedQuoteIds.has(outcome.id))
        void confirmSelection(outcome)
    }
  })

  const refreshTargets = computed(() =>
    outcomes.value.map(({ sportId, eventId }) => ({ sportId, eventId }))
  )
  const getSelectedWagerSelectionId = (matchId: string) =>
    outcomes.value.find(outcome => outcome.matchId === matchId)?.WagerSelectionId
  const getOutcomeSnapshot = (outcome: SelectedOutcome): SportsBetSelection => {
    if (availability.value[outcome.id] === 'expired') return outcome.snapshot
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
  // 切换赛事列表时保留投注项，刷新时保留金额。
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
  const totalStake = computed(() =>
    moneyRound(
      mode.value === 'single'
        ? outcomes.value.reduce(
            (sum, item) => sum + (canUseSelection(item) ? (parseSportsStake(item.stake) ?? 0) : 0),
            0
          )
        : betInfoSettings.value
            .filter(
              item =>
                item.combs !== 0 &&
                item.noc > 0 &&
                !submittedCombos.value[`${parlaySubmissionKey.value}:${item.combs}`]
            )
            .reduce(
              (sum, item) =>
                sum +
                (parseSportsStake(parlayStakes.value[`parlay-${item.combs}`] ?? '') ?? 0) *
                  item.noc,
              0
            )
    )
  )
  const getStakeError = (stake: string, min?: number, max?: number) => {
    const amount = parseSportsStake(stake)
    if (amount === null) return t('sports.betAmountInvalid')
    if (!amount) return ''
    if (balance.value !== null && totalStake.value > balance.value)
      return t('sports.betBalanceAdjusted')
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === undefined || max === undefined)
      return ''
    return amount < min || amount > max
      ? t('sports.betLimit', { min: min.toFixed(2), max: max.toFixed(2) })
      : ''
  }
  const limitText = (min?: number, max?: number) =>
    !Number.isFinite(min) || !Number.isFinite(max) || min === undefined || max === undefined
      ? ''
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
        mode.value === 'parlay' &&
        (!outcome.source.openParlay || quote?.st === 439 || quote?.st === 464)
      const getStatus = (): NonNullable<SportsBetSelection['betStatus']> => {
        if (availability.value[outcome.id] === 'expired') return 'unavailable'
        if (availability.value[outcome.id] === 'checking') return 'pending'
        if (parlayUnsupported) return 'unavailable'
        if (quote?.st === 380 || quote?.mlsid === 2) return 'closed'
        if (betInfoError.value) return 'error'
        if (!quote) {
          if (['queued', 'loading'].includes(betInfoState.value)) return 'pending'
          return betInfoState.value === 'idle' ? 'idle' : 'open'
        }
        // 未明确拒绝时正常展示，能否下单由接口判断。
        return 'open'
      }
      const status = getStatus()
      const statusMessages = {
        idle: 'sports.betInfoNotRequested',
        pending: '',
        open: '',
        closed: 'sports.betMarketClosed',
        unavailable:
          availability.value[outcome.id] === 'expired'
            ? 'sports.betSelectionExpired'
            : parlayUnsupported
              ? 'sports.betParlayUnsupported'
              : 'sports.betInfoSelectionUnavailable',
        error: betInfoError.value || 'sports.betInfoFailed'
      }
      const statusMessage = statusMessages[status] ? t(statusMessages[status]) : ''
      const odds = quote && Number.isFinite(quote.o) ? quote.o : outcome.odds
      const handicap =
        quote?.dih ?? (quote?.h === null || quote?.h === undefined ? '' : String(quote.h))
      return {
        ...outcome.snapshot,
        submissionState: getSubmissionState(outcome.id),
        stake: outcome.stake,
        odds,
        trend: quote ? betInfoTrends.value[quote.rid] : outcome.snapshot.trend,
        oddsType: quote?.ot ?? outcome.source.option.OddsType,
        selection:
          quote && (quote.dih != null || quote.h !== undefined)
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
        payoutPerUnit: Number.isFinite(setting?.epa) ? setting?.epa : undefined,
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
          submissionState: submittedCombos.value[`${parlaySubmissionKey.value}:${item.combs}`],
          size: item.combs >= 9 && item.combs <= 17 ? item.combs - 7 : outcomes.value.length,
          label: comboLabel(item.combs, outcomes.value.length),
          comboSelection: item.combs,
          combinationCount: item.noc,
          // 多注组合不展示单一赔率。
          odds: item.noc === 1 ? item.epa + 1 : undefined,
          stake,
          minStake: item.misa,
          maxStake: item.masa,
          payoutPerUnit: Number.isFinite(item.epa) ? item.epa : undefined,
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
  const fundedRows = computed(() =>
    activeRows.value.filter(item => {
      if (!hasStake(item.stake) || item.submissionState) return false
      if (mode.value === 'parlay') return outcomes.value.every(canUseSelection)
      const outcome = outcomes.value.find(outcome => outcome.id === item.id)
      return outcome !== undefined && canUseSelection(outcome)
    })
  )
  const checkedSelections = computed(() =>
    mode.value === 'single'
      ? selections.value.filter(item => hasStake(item.stake))
      : selections.value
  )
  const invalidStake = computed(() => fundedRows.value.some(item => Boolean(item.stakeError)))
  const potentialReturn = computed(() =>
    moneyRound(
      fundedRows.value.reduce(
        (sum, item) => sum + (parseSportsStake(item.stake) ?? 0) * (item.payoutPerUnit ?? 0),
        0
      )
    )
  )
  const hasValidStake = (stake: string) => (parseSportsStake(stake) ?? 0) > 0
  const canUseSelection = (outcome: SelectedOutcome) => {
    const quote = betInfoQuotes.value.find(item => item.wsid === outcome.WagerSelectionId)
    return (
      !selectionBlocked(outcome.id) &&
      !getSubmissionState(outcome.id) &&
      quote !== undefined &&
      Number(quote.st) !== 380 &&
      Number(quote.mlsid) !== 2 &&
      (mode.value !== 'parlay' || ![439, 464].includes(Number(quote.st)))
    )
  }
  const submittableSingles = computed(() =>
    outcomes.value.filter(item => hasValidStake(item.stake) && canUseSelection(item))
  )
  const submittableCombos = computed(() =>
    parlays.value.filter(
      (item): item is SportsParlay & { comboSelection: number } =>
        item.comboSelection !== undefined && hasValidStake(item.stake) && !item.submissionState
    )
  )
  const canPrepareBet = computed(() =>
    mode.value === 'single'
      ? submittableSingles.value.length > 0
      : outcomes.value.length >= 2 &&
        parlayEligible.value &&
        outcomes.value.every(canUseSelection) &&
        submittableCombos.value.length > 0
  )
  const canSubmit = computed(() => !submitting.value && canPrepareBet.value)
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
    const selectionError = checkedSelections.value.find(
      item => item.betStatus !== 'open' && item.stakeError
    )
    if (selectionError)
      return t('sports.betSelectionError', {
        selection: `${selectionError.fixture} / ${selectionError.selection}`,
        reason: selectionError.stakeError
      })
    // 金额提示由输入框展示，底部不重复显示。
    if (!fundedRows.value.length) return ''
    if (betInfoError.value) return t(betInfoError.value)
    if (sportsBalanceError.value) return t('sports.balanceRefreshFailed')
    if (balance.value === null) return t('sports.balanceUnavailable')
    return ''
  })
  const notice = computed(() => {
    if (validationError.value) return validationError.value
    if (invalidStake.value) return ''
    return selections.value.length && !fundedRows.value.length ? t('sports.betEnterStake') : ''
  })
  const clearBets = () => {
    if (submitting.value) return
    selectionVersion += 1
    outcomes.value = []
    availability.value = {}
    checkedQuoteIds.clear()
    parlayStakes.value = {}
    focusedStakeId.value = ''
    mode.value = 'single'
  }
  const setMode = (value: SportsBetMode, allowIncomplete = false) => {
    if (submitting.value) return false
    if (value === 'parlay' && outcomes.value.length < 2 && !allowIncomplete) {
      globalShowToast({ type: 'fail', message: t('sports.betParlayNeedTwo') })
      return false
    }
    mode.value = value
    focusedStakeId.value =
      value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
    return true
  }
  const removeSelection = (id: string) => {
    if (submitting.value) return
    outcomes.value = outcomes.value.filter(item => item.id !== id)
    delete availability.value[id]
    checkedQuoteIds.delete(id)
    parlayStakes.value = {}
    if (outcomes.value.length < 2) mode.value = 'single'
    focusedStakeId.value =
      mode.value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
  }
  // 使用组件返回的盘口和选项，同一赛事只保留一项。
  const selectOdds = async (matchId: string, payload: OddsSelectPayload): Promise<boolean> => {
    if (submitting.value) return false
    const selectedId = `${matchId}:${payload.market.MarketlineId}:${payload.option.WagerSelectionId}`
    if (outcomes.value.some(item => item.id === selectedId)) {
      removeSelection(selectedId)
      return true
    }
    if (preparingSelection || !requireLogin()) return false
    // 先取得体育凭据，再加入投注单和查询报价。
    if (!sportsStore.sportsMemberCode || !sportsStore.sportsToken) {
      const sessionVersion = sportsStore.sportsSessionVersion
      const version = selectionVersion
      preparingSelection = true
      try {
        await sportsStore.ensureSportsMemberCode()
      } finally {
        preparingSelection = false
      }
      if (
        disposed ||
        version !== selectionVersion ||
        sessionVersion !== sportsStore.sportsSessionVersion
      ) {
        return false
      }
      if (!sportsStore.sportsMemberCode || !sportsStore.sportsToken) {
        globalShowToast({ type: 'fail', message: t('sports.betLoginFailed') })
        return false
      }
    }
    // 等待登录期间盘口可能已更新，使用当前数据。
    const match = getMatch(matchId)
    const line = (match?.MarketLines ?? []).find(
      item => item.MarketlineId === payload.market.MarketlineId
    )
    const selection = line?.WagerSelections.find(
      item => item.WagerSelectionId === payload.option.WagerSelectionId
    )
    if (!match || !line || !selection) return false
    const odds = Number(selection.Odds)
    if (!Number.isFinite(odds)) return false
    const id = `${matchId}:${line.MarketlineId}:${selection.WagerSelectionId}`
    const previous = outcomes.value.find(item => item.matchId === matchId)
    const event = sportsStore.getRefreshEvent(match.sportId, match.EventId)
    const openParlay = (event ? event.OpenParlay : match.OpenParlay) === true
    if (mode.value === 'parlay' && !openParlay) {
      showParlayUnsupported()
      return false
    }
    if (!previous && outcomes.value.length >= MAX_SELECTIONS) {
      globalShowToast({
        type: 'fail',
        message: t('sports.betSelectionLimit', { count: MAX_SELECTIONS })
      })
      betSlipOpen.value = true
      return false
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
    if (previous) {
      delete availability.value[previous.id]
      checkedQuoteIds.delete(previous.id)
    }
    parlayStakes.value = {}
    focusedStakeId.value = mode.value === 'single' ? id : ''
    betSlipOpen.value = true
    return true
  }
  const updateStake = (id: string, value: string) => {
    if (submitting.value || getSubmissionState(id)) return
    const outcome = outcomes.value.find(item => item.id === id)
    if (outcome) outcome.stake = value
  }
  const updateParlayStake = (id: string, value: string) => {
    if (submitting.value || parlays.value.find(item => item.id === id)?.submissionState) return
    if (!parlays.value.some(item => item.id === id)) return
    parlayStakes.value = { ...parlayStakes.value, [id]: value }
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
  const submitBet = async (): Promise<void> => {
    if (submitting.value || !requireLogin()) return
    if (!canPrepareBet.value) {
      globalShowToast({ type: 'fail', message: t('sports.betSubmitEmpty') })
      return
    }
    const version = sportsStore.sportsSessionVersion
    const account = accountKey.value
    const comboKey = parlaySubmissionKey.value
    const isSingle = mode.value === 'single'
    const targets = isSingle ? [...submittableSingles.value] : [...outcomes.value]
    const combos = [...submittableCombos.value]
    type BetQuery = Pick<PlaceBetParams, 'WagerType' | 'WagerSelectionInfos' | 'ComboSelections'>
    const quoteFor = (outcome: SelectedOutcome) =>
      betInfoQuotes.value.find(item => item.wsid === outcome.WagerSelectionId)
    const jobs: { query: BetQuery; targets: SelectedOutcome[] }[] = []
    if (isSingle) {
      for (const outcome of targets) {
        const quote = quoteFor(outcome)
        const amount = parseSportsStake(outcome.stake)
        if (!quote || amount === null || amount <= 0) continue
        jobs.push({
          targets: [outcome],
          query: {
            WagerType: 1,
            WagerSelectionInfos: [toPlaceBetSelection(quote)],
            ComboSelections: [{ ComboSelection: 0, StakeAmount: amount }]
          }
        })
      }
    } else {
      const quotes = targets.map(quoteFor)
      // 串关缺少报价时不提交，不能少选项下单。
      if (quotes.some(item => !item)) return
      jobs.push({
        targets,
        query: {
          WagerType: 2,
          WagerSelectionInfos: quotes.filter(item => item !== undefined).map(toPlaceBetSelection),
          ComboSelections: combos.flatMap(item => {
            const amount = parseSportsStake(item.stake)
            return amount !== null && amount > 0
              ? [{ ComboSelection: item.comboSelection, StakeAmount: amount }]
              : []
          })
        }
      })
    }
    if (!jobs.length || jobs.some(item => !item.query.ComboSelections.length)) return
    submitting.value = true
    const results: BetSubmissionState[] = []
    let refreshQuote = false
    const current = () =>
      !disposed && accountKey.value === account && sportsStore.sportsSessionVersion === version
    try {
      const responses = await Promise.allSettled(jobs.map(job => sportsStore.placeBet(job.query)))
      // 本投注单保留未知结果，防止删除重加后重复提交。
      for (const [index, response] of responses.entries()) {
        const job = jobs[index]
        if (
          response.status === 'fulfilled' &&
          Array.isArray(response.value?.wsis) &&
          response.value.wsis.some(item => item && [380, 1107].includes(Number(item.bsm)))
        )
          refreshQuote = true
        const states = job.query.ComboSelections.map(combo => ({
          combo: combo.ComboSelection,
          state:
            response.status === 'fulfilled'
              ? getPlaceBetResult(response.value, combo.ComboSelection)
              : getPlaceBetFailure(response.reason)
        }))
        results.push(...states.map(item => item.state))
        for (const { combo, state } of states) {
          if (!isSingle && state !== 'failed') submittedCombos.value[`${comboKey}:${combo}`] = state
        }
        const uncertain = states.some(item => item.state === 'unknown')
          ? 'unknown'
          : states.some(item => item.state === 'pending')
            ? 'pending'
            : undefined
        if (uncertain) {
          for (const target of job.targets)
            submittedSelections.value[`${account}:${target.id}`] = uncertain
        }
        if (accountKey.value === account && states.every(item => item.state === 'confirmed')) {
          if (isSingle) outcomes.value = outcomes.value.filter(item => item !== job.targets[0])
        }
      }
      if (
        accountKey.value === account &&
        !isSingle &&
        results.every(item => item === 'confirmed')
      ) {
        outcomes.value = outcomes.value.filter(item => !targets.includes(item))
        parlayStakes.value = {}
        for (const key of Object.keys(submittedCombos.value)) {
          if (key.startsWith(`${comboKey}:`)) delete submittedCombos.value[key]
        }
      }
      if (!current()) return
      if (refreshQuote) refreshBetInfo()
      if (!outcomes.value.length) {
        availability.value = {}
        checkedQuoteIds.clear()
        focusedStakeId.value = ''
        mode.value = 'single'
      }
      const result = results.includes('unknown')
        ? 'Unknown'
        : results.includes('pending')
          ? 'Pending'
          : results.includes('failed')
            ? results.includes('confirmed')
              ? 'Partial'
              : 'Failed'
            : 'Success'
      globalShowToast({
        type: result === 'Success' ? 'success' : 'fail',
        message:
          result === 'Failed' && (!sportsStore.sportsMemberCode || !sportsStore.sportsToken)
            ? t('sports.betLoginFailed')
            : t(`sports.betSubmit${result}`)
      })
    } finally {
      submitting.value = false
      if (current()) await sportsStore.fetchSportsBalance()
    }
  }
  const refreshBalance = async () => {
    if (refreshing.value || !requireLogin()) return
    const version = sportsStore.sportsSessionVersion
    const success = await sportsStore.fetchSportsBalance()
    if (success || version !== sportsStore.sportsSessionVersion) return
    if (!sportsBalanceError.value && balance.value === null) return
    globalShowToast({
      type: 'fail',
      message: t('sports.balanceRefreshFailed')
    })
  }
  const showUnsupported = () => {
    globalShowToast({ type: 'fail', message: t('sports.betFeatureUnavailable') })
  }
  watch([accountKey, currentCurrencyCode], ([, currency], [, previousCurrency]) => {
    const hadSelections = outcomes.value.length > 0
    // 切换币种时清空投注项，包括提交期间。
    outcomes.value = []
    availability.value = {}
    checkedQuoteIds.clear()
    parlayStakes.value = {}
    focusedStakeId.value = ''
    mode.value = 'single'
    selectionVersion += 1
    if (hadSelections && currency !== previousCurrency)
      globalShowToast({ type: 'fail', message: t('sports.betCurrencyChanged') })
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
    submitting,
    notice,
    validationError,
    refreshing,
    betInfoLoading,
    betInfoReady,
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
    submitBet,
    refreshBalance,
    showUnsupported,
    refreshTargets
  }
}
