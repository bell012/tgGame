import { closeTicketDialog } from '../../../shell/ticketDialog'
import { closeTicketToast } from '../../../shell/ticketToast'
import { navigateTo } from '@/utils/router'

export function goTicketDeposit() {
  closeTicketDialog()
  closeTicketToast()
  navigateTo('/deposit')
}
