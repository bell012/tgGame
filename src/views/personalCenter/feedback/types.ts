import type { FeedbackStatus } from './consts'

export type FeedbackTab = 'create' | 'mine'

export type FeedbackTypeOption = {
  label: string
  value: string
}

export type FeedbackListItem = {
  recordId: string
  ticketNo: string
  content: string
  status: FeedbackStatus
  showDot?: boolean
  submitTime?: string
  feedbackType?: string
  screenshotImages?: string[]
  detailContent?: string
}
