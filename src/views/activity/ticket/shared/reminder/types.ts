/** Reminder 弹窗任务（MbTicketRecord.triggerList），与 TaskPop 的 TaskItem 独立 */
export interface TicketReminderTask {
  id: string
  title: string
  progress: number
  finished: boolean
  actionType?: 'deposit' | 'bet'
}
