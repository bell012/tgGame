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
  /** 列表项唯一 key（优先 activityId，无 activityId 时 fallback） */
  listId?: string
  /** 待领取接口 activityId，领取时作为 rowId 传给领取接口 */
  rowId?: string | number
  /** 待领取奖励类型，见 REWARD_CENTER_ACTIVITY_CODE */
  activityCode?: number
  activityName?: string
  fallbackActivityName?: string
  /** 0 积分，1 现金 */
  moneyType?: number
  rewardAmount?: number
  /** 领取时间（已领取） */
  claimTime?: number
  /** 创建/发放时间 */
  createTime?: number
  /** 已领取奖金类型 */
  changeType?: number
  /** 已领取奖金前台显示说明 */
  changeNote?: string
}

export interface RewardCenterLanguageName {
  languageCode: string
  name: string
}

/** /ac/queryBonusAppMultipleCurrencies 单条 bonus */
export interface RewardCenterBonusItem {
  /** 正式数据返回；测试数据可能缺失 */
  activityId?: number
  /** 0 积分，1 现金 */
  moneyType?: number
  activityCode: number
  amount?: number
  startDate?: number
  activityName?: RewardCenterLanguageName[]
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
