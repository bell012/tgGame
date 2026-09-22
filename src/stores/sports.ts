import { defineStore } from 'pinia'
import { computed, ref, shallowReactive, watch } from 'vue'
import Api from '@/api'
import type {
  FavouriteEventParams,
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
import { isApiBusinessSuccess } from '@/utils/apiBusiness'

/** 当前选中的赛事筛选标签。 */
export type FilterTabKey = 'rolling' | 'today' | 'early' | 'parlay'

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
const ALL_SPORTS_PAGE_SIZE = 10
const MAX_ALL_SPORTS_PAGES = 200
const SELECTED_EVENT_BATCH_SIZE = 5
const MAX_CONCURRENT_LEAGUES = 3

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

  // 滚球 今日 早盘 串关数据
  const counts = createSportsRequest(getBaseUrl, Api.sport.getAllSportCount, response =>
    Array.isArray(response.spc)
  )

  // 所有联赛数据
  const events = createSportsRequest(getBaseUrl, Api.sport.getSportsV2, response =>
    Array.isArray(response.e)
  )

  // 索引汇总
  const indexes = createSportsRequest(getBaseUrl, Api.sport.getSportEventIndexList, response =>
    Array.isArray(response.e)
  )

  // 联赛下的详细赛事
  const competition = createSportsRequest(getBaseUrl, Api.sport.getCompetitionPage, response =>
    Array.isArray(response.e)
  )

  const popular = createSportsRequest(getBaseUrl, Api.sport.getPopularSports, response =>
    Array.isArray(response.e)
  )
  const favourite = createSportsRequest(getBaseUrl, Api.sport.favouriteEvent, () => true)
  const resources = [counts, events, indexes, competition, popular, favourite]

  // 全联赛缓存独立于搜索和联赛选择，按收藏置顶条件隔离；response 仅保留最近一页。
  const allSportsState = shallowReactive<{
    params: GetSportsV2Params | null
    response: GetSportsV2Response | null
    data: SportCompetitionGroup[]
    loading: boolean
    complete: boolean
    /** 默认列表最近一页返回的联赛总数；不是赛事总数。 */
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
    JSON.stringify([getBaseUrl(), languageCode.value, selectedSportId.value, market.value])
  const getAllSportsQueryContext = () => JSON.stringify([getAllSportsContext(), isFavourite.value])
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
          const response = await Api.sport.getCompetitionPage(
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
          state.data = mergeSportEvents(state.data, response.e)
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
  const retryLeague = (id: number) => {
    if (!requestedLeagueIds.has(id)) return
    const state = getLeagueLoadState(id)
    if (state) state.error = null
    pumpLeagueRequests()
  }
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
  const fetchAllSports = (): Promise<SportCompetitionGroup[] | null> => {
    const scope = getAllSportsContext()
    const context = getAllSportsQueryContext()
    if (allSportsPending && allSportsRequestContext.value === context) return allSportsPending
    cancelAllSports()
    // 仅切换收藏排序不作热门详情刷新；补全接口本身没有收藏参数。
    if (allSportsRequestScope.value !== scope || allSportsRequestContext.value === context) {
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
      SortType: 1,
      CompetitionIds: [],
      Keyword: '',
      IsFavourite: isFavourite.value,
      earlyTradingDate: null,
      MemberCode: null
    }
    const fail = (message: string) => {
      allSportsState.error = { kind: 'response', message }
      return null
    }
    const publish = (groups: Map<number, SportCompetitionGroup>) => {
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
        const response = await Api.sport.getSportsV2(baseUrl, pageParams, {
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
        // SortType=1 时 Total 为联赛数；按每页 10 组计算页数，不额外请求空页。
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
        for (const group of response.e) {
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
          const response = await Api.sport.getSelectedEventInfo(baseUrl, params, {
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
          response.e.forEach(event => received.set(event.EventId, event))
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
    favouriteEvent: favourite.state
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
      isFavourite.value
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
        allEventsById.value.get(record.eventId) ?? hotDetailsById.value.get(record.eventId)
      return event ? [event] : []
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
  const useCachedEvents = computed(
    () => !keyword.value.trim() && (competitionIds.value.length > 0 || sortType.value === 1)
  )
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
        if (keyword.value.trim()) return group
        const detail = getLeagueLoadState(group.CompetitionId)
        return detail?.data.length
          ? { ...group, Sports: mergeSportEvents(group.Sports, detail.data) }
          : group
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
  // 默认按联赛排序时为联赛总数，不当作赛事卡片数量参与本地分页。
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
      // 游客查询不触发体育登录，也不使用本站会员 ID 代替平台账号。
      MemberCode: null,
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
      params.IsFavourite
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
    const response = await events.load(params)
    if (response && events.state.data === response) {
      eventsDataContext.value = requestContext
    }
    return response
  }
  const fetchSportEventIndexList = () => indexes.load({ ...commonParams(), Keyword: '' })
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

  /** 收藏是写操作，只提供显式入口，不随首页初始化调用或绑定模拟收藏按钮。 */
  const setFavouriteEvent = (params: FavouriteEventParams) => {
    if (!params.MemberCode.trim()) {
      return Promise.reject(new Error('A sports platform MemberCode is required'))
    }
    return favourite.load(params)
  }

  const cancelRequests = () => {
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

  /** 首屏先取数量，再请求热门名单和默认联赛缓存；搜索、筛选使用独立请求结果。 */
  const loadHomepage = async ({
    refreshCounts = true,
    refreshCompetitionList = refreshCounts
  }: { refreshCounts?: boolean; refreshCompetitionList?: boolean } = {}) => {
    const generation = ++homepageGeneration
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

  return {
    oddsTypeEnum,
    getLanguage,
    languageCode,
    selectedSportId,
    selectedFilterKey,
    market,
    sortType,
    isFavourite,
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
    setFavouriteEvent,
    loadHomepage,
    cancelRequests,
    reset
  }
})
