/** 票券活动弹窗 — Mobile / PC 共享布局 token */

export const TICKET_LAYOUT_HEADER_COMMON = {
  titleFontSize: 24,
  titleLineHeight: 30,
  subtitleFontSize: 14,
  subtitleMarginTop: 4,
  countdownDigitGap: 4,
  countdownBoxSize: 24,
  countdownBoxRadius: 6,
  countdownBoxBorder: 'rgba(255, 255, 255, 0.2)',
  countdownDigitFontSize: 18,
  expiresLabelFontSize: 12,
  countdownLabelIconSize: 14,
  countdownLabelGap: 5
} as const

export const TICKET_LAYOUT_MARQUEE_COMMON = {
  pillRadius: 15.5,
  pillBg: 'rgba(255, 255, 255, 0.15)',
  pillPaddingX: 12,
  pillPaddingY: 6,
  pillGap: 8,
  avatarSize: 24
} as const

export const TICKET_LAYOUT_VOUCHER_COMMON = {
  footerTextSize: 13,
  countHighlight: '#2AEE88',
  itemRadius: 10
} as const
