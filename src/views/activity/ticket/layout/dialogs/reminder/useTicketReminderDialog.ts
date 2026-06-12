import { closeTicketDialog, globalTicketDialogState } from '../../../shell/ticketDialog'
import TicketReminderTasksContent from './TicketReminderTasksContent.vue'
import TicketTaskSuccessContent from './TicketTaskSuccessContent.vue'
import type { Component } from 'vue'
import { computed } from 'vue'

export function useTicketReminderDialog() {
  const dialogState = globalTicketDialogState

  const visible = computed(
    () => dialogState.kind === 'reminder' || dialogState.kind === 'task_success'
  )

  const contentComponent = computed<Component | null>(() => {
    if (dialogState.kind === 'task_success') return TicketTaskSuccessContent
    if (dialogState.kind === 'reminder') return TicketReminderTasksContent
    return null
  })

  const rules = computed(() =>
    dialogState.kind === 'task_success' ? dialogState.taskSuccess.rules : dialogState.reminder.rules
  )

  const close = () => {
    closeTicketDialog()
  }

  return { visible, contentComponent, rules, close }
}
