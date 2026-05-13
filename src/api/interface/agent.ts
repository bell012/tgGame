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
 * 任务配置 - 佣金等级项
 */
export interface QueryTaskRewardCommissionItem {
  id?: string
  level?: string
  people?: number | string
  rate?: number | string
  dayTeamBet?: number | string
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
  commissionList?: QueryTaskRewardCommissionItem[]
  betConfigType?: number | string
  betListMap?: Record<string, unknown>
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

/**
 * 查询一级代理预估佣金响应
 */
export interface QueryEstimatedCommissionResponse extends AgentApiResponse<number> {}

/**
 * 查询任务页待领取奖励金额响应
 */
export interface QueryReferralTaskRewardsToClaimResponse extends AgentApiResponse<number> {}

/**
 * 查询一级代理结算周期规则结果
 */
export interface QueryReferralSettlementRuleResult {
  activeBet?: number
  activeRecharge?: number
  limitType?: number
  minBet?: number
  minRecharge?: number
  multipleBets?: number
  platformGameCodes?: string[]
  rowId?: number
  settlementDay?: number | string
  settlementType?: number | string
  site?: string
}

/**
 * 查询一级代理结算周期规则响应
 */
export interface QueryReferralSettlementRuleResponse extends AgentApiResponse<QueryReferralSettlementRuleResult> {}

/**
 * 查询一级代理佣金加码预估佣金响应
 */
export interface QueryReferralCommissionBoostAmountResponse extends AgentApiResponse<number> {}

/**
 * 查询一级代理任务进度结果
 */
export interface QueryReferralTaskProgressResult {
  activeSubNum?: number
  currencyCode?: string
  newSub?: number
  rechargeSubNum?: number
  site?: string
  subBet?: number
  subNum?: number
  subRecharge?: number
  userId?: string
}

/**
 * 查询一级代理任务进度响应
 */
export interface QueryReferralTaskProgressResponse extends AgentApiResponse<QueryReferralTaskProgressResult> {}

/**
 * 推荐详情统计图 - 新增好友数据项
 */
export interface QueryReferralDetailsNewSubItem {
  newSub?: number
  statisticsDate?: number
}

/**
 * 推荐详情统计图 - 有效投注数据项
 */
export interface QueryReferralDetailsSubBetItem {
  statisticsDate?: number
  subBet?: number
}

/**
 * 推荐详情统计图结果
 */
export interface QueryReferralDetailsChartStatsResult {
  newSubList?: QueryReferralDetailsNewSubItem[]
  subBetList?: QueryReferralDetailsSubBetItem[]
}

/**
 * 推荐详情统计图响应
 */
export interface QueryReferralDetailsChartStatsResponse extends AgentApiResponse<QueryReferralDetailsChartStatsResult> {}

/**
 * 推荐详情充值统计结果
 */
export interface QueryReferralDetailsTopUpStatsResult {
  paySubRecharge?: number
  paySubRechargeNum?: number
  subFirstRecharge?: number
  subRecharge?: number
  subRechargeNum?: number
  upaySubRecharge?: number
  upaySubRechargeNum?: number
  usdtSubRecharge?: number
  usdtSubRechargeNum?: number
}

/**
 * 推荐详情充值统计响应
 */
export interface QueryReferralDetailsTopUpStatsResponse extends AgentApiResponse<QueryReferralDetailsTopUpStatsResult> {}

/**
 * 推荐详情领取记录数据项
 */
export interface QueryReferralDetailsClaimHistoryItem {
  activeNum?: number
  amount?: number
  commissionAmount?: number
  creationTime?: number
  currencyCode?: string
  obtainType?: number
  operator?: string
  rowId?: string
  settlementType?: number
  site?: string
  status?: number
  userAccount?: string
  userId?: string
}

/**
 * 推荐详情领取记录结果
 */
export interface QueryReferralDetailsClaimHistoryResult {
  current?: number
  pages?: number
  records?: QueryReferralDetailsClaimHistoryItem[]
  size?: number
  total?: number
}

/**
 * 推荐详情领取记录响应
 */
export interface QueryReferralDetailsClaimHistoryResponse extends AgentApiResponse<QueryReferralDetailsClaimHistoryResult> {}

/**
 * 推荐详情佣金记录数据项
 */
export interface QueryReferralDetailsRewardHistoryItem {
  amount?: number
  commissionAmount?: number
  createTime?: number
  creationTime?: number
  currency?: string
  currencyCode?: string
  rowId?: string | number
  settlementType?: number | string
  statisticsDate?: number
  status?: number | string
  userAccount?: string
  userId?: string
}

/**
 * 推荐详情佣金记录结果
 */
export interface QueryReferralDetailsRewardHistoryResult {
  current?: number
  pages?: number
  records?: QueryReferralDetailsRewardHistoryItem[]
  size?: number
  total?: number
}

/**
 * 推荐详情佣金记录响应
 */
export interface QueryReferralDetailsRewardHistoryResponse extends AgentApiResponse<QueryReferralDetailsRewardHistoryResult> {}
