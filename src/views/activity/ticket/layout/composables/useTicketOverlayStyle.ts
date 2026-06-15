import { TICKET_ACTIVITY_Z } from '../../shared/constants'
import { LUCKY_SPIN_TOKENS } from '../../shared/design-tokens'
import { TICKET_PC_LAYOUT } from '../../shared/layout-tokens/ticketPcLayout'
import { computed } from 'vue'

export function useTicketOverlayStyle(isMobile: { value: boolean }) {
  const modalOverlayStyle = computed(() => ({
    zIndex: TICKET_ACTIVITY_Z.modal,
    backdropFilter: isMobile.value
      ? `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
      : `blur(${TICKET_PC_LAYOUT.overlayBlur})`,
    WebkitBackdropFilter: isMobile.value
      ? `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
      : `blur(${TICKET_PC_LAYOUT.overlayBlur})`
  }))

  return { modalOverlayStyle }
}
