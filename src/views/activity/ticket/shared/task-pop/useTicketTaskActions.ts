import { navigateTo } from '@/utils/router'
import { closeTicketToast } from '../../shell/ticketToast'
import type { TaskItem } from './types'

const getTicketTaskActionPath = (task: TaskItem) => {
  if (task.actionType === 'invite') return '/referral'
  if (task.actionType === 'add') return '/payment-methods'
  if (task.actionType === 'link') return '/security'
  if (task.actionType === 'complete') return '/security'
  if (task.actionType === 'wagering' || task.actionType === 'loss') return '/casino'
  return '/deposit'
}

export const useTicketTaskActions = (close: () => void) => {
  const handleTaskAction = async (task: TaskItem) => {
    await navigateTo(getTicketTaskActionPath(task))
    close()
    closeTicketToast()
  }

  return {
    handleTaskAction
  }
}
