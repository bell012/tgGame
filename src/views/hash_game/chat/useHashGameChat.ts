import { computed, onScopeDispose, ref, shallowRef, watch, type Ref } from 'vue'
import { useGameChatFeed } from '@/composables/useGameChatFeed'
import { queryHashChatHistory } from '@/api/modules/hash-game-chat'
import type {
  HashChatHistoryItem,
  HashChatMessage,
  HashHttpDraw,
  HashPlaceBetRequest,
  HashPlaceBetResponse,
  HashRecentBetsResponse,
  HashSettlementNotice,
  HashSettledOrder,
  HashWsEvent
} from './types'

/** 同一币种和状态的订单金额汇总。 */
type SettlementGroup = {
  currency: string
  status: 'WIN' | 'LOSE'
  betAmount: number
  payoutAmount: number
}

/** 模拟结算使用八位小数精度，避免浮点累加出现可见尾差。 */
function roundAmount(value: number) {
  return Number(value.toFixed(8))
}

/** 管理哈希游戏单次进入页面期间的聊天室和结算展示状态。 */
export function useHashGameChat(gameCode: Ref<string>) {
  const feed = useGameChatFeed<HashChatMessage>()
  const activeRoom = ref('')
  const onlineCount = ref(0)
  const betStats = shallowRef<
    Record<string, Record<string, { participantCount: number; totalAmount: number }>>
  >({})
  const settlementQueue = shallowRef<HashSettlementNotice[]>([])
  const currentSettlement = computed(() => settlementQueue.value[0] ?? null)
  const placedOrders = new Map<string, { gameCode: string; anchorBlockNum: number }>()
  const settledRounds = new Set<string>()
  let roomGeneration = 0

  /** 将历史接口记录转换为聊天室已支持的展示消息。 */
  function normalizeHistoryMessage(item: HashChatHistoryItem): HashChatMessage | null {
    if (item.kind === 'DRAW' && item.anchorBlockNum !== undefined && item.result) {
      return {
        id: `draw:${item.gameCode}:${item.anchorBlockNum}`,
        kind: 'DRAW',
        source: 'http',
        time: item.time,
        draw: {
          gameCode: item.gameCode,
          anchorBlockNum: item.anchorBlockNum,
          result: item.result,
          time: item.time,
          blockHash: item.blockHash,
          explorerUrl: item.explorerUrl
        }
      }
    }
    if (item.kind === 'USER') {
      return {
        id: `ws:${item.gameCode}:${item.id}`,
        kind: 'USER',
        source: 'http',
        time: item.time,
        nickname: item.nickname ?? '',
        content: item.content,
        robot: item.robot ?? false
      }
    }
    if (item.kind === 'JOIN' || item.kind === 'LEAVE') {
      return {
        id: `ws:${item.gameCode}:${item.id}`,
        kind: item.kind,
        source: 'http',
        time: item.time,
        nickname: item.nickname ?? '',
        avatarUrl: item.avatarUrl
      }
    }
    // BIG_WIN 继续遵循当前阶段忽略的约定。
    return null
  }

  /** 请求当前房间历史；房间切换或离开后丢弃旧请求的响应。 */
  async function loadHistory(code: string, generation: number) {
    try {
      const response = await queryHashChatHistory(code)
      if (generation !== roomGeneration || activeRoom.value !== `CHAT:${code}`) return
      if (!response.success || response.code !== 'C2' || response.result?.gameCode !== code) return
      const history = response.result.messages
        .filter(item => item.gameCode === code)
        .map(normalizeHistoryMessage)
        .filter((item): item is HashChatMessage => item !== null)
      feed.prependHistory(history)
    } catch {
      // 历史接口失败时保留本次会话已经收到的实时消息。
    }
  }

  /** 处理当前房间的 WS 数据；开奖数据只等待后续 HTTP 入口。 */
  function acceptWsEvent(event: HashWsEvent) {
    if (!activeRoom.value || event.code !== 0 || event.data.gameCode !== gameCode.value) return

    if (event.type === 'CHAIN_LOTTERY_ONLINE') {
      onlineCount.value = event.data.onlineCount
      return
    }
    if (event.type === 'CHAIN_LOTTERY_BET_STATS') {
      betStats.value = event.data.stats
      return
    }

    const data = event.data
    if (data.kind === 'USER') {
      feed.append({
        id: `ws:${data.gameCode}:${data.id}`,
        kind: 'USER',
        source: 'ws',
        time: data.time,
        nickname: data.nickname,
        content: data.content,
        robot: data.robot
      })
    } else if (data.kind === 'JOIN' || data.kind === 'LEAVE') {
      feed.append({
        id: `ws:${data.gameCode}:${data.id}`,
        kind: data.kind,
        source: 'ws',
        time: data.time,
        nickname: data.nickname,
        avatarUrl: data.avatarUrl
      })
    }
    // DRAW 的结果等待 HTTP 数据；BIG_WIN 本阶段不展示。
  }

  /** 仅在投注接口成功并返回订单号后插入本人投注消息。 */
  function acceptSuccessfulBet(request: HashPlaceBetRequest, response: HashPlaceBetResponse) {
    const result = response.result
    if (
      !activeRoom.value ||
      request.gameCode !== gameCode.value ||
      !response.success ||
      response.code !== 'C2' ||
      !result?.orderNo ||
      result.anchorBlockNum !== request.anchorBlockNum
    )
      return false

    placedOrders.set(result.orderNo, {
      gameCode: request.gameCode,
      anchorBlockNum: request.anchorBlockNum
    })
    return feed.append({
      id: `bet:${result.orderNo}`,
      kind: 'BET',
      source: 'local',
      time: Date.now(),
      nickname: 'Me',
      bet: { ...request, currency: result.currency, orderNo: result.orderNo }
    })
  }

  /** 将 HTTP 开奖结果插入一次；真正的 HTTP 请求与开奖触发后续接入。 */
  function acceptHttpDraw(draw: HashHttpDraw) {
    if (!activeRoom.value || draw.gameCode !== gameCode.value) return false
    return feed.append({
      id: `draw:${draw.gameCode}:${draw.anchorBlockNum}`,
      kind: 'DRAW',
      source: 'http',
      time: draw.time,
      draw
    })
  }

  /** 按订单号去重，并只保留本次会话在目标局成功提交的订单。 */
  function selectRoundOrders(anchorBlockNum: number, orders: HashSettledOrder[]) {
    const unique = new Map<string, HashSettledOrder>()
    for (const order of orders) {
      const placed = placedOrders.get(order.orderNo)
      if (
        placed?.gameCode === gameCode.value &&
        placed.anchorBlockNum === anchorBlockNum &&
        order.gameCode === gameCode.value &&
        order.anchorBlockNum === anchorBlockNum
      )
        unique.set(order.orderNo, order)
    }
    return [...unique.values()]
  }

  /** 按币种和 WIN / LOSE 分组，忽略 CANCEL 与未知状态。 */
  function groupSettledOrders(orders: HashSettledOrder[]) {
    const groups = new Map<string, SettlementGroup>()
    for (const order of orders) {
      if (order.status !== 'WIN' && order.status !== 'LOSE') continue
      const key = `${order.status}:${order.currency}`
      const group = groups.get(key) ?? {
        currency: order.currency,
        status: order.status,
        betAmount: 0,
        payoutAmount: 0
      }
      group.betAmount = roundAmount(group.betAmount + order.amount)
      group.payoutAmount = roundAmount(group.payoutAmount + order.payoutAmount)
      groups.set(key, group)
    }
    return [...groups.values()].sort(
      (a, b) => Number(a.status === 'LOSE') - Number(b.status === 'LOSE')
    )
  }

  /** 用 HTTP 结算记录生成本人中奖消息，并按赢后输排列弹窗。 */
  function acceptRecentBets(anchorBlockNum: number, response: HashRecentBetsResponse) {
    const roundKey = `${gameCode.value}:${anchorBlockNum}`
    if (
      !activeRoom.value ||
      !response.success ||
      response.code !== 'C2' ||
      !response.result ||
      settledRounds.has(roundKey)
    )
      return false

    const expectedOrderNos = [...placedOrders.entries()]
      .filter(
        ([, placed]) =>
          placed.gameCode === gameCode.value && placed.anchorBlockNum === anchorBlockNum
      )
      .map(([orderNo]) => orderNo)
    if (!expectedOrderNos.length) return false

    const orders = selectRoundOrders(anchorBlockNum, response.result.list)
    if (expectedOrderNos.some(orderNo => !orders.some(order => order.orderNo === orderNo)))
      return false
    if (orders.some(order => !['WIN', 'LOSE', 'CANCEL'].includes(order.status))) return false

    settledRounds.add(roundKey)
    const groups = groupSettledOrders(orders)
    const notices: HashSettlementNotice[] = []
    for (const group of groups) {
      const id = `settlement:${roundKey}:${group.status}:${group.currency}`
      const amount =
        group.status === 'WIN' ? roundAmount(group.payoutAmount - group.betAmount) : group.betAmount
      if (group.status === 'WIN') {
        feed.append({
          id,
          kind: 'SELF_WIN',
          source: 'http',
          time: Date.now(),
          currency: group.currency,
          anchorBlockNum,
          betAmount: group.betAmount,
          payoutAmount: group.payoutAmount,
          profit: amount
        })
      }
      notices.push({ id, status: group.status, currency: group.currency, anchorBlockNum, amount })
    }
    settlementQueue.value = [...settlementQueue.value, ...notices]
    return true
  }

  /** 关闭当前结算提示后，展示队列中的下一币种或下一状态。 */
  function dismissSettlement() {
    settlementQueue.value = settlementQueue.value.slice(1)
  }

  /** 开启一个新的模拟房间；后续可替换为独占 WS 的连接入口。 */
  function openMockRoom(code: string) {
    const generation = ++roomGeneration
    feed.clear()
    placedOrders.clear()
    settledRounds.clear()
    settlementQueue.value = []
    onlineCount.value = 0
    betStats.value = {}
    activeRoom.value = `CHAT:${code}`
    void loadHistory(code, generation)
  }

  /** 离开游戏时结束当前模拟会话，真实连接接入后在此关闭 WS。 */
  function closeRoom() {
    roomGeneration += 1
    activeRoom.value = ''
    feed.clear()
    placedOrders.clear()
    settledRounds.clear()
    settlementQueue.value = []
  }

  watch(gameCode, openMockRoom, { immediate: true })
  onScopeDispose(closeRoom)

  return {
    messages: feed.messages,
    activeRoom,
    onlineCount,
    betStats,
    currentSettlement,
    acceptWsEvent,
    acceptSuccessfulBet,
    acceptHttpDraw,
    acceptRecentBets,
    dismissSettlement,
    closeRoom
  }
}
