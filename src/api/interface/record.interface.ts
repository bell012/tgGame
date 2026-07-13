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
    backNote?: string
    balanceType?: number
    busiAmount: number // 交易金额
    changeNote?: string // 备注说明
    /**
     * 资金变动类型：
     * 1 游戏切换，2 会员充值，3 会员取款，4 会员取款退回，5 人工存入，6 人工扣款，
     * 7 赠送彩金，8 洗码，9 货币互转，10 周礼金，11 月礼金，13 VIP晋级彩金，
     * 14 充值优惠，15 任务奖金，16 投注，17 中奖，18 积分兑换，19 活动积分，
     * 20 领取佣金，21 推荐奖励，22 新人福利，23 救援金活动，24 红包，25 签到活动，
     * 26 返利活动，27 充值活动，28 兑换码活动，29 代理活动，30 推广提交活动，
     * 31 代理返佣活动，32 幸运彩金，33 意见采纳，35 分享轮盘抽奖，38 日礼金，
     * 39 投注三方平台，40 取消投注三方平台，41 保险柜变动，42 真人对战投注，
     * 43 真人对战赢，44 真人对战锦标赛奖励，45 人工送积分，46 人工扣积分，
     * 47 提现加赠，48 宝箱奖金，50 会员转账，51 彩票中奖，52 报名费，54 赛事奖金，
     * 55 手续费，56 报名费(门票)，57 赛事门票，58 赛事活动奖励，59 借呗转出，
     * 60 红包活动，62 会员加款，63 会员扣款，64 代理佣金，65 搏一搏，66 签到奖励，
     * 67 充值优惠奖励，68 爆奖活动，69 星级打码奖励，70 登录奖励，71 下载奖励，
     * 72 注册奖励，73 现金兑换奖励，74 幸运红包奖励，75 砸金蛋奖励，76 大转盘奖励，
     * 77 拼多多奖励，78 游戏账户划转合约账户，79 合约账户划转游戏账户，
     * 80 红利活动奖励，81 红包活动奖励，82 盲盒奖励，83 平台转主账户，
     * 84 指定账户赢钱，85 指定账户重置
     */
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

// 已领取奖金历史 携带参数
export interface QueryAcctHisBonusPageForm {
  startTime: number | null
  endTime: number | null
  page: {
    current: number
    size: number
  }
  param: {
    currency: string | null
  }
}

// 已领取奖金历史 响应
export interface QueryAcctHisBonusPageResponse {
  code: string
  message: string
  success: boolean
  result?: QueryAcctHisPageResult
}

// 流水记录 携带参数
export interface QueryInspectPageForm {
  startTime: number | null
  endTime: number | null
  currency: string
  page: {
    current: number
    size: number
  }
  state: number | null // 状态0:已完成 1:未完成
  changeTypes: string[] | null
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
    /**
     * 资金变动类型：
     * 1 游戏切换，2 会员充值，3 会员取款，4 会员取款退回，5 人工存入，6 人工扣款，
     * 7 赠送彩金，8 洗码，9 货币互转，10 周礼金，11 月礼金，13 VIP晋级彩金，
     * 14 充值优惠，15 任务奖金，16 投注，17 中奖，18 积分兑换，19 活动积分，
     * 20 领取佣金，21 推荐奖励，22 新人福利，23 救援金活动，24 红包，25 签到活动，
     * 26 返利活动，27 充值活动，28 兑换码活动，29 代理活动，30 推广提交活动，
     * 31 代理返佣活动，32 幸运彩金，33 意见采纳，35 分享轮盘抽奖，38 日礼金，
     * 39 投注三方平台，40 取消投注三方平台，41 保险柜变动，42 真人对战投注，
     * 43 真人对战赢，44 真人对战锦标赛奖励，45 人工送积分，46 人工扣积分，
     * 47 提现加赠，48 宝箱奖金，50 会员转账，51 彩票中奖，52 报名费，54 赛事奖金，
     * 55 手续费，56 报名费(门票)，57 赛事门票，58 赛事活动奖励，59 借呗转出，
     * 60 红包活动，62 会员加款，63 会员扣款，64 代理佣金，65 搏一搏，66 签到奖励，
     * 67 充值优惠奖励，68 爆奖活动，69 星级打码奖励，70 登录奖励，71 下载奖励，
     * 72 注册奖励，73 现金兑换奖励，74 幸运红包奖励，75 砸金蛋奖励，76 大转盘奖励，
     * 77 拼多多奖励，78 游戏账户划转合约账户，79 合约账户划转游戏账户，
     * 80 红利活动奖励，81 红包活动奖励，82 盲盒奖励，83 平台转主账户，
     * 84 指定账户赢钱，85 指定账户重置
     */
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
