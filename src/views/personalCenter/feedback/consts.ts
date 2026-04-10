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
