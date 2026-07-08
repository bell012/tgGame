/** 奖励中心通用响应结构 */
export interface RewardCenterApiResponse<TResult = unknown> {
  code: string
  message: string
  success?: boolean
  result?: TResult
}

/** 单条 rowId 领取（verifyCode 选填，奖励中心不做短信弹窗） */
export interface RewardCenterRowClaimForm {
  rowId: string | number
  verifyCode?: string
}

/** 奖励中心单条记录 */
export interface RewardCenterRecord {
  /** 列表项唯一 key（优先 rowId，无 rowId 时 fallback） */
  listId?: string
  rowId?: string | number
  /** 待领取奖励类型，见 REWARD_CENTER_ACTIVITY_CODE */
  activityCode?: number
  taskType?: number
  tierNo?: number
  activityName?: string
  /** 0 固定金额，1 随机金额 */
  rewardType?: number
  rewardAmount?: number
  /** 领取时间（已领取） */
  claimTime?: number
  /** 创建/发放时间 */
  createTime?: number
  /** 已领取奖金 changeType，用于无 changeNote 时展示类型文案 */
  changeType?: number
}

/** /ac/queryBonusAppMultipleCurrencies 单条 bonus */
export interface RewardCenterBonusItem {
  activityCode: number
  activityName?: string
  rewardType?: number
  rewardAmount?: number
  amount?: number
  busiAmount?: number
  createTime?: number
  modifyTime?: number
  rowId?: string | number
  taskType?: number
  tierNo?: number
}

export interface RewardCenterClaimResult {
  rewardAmount?: number
  amount?: number
  success?: boolean
}

export type RewardCenterClaimResponse = RewardCenterApiResponse<RewardCenterClaimResult>

export interface QueryRewardCenterPendingForm {
  currency: string
}

export type ClaimRewardCenterAllForm = QueryRewardCenterPendingForm

export interface QueryRewardCenterPendingResult {
  bonus?: RewardCenterBonusItem[]
  sumAmount?: number
}

export interface QueryRewardCenterPendingResponse extends RewardCenterApiResponse<QueryRewardCenterPendingResult> {}

export interface QueryRewardCenterClaimedForm {
  startTime: number | null
  endTime: number | null
  param: {
    currency: string | null
  }
  page: {
    current: number
    size: number
  }
}

export interface ClaimRewardCenterAllResult {
  rewardAmount?: number
  success?: boolean
}

export interface ClaimRewardCenterAllResponse extends RewardCenterApiResponse<ClaimRewardCenterAllResult> {}
