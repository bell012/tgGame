import type { ActivityListItem, CheckInActivitySignConfigItem } from '@/api/interface/activity'
import checkInBanner from '@/static/img/promotions/check-in.png'
import firstDepositBanner from '@/static/img/promotions/first-Top-up.png'
import cumulativeDepositBanner from '@/static/img/promotions/grand-total.png'
import electronicBanner from '@/static/img/promotions/ordinary.png'
import singleDepositBanner from '@/static/img/promotions/single-transaction.png'
import { resolvePromotionActivityConfig } from './shared'

/** 活动详情版式。列表 type 5 是签到；其余优先按活动名称识别。 */
export type PromotionDetailKind =
  'firstDeposit' | 'singleDeposit' | 'cumulativeDeposit' | 'checkIn' | 'electronic'

export type RechargePromotionDetailKind = Exclude<PromotionDetailKind, 'checkIn' | 'electronic'>

const CHECK_IN_ACTIVITY_TYPE = 5

const NAME_KIND_RULES: Array<{ kind: PromotionDetailKind; pattern: RegExp }> = [
  {
    kind: 'firstDeposit',
    pattern: /首充|first\s*(deposit|top-?up|recharge)|nạp\s*(đầu|lần\s*đầu)/i
  },
  {
    kind: 'singleDeposit',
    pattern: /单笔|single\s*(deposit|top-?up|recharge|transaction)|nạp\s*(một\s*lần|đơn)/i
  },
  {
    kind: 'cumulativeDeposit',
    pattern: /累计充值|cumulative\s*(deposit|top-?up|recharge)|tích\s*lũy/i
  },
  { kind: 'checkIn', pattern: /签到|check-?in|điểm\s*danh/i },
  { kind: 'electronic', pattern: /电子|闯关|slot|electronic/i }
]

export const PROMOTION_DETAIL_BANNERS: Record<PromotionDetailKind, string> = {
  firstDeposit: firstDepositBanner,
  singleDeposit: singleDepositBanner,
  cumulativeDeposit: cumulativeDepositBanner,
  checkIn: checkInBanner,
  electronic: electronicBanner
}

export const isRechargePromotionDetail = (
  kind: PromotionDetailKind | null
): kind is RechargePromotionDetailKind =>
  kind === 'firstDeposit' || kind === 'singleDeposit' || kind === 'cumulativeDeposit'

const collectActivityNames = (activity: ActivityListItem) => {
  const names = [activity.activiName, ...(activity.activityName ?? []).map(item => item.name)]
  return names
    .map(name => String(name ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

export const resolvePromotionDetailKind = (
  activity?: ActivityListItem | null
): PromotionDetailKind | null => {
  if (!activity) {
    return null
  }

  if (Number(activity.type) === CHECK_IN_ACTIVITY_TYPE) {
    return 'checkIn'
  }

  const names = collectActivityNames(activity)
  const matched = NAME_KIND_RULES.find(rule => rule.pattern.test(names))
  return matched?.kind ?? null
}

export interface PromotionRewardTier {
  deposit: number
  reward: number
  /** 接口明确给出完成状态时使用；没有该字段则按已充值金额判断。 */
  completed?: boolean
}

export interface PromotionRewardSummary {
  currency: string
  pendingAmount: number
  tiers: PromotionRewardTier[]
  currentRound: number
  totalRounds: number
  unclaimedCount: number
  depositedAmount: number
}

const readNumber = (source: Record<string, unknown> | undefined, keys: string[]) => {
  if (!source) {
    return undefined
  }

  for (const key of keys) {
    const value = Number(source[key])
    if (Number.isFinite(value)) {
      return value
    }
  }

  return undefined
}

const readTierCompleted = (item: CheckInActivitySignConfigItem) => {
  const raw = item as Record<string, unknown>
  const value = raw.finishStatus ?? raw.completeStatus ?? raw.status
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  if (typeof value === 'boolean') {
    return value
  }
  const number = Number(value)
  return Number.isFinite(number) ? number === 1 : undefined
}

const toTiers = (sign?: CheckInActivitySignConfigItem[]) => {
  if (!Array.isArray(sign)) {
    return []
  }

  return sign
    .map(item => ({
      deposit: Number(item.rechargeAmount ?? 0),
      reward: Number(item.rewardAmount ?? 0),
      completed: readTierCompleted(item)
    }))
    .filter(item => item.deposit > 0 || item.reward > 0)
}

export const getPromotionRewardSummary = (
  activity: ActivityListItem | null | undefined,
  currencyCode?: string
): PromotionRewardSummary => {
  const config = resolvePromotionActivityConfig(activity ?? undefined, currencyCode)
  const extra = config as Record<string, unknown> | undefined
  const tiers = toTiers(config?.sign)
  const currency = String(config?.currency || currencyCode || '').toUpperCase()

  return {
    currency,
    pendingAmount:
      readNumber(extra, ['pendingReward', 'waitReceiveAmount', 'claimableAmount']) ?? 0,
    tiers,
    currentRound: readNumber(extra, ['currentRound', 'currentTimes', 'joinTimes']) ?? 0,
    totalRounds: readNumber(extra, ['signCycle', 'maxRound', 'totalRound']) ?? tiers.length,
    unclaimedCount: readNumber(extra, ['unclaimedCount', 'waitReceiveCount']) ?? tiers.length,
    depositedAmount:
      readNumber(extra, ['totalRechargeAmount', 'rechargeTotal', 'depositedAmount']) ?? 0
  }
}
