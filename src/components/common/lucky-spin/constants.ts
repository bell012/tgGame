import type { VoucherCardType } from './types'

export { getGameIcon, getPrizeIcon, LUCKY_SPIN_ASSETS, RESULT_HERO_IMAGES } from './assets'

export const VOUCHER_CARD_BG: Record<string, string> = {
  golden_egg: 'linear-gradient(90deg, #FFF9E2 0%, #FFEE8C 100%)',
  lucky_spin: 'linear-gradient(90deg, #FCE2FF 0%, #FA9CFF 100%)',
  cash_voucher: 'linear-gradient(90deg, #C4FFDA 0%, #8CFFAC 100%)',
  lucky_red_envelope: 'linear-gradient(90deg, #FFD7D7 0%, #FFABAC 100%)',
  mystery_box: 'linear-gradient(90deg, #D7F5FF 0%, #ABEBFF 100%)'
}

export const VOUCHER_CARD_TEXT: Record<string, { reward: string; meta: string }> = {
  golden_egg: { reward: '#8B7600', meta: '#8B7600' },
  lucky_spin: { reward: '#7C3A80', meta: '#7C3A80' },
  cash_voucher: { reward: '#257E3E', meta: '#257E3E' },
  lucky_red_envelope: { reward: '#7B0202', meta: '#7B0202' },
  mystery_box: { reward: '#00577F', meta: '#00577F' }
}

export const getVoucherCardBg = (type: VoucherCardType) => VOUCHER_CARD_BG[type] ?? '#E8E8E8'

export const getVoucherCardTextColors = (type: VoucherCardType) =>
  VOUCHER_CARD_TEXT[type] ?? { reward: '#E53935', meta: '#666666' }

export const WHEEL_SEGMENT_COUNT = 8
