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
  payChannelCode?: string | number
  recommended: number
  sortNo: number
}

export interface QueryPayColumnPageResponse {
  code: string
  message: string
  success: boolean
  result?: QueryPayColumnItem[]
}

export interface QueryPayColumnWithSubListForm {
  page: {
    current: number
    size: number
  }
  languageCode: string
  param: {
    columnCode: string
  }
}

export interface QueryPayColumnWithSubListPayColumnItem extends QueryPayColumnItem {
  enable: number
  moneyType: number
  rowId: number
  site: string
}

export interface QueryPayOfflineAccountItem {
  accountName: string
  accountNo: string
  accountSubNo: string
  branchAddr: string
  cardType: number
  currency: string
  enable: number
  rowId: number
  site: string
  type: number
}

export interface QueryPayColumnWithSubListSubColumnItem {
  columnCode: number
  currency: string
  defaultRechargeAmount: Array<number | string>
  enable: number
  highset: number
  lowset: number
  manualAmountIn: number
  online: number
  rowId: number
  showChannel?: string[]
  site: string
  sortNum: number
  subColumnName: string
  sysLevelId?: Array<number | string>
  vipId: Array<number | string>
  offlineAccount?: QueryPayOfflineAccountItem
  payChannelCode?: string
  platformCode?: string
  platformLogo?: string
  platformName?: string
  deviceChannel?: string[]
}

export interface QueryPayColumnWithSubListItem {
  payColumn: QueryPayColumnWithSubListPayColumnItem
  subColumnList: QueryPayColumnWithSubListSubColumnItem[]
}

export interface QueryPayColumnWithSubListResponse {
  code: string
  message: string
  success: boolean
  result?: QueryPayColumnWithSubListItem[]
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

export interface SubmitPayOrderPageForm {
  columnCode: string
  busiAmount: string
  payChannelCode: string
  channelId: number
  subColumnCode: number
  flows: number
  discount?: number
}

export interface SubmitPayOrderResult {
  createTime: number
  orderId: number
  payId: number
  action: string
  payUrl: string
}

export interface SubmitPayOrderResponse {
  code: string
  message: string
  success: boolean
  result?: SubmitPayOrderResult
}

export interface CancelPayOrderStatusForm {
  orderId: string | number
  backNote: string
}

export interface CancelPayOrderStatusResponse {
  code: string
  message: string
  success: boolean
}

export interface QueryPayOrderByOrderIdForm {
  orderId: string | number
}

export interface QueryPayOrderByOrderIdResult {
  accountAmount: number
  accountCurrency: string
  accountName?: string
  accountNo?: string
  accountSubNo?: string
  cardType?: number
  busiAmount: number
  channelId: string
  columnCode: number
  createTime: number
  currency: string
  discountStatus: number
  downloadSite: string
  flows?: number
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
  type?: number | string
  [key: string]: unknown
}

export interface QueryPayOrderByOrderIdResponse {
  code: string
  message: string
  success: boolean
  result?: QueryPayOrderByOrderIdResult
}

export interface QueryMemberPayOrderPageForm {
  page: {
    current: number
    size: number
  }
  columnCode: string
  status: string | string[]
  startTime: number | null
  endTime: number | null
  param: {
    orderType: 0 | 1
  }
}

export interface QueryMemberPayOrderPageRecord {
  accountAmount: number
  busiAmount: number
  cardType?: number
  columnCode: number
  createTime: number
  currency: string
  memberId: string
  memberRowId: number
  online: number
  orderId: string
  orderType: string
  otherAmount: number
  status: number | string
  subColumnCode: number
  subColumnName: string
  type?: number | string
  [key: string]: unknown
}

export interface QueryMemberPayOrderPageResult {
  current: number
  pages: number
  records: QueryMemberPayOrderPageRecord[]
  size: number
  total: number
}

export interface QueryMemberPayOrderPageResponse {
  code: string
  message: string
  success: boolean
  result?: QueryMemberPayOrderPageResult
}

export interface UpdatePayOrderRemarkForm {
  orderId: string | number
  orderRemark: string
}

export interface UpdatePayOrderRemarkResponse {
  code: string
  message: string
  success: boolean
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
  offlineAccount?: QueryPayOfflineAccountItem
}

export interface QueryPaySubColumnPageResponse {
  data: unknown
  code: string
  message: string
  success: boolean
  result?: QueryPaySubColumnItem[]
}

export interface PayRechargeQuickAmtsForm {
  columnCode: number
}

export interface PayRechargeQuickAmtsResult {
  manualAmountIn: number
  amounts: Array<number | string>
}

export interface PayRechargeQuickAmtsResponse {
  code: string
  message: string
  success: boolean
  result?: PayRechargeQuickAmtsResult
}

export interface QueryDiscountListForm {
  payChannelCode: string
}

export interface QueryDiscountAmountItem {
  amount: number
  ratio: number
}

export interface QueryDiscountListItem {
  createTime: number
  discounts?: QueryDiscountAmountItem[]
  multiple: number
  payChannelCode: string
  rowId: number
  site: string
  updateTime: number
}

export interface QueryDiscountListResponse {
  code: string
  message: string
  success: boolean
  result?: QueryDiscountListItem[]
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
