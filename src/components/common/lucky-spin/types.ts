export type LuckySpinResultVariant =
  | 'cash'
  | 'spin_again'
  | 'no_prize'
  | 'voucher_single'
  | 'voucher_multi'

export type PrizeType = 'cash' | 'spin_again' | 'no_prize' | 'voucher'

export type VoucherCardType = 'golden_egg' | 'lucky_spin' | 'cash_voucher' | string

export interface WinnerTickerItem {
  id: string
  avatar: string
  username: string
  prizeText: string
}

export interface VoucherGameItem {
  id: string
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
  /** 用于抽奖结果弹窗等业务分支 */
  type: PrizeType
  /** 格位展示文案，后端配置 */
  label: string
  /** 格位展示 icon URL，后端配置 */
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
