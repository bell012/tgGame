import { computed, onActivated, onDeactivated, onMounted, onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import { formatTimestamp } from '@/utils/date'
import type { SportCompetitionGroup } from '@/api/interface/sport'
import type { OddsMarket, OddsSelectPayload, OddsTrend } from './components/match-odds/types'
import type { CollectOnlyPayload, FilterTabChangePayload } from './components/filter_search'
import type {
  LeagueFilterPayload,
  LeagueSelectionPayload,
  LiansaiFilterPayload
} from './components/liansai_tabs'
import { sportItems } from './components/sports-navigation/sport-items'

export type SportsBetMode = 'single' | 'parlay'
export type SportsMatch = {
  id: string
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
  markets: OddsMarket[]
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
  marketId: string
  optionId: string
  odds: number
  stake: string
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
        // 基础信息阶段不接盘口转换，禁止回退到设计稿中的模拟赔率。
        markets: []
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
    competitionIds,
    keyword,
    earlyTradingDate,
    homepageLoading,
    homepageError,
    eventsList,
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
  const sportsPageLoading = computed(() => initializing.value || homepageLoading.value)
  const sportsLoadFailedText = computed(() => t('sports.loadFailed'))
  const sportsRetryText = computed(() => t('sports.retry'))
  const sportsEmptyText = computed(() => t('sports.noEvents'))
  const sportsLoadingText = computed(() => t('sports.loadingEvents'))
  // 此处仅分页展示本次返回的赛事；服务端 PageNumber 与 Total 的分页口径另行对接。
  const currentPage = ref(1)
  const expandedMatchId = ref<string | null>(null)
  const favorites = ref<string[]>([])
  const betSlipOpen = ref(false)
  const mode = ref<SportsBetMode>('single')
  const outcomes = ref<SelectedOutcome[]>([])
  const parlayStakes = ref<Record<string, string>>({})
  const focusedStakeId = ref('')
  const noticeKey = ref<NoticeKey>('')
  const refreshing = ref(false)
  const collectOnly = ref(false)
  let refreshTimer: ReturnType<typeof setTimeout> | undefined

  const matches = computed(() =>
    mapSportsMatches(eventsList.value, selectedSportId.value, getTeamLogoUrl)
  )
  // 实时区只展示本次响应中的滚球赛事，不另造热门数据或触发额外接口。
  const liveMatches = computed(() => matches.value.filter(match => match.live))
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
  // 换页只更新赛事窗口并关闭展开层，投注选择、金额和收藏继续保留。
  const setPage = (page: number) => {
    if (!Number.isFinite(page) || !Number.isInteger(page)) return
    const nextPage = Math.min(Math.max(1, page), totalPages.value)
    if (nextPage === currentPage.value) return
    currentPage.value = nextPage
    expandedMatchId.value = null
  }

  // 页面与投注单共用盘口数据；没有接入的盘口保持为空，不生成模拟选项。
  const createMarkets = (matchId: string): OddsMarket[] => {
    const match = matches.value.find(item => item.id === matchId)
    if (!match) return []
    const selected = outcomes.value.find(outcome => outcome.matchId === matchId)
    return match.markets.map(market => ({
      ...market,
      options: market.options.map(option => ({
        ...option,
        selected: selected?.marketId === market.id && selected?.optionId === option.id
      }))
    }))
  }
  const getMatchMarkets = createMarkets
  const getLiveMarkets = createMarkets
  const selections = computed<SportsBetSelection[]>(() =>
    outcomes.value.flatMap(outcome => {
      const match = matches.value.find(item => item.id === outcome.matchId)
      const market = createMarkets(outcome.matchId).find(item => item.id === outcome.marketId)
      const option = market?.options.find(item => item.id === outcome.optionId)
      if (!match || !market || !option) return []
      return [
        {
          id: outcome.id,
          matchId: outcome.matchId,
          odds: outcome.odds,
          stake: outcome.stake,
          trend: option.trend,
          selection: [option.label, option.line].filter(Boolean).join(' '),
          market: `${market.title} · Decimal`,
          marketTitle: market.title,
          fixture: `${match.home.name} — ${match.away.name}`,
          homeTeam: match.home.name,
          awayTeam: match.away.name,
          league: match.league,
          live: match.live
        }
      ]
    })
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

  const toggleFavorite = (id: string) => {
    if (!matches.value.some(match => match.id === id)) return
    favorites.value = favorites.value.includes(id)
      ? favorites.value.filter(value => value !== id)
      : [...favorites.value, id]
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
  // 严格消费盘口组件的 select 事件；同赛事只保留一个选项，不触发真实下注。
  const selectOdds = (matchId: string, payload: OddsSelectPayload) => {
    const market = createMarkets(matchId).find(item => item.id === payload.market.id)
    const option = market?.options.find(item => item.id === payload.option.id)
    if (!market || !option) return
    const odds = Number(option.odds)
    if (!Number.isFinite(odds) || odds <= 1) return
    const id = `${matchId}:${market.id}:${option.id}`
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
    const next = { id, matchId, marketId: market.id, optionId: option.id, odds, stake: '' }
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
  // 收藏筛选开关共用页面状态，不调用收藏写接口，也不推定 IsFavourite 的查询语义。
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
      keyword,
      () => (market.value === 1 ? earlyTradingDate.value : null)
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
      void sportsStore.loadHomepage({ refreshCounts: false })
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
        () => (market.value === 1 ? earlyTradingDate.value : null)
      ],
      (values, previous) => {
        if (!sportsPageActive.value || sportsPageDisposed) return
        const refreshCounts =
          previous[0] !== true || values[1] !== previous[1] || values[2] !== previous[2]
        if (refreshCounts) resetMatchListState()
        void sportsStore.loadHomepage({ refreshCounts })
      },
      { immediate: true }
    )
    initializing.value = false
  })
  onActivated(() => {
    sportsPageActive.value = true
  })
  onDeactivated(() => {
    sportsPageActive.value = false
    sportsStore.cancelRequests()
  })
  onScopeDispose(() => {
    sportsPageDisposed = true
    stopSportsRefresh?.()
    sportsStore.cancelRequests()
    clearTimeout(refreshTimer)
    document.removeEventListener('pointerdown', closeOnOutside)
    document.removeEventListener('keydown', closeOnEscape)
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
    homepageLoading: sportsPageLoading,
    homepageError,
    sportsLoadFailedText,
    sportsRetryText,
    sportsEmptyText,
    sportsLoadingText,
    retrySports,
    refreshSportCounts: sportsStore.fetchSportCounts,
    matches,
    liveMatches,
    currentPage,
    totalPages,
    pagedMatches,
    setPage,
    expandedMatchId,
    favorites,
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
    toggleFavorite,
    setMatchExpanded,
    getMatchMarkets,
    getLiveMarkets,
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
    handleSportChange,
    handleMatchFilterChange,
    handleLeagueSortChange,
    handleLeagueChange,
    handleLeagueFilter,
    handleCollectChange
  }
}

export type SportsPageState = ReturnType<typeof useSportsPage>
