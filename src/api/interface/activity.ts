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
  channel?: string
  config?: Record<string, CheckInActivityCurrencyConfig | undefined>
  currencyList?: string[]
  endDate?: number
  ended?: boolean
  homeDisplay?: number
  loginAfterPopWay?: number
  loginBeforePopWay?: number
  rowId?: number
  sortNo?: number
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

// 我的票卷 携带参数
export interface MbTicketListForm {
  current: number // 当前页，默认 `1`
  size: number // 每页条数，默认 `10`
  ticketId?: number // 票券模板ID
  rowId?: number // 票券记录ID
  name?: string // 票券名称
  languageCode?: string // 语言编码
  type?: number // 票券类型  1现金兑换卷  2幸运红包卷  3砸金蛋票券  4大转盘票券  5拼多多票券  6盲盒票券
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
  result?: MbTicketListResult
}

// 我的票卷 响应结果
export interface MbTicketListResult {
  createTime: number
  effectTime: number
  enableTrigger: number
  expireTime: number
  goldenEggConfig: [{ amount: number; probability: number; type: number }]
  homeDisplay: number
  languageCodes: [string]
  languageInfo: [
    {
      description: string
      imageUrl: string
      languageCode: string
      name: string
    }
  ]
  platformGameCodes: [string]
  receiveTime: number
  rowId: number
  site: string
  status: number
  ticketId: number
  type: number
  unusedTicketPopWay: number
}

// 票卷记录 携带参数
export interface RecordForm {
  current: number // 当前页，默认 `1`
  size: number // 每页条数，默认 `10`
  ticketId?: number // 票券模板ID
  rowId?: number // 票券记录ID
  name?: string // 票券名称
  languageCode?: string // 语言编码
  type?: number // 票券类型  1现金兑换卷  2幸运红包卷  3砸金蛋票券  4大转盘票券  5拼多多票券  6盲盒票券
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
    }
  ]
  size: number
  total: number
}
