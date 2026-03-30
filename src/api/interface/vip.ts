export interface VipListForm {}

// 所有VIP等级信息
export interface VipListItem {
  betAmountLine: number
  dayAmount: number
  dayFlag: number
  dayMaxWithdrawalLimit: number
  keepAmount: number
  keepRechargeAmount: number
  moneyType: number
  monthAmount: number
  monthFlag: number
  rechargeAmount: number
  rowId: number
  site: string
  upgradedAmount: number
  upgradedFlag: number
  vipId: number
  weekAmount: number
  weekFlag: number
}

// 所有VIP等级信息 返回
export interface VipListResponse {
  code: string
  message: string
  success: boolean
  result?: VipListItem[] | VipListItem
}

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
