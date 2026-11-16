/** 哈希游戏可选投注项；通用聊天室不依赖此枚举。 */
export type HashBetOption = 'BIG' | 'SMALL' | 'ODD' | 'EVEN'

/** 服务端聊天室业务消息。 */
export type HashWsChatData =
  | {
      id: number
      gameCode: string
      kind: 'USER'
      nickname: string
      content: string
      time: number
      robot: boolean
    }
  | {
      id: number
      gameCode: string
      kind: 'JOIN' | 'LEAVE'
      nickname: string
      content: string
      time: number
      avatarUrl?: string
      robot: boolean
    }
  | {
      id: number
      gameCode: string
      kind: 'DRAW'
      anchorBlockNum: number
      time: number
      result: unknown
    }
  | { id: number; gameCode: string; kind: 'BIG_WIN'; time: number }

/** 页面接收的 WS 事件；在线和投注统计只更新页面状态。 */
export type HashWsEvent =
  | { code: number; type: 'CHAT_MESSAGE'; data: HashWsChatData }
  | { code: number; type: 'CHAIN_LOTTERY_ONLINE'; data: { gameCode: string; onlineCount: number } }
  | {
      code: number
      type: 'CHAIN_LOTTERY_BET_STATS'
      data: {
        gameCode: string
        anchorBlockNum: number
        stats: Record<string, Record<string, { participantCount: number; totalAmount: number }>>
      }
    }

/** 本地投注请求和成功响应；只有确认成功才生成聊天消息。 */
export type HashPlaceBetRequest = {
  requestId: string
  gameCode: string
  currency: string
  betOption: HashBetOption
  amount: number
  anchorBlockNum: number
}
export type HashPlaceBetResponse = {
  code: string
  success: boolean
  result?: { anchorBlockNum: number; currency: string; orderNo: string }
}

/** 开奖 HTTP 数据的展示入口，实际请求来源后续接入。 */
export type HashHttpDraw = {
  gameCode: string
  anchorBlockNum: number
  result: { digit: number; oddEven: string; bigSmall: string }
  time: number
  winners?: number
  totalPayout?: number
  currency?: string
  blockHash?: string
  explorerUrl?: string
}

/** 聊天历史接口返回的房间消息。 */
export type HashChatHistoryItem = {
  id: number
  gameCode: string
  kind: 'DRAW' | 'USER' | 'JOIN' | 'LEAVE' | 'BIG_WIN'
  content: string
  time: number
  nickname?: string
  robot?: boolean
  avatarUrl?: string
  anchorBlockNum?: number
  blockHash?: string
  explorerUrl?: string
  result?: { digit: number; oddEven: string; bigSmall: string }
  scope?: string
}

export type HashChatHistoryResponse = {
  code: string
  success: boolean
  result?: { gameCode: string; messages: HashChatHistoryItem[] }
}

/** 当前用户的单笔结算记录。 */
export type HashSettledOrder = {
  orderNo: string
  gameCode: string
  anchorBlockNum: number
  currency: string
  amount: number
  payoutAmount: number
  status: 'WIN' | 'LOSE' | 'CANCEL' | string
}
export type HashRecentBetsResponse = {
  code: string
  success: boolean
  result?: { list: HashSettledOrder[] }
}

/** 通用消息直接使用 WS kind；本地与 HTTP 消息补充展示用 kind。 */
export type HashChatMessage =
  | { id: string; kind: 'NOTICE'; source: 'local'; time: number; content: string }
  | {
      id: string
      kind: 'USER'
      source: 'ws' | 'http' | 'local'
      time: number
      nickname: string
      content: string
      robot: boolean
    }
  | {
      id: string
      kind: 'JOIN' | 'LEAVE'
      source: 'ws' | 'http'
      time: number
      nickname: string
      avatarUrl?: string
    }
  | { id: string; kind: 'DRAW'; source: 'http'; time: number; draw: HashHttpDraw }
  | {
      id: string
      kind: 'BET'
      source: 'local'
      time: number
      nickname: 'Me'
      bet: HashPlaceBetRequest & { orderNo: string }
    }
  | {
      id: string
      kind: 'SELF_WIN'
      source: 'http'
      time: number
      currency: string
      anchorBlockNum: number
      betAmount: number
      payoutAmount: number
      profit: number
    }

/** 单币种、单输赢状态的结算弹窗数据。 */
export type HashSettlementNotice = {
  id: string
  status: 'WIN' | 'LOSE'
  currency: string
  anchorBlockNum: number
  amount: number
  drawHash?: string
  resultLabel?: string
}
