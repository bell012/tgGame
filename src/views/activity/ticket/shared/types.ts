export type LuckySpinResultVariant =
  | 'cash'
  | 'spin_again'
  | 'no_prize'
  | 'voucher_single'
  | 'voucher_multi'

export type PrizeType = 'cash' | 'spin_again' | 'no_prize' | 'voucher'

export type VoucherCardType = 'golden_egg' | 'lucky_spin' | 'cash_voucher' | string

export type TicketGameId =
  | 'lucky_spin'
  | 'golden_egg'
  | 'mystery_box'
  | 'cash_voucher'
  | 'lucky_red_envelope'

export type TicketModalTheme = TicketGameId

export interface WinnerTickerItem {
  id: string
  avatar: string
  username: string
  prizeText: string
}

export interface VoucherGameItem {
  /** 列表唯一键，如 ticket-{rowId} */
  id: string
  /** 票券 type 映射的玩法；type 5 预留可为空 */
  gameId?: TicketGameId
  rowId?: number
  ticketId?: number
  icon?: string
  label?: string
  route?: string
}

export interface LuckySpinVoucherCardData {
  id: string
  type: VoucherCardType
  title: string
  rewardText: string
  expiresAt: string
  bgColor?: string
  icon?: string
}

export interface LuckySpinPrize {
  index: number
  type: PrizeType
  label: string
  icon: string
  amount?: number
  voucherType?: VoucherCardType
}

export interface LuckySpinTask {
  id: string
  title: string
  progress: number
  finished: boolean
  actionType?: 'deposit' | 'bet'
}

export interface LuckySpinInfoResult {
  endTime: number
  maxPrizeText: string
  remainingSpins: number
  totalVouchers: number
  prizes: LuckySpinPrize[]
  tasks: LuckySpinTask[]
  recentVouchers: LuckySpinVoucherCardData[]
  winnerRecords: WinnerTickerItem[]
  voucherGames: VoucherGameItem[]
  rules: string[]
}

export interface LuckySpinResult {
  prizeIndex: number
  prize: LuckySpinPrize
  vouchers?: LuckySpinVoucherCardData[]
}

export interface TicketModalHeaderData {
  title: string
  subtitle: string
  endTime?: number
  expiresLabel?: string
  theme?: TicketModalTheme
}

export interface TicketWinnerTickerData {
  items: WinnerTickerItem[]
}

export interface TicketVoucherFooterData {
  games: VoucherGameItem[]
  activeIndex: number
  totalVouchers: number
  activeGameId?: TicketGameId
}

export interface OpenTicketToastOptions {
  gameId: TicketGameId
  header?: Partial<TicketModalHeaderData>
  ticker?: TicketWinnerTickerData
  footer?: Partial<TicketVoucherFooterData>
  gameProps?: Record<string, unknown>
}
