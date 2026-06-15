export type TicketTaskTranslate = (key: string, params?: Record<string, unknown>) => string

export interface HelpSection {
  title: string
  content: string
}

export type TaskStatus = 'action' | 'completed'
export type TaskActionType =
  | 'deposit'
  | 'invite'
  | 'add'
  | 'complete'
  | 'link'
  | 'wagering'
  | 'loss'

export interface TaskItem {
  id: string
  title: string
  progress: number
  status: TaskStatus
  actionLabel: string
  actionType?: TaskActionType
  description?: string
  descriptionTitle?: string
  helpSections?: HelpSection[]
}

export interface ProgressTaskOptions {
  id: string
  title: string
  current?: number
  target?: number
  operator?: string
  actionType: TaskActionType
  pendingLabel: string
  completedLabel: string
  description?: string
  descriptionTitle?: string
  helpSections?: HelpSection[]
}

export interface StatusTaskOptions {
  id: string
  title: string
  satisfied: boolean | undefined
  actionType: TaskActionType
  pendingLabel?: string
  completedLabel: string
  description?: string
  descriptionTitle?: string
  helpSections?: HelpSection[]
}

export interface BuildTaskItemsOptions {
  t: TicketTaskTranslate
  locale?: string
}

export const TASK_I18N_PREFIX = 'ticketPage.taskPop'
