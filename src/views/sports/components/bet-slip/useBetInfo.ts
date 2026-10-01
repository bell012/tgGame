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
import { SportsCredentialsUnavailableError, useSportsStore } from '@/stores/sports'
import { useUserStore } from '@/stores/user'
import { useSportsAuthStore } from '@/stores/sportsAuth'
import type { SportsBetMode } from '../../shared/types'
import type { OddsTrend } from '../match-odds/types'
import { decimalOdds, isBetInfoRetryable, parseBetInfoItems } from './bet-info'

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
  const sportsAuth = useSportsAuthStore()
  const active = ref(true)
  const visible = ref(typeof document === 'undefined' || !document.hidden)
  const error = ref('')
  const loading = ref(false)
  const ready = ref(false)
  const state = ref<
    'idle' | 'queued' | 'loading' | 'success' | 'error' | 'credentials-unavailable'
  >('idle')
  const quotes = ref<(SportsBetInfoQuote & { rid: number })[]>([])
  const trends = ref<Record<number, OddsTrend>>({})
  const settings = ref<SportsBetInfoSetting[]>([])
  const replacedIds = ref<number[]>([])
  const loggedIn = computed(() =>
    Boolean(userStore.userInfo?.tradeToken || userStore.acctInfo?.memberId)
  )
  let generation = 0
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let finishRetry: ((continueQuery: boolean) => void) | undefined
  const enabled = () =>
    open.value &&
    Boolean(selectionKey.value) &&
    active.value &&
    visible.value &&
    loggedIn.value &&
    (mode.value === 'single' || parlayEligible.value)

  const cancel = () => {
    generation += 1
    clearTimeout(retryTimer)
    retryTimer = undefined
    finishRetry?.(false)
    finishRetry = undefined
    sportsStore.cancelBetInfo()
    loading.value = false
    ready.value = false
    state.value = 'idle'
  }
  const query = async (preserveQuotes = false) => {
    if (!enabled()) return
    const current = generation
    const previousQuotes = quotes.value
    if (!preserveQuotes) {
      quotes.value = []
      settings.value = []
    }
    trends.value = {}
    replacedIds.value = []
    error.value = ''
    const sources = getSources()
    if (mode.value === 'parlay' && sources.length < 2) {
      state.value = 'idle'
      return
    }
    const selections = buildBetInfoSelections(sources)
    loading.value = true
    state.value = 'loading'
    let credentialsUnavailable = false
    try {
      const params = {
        WagerType: mode.value === 'single' ? 1 : 2,
        WagerSelectionInfos: selections
      } as const
      let response = await sportsStore.fetchBetInfo(params)
      if (current !== generation) return
      // 380 且仍开盘时，按接口规则间隔 5 秒重查一次。
      if (
        [100, 350].includes(Number(response?.stc)) &&
        Array.isArray(response?.wsis) &&
        response.wsis.some(isBetInfoRetryable)
      ) {
        const continueQuery = await new Promise<boolean>(resolve => {
          finishRetry = resolve
          retryTimer = setTimeout(() => {
            retryTimer = undefined
            finishRetry = undefined
            resolve(true)
          }, 5000)
        })
        if (!continueQuery || current !== generation || !enabled()) return
        response = await sportsStore.fetchBetInfo(params)
      }
      if (current !== generation) return
      ready.value = false
      if (!response || ![100, 350].includes(Number(response.stc))) {
        error.value = [439, 464].includes(
          Number(response?.stc ?? sportsStore.requests.GetBetInfo.error?.code)
        )
          ? 'sports.betParlayUnsupported'
          : 'sports.betInfoFailed'
        return
      }
      const sent = sportsStore.requests.GetBetInfo.params?.WagerSelectionInfos ?? []
      const parsed = parseBetInfoItems(sent, Array.isArray(response.wsis) ? response.wsis : [])
      const next = parsed.quotes
      replacedIds.value = parsed.replacedIds
      for (const quote of next) {
        const previous = previousQuotes.find(item => item.rid === quote.rid)
        const before = previous ? decimalOdds(previous.o, previous.ot) : null
        const after = decimalOdds(quote.o, quote.ot)
        if (before !== null && after !== null && Math.abs(before - after) > 0.000001) {
          trends.value[quote.rid] = after > before ? 'up' : 'down'
        }
      }
      // 局部返回没带到的选项沿用原报价，不把缺失当作恢复开盘。
      const updated = new Map(next.map(quote => [quote.rid, quote]))
      quotes.value = preserveQuotes
        ? selections.flatMap(selection => {
            const quote =
              updated.get(selection.RefId) ??
              previousQuotes.find(item => item.rid === selection.RefId)
            return quote ? [quote] : []
          })
        : next
      if (quotes.value.some(isBetInfoRetryable)) {
        error.value = 'sports.betInfoFailed'
        return
      }
      settings.value = Array.isArray(response.bs) ? response.bs.filter(Boolean) : []
      ready.value = true
    } catch (failure) {
      if (current === generation) {
        ready.value = false
        credentialsUnavailable = failure instanceof SportsCredentialsUnavailableError
        // 登录接口已提示，投注项和金额保留，不再显示报价失败文案。
        error.value = credentialsUnavailable ? '' : 'sports.betInfoFailed'
      }
    } finally {
      if (current === generation) {
        loading.value = false
        state.value = credentialsUnavailable
          ? 'credentials-unavailable'
          : error.value
            ? 'error'
            : 'success'
      }
    }
  }
  const refreshBetInfo = () => {
    if (!enabled()) return
    cancel()
    const current = generation
    state.value = 'queued'
    void nextTick(() => {
      if (current === generation) void query(true)
    })
  }

  // 其他主动操作取得凭据后，只恢复当前因凭据失败的报价。
  watch(
    [() => sportsAuth.isReady, state],
    ([isReady, status]) => {
      if (isReady && status === 'credentials-unavailable' && enabled()) refreshBetInfo()
    },
    { flush: 'post' }
  )

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
    () => {
      cancel()
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
    betInfoReplacedIds: replacedIds,
    betInfoAvailable: computed(() => enabled() && state.value === 'success' && !error.value),
    betInfoReady: computed(() => ready.value && !error.value && enabled()),
    betInfoQuotes: quotes,
    betInfoTrends: trends,
    betInfoSettings: settings,
    refreshBetInfo
  }
}
