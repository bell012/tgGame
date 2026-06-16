import type { UseTicketResult } from '@/api/interface/activity'

import { openTicketReceiveDialog } from '../../shell/ticketDialog'

export const openTicketReceivePopFromUseResult = (result: UseTicketResult) => {
  const nextTickets = result.nextTickets ?? []
  if (nextTickets.length === 0) return false

  openTicketReceiveDialog({
    nextTickets
  })

  return true
}
