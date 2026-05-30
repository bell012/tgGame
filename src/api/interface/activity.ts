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
}

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
  rewardTiggerType?: number[]
  [key: string]: unknown
}

/**
 * 活动列表项
 */
export interface ActivityListItem {
  activiName?: string
  activityDesc?: ActivityLanguageTextItem[]
  activityName?: ActivityLanguageTextItem[]
  config?: Record<string, CheckInActivityCurrencyConfig | undefined>
  currencyList?: string[]
  endDate?: number
  ended?: boolean
  rowId?: number
  startDate?: number
  status?: number
  type?: number
  updateTime?: number
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
  rewardType?: number
  ticketId?: number
  type?: number
  languageInfo?: CheckInTicketLanguageInfoItem[]
  [key: string]: unknown
}

/**
 * 签到历史记录项
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
  todayIsSign?: boolean
}

/**
 * 查询签到情况请求参数
 */
export interface QueryCheckInStatusForm {
  activityId: number | string
}

/**
 * 查询签到情况响应
 */
export interface QueryCheckInStatusResponse extends ActivityApiResponse<QueryCheckInStatusResult> {}
