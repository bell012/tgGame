import {
  closeTicketDialog,
  globalTicketDialogState
} from '@/views/activity/ticket/shell/ticketDialog'
import { TICKET_RESULT_CARDS_VARIANTS } from '../constants'
import { computed } from 'vue'

export function useTicketResultCardsDialog() {
  const dialogState = globalTicketDialogState

  const visible = computed(
    () =>
      dialogState.kind === 'result' &&
      (TICKET_RESULT_CARDS_VARIANTS as readonly string[]).includes(dialogState.result.variant)
  )
  const result = computed(() => dialogState.result)

  const close = () => {
    closeTicketDialog()
  }

  return { visible, result, close }
}
