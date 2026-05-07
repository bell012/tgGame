/**
 * 代理相关接口类型定义
 */

/**
 * 通用代理接口响应
 */
export interface AgentApiResponse<TResult = unknown> {
  code: string
  message: string
  success?: boolean
  result?: TResult
}

/**
 * 任务配置 - 邀请注册奖励项
 */
export interface QueryTaskRewardFriendItem {
  id?: string
  min?: number | string
  max?: number | string
  reward?: number | string
  achieved?: boolean
  status?: number | string
}

/**
 * 任务配置 - 累计充值奖励项
 */
export interface QueryTaskRewardRechargeItem {
  id?: string
  amount?: number | string
  reward?: number | string
  achieved?: boolean
  status?: number | string
}

/**
 * 任务配置 - 佣金加成奖励项
 */
export interface QueryTaskRewardIncreaseItem {
  id?: string
  rebate?: number | string
  amount?: number | string
  achieved?: boolean
  status?: number | string
}

/**
 * 任务配置 - 钱包奖励项
 */
export interface QueryTaskRewardWalletItem {
  id?: string
  people?: number | string
  amount?: number | string
  achieved?: boolean
  status?: number | string
}

/**
 * 任务配置主体
 */
export interface QueryTaskRewardConfig {
  friendList?: QueryTaskRewardFriendItem[]
  rechargeList?: QueryTaskRewardRechargeItem[]
  increaseList?: QueryTaskRewardIncreaseItem[]
  recommendedWallet?: QueryTaskRewardWalletItem[]
  validInviteRechargeAmount?: number | string
  validInviteBetAmount?: number | string
  inviteRechargeAmount?: number | string
  inviteBetAmount?: number | string
  resetCountdown?: string
  countdown?: string
  countDown?: string
  resetType?: number | string
  rewardType?: number | string
  [key: string]: unknown
}

/**
 * 查询任务奖励配置结果
 */
export interface QueryTaskRewardConfigResult {
  config?: QueryTaskRewardConfig
  rewardType?: number | string
  resetType?: number | string
  resetCountdown?: string
  countdown?: string
  countDown?: string
  validInviteRechargeAmount?: number | string
  validInviteBetAmount?: number | string
  inviteRechargeAmount?: number | string
  inviteBetAmount?: number | string
  lastUpdatedBy?: string
  lastUpdatedTime?: number
  obtainType?: number[]
  rewardTypeName?: string
  rowId?: number
  site?: string
  [key: string]: unknown
}

/**
 * 查询任务奖励配置响应
 */
export interface QueryTaskRewardConfigResponse extends AgentApiResponse<QueryTaskRewardConfigResult> {}
