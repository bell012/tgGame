export type {
  LuckySpinInfoResult,
  LuckySpinPrize,
  LuckySpinResult,
  LuckySpinResultVariant,
  LuckySpinTask,
  LuckySpinVoucherCardData,
  PrizeType,
  VoucherCardType,
  VoucherGameItem,
  WinnerTickerItem
} from './types'

export {
  getGameIcon,
  getPrizeIcon,
  getVoucherCardBg,
  getVoucherCardTextColors,
  LUCKY_SPIN_ASSETS,
  RESULT_HERO_IMAGES,
  VOUCHER_CARD_BG,
  VOUCHER_CARD_TEXT,
  WHEEL_SEGMENT_COUNT
} from './constants'

export { LUCKY_SPIN_TOKENS } from './design-tokens'

export { default as LuckySpinHeroHeader } from './LuckySpinHeroHeader.vue'
export { default as LuckySpinWinnerTicker } from './LuckySpinWinnerTicker.vue'
export { default as LuckySpinVoucherSelector } from './LuckySpinVoucherSelector.vue'
export { default as LuckySpinResultPopup } from './LuckySpinResultPopup.vue'
export { default as LuckySpinVoucherCard } from './LuckySpinVoucherCard.vue'
