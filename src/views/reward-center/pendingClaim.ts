import Api from '@/api'
import type { ObtainTaskAmountForm } from '@/api/interface/task'
import type { RewardCenterApiResponse, RewardCenterRecord } from '@/api/interface/reward-center'

/** 待领取奖励 activityCode */
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
  TASK: 16,
  ENTRANT_TASK: 17
} as const

/** 单条领取必须带 rowId 的 activityCode */
export const ROW_ID_REQUIRED_ACTIVITY_CODES = new Set<number>([
  REWARD_CENTER_ACTIVITY_CODE.REBATE,
  REWARD_CENTER_ACTIVITY_CODE.RECHARGE,
  REWARD_CENTER_ACTIVITY_CODE.CHECK_IN,
  REWARD_CENTER_ACTIVITY_CODE.RESCUE,
  REWARD_CENTER_ACTIVITY_CODE.AGENT_COMMISSION,
  REWARD_CENTER_ACTIVITY_CODE.REBATE_CASHBACK,
  REWARD_CENTER_ACTIVITY_CODE.VIP_DAY,
  REWARD_CENTER_ACTIVITY_CODE.VIP_WEEK,
  REWARD_CENTER_ACTIVITY_CODE.VIP_MONTH,
  REWARD_CENTER_ACTIVITY_CODE.VIP_UPGRADE,
  REWARD_CENTER_ACTIVITY_CODE.TASK,
  REWARD_CENTER_ACTIVITY_CODE.ENTRANT_TASK
])

/** 已对接单条领取接口的 activityCode（不含已下线的 15 赛事） */
export const SUPPORTED_PENDING_CLAIM_ACTIVITY_CODES = [
  REWARD_CENTER_ACTIVITY_CODE.REBATE,
  REWARD_CENTER_ACTIVITY_CODE.RECHARGE,
  REWARD_CENTER_ACTIVITY_CODE.CHECK_IN,
  REWARD_CENTER_ACTIVITY_CODE.RESCUE,
  REWARD_CENTER_ACTIVITY_CODE.AGENT_COMMISSION,
  REWARD_CENTER_ACTIVITY_CODE.REBATE_CASHBACK,
  REWARD_CENTER_ACTIVITY_CODE.VIP_DAY,
  REWARD_CENTER_ACTIVITY_CODE.VIP_WEEK,
  REWARD_CENTER_ACTIVITY_CODE.VIP_MONTH,
  REWARD_CENTER_ACTIVITY_CODE.VIP_UPGRADE,
  REWARD_CENTER_ACTIVITY_CODE.TASK,
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

export class RewardCenterClaimMissingRowIdError extends Error {
  readonly activityCode: number

  constructor(activityCode: number) {
    super(`Missing rowId for reward center activityCode: ${activityCode}`)
    this.name = 'RewardCenterClaimMissingRowIdError'
    this.activityCode = activityCode
  }
}

export const isSupportedPendingClaimActivityCode = (
  activityCode: number
): activityCode is SupportedPendingClaimActivityCode =>
  SUPPORTED_PENDING_CLAIM_ACTIVITY_CODES.includes(activityCode as SupportedPendingClaimActivityCode)

const buildRowClaimPayload = (rowId: string | number) => ({ rowId })

const buildObtainTaskAmountPayload = (record: RewardCenterRecord): ObtainTaskAmountForm => ({
  rowId: record.rowId!
})

export const claimPendingBonus = async (
  record: RewardCenterRecord
): Promise<RewardCenterApiResponse> => {
  const activityCode = record.activityCode

  if (activityCode == null) {
    throw new RewardCenterClaimNotSupportedError(-1)
  }

  if (ROW_ID_REQUIRED_ACTIVITY_CODES.has(activityCode)) {
    if (record.rowId == null || record.rowId === '') {
      throw new RewardCenterClaimMissingRowIdError(activityCode)
    }
  }

  switch (activityCode) {
    case REWARD_CENTER_ACTIVITY_CODE.REBATE:
      return Api.rewardCenter.obtainActivityReward(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.RECHARGE:
      return Api.rewardCenter.obtainRechargeActivityReward(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.CHECK_IN:
      return Api.rewardCenter.signActivity(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.RESCUE:
      return Api.rewardCenter.receiveReliefFunds(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.AGENT_COMMISSION:
      return Api.rewardCenter.obtainAgentRebateActivityReward(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.REBATE_CASHBACK:
      return Api.user.obtainRebate(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.VIP_DAY:
      return Api.vip.dayPoints(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.VIP_WEEK:
      return Api.vip.weekPoints(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.VIP_MONTH:
      return Api.vip.monthPoints(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.VIP_UPGRADE:
      return Api.vip.upgradedPoints(buildRowClaimPayload(record.rowId!))
    case REWARD_CENTER_ACTIVITY_CODE.TASK:
      return Api.task.obtainTaskAmount(buildObtainTaskAmountPayload(record))
    case REWARD_CENTER_ACTIVITY_CODE.ENTRANT_TASK:
      return Api.task.obtainEntrantTaskAmount({ rowId: record.rowId! })
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
