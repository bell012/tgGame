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
