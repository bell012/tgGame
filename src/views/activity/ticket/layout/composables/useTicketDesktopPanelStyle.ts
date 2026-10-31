import { TICKET_PC_LAYOUT } from '../../shared/layout-tokens/ticketPcLayout'
import { computed, onMounted, onUnmounted, ref, watch, type WatchStopHandle } from 'vue'

/** 与 TicketActivityPage 遮罩 `p-6` 一致，缩放时从视口两侧各扣掉这段边距。 */
const TICKET_PC_OVERLAY_PADDING = 24

const viewportWidth = ref(0)
const viewportHeight = ref(0)
const stackLayoutHeight = ref(TICKET_PC_LAYOUT.modalBodyHeight)

let viewportListenerCount = 0

const syncViewport = () => {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

syncViewport()

const retainViewportListener = () => {
  if (typeof window === 'undefined') return
  if (viewportListenerCount === 0) {
    window.addEventListener('resize', syncViewport)
  }
  viewportListenerCount += 1
}

const releaseViewportListener = () => {
  if (typeof window === 'undefined') return
  viewportListenerCount = Math.max(0, viewportListenerCount - 1)
  if (viewportListenerCount === 0) {
    window.removeEventListener('resize', syncViewport)
  }
}

/**
 * 设计尺寸放得下时返回 1，避免无意义的 scale(1) 发糊。
 * 高度用内容盒的布局高度，transform 不会改变它，因此和 scale 不循环依赖。
 */
export const ticketPcModalScale = computed(() => {
  const width = viewportWidth.value
  const height = viewportHeight.value
  if (width <= 0 || height <= 0) return 1

  const availableWidth = width - TICKET_PC_OVERLAY_PADDING * 2
  const availableHeight = height - TICKET_PC_OVERLAY_PADDING * 2
  const layoutHeight = Math.max(stackLayoutHeight.value, 1)
  const widthScale = availableWidth / TICKET_PC_LAYOUT.modalMaxWidth
  const heightScale = availableHeight / layoutHeight

  return Math.min(1, Math.max(0, widthScale), Math.max(0, heightScale))
})

export const isTicketPcModalScaled = computed(() => ticketPcModalScale.value < 1)

/** 遮罩和桌面布局共用同一视口，保证缩放开关和槽位尺寸同步。 */
export function useTicketPcViewport() {
  syncViewport()

  onMounted(() => {
    syncViewport()
    retainViewportListener()
  })

  onUnmounted(releaseViewportListener)

  return { ticketPcModalScale, isTicketPcModalScaled }
}

export function useTicketDesktopPanelStyle() {
  const { ticketPcModalScale: scale, isTicketPcModalScaled: isScaled } = useTicketPcViewport()
  const rightPanelRef = ref<HTMLElement | null>(null)
  const stackRef = ref<HTMLElement | null>(null)

  const updateStackLayoutHeight = () => {
    const next = Math.ceil(stackRef.value?.offsetHeight ?? 0)
    if (next > 0 && next !== stackLayoutHeight.value) {
      stackLayoutHeight.value = next
    }
  }

  let stackObserver: ResizeObserver | null = null
  const stopStackWatch: WatchStopHandle = watch(stackRef, el => {
    stackObserver?.disconnect()
    stackObserver = null
    updateStackLayoutHeight()
    if (!el || typeof ResizeObserver === 'undefined') return

    stackObserver = new ResizeObserver(() => updateStackLayoutHeight())
    stackObserver.observe(el)
  })

  onUnmounted(() => {
    stopStackWatch()
    stackObserver?.disconnect()
    stackObserver = null
  })

  const pcStackStyle = computed(() => ({
    width: `${TICKET_PC_LAYOUT.modalMaxWidth}px`,
    maxWidth: `${TICKET_PC_LAYOUT.modalMaxWidth}px`
  }))

  const pcFitSlotStyle = computed(() => {
    const designWidth = TICKET_PC_LAYOUT.modalMaxWidth
    if (!isScaled.value) {
      return {
        width: `${designWidth}px`,
        maxWidth: `${designWidth}px`,
        flexShrink: '0'
      }
    }

    return {
      width: `${designWidth * scale.value}px`,
      height: `${stackLayoutHeight.value * scale.value}px`,
      flexShrink: '0',
      minWidth: '0',
      minHeight: '0'
    }
  })

  const pcFitScaleStyle = computed(() => {
    if (!isScaled.value) return undefined
    return {
      transform: `scale(${scale.value})`,
      transformOrigin: 'top left'
    }
  })

  const pcModalBodyStyle = {
    width: `${TICKET_PC_LAYOUT.modalMaxWidth}px`,
    height: `${TICKET_PC_LAYOUT.modalBodyHeight}px`,
    minHeight: `${TICKET_PC_LAYOUT.modalBodyHeight}px`
  }

  const pcModalShellStyle = computed(() => ({
    borderRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
    boxShadow: TICKET_PC_LAYOUT.modalShadow
  }))

  const pcLeftPanelSyncedStyle = computed(() => ({
    background: TICKET_PC_LAYOUT.shellMask.bg,
    borderTopLeftRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
    borderBottomLeftRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
    paddingTop: `${TICKET_PC_LAYOUT.leftPanel.paddingTop}px`,
    paddingRight: `${TICKET_PC_LAYOUT.leftPanel.paddingRight}px`,
    paddingBottom: `${TICKET_PC_LAYOUT.leftPanel.paddingBottom}px`,
    paddingLeft: `${TICKET_PC_LAYOUT.leftPanel.paddingLeft}px`,
    height: '100%'
  }))

  const pcRightPanelStyle = computed(() => ({
    backgroundColor: TICKET_PC_LAYOUT.rightPanelMask.bg,
    borderTopRightRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
    borderBottomRightRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
    paddingTop: '16px',
    paddingBottom: '0px',
    paddingLeft: '4px',
    paddingRight: '4px'
  }))

  const pcFallbackPanelStyle = computed(() => ({
    minHeight: `${TICKET_PC_LAYOUT.modalMinHeight}px`,
    padding: `${TICKET_PC_LAYOUT.modalPadding}px`
  }))

  const pcSectionDividerStyle = {
    marginTop: `${TICKET_PC_LAYOUT.headerToVoucherGap}px`,
    marginBottom: `${TICKET_PC_LAYOUT.headerToVoucherGap}px`,
    borderTop: TICKET_PC_LAYOUT.sectionDivider
  }

  const pcControlBtnStyle = {
    width: `${TICKET_PC_LAYOUT.controlBtnSize}px`,
    height: `${TICKET_PC_LAYOUT.controlBtnSize}px`,
    borderRadius: `${TICKET_PC_LAYOUT.controlBtnRadius}px`,
    backgroundColor: TICKET_PC_LAYOUT.controlBtnBg,
    border: 'none'
  }

  const pcHelpIconStyle = {
    width: `${TICKET_PC_LAYOUT.controlBtnIconSize}px`,
    height: `${TICKET_PC_LAYOUT.controlBtnIconSize}px`
  }

  const pcTickerStyle = {
    marginTop: `${TICKET_PC_LAYOUT.marquee.marginTop}px`
  }

  return {
    rightPanelRef,
    stackRef,
    isTicketPcModalScaled: isScaled,
    pcFitSlotStyle,
    pcFitScaleStyle,
    pcStackStyle,
    pcModalBodyStyle,
    pcModalShellStyle,
    pcLeftPanelSyncedStyle,
    pcRightPanelStyle,
    pcFallbackPanelStyle,
    pcSectionDividerStyle,
    pcControlBtnStyle,
    pcHelpIconStyle,
    pcTickerStyle
  }
}
