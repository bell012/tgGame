import { defineStore } from 'pinia'
import { computed, ref, shallowReactive, shallowRef } from 'vue'
import Api from '@/api'
import type {
  FavouriteEventParams,
  GetCompetitionPageParams,
  GetSportsV2Params,
  SportCompetitionGroup,
  SportsLanguageCode,
  SportsMarket,
  SportsOddsType,
  SportsResponse,
  SportsSortType
} from '@/api/interface/sport'
import type { SportsRequestOptions } from '@/api/modules/sport'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'

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
  const pageNumber = ref(1)
  const pageSize = ref(10)
  const competitionIds = ref<number[]>([])
  const keyword = ref('')
  const earlyTradingDate = ref<string | null>(null)
  const homepageLoading = ref(false)
  const homepageError = ref<SportsRequestError | null>(null)
  let homepageGeneration = 0
  let loadedCountsContext = ''
  const leagueSnapshot = shallowRef<SportCompetitionGroup[]>([])
  const leagueSnapshotContext = ref('')
  const eventsDataContext = ref('')

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

  // 保留服务端字段与嵌套结构，页面负责展示转换，Store 不裁剪盘口。
  const requests = shallowReactive({
    GetAllSportCount: counts.state,
    getSportsV2: events.state,
    getSportEventIndexList: indexes.state,
    getCompetitionPage: competition.state,
    getPopularSports: popular.state,
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
      keyword.value,
      market.value === 1 ? earlyTradingDate.value : null
    ])
  // 只保存当前范围已返回的联赛，不把分页结果宣称为全量联赛；切换范围立即隐藏旧候选。
  const leagueGroups = computed(() =>
    leagueSnapshotContext.value === getLeagueContext() ? leagueSnapshot.value : []
  )
  const getEventsContext = () =>
    JSON.stringify([
      getLeagueContext(),
      sortType.value,
      competitionIds.value,
      pageNumber.value,
      pageSize.value
    ])
  // 筛选刚变化、尚未发起新请求时，也不能把旧赛事按新球种展示。
  const eventsList = computed(() =>
    eventsDataContext.value === getEventsContext() ? (events.state.data?.e ?? []) : []
  )
  // Total 的计数口径保留接口原值，不当作赛事总数参与页面分页。
  const eventsTotal = computed(() => events.state.data?.Total ?? 0)
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
    const params: GetSportsV2Params = {
      ...commonParams(),
      // 参考接口组装约定：1 为默认列表，指定联赛时使用 2（筛选）。
      competitionCondType: (overrides.CompetitionIds ?? competitionIds.value).length ? 2 : 1,
      PageNumber: pageNumber.value,
      PageSize: pageSize.value,
      SortType: sortType.value,
      CompetitionIds: [...competitionIds.value],
      Keyword: keyword.value,
      IsFavourite: false,
      earlyTradingDate: market.value === 1 ? earlyTradingDate.value : null,
      // 游客查询不触发体育登录，也不使用本站会员 ID 代替平台账号。
      MemberCode: null,
      ...overrides
    }
    const context = JSON.stringify([
      getBaseUrl(),
      params.LanguageCode,
      params.SportId,
      params.Market,
      params.Keyword,
      params.Market === 1 ? params.earlyTradingDate : null
    ])
    const response = await events.load(params)
    if (response && events.state.data === response) {
      eventsDataContext.value = JSON.stringify([
        context,
        params.SortType,
        params.CompetitionIds,
        params.PageNumber,
        params.PageSize
      ])
    }
    if (
      response &&
      events.state.data === response &&
      context === getLeagueContext() &&
      Array.isArray(response.e) &&
      ((!params.CompetitionIds.length && params.PageNumber === 1) ||
        leagueSnapshotContext.value !== context)
    ) {
      // 同范围按联赛筛选时保留候选，避免列表只剩选中的联赛。
      leagueSnapshotContext.value = context
      leagueSnapshot.value = response.e
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
    homepageLoading.value = false
  }
  const reset = () => {
    cancelRequests()
    resources.forEach(resource => resource.reset())
    loadedCountsContext = ''
    leagueSnapshot.value = []
    leagueSnapshotContext.value = ''
    eventsDataContext.value = ''
    homepageError.value = null
  }

  /** 首屏先取数量，再按最新筛选取赛事；同环境切换筛选只刷新赛事。 */
  const loadHomepage = async ({ refreshCounts = true }: { refreshCounts?: boolean } = {}) => {
    const generation = ++homepageGeneration
    // 保留同条件的在途数量请求供后一次操作复用，仅取消旧赛事，防止旧条件回写。
    events.cancel()
    if (refreshCounts) loadedCountsContext = ''
    homepageLoading.value = true
    homepageError.value = null
    try {
      await siteConfigStore.initSiteConfig()
      if (generation !== homepageGeneration) return
      if (!getBaseUrl()) {
        resources.forEach(resource => resource.reset())
        loadedCountsContext = ''
        leagueSnapshot.value = []
        leagueSnapshotContext.value = ''
        eventsDataContext.value = ''
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
      // 数量等待期间可能更换球种；此处读取 Store 当前值，不使用请求前的筛选快照。
      await fetchSports()
      if (generation !== homepageGeneration) return
      homepageError.value = events.state.error
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
    leagueGroups,
    eventsTotal,
    eventsIndexList,
    competitionEvents,
    popularSports,
    fetchSportCounts,
    fetchSports,
    fetchSportEventIndexList,
    fetchCompetitionPage,
    fetchPopularSports,
    setFavouriteEvent,
    loadHomepage,
    cancelRequests,
    reset
  }
})
