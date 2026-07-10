/** H5 票券活动弹窗布局常量（Figma 9773:69941 大转盘有中奖轮播对齐） */

import type { TicketGameId } from '../types'
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

  /** 玩法专属 header 间距覆盖 */
  headerByGame: {
    lucky_red_envelope: {
      /** 倒计时数字格间距（设计稿 18px @1125 → 6px） */
      countdownDigitGap: 6
    }
  },

  sectionGap: {
    /** 倒计时数字格底部 → 转盘顶部 */
    headerToWheel: 20,
    wheelToTicker: 12,
    /** 设计走查：原 12px 偏小，增加 15px @1125 → +5px */
    tickerToFooter: 17
  },

  /** 玩法专属 sectionGap 覆盖（仅列差异项） */
  sectionGapByGame: {
    golden_egg: {
      /** 砸金蛋走查：货架→券条间距 +70px @1125 → +23px */
      tickerToFooter: 40
    },
    lucky_red_envelope: {
      /** 红包走查：展台→券条间距 +70px @1125 → +23px（与砸金蛋一致） */
      tickerToFooter: 40
    },
    cash_voucher: {
      /** 现金券走查：Claim Now→券条间距 +70px @1125 → +23px */
      tickerToFooter: 40
    },
    mystery_box: {
      /** 盲盒走查：盲盒区→券条间距 +70px @1125 → +23px */
      tickerToFooter: 40
    }
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

  /** H5 券种条横向轮播（Figma 9773:70079；选中 180×204 / 未选中 150×170 @1125） */
  voucherCarousel: {
    visibleSlots: 5,
    /** 未选中券卡（150÷3） */
    slotSize: 50,
    slotHeight: 57,
    /** 选中券卡（180÷3 × 204÷3） */
    activeSlotSize: 60,
    activeSlotHeight: 68,
    slotGap: 8,
    trackWidth: 50 * 4 + 60 + 8 * 4,
    activeScale: 1,
    iconWidth: 50,
    iconHeight: 57,
    activeIconWidth: 60,
    activeIconHeight: 68,
    /** 选中描边宽度（设计稿 6px @1125 → 2px） */
    activeBorderWidth: 2,
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

export const VOUCHER_CAROUSEL_ROW_MIN_HEIGHT = TICKET_MOBILE_LAYOUT.voucherCarousel.activeSlotHeight

export const VOUCHER_CAROUSEL_ITEM_SIZE = TICKET_MOBILE_LAYOUT.voucherCarousel.slotSize
export const VOUCHER_CAROUSEL_GAP = TICKET_MOBILE_LAYOUT.voucherCarousel.slotGap
export const VOUCHER_CAROUSEL_VISIBLE_SLOTS = TICKET_MOBILE_LAYOUT.voucherCarousel.visibleSlots
export const VOUCHER_CAROUSEL_TRACK_WIDTH = TICKET_MOBILE_LAYOUT.voucherCarousel.trackWidth

export const ticketMobileSectionClass = {
  headerToWheel: 'mt-5',
  wheelToTicker: 'mt-3',
  /** 跑马灯 → 票券条：对齐 sectionGap.tickerToFooter(17px) */
  tickerToFooter: 'mt-[17px]'
} as const

const resolveSectionGap = (gameId?: TicketGameId) => {
  const defaults = TICKET_MOBILE_LAYOUT.sectionGap
  const overrides =
    gameId && gameId in TICKET_MOBILE_LAYOUT.sectionGapByGame
      ? TICKET_MOBILE_LAYOUT.sectionGapByGame[
          gameId as keyof typeof TICKET_MOBILE_LAYOUT.sectionGapByGame
        ]
      : undefined

  return {
    ...defaults,
    ...overrides
  }
}

const resolveHeaderLayout = (gameId?: TicketGameId) => {
  const defaults = TICKET_MOBILE_LAYOUT.header
  const overrides =
    gameId && gameId in TICKET_MOBILE_LAYOUT.headerByGame
      ? TICKET_MOBILE_LAYOUT.headerByGame[gameId as keyof typeof TICKET_MOBILE_LAYOUT.headerByGame]
      : undefined

  return {
    ...defaults,
    ...overrides
  }
}

/** 按玩法合并 header 间距 token */
export const getTicketMobileHeaderLayout = (gameId?: TicketGameId) => resolveHeaderLayout(gameId)

/** 按玩法合并 sectionGap，生成 Tailwind margin class */
export const getTicketMobileSectionClass = (gameId?: TicketGameId) => {
  const gap = resolveSectionGap(gameId)

  return {
    headerToWheel: gap.headerToWheel === 20 ? 'mt-5' : `mt-[${gap.headerToWheel}px]`,
    wheelToTicker: gap.wheelToTicker === 12 ? 'mt-3' : `mt-[${gap.wheelToTicker}px]`,
    tickerToFooter: `mt-[${gap.tickerToFooter}px]`
  }
}
