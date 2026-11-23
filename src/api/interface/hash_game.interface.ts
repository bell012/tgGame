/** Hash 彩票游戏支持的开奖算法。 */
export type HashGameAlgorithm = 'PARITY' | 'SUM' | 'LUCKY' | 'BANKER_PLAYER' | 'NIUNIU' | 'NIUNIU5'
// 开奖算法：`PARITY` 单双大小、`SUM` 和值单双、`LUCKY` 幸运哈希、`BANKER_PLAYER` 幸运庄闲、`NIUNIU` 牛牛、`NIUNIU5` 五张牛牛

/** Hash 彩票支持的投注选项。 */
export type HashGameBetOption =
  'ODD' | 'EVEN' | 'BIG' | 'SMALL' | 'WIN' | 'LOSE' | 'BANKER' | 'PLAYER' | 'TIE'
//  `ODD` / `EVEN` / `BIG` / `SMALL` | 单 / 双 / 大 / 小 | `WIN` / `LOSE` | 赢 / 输 |  `BANKER` / `PLAYER` / `TIE` | 庄 / 闲 / 和 |

/** 投注单状态。 */
export type HashGameBetStatus =
  'CONFIRMING' | 'VOIDED' | 'PENDING' | 'WIN' | 'LOSE' | 'REFUND' | 'ERROR' | 'CANCEL'
// `CONFIRMING` 确认中、`VOIDED` 已作废（自动退款）、`PENDING` 待开奖、 `WIN` 中奖、`LOSE` 未中奖、`REFUND` 退款、`ERROR` 结算异常、`CANCEL` 已取消 |

/** 由算法决定结构的开奖结果。 */
export type HashGameLotteryResult = Record<string, unknown>

/** 游戏列表接口的请求参数。 */
export interface HashGameListParams {
  /** 当前选择的货币编码。 */
  currency: string
}

/** 游戏基础信息，也是游戏列表接口返回的单项。 */
export interface HashGameLotteryGame {
  gameCode: string // 游戏编码
  gameName: string // 游戏名称
  imageUrl?: string // 游戏图片
  description?: string | null
  currencies?: readonly string[] // 该玩法支持的投注币种，空数组表示不限制
  introImageUrl?: string | null // 游戏规则中玩法说明图片
  allowMultipleBets?: boolean
  multiBet?: boolean
  multipleBet?: boolean
  algorithm?: HashGameAlgorithm // 开奖算法
  periodBlocks?: number
  currentBlockNum?: number
  anchorBlockNum?: number
  nextAnchorEstimatedTime?: number | string | null
  serverTime?: number | string // 服务端当前时间
  onlineCount?: number // 当前在线人数
  recentIssues?: readonly HashGameLotteryIssue[]
}

/** 游戏详情接口的返回数据。 */
export interface HashGameLotteryInfo extends HashGameLotteryGame {
  algorithm: HashGameAlgorithm
  periodBlocks: number
  /** 通用赔率，或按投注项配置的赔率表。 */
  oddsConfig?: number | string | Record<string, unknown> | null
  betAmountMin: number | string // 筹码最小投注金额
  betAmountMax: number | string // 筹码最大投注金额
  nextAnchorBlockNum?: number
  sealed: boolean
  restrictOpposite?: number | boolean
}

/** 游戏详情接口的请求参数。 */
export interface HashGameInfoParams {
  gameCode: string
  /** 当前选择的货币编码。 */
  currency: string
}

/** 开奖期号及开奖结果。 */
export interface HashGameLotteryIssue {
  anchorBlockNum: number
  blockHash: string
  result: HashGameLotteryResult
  explorerUrl?: string
}

/** 中奖信息。 */
export interface HashGameLotteryWin {
  blockHash?: string
  orderNo: string
  gameCode: string
  anchorBlockNum: number
  currency: string
  profit: number
  result: HashGameLotteryResult | null
  status?: HashGameBetStatus
}

/** 投注记录及详情的通用字段。 */
export interface HashGameLotteryBet {
  orderNo: string
  gameCode: string
  gameName: string
  anchorBlockNum: number
  currency: string
  betOption: HashGameBetOption
  amount: number | string
  oddsSnapshot?: unknown
  result: HashGameLotteryResult | null
  status: HashGameBetStatus
  payoutAmount: number | string
  betTime: string | number
  settleTime?: string | number
  /** 开奖区块哈希；部分投注列表会直接返回。 */
  blockHash?: string
  explorerUrl?: string
}

/** 投注详情接口返回的数据。 */
export interface HashGameLotteryBetDetail extends Omit<HashGameLotteryBet, 'amount'> {
  betAmount: number | string
  appliedOdds?: number | string | null
}

/** 投注统计摘要。 */
export interface HashGameLotterySummary {
  currency: string
  count: number
  totalBetAmount: number | string
  totalPayoutAmount: number | string
  profitLoss: number | string
}

/** 分页查询投注记录的请求参数。 */
export interface HashGameBetPageParams {
  currency?: string
  status?: HashGameBetStatus[]
  betTimeStart?: number
  betTimeEnd?: number
  page: { current: number; size: number }
}

/** 投注记录分页结果。 */
export interface HashGameBetPageResult {
  current: number
  pages: number
  records: HashGameLotteryBet[]
  size: number
  summary: HashGameLotterySummary[]
  total: number
}

/** 下注接口的请求参数。 */
export interface HashGamePlaceBetParams {
  requestId: string
  gameCode: string
  currency: string
  betOption: HashGameBetOption
  amount: number
  anchorBlockNum: number
}

/** 下注成功后返回的订单信息。 */
export interface HashGamePlaceBetResult {
  orderNo: string
  currency: string
  anchorBlockNum: number
}

/** 取消下注接口的请求参数。 */
export interface HashGameCancelBetParams {
  gameCode: string
  orderNo: string
  currency: string
}

/** 取消成功的投注信息。 */
export interface HashGameCancelledBet {
  orderNo: string
  anchorBlockNum: number
  betOption: HashGameBetOption
  currency: string
  amount: number | string
}

/** 近期投注接口的请求参数。 */
export interface HashGameRecentBetsParams {
  gameCode?: string
  currency?: string
}

/** 近期投注及其统计摘要。 */
export interface HashGameRecentBetsResult {
  list: HashGameLotteryBet[]
  summary: HashGameLotterySummary[]
}

/** 往期开奖分页接口的请求参数。 */
export interface HashGameIssuePageParams {
  gameCode: string
  pageNum: number
  pageSize: number
}

/** 往期开奖分页结果。 */
export interface HashGameIssuePageResult {
  list?: HashGameLotteryIssue[]
  records?: HashGameLotteryIssue[]
  total: number
}

/** 走势/路单接口的返回数据。 */
export interface HashGameRoadmapResult {
  items: HashGameLotteryIssue[]
}

/** 所有 Hash 彩票接口共用的 HTTP 响应外层结构。 */
export interface HashGameApiResponse<T> {
  code: string | number
  message: string
  success?: boolean
  result: T
  [key: string]: unknown
}
