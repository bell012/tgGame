export type FeedbackStatus = 'accepted' | 'pending' | 'rejected'

export type FeedbackRecord = {
  recordId: string
  ticketNo: string
  content: string
  status: FeedbackStatus
  showDot?: boolean
  submitTime: string
  feedbackType: string
  detailContent: string
  screenshotImages: string[]
  resultHint: string
  replyTeam: string
  replyTime: string
  replyContent: string[]
}

type FeedbackTranslate = (key: string, params?: Record<string, unknown>) => string

export const getFeedbackStatusTextMap = (t: FeedbackTranslate): Record<FeedbackStatus, string> => ({
  accepted: t('personalCenter.feedback.status.accepted'),
  pending: t('personalCenter.feedback.status.pending'),
  rejected: t('personalCenter.feedback.status.rejected')
})

export const feedbackStatusClassMap: Record<FeedbackStatus, string> = {
  accepted: 'text-theme-primary',
  pending: 'text-[#F6AE2D]',
  rejected: 'text-[#FF4D4F]'
}

export const FEEDBACK_UPLOAD_MAX_COUNT = 4
export const FEEDBACK_CLAIM_SUCCESS_TARGET_AMOUNT = 100
export const FEEDBACK_CLAIM_AMOUNT_ANIMATION_DURATION = 680

export const getFeedbackTypeOptions = (t: FeedbackTranslate) => [
  { label: t('personalCenter.feedback.feedbackType.bugReport'), value: '1' },
  { label: t('personalCenter.feedback.feedbackType.featureSuggestion'), value: '2' },
  { label: t('personalCenter.feedback.feedbackType.otherIssues'), value: '4' }
]

const getFeedbackPlaceholderTexts = (t: FeedbackTranslate) => [
  t('personalCenter.feedback.placeholder.default'),
  t('personalCenter.feedback.placeholder.default'),
  t('personalCenter.feedback.placeholder.default'),
  t('personalCenter.feedback.placeholder.default')
]

export const getFeedbackPlaceholderText = (selectedType: string, t: FeedbackTranslate) => {
  const feedbackPlaceholderTexts = getFeedbackPlaceholderTexts(t)
  const index = Number(selectedType) - 1
  return feedbackPlaceholderTexts[index] || feedbackPlaceholderTexts[0]
}

export const normalizeFeedbackStatus = (value: unknown): FeedbackStatus => {
  const normalizedText = String(value ?? '')
    .trim()
    .toLowerCase()
  if (normalizedText === 'accepted') {
    return 'accepted'
  }
  if (normalizedText === 'pending') {
    return 'pending'
  }
  if (normalizedText === 'rejected') {
    return 'rejected'
  }

  const normalizedNumber = Number(normalizedText)
  if (normalizedNumber === 1) {
    return 'accepted'
  }
  if (normalizedNumber === 0) {
    return 'pending'
  }
  return 'rejected'
}

export const formatFeedbackSubmitTime = (value: unknown) => {
  const timestamp = Number(value)
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return '--'
  }

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  const second = `${date.getSeconds()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export const getFeedbackTypeLabel = (value: unknown, t: FeedbackTranslate) => {
  const normalizedValue = String(value ?? '').trim()
  if (normalizedValue === '1') {
    return t('personalCenter.feedback.feedbackType.bugReport')
  }
  if (normalizedValue === '2') {
    return t('personalCenter.feedback.feedbackType.featureSuggestion')
  }
  if (normalizedValue === '3') {
    return t('personalCenter.feedback.feedbackType.depositIssue')
  }
  return t('personalCenter.feedback.feedbackType.otherIssues')
}

export const getUploadedFeedbackPath = (result: unknown) => {
  if (typeof result === 'string') {
    return result.trim()
  }
  if (!result || typeof result !== 'object') {
    return ''
  }

  const resultRecord = result as Record<string, unknown>
  const candidates = [
    resultRecord.headPortrait,
    resultRecord.url,
    resultRecord.path,
    resultRecord.fileName
  ]
  const target = candidates.find(value => typeof value === 'string' && value.trim())
  return typeof target === 'string' ? target.trim() : ''
}

export const getFeedbackUploadFileName = (file: Blob | File, index: number) => {
  const fallbackName = `feedback_${Date.now()}_${index}`
  const originalFileName = file instanceof File ? file.name.trim() : fallbackName
  const sanitizedFileName = (originalFileName || fallbackName).replace(/[\\/:*?"<>|\r\n]+/g, '_')
  return sanitizedFileName || fallbackName
}

export const getFeedbackDetailTemplates = (
  t: FeedbackTranslate
): Record<FeedbackStatus, FeedbackRecord> => ({
  accepted: {
    recordId: '',
    ticketNo: '--',
    content: '',
    status: 'accepted',
    submitTime: '--',
    feedbackType: t('personalCenter.feedback.feedbackType.otherIssues'),
    detailContent: '',
    screenshotImages: [],
    resultHint: t('personalCenter.feedback.resultHint.accepted'),
    replyTeam: t('personalCenter.feedback.reply.team'),
    replyTime: '--',
    replyContent: [t('personalCenter.feedback.reply.accepted')]
  },
  pending: {
    recordId: '',
    ticketNo: '--',
    content: '',
    status: 'pending',
    submitTime: '--',
    feedbackType: t('personalCenter.feedback.feedbackType.otherIssues'),
    detailContent: '',
    screenshotImages: [],
    resultHint: t('personalCenter.feedback.resultHint.pending'),
    replyTeam: t('personalCenter.feedback.reply.team'),
    replyTime: '--',
    replyContent: []
  },
  rejected: {
    recordId: '',
    ticketNo: '--',
    content: '',
    status: 'rejected',
    submitTime: '--',
    feedbackType: t('personalCenter.feedback.feedbackType.otherIssues'),
    detailContent: '',
    screenshotImages: [],
    resultHint: t('personalCenter.feedback.resultHint.rejected'),
    replyTeam: t('personalCenter.feedback.reply.team'),
    replyTime: '--',
    replyContent: [t('personalCenter.feedback.reply.rejected')]
  }
})
