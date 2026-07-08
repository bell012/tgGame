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
  /** 全圆角胶囊（Figma 设计稿：背景框圆角全角） */
  pillRadius: 9999,
  /** 浅色磨砂灰底（对齐设计稿） */
  pillBg: 'rgba(255, 255, 255, 0.2)',
  /** 右侧内边距（文字尾部留白） */
  pillPaddingX: 12,
  /** 左侧内边距：头像贴合胶囊左侧圆弧（设计走查） */
  pillPaddingLeft: 3,
  pillPaddingY: 3,
  /** 胶囊之间的横向间距 */
  pillGap: 8,
  /** 头像与用户名之间的间距（Figma 设计稿） */
  avatarTextGap: 6,
  avatarSize: 24
} as const

export const TICKET_LAYOUT_VOUCHER_COMMON = {
  footerTextSize: 13,
  countHighlight: '#2AEE88',
  itemRadius: 10
} as const
