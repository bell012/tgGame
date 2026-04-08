import screenshot1 from '@/static/img/recent/img_1.png'
import screenshot2 from '@/static/img/recent/img_2.png'
import screenshot3 from '@/static/img/recent/img_3.png'
import screenshot4 from '@/static/img/recent/img_4.png'

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

export const feedbackMockRecords: FeedbackRecord[] = [
  {
    recordId: 'record-accepted',
    ticketNo: '94880',
    content:
      '进一步加强反作弊措施，列如监控多开账号或者异常投注行为。进一步加强反作弊措施，列如监控多开账号或者异常投注行为。',
    status: 'accepted',
    submitTime: '12/18/2026 11:14:15 AM',
    feedbackType: '反馈类型',
    detailContent:
      '我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案。',
    screenshotImages: [screenshot1, screenshot2, screenshot3, screenshot4],
    resultHint: '您的建议已被采纳，并为您发放奖励，感谢您的支持！',
    replyTeam: '运营团队',
    replyTime: '12/18/2026 11:14:15 AM',
    replyContent: [
      '您好，感谢您在时间反馈有关 “xxxx” 的建议。',
      '我们已将该问题列入开发的重点工作，接下来将加强后台监控和数据分析能力，以识别和阻止异常行为。同时，计划推出举报系统，让玩家可以更加便捷地帮助我们维护游戏环境的公平与公正。',
      '为了感谢您的支持与贡献，我们特别为您送上10游戏元作为奖励，请去意见反馈-我的反馈领取！'
    ]
  },
  {
    recordId: 'record-pending',
    ticketNo: '94880',
    content:
      '进一步加强反作弊措施，列如监控多开账号或者异常投注行为。进一步加强反作弊措施，列如监控多开账号或者异常投注行为。',
    status: 'pending',
    submitTime: '12/19/2026 09:36:08 AM',
    feedbackType: '反馈类型',
    detailContent:
      '我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案。',
    screenshotImages: [screenshot1, screenshot2, screenshot3, screenshot4],
    resultHint: '您的建议已提交，正在处理中，请耐心等待。',
    replyTeam: '运营团队',
    replyTime: '12/19/2026 09:36:08 AM',
    replyContent: ['您好，您的反馈已经收到，我们会尽快处理并给您回复。']
  },
  {
    recordId: 'record-rejected',
    ticketNo: '94880',
    content:
      '进一步加强反作弊措施，列如监控多开账号或者异常投注行为。进一步加强反作弊措施，列如监控多开账号或者异常投注行为。',
    status: 'rejected',
    showDot: true,
    submitTime: '12/19/2026 10:24:33 AM',
    feedbackType: '反馈类型',
    detailContent:
      '我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案我是反馈文案。',
    screenshotImages: [screenshot1, screenshot2, screenshot3, screenshot4],
    resultHint: '感谢您的建议，本次暂未采纳，欢迎继续反馈更多想法。',
    replyTeam: '运营团队',
    replyTime: '12/19/2026 10:24:33 AM',
    replyContent: ['您好，已评估本次建议，当前版本暂不支持，感谢您的理解与支持。']
  }
]
