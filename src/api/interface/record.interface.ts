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
