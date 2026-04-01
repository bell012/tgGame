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
