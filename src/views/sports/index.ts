import { computed, onActivated, onDeactivated, onMounted, onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'
import type { SportsRefreshTarget } from '@/stores/sports'
import { getCurrencySymbol, getFormattedBalance, stripLocalePrefix } from '@/utils/locale'
import { formatTimestamp } from '@/utils/date'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import type { SportCompetitionGroup, SportMarketLine } from '@/api/interface/sport'
import type { OddsSelectPayload, OddsTrend } from './components/match-odds/types'
import type { CollectOnlyPayload, FilterTabChangePayload } from './components/filter_search'
import type {
  LeagueFilterPayload,
  LeagueSelectionPayload,
  LiansaiFilterPayload
} from './components/liansai_tabs'
import { sportItems } from './components/sports-navigation/sport-items'
import { createHomepageRefresh } from './composables/refreshScheduler'

export type SportsBetMode = 'single' | 'parlay'
export type SportsMatch = {
  id: string
  EventId: number
  sportId: number
  sportKey: string
  leagueId: string
  country?: string
  league: string
  kickoff: string
  homeScore: string
  awayScore: string
  cornerScore?: string
  halfTimeScore?: string
  periodScores?: string[]
  totalScore?: string
  home: { name: string; badge: string; redCards?: string; yellowCards?: string }
  away: { name: string; badge: string; redCards?: string; yellowCards?: string }
  live: boolean
  phase: string
  hasVideo: boolean
  hasAnimation: boolean
  totalMarkets?: number
  /** 赛事自身的收藏状态，独立于列表的收藏置顶查询条件。 */
  IsFavourite: boolean
  HomeTeam: string
  AwayTeam: string
  HomeScore: string
  AwayScore: string
  HomeTeamId: number
  AwayTeamId: number
  MarketLines: SportMarketLine[]
}
export type SportsBetSelection = {
  id: string
  matchId: string
  selection: string
  market: string
  marketTitle: string
  fixture: string
  homeTeam: string
  awayTeam: string
  league: string
  odds: number
  stake: string
  trend?: OddsTrend
  live?: boolean
  mockBetStatus?: 'open' | 'closed' | 'fail'
}
export type SportsParlay = {
  id: string
  size: number
  combinationCount: number
  odds: number
  stake: string
}

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
}
type NoticeKey =
  | ''
  | 'needTwoSelections'
  | 'selectionLimit'
  | 'submitted'
  | 'balanceRefreshed'
  | 'notImplemented'
  | 'currencyChanged'
const MOCK_BALANCE = 1000
const MAX_SELECTIONS = 8
const MATCH_PAGE_SIZE = 12
const NOTICE_MESSAGES: Record<Exclude<NoticeKey, ''>, string> = {
  needTwoSelections: 'Add selections from at least two different matches to place a parlay.',
  selectionLimit: 'You can select up to eight different matches.',
  submitted: 'Local simulation complete. No real bet was placed and no balance was deducted.',
  balanceRefreshed: 'Mock balance refreshed. No real account was requested.',
  notImplemented: 'The design for this dialog is not available yet.',
  currencyChanged: 'Display currency changed. Mock bets have been reset.'
}

/** 配置已包含队标目录，仅追加球队图片文件名；配置或球队 ID 为空时返回空字符串。 */
export const getTeamLogoUrl = (id: string | number | null | undefined): string => {
  if (typeof id === 'number' && !Number.isFinite(id)) return ''

  const teamId = String(id ?? '').trim()
  if (!teamId) return ''

  const siteConfigStore = useSiteConfigStore()
  const baseUrl = siteConfigStore.getConfigString('IM.sport_team_logo').replace(/\/+$/, '')
  if (!baseUrl) return ''

  return `${baseUrl}/${encodeURIComponent(teamId)}.png`
}

const getSportsText = (value: unknown): string =>
  typeof value === 'string'
    ? value.trim()
    : typeof value === 'number' && Number.isFinite(value)
      ? String(value)
      : ''

const getCardCount = (value: unknown): string | undefined => {
  const text = getSportsText(value)
  return /^\d+$/.test(text) ? text : undefined
}

/** 将本次返回的联赛赛事转换为两端共用的基础展示信息；不推定扩展比分与赔率规则。 */
export const mapSportsMatches = (
  groups: readonly SportCompetitionGroup[],
  sportId: number,
  teamLogoUrl: (id: number) => string,
  formatKickoff: (value: string) => string = formatTimestamp
): SportsMatch[] => {
  const sportKey = sportItems.find(item => item.sportId === sportId)?.key ?? ''
  const matches = new Map<string, SportsMatch>()
  for (const group of groups) {
    if (!group || !Array.isArray(group.Sports)) continue
    for (const event of group.Sports) {
      if (!event || !Number.isSafeInteger(event.EventId) || event.EventId <= 0) continue
      const id = `${sportId}:${event.EventId}`
      if (matches.has(id)) continue
      const competitionId = event.Competition?.CompetitionId ?? group.CompetitionId
      if (!Number.isSafeInteger(competitionId)) continue
      matches.set(id, {
        id,
        EventId: event.EventId,
        sportId,
        sportKey,
        leagueId: `${sportId}:${competitionId}`,
        league:
          getSportsText(event.Competition?.CompetitionName) || getSportsText(group.CompetitionName),
        kickoff: formatKickoff(event.EventDate),
        // IsLive 仅表示支持滚球，赛事当前是否滚球以 Market 为准。
        live: event.Market === 3,
        phase: getSportsText(event.RBTime),
        homeScore: getSportsText(event.HomeScore) || '—',
        awayScore: getSportsText(event.AwayScore) || '—',
        home: {
          name: getSportsText(event.HomeTeam),
          badge: event.HomeTeamId > 0 ? teamLogoUrl(event.HomeTeamId) : '',
          redCards: getCardCount(event.HomeRedCard)
        },
        away: {
          name: getSportsText(event.AwayTeam),
          badge: event.AwayTeamId > 0 ? teamLogoUrl(event.AwayTeamId) : '',
          redCards: getCardCount(event.AwayRedCard)
        },
        hasVideo: event.LiveStreaming === 1,
        hasAnimation: event.HasVisualization === true,
        totalMarkets:
          Number.isInteger(event.TotalMarketLineCount) && event.TotalMarketLineCount >= 0
            ? event.TotalMarketLineCount
            : undefined,
        IsFavourite: event.IsFavourite === true,
        HomeTeam: event.HomeTeam,
        AwayTeam: event.AwayTeam,
        HomeScore: getSportsText(event.HomeScore),
        AwayScore: getSportsText(event.AwayScore),
        HomeTeamId: event.HomeTeamId,
        AwayTeamId: event.AwayTeamId,
        MarketLines: Array.isArray(event.MarketLines) ? event.MarketLines : []
      })
    }
  }
  return [...matches.values()]
}

/** 空输入按 0 处理，拒绝负数、指数和超过两位的小数。 */
export const parseSportsStake = (raw: string): number | null => {
  const value = raw.trim()
  if (!value) return 0
  if (!/^\d{1,7}(?:\.\d{0,2})?$/.test(value)) return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

const moneyRound = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

/** 本地串关组合计算，不代表服务端的真实结算规则。 */
export const getSportsCombinations = (odds: readonly number[], size: number): number[] => {
  if (!Number.isInteger(size) || size < 2 || size > odds.length || odds.length > MAX_SELECTIONS)
    return []
  const products: number[] = []
  const visit = (start: number, remaining: number, product: number) => {
    if (remaining === 0) {
      products.push(product)
      return
    }
    for (let index = start; index <= odds.length - remaining; index += 1) {
      const odd = odds[index]
      if (!Number.isFinite(odd) || odd <= 1) continue
      visit(index + 1, remaining - 1, product * odd)
    }
  }
  visit(0, size, 1)
  return products
}

export const useSportsPage = () => {
  const route = useRoute()
  const isHomepageRoute = computed(() => stripLocalePrefix(route.path) === '/sports')
  const isMobile = useIsMobile()
  const { requireLogin } = useRequireLoginAction()
  const { currentCurrencyCode } = useDisplayCurrency()
  const sportsStore = useSportsStore()
  const siteConfigStore = useSiteConfigStore()
  const localeStore = useLocaleStore()
  const { t } = useI18n()
  const {
    sportCounts,
    sportCountsLoading,
    sportCountsError,
    selectedSportId,
    selectedFilterKey,
    market,
    sortType,
    isFavourite: collectOnly,
    competitionIds,
    keyword,
    earlyTradingDate,
    homepageLoading,
    homepageError: initializationError,
    matchListContext: storeMatchListContext,
    matchListLoading: matchesLoading,
    matchListError: matchesError,
    eventsList,
    hotEvents,
    hotEventsLoading,
    hotEventsError,
    sportsSessionVersion,
    retryingSports,
    pageNumber
  } = storeToRefs(sportsStore)
  // 页面球种与导航共用 Store 的业务 ID，不另存一份默认足球状态。
  const selectedSportKey = computed(
    () => sportItems.find(item => item.sportId === selectedSportId.value)?.key ?? ''
  )
  const selectedSportIcon = computed(
    () => sportItems.find(item => item.sportId === selectedSportId.value)?.icon
  )
  const selectedSportLabel = computed(
    () => sportCounts.value.find(item => item.sid === selectedSportId.value)?.sn ?? ''
  )
  let sportsPageDisposed = false
  let stopSportsRefresh: (() => void) | undefined
  const sportsPageActive = ref(true)
  const initializing = ref(true)
  const searchInput = ref(keyword.value)
  let searchTimer: ReturnType<typeof setTimeout> | undefined
  const handleSearchChange = (value: string) => {
    searchInput.value = value
    clearTimeout(searchTimer)
    // 输入搜索词立即暂停普通联赛补查，接口搜索等待防抖结束后发起。
    if (value.trim()) sportsStore.syncLeagueRequests([])
    const commit = () => {
      if (!sportsPageDisposed && sportsPageActive.value) keyword.value = value.trim()
    }
    if (!value.trim()) commit()
    else searchTimer = setTimeout(commit, 300)
  }
  watch(keyword, value => {
    if (searchInput.value.trim() !== value) {
      clearTimeout(searchTimer)
      searchInput.value = value
    }
  })
  const expandedLeagueIds = ref<number[]>([])
  // H5 可多选，PC 只有单选；切回 PC 时与组件的“全部联赛”高亮保持一致。
  watch(
    [isMobile, () => competitionIds.value.length],
    () => {
      if (!isMobile.value && competitionIds.value.length > 1) competitionIds.value = []
    },
    { immediate: true, flush: 'sync' }
  )
  const syncExpandedLeagues = (ids: number[]) => {
    expandedLeagueIds.value = ids
  }
  const getLeagueLoadState = (id: number) => sportsStore.getLeagueLoadState(id)
  const retryLeague = (id: number) => sportsStore.retryLeague(id)
  const leagueCounts = computed(
    () =>
      new Map(
        eventsList.value.map(group => [
          `${selectedSportId.value}:${group.CompetitionId}`,
          group.competitionCount
        ])
      )
  )
  // PC 单选即加载；H5 只接收已渲染且展开的组，两个入口共用同一个调度器。
  watch(
    [
      initializing,
      sportsPageActive,
      isMobile,
      () => searchInput.value.trim(),
      keyword,
      () => competitionIds.value.join(','),
      () => expandedLeagueIds.value.join(','),
      selectedSportId,
      market,
      sortType,
      () => siteConfigStore.getConfigString('IM.im_app_url'),
      () => localeStore.currentLanguage,
      sportsSessionVersion
    ],
    () => {
      const ids =
        !initializing.value &&
        sportsPageActive.value &&
        !searchInput.value.trim() &&
        !keyword.value.trim()
          ? isMobile.value
            ? expandedLeagueIds.value
            : competitionIds.value
          : []
      sportsStore.syncLeagueRequests(ids)
    },
    { immediate: true, flush: 'post' }
  )
  const sportsPageLoading = computed(
    () =>
      initializing.value ||
      retryingSports.value ||
      ((homepageLoading.value || matchesLoading.value) && !eventsList.value.length)
  )
  const homepageError = computed(
    () => initializationError.value ?? (!eventsList.value.length ? matchesError.value : null)
  )
  const sportsLoadFailedText = computed(() => t('sports.loadFailed'))
  const sportsRetryText = computed(() => t('sports.retry'))
  const sportsEmptyText = computed(() => t('sports.noEvents'))
  const sportsLoadingText = computed(() => t('sports.loadingEvents'))
  // PC 对当前数据源本地分页；默认数据由 Store 按联赛页逐步累积。
  const currentPage = ref(1)
  const expandedMatchId = ref<string | null>(null)
  const betSlipOpen = ref(false)
  const mode = ref<SportsBetMode>('single')
  const outcomes = ref<SelectedOutcome[]>([])
  const visibleBySource = ref<Record<'pc' | 'h5', SportsRefreshTarget[]>>({ pc: [], h5: [] })
  const visibleMatchTargets = computed(() => visibleBySource.value[isMobile.value ? 'h5' : 'pc'])
  const setVisibleMatches = (source: 'pc' | 'h5', targets: readonly SportsRefreshTarget[]) => {
    const unique = new Map<string, SportsRefreshTarget>()
    for (const target of targets) {
      if (!Number.isSafeInteger(target.sportId) || !Number.isSafeInteger(target.eventId)) continue
      if (target.sportId <= 0 || target.eventId <= 0) continue
      unique.set(`${target.sportId}:${target.eventId}`, { ...target })
    }
    visibleBySource.value[source] = [...unique.values()]
  }
  const refreshTargets = computed(() => {
    const targets = new Map<string, SportsRefreshTarget>()
    const expanded = expandedMatchId.value
      ?.replace(/^live:/, '')
      .split(':')
      .map(Number)
    for (const target of [
      ...visibleMatchTargets.value,
      ...outcomes.value.map(({ sportId, eventId }) => ({ sportId, eventId })),
      ...(expanded?.length === 2 && expanded.every(id => Number.isSafeInteger(id) && id > 0)
        ? [{ sportId: expanded[0], eventId: expanded[1] }]
        : [])
    ]) {
      targets.set(`${target.sportId}:${target.eventId}`, target)
    }
    return [...targets.values()]
  })
  const homepageRefresh = createHomepageRefresh({
    visible: () => sportsStore.refreshVisibleEvents(refreshTargets.value),
    counts: () => sportsStore.refreshHomepageCounts(),
    background: () => sportsStore.refreshHomepageBackground(),
    cancel: () => sportsStore.cancelHomepageRefresh()
  })
  let homepageReady = false
  let homepageLoadVersion = 0
  const resumeHomepageRefresh = (immediate = false) => {
    if (
      homepageReady &&
      isHomepageRoute.value &&
      sportsPageActive.value &&
      !sportsPageDisposed &&
      !document.hidden
    ) {
      homepageRefresh.start(immediate)
    }
  }
  const handlePageVisibility = () => {
    if (document.hidden || !isHomepageRoute.value) homepageRefresh.stop()
    else resumeHomepageRefresh(true)
  }
  watch(isHomepageRoute, handlePageVisibility)
  watch(
    () =>
      refreshTargets.value
        .map(target => `${target.sportId}:${target.eventId}`)
        .sort()
        .join(','),
    () => homepageRefresh.targetsChanged()
  )
  const parlayStakes = ref<Record<string, string>>({})
  const focusedStakeId = ref('')
  const noticeKey = ref<NoticeKey>('')
  const refreshing = ref(false)
  const matchListContext = computed(() =>
    JSON.stringify([storeMatchListContext.value, collectOnly.value])
  )
  let refreshTimer: ReturnType<typeof setTimeout> | undefined

  const matches = computed(() =>
    mapSportsMatches(eventsList.value, selectedSportId.value, getTeamLogoUrl)
  )
  // 热门名单决定顺序，联赛预览和按 ID 补查提供信息与主盘口，不限制必须是滚球。
  const liveMatches = computed(() => {
    const currentMatches = new Map(matches.value.map(match => [match.id, match]))
    return mapSportsMatches(
      hotEvents.value.map(event => ({
        ...event.Competition,
        competitionCount: 1,
        Sports: [event]
      })),
      selectedSportId.value,
      getTeamLogoUrl
    ).map(match => currentMatches.get(match.id) ?? match)
  })
  // 热门独有赛事也可被盘口选择和本地投注单找到，不混入下方列表的筛选和分页。
  const matchById = computed(
    () => new Map([...liveMatches.value, ...matches.value].map(match => [match.id, match]))
  )
  const totalPages = computed(() => Math.max(1, Math.ceil(matches.value.length / MATCH_PAGE_SIZE)))
  const pagedMatches = computed(() =>
    matches.value.slice(
      (currentPage.value - 1) * MATCH_PAGE_SIZE,
      currentPage.value * MATCH_PAGE_SIZE
    )
  )
  watch(totalPages, pages => {
    if (currentPage.value > pages) currentPage.value = pages
  })
  // 换页只更新赛事窗口并关闭展开层，投注选择和金额继续保留。
  const setPage = (page: number) => {
    if (!Number.isFinite(page) || !Number.isInteger(page)) return
    const nextPage = Math.min(Math.max(1, page), totalPages.value)
    if (nextPage === currentPage.value) return
    currentPage.value = nextPage
    expandedMatchId.value = null
  }

  // 页面与投注单共用原盘口数组，不改造成展示 DTO。
  const getMatchMarkets = (matchId: string): SportMarketLine[] => {
    const match = matchById.value.get(matchId)
    return match?.MarketLines ?? []
  }
  const getLiveMarkets = getMatchMarkets
  const getSelectedWagerSelectionId = (matchId: string) =>
    outcomes.value.find(outcome => outcome.matchId === matchId)?.WagerSelectionId
  const getOutcomeSnapshot = (outcome: SelectedOutcome): SportsBetSelection => {
    const event = sportsStore.getRefreshEvent(outcome.sportId, outcome.eventId)
    const refreshedMatch = event
      ? mapSportsMatches(
          [{ ...event.Competition, competitionCount: 1, Sports: [event] }],
          outcome.sportId,
          getTeamLogoUrl
        )[0]
      : undefined
    const match = refreshedMatch ?? matchById.value.get(outcome.matchId)
    const line = match?.MarketLines.find(item => item.MarketlineId === outcome.MarketlineId)
    const selection = line?.WagerSelections.find(
      item => item.WagerSelectionId === outcome.WagerSelectionId
    )
    if (!match || !line || !selection) return outcome.snapshot
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
      live: match.live,
      mockBetStatus:
        event?.EventStatusId === 2 || line.MarketlineStatusId === 2 || line.IsLocked === true
          ? 'closed'
          : line.MarketlineStatusId === 1 && line.IsLocked === false
            ? 'open'
            : outcome.snapshot.mockBetStatus
    }
  }
  // 列表切换不删除投注项；新数据只更新展示信息，金额保留。
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
  const selections = computed<SportsBetSelection[]>(() =>
    outcomes.value.map(outcome => ({ ...outcome.snapshot, stake: outcome.stake }))
  )
  const parlays = computed<SportsParlay[]>(() => {
    const odds = outcomes.value.map(item => item.odds)
    return Array.from({ length: Math.max(0, odds.length - 1) }, (_, index) => {
      const size = index + 2
      const products = getSportsCombinations(odds, size)
      return {
        id: `parlay-${size}`,
        size,
        combinationCount: products.length,
        odds: products.length ? products.reduce((sum, odd) => sum + odd, 0) / products.length : 0,
        stake: parlayStakes.value[`parlay-${size}`] ?? ''
      }
    })
  })
  const activeRows = computed(() =>
    mode.value === 'single'
      ? selections.value.map(item => ({ ...item, combinationCount: 1 }))
      : parlays.value
  )
  const invalidStake = computed(() =>
    activeRows.value.some(item => parseSportsStake(item.stake) === null)
  )
  const totalStake = computed(() =>
    moneyRound(
      activeRows.value.reduce(
        (sum, item) => sum + (parseSportsStake(item.stake) ?? 0) * item.combinationCount,
        0
      )
    )
  )
  const potentialReturn = computed(() =>
    moneyRound(
      activeRows.value.reduce(
        (sum, item) =>
          sum + (parseSportsStake(item.stake) ?? 0) * item.odds * item.combinationCount,
        0
      )
    )
  )
  const canSubmit = computed(
    () => !invalidStake.value && totalStake.value > 0 && totalStake.value <= MOCK_BALANCE
  )
  const currencySymbol = computed(() => getCurrencySymbol(currentCurrencyCode.value))
  const formatMoney = (value: number) => getFormattedBalance(value, currentCurrencyCode.value, 2)
  const balanceText = computed(() => formatMoney(MOCK_BALANCE))
  const totalStakeText = computed(() => formatMoney(totalStake.value))
  const potentialReturnText = computed(() => formatMoney(potentialReturn.value))
  const notice = computed(() => {
    if (invalidStake.value)
      return 'Enter a valid non-negative amount with up to two decimal places.'
    if (totalStake.value > MOCK_BALANCE) return 'Total stake exceeds the mock balance.'
    return noticeKey.value ? NOTICE_MESSAGES[noticeKey.value] : ''
  })

  const isMatchFavoritePending = (id: string) => {
    const match = matchById.value.get(id)
    return match ? sportsStore.isFavouritePending(match.EventId) : false
  }
  // 收藏状态由 Store 在接口成功后同步，页面只处理登录拦截和失败反馈。
  const handleMatchFavorite = async (id: string) => {
    if (!requireLogin() || sportsPageDisposed || !sportsPageActive.value) return
    const match = matchById.value.get(id)
    if (!match || sportsStore.isFavouritePending(match.EventId)) return
    const result = await sportsStore.toggleFavouriteEvent(match.EventId)
    if (sportsPageDisposed || !sportsPageActive.value) return
    if (result === 'login-failed' || result === 'failed' || result === 'auth-expired') {
      globalShowToast({
        type: 'fail',
        message: t(
          result === 'login-failed' ? 'sports.platformLoginFailed' : 'sports.favouriteFailed'
        )
      })
    }
  }
  const setMatchExpanded = (matchId: string, expanded: boolean) => {
    const sourceId = matchId.startsWith('live:') ? matchId.slice(5) : matchId
    if (!matches.value.some(match => match.id === sourceId)) return
    if (expanded) expandedMatchId.value = matchId
    else if (expandedMatchId.value === matchId) expandedMatchId.value = null
  }
  const clearBets = () => {
    clearTimeout(refreshTimer)
    refreshing.value = false
    outcomes.value = []
    parlayStakes.value = {}
    focusedStakeId.value = ''
    mode.value = 'single'
    noticeKey.value = ''
  }
  const setMode = (value: SportsBetMode, allowIncomplete = false) => {
    if (value === 'parlay' && outcomes.value.length < 2 && !allowIncomplete) {
      noticeKey.value = 'needTwoSelections'
      return
    }
    mode.value = value
    focusedStakeId.value =
      value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
    noticeKey.value = ''
  }
  const removeSelection = (id: string) => {
    outcomes.value = outcomes.value.filter(item => item.id !== id)
    parlayStakes.value = {}
    if (outcomes.value.length < 2) mode.value = 'single'
    focusedStakeId.value =
      mode.value === 'single' ? (outcomes.value[0]?.id ?? '') : (parlays.value[0]?.id ?? '')
    noticeKey.value = ''
  }
  // 严格消费盘口组件回传的原始盘口/选项；同赛事只保留一个选项，不触发真实下注。
  const selectOdds = (matchId: string, payload: OddsSelectPayload) => {
    const match = matchById.value.get(matchId)
    const line = getMatchMarkets(matchId).find(
      item => item.MarketlineId === payload.market.MarketlineId
    )
    const selection = line?.WagerSelections.find(
      item => item.WagerSelectionId === payload.option.WagerSelectionId
    )
    if (!match || !line || !selection) return
    const odds = Number(selection.Odds)
    if (!Number.isFinite(odds)) return
    const id = `${matchId}:${line.MarketlineId}:${selection.WagerSelectionId}`
    const previous = outcomes.value.find(item => item.matchId === matchId)
    if (previous?.id === id) {
      removeSelection(id)
      return
    }
    if (!previous && outcomes.value.length >= MAX_SELECTIONS) {
      noticeKey.value = 'selectionLimit'
      betSlipOpen.value = true
      return
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
      snapshot
    }
    outcomes.value = previous
      ? outcomes.value.map(item => (item.matchId === matchId ? next : item))
      : [...outcomes.value, next]
    parlayStakes.value = {}
    focusedStakeId.value = mode.value === 'single' ? id : 'parlay-2'
    betSlipOpen.value = true
    noticeKey.value = ''
  }
  const updateStake = (id: string, value: string) => {
    outcomes.value = outcomes.value.map(item => (item.id === id ? { ...item, stake: value } : item))
    noticeKey.value = ''
  }
  const updateParlayStake = (id: string, value: string) => {
    if (!parlays.value.some(item => item.id === id)) return
    parlayStakes.value = { ...parlayStakes.value, [id]: value }
    noticeKey.value = ''
  }
  const focusStake = (id: string, kind: SportsBetMode) => {
    if (kind === mode.value && activeRows.value.some(row => row.id === id))
      focusedStakeId.value = id
  }
  const maxStake = (id: string, kind: SportsBetMode) => {
    if (kind !== mode.value) return
    const row = activeRows.value.find(item => item.id === id)
    if (!row) return
    const otherStake = activeRows.value.reduce(
      (sum, item) =>
        item.id === id ? sum : sum + (parseSportsStake(item.stake) ?? 0) * item.combinationCount,
      0
    )
    const availableCents = Math.max(0, Math.round((MOCK_BALANCE - otherStake) * 100))
    const value = (Math.floor(availableCents / row.combinationCount) / 100).toFixed(2)
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
  const submitMockBet = () => {
    if (!canSubmit.value) return
    // 本地提交仅清理选择，不扣余额、不创建订单、不请求下注接口。
    clearBets()
    noticeKey.value = 'submitted'
  }
  const refreshBalance = () => {
    if (refreshing.value) return
    refreshing.value = true
    noticeKey.value = ''
    refreshTimer = setTimeout(() => {
      refreshing.value = false
      if (!noticeKey.value) noticeKey.value = 'balanceRefreshed'
    }, 400)
  }
  const showUnsupported = () => {
    noticeKey.value = 'notImplemented'
  }
  // H5 悬浮入口统一处理：投注单打开弹窗，投注历史进入独立页面。
  const handleFloatingEntry = (entry: 'history' | 'bet-slip') => {
    if (entry === 'bet-slip') {
      betSlipOpen.value = true
      return
    }
    navigateTo('/sports/bet-history')
  }
  // 先同步筛选与分页，再由下方单一请求监听批量刷新。
  const resetMatchListState = () => {
    currentPage.value = 1
    pageNumber.value = 1
    expandedMatchId.value = null
  }
  // 组件已写入 Store 时不重复赋值；保留统一业务入口供两端调用。
  const handleSportChange = (_index: number, key: string) => {
    const sport = sportItems.find(item => item.key === key)
    if (sport && selectedSportId.value !== sport.sportId) {
      selectedSportId.value = sport.sportId
    }
  }
  const handleMatchFilterChange = (payload: FilterTabChangePayload) => {
    if (selectedFilterKey.value !== payload.key) selectedFilterKey.value = payload.key
  }
  const handleLeagueSortChange = (payload: LiansaiFilterPayload) => {
    if (sortType.value !== payload.sortType) sortType.value = payload.sortType
  }
  // 全部联赛统一使用空数组；避免 H5 全选的全部 ID 覆盖组件已归一化的值。
  const syncCompetitionIds = (ids: number[], isAllSelected: boolean) => {
    const nextIds = isAllSelected ? [] : ids
    if (
      nextIds.length === competitionIds.value.length &&
      nextIds.every((id, index) => id === competitionIds.value[index])
    ) {
      return
    }
    competitionIds.value = [...nextIds]
  }
  const handleLeagueChange = (payload: LeagueSelectionPayload) => {
    syncCompetitionIds(payload.ids, payload.isAllSelected)
  }
  const handleLeagueFilter = (payload: LeagueFilterPayload) => {
    syncCompetitionIds(payload.ids, payload.isAllSelected)
  }
  // 沿用组件的 collectOnly 事件字段，统一写入 Store 收藏置顶状态，不发起收藏写操作。
  const handleCollectChange = (payload: CollectOnlyPayload) => {
    collectOnly.value = payload.collectOnly
  }
  // 候选范围变化时清理旧联赛，兼容组件先写 Store 再 emit，以及其他入口直接更新 Store。
  watch(
    [
      selectedSportId,
      market,
      () => siteConfigStore.getConfigString('IM.im_app_url'),
      () => localeStore.currentLanguage,
      keyword
    ],
    () => {
      if (competitionIds.value.length) competitionIds.value = []
      resetMatchListState()
    },
    { flush: 'sync' }
  )
  watch([sortType, () => competitionIds.value.join(','), collectOnly], resetMatchListState, {
    flush: 'sync'
  })
  const retrySports = () => {
    if (!sportsPageDisposed && sportsPageActive.value && !sportsPageLoading.value) {
      homepageRefresh.stop()
      homepageReady = false
      const version = ++homepageLoadVersion
      void sportsStore.retryHomepage().finally(() => {
        if (version !== homepageLoadVersion) return
        homepageReady = true
        resumeHomepageRefresh()
      })
    }
  }
  const retryHotEvents = () => {
    if (!sportsPageDisposed && sportsPageActive.value && !hotEventsLoading.value) {
      void sportsStore.retryHotEvents()
    }
  }
  const closeOnOutside = (event: PointerEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (
      target.closest('[data-sports-match]')?.getAttribute('data-sports-match') !==
      expandedMatchId.value
    ) {
      expandedMatchId.value = null
    }
  }
  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    if (expandedMatchId.value) expandedMatchId.value = null
    else betSlipOpen.value = false
  }
  watch(currentCurrencyCode, () => {
    clearBets()
    noticeKey.value = 'currencyChanged'
  })
  onMounted(() => {
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('visibilitychange', handlePageVisibility)
  })
  onMounted(async () => {
    // 全局配置就绪后再订阅，避免初次加载因域名变化重复请求。
    try {
      await siteConfigStore.initSiteConfig()
    } catch {
      // 交由统一流程重试初始化并向页面提供失败状态。
    }
    if (sportsPageDisposed) return
    stopSportsRefresh = watch(
      [
        sportsPageActive,
        () => siteConfigStore.getConfigString('IM.im_app_url'),
        () => localeStore.currentLanguage,
        selectedSportId,
        market,
        sortType,
        () => competitionIds.value.join(','),
        keyword,
        () => (keyword.value.trim() && market.value === 1 ? earlyTradingDate.value : null),
        collectOnly,
        sportsSessionVersion
      ],
      (values, previous) => {
        if (!sportsPageActive.value || sportsPageDisposed) return
        homepageRefresh.stop()
        homepageReady = false
        const version = ++homepageLoadVersion
        const refreshCounts =
          previous[0] !== true || values[1] !== previous[1] || values[2] !== previous[2]
        if (refreshCounts) resetMatchListState()
        // 热门随进入页面、语言、球种或分类变化刷新；先等待数量接口成功。
        const refreshCompetitionList =
          refreshCounts || values[3] !== previous[3] || values[4] !== previous[4]
        void sportsStore.loadHomepage({ refreshCounts, refreshCompetitionList }).finally(() => {
          if (version !== homepageLoadVersion) return
          homepageReady = true
          resumeHomepageRefresh()
        })
      },
      { immediate: true }
    )
    initializing.value = false
  })
  onActivated(() => {
    sportsPageActive.value = true
    resumeHomepageRefresh(true)
  })
  onDeactivated(() => {
    sportsPageActive.value = false
    homepageRefresh.stop()
    homepageLoadVersion += 1
    clearTimeout(searchTimer)
    searchInput.value = keyword.value
    sportsStore.cancelRequests()
  })
  onScopeDispose(() => {
    sportsPageDisposed = true
    homepageRefresh.stop()
    homepageLoadVersion += 1
    stopSportsRefresh?.()
    sportsStore.cancelRequests()
    clearTimeout(refreshTimer)
    clearTimeout(searchTimer)
    document.removeEventListener('pointerdown', closeOnOutside)
    document.removeEventListener('keydown', closeOnEscape)
    document.removeEventListener('visibilitychange', handlePageVisibility)
  })

  return {
    sportCounts,
    sportCountsLoading,
    sportCountsError,
    selectedSportId,
    selectedSportKey,
    selectedSportIcon,
    selectedSportLabel,
    selectedFilterKey,
    market,
    sortType,
    competitionIds,
    keyword,
    searchInput,
    handleSearchChange,
    displayLeagueGroups: eventsList,
    leagueCounts,
    syncExpandedLeagues,
    getLeagueLoadState,
    retryLeague,
    homepageLoading: sportsPageLoading,
    homepageError,
    matchesLoading,
    matchesError,
    matchListContext,
    hotEventsLoading,
    hotEventsError,
    sportsLoadFailedText,
    sportsRetryText,
    sportsEmptyText,
    sportsLoadingText,
    retrySports,
    retryHotEvents,
    refreshSportCounts: sportsStore.fetchSportCounts,
    matches,
    liveMatches,
    visibleMatchTargets,
    setVisibleMatches,
    currentPage,
    totalPages,
    pagedMatches,
    setPage,
    expandedMatchId,
    betSlipOpen,
    mode,
    selections,
    parlays,
    balanceText,
    balance: MOCK_BALANCE,
    totalStake,
    potentialReturn,
    currencySymbol,
    totalStakeText,
    potentialReturnText,
    canSubmit,
    notice,
    refreshing,
    focusedStakeId,
    collectOnly,
    handleMatchFavorite,
    isMatchFavoritePending,
    setMatchExpanded,
    getMatchMarkets,
    getLiveMarkets,
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
    submitMockBet,
    refreshBalance,
    showUnsupported,
    handleFloatingEntry,
    handleSportChange,
    handleMatchFilterChange,
    handleLeagueSortChange,
    handleLeagueChange,
    handleLeagueFilter,
    handleCollectChange
  }
}

export type SportsPageState = ReturnType<typeof useSportsPage>
