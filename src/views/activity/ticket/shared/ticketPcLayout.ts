/** PC 票券活动弹窗布局（Figma 4782-41513） */

/** 三层遮罩：① 全屏暗幕 ② 弹窗浅玻璃 ③ 右栏转盘底色 */
export const TICKET_PC_MASKS = {
  /** ① 页面全屏遮罩（--color-mask-60-1） */
  page: {
    className: 'bg-mask-60-1',
    blur: '8px'
  },
  /** ② 弹窗外壳玻璃（Figma：rgba(255,255,255,0.10)） */
  shell: {
    bg: 'rgba(255, 255, 255, 0.10)',
    blur: '12px'
  },
  /** ③ 右栏转盘区实色底（Figma：#302B30，不透明） */
  rightPanel: {
    bg: 'rgb(48, 43, 48, 0.3)',
    paddingTop: 24,
    paddingBottom: 24
  }
} as const

export const TICKET_PC_LAYOUT = {
  overlayMaskClass: TICKET_PC_MASKS.page.className,
  overlayBlur: TICKET_PC_MASKS.page.blur,
  shellMask: TICKET_PC_MASKS.shell,
  rightPanelMask: TICKET_PC_MASKS.rightPanel,

  modalMaxWidth: 1000,
  modalBodyHeight: 540,
  modalMinHeight: 540,
  modalRadius: 24,
  modalPadding: 24,
  modalShadow: '0 24px 64px rgba(0, 0, 0, 0.45)',

  /** 左栏内边距（Figma：上 24 / 左右 12 / 下 0） */
  leftPanel: {
    paddingTop: 24,
    paddingRight: 12,
    paddingBottom: 0,
    paddingLeft: 12
  },

  cardBorder: '1px solid rgba(255, 255, 255, 0.10)',

  gridColumns: '1fr 1fr',
  columnGap: 0,

  sectionDivider: '1px solid var(--color-opacity-10)',
  /** 过期文案 → 票券数文案 */
  headerToVoucherGap: 12,

  controlBtnSize: 32,
  controlBtnRadius: 8,
  /** 中性深灰半透明底，无描边 */
  controlBtnBg: 'rgba(255, 255, 255, 0.10)',
  controlBtnIconSize: 22,

  header: {
    titleFontSize: 24,
    titleLineHeight: 30,
    subtitleFontSize: 14,
    subtitleMarginTop: 4,
    subtitleToCountdownGap: 16,
    countdownDigitsToLabelGap: 8,
    countdownDigitGap: 4,
    countdownBoxSize: 24,
    countdownBoxRadius: 6,
    /** 数字格描边（中性白半透明；数字/冒号/文案色见 TICKET_MODAL_THEMES） */
    countdownBoxBorder: 'rgba(255, 255, 255, 0.2)',
    countdownBoxBg: 'transparent',
    countdownDigitFontSize: 18,
    expiresLabelFontSize: 12,
    countdownLabelIconSize: 14,
    countdownLabelGap: 5
  },

  voucher: {
    footerTextSize: 13,
    countHighlight: '#2AEE88',
    footerToGridGap: 12,
    itemWidth: 75,
    itemHeight: 85,
    activeItemWidth: 90,
    activeItemHeight: 102,
    itemColumnGap: 19,
    itemRowGap: 17,
    itemRadius: 10
  },

  marquee: {
    marginTop: 12,
    pillRadius: 15.5,
    pillBg: 'rgba(255, 255, 255, 0.15)',
    pillPaddingX: 12,
    pillPaddingY: 6,
    pillGap: 8,
    avatarSize: 24,
    fontSize: 13
  }
} as const

/** 右栏水平内边距：使转盘在 modalMaxWidth/2 列宽内完整展示 */
export const getTicketPcRightPanelPaddingX = (wheelSize: number) =>
  Math.max(0, (TICKET_PC_LAYOUT.modalMaxWidth / 2 - wheelSize) / 2)
