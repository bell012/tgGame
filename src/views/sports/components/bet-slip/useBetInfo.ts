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
  SportsOddsType,
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
import {
  decimalOdds,
  isBetInfoMarketClosed,
  isBetInfoQuoteUsable,
  isBetInfoRetryable,
  parseBetInfoItems
} from './bet-info'

import { resolveSelectionOdds, resolveParlayOdds } from '../../shared/odds'

export type BetInfoSource = {
  sportId: number
  eventId: number
  market: SportMarketLine
  option: SportWagerSelection
  eventMarket: SportsBetInfoSelectionParams['Market']
  openParlay: boolean
}

export const buildBetInfoSelections = (
  sources: BetInfoSource[],
  oddsType: SportsOddsType,
  mode: SportsBetMode = 'single'
): SportsBetInfoSelectionParams[] =>
  sources.map(({ sportId, eventId, market, option, eventMarket }) => {
    const odds =
      mode === 'parlay' ? resolveParlayOdds(option) : resolveSelectionOdds(option, oddsType)
    if (odds === null) throw new Error('Selected odds format unavailable')
    return {
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
      OddsType: mode === 'parlay' ? 3 : oddsType,
      Odds: odds,
      Handicap: option.Handicap ?? null,
      Specifiers: option.Specifiers ?? null,
      PreBoostOdds: null
    }
  })

type BetInfoOptions = {
  open: Ref<boolean>
  mode: Ref<SportsBetMode>
  oddsType: Ref<SportsOddsType>
  parlayEligible: Ref<boolean>
  /** 原始选择标识，不受后台盘口可用性检查影响。 */
  interactionKey: Ref<string>
  selectionKey: Ref<string>
  getSources: () => BetInfoSource[]
}

export const useBetInfo = ({
  open,
  mode,
  oddsType,
  parlayEligible,
  interactionKey,
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
  // 独立于查询状态，避免后台取消/排队将凭据失败锁定清除。
  const credentialsBlocked = ref(false)
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
  const requestOwner = Symbol('sports-bet-info')
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let finishRetry: ((continueQuery: boolean) => void) | undefined
  const enabled = () =>
    !credentialsBlocked.value &&
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
    sportsStore.cancelBetInfo(requestOwner)
    loading.value = false
    ready.value = false
    state.value = credentialsBlocked.value ? 'credentials-unavailable' : 'idle'
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
    loading.value = true
    state.value = 'loading'
    let credentialsUnavailable = false
    try {
      // 单关可分别下注，缺少目标盘型的选项不能阻断其他单关的报价；串关必须完整。
      const querySources =
        mode.value === 'single'
          ? sources.filter(source => resolveSelectionOdds(source.option, oddsType.value) !== null)
          : sources
      if (!querySources.length) throw new Error('Selected odds format unavailable')
      const selections = buildBetInfoSelections(querySources, oddsType.value, mode.value)
      const params = {
        WagerType: mode.value === 'single' ? 1 : 2,
        WagerSelectionInfos: selections
      } as const
      let response = await sportsStore.fetchBetInfo(params, requestOwner)
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
        response = await sportsStore.fetchBetInfo(params, requestOwner)
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
      settings.value = Array.isArray(response.bs) ? response.bs.filter(Boolean) : []
      // 单关独立判断；明确失败的返回保留为失败项，不能回退成上一份可投报价。
      ready.value =
        mode.value === 'single'
          ? quotes.value.some(quote => isBetInfoQuoteUsable(quote, oddsType.value))
          : selections.every(selection =>
              quotes.value.some(
                quote =>
                  quote.rid === selection.RefId && isBetInfoQuoteUsable(quote, oddsType.value)
              )
            )
      if (
        !ready.value &&
        (!quotes.value.length || quotes.value.some(quote => !isBetInfoMarketClosed(quote)))
      ) {
        error.value = 'sports.betInfoFailed'
      }
    } catch (failure) {
      if (current === generation) {
        ready.value = false
        credentialsUnavailable = failure instanceof SportsCredentialsUnavailableError
        if (credentialsUnavailable) credentialsBlocked.value = true
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
    [() => sportsAuth.isReady, credentialsBlocked],
    ([isReady, blocked]) => {
      if (!isReady || !blocked) return
      credentialsBlocked.value = false
      refreshBetInfo()
    },
    { flush: 'post' }
  )

  // 重新打开、主动更换选项/模式或切换账号后允许重试；后台赔率变化不解锁。
  watch(
    () =>
      [
        open.value,
        mode.value,
        oddsType.value,
        interactionKey.value,
        sportsAuth.contextVersion
      ] as const,
    () => {
      credentialsBlocked.value = false
    },
    { flush: 'sync' }
  )

  // 只在投注单打开、选项或模式变化时查询，不定时轮询。
  watch(
    () =>
      [
        JSON.stringify([
          mode.value,
          oddsType.value,
          selectionKey.value,
          sportsStore.sportsSessionVersion
        ]),
        open.value,
        loggedIn.value,
        active.value,
        visible.value
      ] as const,
    () => {
      cancel()
      quotes.value = []
      settings.value = []
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
