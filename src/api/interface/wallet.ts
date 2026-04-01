/**
 * 钱包-充值支付相关接口类型定义
 */

export interface QueryPayColumnPageForm {
  page: {
    current: number
    size: number
  }
  param?: {
    columnCode: string
  }
  languageCode: string
  currency?: string
}

export interface QueryPayColumnItem {
  columnCode: number
  columnIco: string
  columnName: string
  defaultOrderIcon: string
  directRecharge: number
  discountRate: number
  gradientLogo: string
  gradientOrderIcon: string
  h5: string
  isHorizontal: string
  isPortrait: string
  pc: string
  recommended: number
  sortNo: number
}

export interface QueryPayColumnPageResponse {
  code: string
  message: string
  success: boolean
  result?: QueryPayColumnItem[]
}

export interface QueryPaySubColumnPageForm {
  page: {
    current: number
    size: number
  }
  param: {
    columnCode: number
  }
}

export interface SubmitPayOrderQuickPageForm {
  columnCode: string
  busiAmount: string
  payChannelCode: string
  channelId: number
}

export interface SubmitPayOrderQuickResult {
  createTime: number
  orderId: number
  payId: number
  action: string
  payUrl: string
}

export interface SubmitPayOrderQuickResponse {
  code: string
  message: string
  success: boolean
  result?: SubmitPayOrderQuickResult
}

export interface QueryPayOrderByOrderIdForm {
  orderId: string | number
}

export interface QueryPayOrderByOrderIdResult {
  accountAmount: number
  accountCurrency: string
  busiAmount: number
  channelId: string
  columnCode: number
  createTime: number
  currency: string
  discountStatus: number
  downloadSite: string
  ip: string
  isFirst: number
  memberId: string
  memberRowId: number
  modifyBy: string
  modifyTime: number
  msgVersion: number
  online: number
  orderId: string
  orderType: string
  otherAmount: number
  payChannelCode: string
  payOrderId: string
  platformCode: string
  platformName: string
  readStatus: number
  readTime: number
  returnAmount: number
  score: number
  site: string
  status: number
  subColumnCode: number
  subColumnName: string
  sysLevelId: number
  [key: string]: unknown
}

export interface QueryPayOrderByOrderIdResponse {
  code: string
  message: string
  success: boolean
  result?: QueryPayOrderByOrderIdResult
}

export interface QueryPaySubColumnItem {
  columnCode: number
  currency: string
  defaultRechargeAmount: Array<number | string>
  enable: number
  highset: number
  lowset: number
  manualAmountIn: number
  online: number
  payChannelCode: string
  platformCode: string
  platformLogo: string
  platformName: string
  rowId: number
  site: string
  sortNum: number
  subColumnName: string
  vipId: Array<number | string>
}

export interface QueryPaySubColumnPageResponse {
  data: any
  code: string
  message: string
  success: boolean
  result?: QueryPaySubColumnItem[]
}

export interface QueryDlicghForm {
  [key: string]: unknown
}

export interface QueryDlicghResponse {
  code: string
  message: string
  success: boolean
  result?: QueryDlicghResult
}

export interface QueryDlicghResult {
  baseSiteConfig?: {
    defaultCurrency?: string
    supportCurrency?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}
