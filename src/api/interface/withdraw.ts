/**
 * 提现模块通用响应结构
 */
export interface WithdrawBaseResponse<T = unknown> {
  code: string | number
  message: string
  result?: T
  [key: string]: unknown
}

/**
 * 通用分页参数
 */
export interface WithdrawPageForm {
  current: number
  size: number
}

/**
 * 查询提现方式配置
 */
export interface QueryWithdrawManagerForm {
  [key: string]: unknown
}

/**
 * 提现方式配置项
 */
export interface WithdrawManagerItem {
  columnCode?: string | number
  paymentCode?: string | number
  paymentName?: string
  cardType?: string | number
  subType?: string | number
  channelType?: number
  type?: number
  showStatus?: number
  status?: number
  icon?: string
  logo?: string
  logoSelect?: string
  quickAmts?: string
  [key: string]: unknown
}

export type QueryWithdrawManagerResponse = WithdrawBaseResponse<WithdrawManagerItem[]>

/**
 * 查询会员收款账号
 */
export interface SelectMemberCardForm {
  cardType?: string | number
  currency?: string
  [key: string]: unknown
}

/**
 * 会员收款账号项
 */
export interface MemberCardItem {
  rowId: string | number
  cardType?: string | number
  accountName?: string
  accountNo?: string
  bankName?: string
  walletAddress?: string
  paymentCode?: string | number
  isDefault?: number | boolean
  [key: string]: unknown
}

export type SelectMemberCardResponse = WithdrawBaseResponse<MemberCardItem[]>

/**
 * 新增会员收款账号
 */
export interface AddMemberCardForm {
  verifyType?: string
  verifyCode?: string
  /**
   * 收款类型 4 银行卡 5 虚拟账号 6 电子钱包 7 快捷提现
   */
  type: number
  /**
   * 收款账号卡类型
   */
  cardType: number
  /**
   * 收款号
   */
  accountNo: string
  /**
   * 收款人名称
   */
  accountName: string
  /**
   * 账号子编码(银行编码)
   */
  accountSubNo?: string
  /**
   * 是否默认 0 非默认 1 默认
   */
  defaultCard?: number
  /**
   * 有效日期
   */
  validDate?: number
  /**
   * 备注。开户行地址|收款码地址
   */
  remark?: string
}

export interface AddMemberCardResponse extends WithdrawBaseResponse<never> {
  success?: boolean
}

/**
 * 查询快捷提现金额
 */
export interface QueryFastAmountForm {
  paymentCode: string | number
}

/**
 * 快捷金额项
 */
export interface FastAmountItem {
  amount?: string | number
  minAmount?: string | number
  maxAmount?: string | number
  sort?: number
  [key: string]: unknown
}

export type QueryFastAmountResponse = WithdrawBaseResponse<FastAmountItem[]>

/**
 * 查询流水校验结果
 * result > 0 时代表仍需完成流水
 */
export type QueryNeedBetAmountForAppResponse = WithdrawBaseResponse<number>

/**
 * 查询会员提现风控/强制出款配置
 */
export interface QueryWithdrawConfigByMemberForm {
  accountNo: string | number
}

/**
 * 提现配置结果
 */
export interface WithdrawConfigByMemberResult {
  mandatoryPayment?: number
  ignoreBet?: number
  feeAmount?: string | number
  taxAmount?: string | number
  [key: string]: unknown
}

export type QueryWithdrawConfigByMemberResponse = WithdrawBaseResponse<WithdrawConfigByMemberResult>

/**
 * 提交提现订单
 */
export interface SubmitTransferOrderForm {
  busiAmount: string | number
  accountNo: string | number
  withdrawNumber: number
  channelId: string | number
  columnCode: string | number
  verifyCode?: string
  modifyBy?: string
  currencyCode?: string
  [key: string]: unknown
}

/**
 * 提现提交结果
 */
export interface SubmitTransferOrderResult {
  orderId?: string | number
  orderNo?: string
  status?: string | number
  [key: string]: unknown
}

export type SubmitTransferOrderResponse = WithdrawBaseResponse<SubmitTransferOrderResult>

/**
 * 查询提现订单列表
 */
export interface QueryWithdrawOrderListForm {
  page?: WithdrawPageForm
  status?: string | number
  [key: string]: unknown
}

/**
 * 提现订单列表项
 */
export interface WithdrawOrderItem {
  orderId?: string | number
  orderNo?: string
  cardType?: string | number
  accountNo?: string
  busiAmount?: string | number
  status?: string | number
  createTime?: string
  paymentName?: string
  [key: string]: unknown
}

export type QueryWithdrawOrderListResponse = WithdrawBaseResponse<WithdrawOrderItem[]>

/**
 * 查询单个提现订单详情
 */
export interface QueryTheWithdrawOrderForm {
  orderId: string | number
}

/**
 * 提现订单详情
 */
export interface WithdrawOrderDetail {
  orderId?: string | number
  orderNo?: string
  busiAmount?: string | number
  createTime?: string
  cardType?: string | number
  paymentName?: string
  status?: string | number
  accountNo?: string
  [key: string]: unknown
}

export type QueryTheWithdrawOrderResponse = WithdrawBaseResponse<WithdrawOrderDetail | null>
