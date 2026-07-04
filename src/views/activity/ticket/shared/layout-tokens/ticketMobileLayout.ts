/** H5 票券活动弹窗布局常量（Figma 9773:69941 大转盘有中奖轮播对齐） */

import {
  TICKET_LAYOUT_HEADER_COMMON,
  TICKET_LAYOUT_MARQUEE_COMMON,
  TICKET_LAYOUT_VOUCHER_COMMON
} from './ticketLayoutCommon'

export const TICKET_MOBILE_LAYOUT = {
  contentMaxWidth: 340,
  horizontalPadding: 14,
  modalZIndex: 70,

  header: {
    ...TICKET_LAYOUT_HEADER_COMMON,
    /** 副标题 → 倒计时数字行（Figma 11201:100806 gap 42 @1125） */
    subtitleToCountdownGap: 14,
    /** 数字行 → 过期文案行（Figma gap 21 @1125） */
    countdownDigitsToLabelGap: 7,
    /** Spin Expires In 文案字号（设计稿 42px @1125 → 14px） */
    expiresLabelFontSize: 14
  },

  sectionGap: {
    /** 倒计时数字格底部 → 转盘顶部 */
    headerToWheel: 20,
    wheelToTicker: 12,
    tickerToFooter: 12
  },

  marquee: {
    ...TICKET_LAYOUT_MARQUEE_COMMON,
    fontSize: 12
  },

  voucher: {
    ...TICKET_LAYOUT_VOUCHER_COMMON,
    itemSize: 60,
    itemGap: 8,
    inactiveOpacity: 0.6,
    navBtnSize: 32,
    navBtnBg: 'rgba(255, 255, 255, 0.08)',
    navIconSize: 16,
    footerMarginTop: 12
  },

  /** H5 券种条横向轮播（Figma 9773:70079；选中/未选中 180/150 ≈ 1.2） */
  voucherCarousel: {
    visibleSlots: 5,
    /** slotSize 与 iconSize 对齐，使券间视觉间距恒等于 slotGap（设计稿 24px @1125 → 8px） */
    slotSize: 52,
    slotGap: 8,
    trackWidth: 52 * 5 + 8 * 4,
    activeScale: 1.2,
    /** 券图标尺寸（设计稿偏小已调大，与 slotSize 对齐） */
    iconSize: 52,
    itemRadius: 10,
    inactiveOpacity: 0.6,
    navBtnSize: 24,
    navIconSize: 14,
    navGap: 8,
    navBtnRadius: 5,
    navBtnBorder: '0.33px solid #FFF',
    navBtnBg: 'rgba(255, 255, 255, 0.30)'
  }
} as const

export const VOUCHER_CAROUSEL_ROW_MIN_HEIGHT = Math.ceil(
  TICKET_MOBILE_LAYOUT.voucherCarousel.iconSize * TICKET_MOBILE_LAYOUT.voucherCarousel.activeScale
)

export const VOUCHER_CAROUSEL_ITEM_SIZE = TICKET_MOBILE_LAYOUT.voucherCarousel.slotSize
export const VOUCHER_CAROUSEL_GAP = TICKET_MOBILE_LAYOUT.voucherCarousel.slotGap
export const VOUCHER_CAROUSEL_VISIBLE_SLOTS = TICKET_MOBILE_LAYOUT.voucherCarousel.visibleSlots
export const VOUCHER_CAROUSEL_TRACK_WIDTH = TICKET_MOBILE_LAYOUT.voucherCarousel.trackWidth

export const ticketMobileSectionClass = {
  headerToWheel: 'mt-5',
  wheelToTicker: 'mt-3',
  /** 跑马灯 → 票券条：对齐 sectionGap.tickerToFooter(12px)，避免过大空白 */
  tickerToFooter: 'mt-3'
} as const
