import { defineStore } from 'pinia'
import { computed, reactive, ref, shallowReactive, watch } from 'vue'
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
  | 'success'
  | 'synced'
  | 'failed'
  | 'login-failed'
  | 'auth-expired'
  | 'stale'

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
const MAX_CONCURRENT_LEAGUES = 3
const EVENT_FRESH_TIME = 10_000

const mergeDefined = <T extends object>(previous: T, incoming: T): T =>
  Object.assign(
    {},
    previous,
    Object.fromEntries(Object.entries(incoming).filter(([, value]) => value !== undefined))
  )

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
    lines.set(line.MarketlineId, old ? mergeDefined(old, line) : line)
  }
  return [...lines.values()]
}

const mergeEventFields = (
  previous: SportEvent,
  incoming: SportEvent,
  scope?: MarketRefreshScope
): SportEvent => ({
  ...mergeDefined(previous, incoming),
  Competition:
    previous.Competition && incoming.Competition
      ? mergeDefined(previous.Competition, incoming.Competition)
      : (incoming.Competition ?? previous.Competition),
  MarketLines: mergeMarketLines(previous.MarketLines ?? [], incoming.MarketLines, scope)
})

type LeagueEventsState = {
  data: SportEvent[]
  response: GetCompetitionPageResponse | null
  nextPage: number
  complete: boolean
  loading: boolean
  error: SportsRequestError | null
}

/** 同 ID 原位更新，新增赛事追加；预览与后续分页始终保留各自原有顺序。 */
const mergeSportEvents = (previous: readonly SportEvent[], incoming: readonly SportEvent[]) => {
  const merged = new Map(previous.map(event => [event.EventId, event]))
  incoming.forEach(event => merged.set(event.EventId, event))
  return [...merged.values()]
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
  const resetSportsBalance = () => {
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
          return null
        }
        sportsCredentials.value = { memberCode: account.trim(), token }
        memberCodeNeedsRefresh = true
        if (homepageActive && !sportsBalanceLoading.value) void fetchSportsBalance()
        return sportsMemberCode.value
      } catch {
        return null
      } finally {
        if (generation === memberCodeGeneration) memberCodePending = null
      }
    })()
    memberCodePending = pending
    return pending
  }
  /** 网关鉴权失败统一更新体育凭据，原响应照常交给调用方；不自动重放任何请求。 */
  const withSportsAuthRecovery =
    <Params, Response extends SportsResponse>(
      send: (baseUrl: string, params: Params, options?: SportsRequestOptions) => Promise<Response>
    ) =>
    async (baseUrl: string, params: Params, options?: SportsRequestOptions): Promise<Response> => {
      const version = sportsSessionVersion.value
      const generation = memberCodeGeneration
      const credentials = sportsCredentials.value
      const response = await send(baseUrl, params, options)
      if (
        !isSportsAuthExpired(response) ||
        !isLoggedIn.value ||
        !homepageActive ||
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
  const fetchSportsBalance = (): Promise<boolean> => {
    if (balancePending) return balancePending
    if (!homepageActive || !isLoggedIn.value) return Promise.resolve(false)
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
            sportsBalanceError.value = { kind: 'business', message: 'Sports login unavailable' }
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
  const withMemberFavourite = (event: SportEvent): SportEvent => ({
    ...event,
    IsFavourite: isLoggedIn.value
      ? (memberFavourites.get(event.EventId)?.value ?? event.IsFavourite === true)
      : false
  })
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
      { event: SportEvent; revision: number; updatedAt: number; clockUpdatedAt: number }
    >()
  )
  let eventReadRevision = 0
  const eventKey = (sportId: number, eventId: number) => `${sportId}:${eventId}`
  const rememberEvent = (
    sportId: number,
    incoming: SportEvent,
    revision: number,
    {
      receivedAt = Date.now(),
      marketScope
    }: { receivedAt?: number; marketScope?: MarketRefreshScope } = {}
  ) => {
    const key = eventKey(sportId, incoming.EventId)
    const previous = refreshedEvents.get(key)
    if (!previous) {
      const event = reactive({ ...incoming })
      refreshedEvents.set(
        key,
        shallowReactive({ event, revision, updatedAt: receivedAt, clockUpdatedAt: receivedAt })
      )
      return event
    }
    // 迟到的响应不能补回已被移除的盘口或投注项。
    if (revision < previous.revision) return previous.event
    const timeChanged = incoming.RBTime !== undefined && incoming.RBTime !== previous.event.RBTime
    const wasPaused = previous.event.RBTimeStatus === 3
    const isPaused = (incoming.RBTimeStatus ?? previous.event.RBTimeStatus) === 3
    Object.assign(previous.event, mergeEventFields(previous.event, incoming, marketScope))
    previous.revision = revision
    previous.updatedAt = Date.now()
    // 重复时间不重置秒表；暂停、恢复或时间变化时重新校准。
    if (timeChanged || wasPaused !== isPaused) previous.clockUpdatedAt = receivedAt
    return previous.event
  }
  const rememberGroups = (
    sportId: number,
    groups: SportCompetitionGroup[],
    revision: number,
    receivedAt = Date.now()
  ) =>
    groups.map(group => ({
      ...group,
      Sports: group.Sports.map(event => rememberEvent(sportId, event, revision, { receivedAt }))
    }))
  const getRefreshEvent = (sportId: number, eventId: number) =>
    refreshedEvents.get(eventKey(sportId, eventId))?.event
  const getEventClockUpdatedAt = (sportId: number, eventId: number) =>
    refreshedEvents.get(eventKey(sportId, eventId))?.clockUpdatedAt ?? Date.now()

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
    allSportsDataScope.value === getAllSportsContext() ? allSportsState.data : []
  )

  // 每个联赛独立缓存与页码；搜索结果不读写这一份补查缓存。
  const leagueDetails = shallowReactive(new Map<number, LeagueEventsState>())
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
    for (const id of leagueJobs.keys()) cancelLeague(id)
  }
  const getLeagueLoadState = (id: number) =>
    leagueDetailsContext === getLeagueDetailsContext() ? leagueDetails.get(id) : undefined

  const fetchLeagueEvents = (id: number): Promise<SportEvent[] | null> => {
    if (keyword.value.trim() || !getBaseUrl() || !Number.isSafeInteger(id) || id <= 0) {
      return Promise.resolve(null)
    }
    const existing = leagueJobs.get(id)
    if (existing) return existing.pending
    const state =
      leagueDetails.get(id) ??
      shallowReactive<LeagueEventsState>({
        data: [],
        response: null,
        nextPage: 1,
        complete: false,
        loading: false,
        error: null
      })
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
        while (isCurrent() && !state.complete) {
          if (state.nextPage > MAX_ALL_SPORTS_PAGES) {
            state.error = { kind: 'response', message: 'League page limit exceeded' }
            return null
          }
          const revision = ++eventReadRevision
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
          const previousIds = new Set(state.data.map(event => event.EventId))
          const madeProgress = response.e.some(event => !previousIds.has(event.EventId))
          if (
            (response.hasNextPage && !response.e.length) ||
            (state.nextPage > 1 && response.e.length > 0 && !madeProgress)
          ) {
            state.error = { kind: 'response', message: 'Repeated league page without progress' }
            return null
          }
          state.data = mergeSportEvents(
            state.data,
            response.e.map(event => rememberEvent(common.SportId, event, revision))
          )
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
    for (const id of requestedLeagueIds) {
      if (leagueJobs.size >= MAX_CONCURRENT_LEAGUES) break
      const state = getLeagueLoadState(id)
      if (!state?.complete && !state?.error && !leagueJobs.has(id)) void fetchLeagueEvents(id)
    }
  }
  const syncLeagueRequests = (ids: number[]) => {
    const next = new Set(
      keyword.value.trim() ? [] : ids.filter(id => Number.isSafeInteger(id) && id > 0)
    )
    for (const id of leagueJobs.keys()) if (!next.has(id)) cancelLeague(id)
    for (const id of next) {
      // 同一次展示期间不自动重试失败页；重新展开时才允许继续。
      if (!requestedLeagueIds.has(id)) {
        const state = getLeagueLoadState(id)
        if (state) state.error = null
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
      allSportsState.data = [...groups.values()]
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
        for (const group of rememberGroups(params.SportId, response.e, revision)) {
          const previous = groups.get(group.CompetitionId)
          const entries = new Map((previous?.Sports ?? []).map(event => [event.EventId, event]))
          if (!previous) progressed = true
          for (const event of group.Sports) {
            if (!entries.has(event.EventId)) progressed = true
            entries.set(event.EventId, event)
          }
          groups.set(group.CompetitionId, { ...group, Sports: [...entries.values()] })
        }
        if (!progressed) return fail('All-league pagination made no progress')
        publish(groups)
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
        allSportsState.data = data
        allSportsState.complete = true
        allSportsDataScope.value = scope
        allSportsDataContext.value = context
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
    try {
      const response = await Api.sport.getCompetitionList(params, { signal: controller.signal })
      if (!isCurrent()) return null
      competitionListState.response = response
      if (isApiBusinessSuccess(response)) {
        if (Array.isArray(response.result)) {
          competitionListState.data = response
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
            BetTypeIds: [1, 2, 3],
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
          // e 可以为空，表示本批赛事已不可用；保留真实响应，不伪造盘口。
          response.e.forEach(event =>
            received.set(
              event.EventId,
              rememberEvent(sportId, event, revision, { marketScope: params })
            )
          )
          hotDetailsState.data = [...received.values()]
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
      ? (competitionListState.data?.result ?? [])
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
  const eventsList = computed(() => {
    const groups = useCachedEvents.value
      ? allSportsDataContext.value === getAllSportsQueryContext()
        ? allLeagueGroups.value
        : []
      : eventsDataContext.value === getEventsContext()
        ? (events.state.data?.e ?? [])
        : []
    const selected = new Set(competitionIds.value)
    return groups
      .filter(group => !selected.size || selected.has(group.CompetitionId))
      .map(group => {
        const detail = keyword.value.trim() ? undefined : getLeagueLoadState(group.CompetitionId)
        const sports = detail?.data.length
          ? mergeSportEvents(group.Sports, detail.data)
          : group.Sports
        return { ...group, Sports: sports.map(withMemberFavourite) }
      })
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
  let refreshGeneration = 0
  let visibleQueue: Promise<unknown> = Promise.resolve()
  const getRefreshContext = () =>
    JSON.stringify([getEventsContext(), getAllSportsQueryContext(), memberCodeGeneration])
  const cancelHomepageRefresh = () => {
    refreshGeneration += 1
    for (const job of refreshJobs.values()) job.controller.abort()
    refreshJobs.clear()
    refreshingEvents.clear()
    visibleQueue = Promise.resolve()
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
        counts.state.data = response
        counts.state.response = response
      }
      return response
    })

  const refreshVisibleEvents = (targets: readonly SportsRefreshTarget[]): Promise<unknown> => {
    const waiting = new Set<Promise<unknown>>()
    const sports = new Map<number, Set<number>>()
    for (const { sportId, eventId } of targets) {
      if (!Number.isSafeInteger(sportId) || sportId <= 0) continue
      if (!Number.isSafeInteger(eventId) || eventId <= 0) continue
      const key = eventKey(sportId, eventId)
      const pending = refreshingEvents.get(key)
      if (pending) {
        waiting.add(pending)
        continue
      }
      const cached = refreshedEvents.get(key)
      if (cached && Date.now() - cached.updatedAt < EVENT_FRESH_TIME) continue
      const ids = sports.get(sportId) ?? new Set<number>()
      ids.add(eventId)
      sports.set(sportId, ids)
    }
    for (const [sportId, eventIds] of sports) {
      const ids = [...eventIds]
      for (let offset = 0; offset < ids.length; offset += SELECTED_EVENT_BATCH_SIZE) {
        const batch = ids.slice(offset, offset + SELECTED_EVENT_BATCH_SIZE)
        const previous = visibleQueue
        const pending = runHomepageRefresh(
          `events:${sportId}:${batch.join(',')}`,
          async (signal, isCurrent) => {
            await previous
            if (!isCurrent()) return null
            const knownLines = batch.flatMap(id => getRefreshEvent(sportId, id)?.MarketLines ?? [])
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
              BetTypeIds: [...new Set([1, 2, 3, ...knownLines.map(line => line.BetTypeId)])],
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
            for (const event of response.e) {
              rememberEvent(sportId, event, revision, { marketScope: params })
            }
            return response
          }
        )
        visibleQueue = pending
        waiting.add(pending)
        for (const id of batch) refreshingEvents.set(eventKey(sportId, id), pending)
        void pending.finally(() => {
          for (const id of batch) {
            const key = eventKey(sportId, id)
            if (refreshingEvents.get(key) === pending) refreshingEvents.delete(key)
          }
        })
      }
    }
    return Promise.all(waiting)
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
        if (!isCurrent() || !isSportsSuccess(response) || !Array.isArray(response.e)) return null
        const event = response.e.find(item => item.EventId === selection.eventId)
        // 缺少赛事或投注项列表，不能当作确认失效。
        if (!event || !Array.isArray(event.MarketLines)) return null
        const line = event.MarketLines.find(
          item => item.MarketlineId === selection.market.MarketlineId
        )
        if (line && !Array.isArray(line.WagerSelections)) return null
        const exists = line?.WagerSelections.some(
          item => item.WagerSelectionId === selection.wagerSelectionId
        )
        const cached = refreshedEvents.get(eventKey(selection.sportId, selection.eventId))
        if (cached && cached.revision > revision) return null
        rememberEvent(selection.sportId, event, revision, { marketScope: params })
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
        old ? { ...old, ...group, Sports: mergeSportEvents(old.Sports, group.Sports) } : group
      )
    }
    return [...groups.values()]
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
      const refreshList = async () => {
        if (!search && allSportsPending) return allSportsPending
        if (search && events.state.loading) return null
        const pages: {
          response: GetSportsV2Response
          revision: number
          favourite: number
          receivedAt: number
        }[] = []
        const seen = new Set<string>()
        let totalPages = 1
        for (let page = 1; page <= totalPages; page += 1) {
          if (!isCurrent()) return null
          // 可见赛事先发，后台分页等待当前批次结束。
          await visibleQueue
          if (!isCurrent()) return null
          const revision = ++eventReadRevision
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
            const total = response.Total
            if (typeof total !== 'number' || !Number.isSafeInteger(total) || total < 0) return null
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
          pages.push({ response, revision, favourite, receivedAt: Date.now() })
        }
        if (!isCurrent()) return null
        const lastResponse = pages[pages.length - 1]?.response
        if (!search) {
          const leagueIds = new Set(
            pages.flatMap(page => page.response.e?.map(group => group.CompetitionId) ?? [])
          )
          if (leagueIds.size < (lastResponse?.Total ?? 0)) return null
        }
        const groups = pages.flatMap(({ response, revision, favourite, receivedAt }) => {
          syncMemberFavourites(response.e ?? [], favourite, params.MemberCode)
          return rememberGroups(sportId, response.e ?? [], revision, receivedAt)
        })
        if (search) {
          if (eventsDataContext.value !== getEventsContext() || !events.state.data) return null
          events.state.data = {
            ...events.state.data,
            ...pages[0]?.response,
            e: mergeRefreshGroups(events.state.data.e ?? [], groups)
          }
        } else if (allSportsDataContext.value === getAllSportsQueryContext()) {
          allSportsState.data = mergeRefreshGroups(allSportsState.data, groups)
          allSportsState.total = lastResponse?.Total ?? allSportsState.total
          allSportsState.complete = true
        }
        return groups
      }
      const refreshHot = async () => {
        if (competitionListState.loading) return null
        const endTime = Date.now()
        const response = await Api.sport.getCompetitionList(
          {
            param: {
              page: 1,
              sportId,
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
        const missing = response.result.filter(
          record => !getRefreshEvent(record.sportId, record.eventId)
        )
        for (let offset = 0; offset < missing.length; offset += SELECTED_EVENT_BATCH_SIZE) {
          if (!isCurrent()) return null
          await refreshVisibleEvents(
            missing
              .slice(offset, offset + SELECTED_EVENT_BATCH_SIZE)
              .map(record => ({ sportId: record.sportId, eventId: record.eventId }))
          )
        }
        return response
      }
      return Promise.allSettled([refreshList(), refreshHot()])
    })

  watch(getRefreshContext, cancelHomepageRefresh, { flush: 'sync' })
  watch(
    () =>
      JSON.stringify([getBaseUrl(), languageCode.value, market.value, sportsSessionVersion.value]),
    () => refreshedEvents.clear(),
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
    cancelHomepageRefresh,
    getRefreshEvent,
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
