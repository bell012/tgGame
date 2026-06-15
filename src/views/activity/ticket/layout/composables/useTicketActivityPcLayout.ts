import { TICKET_ACTIVITY_Z } from '../../shared/constants'
import { LUCKY_SPIN_TOKENS } from '../../shared/design-tokens'
import { TICKET_PC_LAYOUT } from '../../shared/layout-tokens/ticketPcLayout'
import { computed, ref } from 'vue'

export function useTicketActivityPcLayout() {
  const rightPanelRef = ref<HTMLElement | null>(null)

  const modalOverlayStylePc = computed(() => ({
    zIndex: TICKET_ACTIVITY_Z.modal,
    backdropFilter: `blur(${TICKET_PC_LAYOUT.overlayBlur})`,
    WebkitBackdropFilter: `blur(${TICKET_PC_LAYOUT.overlayBlur})`
  }))

  const modalOverlayStyleMobile = computed(() => ({
    zIndex: TICKET_ACTIVITY_Z.modal,
    backdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`,
    WebkitBackdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
  }))

  const pcStackStyle = computed(() => ({
    width: `${TICKET_PC_LAYOUT.modalMaxWidth}px`,
    maxWidth: `${TICKET_PC_LAYOUT.modalMaxWidth}px`
  }))

  const pcModalBodyStyle = {
    width: `${TICKET_PC_LAYOUT.modalMaxWidth}px`,
    height: `${TICKET_PC_LAYOUT.modalBodyHeight}px`,
    minHeight: `${TICKET_PC_LAYOUT.modalBodyHeight}px`
  }

  const pcModalShellStyle = computed(() => ({
    borderRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
    boxShadow: TICKET_PC_LAYOUT.modalShadow
  }))

  const pcLeftPanelStyle = computed(() => ({
    background: TICKET_PC_LAYOUT.shellMask.bg,
    borderTopLeftRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
    borderBottomLeftRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
    paddingTop: `${TICKET_PC_LAYOUT.leftPanel.paddingTop}px`,
    paddingRight: `${TICKET_PC_LAYOUT.leftPanel.paddingRight}px`,
    paddingBottom: `${TICKET_PC_LAYOUT.leftPanel.paddingBottom}px`,
    paddingLeft: `${TICKET_PC_LAYOUT.leftPanel.paddingLeft}px`
  }))

  const pcLeftPanelSyncedStyle = computed(() => ({
    ...pcLeftPanelStyle.value,
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
    modalOverlayStylePc,
    modalOverlayStyleMobile,
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
