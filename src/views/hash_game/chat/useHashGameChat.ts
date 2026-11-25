import { computed, onScopeDispose, ref, shallowRef, watch, type Ref } from 'vue'
import { useGameChatFeed } from '@/composables/useGameChatFeed'
import { queryHashChatHistory } from '@/api/modules/hash-game-chat'
import type { HashGamePlaceBetResult } from '@/api/interface/hash_game.interface'
import type {
  HashBetStatsSnapshot,
  HashChatHistoryItem,
  HashChatMessage,
  HashHttpDraw,
  HashPlaceBetRequest,
  HashSettlementNotice,
  HashWsEvent
} from './types'

/** 模拟结算使用八位小数精度，避免浮点累加出现可见尾差。 */
function roundAmount(value: number) {
  return Number(value.toFixed(8))
}

/** 空快照表示清零，格式不完整的推送不覆盖已有统计。 */
function isValidBetStats(stats: HashBetStatsSnapshot['stats']) {
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return false
  return Object.values(stats).every(entries => {
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return false
    return Object.values(entries).every(stat => {
      if (!stat || !Number.isSafeInteger(stat.participantCount) || stat.participantCount < 0)
        return false
      const { totalAmount } = stat
      if (
        typeof totalAmount !== 'number' &&
        (typeof totalAmount !== 'string' || !totalAmount.trim())
      )
        return false
      const amount = Number(totalAmount)
      return Number.isFinite(amount) && amount >= 0
    })
  })
}

/** 管理哈希游戏单次进入页面期间的聊天室和结算展示状态。 */
export function useHashGameChat(gameCode: Ref<string>) {
  const betBroadcastMode = ref('INDIVIDUAL')
  const feed = useGameChatFeed<HashChatMessage>()
  const activeRoom = ref('')
  const onlineCount = ref<number>()
  const betStats = shallowRef(new Map<number, HashBetStatsSnapshot>())
  const settlementQueue = shallowRef<HashSettlementNotice[]>([])
  const currentSettlement = computed(() => settlementQueue.value[0] ?? null)
  const placedOrders = new Map<string, { gameCode: string; anchorBlockNum: number }>()
  const settledOrders = new Set<string>()
  let rawChat: HashChatMessage[] = []
  let historyLoading = false
  let pendingChat: HashChatMessage[] = []
  let roomGeneration = 0
  let welcomeText = ''

  /** 历史与实时消息共用一套展示模型；个人 ID 保留为字符串。 */
  function normalizeHistoryMessage(item: HashChatHistoryItem): HashChatMessage | null {
    const source = 'http' as const
    const id = `${item.scope === 'PRIVATE' ? 'private' : 'public'}:${item.gameCode}:${item.id}`
    if (item.scope === 'PRIVATE') {
      if (item.kind !== 'BET' && item.kind !== 'PAYOUT') return null
      return normalizePrivate({ ...item, kind: item.kind }, source)
    }
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
        id,
        kind: 'USER',
        source: 'http',
        time: item.time,
        nickname: item.nickname ?? '',
        content: item.content ?? '',
        robot: item.robot ?? false
      }
    }
    if (item.kind === 'JOIN' || item.kind === 'LEAVE') {
      return {
        id,
        kind: item.kind,
        source: 'http',
        time: item.time,
        nickname: item.nickname ?? '',
        avatarUrl: item.avatarUrl,
        joinBatchId: item.joinBatchId,
        joinBatchCount: item.joinBatchCount,
        joinBatchNickname: item.joinBatchNickname,
        joinBatchAvatarUrl: item.joinBatchAvatarUrl
      }
    }
    if (item.kind === 'BET') return normalizePublicBet(item, id, source)
    if (item.kind === 'STREAK' || item.kind === 'BIG_WIN' || item.kind === 'PAYOUT')
      return {
        id,
        kind: 'TEXT_NOTICE',
        source,
        time: item.time,
        content: item.content ?? '',
        noticeKind: item.kind,
        betOptions: item.betOptions
      }
    return null
  }

  function normalizePrivate(
    data: HashChatHistoryItem | Record<string, unknown>,
    source: 'http' | 'ws'
  ): HashChatMessage | null {
    const kind = data.kind
    if (kind !== 'BET' && kind !== 'PAYOUT') return null
    const code = String(data.gameCode ?? '')
    const orderNo = typeof data.orderNo === 'string' ? data.orderNo : undefined
    const id = `private:${code}:${String(data.id ?? (orderNo ? `order:${orderNo}` : `${kind}:${data.time}:${data.text}`))}`
    const content =
      typeof data.text === 'string'
        ? data.text
        : typeof data.content === 'string'
          ? data.content
          : ''
    const time = Number(data.time)
    if (!content || !Number.isFinite(time)) return null
    const amount = Number(data.amount)
    const anchorBlockNum = Number(data.anchorBlockNum)
    if (
      kind === 'BET' &&
      orderNo &&
      typeof data.betOption === 'string' &&
      typeof data.currency === 'string' &&
      Number.isFinite(amount) &&
      amount > 0 &&
      Number.isSafeInteger(anchorBlockNum)
    ) {
      return {
        id,
        kind: 'BET',
        source,
        time,
        nickname: 'Me',
        history: source === 'http',
        privateText: content,
        bet: {
          requestId: '',
          gameCode: code,
          anchorBlockNum,
          betOption: data.betOption as HashPlaceBetRequest['betOption'],
          currency: data.currency,
          amount,
          orderNo
        }
      }
    }
    return { id, kind: 'PRIVATE', source, time, content, privateKind: kind, orderNo }
  }

  function normalizePublicBet(
    data: HashChatHistoryItem | Record<string, unknown>,
    id: string,
    source: 'http' | 'ws'
  ): HashChatMessage {
    const amount = Number(data.amount ?? data.betAmount)
    const anchorBlockNum = Number(data.anchorBlockNum)
    const mergeKey = data.mergeKey ?? data.memberKey
    const betOption = data.betOption
    const currency = data.currency
    if (
      typeof mergeKey === 'string' &&
      mergeKey &&
      typeof betOption === 'string' &&
      typeof currency === 'string' &&
      Number.isSafeInteger(anchorBlockNum) &&
      Number.isFinite(amount) &&
      amount > 0
    ) {
      return {
        id,
        kind: 'BET',
        source,
        time: Number(data.time),
        nickname: typeof data.nickname === 'string' ? data.nickname : '',
        count:
          Number.isSafeInteger(Number(data.betCountDelta)) && Number(data.betCountDelta) > 0
            ? Number(data.betCountDelta)
            : 1,
        bet: {
          requestId: '',
          gameCode: String(data.gameCode),
          anchorBlockNum,
          betOption: betOption as HashPlaceBetRequest['betOption'],
          currency,
          amount,
          orderNo: ''
        },
        mergeKey
      }
    }
    return {
      id,
      kind: 'BROADCAST_BET',
      source,
      time: Number(data.time),
      content: typeof data.content === 'string' ? data.content : ''
    }
  }

  /** 以原始消息生成展示行，合并模式按当前期、身份、方向、币种累计。 */
  function publishChat() {
    const notice = feed.messages.value.filter(message => message.kind === 'NOTICE')
    const settlement = feed.messages.value.filter(message => message.kind === 'SELF_WIN')
    const rows: HashChatMessage[] = []
    const groups = new Map<string, string>()
    for (const message of rawChat) {
      if (message.kind !== 'BET' || betBroadcastMode.value !== 'MERGED') {
        rows.push(message)
        continue
      }
      const key = JSON.stringify([
        message.bet.gameCode,
        message.bet.anchorBlockNum,
        message.mergeKey ? `public:${message.mergeKey}` : 'self',
        message.bet.betOption,
        message.bet.currency
      ])
      const groupId = groups.get(key)
      if (groupId === undefined) {
        groups.set(key, message.id)
        rows.push(message)
      } else {
        const index = rows.findIndex(item => item.id === groupId)
        const previous = rows[index]
        if (previous.kind !== 'BET') continue
        rows.splice(index, 1)
        rows.push({
          ...previous,
          time: message.time,
          source: message.source,
          count: (previous.count ?? 1) + (message.count ?? 1),
          revision: (previous.revision ?? 0) + (message.source === 'http' ? 0 : 1),
          bet: { ...previous.bet, amount: roundAmount(previous.bet.amount + message.bet.amount) }
        })
      }
    }
    feed.messages.value = [...notice, ...rows.slice(-200), ...settlement]
  }

  function appendChat(message: HashChatMessage) {
    if (historyLoading) pendingChat.push(message)
    if (rawChat.some(item => item.id === message.id)) return false
    const orderNo =
      message.kind === 'BET'
        ? message.bet.orderNo
        : message.kind === 'PRIVATE' && message.privateKind === 'BET'
          ? message.orderNo
          : undefined
    if (
      orderNo &&
      rawChat.some(item =>
        item.kind === 'BET'
          ? item.bet.orderNo === orderNo
          : item.kind === 'PRIVATE' && item.privateKind === 'BET' && item.orderNo === orderNo
      )
    )
      return false
    rawChat = [...rawChat, message].slice(-200)
    publishChat()
    return true
  }

  /** 请求当前房间历史；房间切换或离开后丢弃旧请求的响应。 */
  async function loadHistory(code: string, generation: number) {
    historyLoading = true
    pendingChat = []
    try {
      const response = await queryHashChatHistory(code)
      if (generation !== roomGeneration || activeRoom.value !== `CHAT:${code}`) return
      if (!response.success || response.code !== 'C2' || response.result?.gameCode !== code) return
      const history = response.result.messages
        .filter(item => item.gameCode === code)
        .map(normalizeHistoryMessage)
        .filter((item): item is HashChatMessage => item !== null)
      const combined = [...history, ...pendingChat]
      const seen = new Set<string>()
      rawChat = combined
        .filter(message => {
          const key =
            message.kind === 'BET' && message.bet.orderNo
              ? `order:${message.bet.orderNo}`
              : message.kind === 'PRIVATE' && message.privateKind === 'BET' && message.orderNo
                ? `order:${message.orderNo}`
                : message.id
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .slice(-200)
      pendingChat = []
      publishChat()
    } catch {
      // 历史接口失败时保留本次会话已经收到的实时消息。
    } finally {
      if (generation === roomGeneration) historyLoading = false
    }
  }

  /** 处理当前房间实时消息，开奖按玩法和期号去重。 */
  function acceptWsEvent(event: HashWsEvent) {
    const code = event.data?.gameCode
    if (!code || event.code !== 0 || code !== gameCode.value || activeRoom.value !== `CHAT:${code}`)
      return

    if (event.type === 'CHAIN_LOTTERY_ONLINE') {
      const count = event.data.onlineCount
      if (Number.isSafeInteger(count) && count >= 0) onlineCount.value = count
      return
    }
    if (event.type === 'CHAIN_LOTTERY_BET_STATS') {
      const { anchorBlockNum, stats } = event.data
      if (!Number.isSafeInteger(anchorBlockNum) || anchorBlockNum <= 0 || !isValidBetStats(stats))
        return
      // 下一期的推送可能先于详情接口到达，保留最近两期的快照。
      const snapshots = new Map(betStats.value).set(anchorBlockNum, event.data)
      if (snapshots.size > 2) snapshots.delete(Math.min(...snapshots.keys()))
      betStats.value = snapshots
      return
    }

    const data = event.data
    // 部分聊天室推送不带 id；用消息本身构造稳定键，避免全部落到 "undefined"。
    const messageId =
      data.id !== undefined && data.id !== null
        ? `ws:${data.gameCode}:${data.id}`
        : `ws:${data.gameCode}:${data.kind}:${data.time}:${data.kind === 'USER' ? `${data.nickname}:${data.content}` : data.kind === 'BET' ? String(data.content ?? '') : data.kind === 'JOIN' || data.kind === 'LEAVE' ? data.nickname : ''}`
    if (data.kind === 'DRAW') {
      appendChat({
        id: `draw:${data.gameCode}:${data.anchorBlockNum}`,
        kind: 'DRAW',
        source: 'ws',
        time: data.time,
        draw: { ...data }
      })
      return
    }
    if (data.kind === 'BET') {
      appendChat(normalizePublicBet(data, `public:${data.gameCode}:${data.id ?? messageId}`, 'ws'))
      return
    }
    if (data.kind === 'USER') {
      appendChat({
        id: `public:${data.gameCode}:${data.id ?? messageId}`,
        kind: 'USER',
        source: 'ws',
        time: data.time,
        nickname: data.nickname,
        content: data.content,
        robot: data.robot
      })
    } else if (data.kind === 'JOIN' || data.kind === 'LEAVE') {
      appendChat({
        id: `public:${data.gameCode}:${data.id ?? messageId}`,
        kind: data.kind,
        source: 'ws',
        time: data.time,
        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
        joinBatchId: data.joinBatchId,
        joinBatchCount: data.joinBatchCount,
        joinBatchNickname: data.joinBatchNickname,
        joinBatchAvatarUrl: data.joinBatchAvatarUrl
      })
    } else if (data.kind === 'STREAK' || data.kind === 'BIG_WIN' || data.kind === 'PAYOUT') {
      appendChat({
        id: `public:${data.gameCode}:${data.id ?? messageId}`,
        kind: 'TEXT_NOTICE',
        source: 'ws',
        time: data.time,
        content: typeof data.content === 'string' ? data.content : '',
        noticeKind: data.kind,
        betOptions: data.kind === 'BIG_WIN' ? data.betOptions : undefined
      })
    }
  }

  function acceptPrivateEvent(data: Record<string, unknown>) {
    if (!activeRoom.value || data.gameCode !== gameCode.value) return
    const message = normalizePrivate(data, 'ws')
    if (message) appendChat(message)
  }

  /** 仅在投注接口成功并返回订单号后插入本人投注消息。 */
  function acceptSuccessfulBet(request: HashPlaceBetRequest, result: HashGamePlaceBetResult) {
    if (
      !activeRoom.value ||
      request.gameCode !== gameCode.value ||
      result.currency !== request.currency ||
      result.anchorBlockNum !== request.anchorBlockNum
    )
      return false

    if (placedOrders.has(result.orderNo)) return false
    placedOrders.set(result.orderNo, {
      gameCode: request.gameCode,
      anchorBlockNum: request.anchorBlockNum
    })
    if (
      rawChat.some(item =>
        item.kind === 'BET'
          ? item.bet.orderNo === result.orderNo
          : item.kind === 'PRIVATE' && item.privateKind === 'BET' && item.orderNo === result.orderNo
      )
    )
      return true
    return appendChat({
      id: `bet:${result.orderNo}`,
      kind: 'BET',
      source: 'local',
      time: Date.now(),
      nickname: 'Me',
      bet: { ...request, currency: result.currency, orderNo: result.orderNo }
    })
  }

  /** 模拟聊天发送成功后插入本人文字消息，正式发送接口接入时替换调用处。 */
  function acceptMockChatMessage(content: string) {
    if (!activeRoom.value || !content.trim()) return false
    return feed.append({
      id: `mock-chat:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      kind: 'USER',
      source: 'local',
      time: Date.now(),
      nickname: 'Me',
      content: content.trim(),
      robot: false
    })
  }

  /** 将聊天配置中的欢迎语作为本次房间公告展示一次。 */
  function acceptWelcomeText(content: string) {
    if (!activeRoom.value || !content.trim()) return false
    welcomeText = content.trim()
    const notice: HashChatMessage = {
      id: `notice:${gameCode.value}`,
      kind: 'NOTICE',
      source: 'local',
      time: Date.now(),
      content: welcomeText
    }
    feed.messages.value = [
      notice,
      ...feed.messages.value.filter(message => message.id !== notice.id)
    ]
    return true
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

  /** 以默认 WS 的结算利润为准，同局、币种和状态的订单合并展示。 */
  function acceptSettlementEvent(data: Record<string, unknown>) {
    const orderNo = typeof data.orderNo === 'string' ? data.orderNo : ''
    const code = typeof data.gameCode === 'string' ? data.gameCode : ''
    const currency = typeof data.currency === 'string' ? data.currency : ''
    const anchorBlockNum = Number(data.anchorBlockNum)
    const status = data.status
    const profit = Number(data.profit)
    if (
      !activeRoom.value ||
      code !== gameCode.value ||
      !orderNo ||
      !currency ||
      !Number.isSafeInteger(anchorBlockNum) ||
      anchorBlockNum <= 0 ||
      !['WIN', 'LOSE', 'REFUND', 'ERROR'].includes(String(status)) ||
      !Number.isFinite(profit) ||
      settledOrders.has(orderNo)
    )
      return false

    settledOrders.add(orderNo)
    const id = `settlement:${code}:${anchorBlockNum}:${currency}:${status}`
    const existing = settlementQueue.value.find(item => item.id === id)
    const drawHash = typeof data.blockHash === 'string' ? data.blockHash.slice(-6) : undefined
    const result =
      data.result && typeof data.result === 'object' && !Array.isArray(data.result)
        ? (data.result as Record<string, unknown>)
        : undefined
    const resultLabel = result
      ? [result.digit, result.oddEven, result.bigSmall]
          .filter(value => value !== undefined && value !== null)
          .join(' · ')
      : undefined
    if (existing) {
      settlementQueue.value = settlementQueue.value.map(item =>
        item.id === id
          ? {
              ...item,
              amount: roundAmount(item.amount + profit),
              drawHash: item.drawHash || drawHash,
              resultLabel: item.resultLabel || resultLabel
            }
          : item
      )
    } else {
      settlementQueue.value = [
        ...settlementQueue.value,
        {
          id,
          gameCode: code,
          status: status as HashSettlementNotice['status'],
          currency,
          anchorBlockNum,
          amount: profit,
          drawHash,
          resultLabel
        }
      ]
    }
    return true
  }

  /** 关闭当前结算提示后，展示队列中的下一币种或下一状态。 */
  function dismissSettlement() {
    settlementQueue.value = settlementQueue.value.slice(1)
  }

  /** 开启一个新的游戏房间，并清理仅属于上一游戏的页面会话状态。 */
  function openRoom(code: string) {
    roomGeneration += 1
    feed.clear()
    rawChat = []
    pendingChat = []
    historyLoading = false
    welcomeText = ''
    placedOrders.clear()
    settledOrders.clear()
    settlementQueue.value = []
    onlineCount.value = undefined
    betStats.value = new Map()
    activeRoom.value = code ? `CHAT:${code}` : ''
  }

  /** 聊天 WS 重连后重新加载当前房间的可展示消息，保留本地已成功下注的结算追踪。 */
  function reloadChatMessages() {
    const code = gameCode.value
    if (!activeRoom.value || activeRoom.value !== `CHAT:${code}`) return

    const generation = ++roomGeneration
    feed.clear()
    rawChat = []
    pendingChat = []
    if (welcomeText) acceptWelcomeText(welcomeText)
    betStats.value = new Map()
    void loadHistory(code, generation)
  }

  /** 离开游戏时结束当前页面会话。 */
  function closeRoom() {
    roomGeneration += 1
    activeRoom.value = ''
    feed.clear()
    rawChat = []
    pendingChat = []
    welcomeText = ''
    placedOrders.clear()
    settledOrders.clear()
    settlementQueue.value = []
  }

  watch(gameCode, openRoom, { immediate: true })
  watch(betBroadcastMode, publishChat)
  onScopeDispose(closeRoom)

  return {
    messages: feed.messages,
    betBroadcastMode,
    activeRoom,
    onlineCount,
    betStats,
    currentSettlement,
    acceptWsEvent,
    acceptPrivateEvent,
    acceptSuccessfulBet,
    acceptMockChatMessage,
    acceptWelcomeText,
    acceptHttpDraw,
    acceptSettlementEvent,
    dismissSettlement,
    reloadChatMessages,
    closeRoom
  }
}
