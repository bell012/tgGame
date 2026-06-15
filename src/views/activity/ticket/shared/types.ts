import type { TicketReminderTask } from './reminder/types'

export type { TicketReminderTask } from './reminder/types'

export type TicketResultVariant =
  | 'cash'
  | 'spin_again'
  | 'no_prize'
  | 'voucher_single'
  | 'voucher_multi'

/** @deprecated use TicketResultVariant */
export type LuckySpinResultVariant = TicketResultVariant

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

export interface TicketVoucherCardData {
  id: string
  type: VoucherCardType
  title: string
  rewardText: string
  expiresAt: string
  bgColor?: string
  icon?: string
}

/** @deprecated use TicketVoucherCardData */
export type LuckySpinVoucherCardData = TicketVoucherCardData

export interface TicketPrize {
  index: number
  type: PrizeType
  label: string
  icon: string
  amount?: number
  voucherType?: VoucherCardType
}

/** @deprecated use TicketPrize */
export type LuckySpinPrize = TicketPrize

export type TicketTask = TicketReminderTask

/** @deprecated use TicketReminderTask */
export type LuckySpinTask = TicketReminderTask

/** 活动弹窗会话数据（券种条 + 提醒弹窗，来自 mbTicketList） */
export interface TicketActivitySession {
  voucherGames: VoucherGameItem[]
  totalVouchers: number
  maxPrizeText: string
  tasks: TicketTask[]
  rules: string[]
}

export interface TicketSpinResult {
  prizeIndex: number
  prize: TicketPrize
  vouchers?: TicketVoucherCardData[]
}

/** @deprecated use TicketSpinResult */
export type LuckySpinResult = TicketSpinResult

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
