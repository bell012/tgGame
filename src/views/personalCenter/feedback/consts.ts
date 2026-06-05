import { normalizeDisplayCurrencyCode } from '@/composables/useDisplayCurrency'
import { formatTimestamp } from '@/utils/date'

export type FeedbackStatus = 'accepted' | 'pending' | 'rejected'

type FeedbackApiRecord = Record<string, unknown>

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
  const normalizedNumber = Number(normalizedText)
  if (normalizedNumber === 1) {
    return 'accepted'
  }
  if (normalizedNumber === 0) {
    return 'pending'
  }
  return 'pending'
}

export const formatFeedbackSubmitTime = (value: unknown) =>
  formatTimestamp(value as number | string | null)

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

const FEEDBACK_REWARD_AMOUNT_KEYS = [
  'balance',
  'unReceiveAmount',
  'unreceiveAmount',
  'rewardAmount',
  'totalReward',
  'amount',
  'reward',
  'bonus',
  'bonusAmount'
]

const FEEDBACK_LIST_KEYS = ['feedbacks', 'feedbackList', 'list', 'records', 'data', 'items']

const pickFiniteNumber = (value: unknown) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

const pickFirstNumber = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const amount = pickFiniteNumber(record[key])
    if (amount !== null && amount >= 0) {
      return amount
    }
  }
  return null
}

/** 已知前后端币种编码不一致时追加映射，不枚举站点支持币种 */
const FEEDBACK_CURRENCY_ALIASES: Record<string, string> = {
  RMB: 'CNY'
}

export const normalizeFeedbackCurrencyCode = (value: unknown) => {
  const normalized = normalizeDisplayCurrencyCode(value)
  return FEEDBACK_CURRENCY_ALIASES[normalized] ?? normalized
}

/** 反馈接口请求体：languageCode 为当前用户币种（与 memberCurrency 对齐） */
export const buildFeedbackCurrencyRequest = (currencyCode: unknown) => {
  const languageCode = normalizeFeedbackCurrencyCode(currencyCode)
  return { languageCode } as const
}

const isFeedbackMemberCurrencyMatch = (
  record: Record<string, unknown>,
  userCurrencyCode: string
) => {
  const normalizedUserCurrency = normalizeFeedbackCurrencyCode(userCurrencyCode)
  if (!normalizedUserCurrency) {
    return false
  }

  return normalizeFeedbackCurrencyCode(record.currency) === normalizedUserCurrency
}

const isTruthyReceiveFlag = (value: unknown) => {
  if (value === true || value === 1 || value === '1') {
    return true
  }

  const normalizedText = String(value ?? '')
    .trim()
    .toLowerCase()

  return normalizedText === 'true' || normalizedText === 'yes'
}

const isReceivedStatusValue = (value: unknown) => {
  if (isTruthyReceiveFlag(value)) {
    return true
  }

  const normalizedText = String(value ?? '')
    .trim()
    .toLowerCase()

  return normalizedText === 'received' || normalizedText === 'claimed' || normalizedText === 'done'
}

const isFeedbackRewardReceived = (record: Record<string, unknown>) => {
  if (isTruthyReceiveFlag(record.isReceive) || isTruthyReceiveFlag(record.received)) {
    return true
  }

  if (isReceivedStatusValue(record.receiveStatus) || isReceivedStatusValue(record.claimStatus)) {
    return true
  }

  return false
}

const getFeedbackItemClaimableReward = (item: unknown, userCurrencyCode: string) => {
  if (!item || typeof item !== 'object') {
    return 0
  }

  const record = item as Record<string, unknown>

  if (!isFeedbackMemberCurrencyMatch(record, userCurrencyCode)) {
    return 0
  }

  const balance = pickFiniteNumber(record.balance)
  if (balance === null || balance <= 0) {
    return 0
  }

  if (isFeedbackRewardReceived(record)) {
    return 0
  }

  if (normalizeFeedbackStatus(record.status) !== 'accepted') {
    return 0
  }

  return balance
}

const sumFeedbackListClaimableReward = (items: FeedbackApiRecord[], userCurrencyCode: string) => {
  return items.reduce<number>(
    (total, item) => total + getFeedbackItemClaimableReward(item, userCurrencyCode),
    0
  )
}

export const extractFeedbackList = (result: unknown): FeedbackApiRecord[] => {
  if (Array.isArray(result)) {
    return result as FeedbackApiRecord[]
  }

  if (!result || typeof result !== 'object') {
    return []
  }

  const record = result as FeedbackApiRecord

  for (const key of FEEDBACK_LIST_KEYS) {
    const list = record[key]
    if (Array.isArray(list)) {
      return list as FeedbackApiRecord[]
    }
  }

  return []
}

const getFeedbackItemSortTime = (item: object) => {
  const record = item as Record<string, unknown>
  const createTime = Number(record.createTime)
  return Number.isFinite(createTime) && createTime > 0 ? createTime : 0
}

const getFeedbackItemSortRowId = (item: object) => {
  const record = item as Record<string, unknown>
  const rowId = Number(record.rowId)
  return Number.isFinite(rowId) ? rowId : 0
}

export const sortFeedbackItemsByNewest = <T extends object>(items: T[]) => {
  return [...items].sort((a, b) => {
    const timeDiff = getFeedbackItemSortTime(b) - getFeedbackItemSortTime(a)
    if (timeDiff !== 0) {
      return timeDiff
    }

    return getFeedbackItemSortRowId(b) - getFeedbackItemSortRowId(a)
  })
}

export const extractFeedbackClaimRewardAmount = (
  result: unknown,
  userCurrencyCode: string
): number => {
  const items = Array.isArray(result)
    ? (result as FeedbackApiRecord[])
    : extractFeedbackList(result)

  return sumFeedbackListClaimableReward(items, userCurrencyCode)
}

export const extractClaimedFeedbackAmount = (result: unknown): number => {
  if (typeof result === 'number') {
    return Math.max(result, 0)
  }

  if (typeof result === 'string') {
    const amount = pickFiniteNumber(result)
    return amount !== null && amount >= 0 ? amount : 0
  }

  if (!result || typeof result !== 'object') {
    return 0
  }

  return pickFirstNumber(result as Record<string, unknown>, FEEDBACK_REWARD_AMOUNT_KEYS) ?? 0
}

export const formatFeedbackRewardAmount = (amount: number) => {
  return Math.max(amount, 0).toFixed(2)
}

export const getFeedbackItemRewardAmount = (item: unknown) => {
  if (!item || typeof item !== 'object') {
    return 0
  }

  return pickFirstNumber(item as Record<string, unknown>, FEEDBACK_REWARD_AMOUNT_KEYS) ?? 0
}

export const getFeedbackAcceptedReplyContent = (
  t: FeedbackTranslate,
  params: { topic: string; rewardAmount: number; currency?: string }
) => {
  const rewardAmountText =
    params.rewardAmount > 0
      ? Number.isInteger(params.rewardAmount)
        ? String(params.rewardAmount)
        : formatFeedbackRewardAmount(params.rewardAmount)
      : '10'
  const currency =
    String(params.currency ?? '').trim() || t('personalCenter.feedback.reply.rewardCurrency')

  return [
    t('personalCenter.feedback.reply.acceptedIntro', { topic: params.topic }),
    t('personalCenter.feedback.reply.acceptedBody'),
    t('personalCenter.feedback.reply.acceptedReward', {
      rewardAmount: rewardAmountText,
      currency
    })
  ]
}

export const getFeedbackUploadFileName = (file: Blob | File, index: number) => {
  const fallbackName = `feedback_${Date.now()}_${index}.jpg`
  const originalFileName = file instanceof File ? file.name.trim() : fallbackName
  const sanitizedFileName = (originalFileName || fallbackName).replace(/[\\/:*?"<>|\r\n]+/g, '_')
  const normalizedFileName = sanitizedFileName || fallbackName

  if (/\.(jpe?g|png|webp|gif)$/i.test(normalizedFileName)) {
    return normalizedFileName.replace(/\.[^.]+$/i, '.jpg')
  }

  return `${normalizedFileName}.jpg`
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
    replyContent: []
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
