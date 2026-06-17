import {
  closeTicketDialog,
  globalTicketDialogState,
  openTicketReceiveDialog
} from '@/views/activity/ticket/shell/ticketDialog'
import { TICKET_RESULT_CARDS_VARIANTS, TICKET_RESULT_HERO_VARIANTS } from './constants'
import { computed } from 'vue'

export type TicketResultDialogGroup = 'hero' | 'cards'

export function useTicketResultDialog(group: TicketResultDialogGroup) {
  const dialogState = globalTicketDialogState
  const variants = group === 'hero' ? TICKET_RESULT_HERO_VARIANTS : TICKET_RESULT_CARDS_VARIANTS

  const visible = computed(
    () =>
      dialogState.kind === 'result' &&
      (variants as readonly string[]).includes(dialogState.result.variant)
  )
  const result = computed(() => dialogState.result)

  const close = () => {
    const { variant, nextTickets } = dialogState.result
    console.log('[useTicketResultDialog.close]', {
      group,
      variant,
      nextTickets,
      nextTicketsLength: nextTickets.length,
      result: dialogState.result
    })
    if (variant === 'cash' && nextTickets.length > 0) {
      openTicketReceiveDialog({ nextTickets })
      return
    }
    closeTicketDialog()
  }

  return { visible, result, close }
}
