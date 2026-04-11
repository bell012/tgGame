/**
 * 用户信息相关接口类型定义
 */

/**
 * 查询账户信息请求参数
 */
export interface QueryAcctInfoForm {}

/**
 * 查询账户信息响应结果
 */
export interface QueryAcctInfoResult {
  balance: number
  balanceBrl: number
  balanceCny: number
  balanceIdr: number
  balanceInr: number
  balanceJpy: number
  balanceKrw: number
  balanceMxn: number
  balanceMyr: number
  balancePhp: number
  balanceSgd: number
  balanceUsd: number
  balanceUsdt: number
  balanceVnd: number
  currency: string
  memberId: string
  memberRowId: number
  site: string
}

/**
 * 查询账户信息响应
 */
export interface QueryAcctInfoResponse {
  code: string
  message: string
  success: boolean
  result?: QueryAcctInfoResult
}

/**
 * 查询会员信息请求参数
 */
export interface SelectMemberForm {
  memberId: string // 会员ID
}

/**
 * 查询会员信息响应结果
 */
export interface SelectMemberResult {
  areaCode: string
  balanceBrl: number
  balanceCny: number
  balanceIdr: number
  balanceInr: number
  balanceJb: number
  balanceJpy: number
  balanceKrw: number
  balanceMxn: number
  balanceMyr: number
  balancePhp: number
  balanceSgd: number
  balanceUsd: number
  balanceUsdt: number
  balanceVnd: number
  betAmount: number
  channelId: string
  checkTransactionPwd: number
  createTime: number
  currency: string
  currentScore: number
  depositAmount: number
  depositFirstAmount: number
  depositNumber: number
  downloadSite: string
  frozen: number
  isManualSetting: number
  isReturn: number
  lastObtainedVipId: number
  levelId: number
  linkCode: string
  loginDate: number
  loginTimes: number
  loginTraceid: string
  headPortrait?: string
  memberId: string
  memberPwd: string
  nickName: string
  rechargeAmount: number
  registerAddress: string
  registerIp: string
  rowId: number
  score: number
  site: string
  telephone: string
  totalQuotaBalance: number
  traceId: string
  tradeToken: string
  updateTime: number
  vipId: number
  visitor: number
  withdrawAmount: number
  withdrawNumber: number
  busiPwd: string // 交易密码
}

/**
 * 查询会员信息响应
 */
export interface SelectMemberResponse {
  code: string
  message: string
  success: boolean
  result?: SelectMemberResult
}

/**
 * 修改会员信息请求参数
 */
export interface ModifyMemberInfoForm {
  nickName?: string
  headPortrait?: string
  memberPwd?: string // 新会员密码
  busiPwd?: string //新交易密码
}

/**
 * 修改会员信息响应结果
 */
export interface ModifyMemberInfoResult {
  [key: string]: unknown
}

/**
 * 修改会员信息响应
 */
export interface ModifyMemberInfoResponse {
  code: string
  message: string
  success: boolean
  result?: ModifyMemberInfoResult | string | boolean
}

//  游戏下注信息统计 请求参数
export interface GameBetTotalForm {}

//  游戏下注信息统计 响应结果
export interface GameBetTotalResult {
  betAmount: number
  total: number
  win: string
  list: Array<{
    betAmount: number
    platformCode: string
    itemCode: string
  }>
}

// 游戏下注信息统计 响应
export interface GameBetTotalResponse {
  code: string
  message: string
  success: boolean
  result?: GameBetTotalResult
}
//  修改会员手机号码 请求参数
export interface ModifyMemberTelePhoneForm {
  telephone: string // 手机号码
  areaCode: string // 区号
  smsCode: string // 短信验证参数
  phoneBindStatus: number // 是否初次绑定(绑定)手机号 0:不是，1:是
}

// 修改会员手机号码 响应
export interface ModifyMemberTelePhoneResponse {
  code: string
  message: string
  success: boolean
}

// 提交意见反馈 请求参数
export interface SendFeedbackForm {
  feedbackType: string // 反馈类型
  content: string // 反馈内容
  imgs: string[] // 图片路径列表
}

// 提交意见反馈 响应
export interface SendFeedbackResponse {
  code: string
  message: string
  success: boolean
  result?: unknown
}

// 查询我的反馈列表 请求参数
export interface QueryFeedbacksForm {}

// 查询我的反馈列表 响应结果
export interface QueryFeedbackItem {
  channelId?: string
  content?: string
  createTime?: number
  downloadSite?: string
  feedbackType?: number | string
  imgs?: string[]
  memberCurrency?: string
  memberId?: string
  memberRowId?: number
  rowId?: number | string
  site?: string
  status?: number | string
}

// 查询我的反馈列表 响应
export interface QueryFeedbacksResponse {
  code: string
  message: string
  success: boolean
  result?: QueryFeedbackItem[]
}

// 一键领取反馈奖励 请求参数
export interface ReceiveAllFeedbackForm {}

// 一键领取反馈奖励 响应
export interface ReceiveAllFeedbackResponse {
  code: string
  message: string
  success: boolean
  result?: unknown
}
