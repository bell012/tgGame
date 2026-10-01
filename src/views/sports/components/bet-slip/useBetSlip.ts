import { computed, onDeactivated, onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { SportsCredentialsUnavailableError, useSportsStore } from '@/stores/sports'
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
import { MAX_SELECTIONS, parseSportsStake, moneyRound, adjustSportsStakeToBalance } from './shared'
import { useBetInfo } from './useBetInfo'
import { isBetInfoMarketClosed } from './bet-info'
import { useBetSubmissionCache } from './useBetSubmissionCache'
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
  resultPresentation?: () => 'panel' | 'toast'
}

export const useBetSlip = ({ getMatch, getTeamLogoUrl, resultPresentation }: BetSlipOptions) => {
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
  const isSelectionExpired = (outcome: SelectedOutcome) =>
    availability.value[outcome.id] === 'expired' ||
    sportsStore.isEventExpired(outcome.sportId, outcome.eventId)
  const selectionBlocked = (id: string) =>
    availability.value[id] === 'checking' ||
    outcomes.value.some(outcome => outcome.id === id && isSelectionExpired(outcome))
  const parlayStakes = ref<Record<string, string>>({})
  const balanceAdjusted = ref<Record<string, boolean>>({})
  const focusedStakeId = ref('')
  const submitting = ref(false)
  const reusing = ref(false)
  const acceptAnyOdds = ref(true)
  const oddsPreferenceKey = computed(() => {
    const memberId = userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId
    return memberId ? `sportsAcceptAnyOdds:${memberId}` : ''
  })
  watch(
    oddsPreferenceKey,
    key => {
      acceptAnyOdds.value = true
      if (!key) return
      try {
        acceptAnyOdds.value = localStorage.getItem(key) !== 'false'
      } catch {
        // 本地存储不可用时沿用默认值。
      }
    },
    { immediate: true, flush: 'sync' }
  )
  const setAcceptAnyOdds = (value: boolean) => {
    if (submitting.value || reusing.value) return
    acceptAnyOdds.value = value
    if (!oddsPreferenceKey.value) return
    try {
      localStorage.setItem(oddsPreferenceKey.value, String(value))
    } catch {
      // 保存失败不影响本次选择。
    }
  }
  const betResult = ref<'success' | 'failed' | null>(null)
  const lastSubmission = ref<{ mode: SportsBetMode; selections: SelectedOutcome[] } | null>(null)
  const dismissBetResult = () => {
    betResult.value = null
    lastSubmission.value = null
  }
  const submittedCombos = ref<Record<string, Exclude<BetSubmissionState, 'failed'>>>({})
  const accountKey = computed(() =>
    JSON.stringify([
      userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId,
      currentCurrencyCode.value
    ])
  )
  let disposed = false
  const submissionCache = useBetSubmissionCache(
    computed(() =>
      userStore.userInfo?.tradeToken && oddsPreferenceKey.value ? accountKey.value : ''
    ),
    betSlipOpen,
    () => {
      if (!disposed) globalShowToast({ type: 'fail', message: t('sports.betSubmitUnknown') })
    },
    () => {
      if (!disposed)
        globalShowToast({ type: 'fail', message: t('sports.betSubmissionStorageFailed') })
    },
    () => {
      if (!disposed) globalShowToast({ type: 'fail', message: t('sports.betSubmissionLockFailed') })
    }
  )
  const parlaySubmissionKey = computed(
    () =>
      `${accountKey.value}:${outcomes.value
        .map(item => item.id)
        .sort()
        .join('|')}`
  )
  watch(
    parlaySubmissionKey,
    () => {
      const ids = new Set(outcomes.value.map(item => item.id))
      balanceAdjusted.value = Object.fromEntries(
        Object.entries(balanceAdjusted.value).filter(([id]) => ids.has(id))
      )
    },
    { flush: 'sync' }
  )
  const getSubmissionState = (id: string) => submissionCache.selectionStates.value[id]
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

  let selectionVersion = 0
  const checkedQuoteIds = new Set<string>()
  onDeactivated(() => {
    selectionVersion += 1
  })
  onScopeDispose(() => {
    disposed = true
  })
  const confirmSelection = async (outcome: SelectedOutcome) => {
    if (isSelectionExpired(outcome)) {
      availability.value[outcome.id] = 'expired'
      return
    }
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
    if (isSelectionExpired(outcome)) {
      availability.value[outcome.id] = 'expired'
      return
    }
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
          expired: sportsStore.isEventExpired(outcome.sportId, outcome.eventId),
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
          // 相同盘口沿用旧引用，缺失选项按赛事更新版本重试补查。
          revision:
            event && !option ? sportsStore.getEventRevision(outcome.sportId, outcome.eventId) : 0
        }
      })
    }),
    (current, previous) => {
      for (const row of current.rows) {
        if (row.expired) availability.value[row.outcome.id] = 'expired'
      }
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

  const refreshTargets = computed(() => {
    const items = [...outcomes.value, ...(lastSubmission.value?.selections ?? [])]
    return [
      ...new Map(
        items.map(({ sportId, eventId }) => [`${sportId}:${eventId}`, { sportId, eventId }])
      ).values()
    ]
  })
  const getSelectedWagerSelectionId = (matchId: string) =>
    outcomes.value.find(outcome => outcome.matchId === matchId)?.WagerSelectionId
  const getOutcomeSnapshot = (outcome: SelectedOutcome): SportsBetSelection => {
    if (isSelectionExpired(outcome)) return outcome.snapshot
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
        if (isSelectionExpired(outcome)) return 'unavailable'
        if (availability.value[outcome.id] === 'checking') return 'pending'
        if (parlayUnsupported) return 'unavailable'
        if (isBetInfoMarketClosed(quote)) return 'closed'
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
        unavailable: isSelectionExpired(outcome)
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
            ? getStakeError(outcome.stake, setting?.misa, setting?.masa) ||
              (balanceAdjusted.value[outcome.id] ? t('sports.betBalanceAdjusted') : '')
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
          stakeError:
            getStakeError(stake, item.misa, item.masa) ||
            (balanceAdjusted.value[id] ? t('sports.betBalanceAdjusted') : ''),
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
  const invalidStake = computed(() =>
    fundedRows.value.some(item => Boolean(getStakeError(item.stake, item.minStake, item.maxStake)))
  )
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
      betInfoReady.value &&
      !selectionBlocked(outcome.id) &&
      !getSubmissionState(outcome.id) &&
      quote !== undefined &&
      Number(quote.st) !== 380 &&
      !isBetInfoMarketClosed(quote) &&
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
      !betInfoReady.value ||
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
    if (sportsBalanceError.value && sportsBalanceError.value.kind !== 'credentials')
      return t('sports.balanceRefreshFailed')
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
    balanceAdjusted.value = {}
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
    balanceAdjusted.value = {}
    focusedStakeId.value =
      value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
    return true
  }
  const removeSelection = (id: string) => {
    if (submitting.value) return
    outcomes.value = outcomes.value.filter(item => item.id !== id)
    delete availability.value[id]
    delete balanceAdjusted.value[id]
    checkedQuoteIds.delete(id)
    parlayStakes.value = {}
    if (outcomes.value.length < 2) mode.value = 'single'
    focusedStakeId.value =
      mode.value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
  }
  // 使用组件返回的盘口和选项，同一赛事只保留一项。
  const selectOdds = async (matchId: string, payload: OddsSelectPayload): Promise<boolean> => {
    if (submitting.value || reusing.value) return false
    dismissBetResult()
    const selectedId = `${matchId}:${payload.market.MarketlineId}:${payload.option.WagerSelectionId}`
    if (outcomes.value.some(item => item.id === selectedId)) {
      removeSelection(selectedId)
      return true
    }
    if (!requireLogin()) return false
    if (!submissionCache.canAdd(selectedId)) return false
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
    if (!submissionCache.canAdd(id)) return false
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
  // 已确认关闭/失效的盘口不占余额；报价缺失或复核中的输入仍预留，防止恢复后超额。
  const getOtherStake = (id: string, kind: SportsBetMode) =>
    kind === 'single'
      ? outcomes.value.reduce((sum, item) => {
          const quote = betInfoQuotes.value.find(quote => quote.rid === item.WagerSelectionId)
          return (
            sum +
            (item.id !== id &&
            !getSubmissionState(item.id) &&
            !isSelectionExpired(item) &&
            !isBetInfoMarketClosed(quote)
              ? (parseSportsStake(item.stake) ?? 0)
              : 0)
          )
        }, 0)
      : parlays.value.reduce(
          (sum, item) =>
            sum +
            (item.id !== id && !item.submissionState
              ? (parseSportsStake(item.stake) ?? 0) * item.combinationCount
              : 0),
          0
        )
  const updateStake = (id: string, value: string) => {
    if (submitting.value || getSubmissionState(id)) return
    const outcome = outcomes.value.find(item => item.id === id)
    if (!outcome) return
    const otherStake = getOtherStake(id, 'single')
    const adjusted = adjustSportsStakeToBalance(value, balance.value, otherStake, 1)
    outcome.stake = adjusted.value
    balanceAdjusted.value[id] = adjusted.adjusted
  }
  const updateParlayStake = (id: string, value: string) => {
    if (submitting.value || parlays.value.find(item => item.id === id)?.submissionState) return
    const row = parlays.value.find(item => item.id === id)
    if (!row) return
    const otherStake = getOtherStake(id, 'parlay')
    const adjusted = adjustSportsStakeToBalance(
      value,
      balance.value,
      otherStake,
      row.combinationCount
    )
    parlayStakes.value = { ...parlayStakes.value, [id]: adjusted.value }
    balanceAdjusted.value[id] = adjusted.adjusted
  }
  const focusStake = (id: string, kind: SportsBetMode) => {
    if (kind === mode.value && activeRows.value.some(row => row.id === id))
      focusedStakeId.value = id
  }
  const maxStake = (id: string, kind: SportsBetMode) => {
    if (kind !== mode.value || balance.value === null) return
    const row = activeRows.value.find(item => item.id === id)
    if (!row || row.maxStake === undefined || row.minStake === undefined) return
    const otherStake = getOtherStake(id, kind)
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
  const reuseSelections = async () => {
    const receipt = lastSubmission.value
    if (!receipt || submitting.value || reusing.value || !requireLogin()) return
    const account = accountKey.value
    const version = sportsStore.sportsSessionVersion
    const selectionGeneration = selectionVersion
    const current = () =>
      !disposed &&
      lastSubmission.value === receipt &&
      accountKey.value === account &&
      sportsStore.sportsSessionVersion === version &&
      selectionVersion === selectionGeneration
    reusing.value = true
    try {
      const restored: SelectedOutcome[] = []
      for (const item of receipt.selections) {
        if (isSelectionExpired(item) || getSubmissionState(item.id)) continue
        const findSource = () => {
          const event =
            sportsStore.getRefreshEvent(item.sportId, item.eventId) ?? getMatch(item.matchId)
          const market = event?.MarketLines.find(line => line.MarketlineId === item.MarketlineId)
          const option = market?.WagerSelections.find(
            option => option.WagerSelectionId === item.WagerSelectionId
          )
          return { event, market, option }
        }
        let source = findSource()
        // 列表可能只有部分盘口，缺失时先补查，不直接恢复旧选项。
        if (!source.option) {
          const available = await sportsStore.confirmBetSelection({
            sportId: item.sportId,
            eventId: item.eventId,
            market: item.source.market,
            wagerSelectionId: item.WagerSelectionId
          })
          if (!current()) return
          if (available !== 'present') continue
          source = findSource()
        }
        const { event, market, option } = source
        if (
          !event ||
          !market ||
          !option ||
          isSelectionExpired(item) ||
          Number(market.MarketlineStatusId) !== 1 ||
          !Number.isFinite(option.Odds) ||
          (receipt.mode === 'parlay' && !event.OpenParlay)
        )
          continue
        restored.push({
          ...item,
          stake: '',
          odds: option.Odds,
          snapshot: { ...getOutcomeSnapshot(item), stake: '', trend: undefined },
          source: {
            sportId: item.sportId,
            eventId: item.eventId,
            market,
            option,
            openParlay: event.OpenParlay === true,
            eventMarket: event.Market
          }
        })
      }
      if (!current()) return
      const submittedIds = new Set(receipt.selections.map(item => item.id))
      // 保留本次未提交的选项；本次选项重新加入时不带金额。
      const remaining = outcomes.value.filter(item => !submittedIds.has(item.id))
      outcomes.value = [...remaining, ...restored].slice(0, MAX_SELECTIONS)
      for (const item of receipt.selections) {
        delete availability.value[item.id]
        delete balanceAdjusted.value[item.id]
        checkedQuoteIds.delete(item.id)
      }
      parlayStakes.value = {}
      mode.value = receipt.mode
      focusedStakeId.value =
        receipt.mode === 'single' ? (restored[0]?.id ?? remaining[0]?.id ?? '') : ''
      dismissBetResult()
      betSlipOpen.value = true
      refreshBetInfo()
      if (restored.length !== receipt.selections.length) {
        globalShowToast({ type: 'fail', message: t('sports.betSlip.reuseUnavailable') })
      }
    } catch {
      if (current())
        globalShowToast({ type: 'fail', message: t('sports.betSlip.reuseUnavailable') })
    } finally {
      reusing.value = false
    }
  }
  const submitBet = async (): Promise<void> => {
    if (submitting.value || reusing.value || !requireLogin()) return
    if (!canPrepareBet.value) {
      if (outcomes.value.some(item => getSubmissionState(item.id))) {
        submissionCache.showUnconfirmed()
        return
      }
      globalShowToast({ type: 'fail', message: t('sports.betSubmitEmpty') })
      return
    }
    const version = sportsStore.sportsSessionVersion
    const account = accountKey.value
    const comboKey = parlaySubmissionKey.value
    const isSingle = mode.value === 'single'
    const targets = isSingle ? [...submittableSingles.value] : [...outcomes.value]
    const combos = [...submittableCombos.value]
    type BetQuery = Pick<
      PlaceBetParams,
      'WagerType' | 'WagerSelectionInfos' | 'ComboSelections' | 'IsComboAcceptAnyOdds'
    >
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
            IsComboAcceptAnyOdds: acceptAnyOdds.value,
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
          IsComboAcceptAnyOdds: acceptAnyOdds.value,
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
    dismissBetResult()
    const receipt = {
      mode: mode.value,
      selections: jobs.flatMap(job =>
        job.targets.map(item => ({
          ...item,
          snapshot: { ...getOutcomeSnapshot(item) }
        }))
      )
    }
    submitting.value = true
    let sent = false
    const submissionSelectionVersion = selectionVersion
    const results: BetSubmissionState[] = []
    let refreshQuote = false
    const current = () =>
      !disposed && accountKey.value === account && sportsStore.sportsSessionVersion === version
    const canSend = () => current() && selectionVersion === submissionSelectionVersion
    try {
      const submissionKeys = await submissionCache.reserve(
        jobs.map(job => job.targets.map(item => item.id)),
        canSend
      )
      if (!submissionKeys) return
      if (!canSend()) {
        submissionKeys.forEach(key => submissionCache.settle(key))
        return
      }
      const responses = await Promise.allSettled(
        jobs.map(async (job, index) => {
          try {
            const response = await sportsStore.placeBet(job.query, canSend)
            sent = true
            const states = job.query.ComboSelections.map(combo =>
              getPlaceBetResult(response, combo.ComboSelection)
            )
            submissionCache.settle(
              submissionKeys[index],
              states.includes('unknown')
                ? 'unknown'
                : states.includes('pending')
                  ? 'pending'
                  : undefined
            )
            return response
          } catch (error) {
            if (getPlaceBetFailure(error) === 'unknown') sent = true
            submissionCache.settle(
              submissionKeys[index],
              getPlaceBetFailure(error) === 'unknown' ? 'unknown' : undefined
            )
            throw error
          }
        })
      )
      // 凭据获取失败时请求未发出，登录接口已提示，保留原投注单。
      if (
        !sent &&
        responses.some(
          response =>
            response.status === 'rejected' &&
            response.reason instanceof SportsCredentialsUnavailableError
        )
      )
        return
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
      if (!current() || selectionVersion !== submissionSelectionVersion) return
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
      const presentation = resultPresentation?.()
      if (presentation && (result === 'Success' || result === 'Failed')) {
        lastSubmission.value = receipt
        betResult.value = result === 'Success' ? 'success' : 'failed'
        if (presentation === 'panel') betSlipOpen.value = true
      } else
        globalShowToast({
          type: result === 'Success' ? 'success' : 'fail',
          message:
            result === 'Unknown' || result === 'Pending'
              ? t('sports.betSubmitUnknown')
              : t(`sports.betSubmit${result}`)
        })
    } finally {
      submitting.value = false
      if (sent && current()) await sportsStore.fetchSportsBalance({ fetchIfMissing: false })
    }
  }
  const refreshBalance = async () => {
    if (refreshing.value || !requireLogin()) return
    const version = sportsStore.sportsSessionVersion
    const success = await sportsStore.fetchSportsBalance()
    if (success || version !== sportsStore.sportsSessionVersion) return
    if (sportsBalanceError.value?.kind === 'credentials') return
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
    dismissBetResult()
    const hadSelections = outcomes.value.length > 0
    // 切换币种时清空投注项，包括提交期间。
    outcomes.value = []
    balanceAdjusted.value = {}
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
    acceptAnyOdds,
    setAcceptAnyOdds,
    betResult,
    dismissBetResult,
    reusing,
    reuseSelections,
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
