/** 奖励中心通用响应结构 */
export interface RewardCenterApiResponse<TResult = unknown> {
  code: string
  message: string
  success?: boolean
  result?: TResult
}

/** 奖励中心单条记录 */
export interface RewardCenterRecord {
  rowId?: string | number
  activityName?: string
  /** 0 固定金额，1 随机金额 */
  rewardType?: number
  rewardAmount?: number
  /** 领取时间（已领取） */
  claimTime?: number
  /** 创建/发放时间 */
  createTime?: number
}

export interface QueryRewardCenterPendingForm {
  page?: {
    current?: number
    size?: number
  }
}

export interface QueryRewardCenterPendingResult {
  totalAmount?: number
  records?: RewardCenterRecord[]
  total?: number
}

export interface QueryRewardCenterPendingResponse extends RewardCenterApiResponse<QueryRewardCenterPendingResult> {}

export interface QueryRewardCenterClaimedForm {
  startTime?: number | null
  endTime?: number | null
  page?: {
    current?: number
    size?: number
  }
}

export interface QueryRewardCenterClaimedResult {
  totalAmount?: number
  records?: RewardCenterRecord[]
  total?: number
}

export interface QueryRewardCenterClaimedResponse extends RewardCenterApiResponse<QueryRewardCenterClaimedResult> {}

export interface ClaimRewardCenterItemForm {
  rowId: string | number
}

export interface ClaimRewardCenterItemResult {
  rewardAmount?: number
  success?: boolean
}

export interface ClaimRewardCenterItemResponse extends RewardCenterApiResponse<ClaimRewardCenterItemResult> {}

export interface ClaimRewardCenterAllForm {}

export interface ClaimRewardCenterAllResult {
  rewardAmount?: number
  success?: boolean
}

export interface ClaimRewardCenterAllResponse extends RewardCenterApiResponse<ClaimRewardCenterAllResult> {}
