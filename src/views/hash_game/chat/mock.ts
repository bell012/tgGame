import type {
  HashHttpDraw,
  HashPlaceBetRequest,
  HashPlaceBetResponse,
  HashRecentBetsResponse,
  HashWsEvent
} from './types'

/** 生成当前模拟房间的 WS 事件，用于替换页面原有的静态聊天数据。 */
export function createMockRoomEvents(gameCode: string): HashWsEvent[] {
  const now = Date.now()
  return [
    { code: 0, type: 'CHAIN_LOTTERY_ONLINE', data: { gameCode, onlineCount: 22 } },
    {
      code: 0,
      type: 'CHAIN_LOTTERY_BET_STATS',
      data: {
        gameCode,
        anchorBlockNum: 87909084,
        stats: {
          CNY: {
            ODD: { participantCount: 13, totalAmount: 172.07 },
            BIG: { participantCount: 14, totalAmount: 260.25 },
            SMALL: { participantCount: 10, totalAmount: 153.73 },
            EVEN: { participantCount: 13, totalAmount: 131.59 }
          },
          USDT: {
            ODD: { participantCount: 14, totalAmount: 211.61 },
            BIG: { participantCount: 15, totalAmount: 196.98 },
            SMALL: { participantCount: 10, totalAmount: 181.77 },
            EVEN: { participantCount: 11, totalAmount: 160.22 }
          }
        }
      }
    },
    {
      code: 0,
      type: 'CHAT_MESSAGE',
      data: {
        id: 278006,
        gameCode,
        kind: 'USER',
        nickname: 'b**3',
        content: '这把稳了！',
        time: now - 30_000,
        robot: true
      }
    },
    {
      code: 0,
      type: 'CHAT_MESSAGE',
      data: {
        id: 208702,
        gameCode,
        kind: 'JOIN',
        nickname: '圣**E',
        content: '圣**E 来了',
        time: now - 20_000,
        robot: false
      }
    },
    {
      code: 0,
      type: 'CHAT_MESSAGE',
      data: {
        id: 208712,
        gameCode,
        kind: 'LEAVE',
        nickname: '圣**E',
        content: '圣**E 离开了',
        time: now - 10_000,
        robot: false
      }
    },
    {
      code: 0,
      type: 'CHAT_MESSAGE',
      data: {
        id: 278007,
        gameCode,
        kind: 'USER',
        nickname: 'K*7',
        content: 'Small this round.',
        time: now,
        robot: false
      }
    },
    {
      code: 0,
      type: 'CHAT_MESSAGE',
      data: {
        id: 279272,
        gameCode,
        kind: 'DRAW',
        anchorBlockNum: 87909537,
        time: now + 1,
        result: { digit: 1, oddEven: 'ODD', bigSmall: 'SMALL' }
      }
    },
    { code: 0, type: 'CHAT_MESSAGE', data: { id: 33494, gameCode, kind: 'BIG_WIN', time: now + 2 } }
  ]
}

/** 模拟下注请求，供本地投注和结算样例使用。 */
export function createMockBetRequest(gameCode: string): HashPlaceBetRequest {
  return {
    requestId: 'CL_mock_demo_1',
    gameCode,
    currency: 'CNY',
    betOption: 'BIG',
    amount: 10,
    anchorBlockNum: 87969020
  }
}

/** 模拟 HTTP 开奖结果，不自行触发请求。 */
export function createMockHttpDraw(gameCode: string): HashHttpDraw {
  return {
    gameCode,
    anchorBlockNum: 87969020,
    result: { digit: 8, oddEven: 'EVEN', bigSmall: 'BIG' },
    time: Date.now(),
    winners: 567,
    totalPayout: 103194,
    currency: 'CNY'
  }
}

/** 模拟赢、输、取消各一单。 */
export function createMockRecentBetsResponse(gameCode: string): HashRecentBetsResponse {
  return {
    code: 'C2',
    success: true,
    result: {
      list: [
        {
          orderNo: 'CL_mock_demo_1',
          gameCode,
          anchorBlockNum: 87969020,
          currency: 'CNY',
          amount: 10,
          payoutAmount: 12.8,
          status: 'WIN'
        },
        {
          orderNo: 'CL_mock_demo_2',
          gameCode,
          anchorBlockNum: 87969020,
          currency: 'CNY',
          amount: 5,
          payoutAmount: 0,
          status: 'LOSE'
        },
        {
          orderNo: 'CL_mock_demo_3',
          gameCode,
          anchorBlockNum: 87969020,
          currency: 'USDT',
          amount: 1,
          payoutAmount: 0,
          status: 'CANCEL'
        }
      ]
    }
  }
}

/** 模拟投注接口确认成功，不产生任何真实下注请求。 */
export function createMockPlaceBetResponse(request: HashPlaceBetRequest): HashPlaceBetResponse {
  return {
    code: 'C2',
    success: true,
    result: {
      anchorBlockNum: request.anchorBlockNum,
      currency: request.currency,
      orderNo: request.requestId
    }
  }
}
