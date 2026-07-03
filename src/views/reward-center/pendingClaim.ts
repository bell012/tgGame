import Api from '@/api'
import type { RewardCenterApiResponse } from '@/api/interface/reward-center'

/** 待领取奖励 activityCode（后端说明，部分领取接口待补充） */
export const REWARD_CENTER_ACTIVITY_CODE = {
  REBATE: 4,
  RECHARGE: 5,
  CHECK_IN: 6,
  RESCUE: 8,
  AGENT_COMMISSION: 9,
  REBATE_CASHBACK: 10,
  VIP_DAY: 11,
  VIP_WEEK: 12,
  VIP_MONTH: 13,
  VIP_UPGRADE: 14,
  MATCH: 15,
  TASK: 16,
  ENTRANT_TASK: 17
} as const

/** 当前已对接单条领取接口的 activityCode */
export const SUPPORTED_PENDING_CLAIM_ACTIVITY_CODES = [
  REWARD_CENTER_ACTIVITY_CODE.VIP_DAY,
  REWARD_CENTER_ACTIVITY_CODE.VIP_WEEK,
  REWARD_CENTER_ACTIVITY_CODE.VIP_MONTH,
  REWARD_CENTER_ACTIVITY_CODE.VIP_UPGRADE,
  REWARD_CENTER_ACTIVITY_CODE.ENTRANT_TASK
] as const

export type SupportedPendingClaimActivityCode =
  (typeof SUPPORTED_PENDING_CLAIM_ACTIVITY_CODES)[number]

export class RewardCenterClaimNotSupportedError extends Error {
  readonly activityCode: number

  constructor(activityCode: number) {
    super(`Unsupported reward center activityCode: ${activityCode}`)
    this.name = 'RewardCenterClaimNotSupportedError'
    this.activityCode = activityCode
  }
}

export const isSupportedPendingClaimActivityCode = (
  activityCode: number
): activityCode is SupportedPendingClaimActivityCode =>
  SUPPORTED_PENDING_CLAIM_ACTIVITY_CODES.includes(activityCode as SupportedPendingClaimActivityCode)

export const claimPendingBonusByActivityCode = async (
  activityCode: number
): Promise<RewardCenterApiResponse> => {
  switch (activityCode) {
    case REWARD_CENTER_ACTIVITY_CODE.VIP_DAY:
      return Api.vip.dayPoints({})
    case REWARD_CENTER_ACTIVITY_CODE.VIP_WEEK:
      return Api.vip.weekPoints({})
    case REWARD_CENTER_ACTIVITY_CODE.VIP_MONTH:
      return Api.vip.monthPoints({})
    case REWARD_CENTER_ACTIVITY_CODE.VIP_UPGRADE:
      return Api.vip.upgradedPoints({})
    case REWARD_CENTER_ACTIVITY_CODE.ENTRANT_TASK:
      return Api.task.obtainEntrantTaskAmount({})
    default:
      throw new RewardCenterClaimNotSupportedError(activityCode)
  }
}

export const parsePendingClaimRewardAmount = (
  response: RewardCenterApiResponse<unknown> | undefined,
  fallbackAmount: number
) => {
  const result = response?.result

  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>
    const amount = Number(record.rewardAmount ?? record.amount ?? Number.NaN)

    if (Number.isFinite(amount)) {
      return amount
    }
  }

  return fallbackAmount
}
