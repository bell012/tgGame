/**
 * 活动通用响应结构
 */
export interface ActivityApiResponse<TResult = unknown> {
  code: string
  message: string
  success?: boolean
  result?: TResult
}

/**
 * 查询活动列表请求参数
 */
export interface QueryActivityListForm {
  size: number
  current: number
  groupCode?: string
  activityId?: number
  activityName?: string
  type?: number
  status?: number[]
  timeStart?: number
  timeEnd?: number
}

/**
 * 活动分组分页查询（新版活动 API §1）
 */
export interface QueryActivityGroupPageForm {
  current?: number
  size?: number
  timeStart?: number
  timeEnd?: number
  activityGroupId?: number
  activityGroupCode?: string
}

/**
 * 活动分组项
 */
export interface ActivityGroupItem {
  rowId?: number
  groupCode?: string
  groupName?: ActivityLanguageTextItem[]
  sortNo?: number
  defaultIcon?: string
  activeIcon?: string
  /** 0-禁用，1-启用 */
  enable?: number
  site?: string
  updateTime?: number
  modifyBy?: string
  activityCount?: number
  /** false-新版分组，true-旧版分组 */
  legacyGroup?: boolean
}

/**
 * 活动跳转配置
 * type: 1-外部跳转，2-内部跳转
 * method: 1-弹窗式，2-二级详情页
 */
export interface ActivityJumpConfig {
  type?: number
  method?: number
  url?: string
}

/**
 * 活动分组分页结果
 */
export interface QueryActivityGroupPageResult {
  current?: number
  pages?: number
  records?: ActivityGroupItem[]
  size?: number
  total?: number
}

export interface QueryActivityGroupPageResponse extends ActivityApiResponse<QueryActivityGroupPageResult> {}

/**
 * 活动多语言名称项
 */
export interface ActivityLanguageTextItem {
  activityNameType?: string
  languageCode?: string
  name?: string
}

/**
 * 签到奖励配置项
 */
export interface CheckInActivitySignConfigItem {
  day?: number
  ticketId?: number
  betAmount?: number
  ticketType?: number
  amountRange?: number[]
  rewardType?: number
  rewardAmount?: number
  rechargeAmount?: number
}

/**
 * 单币种签到配置
 */
export interface CheckInActivityCurrencyConfig {
  sign?: CheckInActivitySignConfigItem[]
  bgLogo?: string
  bgDetailLogo?: string
  bgColor?: string
  ruleDesc?: string
  currency?: string
  signType?: number
  cycleType?: number
  signCycle?: number
  styleType?: number
  rewardType?: number
  conditionRelation?: number | string | null
  rewardTiggerType?: number[]
  [key: string]: unknown
}

/**
 * 活动列表项（新版活动 API §2）
 */
export interface ActivityListItem {
  rowId?: number
  type?: number
  groupCode?: string
  activiName?: string
  activityDesc?: ActivityLanguageTextItem[]
  activityName?: ActivityLanguageTextItem[]
  currencyList?: string[]
  startDate?: number
  endDate?: number
  channel?: string
  level?: number[]
  memberIds?: string[]
  vipLevel?: number[]
  limit?: number[]
  /** 1-内部详情页，2-URL跳转 */
  jumpType?: number
  jumpConfig?: ActivityJumpConfig
  homeDisplay?: number
  loginBeforePopWay?: number
  loginAfterPopWay?: number
  homePopUpUrl?: string
  homeLogo?: string
  homeLogoType?: number
  preImage?: string
  /** "0"-关闭，"1"-开启 */
  applySwitch?: string
  config?: Record<string, CheckInActivityCurrencyConfig | undefined>
  sortNo?: number
  isTop?: number
  status?: number
  site?: string
  createTime?: number
  updateTime?: number
  modifyBy?: string
  ended?: boolean
  [key: string]: unknown
}

/**
 * 查询活动列表结果
 */
export interface QueryActivityListResult {
  current?: number
  pages?: number
  records?: ActivityListItem[]
  size?: number
  total?: number
}

/**
 * 查询活动列表响应
 */
export interface QueryActivityListResponse extends ActivityApiResponse<QueryActivityListResult> {}

/**
 * 签到奖励票券语言信息
 */
export interface CheckInTicketLanguageInfoItem {
  description?: string
  imageUrl?: string
  languageCode?: string
  name?: string
}

/**
 * 签到票券信息
 */
export interface CheckInTicketInfo {
  amount?: number
  currency?: string
  expireTime?: number
  maxAmount?: number
  minAmount?: number
  rewardType?: number
  ticketId?: number
  type?: number
  languageInfo?: CheckInTicketLanguageInfoItem[]
  [key: string]: unknown
}

/**
 * 签到历史记录项
 * signDays 对应签到配置里的 day，用来判断哪一天的奖励卡已经领取。
 */
export interface CheckInHistorySignItem {
  betAmount?: number
  rechargeAmount?: number
  signDays?: number
  ticket?: CheckInTicketInfo
  todayIsSign?: boolean
  todaySignAmount?: number
}

/**
 * 查询签到情况结果
 */
export interface QueryCheckInStatusResult {
  betAmount?: number
  endDate?: number
  historySign?: CheckInHistorySignItem[]
  rechargeAmount?: number
  signDays?: number
  startDate?: number
  ticket?: CheckInTicketInfo
  todayIsSign?: boolean
  todaySignAmount?: number
}

/**
 * 查询签到情况请求参数
 */
export interface QueryCheckInStatusForm {
  activityId: number | string
  verifyCode?: string
}

/**
 * 查询签到情况响应
 */
export interface QueryCheckInStatusResponse extends ActivityApiResponse<QueryCheckInStatusResult> {}

/**
 * 领取签到奖励请求参数
 */
export interface ReceiveCheckInRewardForm {
  activityId: number | string
  verifyCode?: string
}

/**
 * 领取签到奖励结果
 */
export interface ReceiveCheckInRewardResult {
  success?: boolean
  resultCode?: string | Record<string, unknown>
  activityId?: number
  memberRowId?: number
  ticketId?: number
  ticket?: CheckInTicketInfo
  amount?: number
  ext?: Record<string, unknown>
}

/**
 * 领取签到奖励响应
 */
export interface ReceiveCheckInRewardResponse extends ActivityApiResponse<ReceiveCheckInRewardResult> {}

/** 票券多语言信息 */
export interface MbTicketLanguageInfo {
  description?: string
  imageUrl?: string
  languageCode?: string
  name?: string
}

/** 票券金额/次数条件对象 */
export interface TicketThresholdCondition {
  /** 是否启用，0-否，1-是 */
  enabled?: number
  /** 累计类型，1-自领取后累计，2-指定日期后累计，3-历史累计，4-首存 */
  accumulateType?: number
  operator?: string
  amount?: number
  count?: number
  startDate?: number
}

export interface MbTicketRechargeCondition {
  rechargeMethods?: number[]
  depositAmount?: TicketThresholdCondition
  depositCount?: TicketThresholdCondition
}

export interface MbTicketWageringCondition {
  validPlatforms?: string[]
  validBet?: TicketThresholdCondition
}

export interface MbTicketLossCondition {
  gameLossAmount?: TicketThresholdCondition
}

export interface MbTicketInviteCondition {
  inviteFriendCount?: number
}

/** 我的票券单条记录（mbTicketList 数组元素） */
export interface MbTicketRecord {
  rowId?: number
  ticketId?: number
  type?: number
  languageCodes?: string[]
  languageInfo?: MbTicketLanguageInfo[]
  receiveTime?: number
  effectTime?: number
  expireTime?: number
  endUseTime?: number
  status?: number
  createTime?: number
  enableTrigger?: number
  homeDisplay?: number
  unusedTicketPopWay?: number
  site?: string
  currency?: string
  goldenEggConfig?: Array<{ amount: number; probability: number; type: number }>
  platformGameCodes?: string[]
  conditionType?: number[]
  bindData?: TicketProgressBindData
  rechargeCondition?: MbTicketRechargeCondition
  wageringCondition?: MbTicketWageringCondition
  lossCondition?: MbTicketLossCondition
  inviteCondition?: MbTicketInviteCondition
}

/** 票券完成进度请求 */
export interface TicketProgressForm {
  /** 票券记录ID，当前后端实现建议必填 */
  rowId?: number
  /** 票券模板ID */
  ticketId?: number
  verifyCode?: string
}

export interface TicketProgressBindData {
  /** true 已满足，false 未满足 */
  bindWithdrawalAccount?: boolean
  /** true 已满足，false 未满足 */
  bindWithdrawalName?: boolean
}

export interface TicketProgressCompleteInfo {
  completeWhatsapp?: boolean
  completeFacebook?: boolean
  completeTelegram?: boolean
}

export interface TicketProgressCompleteVerification {
  /** true 已完成，false 未完成 */
  verifyPhone?: boolean
}

export interface TicketProgressExt {
  ticketRecordId?: number
  memberRowId?: number
  currency?: string
  ticketType?: number
  claimRechargeAmount?: number
  claimRechargeNum?: number
  claimBetAmount?: number
  claimLossAmount?: number
  invitationNum?: number
  rewardType?: number
  amount?: number
  minAmount?: number
  maxAmount?: number
  rechargeAmount?: number
  rechargeNum?: number
  betAmount?: number
  totalRechargeAmount?: number
  fristRechargeAmount?: number
  totalRechargeNum?: number
  totalBetAmount?: number
  totalLossAmount?: number
}

export interface TicketProgressResult {
  available?: boolean
  bindData?: TicketProgressBindData
  completeInfo?: TicketProgressCompleteInfo
  completeVerification?: TicketProgressCompleteVerification
  ext?: TicketProgressExt
}

export interface TicketProgressResponse extends ActivityApiResponse<
  TicketProgressResult | TicketProgressResult[]
> {}

// 我的票卷 携带参数
export interface MbTicketListForm {
  current?: number // 当前页，默认 `1`
  size?: number // 每页条数，默认 `10`
  ticketId?: number // 票券模板ID
  rowId?: number // 票券记录ID
  name?: string // 票券名称
  languageCode?: string // 语言编码
  type?: number // 票券类型：1现金票券 Cash Voucher 2红包票券 Red Packet Voucher 3砸金蛋票券 Golden Egg Voucher
  // 4转盘票券 Lucky Spin Voucher 6盲盒票券  Mystery Box Voucher
  distributionType?: number // 派发方式  0直接派发  1联动派发
  unusedTicketPopWay?: number // 未使用票券弹窗方式  0不弹窗 1每日一次 2每次登录 3只弹一次 4高频弹窗
  status?: number // 票券记录状态列表  0草稿  1发行中  2已停发  3过期
  startReceiveTime?: number // 领取开始时间
  endReceiveTime?: number // 领取结束时间
  startUseTime?: number // 使用开始时间
  endUseTime?: number // 使用结束时间
  isDefaultConfig?: number // 是否默认配置  0否  1是
}

// 我的票卷 响应
export interface MbTicketListResponse {
  code: string
  message: string
  success: boolean
  result?: MbTicketListResult | MbTicketRecord[]
}

/** @deprecated 使用 MbTicketRecord；保留别名兼容旧引用 */
export type MbTicketListResult = MbTicketRecord

// 票卷记录 携带参数
export interface RecordForm {
  current: number // 当前页，默认 `1`
  size: number // 每页条数，默认 `10`
  ticketId?: number // 票券模板ID
  rowId?: number // 票券记录ID
  name?: string // 票券名称
  languageCode?: string // 语言编码
  type?: number // 票券类型：1现金票券 Cash Voucher 2红包票券 Red Packet Voucher 3砸金蛋票券 Golden Egg Voucher
  // 4转盘票券 Lucky Spin Voucher 6盲盒票券  Mystery Box Voucher
  distributionType?: number // 派发方式  0直接派发  1联动派发
  unusedTicketPopWay?: number // 未使用票券弹窗方式  0不弹窗 1每日一次 2每次登录 3只弹一次 4高频弹窗
  status?: number // 票券记录状态列表  0草稿  1发行中  2已停发  3过期
  startReceiveTime?: number // 领取开始时间
  endReceiveTime?: number // 领取结束时间
  startUseTime?: number // 使用开始时间
  endUseTime?: number // 使用结束时间
  isDefaultConfig?: number // 是否默认配置  0否  1是
}

// 票卷记录 响应
export interface RecordResponse {
  code: string
  message: string
  success: boolean
  result?: RecordResult
}

// 票卷记录 响应结果
export interface RecordResult {
  current: number
  pages: number
  records: [
    {
      amount: number
      createTime: number
      distributionType: number
      expireTime: number
      languageInfo: [{ description: string; imageUrl: string; languageCode: string; name: string }]
      memberId: string
      memberRowId: number
      operateTime: number
      operatorName: string
      receiveTime: number
      rowId: number
      sourceType: number
      status: number
      ticketId: number
      ticketName: string
      ticketType: number
      useTime: number
    }
  ]
  size: number
  total: number
}

import type { LuckySpinInfoResult, LuckySpinResult } from '@/views/activity/ticket/types'

export type {
  LuckySpinInfoResult,
  LuckySpinPrize,
  LuckySpinResult,
  LuckySpinTask,
  LuckySpinVoucherCardData,
  VoucherGameItem,
  WinnerTickerItem
} from '@/views/activity/ticket/types'

export interface QueryLuckySpinInfoForm {
  ticketId?: number
  rowId?: number
}

export interface QueryLuckySpinInfoResponse extends ActivityApiResponse<LuckySpinInfoResult> {}

export interface DoLuckySpinForm {
  ticketId?: number
  rowId?: number
}

export interface DoLuckySpinResponse extends ActivityApiResponse<LuckySpinResult> {}

/** 票券跑马灯请求 */
export interface TicketMarqueeForm {
  ticketType: number
}

export interface TicketMarqueeRecord {
  memberAccount: string
  avatar: string
  amountDisplay: string
  winTime: number
}

export interface TicketMarqueeResult {
  enabled: boolean
  records: TicketMarqueeRecord[]
}

export interface QueryTicketMarqueeResponse extends ActivityApiResponse<TicketMarqueeResult> {}
