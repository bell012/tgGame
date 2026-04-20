export interface VipListForm {}

// 所有VIP等级信息
export interface VipListItem {
  betAmountLine: number // 打码线
  dayAmount: number
  dayFlag: number
  dayMaxWithdrawalLimit: number
  keepAmount: number // 打码保级线
  keepRechargeAmount: number
  moneyType: number
  monthAmount: number
  monthMoney?: number
  monthFlag: number
  rechargeAmount: number
  rowId: number
  site: string
  upgradedAmount: number
  upgradedMoney?: number
  upgradedFlag: number
  vipId: number
  weekAmount: number
  weekMoney?: number
  weekFlag: number
}

// 所有VIP等级信息 返回
export interface VipListResponse {
  code: string
  message: string
  success: boolean
  result?: VipListItem[] | VipListItem
}

// 会员当前等级 请求
export interface MyVipInfoForm {}

// 会员当前等级信息
export interface MyVipInfoResult {
  betAmount: number
  currentScore: number
  lastObtainedVipId: number
  memberId: string
  memberRowId: number
  rechargeAmount: number
  score: number
  site: string
  vipId: number
}

// 会员当前等级信息 返回
export interface MyVipInfoResponse {
  code: string
  message: string
  success: boolean
  result?: MyVipInfoResult
}

// 会员福利 请求
export interface GetVipInfoForm {}

// 会员福利 响应
export interface GetVipInfoResult {
  dayAmount: number
  dayFlag: number
  dayMoney: number // 每日奖励 金额
  dayState: number // 0:未解锁，1:已开启，2:待领取，3:已领取，4:未达标
  moneyType: number
  monthAmount: number
  monthFlag: number
  monthMoney: number // 每月奖励 金额
  monthState: number // 0:未解锁，1:已开启，2:待领取，3:已领取，4:未达标
  upgradedAmount: number
  upgradedFlag: number
  upgradedMoney: number // 升级奖励 金额
  upgradedState: number // 0:未解锁，1:已开启，2:待领取，3:已领取，4:未达标
  upgradedVipLevels: []
  weekAmount: number
  weekFlag: number
  weekMoney: number // 每周奖励 金额
  weekState: number // 0:未解锁，1:已开启，2:待领取，3:已领取，4:未达标
}

// 会员福利 返回
export interface GetVipInfoResponse {
  code: string
  message: string
  success: boolean
  result?: GetVipInfoResult
}

// 公共响应 返回
export interface CommonResponse {
  code: string
  message: string
  success: boolean
}
