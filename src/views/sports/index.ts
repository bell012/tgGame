import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import teamBadge from '@/static/img/explore/sports-team.png'
import type { OddsMarket, OddsSelectPayload, OddsTrend } from './components/match-odds/types'

export type SportsBetMode = 'single' | 'parlay'
export type SportsMatch = {
  id: string
  country: string
  league: string
  kickoff: string
  homeScore: number
  awayScore: number
  cornerScore: string
  halfTimeScore: string
  home: { name: string; badge: string; redCards: number; yellowCards: number }
  away: { name: string; badge: string; redCards: number; yellowCards: number }
  markets?: OddsMarket[]
  live?: boolean
  mockBetStatus?: 'open' | 'closed' | 'fail'
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
const MOCK_TEAMS = [
  { home: 'Manchester United United', away: 'Bayern Munich' },
  { home: 'Chelsea', away: 'Man City' },
  { home: 'Real Madrid', away: 'Real Betis' }
]
const NOTICE_MESSAGES: Record<Exclude<NoticeKey, ''>, string> = {
  needTwoSelections: 'Add selections from at least two different matches to place a parlay.',
  selectionLimit: 'You can select up to eight different matches.',
  submitted: 'Local simulation complete. No real bet was placed and no balance was deducted.',
  balanceRefreshed: 'Mock balance refreshed. No real account was requested.',
  notImplemented: 'The design for this dialog is not available yet.',
  currencyChanged: 'Display currency changed. Mock bets have been reset.'
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

export const useSportsPage = (options: { additionalMatches?: readonly SportsMatch[] } = {}) => {
  const { currentCurrencyCode } = useDisplayCurrency()
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
  let refreshTimer: ReturnType<typeof setTimeout> | undefined

  const matches = computed<SportsMatch[]>(() =>
    Array.from({ length: 72 }, (_, index) => {
      const kickoffMinutes = 180 + index * 15
      const hour = String(Math.floor(kickoffMinutes / 60)).padStart(2, '0')
      const minute = String(kickoffMinutes % 60).padStart(2, '0')
      return {
        id: `mock-match-${index + 1}`,
        country: 'England',
        league: 'FA Cup (2×6min)',
        kickoff: `Tomorrow, ${hour}:${minute}`,
        homeScore: index % 3 === 0 ? 2 : 1,
        awayScore: index % 3 === 0 ? 1 : 0,
        cornerScore: '3-1',
        halfTimeScore: '0-0',
        home: {
          name: MOCK_TEAMS[index % MOCK_TEAMS.length].home,
          badge: teamBadge,
          redCards: 1,
          yellowCards: 3
        },
        away: {
          name: MOCK_TEAMS[index % MOCK_TEAMS.length].away,
          badge: teamBadge,
          redCards: 0,
          yellowCards: 0
        }
      }
    })
  )
  const liveMatches = computed(() => matches.value.slice(0, 4))
  // 两端共用投注数据源，移动端扩展赛事不改变 PC 的列表与分页。
  const allMatches = computed(() => [...matches.value, ...(options.additionalMatches ?? [])])
  const totalPages = computed(() => Math.max(1, Math.ceil(matches.value.length / MATCH_PAGE_SIZE)))
  const pagedMatches = computed(() =>
    matches.value.slice(
      (currentPage.value - 1) * MATCH_PAGE_SIZE,
      currentPage.value * MATCH_PAGE_SIZE
    )
  )
  // 换页只更新赛事窗口并关闭展开层，投注选择、金额和收藏继续保留。
  const setPage = (page: number) => {
    if (!Number.isFinite(page) || !Number.isInteger(page)) return
    const nextPage = Math.min(Math.max(1, page), totalPages.value)
    if (nextPage === currentPage.value) return
    currentPage.value = nextPage
    expandedMatchId.value = null
  }

  // 页面与投注单共用盘口定义，模拟文案统一使用设计稿英文。
  const createMarkets = (matchId: string): OddsMarket[] => {
    const match = allMatches.value.find(item => item.id === matchId)
    if (!match) return []
    const selected = outcomes.value.find(outcome => outcome.matchId === matchId)
    const markets: OddsMarket[] = match.markets ?? [
      {
        id: '1x2',
        title: '1X2',
        options: [
          { id: 'home', label: 'H', odds: '11.0' },
          { id: 'away', label: 'A', odds: '7.0' },
          { id: 'draw', label: 'D', odds: '1.21' }
        ]
      },
      {
        id: 'handicap',
        title: 'Handicap',
        options: [
          { id: 'home', label: 'H', line: '-0/0.5', odds: '2.15' },
          { id: 'away', label: 'A', line: '+0/0.5', odds: '1.72' }
        ]
      },
      {
        id: 'ou',
        title: 'Over/Under',
        options: [
          { id: 'over', label: 'Over', line: '3.5', odds: '2.15' },
          { id: 'under', label: 'Under', line: '3.5', odds: '2.15' }
        ]
      },
      {
        id: 'total-half',
        title: 'First-half Over/Under',
        options: [
          { id: 'over', label: 'Over', line: '1.5', odds: '1.85' },
          { id: 'under', label: 'Under', line: '1.5', odds: '1.95' }
        ]
      }
    ]
    return markets.map(market => ({
      ...market,
      options: market.options.map(option => ({
        ...option,
        selected: selected?.marketId === market.id && selected?.optionId === option.id
      }))
    }))
  }
  const getMatchMarkets = (matchId: string) =>
    createMarkets(matchId).filter(market => market.id !== 'total-half')
  const getLiveMarkets = (matchId: string) =>
    createMarkets(matchId).filter(market => market.id === 'ou' || market.id === 'total-half')
  const selections = computed<SportsBetSelection[]>(() =>
    outcomes.value.flatMap(outcome => {
      const match = allMatches.value.find(item => item.id === outcome.matchId)
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
          live: match.live,
          mockBetStatus: match.mockBetStatus
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
    if (!allMatches.value.some(match => match.id === id)) return
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
  onScopeDispose(() => {
    clearTimeout(refreshTimer)
    document.removeEventListener('pointerdown', closeOnOutside)
    document.removeEventListener('keydown', closeOnEscape)
  })

  return {
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
    showUnsupported
  }
}

export type SportsPageState = ReturnType<typeof useSportsPage>
