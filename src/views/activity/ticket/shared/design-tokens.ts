import type { TicketModalTheme } from './types'

export const TICKET_MODAL_THEMES: Record<
  TicketModalTheme,
  {
    titleGradient: string
    /** PC 标题横向渐变 */
    titleGradientPc: string
    countdownColon: string
    expiresLabel: string
    activeBorder: string
    activeGlow: string
  }
> = {
  lucky_spin: {
    titleGradient: 'linear-gradient(180deg, #FFF8FF 0%, #E87BF9 100%)',
    titleGradientPc: 'linear-gradient(90deg, #FCE2FF 0%, #FA9CFF 100%)',
    countdownColon: '#E08CFF',
    expiresLabel: '#E08CFF',
    activeBorder: '#B06CFF',
    activeGlow: '0 0 12px rgba(176,108,255,0.5)'
  },
  golden_egg: {
    titleGradient: 'linear-gradient(180deg, #FFF9E2 0%, #FFD700 100%)',
    titleGradientPc: 'linear-gradient(90deg, #FFF9E2 0%, #FFD700 100%)',
    countdownColon: '#FFD700',
    expiresLabel: '#FFD700',
    activeBorder: '#FFD700',
    activeGlow: '0 0 12px rgba(255,215,0,0.5)'
  },
  mystery_box: {
    titleGradient: 'linear-gradient(180deg, #E8F8FF 0%, #5BC0EB 100%)',
    titleGradientPc: 'linear-gradient(90deg, #E8F8FF 0%, #5BC0EB 100%)',
    countdownColon: '#5BC0EB',
    expiresLabel: '#5BC0EB',
    activeBorder: '#5BC0EB',
    activeGlow: '0 0 12px rgba(91,192,235,0.5)'
  },
  cash_voucher: {
    titleGradient: 'linear-gradient(180deg, #E8FFEF 0%, #2AEE88 100%)',
    titleGradientPc: 'linear-gradient(90deg, #E8FFEF 0%, #2AEE88 100%)',
    countdownColon: '#2AEE88',
    expiresLabel: '#2AEE88',
    activeBorder: '#2AEE88',
    activeGlow: '0 0 12px rgba(42,238,136,0.5)'
  },
  lucky_red_envelope: {
    titleGradient: 'linear-gradient(180deg, #FFF8E8 0%, #FFD700 100%)',
    titleGradientPc: 'linear-gradient(90deg, #FFF8E8 0%, #FFD700 100%)',
    countdownColon: '#FFD700',
    expiresLabel: '#FFD700',
    activeBorder: '#FFD700',
    activeGlow: '0 0 12px rgba(255,215,0,0.5)'
  }
}

/** @deprecated 兼容转盘 canvas，逐步迁移引用至 TICKET_MODAL_THEMES */
export const LUCKY_SPIN_TOKENS = {
  modalMaskClass: 'bg-mask-40',
  modalBlur: '8px',
  titleGradient: TICKET_MODAL_THEMES.lucky_spin.titleGradient,
  countdownBox: {
    w: 24,
    h: 24,
    radius: 6,
    border: 'rgba(255,255,255,0.2)',
    bg: 'transparent'
  },
  countdownColon: TICKET_MODAL_THEMES.lucky_spin.countdownColon,
  expiresLabel: TICKET_MODAL_THEMES.lucky_spin.expiresLabel,
  voucherCountGreen: '#2AEE88',
  /** H5 转盘距屏幕左右边距（Figma） */
  wheelSideMargin: 36,
  wheelSize: 301,
  wheelDiscInset: '6.1%',
  wheelPointerSize: '34%',
  wheelShadowWidth: '72%',
  segmentLight: 'linear-gradient(183deg, #260F2A 0%, #66126A 15%, #903080 100%)',
  segmentDark: 'linear-gradient(183deg, #1B1B1B 0%, #331330 15%, #680157 100%)',
  segmentLightColor: '#903080',
  segmentDarkColor: '#680157',
  wheelInnerBg: '#2A0A2E',
  activeBorder: TICKET_MODAL_THEMES.lucky_spin.activeBorder,
  activeGlow: TICKET_MODAL_THEMES.lucky_spin.activeGlow
} as const

export const getTicketModalTheme = (theme: TicketModalTheme = 'lucky_spin') =>
  TICKET_MODAL_THEMES[theme] ?? TICKET_MODAL_THEMES.lucky_spin

/** PC 端票券活动弹窗尺寸 token */
export const TICKET_PC_TOKENS = {
  activityModalWidth: 1000,
  activityModalRadius: 24,
  activityModalPadding: 28,
  /** @deprecated 使用 TICKET_PC_MASKS.leftPanel / rightPanel 分层遮罩 */
  activityModalBg: 'rgba(255, 255, 255, 0.10)',
  leftColumnRatio: '1fr',
  rightColumnRatio: '1fr',
  wheelSizePc: 450,
  /** PC 转盘扇区文案 / 图标（相对 H5 约按 450/301 放大） */
  wheelPrizeFontSize: 19,
  wheelPrizeIconSize: 58,
  wheelPrizeTextTop: '12%',
  wheelPrizeIconTop: '26%',
  reminderModalWidth: 480,
  resultHeroMaxWidth: 360,
  resultCardsMaxWidth: 440,
  resultHeroImageSize: 200
} as const
