/** 借呗模块通用业务响应结构。 */
export interface CreditLoanApiResponse<TResult> {
  code: string
  message: string
  success?: boolean
  result: TResult
}

/** 0 否，1 是 */
export type CreditLoanFlag = 0 | 1

/** 重置方式：1 每日重置，2 每周重置，3 每月重置 */
export type CreditLoanCycleType = 1 | 2 | 3

/** 文案类型：0 默认，1 自定义 */
export type CreditLoanTextType = 0 | 1

/** 会员借呗账户（/br/queryBorAcc）。 */
export interface CreditLoanAccount {
  /** 用户 id */
  memberRowId: number
  /** 用户名 */
  memberId: string
  /** 站点编码 */
  site: string
  /** 借呗余额 */
  balance: number
  /** 已借额度 */
  quotaBalance: number
  /** 总额度 */
  totalQuotaBalance: number
  /** 是否手动设置额度：0 否，1 是 */
  isManualSetting: CreditLoanFlag
  /** 额度重置时间 */
  resetTime?: number
  /** 当前周期是否借款：0 未借款，1 已借款 */
  borrowStatus?: CreditLoanFlag
  /** 当前周期是否已转出余额：0 未转出，1 已转出（转出后所有额度清 0） */
  transferStatus?: CreditLoanFlag
}

/** 借呗配置（/br/getBorrowConfig）。 */
export interface CreditLoanConfig {
  rowId: number
  /** 站点编码 */
  site: string
  /** 额度重置是否清零 */
  balanceReset?: CreditLoanFlag
  /** 绑定手机号方式：0 借款时绑定，1 转出盈利金额时绑定 */
  verifyPhoneType: CreditLoanFlag
  /** 重置方式：1 每日重置，2 每周重置，3 每月重置 */
  cycleType: CreditLoanCycleType
  /** 重置日期：周几 / 每月几号 */
  cycleDay: number
  /** 可转出借款倍数 */
  multipleRate: number
  /** 重置充值要求 */
  resetRechargeAmount: number
  /** 重置打码要求 */
  resetBetRate: number
  /** 可玩游戏，格式 "游戏类型|游戏平台|游戏编码" */
  platformGameCodes: string[]
  /** 稽查游戏，格式同 platformGameCodes */
  inspectPlatformGameCodes: string[]
  /** 相同设备 ID 限制数 */
  idVerifyNumber: number
  /** 相同浏览器指纹限制数 */
  browserVerifyNumber: number
  /** 相同 IP 限制数 */
  ipVerifyNumber: number
  /** 借呗借款金额转出余额需要打码倍数 */
  transferBalanceBetRate: number
  /** 转出金额需打码倍数 */
  transferBetRate: number
  /** 借款前文案类型：0 默认，1 自定义 */
  beforeType: CreditLoanTextType
  /** 借款前自定义文案 */
  beforeText?: string
  /** 借款后文案类型：0 默认，1 自定义 */
  afterType: CreditLoanTextType
  /** 借款后自定义文案 */
  afterText?: string
  /** 转出文案类型：0 默认，1 自定义 */
  transferType: CreditLoanTextType
  /** 转出自定义文案 */
  transferText?: string
  /** 借呗详情底部 logo */
  bottomLogo?: string
  createTime?: number
  updateTime?: number
  updateBy?: string
}

/** 会员借呗额度信息（/br/queryBorInfo）。 */
export interface CreditLoanInfo {
  /** 借呗余额 */
  balance: number
  /** 可借额度 */
  quotaBalance: number
  /** 可转出余额 */
  transferAmount: number
  /** 借呗配置 */
  borrowConfig: CreditLoanConfig
  /** 当前周期是否借款：0 未借款，1 已借款 */
  borrowStatus: CreditLoanFlag
  /** 下次重置时间 */
  nextResetTime: number
}

/** 会员借款结果（/br/loanAmount）。 */
export interface CreditLoanBorrowResult {
  /** 是否首次借款 */
  isFirst: boolean
  /** 借款金额 */
  amount: number
}

/** 借呗账变记录。 */
export interface CreditLoanHistoryRecord {
  rowId: number
  /** 会员 id */
  memberRowId: number
  /** 会员名称 */
  memberId: string
  /** 交易金额 */
  busiAmount: number
  /** 交易后金额 */
  newBalance: number
  /** 交易前金额 */
  oldBalance: number
  /** 输赢金额 */
  winLoseAmount?: number
  /** 会员层级 */
  levelId?: number
  /** 变更类型 */
  changeType: number
  /** 备注 */
  remark?: string
  /** vip 等级 */
  vipLevel?: number
  /** 创建时间 */
  createTime: number
  /** 交易时间 */
  createDate: number
  /** 订单 id */
  orderNo: string
  /** 操作人 */
  createBy?: string
  site?: string
}

/** 借呗分页请求参数中的 page 字段。 */
export interface CreditLoanPageParams {
  current: number
  size: number
}

/** 借呗分页结果。 */
export interface CreditLoanPage<TRecord = CreditLoanHistoryRecord> {
  records: TRecord[]
  total: number
  size?: number
  current: number
  pages?: number
}

/** 借呗账变记录分页结果（/br/borrHisPage），额外带汇总的交易前后余额。 */
export interface CreditLoanHistoryPage extends CreditLoanPage<CreditLoanHistoryRecord> {
  newBalance?: number
  oldBalance?: number
}

/** 借呗账变记录分页查询参数（/br/borrHisPage）。 */
export interface CreditLoanHistoryQuery {
  /** 变更类型列表 */
  changeTypes?: number[]
  param?: Record<string, unknown>
}

/** 借呗账变记录分页查询参数（/br/borrHisJbPage）。 */
export interface CreditLoanJbHistoryQuery {
  /** 会员名称 */
  memberId?: string
  /** 变更类型 */
  changeType?: number
}
