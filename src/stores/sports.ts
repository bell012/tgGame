import { defineStore, storeToRefs } from 'pinia'
import { computed, nextTick, onScopeDispose, reactive, ref, shallowReactive, watch } from 'vue'
import type { ComputedRef } from 'vue'
import Api from '@/api'
import type {
  GetBetInfoParams,
  GetBetInfoResponse,
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
import { useSportsAuthStore } from '@/stores/sportsAuth'
import { useSportsBalanceStore } from '@/stores/sportsBalance'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { isApiBusinessSuccess } from '@/utils/apiBusiness'
import { decimalOdds } from '@/views/sports/components/bet-slip/bet-info'
import i18n from '@/i18n'
import { globalShowToast } from '@/utils/toast'

/** 当前选中的赛事筛选标签。 */
export type FilterTabKey = 'rolling' | 'today' | 'early' | 'parlay'

export type SportsRefreshTarget = { sportId: number; eventId: number }
export type SportsFavouriteTarget = SportsRefreshTarget & {
  eventDate: string
  competitionId: number
  market: SportEvent['Market']
  homeTeam: string
}

/** 下单前拦截，尚未向体育网关发送请求。 */
export class SportsBetNotSentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SportsBetNotSentError'
  }
}

export class SportsCredentialsUnavailableError extends SportsBetNotSentError {}

type SportsBetInfoQuery = Pick<GetBetInfoParams, 'WagerType' | 'WagerSelectionInfos'>
type SportsPlaceBetQuery = Pick<
  PlaceBetParams,
  'WagerType' | 'WagerSelectionInfos' | 'ComboSelections' | 'IsComboAcceptAnyOdds'
>

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
  kind: 'config' | 'business' | 'response' | 'network' | 'credentials'
  message: string
  code?: number | string
}

/** 收藏查询未能确认当前会员身份，不能将返回列表当作已确认的收藏结果。 */
class SportsFavouriteCredentialsError extends Error {}

type SportsFavouriteResult =
  'success' | 'synced' | 'failed' | 'login-failed' | 'auth-expired' | 'stale'

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
const EVENT_CHECK_INTERVAL = 20_000
const SELECTED_LIVE_MAX_AGE = 20_000

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
      } catch (error) {
        if (currentGeneration === generation && !signal.aborted) {
          state.error = {
            kind: error instanceof SportsFavouriteCredentialsError ? 'credentials' : 'network',
            message: 'Sports request failed'
          }
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
  const sportsAuth = useSportsAuthStore()
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
  const sportsSessionVersion = ref(0)
  const sportsBalanceStore = useSportsBalanceStore()
  const { sportsBalance, sportsBalanceLoading, sportsBalanceError } =
    storeToRefs(sportsBalanceStore)
  const { fetchSportsBalance, beginSportsBalanceUpdate, scheduleSportsBalanceRefresh } =
    sportsBalanceStore
  let homepageActive = false
  onScopeDispose(() => {
    homepageActive = false
    cancelFavouriteSync()
    cancelBetInfo()
  })
  const retryJobs = shallowReactive(new Map<string, Promise<void>>())
  let sportsVisitGeneration = 0
  const invalidateSportsVisit = () => {
    sportsVisitGeneration += 1
    retryJobs.clear()
  }
  watch(
    [
      () => userStore.userInfo?.tradeToken,
      () => userStore.userInfo?.memberId,
      () => userStore.acctInfo?.memberId,
      currentCurrencyCode,
      () => localeStore.currentLanguage,
      getBaseUrl
    ],
    () => {
      sportsSessionVersion.value += 1
      cancelBetInfo()
      invalidateSportsVisit()
    },
    { flush: 'sync' }
  )
  const sportsApi = Api.sport
  const isAuthExpired = (response: SportsResponse) =>
    response.stc === 102 || response.stc === '102' || response.stc === 202 || response.stc === '202'

  const memberFavourites = shallowReactive(new Map<number, boolean>())
  const favouriteJobs = shallowReactive(new Map<number, symbol>())
  const unconfirmedFavourites = new Set<number>()
  const favouriteOwner = () =>
    JSON.stringify([
      isLoggedIn.value,
      userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId,
      currentCurrencyCode.value
    ])
  let favouriteRevision = 0
  let favouriteResetRevision = 0
  const favouriteEventRevisions = new Map<number, number>()
  watch(
    [() => sportsAuth.contextVersion, favouriteOwner],
    ([, owner], [, previousOwner]) => {
      favouriteResetRevision = ++favouriteRevision
      favouriteEventRevisions.clear()
      memberFavourites.clear()
      // 同账号切换语言时保留在途动作，避免再次点击将收藏切回去。
      if (owner !== previousOwner) {
        favouriteJobs.clear()
        unconfirmedFavourites.clear()
      }
    },
    { flush: 'sync' }
  )
  // 赛事查询只读取现成凭据，不等待登录；收藏列表不能降级成匿名查询。
  const sendHomepageSports = async (
    baseUrl: string,
    params: GetSportsV2Params,
    options?: SportsRequestOptions
  ): Promise<GetSportsV2Response> => {
    const context = sportsAuth.contextVersion
    const revision = favouriteRevision
    const credentials = sportsAuth.peekCredentials()
    if (options?.signal?.aborted || context !== sportsAuth.contextVersion)
      throw new Error('Stale sports request')
    const current = credentials && sportsAuth.isCredentialsCurrent(credentials) ? credentials : null
    if (params.IsFavourite && !current)
      throw new SportsFavouriteCredentialsError('Sports credentials unavailable')
    const query = { ...params }
    delete query.MemberCode
    const response = await sportsApi.getSportsV2(
      baseUrl,
      {
        ...query,
        ...(current ? { MemberCode: current.memberCode } : {})
      },
      options
    )
    if (current && isAuthExpired(response)) sportsAuth.clearCredentials(current)
    if (
      params.IsFavourite &&
      isSportsSuccess(response) &&
      (!current || !sportsAuth.isCredentialsCurrent(current) || revision < favouriteResetRevision)
    ) {
      throw new SportsFavouriteCredentialsError('Sports credentials changed during favourite query')
    }
    if (
      !options?.signal?.aborted &&
      current &&
      sportsAuth.isCredentialsCurrent(current) &&
      revision >= favouriteResetRevision &&
      isSportsSuccess(response) &&
      Array.isArray(response.e)
    ) {
      for (const group of response.e) {
        if (!Array.isArray(group?.Sports)) continue
        for (const event of group.Sports) {
          if (
            event &&
            Number.isSafeInteger(event.EventId) &&
            (favouriteEventRevisions.get(event.EventId) ?? 0) <= revision &&
            !favouriteJobs.has(event.EventId) &&
            typeof event.IsFavourite === 'boolean'
          ) {
            memberFavourites.set(event.EventId, event.IsFavourite)
            unconfirmedFavourites.delete(event.EventId)
          }
        }
      }
    }
    return response
  }
  /** 同次停留的重试任务去重，离页后不继续执行。 */
  const runSportsRetry = (
    key: string,
    action: (isCurrent: () => boolean) => void | Promise<unknown>
  ): Promise<void> => {
    if (!homepageActive) return Promise.resolve()
    const existing = retryJobs.get(key)
    if (existing) return existing
    const version = sportsSessionVersion.value
    const visit = sportsVisitGeneration
    const isCurrent = () =>
      homepageActive && version === sportsSessionVersion.value && visit === sportsVisitGeneration
    const pending = Promise.resolve()
      .then(async () => {
        if (!isCurrent()) return
        await action(isCurrent)
      })
      .finally(() => {
        if (retryJobs.get(key) === pending) retryJobs.delete(key)
      })
    retryJobs.set(key, pending)
    return pending
  }
  const favouriteViews = new WeakMap<SportEvent, ComputedRef<SportEvent>>()
  const withMemberFavourite = (event: SportEvent): SportEvent => {
    let view = favouriteViews.get(event)
    if (!view) {
      view = computed<SportEvent>(previous => {
        const next = {
          ...event,
          IsFavourite: isLoggedIn.value && (memberFavourites.get(event.EventId) ?? false)
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
  // 游客不能开启收藏列表；请求仍用收藏置顶参数，展示出口再过滤未收藏赛事。
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
        receivedAt: number
      }
    >()
  )
  let eventReadRevision = 0
  const eventKey = (sportId: number, eventId: number) => `${sportId}:${eventId}`
  const expiredEvents = shallowReactive(new Map<string, number>())
  // 只有普通轮次的有效缺失响应可以累计确认；热门与单盘口查询不能删除普通赛事。
  const missingEventRounds = new Map<string, { round: number; revision: number }>()
  let normalRoundSequence = 0
  let normalRound: { id: number; receivedIds: Set<number> } | undefined
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
    }
    // 新名单只是恢复线索，确认存在后才重新显示。
    // 列表阶段只保存恢复线索，统一在本轮列表与补页结束后复核。
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
          clockUpdatedAt: receivedAt,
          receivedAt
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
    if (updateFields) {
      previous.revision = revision
      if (!marketScope?.BetTypeIds?.length) previous.receivedAt = receivedAt
    }
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

  // 只有普通轮次能累计缺失；任何较新的有效更新都会使旧复核失效。
  const updateSelectedEvents = (
    sportId: number,
    eventIds: readonly number[],
    incoming: SportEvent[],
    revision: number,
    marketScope: MarketRefreshScope,
    roundId?: number
  ) => {
    const returnedIds = new Set(incoming.map(event => event.EventId))
    let removed = false
    for (const id of eventIds) {
      const key = eventKey(sportId, id)
      const latestRevision = Math.max(
        refreshedEvents.get(key)?.revision ?? 0,
        refreshedEvents.get(key)?.checkedRevision ?? 0,
        expiredEvents.get(key) ?? 0
      )
      if (returnedIds.has(id) || revision < latestRevision) continue
      if (roundId === undefined) continue
      const missing = missingEventRounds.get(key)
      if (!missing || missing.round === roundId) {
        missingEventRounds.set(key, { round: roundId, revision })
        continue
      }
      if (revision < missing.revision) continue
      missingEventRounds.delete(key)
      expiredEvents.set(key, revision)
      refreshedEvents.delete(key)
      removed = true
    }
    for (const event of incoming) {
      const key = eventKey(sportId, event.EventId)
      if (
        revision <
        Math.max(
          refreshedEvents.get(key)?.revision ?? 0,
          refreshedEvents.get(key)?.checkedRevision ?? 0,
          missingEventRounds.get(key)?.revision ?? 0
        )
      )
        continue
      missingEventRounds.delete(key)
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
  const events = createSportsRequest(getBaseUrl, sendHomepageSports, response =>
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
  const betInfoState = shallowReactive<SportsRequestState<SportsBetInfoQuery, GetBetInfoResponse>>({
    params: null,
    response: null,
    data: null,
    loading: false,
    error: null
  })
  let betInfoGeneration = 0
  let betInfoController: AbortController | undefined
  // 所有报价入口共用 3 秒发送间隔；取消查询、关闭投注单不会重置冷却时间。
  let lastBetInfoSentAt = 0
  const waitForBetInfoSlot = async (signal: AbortSignal) => {
    while (!signal.aborted) {
      const remaining = lastBetInfoSentAt + 3000 - Date.now()
      if (remaining <= 0) return
      await new Promise<void>(resolve => {
        const finish = () => {
          clearTimeout(timer)
          signal.removeEventListener('abort', finish)
          resolve()
        }
        const timer = setTimeout(finish, remaining)
        signal.addEventListener('abort', finish, { once: true })
      })
    }
  }
  const cancelBetInfo = () => {
    betInfoGeneration += 1
    betInfoController?.abort()
    betInfoController = undefined
    betInfoState.params = null
    betInfoState.response = null
    betInfoState.data = null
    betInfoState.loading = false
    betInfoState.error = null
  }
  // 选项先加入；报价时才取凭据，获取失败不删除选项。
  const fetchBetInfo = async (query: SportsBetInfoQuery): Promise<GetBetInfoResponse | null> => {
    cancelBetInfo()
    if (!isLoggedIn.value || !query.WagerSelectionInfos.length) return null
    if (!getBaseUrl()) {
      betInfoState.error = { kind: 'config', message: 'Missing IM.im_app_url' }
      return null
    }
    const generation = betInfoGeneration
    const version = sportsSessionVersion.value
    const context = sportsAuth.contextVersion
    const controller = new AbortController()
    betInfoController = controller
    const isCurrent = () =>
      !controller.signal.aborted &&
      generation === betInfoGeneration &&
      version === sportsSessionVersion.value &&
      context === sportsAuth.contextVersion
    const selections = query.WagerSelectionInfos.map(item => ({ ...item }))
    betInfoState.loading = true
    try {
      const credentials = await sportsAuth.ensureCredentials()
      if (!isCurrent()) return null
      if (!credentials)
        throw new SportsCredentialsUnavailableError('Sports credentials unavailable')
      if (query.WagerType === 2) {
        if (
          selections.length < 2 ||
          new Set(selections.map(item => item.EventId)).size !== selections.length
        ) {
          betInfoState.error = { kind: 'business', code: 439, message: 'Parlay unavailable' }
          return null
        }
        // 只换算查询赔率，保留用户选择的 ID、盘口值和源数据。
        // 滚球补查可能已换线；是否可投及最新报价统一由 GetBetInfo 判断。
        for (const item of selections) {
          if (item.OddsType === 3) continue
          const odds = decimalOdds(item.Odds, item.OddsType)
          if (odds === null || !Number.isFinite(odds) || odds <= 1)
            throw new Error('Invalid parlay odds')
          item.OddsType = 3
          item.Odds = odds
        }
      }
      await waitForBetInfoSlot(controller.signal)
      if (!isCurrent()) return null
      if (!sportsAuth.isCredentialsCurrent(credentials))
        throw new SportsCredentialsUnavailableError('Sports credentials changed')
      // 查询状态不保存 Token / MemberCode；只在发送时补齐。
      betInfoState.params = { ...query, WagerSelectionInfos: selections }
      lastBetInfoSentAt = Date.now()
      const response = await sportsApi.getBetInfo(
        getBaseUrl(),
        {
          ...query,
          WagerSelectionInfos: selections,
          Token: credentials.token,
          MemberCode: credentials.memberCode,
          LanguageCode: getLanguage(),
          TimeStamp: Date.now()
        },
        { signal: controller.signal }
      )
      if (!isCurrent()) return null
      if (!sportsAuth.isCredentialsCurrent(credentials))
        throw new SportsCredentialsUnavailableError('Sports credentials changed')
      betInfoState.response = response
      if (isAuthExpired(response)) {
        sportsAuth.clearCredentials(credentials)
        globalShowToast({ type: 'fail', message: i18n.global.t('sports.betLoginFailed') })
        throw new SportsCredentialsUnavailableError('Sports credentials expired')
      }
      if (![100, 350].includes(Number(response.stc))) {
        betInfoState.error = { kind: 'business', code: response.stc, message: response.std }
      } else if (!Array.isArray(response.wsis) || !Array.isArray(response.bs)) {
        betInfoState.error = { kind: 'response', message: 'Unexpected bet information response' }
        return null
      } else betInfoState.data = response
      return response
    } catch (error) {
      if (!isCurrent()) return null
      if (!(error instanceof SportsCredentialsUnavailableError))
        betInfoState.error = {
          kind: 'network',
          message: error instanceof Error ? error.message : 'Bet information query failed'
        }
      throw error
    } finally {
      if (generation === betInfoGeneration) {
        betInfoController = undefined
        betInfoState.loading = false
      }
    }
  }
  // 单关各自发送；已经发出的下单不取消、不重试。
  const placeBet = async (
    query: SportsPlaceBetQuery,
    canSend: () => boolean = () => true,
    options: { updateBalance?: boolean } = {}
  ): Promise<PlaceBetResponse> => {
    const version = sportsSessionVersion.value
    const context = sportsAuth.contextVersion
    if (!isLoggedIn.value || !getBaseUrl() || !canSend())
      throw new SportsBetNotSentError('Sports session unavailable')
    if (!query.WagerSelectionInfos.length || !query.ComboSelections.length)
      throw new SportsBetNotSentError('No bet selections')
    const credentials = await sportsAuth.ensureCredentials()
    if (
      version !== sportsSessionVersion.value ||
      context !== sportsAuth.contextVersion ||
      !canSend()
    )
      throw new SportsBetNotSentError('Sports session changed')
    if (!credentials) throw new SportsCredentialsUnavailableError('Sports credentials unavailable')
    if (!sportsAuth.isCredentialsCurrent(credentials))
      throw new SportsBetNotSentError('Sports credentials changed')
    const finishBalanceUpdate = beginSportsBalanceUpdate(credentials)
    try {
      const response = await sportsApi.placeBet(getBaseUrl(), {
        ...query,
        Token: credentials.token,
        MemberCode: credentials.memberCode,
        LanguageCode: getLanguage(),
        TimeStamp: Date.now()
      })
      if (isAuthExpired(response)) sportsAuth.clearCredentials(credentials)
      if (options.updateBalance !== false && isSportsSuccess(response)) {
        const validBalance = typeof response.av === 'number' && Number.isFinite(response.av)
        finishBalanceUpdate({ amount: response.av, refresh: !validBalance })
      }
      return response
    } finally {
      // 已发送但失败或结果未知时仍补查；成功 av 已结束更新时此调用无效。
      finishBalanceUpdate({ refresh: options.updateBalance !== false })
    }
  }

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
  watch(
    getAllSportsContext,
    () => {
      leagueSnapshots.clear()
      emptyLeagueRevisions.clear()
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
    for (const id of leagueJobs.keys()) cancelLeague(id)
  }
  const getLeagueLoadState = (id: number) =>
    leagueDetailsContext === getLeagueDetailsContext() ? leagueDetails.get(id) : undefined

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
  const cleanupEmptyLeagues = (absentLeagueIds?: ReadonlySet<number>) => {
    if (allSportsDataScope.value !== getAllSportsContext()) return
    const previous = allSportsState.data
    const next = filterEmptyLeagueGroups(previous).filter(group => {
      if (!absentLeagueIds?.has(group.CompetitionId)) return true
      // 完整 V2 已不含此联赛，且所有已知赛事均经详情复核删除时，旧计数不能阻止清理。
      // 保留预览中的 ID 作为复核证据；没有证据或仍有有效赛事时不能删联赛。
      const knownEvents = [
        ...group.Sports,
        ...(getLeagueLoadState(group.CompetitionId)?.data ?? []),
        ...(leagueSnapshots.get(group.CompetitionId)?.group.Sports ?? [])
      ]
      return (
        !knownEvents.length ||
        knownEvents.some(event => !isEventExpired(selectedSportId.value, event.EventId))
      )
    })
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
    }
    // 选中的联赛已清空时回到全部，保留其余有效的多选项。
    if (competitionIds.value.some(id => removed.has(id)))
      competitionIds.value = competitionIds.value.filter(id => !removed.has(id))
  }

  /** 仅由普通轮次调用；页与联赛均串行，失败交回轮次停止后续补页。 */
  const fetchLeagueEvents = async (id: number): Promise<SportEvent[] | null> => {
    const round = normalRound
    if (!round || keyword.value.trim() || !getBaseUrl()) return null
    const existing = leagueJobs.get(id)
    if (existing) return existing.pending
    const state = leagueDetails.get(id) ?? createLeagueEventsState()
    leagueDetails.set(id, state)
    state.nextPage = 1
    state.complete = false
    state.error = null
    state.loading = true
    state.receivedEventIds.clear()
    const controller = new AbortController()
    const context = getLeagueDetailsContext()
    const isCurrent = () =>
      !controller.signal.aborted && normalRound === round && context === getLeagueDetailsContext()
    const common = {
      LanguageCode: languageCode.value,
      Market: market.value,
      SportId: selectedSportId.value,
      SortType: sortType.value,
      CompetitionIds: [id],
      PageSize: ALL_SPORTS_PAGE_SIZE
    }
    const pending = Promise.resolve().then(async () => {
      try {
        while (isCurrent() && !state.complete) {
          if (state.nextPage > MAX_ALL_SPORTS_PAGES) {
            state.error = { kind: 'response', message: 'League page limit exceeded' }
            return null
          }
          const revision = ++eventReadRevision
          if (state.nextPage === 1) state.readRevision = revision
          const response = await sportsApi.getCompetitionPage(
            getBaseUrl(),
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
          for (const event of response.e) {
            round.receivedIds.add(event.EventId)
            missingEventRounds.delete(eventKey(common.SportId, event.EventId))
            state.receivedEventIds.add(event.EventId)
          }
          state.data = mergeSportEvents(
            state.data,
            activeEvents(common.SportId, response.e).map(event =>
              rememberEvent(common.SportId, event, revision)
            )
          )
          state.nextPage += 1
          state.complete = !response.hasNextPage
        }
        return isCurrent() ? state.data : null
      } catch {
        if (isCurrent()) state.error = { kind: 'network', message: 'League request failed' }
        return null
      } finally {
        if (leagueJobs.get(id)?.controller === controller) {
          leagueJobs.delete(id)
          state.loading = false
        }
      }
    })
    leagueJobs.set(id, { controller, pending })
    return pending
  }
  // 展开与滚动只更新需求，不绕过普通轮次独立发起补页。
  const syncLeagueRequests = (ids: number[]) => {
    requestedLeagueIds = new Set(
      keyword.value.trim() ? [] : ids.filter(id => Number.isSafeInteger(id) && id > 0)
    )
  }
  const retryLeague = (id: number) => {
    if (!Number.isSafeInteger(id) || id <= 0) return Promise.resolve()
    return runSportsRetry('league', () => refreshHomepageNormal())
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
  const fetchAllSports = ({ keepPrevious = false } = {}): Promise<
    SportCompetitionGroup[] | null
  > => {
    const scope = getAllSportsContext()
    const context = getAllSportsQueryContext()
    if (allSportsPending && allSportsRequestContext.value === context) return allSportsPending
    cancelAllSports()
    // 热门详情独立加载，主列表翻页或重载不能取消它。
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
      earlyTradingDate: null
    }
    const retainPrevious =
      keepPrevious && allSportsDataContext.value === context && allSportsState.data.length > 0
    const round = normalRound
    const fail = (message: string) => {
      allSportsState.error = { kind: 'response', message }
      return null
    }
    const publish = (groups: Map<number, SportCompetitionGroup>) => {
      // 同条件刷新逐页合并，未返回或失败的页不覆盖旧数据。
      const incoming = activeGroups(params.SportId, [...groups.values()])
      allSportsState.data = retainPrevious
        ? mergeRefreshGroups(allSportsState.data, incoming)
        : incoming
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
        const revision = ++eventReadRevision
        const response = await sendHomepageSports(baseUrl, pageParams, {
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
        for (const group of response.e)
          for (const event of group.Sports) {
            round?.receivedIds.add(event.EventId)
            missingEventRounds.delete(eventKey(params.SportId, event.EventId))
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
    // 同条件后台更新不切换页面加载态，避免周期性禁用联赛折叠按钮。
    allSportsState.loading = !retainPrevious
    allSportsPending = (async () => {
      try {
        const data = await readPages()
        if (!data || !isCurrent()) return null
        // complete 仅表示联赛分页结束；各联赛保留接口预览，不按计数补齐全部赛事。
        const incoming = activeGroups(params.SportId, data)
        allSportsState.data = retainPrevious
          ? mergeRefreshGroups(allSportsState.data, incoming)
          : incoming
        allSportsState.complete = true
        allSportsDataScope.value = scope
        allSportsDataContext.value = context
        return data
      } catch (error) {
        if (isCurrent()) {
          allSportsState.error = {
            kind: error instanceof SportsFavouriteCredentialsError ? 'credentials' : 'network',
            message: 'All-league request failed'
          }
        }
        return null
      } finally {
        if (allSportsController === controller) {
          allSportsState.loading = false
          allSportsController = undefined
          allSportsPending = null
        }
      }
    })()
    return allSportsPending
  }

  // 热门名单独立管理，首次与普通查询并行，后续最多每60秒刷新一次。
  const competitionListState = shallowReactive<
    SportsRequestState<GetCompetitionListParams, GetCompetitionListResponse>
  >({ params: null, response: null, data: null, loading: false, error: null })
  let competitionListController: AbortController | undefined
  const competitionListContext = ref('')
  const getCompetitionListContext = () =>
    JSON.stringify([localeStore.currentLanguage, selectedSportId.value, market.value])
  const cancelCompetitionList = () => {
    competitionListController?.abort()
    competitionListController = undefined
    competitionListState.loading = false
  }
  const requestCompetitionList = async () => {
    cancelCompetitionList()
    cancelHotDetails()
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
          applyHotEventList(response, revision)
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
        hotListCheckedAt = Date.now()
      }
    }
  }

  const fetchCompetitionList = (): Promise<GetCompetitionListResponse | null> => {
    if (hotListPending) return hotListPending
    const pending = requestCompetitionList().finally(() => {
      if (hotListPending === pending) hotListPending = null
    })
    hotListPending = pending
    return pending
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
  const publishedHotEvents = ref<{ context: string; ids: number[] }>({ context: '', ids: [] })
  let hotDetailsController: AbortController | undefined
  let hotDetailsPending: Promise<SportEvent[] | null> | null = null
  const missingHotIds = shallowReactive(new Set<number>())
  let hotListCheckedAt = 0
  let hotListPending: Promise<GetCompetitionListResponse | null> | null = null
  let hotRoundPending: Promise<unknown> | null = null
  let hotGeneration = 0
  const cancelHotDetails = () => {
    hotDetailsController?.abort()
    hotDetailsController = undefined
    hotDetailsPending = null
    hotDetailsState.loading = false
  }
  watch(
    getAllSportsContext,
    () => {
      cancelHotDetails()
      missingHotIds.clear()
      hotListCheckedAt = 0
      // 旧详情对象属于旧的共享缓存，快速切回原分类也不能复用已脱离缓存的引用。
      hotDetailsState.data = []
      hotDetailsState.error = null
      hotDetailsContext.value = ''
      publishedHotEvents.value = { context: '', ids: [] }
    },
    { flush: 'sync' }
  )
  const getHotEventIds = () => [
    ...new Set(
      (competitionListState.data?.result ?? [])
        .filter(
          record =>
            record.sportId === selectedSportId.value &&
            Number.isSafeInteger(record.eventId) &&
            record.eventId > 0
        )
        .map(record => record.eventId)
    )
  ]
  const publishHotEvents = () => {
    publishedHotEvents.value = {
      context: getAllSportsContext(),
      ids: getHotEventIds().filter(id => !missingHotIds.has(id))
    }
  }
  const applyHotEventList = (response: GetCompetitionListResponse, revision: number) => {
    const previousIds = getHotEventIds()
    competitionListState.data = response
    competitionListContext.value = getCompetitionListContext()
    const nextIds = new Set(getHotEventIds())
    const membershipChanged =
      previousIds.length !== nextIds.size || previousIds.some(id => !nextIds.has(id))
    if (membershipChanged) {
      // 防止上一轮详情迟到后重新发布已移出热门名单的赛事。
      cancelHotDetails()
      // 名单变化不撤销详情缺失结论；重新加入的 ID 也需有效详情确认后才能恢复。
    }
    // 首次进入、重进和定时刷新共用删除规则，不等待新增赛事的详情。
    if (publishedHotEvents.value.context === getAllSportsContext()) {
      publishedHotEvents.value = {
        context: getAllSportsContext(),
        ids: publishedHotEvents.value.ids.filter(id => nextIds.has(id))
      }
    }
    for (const record of response.result ?? [])
      queueReappearedEvents(record.sportId, [record.eventId], revision)
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
  /** 热门独立补查，只移除热门展示，不能把缺失结果当作普通赛事下架。 */
  const fetchMissingHotEvents = (): Promise<SportEvent[] | null> => {
    if (hotDetailsPending) return hotDetailsPending
    if (
      !homepageActive ||
      !getBaseUrl() ||
      competitionListContext.value !== getCompetitionListContext() ||
      !competitionListState.data
    )
      return Promise.resolve(null)
    const context = getAllSportsContext()
    const sportId = selectedSportId.value
    const controller = new AbortController()
    hotDetailsController = controller
    hotDetailsContext.value = context
    hotDetailsState.loading = true
    hotDetailsState.error = null
    const isCurrent = () =>
      !controller.signal.aborted &&
      homepageActive &&
      context === getAllSportsContext() &&
      hotDetailsController === controller
    const ids = getHotEventIds()
    const pending = Promise.resolve().then(async () => {
      try {
        const stale: number[] = []
        for (const id of ids) {
          const cached = refreshedEvents.get(eventKey(sportId, id))
          if (
            cached &&
            !missingHotIds.has(id) &&
            Date.now() - cached.receivedAt <= EVENT_CHECK_INTERVAL
          ) {
            missingHotIds.delete(id)
          } else stale.push(id)
        }
        for (let offset = 0; offset < stale.length; offset += SELECTED_EVENT_BATCH_SIZE) {
          if (!isCurrent()) return null
          const batch = stale.slice(offset, offset + SELECTED_EVENT_BATCH_SIZE)
          const params: GetSelectedEventInfoParams = {
            SportId: sportId,
            EventIds: batch,
            OddsType: getHomepageOddsType(),
            IsCombo: market.value === 4,
            IncludeGroupEvents: false,
            LanguageCode: languageCode.value,
            PeriodIds: [1]
          }
          try {
            const { response, revision } = await querySelectedEvents(params, controller.signal)
            if (!isCurrent()) return null
            hotDetailsState.response = response
            if (
              !isSportsSuccess(response) ||
              !Array.isArray(response.e) ||
              response.e.some(
                event =>
                  !event || !batch.includes(event.EventId) || !Array.isArray(event.MarketLines)
              )
            ) {
              hotDetailsState.error = {
                kind: 'business',
                code: response.stc,
                message: response.std
              }
              continue
            }
            updateSelectedEvents(sportId, batch, response.e, revision, params)
            const returned = new Set(response.e.map(event => event.EventId))
            for (const id of batch) {
              // 较新的普通列表可能已确认存在，旧缺失响应不能覆盖它。
              const cached = refreshedEvents.get(eventKey(sportId, id))
              if (returned.has(id) || (cached && cached.revision > revision))
                missingHotIds.delete(id)
              else missingHotIds.add(id)
            }
          } catch {
            if (!isCurrent()) return null
            hotDetailsState.error = { kind: 'network', message: 'Selected events request failed' }
          }
        }
        if (!isCurrent()) return null
        hotDetailsState.data = ids
          .filter(id => !missingHotIds.has(id))
          .flatMap(id => {
            const event = getRefreshEvent(sportId, id)
            return event ? [event] : []
          })
        publishHotEvents()
        return hotDetailsState.data
      } finally {
        if (hotDetailsController === controller) {
          hotDetailsState.loading = false
          hotDetailsController = undefined
          hotDetailsPending = null
        }
      }
    })
    hotDetailsPending = pending
    return pending
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
    GetBetInfo: betInfoState
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
    if (publishedHotEvents.value.context !== getAllSportsContext()) return []
    const sportId = selectedSportId.value
    return publishedHotEvents.value.ids.flatMap(id => {
      if (isEventExpired(sportId, id)) return []
      const event =
        allEventsById.value.get(id) ?? hotDetailsById.value.get(id) ?? getRefreshEvent(sportId, id)
      return event ? [withMemberFavourite(event)] : []
    })
  })
  const hotEventsLoading = computed(
    () =>
      (competitionListContext.value === getCompetitionListContext() &&
        competitionListState.loading) ||
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
    // 接口 IsFavourite 仅置顶，不能当作过滤；在明细合并、会员状态覆盖后统一筛选。
    // 仅过滤展示数据，不改原缓存，也不把“没有收藏”当作联赛下架的证据。
    const visible = filterEmptyLeagueGroups(next, !keyword.value.trim()).flatMap(group => {
      if (!isFavourite.value) return [group]
      const sports = group.Sports.filter(event => event.IsFavourite === true)
      if (!sports.length) return []
      return [
        reuseEqual(previousGroups.get(group.CompetitionId) ?? group, {
          ...group,
          Sports: sports,
          competitionCount: sports.length
        })
      ]
    })
    return reuseList(previous ?? [], visible)
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
  const favouriteListNeedsRefresh = computed(
    () => isFavourite.value && matchListError.value?.kind === 'credentials'
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
  const fetchSports = async (overrides: Partial<Omit<GetSportsV2Params, 'MemberCode'>> = {}) => {
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
    const revision = ++eventReadRevision
    const round = normalRound
    const previous = eventsDataContext.value === requestContext ? events.state.data : null
    const response = await events.load(params)
    if (version !== sportsSessionVersion.value) return null
    if (response && events.state.data === response) {
      for (const group of response.e ?? [])
        for (const event of group.Sports) {
          round?.receivedIds.add(event.EventId)
          missingEventRounds.delete(eventKey(params.SportId, event.EventId))
        }
      events.state.data = {
        ...response,
        e: mergeRefreshGroups(
          previous?.e ?? [],
          rememberGroups(params.SportId, response.e ?? [], revision)
        )
      }
      eventsDataContext.value = requestContext
    }
    return response
  }
  const fetchSportEventIndexList = () => indexes.load({ ...commonParams(), Keyword: '' })

  const refreshJobs = new Map<string, { controller: AbortController; pending: Promise<unknown> }>()
  const refreshingEvents = new Map<string, Promise<unknown>>()
  let pendingCacheCleanup: (() => void) | undefined
  let refreshGeneration = 0
  let normalRoundPending: Promise<unknown> | null = null
  let visibleQueue: Promise<unknown> = Promise.resolve()
  let backgroundEventQueue: Promise<unknown> = Promise.resolve()
  const getRefreshContext = () =>
    JSON.stringify([getEventsContext(), getAllSportsQueryContext(), sportsVisitGeneration])
  const cancelHomepageRefresh = () => {
    cancelAllSports()
    for (const id of leagueJobs.keys()) cancelLeague(id)
    events.cancel()
    counts.state.loading = false
    refreshGeneration += 1
    normalRoundPending = null
    for (const job of refreshJobs.values()) job.controller.abort()
    refreshJobs.clear()
    refreshingEvents.clear()
    normalRound = undefined
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
      counts.state.loading = true
      counts.state.error = null
      try {
        const response = await sportsApi.getAllSportCount(
          getBaseUrl(),
          { LanguageCode: languageCode.value, IsCombo: false },
          { signal }
        )
        if (!isCurrent()) return null
        counts.state.response = response
        if (isSportsSuccess(response) && Array.isArray(response.spc)) {
          counts.state.data = reuseEqual(counts.state.data, response)
        } else {
          counts.state.error = { kind: 'business', code: response.stc, message: response.std }
        }
        return response
      } catch {
        if (isCurrent())
          counts.state.error = { kind: 'network', message: 'Sports counts request failed' }
        return null
      } finally {
        if (isCurrent()) counts.state.loading = false
      }
    })

  // 同一查询范围的重叠赛事共享在途请求；取消一个消费者不影响仍在等待的另一条线。
  const selectedRequests = new Map<
    string,
    {
      promise: Promise<GetSelectedEventInfoResponse>
      controller: AbortController
      consumers: Set<symbol>
      revision: number
    }
  >()
  const querySelectedEvents = async (
    params: GetSelectedEventInfoParams,
    signal: AbortSignal
  ): Promise<{ response: GetSelectedEventInfoResponse; revision: number }> => {
    if (signal.aborted) throw new Error('Cancelled selected events request')
    const baseUrl = getBaseUrl()
    const scope = JSON.stringify([
      getBaseUrl(),
      getAllSportsContext(),
      params.SportId,
      params.OddsType,
      params.IsCombo,
      params.LanguageCode,
      params.IncludeGroupEvents,
      params.PeriodIds,
      params.BetTypeIds
    ])
    const keyFor = (id: number) => scope + ':' + id
    const jobs = new Set<NonNullable<ReturnType<typeof selectedRequests.get>>>()
    const missing = params.EventIds.filter(id => {
      const job = selectedRequests.get(keyFor(id))
      if (!job || job.controller.signal.aborted) return true
      jobs.add(job)
      return false
    })
    if (missing.length) {
      const controller = new AbortController()
      const job = {
        controller,
        revision: ++eventReadRevision,
        consumers: new Set<symbol>(),
        promise: Promise.resolve().then(async () => {
          const response = await sportsApi.getSelectedEventInfo(
            baseUrl,
            { ...params, EventIds: missing },
            { signal: controller.signal }
          )
          if (
            isSportsSuccess(response) &&
            (!Array.isArray(response.e) ||
              response.e.some(
                event =>
                  !event || !missing.includes(event.EventId) || !Array.isArray(event.MarketLines)
              ))
          )
            throw new Error('Invalid selected events response')
          return response
        })
      }
      for (const id of missing) selectedRequests.set(keyFor(id), job)
      // 两个分支都清理，避免未观察的 finally 派生拒绝。
      const clean = () => {
        for (const id of missing)
          if (selectedRequests.get(keyFor(id)) === job) selectedRequests.delete(keyFor(id))
      }
      void job.promise.then(clean, clean)
      jobs.add(job)
    }
    const consumer = Symbol()
    const release = () => {
      for (const job of jobs) {
        job.consumers.delete(consumer)
        if (!job.consumers.size) job.controller.abort()
      }
    }
    for (const job of jobs) job.consumers.add(consumer)
    signal.addEventListener('abort', release, { once: true })
    try {
      const responses = await Promise.all([...jobs].map(job => job.promise))
      if (signal.aborted) throw new Error('Cancelled selected events request')
      const invalid = responses.find(
        response => !isSportsSuccess(response) || !Array.isArray(response.e)
      )
      const revision = Math.min(...[...jobs].map(job => job.revision))
      if (invalid) return { response: invalid, revision }
      return {
        revision,
        response: {
          stc: 100,
          std: '',
          e: responses
            .flatMap(response => response.e ?? [])
            .filter(event => params.EventIds.includes(event.EventId))
        }
      }
    } finally {
      signal.removeEventListener('abort', release)
      release()
    }
  }

  const refreshVisibleEvents = (
    targets: readonly SportsRefreshTarget[],
    {
      force = false,
      background = false,
      roundId
    }: {
      force?: boolean
      background?: boolean
      roundId?: number
    } = {}
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
            const { response, revision } = await querySelectedEvents(params, signal)
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
            updateSelectedEvents(sportId, batch, response.e, revision, params, roundId)
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
        const { response, revision } = await querySelectedEvents(params, signal)
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
  /** 一轮普通赛事：V2全部页 → 所需联赛补页 → 未更新ID复核。 */
  const refreshHomepageBackground = () =>
    runHomepageRefresh('background', async (_signal, isCurrent) => {
      const sportId = selectedSportId.value
      const round = { id: ++normalRoundSequence, receivedIds: new Set<number>() }
      normalRound = round
      const oldGroups = keyword.value.trim() ? (events.state.data?.e ?? []) : allSportsState.data
      const oldIds = new Set(oldGroups.flatMap(group => group.Sports.map(event => event.EventId)))
      if (!keyword.value.trim())
        for (const state of leagueDetails.values()) {
          for (const event of state.data) oldIds.add(event.EventId)
        }
      try {
        const response = keyword.value.trim()
          ? await fetchSports()
          : await fetchAllSports({ keepPrevious: true })
        if (!isCurrent()) return null
        // 分页只在V2完整成功后启动；任一补页失败立即停止所有后续联赛。
        if (response && !keyword.value.trim()) {
          await nextTick()
          const ids = [...requestedLeagueIds]
          for (const id of ids) {
            if (!isCurrent()) return null
            const preview = leagueSnapshots.get(id)?.group
            if (!preview || preview.competitionCount <= preview.Sports.length) continue
            if ((await fetchLeagueEvents(id)) === null) break
          }
        }
        if (!isCurrent()) return null
        const checks = new Set([...oldIds].filter(id => !round.receivedIds.has(id)))
        for (const [key, candidate] of reappearedEvents) {
          if (candidate.group && key.startsWith(sportId + ':'))
            checks.add(Number(key.split(':')[1]))
        }
        await refreshVisibleEvents(
          [...checks].map(eventId => ({ sportId, eventId })),
          { force: true, background: true, roundId: round.id }
        )
        if (isCurrent()) {
          // 只有全部 V2 页成功才形成联赛缺失证据；搜索、失败和部分分页不能据此清理。
          const returnedLeagues = Array.isArray(response)
            ? new Set(response.map(group => group.CompetitionId))
            : undefined
          cleanupEmptyLeagues(
            returnedLeagues
              ? new Set(
                  oldGroups
                    .filter(group => !returnedLeagues.has(group.CompetitionId))
                    .map(group => group.CompetitionId)
                )
              : undefined
          )
        }
        return response
      } finally {
        if (normalRound === round) normalRound = undefined
      }
    })

  const refreshHomepageNormal = (): Promise<unknown> => {
    if (normalRoundPending) return normalRoundPending
    const pending = Promise.allSettled([
      refreshHomepageCounts(),
      refreshHomepageBackground()
    ]).finally(() => {
      if (normalRoundPending === pending) normalRoundPending = null
    })
    normalRoundPending = pending
    return pending
  }

  const cancelHomepageHot = () => {
    hotGeneration += 1
    cancelCompetitionList()
    hotListPending = null
    cancelHotDetails()
    hotRoundPending = null
  }
  const refreshHomepageHot = (): Promise<unknown> => {
    if (hotRoundPending) return hotRoundPending
    const context = getAllSportsContext()
    const visit = sportsVisitGeneration
    const generation = hotGeneration
    const pending = Promise.resolve()
      .then(async () => {
        if (!homepageActive || generation !== hotGeneration) return
        if (hotListPending) await hotListPending
        else if (Date.now() - hotListCheckedAt >= 60_000) await fetchCompetitionList()
        if (
          !homepageActive ||
          generation !== hotGeneration ||
          context !== getAllSportsContext() ||
          visit !== sportsVisitGeneration
        )
          return
        await fetchMissingHotEvents()
      })
      .finally(() => {
        if (hotRoundPending === pending) hotRoundPending = null
      })
    hotRoundPending = pending
    return pending
  }

  // 保留每次条件变化的失效记录；同一批更新切走再切回也必须重新接续查询。
  const homepageQueryVersion = ref(0)
  watch(
    getRefreshContext,
    () => {
      cancelHomepageRefresh()
      homepageQueryVersion.value += 1
    },
    { flush: 'sync' }
  )
  watch(
    () =>
      JSON.stringify([getBaseUrl(), languageCode.value, market.value, sportsSessionVersion.value]),
    () => {
      refreshedEvents.clear()
      expiredEvents.clear()
      missingEventRounds.clear()
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

  const getFavouriteActionContext = () =>
    JSON.stringify([
      sportsVisitGeneration,
      sportsAuth.contextVersion,
      selectedSportId.value,
      market.value,
      sortType.value,
      competitionIds.value,
      keyword.value,
      earlyTradingDate.value,
      isFavourite.value
    ])
  const favouriteFilterPending = ref(false)
  let favouriteFilterJob: symbol | null = null
  watch(
    () => sportsAuth.contextVersion,
    () => {
      favouriteFilterJob = null
      favouriteFilterPending.value = false
    },
    { flush: 'sync' }
  )
  const setFavouriteFilter = async (enabled: boolean): Promise<SportsFavouriteResult> => {
    if (!homepageActive || !isLoggedIn.value || favouriteFilterPending.value) return 'stale'
    if (!enabled) {
      isFavourite.value = false
      return 'success'
    }
    const context = getFavouriteActionContext()
    const job = Symbol()
    favouriteFilterJob = job
    favouriteFilterPending.value = true
    try {
      const credentials = await sportsAuth.ensureCredentials()
      if (!homepageActive || context !== getFavouriteActionContext()) return 'stale'
      if (!credentials) return 'login-failed'
      if (!sportsAuth.isCredentialsCurrent(credentials)) return 'stale'
      isFavourite.value = true
      return 'success'
    } finally {
      if (favouriteFilterJob === job) {
        favouriteFilterJob = null
        favouriteFilterPending.value = false
      }
    }
  }
  const isFavouritePending = (eventId: number) => favouriteJobs.has(eventId)
  const favouriteQuery = (competitionId: number): GetSportsV2Params => ({
    ...commonParams(),
    competitionCondType: 2,
    PageNumber: 1,
    PageSize: ALL_SPORTS_PAGE_SIZE,
    SortType: sortType.value,
    CompetitionIds: [competitionId],
    Keyword: '',
    IsFavourite: false,
    earlyTradingDate: null
  })
  let favouriteSync: { key: string; controller: AbortController; pending: Promise<void> } | null =
    null
  let favouriteSyncKey = ''
  const cancelFavouriteSync = () => {
    favouriteSync?.controller.abort()
    favouriteSync = null
    favouriteSyncKey = ''
  }
  // 只校准当前展示赛事的星标，不合并比分、盘口或分页。
  const refreshVisibleFavourites = async (targets: readonly SportsRefreshTarget[]) => {
    if (!homepageActive || !sportsAuth.isReady) return
    const credentials = await sportsAuth.ensureCredentials({ fetchIfMissing: false })
    if (!credentials || !sportsAuth.isCredentialsCurrent(credentials) || !homepageActive) return
    const competitions = new Set<number>()
    const missingEvents: number[] = []
    for (const target of targets) {
      if (target.sportId !== selectedSportId.value || memberFavourites.has(target.eventId)) continue
      if (isEventExpired(target.sportId, target.eventId)) continue
      const event = getRefreshEvent(target.sportId, target.eventId)
      const id = event?.Competition?.CompetitionId
      if (id && Number.isSafeInteger(id)) {
        competitions.add(id)
        missingEvents.push(target.eventId)
      }
    }
    if (!competitions.size) return
    const context = getFavouriteActionContext()
    const key = JSON.stringify([
      context,
      credentials.version,
      [...competitions].sort((a, b) => a - b),
      missingEvents.sort((a, b) => a - b)
    ])
    if (favouriteSync?.key === key) return favouriteSync.pending
    if (favouriteSyncKey === key) return
    cancelFavouriteSync()
    const controller = new AbortController()
    const isCurrent = () =>
      homepageActive &&
      !controller.signal.aborted &&
      context === getFavouriteActionContext() &&
      sportsAuth.isCredentialsCurrent(credentials)
    const pending = Promise.resolve().then(async () => {
      try {
        for (const id of competitions) {
          if (!isCurrent()) return
          const response = await sendHomepageSports(getBaseUrl(), favouriteQuery(id), {
            signal: controller.signal
          })
          if (!isCurrent() || !isSportsSuccess(response) || !Array.isArray(response.e)) return
        }
        // 联赛预览可能只有前五场，遗漏的可见赛事再按球队查询。
        for (const eventId of missingEvents) {
          if (!isCurrent()) return
          if (memberFavourites.has(eventId) || favouriteJobs.has(eventId)) continue
          const event = getRefreshEvent(selectedSportId.value, eventId)
          if (!event?.HomeTeam || !event.Competition?.CompetitionId) continue
          const response = await sendHomepageSports(
            getBaseUrl(),
            {
              ...favouriteQuery(event.Competition.CompetitionId),
              Market: event.Market,
              Keyword: event.HomeTeam
            },
            { signal: controller.signal }
          )
          if (!isCurrent() || !isSportsSuccess(response) || !Array.isArray(response.e)) return
        }
        if (isCurrent()) favouriteSyncKey = key
      } catch {
        // 校准失败保留当前星标，下次独立刷新再查询，不自动重试登录。
      } finally {
        if (favouriteSync?.controller === controller) favouriteSync = null
      }
    })
    favouriteSync = { key, controller, pending }
    return pending
  }
  const getEventFavourite = (eventId: number): boolean | undefined =>
    isLoggedIn.value ? memberFavourites.get(eventId) : false
  const toggleFavouriteTarget = async (
    target: SportsFavouriteTarget,
    canUpdate: () => boolean
  ): Promise<SportsFavouriteResult> => {
    const { sportId, eventId, eventDate, competitionId } = target
    if (!isLoggedIn.value || !canUpdate() || favouriteJobs.has(eventId)) return 'stale'
    if (
      !Number.isSafeInteger(eventId) ||
      eventId <= 0 ||
      !Number.isSafeInteger(competitionId) ||
      competitionId <= 0 ||
      !getBaseUrl() ||
      !/^\d+$/.test(eventDate)
    )
      return 'failed'
    const context = sportsAuth.contextVersion
    const owner = favouriteOwner()
    const baseUrl = getBaseUrl()
    const query: GetSportsV2Params = {
      SportId: sportId,
      Market: target.market,
      LanguageCode: getLanguage(),
      competitionCondType: 2,
      PageNumber: 1,
      PageSize: ALL_SPORTS_PAGE_SIZE,
      SortType: 1,
      CompetitionIds: [competitionId],
      Keyword: target.homeTeam,
      IsFavourite: false,
      earlyTradingDate: null
    }
    const job = Symbol()
    favouriteJobs.set(eventId, job)
    favouriteEventRevisions.set(eventId, ++favouriteRevision)
    const isCurrent = () =>
      canUpdate() &&
      context === sportsAuth.contextVersion &&
      favouriteJobs.get(eventId) === job &&
      !isEventExpired(sportId, eventId)
    // 请求发出后以账号和网关归属校验结果，切换语言或卡片仍可同步服务端确认的状态。
    const canApplyResult = () =>
      owner === favouriteOwner() && baseUrl === getBaseUrl() && favouriteJobs.get(eventId) === job
    try {
      const credentials = await sportsAuth.ensureCredentials()
      if (!isCurrent()) return 'stale'
      if (!credentials) return 'login-failed'
      if (!sportsAuth.isCredentialsCurrent(credentials)) return 'stale'
      // 上次结果未确认时只查状态，不能再次切换收藏。
      if (unconfirmedFavourites.has(eventId)) {
        const response = await sendHomepageSports(baseUrl, query)
        if (!canApplyResult()) return 'stale'
        if (isAuthExpired(response)) return 'auth-expired'
        const confirmed = response.e
          ?.flatMap(group => group.Sports)
          .find(item => item.EventId === eventId)
        if (!isSportsSuccess(response) || typeof confirmed?.IsFavourite !== 'boolean')
          return 'failed'
        memberFavourites.set(eventId, confirmed.IsFavourite)
        unconfirmedFavourites.delete(eventId)
        return 'synced'
      }
      unconfirmedFavourites.add(eventId)
      const response = await sportsApi.favouriteEvent(baseUrl, {
        MemberCode: credentials.memberCode,
        EventId: eventId,
        EventDate: eventDate
      })
      if (!canApplyResult()) return 'stale'
      if (isAuthExpired(response)) {
        unconfirmedFavourites.delete(eventId)
        sportsAuth.clearCredentials(credentials)
        return 'auth-expired'
      }
      if (!isSportsSuccess(response)) {
        unconfirmedFavourites.delete(eventId)
        return 'failed'
      }
      if (response.EventId !== eventId || typeof response.IsFavourite !== 'boolean') return 'failed'
      memberFavourites.set(eventId, response.IsFavourite)
      unconfirmedFavourites.delete(eventId)
      return 'success'
    } catch {
      return isCurrent() ? 'failed' : 'stale'
    } finally {
      if (favouriteJobs.get(eventId) === job) {
        favouriteJobs.delete(eventId)
        favouriteEventRevisions.set(eventId, ++favouriteRevision)
      }
    }
  }

  const toggleFavouriteEvent = (eventId: number): Promise<SportsFavouriteResult> => {
    const sportId = selectedSportId.value
    const event =
      getRefreshEvent(sportId, eventId) ??
      allEventsById.value.get(eventId) ??
      hotDetailsById.value.get(eventId)
    if (!event || isEventExpired(sportId, eventId)) return Promise.resolve('stale')
    const context = getFavouriteActionContext()
    return toggleFavouriteTarget(
      {
        sportId,
        eventId,
        eventDate: event.EventDate,
        competitionId: event.Competition.CompetitionId,
        market: event.Market,
        homeTeam: event.HomeTeam
      },
      () => homepageActive && context === getFavouriteActionContext()
    )
  }

  const cancelRequests = () => {
    homepageActive = false
    cancelFavouriteSync()
    favouriteFilterJob = null
    favouriteFilterPending.value = false
    cancelBetInfo()
    cancelHomepageRefresh()
    cancelHomepageHot()
    invalidateSportsVisit()
    homepageGeneration += 1
    resources.forEach(resource => resource.cancel())
    cancelAllSports()
    cancelHotDetails()
    cancelLeagueRequests()
    cancelCompetitionList()
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
    if (publishedHotEvents.value.context === getAllSportsContext())
      for (const id of publishedHotEvents.value.ids) retained.add(eventKey(sportId, id))
    for (const key of refreshedEvents.keys()) if (!retained.has(key)) refreshedEvents.delete(key)
  }
  const reset = () => {
    cancelRequests()
    favouriteResetRevision = ++favouriteRevision
    favouriteEventRevisions.clear()
    memberFavourites.clear()
    unconfirmedFavourites.clear()
    sportsSessionVersion.value += 1
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
    missingHotIds.clear()
    loadedHomepageContext = ''
    leagueDetails.clear()
    eventsDataContext.value = ''
    eventsRequestContext.value = ''
    homepageError.value = null
  }

  /** 首次进入与条件变化共用普通轮次；热门名单并行取得，详情等普通首轮结束。 */
  const loadHomepage = async ({
    refreshCompetitionList = false
  }: { refreshCounts?: boolean; refreshCompetitionList?: boolean } = {}) => {
    homepageActive = true
    const generation = ++homepageGeneration
    cancelHomepageRefresh()
    homepageLoading.value = true
    homepageError.value = null
    try {
      await siteConfigStore.initSiteConfig()
      if (generation !== homepageGeneration) return
      if (!getBaseUrl()) {
        homepageError.value = { kind: 'config', message: 'Missing IM.im_app_url' }
        return
      }
      const context = getEventsContext()
      if (loadedHomepageContext !== context) {
        loadedHomepageContext = context
        events.reset()
        eventsDataContext.value = ''
      }
      // 联赛候选缓存按实际列表请求范围隔离，不随本地联赛选择或搜索条件清空。
      // 选中联赛直接筛选已有数据，仍由普通轮次按需串行补齐详情。
      if (allSportsDataContext.value !== getAllSportsQueryContext()) {
        allSportsState.data = []
        allSportsState.complete = false
        allSportsState.error = null
        allSportsDataContext.value = ''
        leagueDetails.clear()
        missingEventRounds.clear()
      }
      if (refreshCompetitionList) void fetchCompetitionList()
      await refreshHomepageNormal()
    } catch {
      if (generation === homepageGeneration)
        homepageError.value = { kind: 'network', message: 'Sports initialization failed' }
    } finally {
      if (generation === homepageGeneration) homepageLoading.value = false
    }
  }
  let loadedHomepageContext = ''

  const retryHomepage = () => runSportsRetry('homepage', () => loadHomepage())
  const retryHotEvents = () =>
    runSportsRetry('hot', async () => {
      await fetchCompetitionList()
      await fetchMissingHotEvents()
    })
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
    sportsBalance,
    sportsBalanceLoading,
    sportsBalanceError,
    fetchSportsBalance,
    beginSportsBalanceUpdate,
    scheduleSportsBalanceRefresh,
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
    favouriteListNeedsRefresh,
    homepageQueryVersion,
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
    refreshHomepageNormal,
    refreshVisibleEvents,
    confirmBetSelection,
    refreshHomepageBackground,
    refreshHomepageHot,
    cancelHomepageHot,
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
    placeBet,
    toggleFavouriteEvent,
    toggleFavouriteTarget,
    getEventFavourite,
    querySportsList: sendHomepageSports,
    isFavouritePending,
    favouriteFilterPending,
    setFavouriteFilter,
    refreshVisibleFavourites,
    loadHomepage,
    retryHomepage,
    retryHotEvents,
    retryingSports,
    cancelRequests,
    reset
  }
})
