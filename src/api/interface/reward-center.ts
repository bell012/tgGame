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
  /** 待领取奖励类型，见 REWARD_CENTER_ACTIVITY_CODE */
  activityCode?: number
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
}

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
