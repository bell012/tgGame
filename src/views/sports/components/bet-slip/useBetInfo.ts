import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  ref,
  watch
} from 'vue'
import type { Ref } from 'vue'
import type {
  SportMarketLine,
  SportsBetInfoSelectionParams,
  SportWagerSelection,
  SportsBetInfoQuote,
  SportsBetInfoSetting
} from '@/api/interface/sport'
import { useSportsStore } from '@/stores/sports'
import { useUserStore } from '@/stores/user'
import type { SportsBetMode } from '../../shared/types'
import type { OddsTrend } from '../match-odds/types'
import { decimalOdds, isBetInfoSetting, parseBetInfoItems, sameHandicap } from './bet-info'

export type BetInfoSource = {
  sportId: number
  eventId: number
  market: SportMarketLine
  option: SportWagerSelection
  eventMarket: SportsBetInfoSelectionParams['Market']
  openParlay: boolean
}

export const buildBetInfoSelections = (sources: BetInfoSource[]): SportsBetInfoSelectionParams[] =>
  sources.map(({ sportId, eventId, market, option, eventMarket }) => ({
    RefId: option.WagerSelectionId,
    SportId: sportId,
    EventId: eventId,
    BetTypeId: market.BetTypeId,
    MarketlineId: market.MarketlineId,
    WagerSelectionId: option.WagerSelectionId,
    BetTypeSelectionId: option.SelectionId,
    PeriodId: market.PeriodId,
    Market: eventMarket,
    MarketlineStatusId: market.MarketlineStatusId,
    OutrightTeamId: 0,
    OddsType: option.OddsType,
    Odds: option.Odds,
    Handicap: option.Handicap ?? null,
    Specifiers: option.Specifiers ?? null,
    PreBoostOdds: null
  }))

type BetInfoOptions = {
  open: Ref<boolean>
  mode: Ref<SportsBetMode>
  parlayEligible: Ref<boolean>
  selectionKey: Ref<string>
  getSources: () => BetInfoSource[]
}

export const useBetInfo = ({
  open,
  mode,
  parlayEligible,
  selectionKey,
  getSources
}: BetInfoOptions) => {
  const sportsStore = useSportsStore()
  const userStore = useUserStore()
  const active = ref(true)
  const visible = ref(typeof document === 'undefined' || !document.hidden)
  const error = ref('')
  const loading = ref(false)
  const ready = ref(false)
  const state = ref<'idle' | 'queued' | 'loading' | 'success' | 'error'>('idle')
  const itemErrors = ref<Record<number, string>>({})
  const quotes = ref<(SportsBetInfoQuote & { rid: number })[]>([])
  const trends = ref<Record<number, OddsTrend>>({})
  const settings = ref<SportsBetInfoSetting[]>([])
  const changedIds = ref<number[]>([])
  const acceptBetterOdds = ref(true)
  const accepted = new Map<
    number,
    { odds: number; type: number; handicap: number | null; specifiers: string | null }
  >()
  const loggedIn = computed(() =>
    Boolean(userStore.userInfo?.tradeToken || userStore.acctInfo?.memberId)
  )
  let generation = 0
  const enabled = () =>
    open.value &&
    Boolean(selectionKey.value) &&
    active.value &&
    visible.value &&
    loggedIn.value &&
    (mode.value === 'single' || parlayEligible.value)

  const cancel = () => {
    generation += 1
    sportsStore.cancelBetInfo()
    loading.value = false
    ready.value = false
    state.value = 'idle'
  }
  const query = async () => {
    if (!enabled()) return
    const current = generation
    const previousQuotes = quotes.value
    quotes.value = []
    trends.value = {}
    settings.value = []
    itemErrors.value = {}
    changedIds.value = []
    error.value = ''
    const sources = getSources()
    if (mode.value === 'parlay' && sources.length < 2) {
      state.value = 'idle'
      return
    }
    const selections = buildBetInfoSelections(sources)
    loading.value = true
    state.value = 'loading'
    try {
      const params = {
        WagerType: mode.value === 'single' ? 1 : 2,
        WagerSelectionInfos: selections
      } as const
      let response = await sportsStore.fetchBetInfo(params)
      if (current !== generation) return
      // Store 已刷新失效凭据，报价查询用新凭据重试一次。
      if ([102, 202].includes(Number(response?.stc)) && enabled()) {
        response = await sportsStore.fetchBetInfo(params)
      }
      if (current !== generation) return
      ready.value = false
      if (
        !response ||
        ![100, 350].includes(Number(response.stc)) ||
        !Array.isArray(response.wsis) ||
        !Array.isArray(response.bs)
      ) {
        error.value = [439, 464].includes(
          Number(response?.stc ?? sportsStore.requests.GetBetInfo.error?.code)
        )
          ? 'sports.betParlayUnsupported'
          : 'sports.betInfoFailed'
        return
      }
      const sent = sportsStore.requests.GetBetInfo.params?.WagerSelectionInfos ?? []
      const parsed = parseBetInfoItems(sent, response.wsis, response.bs, mode.value === 'single')
      const next = parsed.quotes
      itemErrors.value = parsed.errors
      const validSettings =
        mode.value === 'single' ? parsed.settings : response.bs.filter(isBetInfoSetting)
      const settingKeys = validSettings.map(item => item.combs)
      const allSelectionsOpen =
        next.length === selections.length &&
        !Object.keys(parsed.errors).length &&
        next.every(quote => [100, 381].includes(quote.st) && quote.mlsid === 1)
      const invalidComboSettings =
        mode.value === 'parlay' &&
        (validSettings.length !== response.bs.length ||
          new Set(settingKeys).size !== settingKeys.length ||
          (allSelectionsOpen && !validSettings.some(item => item.combs !== 0 && item.noc > 0)))
      for (const quote of next) {
        const previous = previousQuotes.find(item => item.rid === quote.rid)
        const before = previous ? decimalOdds(previous.o, previous.ot) : null
        const after = decimalOdds(quote.o, quote.ot)
        if (before !== null && after !== null && Math.abs(before - after) > 0.000001) {
          trends.value[quote.rid] = after > before ? 'up' : 'down'
        }
        const input = selections.find(item => item.RefId === quote.rid)
        if (!input || ![100, 381].includes(quote.st)) continue
        const baseline = accepted.get(quote.rid) ?? {
          odds: input.Odds,
          type: input.OddsType,
          handicap: input.Handicap,
          specifiers: input.Specifiers
        }
        accepted.set(quote.rid, baseline)
        const previousOdds = decimalOdds(baseline.odds, baseline.type)
        const nextOdds = decimalOdds(quote.o, quote.ot)
        const oddsChanged =
          previousOdds === null || nextOdds === null
            ? baseline.odds !== quote.o || baseline.type !== quote.ot
            : Math.abs(previousOdds - nextOdds) > 0.000001
        const needsConfirmation =
          !sameHandicap(baseline.handicap, quote.h) ||
          baseline.specifiers !== quote.sp ||
          (oddsChanged &&
            (!acceptBetterOdds.value ||
              previousOdds === null ||
              nextOdds === null ||
              nextOdds < previousOdds))
        if (needsConfirmation) {
          if (!changedIds.value.includes(quote.rid)) changedIds.value.push(quote.rid)
        } else if (!changedIds.value.includes(quote.rid)) {
          accepted.set(quote.rid, {
            odds: quote.o,
            type: quote.ot,
            handicap: quote.h,
            specifiers: quote.sp
          })
        }
      }
      quotes.value = next
      settings.value = invalidComboSettings ? [] : validSettings
      error.value = invalidComboSettings ? 'sports.betInfoIncomplete' : ''
      const hasSettings =
        mode.value === 'single'
          ? next.every(quote =>
              validSettings.some(item => item.combs === 0 && item.rid === quote.rid)
            )
          : !invalidComboSettings
      ready.value = hasSettings && allSelectionsOpen
    } catch {
      if (current === generation) {
        ready.value = false
        error.value = 'sports.betInfoFailed'
      }
    } finally {
      if (current === generation) {
        loading.value = false
        state.value = error.value ? 'error' : 'success'
      }
    }
  }
  const acceptChanges = () => {
    if (!enabled() || loading.value || error.value) return
    const acceptedQuotes = quotes.value.filter(
      quote => [100, 381].includes(quote.st) && quote.mlsid === 1 && !itemErrors.value[quote.rid]
    )
    acceptedQuotes.forEach(quote =>
      accepted.set(quote.rid, {
        odds: quote.o,
        type: quote.ot,
        handicap: quote.h,
        specifiers: quote.sp
      })
    )
    changedIds.value = changedIds.value.filter(
      id => !acceptedQuotes.some(quote => quote.rid === id)
    )
  }

  // 只在投注单打开、选项或模式变化时查询，不定时轮询。
  watch(
    () =>
      [
        JSON.stringify([mode.value, selectionKey.value, sportsStore.sportsSessionVersion]),
        open.value,
        loggedIn.value,
        active.value,
        visible.value
      ] as const,
    (values, previous) => {
      cancel()
      if (values[0] !== previous?.[0]) accepted.clear()
      if (!enabled()) return
      const current = generation
      state.value = 'queued'
      // 同一次点击可能同时改变模式和选项，合并为一次请求。
      void nextTick(() => {
        if (current === generation) void query()
      })
    },
    { immediate: true, flush: 'sync' }
  )
  const updateVisibility = () => {
    visible.value = !document.hidden
  }
  onMounted(() => document.addEventListener('visibilitychange', updateVisibility))
  onActivated(() => {
    active.value = true
  })
  onDeactivated(() => {
    active.value = false
    cancel()
  })
  onScopeDispose(() => {
    document.removeEventListener('visibilitychange', updateVisibility)
    cancel()
  })

  return {
    betInfoLoading: loading,
    betInfoError: error,
    betInfoState: state,
    betInfoItemErrors: itemErrors,
    betInfoChangedIds: changedIds,
    betInfoAvailable: computed(() => enabled() && state.value === 'success' && !error.value),
    betInfoReady: computed(
      () => ready.value && !error.value && !changedIds.value.length && enabled()
    ),
    betInfoQuotes: quotes,
    betInfoTrends: trends,
    betInfoSettings: settings,
    betInfoChanged: computed(() => changedIds.value.length > 0),
    acceptBetterOdds,
    acceptBetChanges: acceptChanges
  }
}
