import type {
  HashGameAlgorithm,
  HashGameBetOption,
  HashGameBetStatus,
  HashGameLotteryBet,
  HashGameLotteryInfo,
  HashGameLotteryResult
} from '@/api/interface/hash_game.interface'

export type BetKey = Lowercase<HashGameBetOption>
export type RoadmapMode = 'size' | 'parity' | 'winner'

export const HASH_BET_STATUS_KEYS: Record<HashGameBetStatus, string> = {
  CONFIRMING: 'confirming',
  VOIDED: 'voided',
  PENDING: 'pending',
  WIN: 'win',
  LOSE: 'lose',
  REFUND: 'refund',
  ERROR: 'error',
  CANCEL: 'cancelled'
}

export type RecentBetRecord = Pick<
  HashGameLotteryBet,
  'orderNo' | 'anchorBlockNum' | 'betOption' | 'status'
> & {
  amount: number | null
  profitLoss: number | null
}

export type RecentBetSummary = {
  count: number
  totalBetAmount: number
  profitLoss: number
}

const readBetAmount = (value: HashGameLotteryBet['amount']) => {
  if (value == null || (typeof value === 'string' && !value.trim())) return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

export function getHashBetProfit(
  status: HashGameBetStatus,
  amount: HashGameLotteryBet['amount'],
  payout: HashGameLotteryBet['payoutAmount']
) {
  if (status !== 'WIN' && status !== 'LOSE') return null
  const stake = readBetAmount(amount)
  const returned = readBetAmount(payout)
  return stake != null && returned != null ? returned - stake : null
}

/** 展示当前玩法和币种的近期投注，汇总仅统计本地当天的记录。 */
export function recentGameBets(
  bets: readonly HashGameLotteryBet[],
  gameCode: string,
  currency: string,
  now = new Date()
) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const records: RecentBetRecord[] = []
  const summary: RecentBetSummary = { count: 0, totalBetAmount: 0, profitLoss: 0 }
  for (const bet of bets) {
    if (bet.gameCode !== gameCode || bet.currency !== currency) continue

    const amount = readBetAmount(bet.amount)
    const profitLoss = getHashBetProfit(bet.status, bet.amount, bet.payoutAmount)
    records.push({
      orderNo: bet.orderNo,
      anchorBlockNum: bet.anchorBlockNum,
      betOption: bet.betOption,
      status: bet.status,
      amount,
      profitLoss
    })
    const time = new Date(timestampMillis(bet.betTime) || bet.betTime)
    if (bet.status !== 'CANCEL' && time >= start && time < end) {
      summary.count++
      summary.totalBetAmount += amount ?? 0
      summary.profitLoss += profitLoss ?? 0
    }
  }
  return { records, summary }
}

export const BET_KEYS = {
  BIG: 'big',
  SMALL: 'small',
  ODD: 'odd',
  EVEN: 'even',
  WIN: 'win',
  LOSE: 'lose',
  BANKER: 'banker',
  PLAYER: 'player',
  TIE: 'tie'
} as const satisfies Record<HashGameBetOption, BetKey>

export const BET_COLORS: Record<BetKey, string> = {
  big: '#FF5350',
  small: '#407FFF',
  odd: '#34D8C7',
  even: '#FF9822',
  win: '#34D8C7',
  lose: '#FF5350',
  banker: '#FF5350',
  player: '#407FFF',
  tie: '#34D8C7'
}

export const MARKET_OPTIONS: Record<HashGameAlgorithm, readonly HashGameBetOption[]> = {
  PARITY: ['BIG', 'SMALL', 'ODD', 'EVEN'],
  SUM: ['ODD', 'EVEN'],
  LUCKY: ['WIN'],
  BANKER_PLAYER: ['BANKER', 'PLAYER', 'TIE'],
  NIUNIU: ['BANKER', 'PLAYER'],
  NIUNIU5: ['BANKER', 'PLAYER']
}

/** 支持直接返回通用赔率，也支持按投注项或 default 配置的赔率表。 */
export function formatOdds(config: HashGameLotteryInfo['oddsConfig'], option: HashGameBetOption) {
  const value = typeof config === 'object' ? (config?.[option] ?? config?.default) : config
  return typeof value === 'number' || (typeof value === 'string' && value.trim())
    ? String(value)
        .trim()
        .replace(/\s*[x×]$/i, '')
    : '—'
}

/** 服务端以字符串返回金额时保留原本的小数精度。 */
export function formatStakeAmount(value: number | string) {
  const raw = String(value)
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const [integer, decimal] = raw.split('.')
    const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return decimal === undefined ? grouped : `${grouped}.${decimal}`
  }
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 20 })
}

/** 按玩法读取同一期开奖结果，和值单双只取单双。 */
export function issueOutcome(result: HashGameLotteryResult, mode: RoadmapMode): BetKey | undefined {
  const value =
    mode === 'size'
      ? result.bigSmall
      : mode === 'parity'
        ? result.oddEven
        : typeof result.win === 'boolean'
          ? result.win
            ? 'WIN'
            : 'LOSE'
          : result.winner
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(BET_KEYS, value)
    ? BET_KEYS[value as HashGameBetOption]
    : undefined
}

/** 延续同一结果时向下排，遇到底部或已有结果时向右延伸。 */
export function buildRoadColumns(history: BetKey[]) {
  const columns: (BetKey | undefined)[][] = []
  let start = -1
  let column = -1
  let row = 0
  let previous: BetKey | undefined
  let turned = false
  for (const value of history) {
    if (value !== previous) {
      column = start + 1
      row = 0
      while (columns[column]?.[0]) column++
      start = column
      turned = false
    } else if (!turned && row < 4 && !columns[column]?.[row + 1]) {
      row++
    } else {
      turned = true
      do column++
      while (columns[column]?.[row])
    }
    const cells = (columns[column] ??= Array<BetKey | undefined>(5).fill(undefined))
    cells[row] = value
    previous = value
  }
  return columns
}

/** 将接口返回的秒或毫秒时间戳统一为毫秒。 */
export function timestampMillis(value: unknown) {
  const time = Number(value)
  if (!Number.isFinite(time) || time <= 0) return 0
  return time < 1e12 ? time * 1000 : time
}

/** 仅允许打开 HTTP(S) 区块浏览器链接。 */
export function issueExplorerUrl(value: string | undefined, block: number) {
  if (value && /^https?:\/\//i.test(value)) return value
  return `https://tronscan.org/#/block/${block}`
}
