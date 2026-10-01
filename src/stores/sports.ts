import { defineStore } from 'pinia'
import { computed, onScopeDispose, reactive, ref, shallowReactive, watch } from 'vue'
import type { ComputedRef } from 'vue'
import Api from '@/api'
import type {
  FavouriteEventParams,
  FavouriteEventResponse,
  GetBetInfoParams,
  GetCompetitionListParams,
  GetCompetitionListResponse,
  GetCompetitionPageParams,
  GetCompetitionPageResponse,
  GetSelectedEventInfoParams,
  GetSelectedEventInfoResponse,
  GetSportsV2Params,
  GetSportsV2Response,
  PlaceBetParams,
  PlaceBetResponse,
  SportCompetitionGroup,
  SportEvent,
  SportMarketLine,
  SportsLanguageCode,
  SportsMarket,
  SportsOddsType,
  SportsResponse,
  SportsSortType
} from '@/api/interface/sport'
import type { SportsRequestOptions } from '@/api/modules/sport'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { isApiBusinessSuccess } from '@/utils/apiBusiness'
import { getLanguageCode as getRequestLanguageCode } from '@/utils/request'

/** 当前选中的赛事筛选标签。 */
export type FilterTabKey = 'rolling' | 'today' | 'early' | 'parlay'

export type SportsRefreshTarget = { sportId: number; eventId: number }

/** 下单前拦截，尚未向体育网关发送请求。 */
export class SportsBetNotSentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SportsBetNotSentError'
  }
}

const FILTER_TAB_MARKETS: Readonly<Record<FilterTabKey, SportsMarket>> = {
  rolling: 3,
  today: 2,
  early: 1,
  parlay: 4
}

const MARKET_FILTER_TABS: Readonly<Record<SportsMarket, FilterTabKey>> = {
  1: 'early',
  2: 'today',
  3: 'rolling',
  4: 'parlay'
}

type SportsRequestError = {
  kind: 'config' | 'business' | 'response' | 'network'
  message: string
  code?: number | string
}

type SportsFavouriteResult =
  'success' | 'synced' | 'failed' | 'login-failed' | 'auth-expired' | 'stale'

type SportsCredentials = Readonly<{ memberCode: string; token: string }>

type SportsRequestState<Params, Response> = {
  params: Params | null
  /** 最近一次原始响应，业务失败时也保留，便于核对接口返回。 */
  response: Response | null
  /** 最近一次业务成功的数据；同条件刷新失败时不覆盖。 */
  data: Response | null
  loading: boolean
  error: SportsRequestError | null
}

const isSportsSuccess = (response: SportsResponse) => response.stc === 100 || response.stc === '100'
const isSportsAuthExpired = (response: SportsResponse) =>
  response.stc === 102 || response.stc === '102' || response.stc === 202 || response.stc === '202'
const ALL_SPORTS_PAGE_SIZE = 10
const MAX_ALL_SPORTS_PAGES = 200
const SELECTED_EVENT_BATCH_SIZE = 5
const MAX_PRIORITY_EVENT_BATCHES = 2
const MAX_CONCURRENT_LEAGUES = 3
const EVENT_CHECK_INTERVAL = 10_000
const SELECTED_LIVE_MAX_AGE = EVENT_CHECK_INTERVAL * 2

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/** 接口数据只含 JSON 值；内容相同时沿用旧引用。 */
const sameData = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) && Array.isArray(right))
    return (
      left.length === right.length && left.every((value, index) => sameData(value, right[index]))
    )
  if (!isRecord(left) || !isRecord(right)) return false
  const keys = Object.keys(left)
  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      key => Object.prototype.hasOwnProperty.call(right, key) && sameData(left[key], right[key])
    )
  )
}

export const reuseEqual = <T>(previous: T, incoming: T): T =>
  sameData(previous, incoming) ? previous : incoming

export const reuseList = <T>(previous: T[], incoming: T[]): T[] =>
  previous.length === incoming.length && previous.every((item, index) => item === incoming[index])
    ? previous
    : incoming

const mergeDefined = <T extends object>(previous: T, incoming: Partial<T>): T => {
  const next = Object.assign(
    {},
    previous,
    Object.fromEntries(
      Object.entries(incoming)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, reuseEqual(Reflect.get(previous, key), value)])
    )
  )
  return reuseEqual(previous, next)
}

/** 大页拆成小批更新，批次之间允许浏览器处理点击和绘制。 */
const mergeGroupBatches = async (
  groups: readonly SportCompetitionGroup[],
  apply: (groups: SportCompetitionGroup[]) => void,
  isCurrent: () => boolean
): Promise<boolean> => {
  const size = 20
  let batch: SportCompetitionGroup[] = []
  let count = 0
  for (const group of groups) {
    for (let offset = 0; offset < Math.max(1, group.Sports.length);) {
      if (!isCurrent()) return false
      const sports = group.Sports.slice(offset, offset + size - count)
      batch.push({ ...group, Sports: sports })
      const length = Math.max(1, sports.length)
      count += length
      offset += length
      if (count === size) {
        apply(batch)
        batch = []
        count = 0
        await new Promise<void>(resolve => setTimeout(resolve, 0))
      }
    }
  }
  if (!isCurrent()) return false
  if (batch.length) apply(batch)
  return true
}

type MarketRefreshScope = Pick<GetSelectedEventInfoParams, 'BetTypeIds' | 'PeriodIds'>

const marketSlot = (line: SportMarketLine) =>
  `${line.BetTypeId}:${line.PeriodId}:${line.MarketLineLevel}`

const mergeMarketLines = (
  previous: SportMarketLine[],
  incoming: SportMarketLine[] | undefined,
  scope?: MarketRefreshScope
) => {
  if (!Array.isArray(incoming)) return previous
  const previousById = new Map(previous.map(line => [line.MarketlineId, line]))
  const incomingSlots = new Set(incoming.map(marketSlot))
  // 详情替换查询范围；列表预览只替换返回的玩法、时段和级别。
  const isReplaced = (line: SportMarketLine) =>
    scope
      ? (scope.BetTypeIds === undefined || scope.BetTypeIds.includes(line.BetTypeId)) &&
        (scope.PeriodIds === undefined || scope.PeriodIds.includes(line.PeriodId))
      : incomingSlots.has(marketSlot(line))
  const lines = new Map(
    previous.filter(line => !isReplaced(line)).map(line => [line.MarketlineId, line])
  )
  for (const line of incoming) {
    const old = previousById.get(line.MarketlineId)
    // WagerSelections 使用新列表，不保留本次已移除的投注项。
    const oldSelections = new Map(old?.WagerSelections?.map(item => [item.WagerSelectionId, item]))
    const next =
      old && Array.isArray(line.WagerSelections)
        ? {
            ...line,
            WagerSelections: line.WagerSelections.map(item =>
              reuseEqual(oldSelections.get(item.WagerSelectionId) ?? item, item)
            )
          }
        : line
    lines.set(line.MarketlineId, old ? mergeDefined(old, next) : next)
  }
  return reuseList(previous, [...lines.values()])
}

const mergeEventFields = (
  previous: SportEvent,
  incoming: SportEvent,
  scope?: MarketRefreshScope
): SportEvent => {
  const { Competition, MarketLines, ...fields } = incoming
  return {
    ...mergeDefined(previous, fields),
    Competition:
      previous.Competition && Competition
        ? mergeDefined(previous.Competition, Competition)
        : (Competition ?? previous.Competition),
    MarketLines: mergeMarketLines(previous.MarketLines ?? [], MarketLines, scope)
  }
}

const getEventLiveFields = (event: SportEvent) => ({
  RBTime: event.RBTime,
  RBTimeStatus: event.RBTimeStatus,
  HomeScore: event.HomeScore,
  AwayScore: event.AwayScore,
  RelatedScores: event.RelatedScores
})

type EventLiveField = keyof ReturnType<typeof getEventLiveFields>
type EventLiveVersions = Partial<Record<EventLiveField, { revision: number; selectedAt?: number }>>
const EVENT_LIVE_FIELDS = [
  'RBTime',
  'RBTimeStatus',
  'HomeScore',
  'AwayScore',
  'RelatedScores'
] as const

type LeagueEventsState = {
  readRevision: number
  data: SportEvent[]
  response: GetCompetitionPageResponse | null
  nextPage: number
  receivedEventIds: Set<number>
  complete: boolean
  loading: boolean
  error: SportsRequestError | null
}

/** 同 ID 原位更新，新增赛事追加；预览与后续分页始终保留各自原有顺序。 */
const mergeSportEvents = (previous: SportEvent[], incoming: readonly SportEvent[]) => {
  const merged = new Map(previous.map(event => [event.EventId, event]))
  incoming.forEach(event => merged.set(event.EventId, event))
  return reuseList(previous, [...merged.values()])
}
// 缺少主列表盘型参照时沿用当前网关已验证的马来盘默认值，不转换返回赔率。
const DEFAULT_HOMEPAGE_ODDS_TYPE: SportsOddsType = 1

/** 各接口独立处理并发和错误，避免并行加载时互相覆盖。 */
const createSportsRequest = <Params, Response extends SportsResponse>(
  getBaseUrl: () => string,
  send: (baseUrl: string, params: Params, options?: SportsRequestOptions) => Promise<Response>,
  validate: (response: Response) => boolean
) => {
  const state = shallowReactive<SportsRequestState<Params, Response>>({
    params: null,
    response: null,
    data: null,
    loading: false,
    error: null
  })
  let generation = 0
  let controller: AbortController | undefined
  let pending: Promise<Response | null> | null = null
  let requestKey = ''

  const cancel = () => {
    generation += 1
    controller?.abort()
    controller = undefined
    pending = null
    state.loading = false
  }

  const load = (params: Params): Promise<Response | null> => {
    const baseUrl = getBaseUrl()
    const key = JSON.stringify([baseUrl, params])
    if (pending && key === requestKey) return pending
    cancel()
    const currentGeneration = generation
    if (key !== requestKey) {
      state.response = null
      state.data = null
    }
    requestKey = key
    state.params = params
    state.error = null
    if (!baseUrl) {
      state.error = { kind: 'config', message: 'Missing IM.im_app_url' }
      return Promise.resolve(null)
    }
    controller = new AbortController()
    const signal = controller.signal
    state.loading = true
    pending = (async () => {
      try {
        const response = await send(baseUrl, params, { signal })
        if (currentGeneration !== generation) return null
        state.response = response
        if (!isSportsSuccess(response)) {
          state.error = { kind: 'business', code: response.stc, message: response.std }
        } else if (!validate(response)) {
          state.error = { kind: 'response', message: 'Unexpected sports response structure' }
        } else {
          state.data = response
        }
        return response
      } catch {
        if (currentGeneration === generation && !signal.aborted) {
          state.error = { kind: 'network', message: 'Sports request failed' }
        }
        return null
      } finally {
        if (currentGeneration === generation) {
          state.loading = false
          pending = null
          controller = undefined
        }
      }
    })()
    return pending
  }

  const reset = () => {
    cancel()
    requestKey = ''
    state.params = null
    state.response = null
    state.data = null
    state.error = null
  }
  return { state, load, cancel, reset }
}

export const useSportsStore = defineStore('sports', () => {
  const siteConfigStore = useSiteConfigStore()
  const localeStore = useLocaleStore()
  const userStore = useUserStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  // 与导航及路由守卫保持相同的本站登录态判断。
  const isLoggedIn = computed(() =>
    Boolean(userStore.userInfo?.tradeToken || userStore.acctInfo?.memberId)
  )
  const oddsTypeEnum: Readonly<Record<SportsOddsType, string>> = Object.freeze({
    1: '马来盘',
    2: '香港盘',
    3: '欧洲盘',
    4: '印尼盘'
  })
  const languageKeys: Readonly<Partial<Record<string, SportsLanguageCode>>> = Object.freeze({
    eng: 'ENG',
    zh: 'CHS',
    vn: 'VN',
    hi: 'HI',
    pt_BR: 'PT',
    fil: 'ENG'
  })
  /** 沿用体育语言映射；未知语言回退中文，不扩展全站语言配置。 */
  const getLanguage = (): SportsLanguageCode => {
    const lang = localeStore.currentLanguage
    return Object.prototype.hasOwnProperty.call(languageKeys, lang)
      ? (languageKeys[lang] ?? 'CHS')
      : 'CHS'
  }
  const languageCode = computed(getLanguage)
  const getBaseUrl = () => siteConfigStore.getConfigString('IM.im_app_url')
  // 账号与 token 只保留同一次登录响应，整组替换/清空，仅在本次页面停留期间复用。
  const sportsSessionVersion = ref(0)
  const sportsCredentials = ref<SportsCredentials | null>(null)
  const sportsMemberCode = computed(() => sportsCredentials.value?.memberCode ?? null)
  const sportsToken = computed(() => sportsCredentials.value?.token ?? null)
  const sportsBalance = ref<number | null>(null)
  const sportsBalanceLoading = ref(false)
  const sportsBalanceError = ref<SportsRequestError | null>(null)
  let balancePending: Promise<boolean> | null = null
  let balanceController: AbortController | null = null
  const balanceRetryDelays = [1000, 3000] as const
  let balanceRetryCount = 0
  let balanceRetryTimer: ReturnType<typeof setTimeout> | undefined
  const clearBalanceRetry = () => {
    clearTimeout(balanceRetryTimer)
    balanceRetryTimer = undefined
  }
  const scheduleBalanceRetry = () => {
    if (
      !homepageActive ||
      !isLoggedIn.value ||
      !currentCurrencyCode.value ||
      balancePending ||
      balanceRetryTimer !== undefined ||
      balanceRetryCount >= balanceRetryDelays.length ||
      sportsBalanceError.value?.kind === 'config'
    )
      return
    const version = sportsSessionVersion.value
    const delay = balanceRetryDelays[balanceRetryCount++]
    balanceRetryTimer = setTimeout(() => {
      balanceRetryTimer = undefined
      if (version === sportsSessionVersion.value && homepageActive && isLoggedIn.value) {
        void fetchSportsBalance({ retry: true })
      }
    }, delay)
  }
  const resetSportsBalance = () => {
    clearBalanceRetry()
    balanceRetryCount = 0
    balanceController?.abort()
    balanceController = null
    balancePending = null
    sportsBalance.value = null
    sportsBalanceLoading.value = false
    sportsBalanceError.value = null
  }
  let memberCodePending: Promise<string | null> | null = null
  let memberCodeGeneration = 0
  let memberCodeAttempted = false
  let memberCodeNeedsRefresh = false
  let homepageActive = false
  onScopeDispose(() => {
    homepageActive = false
    resetSportsBalance()
  })
  let lastAuthRecovery: { generation: number; credentials: SportsCredentials | null } | null = null
  let favouriteRevision = 0
  const memberFavourites = shallowReactive(new Map<number, { value: boolean; revision: number }>())
  // 写结果尚未校准时，下次点击只读确认，不能再次切换服务端状态。
  const unconfirmedFavourites = new Set<number>()
  const retryJobs = shallowReactive(new Map<string, Promise<void>>())
  const invalidateSportsMemberCode = () => {
    memberCodeGeneration += 1
    sportsCredentials.value = null
    memberCodePending = null
    memberCodeAttempted = false
    memberCodeNeedsRefresh = false
    lastAuthRecovery = null
    retryJobs.clear()
  }
  watch(
    [
      () => userStore.userInfo?.tradeToken,
      () => userStore.userInfo?.memberId,
      () => userStore.acctInfo?.memberId,
      currentCurrencyCode,
      languageCode,
      getBaseUrl
    ],
    () => {
      sportsSessionVersion.value += 1
      resetSportsBalance()
      cancelBetInfo()
      invalidateSportsMemberCode()
      memberFavourites.clear()
      unconfirmedFavourites.clear()
      favouriteRevision = 0
    },
    { flush: 'sync' }
  )
  const ensureSportsMemberCode = (): Promise<string | null> => {
    if (!isLoggedIn.value || !currentCurrencyCode.value) return Promise.resolve(null)
    if (sportsMemberCode.value) return Promise.resolve(sportsMemberCode.value)
    if (memberCodePending) return memberCodePending
    const version = sportsSessionVersion.value
    const generation = memberCodeGeneration
    memberCodeAttempted = true
    const pending = (async () => {
      try {
        const response = await Api.game.getloginPlatform(
          {
            pgType: 'TY',
            platformCode: 'TG_TY',
            targetCurrency: currentCurrencyCode.value,
            // 站内接口与公共请求头同源，不使用第三方体育语言码。
            languageCode: getRequestLanguageCode()
          },
          { showSuccessToast: false, showErrorToast: false }
        )
        if (
          version !== sportsSessionVersion.value ||
          generation !== memberCodeGeneration ||
          !isLoggedIn.value
        ) {
          return null
        }
        const account = response.result?.platformAcct
        const token = response.result?.token
        if (
          !isApiBusinessSuccess(response) ||
          typeof account !== 'string' ||
          !account.trim() ||
          typeof token !== 'string' ||
          !token.trim()
        ) {
          if (homepageActive) {
            sportsBalanceError.value = {
              kind: 'business',
              code: response.code,
              message: 'Sports login unavailable'
            }
          }
          return null
        }
        sportsCredentials.value = { memberCode: account.trim(), token }
        memberCodeNeedsRefresh = true
        if (homepageActive && !sportsBalanceLoading.value) void fetchSportsBalance({ retry: true })
        return sportsMemberCode.value
      } catch {
        if (
          homepageActive &&
          version === sportsSessionVersion.value &&
          generation === memberCodeGeneration
        ) {
          sportsBalanceError.value = { kind: 'network', message: 'Sports login request failed' }
        }
        return null
      } finally {
        if (generation === memberCodeGeneration) {
          memberCodePending = null
          // 首次登录失败也要补查，不能只等手动刷新余额。
          if (!sportsCredentials.value) scheduleBalanceRetry()
        }
      }
    })()
    memberCodePending = pending
    return pending
  }
  /** 网关鉴权失败统一更新体育凭据，原响应照常交给调用方；不自动重放任何请求。 */
  const withSportsAuthRecovery =
    <Params, Response extends SportsResponse>(
      send: (baseUrl: string, params: Params, options?: SportsRequestOptions) => Promise<Response>,
      allowOutsideHomepage = false
    ) =>
    async (baseUrl: string, params: Params, options?: SportsRequestOptions): Promise<Response> => {
      const version = sportsSessionVersion.value
      const generation = memberCodeGeneration
      const credentials = sportsCredentials.value
      const response = await send(baseUrl, params, options)
      if (
        !isSportsAuthExpired(response) ||
        !isLoggedIn.value ||
        (!homepageActive && !allowOutsideHomepage) ||
        options?.signal?.aborted ||
        version !== sportsSessionVersion.value ||
        generation !== memberCodeGeneration ||
        credentials !== sportsCredentials.value ||
        (lastAuthRecovery?.generation === generation &&
          lastAuthRecovery.credentials === credentials)
      ) {
        return response
      }

      // 复用正在获取的凭据；没有在途登录时才作废旧凭据并重新获取。
      if (!memberCodePending) invalidateSportsMemberCode()
      // 失败后也保留已处理标记，避免同批迟到错误再次触发登录。
      lastAuthRecovery = {
        generation: memberCodeGeneration,
        credentials: sportsCredentials.value
      }
      await ensureSportsMemberCode()
      return response
    }
  // 仅包装返回 stc 的体育网关接口；本站热门列表仍使用自己的 code/result 契约。
  const sportsApi = {
    placeBet: withSportsAuthRecovery(Api.sport.placeBet, true),
    getBetInfo: withSportsAuthRecovery(Api.sport.getBetInfo),
    getBalance: withSportsAuthRecovery(Api.sport.getBalance),
    getAllSportCount: withSportsAuthRecovery(Api.sport.getAllSportCount),
    getSportsV2: withSportsAuthRecovery(Api.sport.getSportsV2),
    getSportEventIndexList: withSportsAuthRecovery(Api.sport.getSportEventIndexList),
    getCompetitionPage: withSportsAuthRecovery(Api.sport.getCompetitionPage),
    getPopularSports: withSportsAuthRecovery(Api.sport.getPopularSports),
    getSelectedEventInfo: withSportsAuthRecovery(Api.sport.getSelectedEventInfo),
    favouriteEvent: withSportsAuthRecovery(Api.sport.favouriteEvent)
  }
  /** 同账号、同币种刷新失败保留余额；离页或切换会话后丢弃旧响应。 */
  const fetchSportsBalance = ({ retry = false }: { retry?: boolean } = {}): Promise<boolean> => {
    if (balancePending) return balancePending
    if (!homepageActive || !isLoggedIn.value) return Promise.resolve(false)
    clearBalanceRetry()
    if (!retry) balanceRetryCount = 0
    const version = sportsSessionVersion.value
    const controller = new AbortController()
    balanceController = controller
    const isCurrent = () =>
      !controller.signal.aborted && version === sportsSessionVersion.value && homepageActive
    sportsBalanceLoading.value = true
    sportsBalanceError.value = null
    balancePending = Promise.resolve()
      .then(async () => {
        if (!isCurrent()) return false
        const baseUrl = getBaseUrl()
        if (!baseUrl) {
          sportsBalanceError.value = { kind: 'config', message: 'Missing IM.im_app_url' }
          return false
        }
        // 余额是只读查询，凭据更新后最多补查一次，不循环登录。
        for (let attempt = 0; attempt < 2; attempt += 1) {
          if (!isCurrent()) return false
          await ensureSportsMemberCode()
          if (!isCurrent()) return false
          const credentials = sportsCredentials.value
          if (!credentials) {
            sportsBalanceError.value ??= { kind: 'business', message: 'Sports login unavailable' }
            return false
          }
          const send = attempt === 0 ? sportsApi.getBalance : Api.sport.getBalance
          const response = await send(
            baseUrl,
            {
              Token: credentials.token,
              MemberCode: credentials.memberCode,
              TimeStamp: Date.now()
            },
            { signal: controller.signal }
          )
          if (!isCurrent()) return false
          if (credentials !== sportsCredentials.value) {
            if (attempt === 0 && sportsCredentials.value) continue
            sportsBalanceError.value = { kind: 'business', message: 'Sports credentials changed' }
            return false
          }
          if (!isSportsSuccess(response)) {
            sportsBalanceError.value = {
              kind: 'business',
              code: response.stc,
              message: response.std
            }
            return false
          }
          if (typeof response.av !== 'number' || !Number.isFinite(response.av)) {
            sportsBalanceError.value = { kind: 'response', message: 'Invalid sports balance' }
            return false
          }
          sportsBalance.value = response.av
          sportsBalanceError.value = null
          balanceRetryCount = 0
          return true
        }
        return false
      })
      .catch(() => {
        if (isCurrent()) {
          sportsBalanceError.value = { kind: 'network', message: 'Sports balance request failed' }
        }
        return false
      })
      .finally(() => {
        if (isCurrent()) {
          sportsBalanceLoading.value = false
          balancePending = null
          balanceController = null
          if (sportsBalanceError.value) scheduleBalanceRetry()
        }
      })
    return balancePending
  }
  /** 显式重试先获取凭据；普通筛选不走这里，失败后也不自动循环。 */
  const runSportsRetry = (
    key: string,
    action: (isCurrent: () => boolean) => void | Promise<unknown>
  ): Promise<void> => {
    if (!homepageActive) return Promise.resolve()
    const existing = retryJobs.get(key)
    if (existing) return existing
    const version = sportsSessionVersion.value
    const visit = memberCodeGeneration
    const isCurrent = () =>
      homepageActive && version === sportsSessionVersion.value && visit === memberCodeGeneration
    const pending = Promise.resolve()
      .then(async () => {
        if (!isCurrent()) return
        if (isLoggedIn.value && !(await ensureSportsMemberCode())) return
        if (!isCurrent()) return
        await action(isCurrent)
      })
      .finally(() => {
        if (retryJobs.get(key) === pending) retryJobs.delete(key)
      })
    retryJobs.set(key, pending)
    return pending
  }
  // 仅带会员账号的主列表可校准个人收藏，匿名补页不能反盖成功写入的结果。
  const syncMemberFavourites = (
    groups: readonly SportCompetitionGroup[],
    readRevision: number,
    memberCode: string | null | undefined
  ) => {
    if (!memberCode || memberCode !== sportsMemberCode.value) return
    for (const group of groups) {
      for (const event of group.Sports) {
        if (typeof event.IsFavourite !== 'boolean' || isFavouritePending(event.EventId)) continue
        const current = memberFavourites.get(event.EventId)
        if (!current || current.revision <= readRevision) {
          memberFavourites.set(event.EventId, {
            value: event.IsFavourite,
            revision: readRevision
          })
          unconfirmedFavourites.delete(event.EventId)
        }
      }
    }
  }
  const favouriteViews = new WeakMap<SportEvent, ComputedRef<SportEvent>>()
  const withMemberFavourite = (event: SportEvent): SportEvent => {
    let view = favouriteViews.get(event)
    if (!view) {
      view = computed<SportEvent>(previous => {
        const next = {
          ...event,
          IsFavourite: isLoggedIn.value
            ? (memberFavourites.get(event.EventId)?.value ?? event.IsFavourite === true)
            : false
        }
        return previous ? reuseEqual(previous, next) : next
      })
      favouriteViews.set(event, view)
    }
    return view.value
  }
  const selectedSportId = ref(1)
  const market = ref<SportsMarket>(3)
  // 接口分类是唯一原始状态；筛选标签由它派生，点击标签时反向更新分类。
  const selectedFilterKey = computed<FilterTabKey>({
    get: () => MARKET_FILTER_TABS[market.value],
    set: value => {
      market.value = FILTER_TAB_MARKETS[value]
    }
  })
  const sortType = ref<SportsSortType>(1)
  // 游客不能开启收藏置顶；组件及请求统一读取这一受登录态约束的值。
  const favouriteSelected = ref(false)
  const isFavourite = computed({
    get: () => isLoggedIn.value && favouriteSelected.value,
    set: (value: boolean) => {
      favouriteSelected.value = isLoggedIn.value && value
    }
  })
  watch(
    [isLoggedIn, () => userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId ?? null],
    () => {
      // 退出或切换账号后不继承此前的收藏选择，重新登录也保持默认关闭。
      favouriteSelected.value = false
    },
    { flush: 'sync' }
  )
  const pageNumber = ref(1)
  const pageSize = ref(10)
  const competitionIds = ref<number[]>([])
  const keyword = ref('')
  const earlyTradingDate = ref<string | null>(null)
  const homepageLoading = ref(false)
  const homepageError = ref<SportsRequestError | null>(null)
  let homepageGeneration = 0
  let loadedCountsContext = ''
  const eventsDataContext = ref('')
  const eventsRequestContext = ref('')

  // 同一赛事共用数据，迟到的列表响应不能覆盖较新的比分和赔率。
  const refreshedEvents = shallowReactive(
    new Map<
      string,
      {
        event: SportEvent
        revision: number
        checkedRevision?: number
        checkedAt?: number
        liveVersions: EventLiveVersions
        clockUpdatedAt: number
      }
    >()
  )
  let eventReadRevision = 0
  const eventKey = (sportId: number, eventId: number) => `${sportId}:${eventId}`
  const expiredEvents = shallowReactive(new Map<string, number>())
  const reappearedEvents = new Map<
    string,
    { revision: number; group?: SportCompetitionGroup; search: boolean }
  >()
  const queueReappearedEvents = (
    sportId: number,
    ids: readonly number[],
    revision: number,
    group?: SportCompetitionGroup,
    search = false
  ) => {
    const targets: SportsRefreshTarget[] = []
    for (const eventId of ids) {
      const key = eventKey(sportId, eventId)
      const expiredRevision = expiredEvents.get(key)
      const previous = reappearedEvents.get(key)
      if (
        expiredRevision === undefined ||
        revision <= expiredRevision ||
        (previous && revision < previous.revision)
      )
        continue
      reappearedEvents.set(key, {
        revision,
        group: group ?? previous?.group,
        search: group ? search : (previous?.search ?? false)
      })
      targets.push({ sportId, eventId })
    }
    // 新名单只是恢复线索，确认存在后才重新显示。
    if (targets.length) queueEventChecks(targets, { priority: true })
  }
  const isEventExpired = (sportId: number, eventId: number) =>
    expiredEvents.has(eventKey(sportId, eventId))
  const activeEvents = (sportId: number, items: readonly SportEvent[]) =>
    items.filter(event => !isEventExpired(sportId, event.EventId))
  const activeGroups = (sportId: number, groups: SportCompetitionGroup[]) =>
    reuseList(
      groups,
      groups.map(group => {
        const sports = activeEvents(sportId, group.Sports)
        if (sports.length === group.Sports.length) return group
        const removedCount = new Set(
          group.Sports.filter(event => isEventExpired(sportId, event.EventId)).map(
            event => event.EventId
          )
        ).size
        return {
          ...group,
          Sports: sports,
          competitionCount: Math.max(sports.length, group.competitionCount - removedCount)
        }
      })
    )
  const rememberEvent = (
    sportId: number,
    incoming: SportEvent,
    revision: number,
    {
      receivedAt = Date.now(),
      marketScope,
      selected = false
    }: { receivedAt?: number; marketScope?: MarketRefreshScope; selected?: boolean } = {}
  ) => {
    const key = eventKey(sportId, incoming.EventId)
    const previous = refreshedEvents.get(key)
    if (expiredEvents.has(key)) return incoming
    const incomingLive = getEventLiveFields(incoming)
    if (!previous) {
      const event = reactive({ ...incoming })
      const liveVersions: EventLiveVersions = {}
      if (selected)
        for (const field of EVENT_LIVE_FIELDS)
          if (incomingLive[field] !== undefined)
            liveVersions[field] = { revision, selectedAt: receivedAt }
      refreshedEvents.set(
        key,
        shallowReactive({
          event,
          revision,
          liveVersions,
          clockUpdatedAt: receivedAt
        })
      )
      return event
    }
    const updateFields = revision >= previous.revision
    const updateSelected =
      selected &&
      EVENT_LIVE_FIELDS.some(
        field =>
          incomingLive[field] !== undefined &&
          revision >= (previous.liveVersions[field]?.revision ?? 0)
      )
    if (!updateFields && !updateSelected) return previous.event
    // 迟到的补查只更新阶段和比分，不能补回已移除的盘口或投注项。
    const next = updateFields
      ? mergeEventFields(previous.event, incoming, marketScope)
      : { ...previous.event }
    const live = getEventLiveFields(previous.event)
    const liveVersions = { ...previous.liveVersions }
    const updateLiveField = <K extends EventLiveField>(field: K) => {
      const value = incomingLive[field]
      if (value === undefined) return
      const version = liveVersions[field]
      if (revision < (version?.revision ?? 0)) return
      if (selected) {
        // 只给本次返回的字段续期，缺失字段保留各自的过期时间。
        liveVersions[field] = { revision, selectedAt: receivedAt }
      } else {
        if (!updateFields) return
        if (
          version?.selectedAt !== undefined &&
          receivedAt - version.selectedAt < SELECTED_LIVE_MAX_AGE
        )
          return
        // 列表接管后，该字段不能再被迟到的旧补查覆盖。
        if (version) liveVersions[field] = { revision }
      }
      live[field] = reuseEqual(live[field], value)
    }
    for (const field of EVENT_LIVE_FIELDS) updateLiveField(field)
    const timeChanged = live.RBTime !== previous.event.RBTime
    const wasPaused = previous.event.RBTimeStatus === 3
    const isPaused = live.RBTimeStatus === 3
    Object.assign(previous.event, { ...next, ...live })
    if (updateFields) previous.revision = revision
    previous.liveVersions = liveVersions
    // 重复时间不重置秒表；暂停、恢复或时间变化时重新校准。
    if (timeChanged || wasPaused !== isPaused) previous.clockUpdatedAt = receivedAt
    return previous.event
  }
  const rememberGroups = (
    sportId: number,
    groups: SportCompetitionGroup[],
    revision: number,
    receivedAt = Date.now(),
    trackLeagues = false
  ) => {
    for (const group of groups)
      queueReappearedEvents(
        sportId,
        group.Sports.map(event => event.EventId),
        revision,
        group,
        !trackLeagues
      )
    return activeGroups(
      sportId,
      trackLeagues ? groups.map(group => rememberLeagueGroup(group, revision)) : groups
    ).map(group => ({
      ...group,
      Sports: group.Sports.map(event => rememberEvent(sportId, event, revision, { receivedAt }))
    }))
  }
  const getRefreshEvent = (sportId: number, eventId: number) =>
    refreshedEvents.get(eventKey(sportId, eventId))?.event
  const getEventRevision = (sportId: number, eventId: number) =>
    refreshedEvents.get(eventKey(sportId, eventId))?.revision ?? 0
  const getEventClockUpdatedAt = (sportId: number, eventId: number) =>
    refreshedEvents.get(eventKey(sportId, eventId))?.clockUpdatedAt ?? Date.now()

  // 有效性只比较补查版本，V2 更新不能盖过下架结果。
  const updateSelectedEvents = (
    sportId: number,
    eventIds: readonly number[],
    incoming: SportEvent[],
    revision: number,
    marketScope: MarketRefreshScope
  ) => {
    const returnedIds = new Set(incoming.map(event => event.EventId))
    let removed = false
    for (const id of eventIds) {
      const key = eventKey(sportId, id)
      const latestRevision = Math.max(
        refreshedEvents.get(key)?.checkedRevision ?? 0,
        expiredEvents.get(key) ?? 0
      )
      if (returnedIds.has(id) || revision < latestRevision) continue
      expiredEvents.set(key, revision)
      refreshedEvents.delete(key)
      removed = true
    }
    for (const event of incoming) {
      const key = eventKey(sportId, event.EventId)
      if (revision < (refreshedEvents.get(key)?.checkedRevision ?? 0)) continue
      const expiredRevision = expiredEvents.get(key)
      if (expiredRevision !== undefined) {
        if (revision <= expiredRevision) continue
        expiredEvents.delete(key)
      }
      rememberEvent(sportId, event, revision, { marketScope, selected: true })
      const cached = refreshedEvents.get(key)
      if (cached) {
        cached.checkedRevision = revision
        // 单盘口查询不延后完整复核。
        if (!marketScope.BetTypeIds?.length) cached.checkedAt = Date.now()
      }
      const candidate = reappearedEvents.get(key)
      if (!candidate?.group || !cached || sportId !== selectedSportId.value) continue
      const id = candidate.group.CompetitionId
      const group = {
        ...(candidate.search
          ? candidate.group
          : (leagueSnapshots.get(id)?.group ?? candidate.group)),
        Sports: [cached.event]
      }
      group.competitionCount = Math.max(1, group.competitionCount)
      if (candidate.search) {
        if (eventsDataContext.value === getEventsContext() && events.state.data)
          events.state.data = {
            ...events.state.data,
            e: mergeRefreshGroups(events.state.data.e ?? [], [group])
          }
      } else if (allSportsDataScope.value === getAllSportsContext()) {
        emptyLeagueRevisions.delete(id)
        allSportsState.data = mergeRefreshGroups(allSportsState.data, [group])
        // 明细缓存保留已确认项，后续分页发布旧预览时也不会丢失。
        const detail = getLeagueLoadState(id) ?? createLeagueEventsState()
        detail.data = mergeSportEvents(detail.data, [cached.event])
        leagueDetails.set(id, detail)
      }
    }
    if (!removed) return
    if (selectedSportId.value === sportId) {
      if (allSportsDataScope.value === getAllSportsContext())
        allSportsState.data = activeGroups(sportId, allSportsState.data)
      if (leagueDetailsContext === getLeagueDetailsContext()) {
        for (const state of leagueDetails.values()) state.data = activeEvents(sportId, state.data)
      }
      if (hotDetailsContext.value === getAllSportsContext())
        hotDetailsState.data = activeEvents(sportId, hotDetailsState.data)
    }
    if (events.state.params?.SportId === sportId && events.state.data) {
      events.state.data = {
        ...events.state.data,
        e: activeGroups(sportId, events.state.data.e ?? [])
      }
    }
    if (competitionListState.data) {
      competitionListState.data = {
        ...competitionListState.data,
        result: competitionListState.data.result?.filter(
          record => !isEventExpired(record.sportId, record.eventId)
        )
      }
    }
    if (selectedSportId.value === sportId) cleanupEmptyLeagues()
  }

  // 滚球 今日 早盘 串关数据
  const counts = createSportsRequest(getBaseUrl, sportsApi.getAllSportCount, response =>
    Array.isArray(response.spc)
  )

  // 所有联赛数据
  const events = createSportsRequest(getBaseUrl, sportsApi.getSportsV2, response =>
    Array.isArray(response.e)
  )

  // 索引汇总
  const indexes = createSportsRequest(getBaseUrl, sportsApi.getSportEventIndexList, response =>
    Array.isArray(response.e)
  )

  // 联赛下的详细赛事
  const competition = createSportsRequest(getBaseUrl, sportsApi.getCompetitionPage, response =>
    Array.isArray(response.e)
  )

  const popular = createSportsRequest(getBaseUrl, sportsApi.getPopularSports, response =>
    Array.isArray(response.e)
  )
  const betInfo = createSportsRequest(
    getBaseUrl,
    sportsApi.getBetInfo,
    response => Array.isArray(response.wsis) && Array.isArray(response.bs)
  )
  let betInfoGeneration = 0
  let betInfoController: AbortController | undefined
  const cancelBetInfo = () => {
    betInfoGeneration += 1
    betInfoController?.abort()
    betInfoController = undefined
    betInfo.reset()
  }
  const fetchBetInfo = async (
    query: Pick<GetBetInfoParams, 'WagerType' | 'WagerSelectionInfos'>
  ) => {
    cancelBetInfo()
    const generation = betInfoGeneration
    const version = sportsSessionVersion.value
    const controller = new AbortController()
    betInfoController = controller
    const isCurrent = () =>
      homepageActive && version === sportsSessionVersion.value && generation === betInfoGeneration
    if (!homepageActive || !isLoggedIn.value || !query.WagerSelectionInfos.length) return null
    const checkParlay = () => {
      if (query.WagerType !== 2) return true
      const items = query.WagerSelectionInfos
      const eligible =
        items.length >= 2 && new Set(items.map(item => item.EventId)).size === items.length
      if (!eligible) {
        betInfo.state.error = { kind: 'business', code: 439, message: 'Parlay unavailable' }
      }
      return eligible
    }
    if (!checkParlay()) return null
    const memberCode = await ensureSportsMemberCode()
    if (
      !homepageActive ||
      version !== sportsSessionVersion.value ||
      generation !== betInfoGeneration
    )
      return null
    const token = sportsToken.value
    if (!memberCode || !token) {
      betInfo.state.error = { kind: 'business', message: 'Sports login unavailable' }
      return null
    }
    const selections = query.WagerSelectionInfos.map(item => ({ ...item }))
    // 串关单独取欧洲盘，不改首页的盘型，也不猜测 A–G 赔率分组。
    if (query.WagerType === 2) {
      const sportIds = [
        ...new Set(selections.filter(item => item.OddsType !== 3).map(item => item.SportId))
      ]
      try {
        for (const sportId of sportIds) {
          const items = selections.filter(item => item.SportId === sportId && item.OddsType !== 3)
          const eventIds = [...new Set(items.map(item => item.EventId))]
          for (let offset = 0; offset < eventIds.length; offset += SELECTED_EVENT_BATCH_SIZE) {
            const batch = eventIds.slice(offset, offset + SELECTED_EVENT_BATCH_SIZE)
            const response = await sportsApi.getSelectedEventInfo(
              getBaseUrl(),
              {
                SportId: sportId,
                EventIds: batch,
                OddsType: 3,
                IsCombo: true,
                IncludeGroupEvents: false,
                LanguageCode: getLanguage()
              },
              { signal: controller.signal }
            )
            if (!isCurrent()) return null
            if (!isSportsSuccess(response) || !Array.isArray(response.e))
              throw new Error('European odds unavailable')
            for (const item of items.filter(item => batch.includes(item.EventId))) {
              const event = response.e.find(event => event.EventId === item.EventId)
              const line = event?.MarketLines?.find(line => line.MarketlineId === item.MarketlineId)
              const option = line?.WagerSelections.find(
                option => option.WagerSelectionId === item.WagerSelectionId
              )
              if (!option || option.OddsType !== 3 || !Number.isFinite(option.Odds))
                throw new Error('European odds unavailable')
              item.OddsType = 3
              item.Odds = option.Odds
            }
          }
        }
      } catch {
        if (isCurrent())
          betInfo.state.error = { kind: 'response', message: 'European odds unavailable' }
        return null
      }
    }
    if (!isCurrent()) return null
    return betInfo.load({
      ...query,
      WagerSelectionInfos: selections,
      Token: token,
      MemberCode: memberCode,
      LanguageCode: getLanguage(),
      TimeStamp: Date.now()
    })
  }
  /** 写请求独立发送，不因另一笔单关或离页而取消；鉴权失败只刷新凭据。 */
  const placeBet = async (
    query: Pick<
      PlaceBetParams,
      'WagerType' | 'WagerSelectionInfos' | 'ComboSelections' | 'IsComboAcceptAnyOdds'
    >
  ): Promise<PlaceBetResponse> => {
    const version = sportsSessionVersion.value
    const baseUrl = getBaseUrl()
    if (!isLoggedIn.value || !baseUrl) throw new SportsBetNotSentError('Sports login unavailable')
    if (!query.WagerSelectionInfos.length || !query.ComboSelections.length)
      throw new SportsBetNotSentError('No bet selections')
    const memberCode = await ensureSportsMemberCode()
    const token = sportsToken.value
    if (version !== sportsSessionVersion.value || !isLoggedIn.value)
      throw new SportsBetNotSentError('Sports session changed')
    if (!memberCode || !token) throw new SportsBetNotSentError('Sports login unavailable')
    const response = await sportsApi.placeBet(baseUrl, {
      ...query,
      MemberCode: memberCode,
      Token: token,
      LanguageCode: getLanguage(),
      TimeStamp: Date.now()
    })
    // 原请求的结果仍用于清理提交记录，当前页面是否更新由调用方判断。
    return response
  }
  // 写请求不进入可取消的查询资源，避免另一场点击或页面离开中断已发出的操作。
  const favouriteState = shallowReactive<
    SportsRequestState<FavouriteEventParams, FavouriteEventResponse>
  >({ params: null, response: null, data: null, loading: false, error: null })
  const favouriteJobs = shallowReactive(new Map<string, Promise<SportsFavouriteResult>>())
  const resources = [counts, events, indexes, competition, popular]

  // 全联赛缓存独立于搜索和联赛选择，按排序及收藏置顶条件隔离；response 仅保留最近一页。
  const allSportsState = shallowReactive<{
    params: GetSportsV2Params | null
    response: GetSportsV2Response | null
    data: SportCompetitionGroup[]
    loading: boolean
    complete: boolean
    /** 联赛/时间排序均返回联赛总数；不是赛事总数。 */
    total: number
    error: SportsRequestError | null
  }>({
    params: null,
    response: null,
    data: [],
    loading: false,
    complete: false,
    total: 0,
    error: null
  })
  const allSportsDataContext = ref('')
  const allSportsDataScope = ref('')
  const getAllSportsContext = () =>
    JSON.stringify([
      getBaseUrl(),
      languageCode.value,
      selectedSportId.value,
      market.value,
      sportsSessionVersion.value
    ])
  const getAllSportsQueryContext = () =>
    JSON.stringify([getAllSportsContext(), sortType.value, isFavourite.value])
  let allSportsController: AbortController | undefined
  let allSportsPending: Promise<SportCompetitionGroup[] | null> | null = null
  const allSportsRequestContext = ref('')
  const allSportsRequestScope = ref('')
  let allSportsRefreshPending = false
  const cancelAllSports = () => {
    allSportsController?.abort()
    allSportsController = undefined
    allSportsPending = null
    allSportsState.loading = false
  }
  // 收藏只改变排序；联赛候选及热门补全仍可使用同球种、分类下最近的预览。
  const allLeagueGroups = computed(() =>
    allSportsDataScope.value === getAllSportsContext()
      ? filterEmptyLeagueGroups(activeGroups(selectedSportId.value, allSportsState.data))
      : []
  )

  // 每个联赛独立缓存与页码；搜索结果不读写这一份补查缓存。
  const leagueDetails = shallowReactive(new Map<number, LeagueEventsState>())
  const createLeagueEventsState = () =>
    shallowReactive<LeagueEventsState>({
      readRevision: 0,
      data: [],
      response: null,
      nextPage: 1,
      receivedEventIds: new Set<number>(),
      complete: false,
      loading: false,
      error: null
    })
  const leagueSnapshots = shallowReactive(
    new Map<number, { revision: number; group: SportCompetitionGroup }>()
  )
  const emptyLeagueRevisions = shallowReactive(new Map<number, number>())
  const leagueRecheckIds = new Set<number>()
  watch(
    getAllSportsContext,
    () => {
      leagueSnapshots.clear()
      emptyLeagueRevisions.clear()
      leagueRecheckIds.clear()
    },
    { flush: 'sync' }
  )
  const getLeagueDetailsContext = () => JSON.stringify([getAllSportsContext(), sortType.value])
  let leagueDetailsContext = getLeagueDetailsContext()
  let requestedLeagueIds = new Set<number>()
  const leagueJobs = new Map<
    number,
    { controller: AbortController; pending: Promise<SportEvent[] | null> }
  >()
  const cancelLeague = (id: number) => {
    leagueJobs.get(id)?.controller.abort()
    leagueJobs.delete(id)
    const state = leagueDetails.get(id)
    if (state) state.loading = false
  }
  const cancelLeagueRequests = () => {
    requestedLeagueIds.clear()
    leagueRecheckIds.clear()
    for (const id of leagueJobs.keys()) cancelLeague(id)
  }
  const getLeagueLoadState = (id: number) =>
    leagueDetailsContext === getLeagueDetailsContext() ? leagueDetails.get(id) : undefined

  const recheckLeague = (group: SportCompetitionGroup, revision: number) => {
    const id = group.CompetitionId
    const detail = getLeagueLoadState(id)
    const knownIds = new Set(
      activeEvents(selectedSportId.value, [...group.Sports, ...(detail?.data ?? [])]).map(
        event => event.EventId
      )
    )
    const [activeGroup] = activeGroups(selectedSportId.value, [group])
    const needsMoreEvents =
      requestedLeagueIds.has(id) && activeGroup.competitionCount > knownIds.size
    if (
      !keyword.value.trim() &&
      !leagueJobs.has(id) &&
      group.competitionCount > 0 &&
      (!knownIds.size || needsMoreEvents) &&
      (!detail || detail.readRevision < revision)
    ) {
      // 空联赛或已展开联赛缺场时，从第一页复核，保留原列表。
      cancelLeague(id)
      if (detail) {
        detail.nextPage = 1
        detail.receivedEventIds.clear()
        detail.readRevision = 0
        detail.complete = false
        detail.error = null
      }
      leagueRecheckIds.add(id)
      pumpLeagueRequests()
    }
  }
  const rememberLeagueGroup = (group: SportCompetitionGroup, revision: number) => {
    const id = group.CompetitionId
    const emptyRevision = emptyLeagueRevisions.get(id)
    // 旧响应仍参与接口分页计数，但不能把空联赛重新显示出来。
    if (emptyRevision !== undefined && revision <= emptyRevision)
      return { ...group, Sports: [], competitionCount: 0 }
    const previous = leagueSnapshots.get(id)
    if (previous && revision < previous.revision) return previous.group
    leagueSnapshots.set(id, { revision, group })
    emptyLeagueRevisions.delete(id)
    recheckLeague(group, revision)
    return group
  }

  const filterEmptyLeagueGroups = (groups: SportCompetitionGroup[], includeDetails = true) => {
    const sportId = selectedSportId.value
    return reuseList(
      groups,
      groups.flatMap(group => {
        const detail = includeDetails ? getLeagueLoadState(group.CompetitionId) : undefined
        const snapshot = leagueSnapshots.get(group.CompetitionId)
        const preview = snapshot?.group
        const previewIds = new Set(preview?.Sports.map(event => event.EventId))
        const receivedIds = new Set([...previewIds, ...(detail?.receivedEventIds ?? [])])
        const completeDetail =
          detail?.complete &&
          !detail.loading &&
          !detail.error &&
          detail.readRevision >= (snapshot?.revision ?? 0) &&
          preview &&
          (preview.competitionCount === 0 || previewIds.size > 0) &&
          receivedIds.size >= preview.competitionCount
        const knownIds = new Set([
          ...group.Sports.map(event => event.EventId),
          ...activeEvents(sportId, detail?.data ?? []).map(event => event.EventId)
        ])
        if (knownIds.size)
          return [
            completeDetail && group.competitionCount !== knownIds.size
              ? { ...group, competitionCount: knownIds.size }
              : group.competitionCount >= knownIds.size
                ? group
                : { ...group, competitionCount: knownIds.size }
          ]
        if (emptyLeagueRevisions.has(group.CompetitionId)) return []
        if (!includeDetails) return group.competitionCount === 0 ? [] : [group]
        const emptyPreview =
          preview &&
          preview.competitionCount <= previewIds.size &&
          [...previewIds].every(id => isEventExpired(sportId, id))
        // 新的空预览不受旧分页失败影响，但不能盖过更新的在途请求。
        if (emptyPreview && (!detail || snapshot.revision >= detail.readRevision)) return []
        if (detail && (detail.loading || detail.error || !detail.complete)) return [group]
        // 补充分页不含前五场，必须连同预览覆盖全部赛事才能确认。
        const confirmedEmpty =
          emptyPreview ||
          (completeDetail && [...detail.receivedEventIds].every(id => isEventExpired(sportId, id)))
        return confirmedEmpty ? [] : [group]
      })
    )
  }
  const cleanupEmptyLeagues = (revision = 0) => {
    if (allSportsDataScope.value !== getAllSportsContext()) return
    const previous = allSportsState.data
    const next = filterEmptyLeagueGroups(previous)
    for (const group of next) {
      const snapshot = leagueSnapshots.get(group.CompetitionId)
      if (snapshot) recheckLeague(snapshot.group, Math.max(snapshot.revision, revision))
    }
    if (next.length === previous.length) return
    const retained = new Set(next.map(group => group.CompetitionId))
    const removed = new Set(
      previous.filter(group => !retained.has(group.CompetitionId)).map(group => group.CompetitionId)
    )
    allSportsState.data = next
    for (const id of removed) {
      if (!emptyLeagueRevisions.has(id)) {
        const snapshot = leagueSnapshots.get(id)
        const detail = getLeagueLoadState(id)
        let revision = Math.max(snapshot?.revision ?? 0, detail?.readRevision ?? 0)
        for (const eventId of [
          ...(snapshot?.group.Sports.map(event => event.EventId) ?? []),
          ...(detail?.receivedEventIds ?? [])
        ]) {
          revision = Math.max(
            revision,
            expiredEvents.get(eventKey(selectedSportId.value, eventId)) ?? 0
          )
        }
        // 只拦截早于本联赛清空证据的响应，不使用其他请求的版本。
        emptyLeagueRevisions.set(id, revision)
      }
      cancelLeague(id)
      leagueDetails.delete(id)
      requestedLeagueIds.delete(id)
      leagueRecheckIds.delete(id)
    }
    // 选中的联赛已清空时回到全部，保留其余有效的多选项。
    if (competitionIds.value.some(id => removed.has(id)))
      competitionIds.value = competitionIds.value.filter(id => !removed.has(id))
  }

  const fetchLeagueEvents = (id: number): Promise<SportEvent[] | null> => {
    if (keyword.value.trim() || !getBaseUrl() || !Number.isSafeInteger(id) || id <= 0) {
      return Promise.resolve(null)
    }
    const existing = leagueJobs.get(id)
    if (existing) return existing.pending
    const state = leagueDetails.get(id) ?? createLeagueEventsState()
    leagueDetails.set(id, state)
    if (state.complete) return Promise.resolve(state.data)
    const controller = new AbortController()
    const context = getLeagueDetailsContext()
    const baseUrl = getBaseUrl()
    const common = {
      LanguageCode: languageCode.value,
      Market: market.value,
      SportId: selectedSportId.value,
      SortType: sortType.value,
      CompetitionIds: [id],
      PageSize: ALL_SPORTS_PAGE_SIZE
    }
    state.loading = true
    state.error = null
    const isCurrent = () =>
      !controller.signal.aborted &&
      leagueJobs.get(id)?.controller === controller &&
      context === getLeagueDetailsContext() &&
      !keyword.value.trim()
    // 先注册任务再发请求，兼容同步拒绝并保证并发计数准确。
    const pending = Promise.resolve().then(async () => {
      try {
        const rechecking = leagueRecheckIds.has(id)
        if (rechecking && isCurrent()) {
          // 先重取前五场，不能用补充分页的空结果代替整个联赛。
          const revision = ++eventReadRevision
          state.readRevision = revision
          state.nextPage = 1
          state.receivedEventIds.clear()
          const response = await sportsApi.getSportsV2(
            baseUrl,
            {
              ...common,
              competitionCondType: 2,
              PageNumber: 1,
              Keyword: '',
              IsFavourite: isFavourite.value,
              earlyTradingDate: null,
              MemberCode: sportsMemberCode.value
            },
            { signal: controller.signal }
          )
          if (!isCurrent()) return null
          if (!isSportsSuccess(response)) {
            state.error = { kind: 'business', code: response.stc, message: response.std }
            return null
          }
          if (
            !Array.isArray(response.e) ||
            response.Total !== response.e.length ||
            response.e.length > 1 ||
            response.e.some(
              group =>
                !group ||
                group.CompetitionId !== id ||
                !Number.isInteger(group.competitionCount) ||
                group.competitionCount < 0 ||
                !Array.isArray(group.Sports) ||
                group.Sports.some(
                  event =>
                    !event ||
                    !Number.isSafeInteger(event.EventId) ||
                    event.EventId <= 0 ||
                    event.Competition?.CompetitionId !== id ||
                    !Array.isArray(event.MarketLines)
                )
            )
          ) {
            state.error = { kind: 'response', message: 'Unexpected league preview response' }
            return null
          }
          const previous = leagueSnapshots.get(id)?.group
          const group =
            response.e[0] ??
            (previous ? { ...previous, Sports: [], competitionCount: 0 } : undefined)
          if (!group) return null
          const [preview] = rememberGroups(common.SportId, [group], revision, Date.now(), true)
          // 单联赛新预览也留在明细缓存，避免首页后续分页发布旧预览时丢失。
          state.data = mergeSportEvents(state.data, preview.Sports)
          allSportsState.data = mergeRefreshGroups(allSportsState.data, [preview])
          if (group.competitionCount > 0 && !group.Sports.length) {
            state.error = { kind: 'response', message: 'League preview is incomplete' }
            return null
          }
          if (group.competitionCount === 0) state.complete = true
        }
        while (isCurrent() && !state.complete) {
          if (state.nextPage > MAX_ALL_SPORTS_PAGES) {
            state.error = { kind: 'response', message: 'League page limit exceeded' }
            return null
          }
          const revision = ++eventReadRevision
          if (state.nextPage === 1 && !rechecking) state.readRevision = revision
          const response = await sportsApi.getCompetitionPage(
            baseUrl,
            { ...common, PageNumber: state.nextPage },
            { signal: controller.signal }
          )
          if (!isCurrent()) return null
          state.response = response
          if (!isSportsSuccess(response)) {
            state.error = { kind: 'business', code: response.stc, message: response.std }
            return null
          }
          if (
            !Array.isArray(response.e) ||
            (typeof response.hasNextPage !== 'boolean' &&
              !(response.e.length === 0 && response.Total === 0)) ||
            response.e.some(
              event =>
                !event ||
                !Number.isSafeInteger(event.EventId) ||
                event.EventId <= 0 ||
                event.Competition?.CompetitionId !== id ||
                !Array.isArray(event.MarketLines)
            )
          ) {
            state.error = { kind: 'response', message: 'Unexpected league events response' }
            return null
          }
          // 只对比本轮已收到的赛事，旧缓存不参与重复页判断。
          const madeProgress = response.e.some(event => !state.receivedEventIds.has(event.EventId))
          if (
            (response.hasNextPage && !response.e.length) ||
            (state.nextPage > 1 && response.e.length > 0 && !madeProgress)
          ) {
            state.error = { kind: 'response', message: 'Repeated league page without progress' }
            return null
          }
          const preview = leagueSnapshots.get(id)?.group
          queueReappearedEvents(
            common.SportId,
            response.e.map(event => event.EventId),
            revision,
            preview ? { ...preview, Sports: response.e } : undefined
          )
          state.data = mergeSportEvents(
            state.data,
            activeEvents(common.SportId, response.e).map(event =>
              rememberEvent(common.SportId, event, revision)
            )
          )
          for (const event of response.e) state.receivedEventIds.add(event.EventId)
          state.nextPage += 1
          state.complete = !response.hasNextPage
        }
        return state.data
      } catch {
        if (isCurrent()) state.error = { kind: 'network', message: 'League request failed' }
        return null
      } finally {
        if (leagueJobs.get(id)?.controller === controller) {
          leagueJobs.delete(id)
          state.loading = false
          // 失败保留复核任务，等下一轮列表刷新后再重试。
          if (state.complete) leagueRecheckIds.delete(id)
          cleanupEmptyLeagues()
          pumpLeagueRequests()
        }
      }
    })
    leagueJobs.set(id, { controller, pending })
    return pending
  }
  const pumpLeagueRequests = () => {
    if (
      keyword.value.trim() ||
      loadedCountsContext !== JSON.stringify([getBaseUrl(), languageCode.value])
    )
      return
    for (const id of new Set([...requestedLeagueIds, ...leagueRecheckIds])) {
      if (leagueJobs.size >= MAX_CONCURRENT_LEAGUES) break
      const state = getLeagueLoadState(id)
      if (!state?.complete && !state?.error && !leagueJobs.has(id)) void fetchLeagueEvents(id)
    }
  }
  const syncLeagueRequests = (ids: number[]) => {
    const next = new Set(
      keyword.value.trim() ? [] : ids.filter(id => Number.isSafeInteger(id) && id > 0)
    )
    for (const id of leagueJobs.keys())
      if (!next.has(id) && !leagueRecheckIds.has(id)) cancelLeague(id)
    for (const id of next) {
      // 重新展开从第一页刷新，保留旧赛事，避免列表闪空。
      if (!requestedLeagueIds.has(id) && !leagueJobs.has(id)) {
        const state = getLeagueLoadState(id)
        if (state) {
          state.nextPage = 1
          state.readRevision = 0
          state.receivedEventIds.clear()
          state.complete = false
          state.error = null
        }
      }
    }
    requestedLeagueIds = next
    pumpLeagueRequests()
  }
  const resumeLeague = (id: number) => {
    if (!requestedLeagueIds.has(id)) return
    const state = getLeagueLoadState(id)
    if (state) state.error = null
    pumpLeagueRequests()
  }
  const retryLeague = (id: number) => runSportsRetry(`league:${id}`, () => resumeLeague(id))
  watch(
    [getLeagueDetailsContext, () => keyword.value.trim()],
    ([context]) => {
      cancelLeagueRequests()
      if (leagueDetailsContext !== context) {
        leagueDetails.clear()
        leagueDetailsContext = context
      }
    },
    { flush: 'sync' }
  )
  const fetchAllSports = ({ keepPrevious = false } = {}): Promise<
    SportCompetitionGroup[] | null
  > => {
    const scope = getAllSportsContext()
    const context = getAllSportsQueryContext()
    if (allSportsPending && allSportsRequestContext.value === context) return allSportsPending
    cancelAllSports()
    // 仅切换列表排序不刷新热门详情；补全接口不依赖排序或收藏置顶。
    if (
      !keepPrevious &&
      (allSportsRequestScope.value !== scope || allSportsRequestContext.value === context)
    ) {
      cancelHotDetails()
      completedHotDetailsKey = ''
    }
    allSportsRequestContext.value = context
    allSportsRequestScope.value = scope
    if (allSportsDataScope.value !== scope) {
      allSportsState.data = []
      allSportsDataScope.value = ''
    }
    if (allSportsDataContext.value !== context) {
      allSportsState.complete = false
      allSportsState.total = 0
      allSportsDataContext.value = ''
    }
    allSportsState.response = null
    allSportsState.params = null
    allSportsState.error = null
    const baseUrl = getBaseUrl()
    if (!baseUrl) {
      allSportsState.error = { kind: 'config', message: 'Missing IM.im_app_url' }
      return Promise.resolve(null)
    }
    const controller = new AbortController()
    allSportsController = controller
    const isCurrent = () =>
      allSportsController === controller &&
      !controller.signal.aborted &&
      context === getAllSportsQueryContext()
    const params: GetSportsV2Params = {
      SportId: selectedSportId.value,
      Market: market.value,
      LanguageCode: languageCode.value,
      competitionCondType: 1,
      PageNumber: 1,
      PageSize: ALL_SPORTS_PAGE_SIZE,
      SortType: sortType.value,
      CompetitionIds: [],
      Keyword: '',
      IsFavourite: isFavourite.value,
      earlyTradingDate: null,
      MemberCode: sportsMemberCode.value
    }
    const retainPrevious =
      keepPrevious && allSportsDataContext.value === context && allSportsState.data.length > 0
    const fail = (message: string) => {
      allSportsState.error = { kind: 'response', message }
      return null
    }
    const publish = (groups: Map<number, SportCompetitionGroup>) => {
      // 收藏排序属于后台刷新，完整成功后再替换，避免中间页缩短列表及页码。
      if (retainPrevious) return
      // 每页成功即替换为本轮累积结果，组件不必等待所有联赛页完成。
      allSportsState.data = activeGroups(params.SportId, [...groups.values()])
      allSportsState.complete = false
      allSportsDataScope.value = scope
      allSportsDataContext.value = context
    }
    const readPages = async (): Promise<SportCompetitionGroup[] | null> => {
      const groups = new Map<number, SportCompetitionGroup>()
      const seenPages = new Set<string>()
      let totalPages = 1
      let expectedTotal = 0
      for (let page = 1; page <= totalPages; page += 1) {
        if (!isCurrent()) return null
        const pageParams = {
          ...params,
          PageNumber: page
        }
        allSportsState.params = pageParams
        const readRevision = favouriteRevision
        const revision = ++eventReadRevision
        const response = await sportsApi.getSportsV2(baseUrl, pageParams, {
          signal: controller.signal
        })
        if (!isCurrent()) return null
        allSportsState.response = response
        if (!isSportsSuccess(response)) {
          allSportsState.error = {
            kind: 'business',
            code: response.stc,
            message: response.std
          }
          return null
        }
        if (!Array.isArray(response.e)) return fail('Unexpected all-league response structure')
        const total = response.Total
        if (typeof total !== 'number' || !Number.isSafeInteger(total) || total < 0) {
          return fail('Invalid all-league Total')
        }
        expectedTotal = total
        // 两种排序的 Total 都是联赛数；按每页 10 组计算页数，不额外请求空页。
        totalPages = Math.ceil(total / ALL_SPORTS_PAGE_SIZE)
        if (totalPages > MAX_ALL_SPORTS_PAGES) {
          return fail('All-league pagination exceeded safety limit')
        }
        if (!response.e.length && page <= totalPages) {
          return fail('Empty all-league page before Total was reached')
        }
        if (total === 0 && response.e.length)
          return fail('Nonempty all-league page with zero Total')
        if (
          response.e.some(
            group =>
              !group ||
              !Number.isSafeInteger(group.CompetitionId) ||
              !Array.isArray(group.Sports) ||
              !Number.isInteger(group.competitionCount) ||
              group.competitionCount < 0 ||
              group.Sports.some(event => !event || !Number.isSafeInteger(event.EventId))
          )
        ) {
          return fail('Invalid all-league event data')
        }
        syncMemberFavourites(response.e, readRevision, params.MemberCode)
        allSportsState.total = total
        if (!response.e.length) {
          if (!total) groups.clear()
          publish(groups)
          return [...groups.values()]
        }
        const signature = JSON.stringify(
          response.e
            .map(group => [group.CompetitionId, group.Sports.map(event => event.EventId).sort()])
            .sort((left, right) => Number(left[0]) - Number(right[0]))
        )
        if (seenPages.has(signature)) return fail('Repeated all-league page')
        seenPages.add(signature)
        let progressed = false
        const receivedAt = Date.now()
        const applied = await mergeGroupBatches(
          response.e,
          batch => {
            for (const group of rememberGroups(params.SportId, batch, revision, receivedAt, true)) {
              const previous = groups.get(group.CompetitionId)
              const entries = new Map((previous?.Sports ?? []).map(event => [event.EventId, event]))
              if (!previous) progressed = true
              for (const event of group.Sports) {
                if (!entries.has(event.EventId)) progressed = true
                entries.set(event.EventId, event)
              }
              groups.set(group.CompetitionId, { ...group, Sports: [...entries.values()] })
            }
            publish(groups)
          },
          isCurrent
        )
        if (!applied) return null
        if (!progressed) return fail('All-league pagination made no progress')
      }
      if (groups.size < expectedTotal) return fail('Fewer leagues received than Total')
      return [...groups.values()]
    }
    allSportsState.loading = true
    allSportsPending = (async () => {
      try {
        const data = await readPages()
        if (!data || !isCurrent()) return null
        // complete 仅表示联赛分页结束；各联赛保留接口预览，不按计数补齐全部赛事。
        allSportsState.data = activeGroups(params.SportId, data)
        allSportsState.complete = true
        allSportsDataScope.value = scope
        allSportsDataContext.value = context
        cleanupEmptyLeagues()
        return data
      } catch {
        if (isCurrent()) {
          allSportsState.error = { kind: 'network', message: 'All-league request failed' }
        }
        return null
      } finally {
        if (allSportsController === controller) {
          allSportsState.loading = false
          allSportsController = undefined
          allSportsPending = null
          void fetchMissingHotEvents()
        }
      }
    })()
    return allSportsPending
  }

  // 本站热门赛事独立管理状态；首页数量加载成功后再与主赛事列表同步发起。
  const competitionListState = shallowReactive<
    SportsRequestState<GetCompetitionListParams, GetCompetitionListResponse>
  >({ params: null, response: null, data: null, loading: false, error: null })
  let competitionListController: AbortController | undefined
  const competitionListContext = ref('')
  let competitionListRefreshPending = false
  const getCompetitionListContext = () =>
    JSON.stringify([localeStore.currentLanguage, selectedSportId.value, market.value])
  const cancelCompetitionList = () => {
    competitionListController?.abort()
    competitionListController = undefined
    competitionListState.loading = false
  }
  const fetchCompetitionList = async () => {
    cancelCompetitionList()
    cancelHotDetails()
    completedHotDetailsKey = ''
    const controller = new AbortController()
    competitionListController = controller
    const endTime = Date.now()
    const params: GetCompetitionListParams = {
      param: {
        page: 1,
        sportId: selectedSportId.value,
        market: market.value,
        startTime: endTime - 24 * 60 * 60 * 1000,
        endTime
      }
    }
    const context = getCompetitionListContext()
    const isCurrent = () =>
      competitionListController === controller &&
      !controller.signal.aborted &&
      context === getCompetitionListContext()
    if (context !== competitionListContext.value) competitionListState.data = null
    competitionListContext.value = context
    competitionListState.params = params
    competitionListState.response = null
    competitionListState.error = null
    competitionListState.loading = true
    const revision = ++eventReadRevision
    try {
      const response = await Api.sport.getCompetitionList(params, { signal: controller.signal })
      if (!isCurrent()) return null
      competitionListState.response = response
      if (isApiBusinessSuccess(response)) {
        if (Array.isArray(response.result)) {
          competitionListState.data = response
          for (const record of response.result)
            queueReappearedEvents(record.sportId, [record.eventId], revision)
        } else {
          competitionListState.error = { kind: 'response', message: 'Invalid hot events response' }
        }
      } else {
        competitionListState.error = {
          kind: 'business',
          code: response.code,
          message: response.message
        }
      }
      return response
    } catch {
      if (isCurrent()) {
        competitionListState.error = { kind: 'network', message: 'Hot events request failed' }
      }
      return null
    } finally {
      if (competitionListController === controller) {
        competitionListController = undefined
        competitionListState.loading = false
        void fetchMissingHotEvents()
      }
    }
  }

  // 仅补热门名单中缺失的赛事；详情缓存不扩大默认联赛预览或筛选结果。
  const hotDetailsState = shallowReactive<{
    params: GetSelectedEventInfoParams | null
    response: GetSelectedEventInfoResponse | null
    data: SportEvent[]
    loading: boolean
    error: SportsRequestError | null
  }>({ params: null, response: null, data: [], loading: false, error: null })
  const hotDetailsContext = ref('')
  let hotDetailsController: AbortController | undefined
  let hotDetailsPending: Promise<SportEvent[] | null> | null = null
  let hotDetailsKey = ''
  let completedHotDetailsKey = ''
  const cancelHotDetails = () => {
    hotDetailsController?.abort()
    hotDetailsController = undefined
    hotDetailsPending = null
    hotDetailsState.loading = false
  }
  const getHomepageOddsType = (): SportsOddsType => {
    // 独赢通常固定返回欧洲盘，不能用它推断让球/大小的显示盘型。
    for (const group of allLeagueGroups.value) {
      for (const event of group.Sports) {
        for (const line of event.MarketLines ?? []) {
          if (line.PeriodId !== 1 || (line.BetTypeId !== 1 && line.BetTypeId !== 2)) continue
          for (const selection of line.WagerSelections ?? []) {
            const type = selection.OddsType
            if (type === 1 || type === 2 || type === 3 || type === 4) return type
          }
        }
      }
    }
    return DEFAULT_HOMEPAGE_ODDS_TYPE
  }
  const fetchMissingHotEvents = (): Promise<SportEvent[] | null> => {
    const context = getAllSportsContext()
    // 等待两条数据链都到达，避免把尚未翻到的赛事当作缺失重复补查。
    if (
      !getBaseUrl() ||
      allSportsRequestScope.value !== context ||
      allSportsState.loading ||
      competitionListContext.value !== getCompetitionListContext() ||
      competitionListState.loading ||
      !competitionListState.data
    )
      return Promise.resolve(null)

    const ids = [
      ...new Set(
        hotEventRecords.value
          .filter(
            record =>
              record.sportId === selectedSportId.value &&
              Number.isSafeInteger(record.eventId) &&
              record.eventId > 0
          )
          .map(record => record.eventId)
      )
    ].filter(id => !allEventsById.value.has(id))
    const oddsType = getHomepageOddsType()
    const key = JSON.stringify([context, ids, oddsType])
    if (hotDetailsPending && hotDetailsKey === key) return hotDetailsPending
    if (completedHotDetailsKey === key) return Promise.resolve(hotDetailsState.data)
    cancelHotDetails()
    hotDetailsKey = key
    if (hotDetailsContext.value !== context) hotDetailsState.data = []
    hotDetailsContext.value = context
    hotDetailsState.params = null
    hotDetailsState.response = null
    hotDetailsState.error = null
    if (!ids.length) {
      hotDetailsState.data = []
      completedHotDetailsKey = key
      return Promise.resolve([])
    }
    const controller = new AbortController()
    const baseUrl = getBaseUrl()
    const sportId = selectedSportId.value
    const language = languageCode.value
    const isCombo = market.value === 4
    hotDetailsController = controller
    const isCurrent = () =>
      hotDetailsController === controller &&
      !controller.signal.aborted &&
      context === getAllSportsContext()
    hotDetailsState.loading = true
    hotDetailsPending = (async () => {
      const received = new Map<number, SportEvent>()
      try {
        for (let offset = 0; offset < ids.length; offset += SELECTED_EVENT_BATCH_SIZE) {
          if (!isCurrent()) return null
          const batch = ids.slice(offset, offset + SELECTED_EVENT_BATCH_SIZE)
          const params: GetSelectedEventInfoParams = {
            SportId: sportId,
            EventIds: batch,
            OddsType: oddsType,
            IsCombo: isCombo,
            IncludeGroupEvents: false,
            LanguageCode: language,
            PeriodIds: [1]
          }
          hotDetailsState.params = params
          const revision = ++eventReadRevision
          const response = await sportsApi.getSelectedEventInfo(baseUrl, params, {
            signal: controller.signal
          })
          if (!isCurrent()) return null
          hotDetailsState.response = response
          if (!isSportsSuccess(response)) {
            hotDetailsState.error = { kind: 'business', code: response.stc, message: response.std }
            return null
          }
          if (
            !Array.isArray(response.e) ||
            response.e.some(
              event => !event || !batch.includes(event.EventId) || !Array.isArray(event.MarketLines)
            )
          ) {
            hotDetailsState.error = {
              kind: 'response',
              message: 'Unexpected selected events response'
            }
            return null
          }
          updateSelectedEvents(sportId, batch, response.e, revision, params)
          for (const event of activeEvents(sportId, response.e)) {
            const cached = getRefreshEvent(sportId, event.EventId)
            if (cached) received.set(event.EventId, cached)
          }
          hotDetailsState.data = activeEvents(sportId, [...received.values()])
        }
        completedHotDetailsKey = key
        return hotDetailsState.data
      } catch {
        if (isCurrent())
          hotDetailsState.error = { kind: 'network', message: 'Selected events request failed' }
        return null
      } finally {
        if (hotDetailsController === controller) {
          hotDetailsState.loading = false
          hotDetailsController = undefined
          hotDetailsPending = null
        }
      }
    })()
    return hotDetailsPending
  }

  // 保留服务端字段与嵌套结构，页面负责展示转换，Store 不裁剪盘口。
  const requests = shallowReactive({
    GetAllSportCount: counts.state,
    getSportsV2: events.state,
    getSportsV2All: allSportsState,
    GetSelectedEventInfo: hotDetailsState,
    getSportEventIndexList: indexes.state,
    getCompetitionPage: competition.state,
    getPopularSports: popular.state,
    getCompetitionList: competitionListState,
    favouriteEvent: favouriteState,
    GetBetInfo: betInfo.state
  })
  const sportCounts = computed(() => counts.state.data?.spc ?? [])
  const sportCountsLoading = computed(() => counts.state.loading)
  const sportCountsError = computed(() => counts.state.error)
  const currentSportCount = computed(() =>
    sportCounts.value.find(item => item.sid === selectedSportId.value)
  )
  const totalFilterCounts = computed(() =>
    sportCounts.value.reduce(
      (total, item) => ({
        rolling: total.rolling + Number(item.rbfec ?? 0),
        today: total.today + Number(item.tfec ?? 0),
        early: total.early + Number(item.efec ?? 0),
        parlay: total.parlay + Number(item.comboCount ?? 0)
      }),
      {
        rolling: 0,
        today: 0,
        early: 0,
        parlay: 0
      }
    )
  )
  const currentFilterCounts = computed(() => ({
    rolling: currentSportCount.value?.rbfec ?? 0,
    today: currentSportCount.value?.tfec ?? 0,
    early: currentSportCount.value?.efec ?? 0,
    parlay: currentSportCount.value?.comboCount ?? 0
  }))
  const getLeagueContext = () =>
    JSON.stringify([
      getBaseUrl(),
      languageCode.value,
      selectedSportId.value,
      market.value,
      keyword.value.trim(),
      keyword.value.trim() && market.value === 1 ? earlyTradingDate.value : null,
      isFavourite.value,
      sportsSessionVersion.value
    ])
  // 联赛候选只来自默认列表的逐页缓存，不随搜索或指定联赛的查询结果缩减。
  const leagueGroups = computed(() => allLeagueGroups.value)
  const hotEventRecords = computed(() =>
    competitionListContext.value === getCompetitionListContext()
      ? (competitionListState.data?.result ?? []).filter(
          record => !isEventExpired(record.sportId, record.eventId)
        )
      : []
  )
  const allEventsById = computed(
    () =>
      new Map(
        allLeagueGroups.value.flatMap(group =>
          group.Sports.map(event => [event.EventId, event] as const)
        )
      )
  )
  const hotDetailsById = computed(
    () =>
      new Map(
        hotDetailsContext.value === getAllSportsContext()
          ? hotDetailsState.data.map(event => [event.EventId, event] as const)
          : []
      )
  )
  const hotEvents = computed<SportEvent[]>(() => {
    const seen = new Set<number>()
    return hotEventRecords.value.flatMap(record => {
      if (record.sportId !== selectedSportId.value || seen.has(record.eventId)) return []
      seen.add(record.eventId)
      const event =
        allEventsById.value.get(record.eventId) ??
        hotDetailsById.value.get(record.eventId) ??
        getRefreshEvent(record.sportId, record.eventId)
      return event ? [withMemberFavourite(event)] : []
    })
  })
  const hotEventsLoading = computed(
    () =>
      (competitionListContext.value === getCompetitionListContext() &&
        competitionListState.loading) ||
      (allSportsRequestScope.value === getAllSportsContext() && allSportsState.loading) ||
      (hotDetailsContext.value === getAllSportsContext() && hotDetailsState.loading)
  )
  const hotEventsError = computed(
    () =>
      (competitionListContext.value === getCompetitionListContext()
        ? competitionListState.error
        : null) ??
      (hotDetailsContext.value === getAllSportsContext() ? hotDetailsState.error : null) ??
      (allSportsRequestScope.value === getAllSportsContext() ? allSportsState.error : null)
  )
  const unmatchedHotEventIds = computed(() =>
    [
      ...new Set(
        hotEventRecords.value
          .filter(record => record.sportId === selectedSportId.value)
          .map(record => record.eventId)
      )
    ].filter(id => !allEventsById.value.has(id) && !hotDetailsById.value.has(id))
  )
  const getEventsContext = () =>
    JSON.stringify([
      getLeagueContext(),
      sortType.value,
      keyword.value.trim() ? [] : competitionIds.value,
      pageNumber.value,
      pageSize.value
    ])
  // 联赛/时间排序共用连续分页缓存；指定联赛仍从缓存筛选，搜索才走独立查询。
  const useCachedEvents = computed(() => !keyword.value.trim())
  const matchListContext = computed(() =>
    JSON.stringify([getLeagueContext(), sortType.value, competitionIds.value])
  )
  // 筛选刚变化、尚未发起新请求时，也不能把旧赛事按新球种展示。
  const eventsList = computed<SportCompetitionGroup[]>(previous => {
    const groups = useCachedEvents.value
      ? allSportsDataContext.value === getAllSportsQueryContext()
        ? allLeagueGroups.value
        : []
      : eventsDataContext.value === getEventsContext()
        ? (events.state.data?.e ?? [])
        : []
    const selected = new Set(competitionIds.value)
    const previousGroups = new Map(previous?.map(group => [group.CompetitionId, group]))
    const next = groups
      .filter(group => !selected.size || selected.has(group.CompetitionId))
      .map(group => {
        const detail = keyword.value.trim() ? undefined : getLeagueLoadState(group.CompetitionId)
        const sports = detail?.data.length
          ? mergeSportEvents(group.Sports, detail.data)
          : group.Sports
        const nextGroup = {
          ...group,
          Sports: activeEvents(selectedSportId.value, sports).map(withMemberFavourite)
        }
        return reuseEqual(previousGroups.get(group.CompetitionId) ?? nextGroup, nextGroup)
      })
    return reuseList(previous ?? [], filterEmptyLeagueGroups(next, !keyword.value.trim()))
  })
  const matchListLoading = computed(
    () =>
      (useCachedEvents.value
        ? allSportsRequestContext.value === getAllSportsQueryContext() && allSportsState.loading
        : eventsRequestContext.value === getEventsContext() && events.state.loading) ||
      (!keyword.value.trim() && competitionIds.value.some(id => getLeagueLoadState(id)?.loading))
  )
  const matchListError = computed(
    () =>
      (useCachedEvents.value
        ? allSportsRequestContext.value === getAllSportsQueryContext()
          ? allSportsState.error
          : null
        : eventsRequestContext.value === getEventsContext()
          ? events.state.error
          : null) ??
      (!keyword.value.trim()
        ? (competitionIds.value.map(id => getLeagueLoadState(id)?.error).find(Boolean) ?? null)
        : null)
  )
  // 两种排序均为联赛总数，不当作赛事卡片数量参与本地分页。
  const eventsTotal = computed(() =>
    useCachedEvents.value
      ? allSportsDataContext.value === getAllSportsQueryContext()
        ? allSportsState.total
        : 0
      : eventsDataContext.value === getEventsContext()
        ? (events.state.data?.Total ?? 0)
        : 0
  )
  const eventsIndexList = computed(() => indexes.state.data?.e ?? [])
  const competitionEvents = computed(() => competition.state.data?.e ?? [])
  const popularSports = computed(() => popular.state.data?.e ?? [])
  const commonParams = () => ({
    SportId: selectedSportId.value,
    Market: market.value,
    LanguageCode: languageCode.value
  })

  const fetchSportCounts = () => counts.load({ LanguageCode: languageCode.value, IsCombo: false })
  const fetchSports = async (overrides: Partial<GetSportsV2Params> = {}) => {
    const selectedIds = keyword.value.trim() ? [] : competitionIds.value
    const params: GetSportsV2Params = {
      ...commonParams(),
      // 搜索必须使用筛选模式，实测列表模式会忽略 Keyword。
      competitionCondType:
        (overrides.Keyword ?? keyword.value).trim() ||
        (overrides.CompetitionIds ?? selectedIds).length
          ? 2
          : 1,
      PageNumber: pageNumber.value,
      PageSize: pageSize.value,
      SortType: sortType.value,
      CompetitionIds: [...selectedIds],
      Keyword: keyword.value.trim(),
      earlyTradingDate: keyword.value.trim() && market.value === 1 ? earlyTradingDate.value : null,
      // 使用当前体育平台账号，游客仍传空值，不用本站会员 ID 代替。
      MemberCode: sportsMemberCode.value,
      ...overrides,
      // 手动查询覆盖参数也不能绕过游客限制。
      IsFavourite: isLoggedIn.value && (overrides.IsFavourite ?? isFavourite.value)
    }
    const context = JSON.stringify([
      getBaseUrl(),
      params.LanguageCode,
      params.SportId,
      params.Market,
      params.Keyword,
      params.Market === 1 ? params.earlyTradingDate : null,
      params.IsFavourite,
      sportsSessionVersion.value
    ])
    const requestContext = JSON.stringify([
      context,
      params.SortType,
      params.CompetitionIds,
      params.PageNumber,
      params.PageSize
    ])
    eventsRequestContext.value = requestContext
    // 请求层切换条件会清空旧数据，同时失效其缓存标记，避免快速切回时误判已加载。
    if (eventsDataContext.value !== requestContext) eventsDataContext.value = ''
    const version = sportsSessionVersion.value
    const readRevision = favouriteRevision
    const revision = ++eventReadRevision
    const response = await events.load(params)
    if (version !== sportsSessionVersion.value) return null
    if (response && events.state.data === response) {
      syncMemberFavourites(response.e ?? [], readRevision, params.MemberCode)
      events.state.data = {
        ...response,
        e: rememberGroups(params.SportId, response.e ?? [], revision)
      }
      eventsDataContext.value = requestContext
    }
    return response
  }
  const fetchSportEventIndexList = () => indexes.load({ ...commonParams(), Keyword: '' })

  const refreshJobs = new Map<string, { controller: AbortController; pending: Promise<unknown> }>()
  const refreshingEvents = new Map<string, Promise<unknown>>()
  const pendingEventChecks = new Map<string, SportsRefreshTarget>()
  const priorityEventChecks = new Map<string, SportsRefreshTarget>()
  let pendingCacheCleanup: (() => void) | undefined
  let refreshGeneration = 0
  let visibleQueue: Promise<unknown> = Promise.resolve()
  let backgroundEventQueue: Promise<unknown> = Promise.resolve()
  const getRefreshContext = () =>
    JSON.stringify([getEventsContext(), getAllSportsQueryContext(), memberCodeGeneration])
  const cancelHomepageRefresh = () => {
    refreshGeneration += 1
    for (const job of refreshJobs.values()) job.controller.abort()
    refreshJobs.clear()
    refreshingEvents.clear()
    pendingEventChecks.clear()
    priorityEventChecks.clear()
    reappearedEvents.clear()
    pendingCacheCleanup = undefined
    visibleQueue = Promise.resolve()
    backgroundEventQueue = Promise.resolve()
  }
  const runHomepageRefresh = (
    key: string,
    action: (signal: AbortSignal, isCurrent: () => boolean) => Promise<unknown>
  ): Promise<unknown> => {
    if (!homepageActive || !getBaseUrl()) return Promise.resolve(null)
    const existing = refreshJobs.get(key)
    if (existing) return existing.pending
    const context = getRefreshContext()
    const generation = refreshGeneration
    const controller = new AbortController()
    const isCurrent = () =>
      homepageActive &&
      !controller.signal.aborted &&
      generation === refreshGeneration &&
      context === getRefreshContext()
    const pending = Promise.resolve()
      .then(() => (isCurrent() ? action(controller.signal, isCurrent) : null))
      .catch(() => null)
      .finally(() => {
        if (refreshJobs.get(key)?.controller === controller) refreshJobs.delete(key)
        if (isCurrent()) pendingCacheCleanup?.()
      })
    refreshJobs.set(key, { controller, pending })
    return pending
  }
  const refreshHomepageCounts = () =>
    runHomepageRefresh('counts', async (signal, isCurrent) => {
      // 首次数量查询由初始化流程处理，后台刷新不改变选中项和加载状态。
      if (counts.state.loading) return null
      const response = await sportsApi.getAllSportCount(
        getBaseUrl(),
        { LanguageCode: languageCode.value, IsCombo: false },
        { signal }
      )
      if (isCurrent() && isSportsSuccess(response) && Array.isArray(response.spc)) {
        counts.state.data = reuseEqual(counts.state.data, response)
        counts.state.response = response
      }
      return response
    })

  const refreshVisibleEvents = (
    targets: readonly SportsRefreshTarget[],
    { force = false, background = false }: { force?: boolean; background?: boolean } = {}
  ): Promise<unknown> => {
    const waiting = new Set<Promise<unknown>>()
    const sports = new Map<number, Set<number>>()
    for (const { sportId, eventId } of targets) {
      if (!Number.isSafeInteger(sportId) || sportId <= 0) continue
      if (!Number.isSafeInteger(eventId) || eventId <= 0) continue
      const key = eventKey(sportId, eventId)
      if (isEventExpired(sportId, eventId) && !reappearedEvents.has(key)) continue
      const pending = refreshingEvents.get(key)
      if (pending) {
        waiting.add(pending)
        continue
      }
      const cached = refreshedEvents.get(key)
      if (
        !force &&
        cached?.checkedAt !== undefined &&
        Date.now() - cached.checkedAt < EVENT_CHECK_INTERVAL
      )
        continue
      const ids = sports.get(sportId) ?? new Set<number>()
      ids.add(eventId)
      sports.set(sportId, ids)
    }
    for (const [sportId, eventIds] of sports) {
      const ids = [...eventIds]
      for (let offset = 0; offset < ids.length; offset += SELECTED_EVENT_BATCH_SIZE) {
        const batch = ids.slice(offset, offset + SELECTED_EVENT_BATCH_SIZE)
        const previous = background ? backgroundEventQueue : visibleQueue
        const pending = runHomepageRefresh(
          `events:${sportId}:${batch.join(',')}`,
          async (signal, isCurrent) => {
            await previous
            if (background) await visibleQueue
            if (!isCurrent()) return null
            const knownLines = batch.flatMap(
              id =>
                getRefreshEvent(sportId, id)?.MarketLines ??
                reappearedEvents
                  .get(eventKey(sportId, id))
                  ?.group?.Sports.find(event => event.EventId === id)?.MarketLines ??
                []
            )
            const knownOddsType = knownLines
              .filter(line => line.BetTypeId === 1 || line.BetTypeId === 2)
              .flatMap(line => line.WagerSelections ?? [])
              .map(selection => selection.OddsType)
              .find(type => type === 1 || type === 2 || type === 3 || type === 4)
            const params: GetSelectedEventInfoParams = {
              SportId: sportId,
              EventIds: batch,
              OddsType: knownOddsType ?? getHomepageOddsType(),
              IsCombo: market.value === 4,
              IncludeGroupEvents: false,
              LanguageCode: languageCode.value,
              PeriodIds: [...new Set([1 as const, ...knownLines.map(line => line.PeriodId)])]
            }
            const revision = ++eventReadRevision
            const response = await sportsApi.getSelectedEventInfo(getBaseUrl(), params, { signal })
            if (
              !isCurrent() ||
              !isSportsSuccess(response) ||
              !Array.isArray(response.e) ||
              response.e.some(
                event =>
                  !event || !batch.includes(event.EventId) || !Array.isArray(event.MarketLines)
              )
            )
              return null
            updateSelectedEvents(sportId, batch, response.e, revision, params)
            return response
          }
        )
        if (background) backgroundEventQueue = pending
        else visibleQueue = pending
        waiting.add(pending)
        for (const id of batch) refreshingEvents.set(eventKey(sportId, id), pending)
        void pending.finally(() => {
          for (const id of batch) {
            const key = eventKey(sportId, id)
            if (refreshingEvents.get(key) === pending) {
              refreshingEvents.delete(key)
              reappearedEvents.delete(key)
            }
          }
        })
      }
    }
    return Promise.all(waiting)
  }

  const queueEventChecks = (
    targets: readonly SportsRefreshTarget[],
    { priority = false }: { priority?: boolean } = {}
  ) => {
    if (!homepageActive || !getBaseUrl()) return
    for (const target of targets) {
      const { sportId, eventId } = target
      if (!Number.isSafeInteger(sportId) || sportId <= 0) continue
      if (!Number.isSafeInteger(eventId) || eventId <= 0) continue
      const key = eventKey(sportId, eventId)
      if (isEventExpired(sportId, eventId) && !reappearedEvents.has(key)) continue
      const checkedAt = refreshedEvents.get(key)?.checkedAt
      if (checkedAt !== undefined && Date.now() - checkedAt < EVENT_CHECK_INTERVAL) continue
      if (priority) {
        pendingEventChecks.delete(key)
        priorityEventChecks.set(key, target)
      } else if (!priorityEventChecks.has(key)) pendingEventChecks.set(key, target)
    }
    if (!pendingEventChecks.size && !priorityEventChecks.size) return
    if (refreshJobs.has('event-checks')) return
    const generation = refreshGeneration
    const context = getRefreshContext()
    // 补查独立排队，不拖住下一轮名单刷新。
    void runHomepageRefresh('event-checks', async (_signal, isCurrent) => {
      let priorityBatches = 0
      while (isCurrent() && (priorityEventChecks.size || pendingEventChecks.size)) {
        // 最多连续两批优先补查，之后让普通队列先取一批。
        const priorityFirst =
          priorityEventChecks.size > 0 &&
          (priorityBatches < MAX_PRIORITY_EVENT_BATCHES || !pendingEventChecks.size)
        const queues = priorityFirst
          ? [priorityEventChecks, pendingEventChecks]
          : [pendingEventChecks, priorityEventChecks]
        priorityBatches = priorityFirst
          ? Math.min(priorityBatches + 1, MAX_PRIORITY_EVENT_BATCHES)
          : 0
        const batch: SportsRefreshTarget[] = []
        for (const queue of queues) {
          for (const [key, target] of queue) {
            if (batch.length === SELECTED_EVENT_BATCH_SIZE) break
            queue.delete(key)
            batch.push(target)
          }
        }
        await refreshVisibleEvents(batch, { background: true })
      }
    }).then(() => {
      // 收尾期间新增的任务交给下一批，旧会话不能启动新任务。
      if (generation === refreshGeneration && context === getRefreshContext()) queueEventChecks([])
    })
  }

  // 单独补查选中盘口，不用首页缓存的新鲜度判断代替确认。
  const confirmBetSelection = (selection: {
    sportId: number
    eventId: number
    market: SportMarketLine
    wagerSelectionId: number
  }) =>
    runHomepageRefresh(
      `bet-selection:${selection.sportId}:${selection.eventId}:${selection.market.MarketlineId}:${selection.wagerSelectionId}`,
      async (signal, isCurrent) => {
        if (isEventExpired(selection.sportId, selection.eventId)) return 'missing'
        const params: GetSelectedEventInfoParams = {
          SportId: selection.sportId,
          EventIds: [selection.eventId],
          OddsType: getHomepageOddsType(),
          IsCombo: false,
          IncludeGroupEvents: false,
          LanguageCode: languageCode.value,
          BetTypeIds: [selection.market.BetTypeId],
          PeriodIds: [selection.market.PeriodId]
        }
        const revision = ++eventReadRevision
        const response = await sportsApi.getSelectedEventInfo(getBaseUrl(), params, { signal })
        if (
          !isCurrent() ||
          !isSportsSuccess(response) ||
          !Array.isArray(response.e) ||
          response.e.some(
            event =>
              !event || event.EventId !== selection.eventId || !Array.isArray(event.MarketLines)
          )
        )
          return null
        const event = response.e.find(item => item.EventId === selection.eventId)
        const key = eventKey(selection.sportId, selection.eventId)
        if (
          Math.max(refreshedEvents.get(key)?.revision ?? 0, expiredEvents.get(key) ?? 0) > revision
        )
          return null
        const line = event?.MarketLines.find(
          item => item.MarketlineId === selection.market.MarketlineId
        )
        if (line && !Array.isArray(line.WagerSelections)) return null
        updateSelectedEvents(selection.sportId, [selection.eventId], response.e, revision, params)
        if (!event) return 'missing'
        const exists = line?.WagerSelections.some(
          item => item.WagerSelectionId === selection.wagerSelectionId
        )
        return exists ? 'present' : 'missing'
      }
    )

  const mergeRefreshGroups = (
    previous: SportCompetitionGroup[],
    incoming: SportCompetitionGroup[]
  ) => {
    const groups = new Map(previous.map(group => [group.CompetitionId, group]))
    for (const group of incoming) {
      const old = groups.get(group.CompetitionId)
      groups.set(
        group.CompetitionId,
        old
          ? mergeDefined(old, { ...group, Sports: mergeSportEvents(old.Sports, group.Sports) })
          : group
      )
    }
    return reuseList(previous, [...groups.values()])
  }
  const refreshHomepageBackground = () =>
    runHomepageRefresh('background', async (signal, isCurrent) => {
      const sportId = selectedSportId.value
      const search = keyword.value.trim()
      const params: GetSportsV2Params = {
        ...commonParams(),
        competitionCondType: search ? 2 : 1,
        PageNumber: search ? pageNumber.value : 1,
        PageSize: search ? pageSize.value : ALL_SPORTS_PAGE_SIZE,
        SortType: sortType.value,
        CompetitionIds: [],
        Keyword: search,
        IsFavourite: isFavourite.value,
        earlyTradingDate: search && market.value === 1 ? earlyTradingDate.value : null,
        MemberCode: sportsMemberCode.value
      }
      const previousGroups = search
        ? eventsDataContext.value === getEventsContext()
          ? (events.state.data?.e ?? [])
          : []
        : allSportsDataContext.value === getAllSportsQueryContext()
          ? allSportsState.data
          : []
      const previousByLeague = new Map(
        previousGroups.map(group => [
          group.CompetitionId,
          new Set(group.Sports.map(event => event.EventId))
        ])
      )
      if (!search && leagueDetailsContext === getLeagueDetailsContext()) {
        for (const [id, state] of leagueDetails) {
          const ids = previousByLeague.get(id) ?? new Set<number>()
          for (const event of state.data) ids.add(event.EventId)
          previousByLeague.set(id, ids)
        }
      }
      const refreshList = async () => {
        if (!search && allSportsPending) return allSportsPending
        if (search && events.state.loading) return null
        const returnedLeagueIds = new Set<number>()
        const returnedEventIds = new Set<number>()
        const queuedIds = new Set<number>()
        const verifyMissing = (ids: Iterable<number>) => {
          const missing = [...ids].filter(id => !returnedEventIds.has(id) && !queuedIds.has(id))
          if (!missing.length) return
          missing.forEach(id => queuedIds.add(id))
          queueEventChecks(
            missing.map(eventId => ({ sportId, eventId })),
            { priority: true }
          )
        }
        const seen = new Set<string>()
        let totalPages = 1
        let total = 0
        let listRevision = 0
        for (let page = 1; page <= totalPages; page += 1) {
          if (!isCurrent()) return null
          const revision = ++eventReadRevision
          listRevision = revision
          const favourite = favouriteRevision
          const response = await sportsApi.getSportsV2(
            getBaseUrl(),
            {
              ...params,
              PageNumber: search ? params.PageNumber : page
            },
            { signal }
          )
          if (!isCurrent() || !isSportsSuccess(response) || !Array.isArray(response.e)) return null
          if (
            response.e.some(
              group =>
                !group ||
                !Number.isSafeInteger(group.CompetitionId) ||
                !Number.isInteger(group.competitionCount) ||
                group.competitionCount < 0 ||
                !Array.isArray(group.Sports) ||
                group.Sports.some(event => !event || !Number.isSafeInteger(event.EventId))
            )
          )
            return null
          if (!search) {
            if (
              typeof response.Total !== 'number' ||
              !Number.isSafeInteger(response.Total) ||
              response.Total < 0
            )
              return null
            total = response.Total
            if (total === 0 && response.e.length) return null
            totalPages = Math.ceil(total / ALL_SPORTS_PAGE_SIZE)
            if (totalPages > MAX_ALL_SPORTS_PAGES || (!response.e.length && page <= totalPages))
              return null
            const signature = JSON.stringify(
              response.e.map(group => [
                group.CompetitionId,
                group.Sports.map(event => event.EventId)
              ])
            )
            if (seen.has(signature)) return null
            seen.add(signature)
          }
          if (
            search
              ? eventsDataContext.value !== getEventsContext() || !events.state.data
              : allSportsDataContext.value !== getAllSportsQueryContext()
          )
            return null
          syncMemberFavourites(response.e, favourite, params.MemberCode)
          const receivedAt = Date.now()
          const applied = await mergeGroupBatches(
            response.e,
            batch => {
              const pageGroups = rememberGroups(sportId, batch, revision, receivedAt, !search)
              if (search && events.state.data) {
                events.state.data = {
                  ...events.state.data,
                  e: mergeRefreshGroups(events.state.data.e ?? [], pageGroups)
                }
              } else {
                allSportsState.data = mergeRefreshGroups(allSportsState.data, pageGroups)
                allSportsState.total = total
              }
            },
            isCurrent
          )
          if (!applied) return null
          cleanupEmptyLeagues()
          if (!isCurrent()) return null
          if (search && events.state.data)
            events.state.data = { ...events.state.data, ...response, e: events.state.data.e }
          else allSportsState.total = total
          for (const group of response.e) {
            returnedLeagueIds.add(group.CompetitionId)
            for (const event of group.Sports) returnedEventIds.add(event.EventId)
          }
          // 已返回的联赛立即复核，预览里没有不代表赛事已下架。
          for (const group of response.e)
            verifyMissing(previousByLeague.get(group.CompetitionId) ?? [])
        }
        if (!isCurrent() || (!search && returnedLeagueIds.size < total)) return null
        if (!search) allSportsState.complete = true
        // 整轮成功后，才能确认哪些旧联赛没有出现。
        for (const [id, ids] of previousByLeague) if (!returnedLeagueIds.has(id)) verifyMissing(ids)
        if (!search) cleanupEmptyLeagues(listRevision)
        return search ? events.state.data?.e : allSportsState.data
      }
      const refreshCached = () => {
        const lastChecked = (id: number) =>
          refreshedEvents.get(eventKey(sportId, id))?.checkedAt ?? 0
        const ids = [...new Set([...previousByLeague.values()].flatMap(ids => [...ids]))].sort(
          (left, right) => lastChecked(left) - lastChecked(right)
        )
        // 普通缓存也轮流复核，不依赖 V2 是否仍返回该赛事。
        queueEventChecks(ids.map(eventId => ({ sportId, eventId })))
      }
      refreshCached()
      return refreshList()
    })

  const refreshHomepageHot = () =>
    runHomepageRefresh('hot', async (signal, isCurrent) => {
      if (competitionListState.loading) return null
      const endTime = Date.now()
      const revision = ++eventReadRevision
      const response = await Api.sport.getCompetitionList(
        {
          param: {
            page: 1,
            sportId: selectedSportId.value,
            market: market.value,
            startTime: endTime - 24 * 60 * 60 * 1000,
            endTime
          }
        },
        { signal }
      )
      if (!isCurrent() || !isApiBusinessSuccess(response) || !Array.isArray(response.result))
        return null
      const records = new Map(
        (competitionListState.data?.result ?? []).map(record => [
          eventKey(record.sportId, record.eventId),
          record
        ])
      )
      response.result.forEach(record =>
        records.set(eventKey(record.sportId, record.eventId), record)
      )
      competitionListState.data = { ...response, result: [...records.values()] }
      competitionListContext.value = getCompetitionListContext()
      for (const record of response.result)
        queueReappearedEvents(record.sportId, [record.eventId], revision)
      // 热门缓存也定期复核，与其他补查共用去重队列。
      const targets = [...records.values()].map(record => ({
        sportId: record.sportId,
        eventId: record.eventId
      }))
      queueEventChecks(targets, { priority: true })
      return response
    })

  watch(getRefreshContext, cancelHomepageRefresh, { flush: 'sync' })
  watch(
    () =>
      JSON.stringify([getBaseUrl(), languageCode.value, market.value, sportsSessionVersion.value]),
    () => {
      refreshedEvents.clear()
      expiredEvents.clear()
    },
    { flush: 'sync' }
  )
  const fetchPopularSports = () =>
    popular.load({ ...commonParams(), Market: 3, SortType: sortType.value })
  const fetchCompetitionPage = (
    id: number,
    page = 1,
    overrides: Partial<GetCompetitionPageParams> = {}
  ) =>
    competition.load({
      ...commonParams(),
      PageNumber: page,
      PageSize: pageSize.value,
      SortType: sortType.value,
      CompetitionIds: [id],
      ...overrides
    })

  const isFavouritePending = (eventId: number) =>
    favouriteJobs.has(`${sportsSessionVersion.value}:${eventId}`)

  /** 单联赛筛选可覆盖预览外的赛事；只校准当前赛事，不替换列表或分页。 */
  const refreshEventFavourite = async (
    baseUrl: string,
    params: GetSportsV2Params,
    eventId: number,
    isCurrent: () => boolean
  ): Promise<boolean> => {
    const generation = memberCodeGeneration
    try {
      const response = await sportsApi.getSportsV2(baseUrl, params)
      if (
        !isCurrent() ||
        !homepageActive ||
        generation !== memberCodeGeneration ||
        params.MemberCode !== sportsMemberCode.value
      ) {
        return false
      }
      if (!isSportsSuccess(response)) {
        favouriteState.error = { kind: 'business', code: response.stc, message: response.std }
        return false
      }
      const group = Array.isArray(response.e)
        ? response.e.find(group => group?.CompetitionId === params.CompetitionIds[0])
        : undefined
      const event = Array.isArray(group?.Sports)
        ? group.Sports.find(event => event?.EventId === eventId)
        : undefined
      if (typeof event?.IsFavourite !== 'boolean') {
        favouriteState.error = { kind: 'response', message: 'Favourite status is unavailable' }
        return false
      }
      memberFavourites.set(eventId, { value: event.IsFavourite, revision: ++favouriteRevision })
      unconfirmedFavourites.delete(eventId)
      return true
    } catch {
      if (isCurrent() && homepageActive && generation === memberCodeGeneration) {
        favouriteState.error = { kind: 'network', message: 'Favourite status refresh failed' }
      }
      return false
    }
  }

  // 仅收藏置顶需要重取排序；普通收藏只更新个人状态，不牵动首页初始化。
  const refreshFavouriteOrder = () => {
    if (useCachedEvents.value) {
      cancelAllSports()
      void fetchAllSports({ keepPrevious: true })
    } else {
      events.cancel()
      void fetchSports()
    }
  }

  /** 同场防重、不同场独立；服务端切换收藏状态，网络失败不自动重试。 */
  const toggleFavouriteEvent = (eventId: number): Promise<SportsFavouriteResult> => {
    if (!isLoggedIn.value) return Promise.resolve('login-failed')
    const version = sportsSessionVersion.value
    const key = `${version}:${eventId}`
    const existing = favouriteJobs.get(key)
    if (existing) return existing
    const event =
      eventsList.value.flatMap(group => group.Sports).find(item => item.EventId === eventId) ??
      hotEvents.value.find(item => item.EventId === eventId)
    if (
      !Number.isSafeInteger(eventId) ||
      eventId <= 0 ||
      !event ||
      !event.EventDate ||
      !Number.isSafeInteger(event.Competition?.CompetitionId) ||
      !getBaseUrl()
    ) {
      return Promise.resolve('failed')
    }
    const baseUrl = getBaseUrl()
    const listContext = matchListContext.value
    // 使用点击时的球种、分类、联赛；不能把后续搜索条件带入校准请求。
    const query: GetSportsV2Params = {
      ...commonParams(),
      competitionCondType: 2,
      CompetitionIds: [event.Competition.CompetitionId],
      PageNumber: 1,
      PageSize: 1,
      SortType: 1,
      Keyword: '',
      IsFavourite: false,
      earlyTradingDate: null
    }
    const isCurrent = () => version === sportsSessionVersion.value && isLoggedIn.value
    const pending = (async (): Promise<SportsFavouriteResult> => {
      const loginGeneration = memberCodeGeneration
      const memberCode = await ensureSportsMemberCode()
      if (!isCurrent() || loginGeneration !== memberCodeGeneration) return 'stale'
      if (!memberCode) return 'login-failed'
      const previous = memberFavourites.get(eventId)?.value ?? event.IsFavourite === true
      const reconcileOnly = unconfirmedFavourites.has(eventId)
      const params: FavouriteEventParams = {
        MemberCode: memberCode,
        EventId: eventId,
        EventDate: event.EventDate
      }
      favouriteState.params = params
      favouriteState.error = null
      favouriteState.response = null
      let result: SportsFavouriteResult = reconcileOnly ? 'synced' : 'success'
      if (!reconcileOnly) {
        unconfirmedFavourites.add(eventId)
        try {
          const response = await sportsApi.favouriteEvent(baseUrl, params)
          if (!isCurrent()) return 'stale'
          favouriteState.response = response
          if (!isSportsSuccess(response)) {
            favouriteState.error = { kind: 'business', code: response.stc, message: response.std }
            if (isSportsAuthExpired(response)) {
              unconfirmedFavourites.delete(eventId)
              return 'auth-expired'
            }
            result = 'failed'
          } else {
            favouriteState.data = response
            if (!homepageActive || loginGeneration !== memberCodeGeneration) return 'stale'
            if (response.EventId === eventId && typeof response.IsFavourite === 'boolean') {
              // 接口已返回最终状态，不再额外查询赛事来确认。
              memberFavourites.set(eventId, {
                value: response.IsFavourite,
                revision: ++favouriteRevision
              })
              unconfirmedFavourites.delete(eventId)
              return 'success'
            }
          }
        } catch {
          if (!isCurrent()) return 'stale'
          favouriteState.error = { kind: 'network', message: 'Favourite request failed' }
          result = 'failed'
        }
      }
      if (!homepageActive || loginGeneration !== memberCodeGeneration) return 'stale'
      // 只建立旧读隔离点，不推测切换结果；超时也需读取服务端实际状态。
      memberFavourites.set(eventId, { value: previous, revision: ++favouriteRevision })
      const confirmed = await refreshEventFavourite(
        baseUrl,
        { ...query, MemberCode: memberCode },
        eventId,
        isCurrent
      )
      if (!isCurrent()) return 'stale'
      return confirmed ? result : 'failed'
    })()
    // 等待账号期间也要立即进入防重状态。
    favouriteJobs.set(key, pending)
    favouriteState.loading = true
    void pending.then(result => {
      favouriteJobs.delete(key)
      favouriteState.loading = favouriteJobs.size > 0
      if (
        isCurrent() &&
        homepageActive &&
        isFavourite.value &&
        listContext === matchListContext.value &&
        (result === 'success' ||
          result === 'synced' ||
          (result === 'failed' && !unconfirmedFavourites.has(eventId)))
      ) {
        refreshFavouriteOrder()
      }
    })
    return pending
  }

  const cancelRequests = () => {
    homepageActive = false
    cancelBetInfo()
    resetSportsBalance()
    cancelHomepageRefresh()
    // 停用和销毁均结束本次停留；旧登录响应不能写回，也不能被下次进入复用。
    invalidateSportsMemberCode()
    homepageGeneration += 1
    resources.forEach(resource => resource.cancel())
    cancelAllSports()
    cancelHotDetails()
    cancelLeagueRequests()
    allSportsRefreshPending = false
    cancelCompetitionList()
    competitionListRefreshPending = false
    homepageLoading.value = false
  }
  const pruneEventCache = (getProtectedTargets: () => readonly SportsRefreshTarget[]) => {
    if (!homepageActive) return
    // 暂时不能清理时，在下一批请求结束后重试。
    pendingCacheCleanup = () => pruneEventCache(getProtectedTargets)
    // 名单和定向查询等待结束；批量补查按 ID 保留缓存。
    if (
      [...refreshJobs.keys()].some(
        key => key !== 'counts' && key !== 'event-checks' && !key.startsWith('events:')
      ) ||
      allSportsPending ||
      hotDetailsPending ||
      leagueJobs.size ||
      events.state.loading
    )
      return
    pendingCacheCleanup = undefined
    const retained = new Set([
      ...getProtectedTargets().map(target => eventKey(target.sportId, target.eventId)),
      ...pendingEventChecks.keys(),
      ...priorityEventChecks.keys(),
      ...refreshingEvents.keys()
    ])
    const retain = (sportId: number, items: readonly SportEvent[]) => {
      for (const event of items) retained.add(eventKey(sportId, event.EventId))
    }
    const sportId = selectedSportId.value
    if (allSportsDataScope.value === getAllSportsContext())
      for (const group of allSportsState.data) retain(sportId, group.Sports)
    if (eventsDataContext.value === getEventsContext())
      for (const group of events.state.data?.e ?? []) retain(sportId, group.Sports)
    if (leagueDetailsContext === getLeagueDetailsContext())
      for (const state of leagueDetails.values()) retain(sportId, state.data)
    if (hotDetailsContext.value === getAllSportsContext()) retain(sportId, hotDetailsState.data)
    if (competitionListContext.value === getCompetitionListContext())
      for (const record of competitionListState.data?.result ?? [])
        retained.add(eventKey(record.sportId, record.eventId))
    for (const key of refreshedEvents.keys()) if (!retained.has(key)) refreshedEvents.delete(key)
  }
  const reset = () => {
    cancelRequests()
    sportsSessionVersion.value += 1
    memberFavourites.clear()
    unconfirmedFavourites.clear()
    favouriteRevision = 0
    favouriteState.params = null
    favouriteState.response = null
    favouriteState.data = null
    favouriteState.error = null
    isFavourite.value = false
    resources.forEach(resource => resource.reset())
    allSportsState.params = null
    allSportsState.response = null
    allSportsState.data = []
    allSportsState.complete = false
    allSportsState.total = 0
    allSportsState.error = null
    allSportsDataContext.value = ''
    allSportsDataScope.value = ''
    allSportsRequestContext.value = ''
    allSportsRequestScope.value = ''
    competitionListContext.value = ''
    competitionListState.params = null
    competitionListState.response = null
    competitionListState.data = null
    competitionListState.error = null
    hotDetailsState.params = null
    hotDetailsState.response = null
    hotDetailsState.data = []
    hotDetailsState.error = null
    hotDetailsContext.value = ''
    completedHotDetailsKey = ''
    leagueDetails.clear()
    loadedCountsContext = ''
    eventsDataContext.value = ''
    eventsRequestContext.value = ''
    homepageError.value = null
  }

  /** 进入时获取体育账号并查询数量，列表等待两者就绪；筛选期间复用本次停留的账号。 */
  const loadHomepage = async ({
    refreshCounts = true,
    refreshCompetitionList = refreshCounts
  }: {
    refreshCounts?: boolean
    refreshCompetitionList?: boolean
  } = {}) => {
    homepageActive = true
    const generation = ++homepageGeneration
    cancelHomepageRefresh()
    let refreshEvents = false
    if (refreshCompetitionList) {
      // 数量等待期间后续筛选可能接管请求，保留刷新意图，避免旧代次退出时漏发热门。
      competitionListRefreshPending = true
      cancelCompetitionList()
    }
    if (refreshCompetitionList || refreshCounts) {
      allSportsRefreshPending = true
      cancelAllSports()
      cancelHotDetails()
    }
    // 保留同条件的在途数量请求供后一次操作复用，仅取消旧赛事，防止旧条件回写。
    if (useCachedEvents.value) events.cancel()
    if (refreshCounts) loadedCountsContext = ''
    homepageLoading.value = true
    homepageError.value = null
    try {
      await siteConfigStore.initSiteConfig()
      if (generation !== homepageGeneration) return
      // 仅登录后获取体育凭据，不依赖数量接口成功；同次停留共用在途或已有结果。
      const memberCodeTask =
        isLoggedIn.value && (!memberCodeAttempted || memberCodePending)
          ? ensureSportsMemberCode()
          : null
      // 历史页可能已获取凭据，返回首页时仍需补查余额。
      if (sportsCredentials.value && sportsBalance.value === null && !sportsBalanceError.value) {
        void fetchSportsBalance({ retry: true })
      }
      if (!getBaseUrl()) {
        resources.forEach(resource => resource.reset())
        cancelAllSports()
        allSportsState.data = []
        allSportsState.complete = false
        allSportsState.total = 0
        allSportsDataContext.value = ''
        allSportsDataScope.value = ''
        allSportsRequestContext.value = ''
        allSportsRequestScope.value = ''
        allSportsState.error = null
        loadedCountsContext = ''
        eventsDataContext.value = ''
        eventsRequestContext.value = ''
        homepageError.value = { kind: 'config', message: 'Missing IM.im_app_url' }
        return
      }
      const countsContext = JSON.stringify([getBaseUrl(), languageCode.value])
      if (loadedCountsContext !== countsContext) {
        const response = await fetchSportCounts()
        if (generation !== homepageGeneration) return
        if (!response || !isSportsSuccess(response) || !Array.isArray(response.spc)) {
          homepageError.value = counts.state.error ?? {
            kind: 'response',
            message: 'Sports counts are unavailable'
          }
          return
        }
        loadedCountsContext = countsContext
      }
      await memberCodeTask
      if (generation !== homepageGeneration) return
      // 同一本站会话内账号首次就绪，保留原预览直到新数据发布，但不复用匿名查询缓存。
      if (memberCodeNeedsRefresh) {
        memberCodeNeedsRefresh = false
        refreshEvents = true
        events.cancel()
        cancelAllSports()
        allSportsState.complete = false
      }
      pumpLeagueRequests()
      // 数量等待期间可能更换球种；此处读取 Store 当前值，不使用请求前的筛选快照。
      if (competitionListRefreshPending) {
        competitionListRefreshPending = false
        void fetchCompetitionList()
      }
      let allSportsTask = allSportsPending
      if (
        allSportsRefreshPending ||
        ((!keyword.value.trim() || useCachedEvents.value) &&
          (allSportsDataContext.value !== getAllSportsQueryContext() ||
            !allSportsState.complete ||
            allSportsState.error))
      ) {
        allSportsRefreshPending = false
        allSportsTask = fetchAllSports()
      }
      if (useCachedEvents.value) {
        // 默认列表直接共用分页缓存，避免额外发一次相同的第一页请求。
        await allSportsTask
      } else if (
        refreshEvents ||
        !keyword.value.trim() ||
        refreshCounts ||
        eventsDataContext.value !== getEventsContext() ||
        events.state.error
      ) {
        await fetchSports()
      }
      if (generation !== homepageGeneration) return
    } catch {
      if (generation === homepageGeneration) {
        homepageError.value = { kind: 'config', message: 'Sports initialization failed' }
      }
    } finally {
      if (generation === homepageGeneration) homepageLoading.value = false
    }
  }

  const retryHomepage = () =>
    runSportsRetry('homepage', async isCurrent => {
      await loadHomepage({ refreshCounts: false })
      if (isCurrent() && !keyword.value.trim()) {
        for (const id of requestedLeagueIds) resumeLeague(id)
      }
    })
  const retryHotEvents = () =>
    runSportsRetry('hot', () =>
      Promise.all([fetchCompetitionList(), fetchAllSports({ keepPrevious: true })])
    )
  const retryingSports = computed(() => retryJobs.size > 0)

  return {
    oddsTypeEnum,
    getLanguage,
    languageCode,
    selectedSportId,
    selectedFilterKey,
    market,
    sortType,
    isFavourite,
    sportsSessionVersion,
    sportsMemberCode,
    sportsToken,
    sportsBalance,
    sportsBalanceLoading,
    sportsBalanceError,
    fetchSportsBalance,
    fetchBetInfo,
    cancelBetInfo,
    pageNumber,
    pageSize,
    competitionIds,
    keyword,
    earlyTradingDate,
    homepageLoading,
    homepageError,
    requests,
    sportCounts,
    sportCountsLoading,
    sportCountsError,
    currentSportCount,
    totalFilterCounts,
    currentFilterCounts,
    eventsList,
    useCachedEvents,
    matchListContext,
    matchListLoading,
    matchListError,
    allLeagueGroups,
    hotEvents,
    hotEventsLoading,
    hotEventsError,
    unmatchedHotEventIds,
    leagueGroups,
    eventsTotal,
    eventsIndexList,
    competitionEvents,
    popularSports,
    fetchSportCounts,
    refreshHomepageCounts,
    refreshVisibleEvents,
    confirmBetSelection,
    refreshHomepageBackground,
    refreshHomepageHot,
    cancelHomepageRefresh,
    getRefreshEvent,
    getEventRevision,
    pruneEventCache,
    isEventExpired,
    getEventClockUpdatedAt,
    fetchSports,
    fetchAllSports,
    fetchMissingHotEvents,
    fetchSportEventIndexList,
    fetchCompetitionPage,
    fetchLeagueEvents,
    syncLeagueRequests,
    getLeagueLoadState,
    retryLeague,
    fetchPopularSports,
    fetchCompetitionList,
    ensureSportsMemberCode,
    placeBet,
    toggleFavouriteEvent,
    isFavouritePending,
    loadHomepage,
    retryHomepage,
    retryHotEvents,
    retryingSports,
    cancelRequests,
    reset
  }
})
