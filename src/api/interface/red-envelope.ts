/** 红包模块通用业务响应结构。 */
export interface RedEnvelopeApiResponse<TResult> {
  code: string
  message: string
  success?: boolean
  result: TResult
}

/** 红包类型：1 每日红包，2 充值红包，3 返现红包，4 幸运红包。 */
export type RedEnvelopeType = 1 | 2 | 3 | 4

/** 弹窗展示状态：1 立即充值，2 立即投注，3 立即领取，4 已领取，5 已过期，6 已领完。 */
export type RedEnvelopeShowState = 1 | 2 | 3 | 4 | 5 | 6

/** 会员红包列表项。 */
export interface RedEnvelopeItem {
  redEnvelopeId: number
  logo?: string
  empName?: string
  memberRowId?: number
  memberId?: string
  activityId?: number
  redEnvelopeType: RedEnvelopeType
  /** 0 未领取，1 已领取 */
  receiveState: 0 | 1
  amount?: number
  redEnvelopeName?: string
  redEnvelopeDesc?: string
  expiredTime?: number
  createTime?: number
  updateTime?: number
  site?: string
  resetState?: number
  currency?: string
  orderNo?: string
  sortNo?: number
  /** 终端：1 竖版，2 横版，3 PC，4 H5，5 其他 */
  channelId?: string[]
}

/** 会员红包列表分页参数。 */
export interface RedEnvelopePage<TRecord = RedEnvelopeItem> {
  records: TRecord[]
  total: number
  size: number
  current: number
}

/** 会员红包领取记录查询条件。 */
export interface MemberRecordParams {
  memberId: string
  redEnvelopeId?: number
  redEnvelopeType?: RedEnvelopeType
}

/** 会员红包领取记录查询结果。 */
export interface MemberRecordResult {
  totalMoney: number
  recordPage: RedEnvelopePage<RedEnvelopeItem>
}

/** 红包活动进度（查询进度与领取接口共用）。 */
export interface RedEnvelopeSchedule {
  redEnvelopeId?: number
  memberId?: string
  activityId?: number
  amount?: number
  rechargeGather?: number
  rechargeCond?: number
  lossGather?: number
  lossCond?: number
  betGather?: number
  betCond?: number
  showState: RedEnvelopeShowState
  expiredTime?: number
}
