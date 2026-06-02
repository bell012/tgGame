// 投注记录 携带参数
export interface QueryOrderInfoPageForm {
  secondStartTime: number | null
  secondEndTime: number | null
  winlost: number | null // 0输1赢
  page: {
    current: number
    size: number
  }
  param: {
    currency: string | null
    sysGameTypeCode: string | null
    platformCode: string | null
    gameCode: string | null
    status: number | null // 结算状态  1已结算    0未结算
  }
}

// 投注记录 响应
export interface QueryOrderInfoPageResponse {
  code: string
  message: string
  success: boolean
  result?: QueryOrderInfoResult
}

// 投注记录 响应结果
export interface QueryOrderInfoResult {
  current: number
  pages: number
  records: Array<{
    rowId: number //  注单ID
    memberId: string //  会员账号
    memberRowId: number //  会员ID
    currency: string // 币种编码CNY:人民币 USDT:USDT USD:美元 SGD:新币 BTC:BTC VND:越南盾 ETH:ETH
    issueId: string //  投注局|期号
    betId: string // 游戏方注单ID
    sysGameTypeCode: string //  平台类型    CP:彩票 TY:体育 ZR:真人 DZ:电子 QP:棋牌 BY:捕鱼 DJ:电竞
    platformCode: string //  平台编码
    gameCode: string //  游戏编码
    betAmount: number //  下注金额
    gameAmount: number // 输赢
    betTime: number // 下注时间
    createTime: number // 新增时间
    score: number // 获得积分
    balanceAfterBetting: number // 投注后余额
    validBet: number // 有效投注
    remark: string // 备注
    batchNo: number // 入款批次号
    betContent1: string // 彩种1级玩法
    betContent2: string //  彩种2级玩法
    betContent3: string //  彩种3级玩法
    betContent4: string //  彩种投注内容
    betContent6: string // 彩种赔率
    site: string // 站点
    downloadSite: string // 来源|下载地址
    channelId: string // 注册终端 1竖版2横版3PC4H5 5其他
    status: number // 结算状态  1已结算    0未结算
  }>
  size: number
  total: number
}

// 资金明细 携带参数
export interface QueryAcctHisPageForm {
  startTime: number | null
  endTime: number | null
  page: {
    current: number
    size: number
  }
  param: {
    currency: string | null
  }
  changeTypes: string[] | null
  // 变更类型 1.游戏   2.充值 3.提现 4.退款 5.人工存款 6.系统扣除 14.充值优惠 47.提现加赠 7赠送彩金  10周礼金  11.月礼金  13.VIP晋级收彩金 8.返水
  // 15任务奖金 33意见采纳  20领取佣金  21推荐奖励  35转盘抽奖  60红包活动  66签到奖励  70登录奖励  71下载奖励  72注册奖励  80红利活动奖励
  // 73现金兑换奖励  75砸金蛋奖励  76大转盘奖励  74幸运红包奖励  82盲盒奖励
}

// 资金明细 响应
export interface QueryAcctHisPageResponse {
  code: string
  message: string
  success: boolean
  result?: QueryAcctHisPageResult
}

// 资金明细 响应结果
export interface QueryAcctHisPageResult {
  current: number
  pages: number
  records: Array<{
    accountChangeId: number // 记录id
    backNote: string
    busiAmount: number // 交易金额
    changeNote: string // 备注说明
    changeType: number
    createBy: string
    createDate: number
    createTime: number // 更新时间
    currency: string
    memberId: string // 会员名称
    memberRowId: number // 会员id
    newBalance: number // 新余额
    oldBalance: number // 旧余额
    winLoseAmount?: number // 输赢金额（游戏切换时使用）
    site: string
  }>
  size: number
  total: number
}

// 流水记录 携带参数
export interface QueryInspectPageForm {
  startTime: number | null
  endTime: number | null
  page: {
    current: number
    size: number
  }
  state: number | null // 状态0:已完成 1:未完成
  changeTypes: string[] | null // 变更类型 1.游戏切换   2.会员充值 3.会员取款 4.会员取款退回 5.人工存入 6.人工扣款 7.赠送彩金 8.领取佣金 9货币互换  10.周礼金  11.月礼金  13.VIP收益 14.红利兑换
}

// 流水记录 响应
export interface QueryInspectPageResponse {
  code: string
  message: string
  success: boolean
  result?: QueryInspectPageResult
}

// 流水记录 响应结果
export interface QueryInspectPageResult {
  current: number
  pages: number
  records: Array<{
    rowId: number
    memberId: string
    memberRowId: number
    currency: string // 货币 PHP
    changeType: number
    amount: number // 金额
    betAmount: number // Required Turnover
    currentBetAmount: number // Actual Turnover
    status: number // 状态1:已完成 0:未完成
    createTime: number // 创建时间
    modifyBy: string
    modifyTime: number
    exchange: number
  }>
  size: number
  total: number
}
