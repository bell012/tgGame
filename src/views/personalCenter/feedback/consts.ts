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

export const feedbackStatusTextMap: Record<FeedbackStatus, string> = {
  accepted: '已采纳',
  pending: '待处理',
  rejected: '未采纳'
}

export const feedbackStatusClassMap: Record<FeedbackStatus, string> = {
  accepted: 'text-theme-primary',
  pending: 'text-[#F6AE2D]',
  rejected: 'text-[#FF4D4F]'
}

export const FEEDBACK_UPLOAD_MAX_COUNT = 4
export const FEEDBACK_CLAIM_SUCCESS_TARGET_AMOUNT = 100
export const FEEDBACK_CLAIM_AMOUNT_ANIMATION_DURATION = 680

export const feedbackTypeOptions = [
  { label: '建议', value: '1' },
  { label: '游戏异常', value: '2' },
  { label: '充值问题', value: '3' },
  { label: '其他', value: '4' }
]

const feedbackPlaceholderTexts = [
  '亲爱的玩家，请详细描述您在游戏中遇到的你认为需要改进的问题或者建议，方便我们能给您提供更好的服务',
  '请尽量提供问题发生的时间、操作、功能模块、截图等信息，我们会尽快为您处理。',
  '请详细描述您遇到的问题，如有支付单号请一并提供，我们会尽快为您处理。',
  '请详细描述您遇到的其他问题或需要咨询的事项。'
]

export const getFeedbackPlaceholderText = (selectedType: string) => {
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

export const getFeedbackTypeLabel = (value: unknown) => {
  const normalizedValue = String(value ?? '').trim()
  if (normalizedValue === '1') {
    return '建议'
  }
  if (normalizedValue === '2') {
    return '游戏异常'
  }
  if (normalizedValue === '3') {
    return '充值问题'
  }
  return '其他'
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

export const feedbackDetailTemplates: Record<FeedbackStatus, FeedbackRecord> = {
  accepted: {
    recordId: '',
    ticketNo: '--',
    content: '',
    status: 'accepted',
    submitTime: '--',
    feedbackType: '其他',
    detailContent: '',
    screenshotImages: [],
    resultHint: '您的建议已被采纳，并为您发放奖励，感谢您的支持！',
    replyTeam: '运营团队',
    replyTime: '--',
    replyContent: ['您好，感谢您的反馈，我们已记录并采纳您的建议。']
  },
  pending: {
    recordId: '',
    ticketNo: '--',
    content: '',
    status: 'pending',
    submitTime: '--',
    feedbackType: '其他',
    detailContent: '',
    screenshotImages: [],
    resultHint: '您的建议已提交，正在处理中，请耐心等待。',
    replyTeam: '运营团队',
    replyTime: '--',
    replyContent: []
  },
  rejected: {
    recordId: '',
    ticketNo: '--',
    content: '',
    status: 'rejected',
    submitTime: '--',
    feedbackType: '其他',
    detailContent: '',
    screenshotImages: [],
    resultHint: '感谢您的建议，本次暂未采纳，欢迎继续反馈更多想法。',
    replyTeam: '运营团队',
    replyTime: '--',
    replyContent: ['您好，已评估本次建议，当前版本暂不支持，感谢您的理解与支持。']
  }
}
