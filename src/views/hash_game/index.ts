import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { normalizeDisplayCurrencyCode, useDisplayCurrency } from '@/composables/useDisplayCurrency'
import Api from '@/api'
import type {
  HashGameLotteryGame,
  HashGameLotteryInfo,
  HashGameLotteryIssue
} from '@/api/interface/hash_game.interface'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useUserBalancePolling } from '@/composables/useUserBalancePolling'
import { useAuthModalStore } from '@/stores/authModal'
import { useUserStore } from '@/stores/user'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import { useHashGameChat } from './chat/useHashGameChat'
import { useHashGameSockets } from './chat/useHashGameSockets'
import { type HashChatConfig } from './chat/config'
import { queryHashChatConfig } from '@/api/modules/hash-game-chat'
import { requestHashGames } from './gameList'
import { useHashGameBetting } from './useHashGameBetting'
import {
  BET_COLORS,
  BET_KEYS,
  MARKET_OPTIONS,
  buildRoadColumns,
  formatOdds,
  formatStakeAmount,
  issueExplorerUrl,
  issueOutcome,
  recentGameBets,
  timestampMillis,
  type BetKey,
  type RecentBetRecord,
  type RecentBetSummary,
  type RoadmapMode
} from './lotteryDisplay'
import backgroundMusicUrl from '@/static/mp3/hash/beijing.mp3?url'

type ChipOption = { id: number; value: number; hue: number }
type ChipDraft = { id: number; value: string; hue: number; enabled: boolean }
type CustomChipDraft = { id: number; value: string; hue: number }
export type HashGameHistoryRecord = {
  id: number
  block: string
  digit: string
  outcomes: BetKey[]
  colorOutcome?: BetKey
  hashHighlight: 'digit' | 'sum' | 'lucky'
  blockHash: string
  explorerUrl: string
}
const EMPTY_BET_SUMMARY: RecentBetSummary = {
  count: 0,
  totalBetAmount: 0,
  profitLoss: 0
}

// H5、PC 共用筹码配置，面额与配色保持在同一项中。
const CHIP_OPTIONS = [
  { value: 1, hue: 0 },
  { value: 5, hue: 80 },
  { value: 10, hue: 145 },
  { value: 20, hue: 205 },
  { value: 50, hue: 255 },
  { value: 100, hue: 185 },
  { value: 200, hue: 225 },
  { value: 500, hue: 320 },
  { value: 1000, hue: 50 },
  { value: 2000, hue: 270 },
  { value: 5000, hue: 20 },
  { value: 10000, hue: 105 },
  { value: 20000, hue: 300 },
  { value: 50000, hue: 135 },
  { value: 100000, hue: 285 }
] as const
const CUSTOM_CHIP_HUES = [190, 215, 245, 275, 305]

/** 组合哈希游戏页面的投注、走势和聊天室状态。 */
const createHashGamePageState = () => {
  const { t, locale } = useI18n()
  const isMobile = useIsMobile()
  const router = useRouter()
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()
  userStore.syncStoredUserData()
  const account = computed(() => {
    const memberId = userStore.acctInfo?.memberId
    const token = userStore.userInfo?.tradeToken
    return memberId || token ? String(memberId || userStore.userInfo?.memberId || token) : ''
  })
  const { isRefreshingBalance } = storeToRefs(userStore)
  const currencyOverride = ref<string>()
  const currency = useDisplayCurrency(currencyOverride)
  const hashGames = ref<HashGameLotteryGame[]>([])
  const selectedHashGameCode = ref('')
  const hashGameInfo = ref<HashGameLotteryInfo | null>(null)
  const hashGameInfoCurrency = ref('')
  const roadmapIssues = ref<HashGameLotteryIssue[]>([])
  const roadmapStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const recentBets = ref<RecentBetRecord[]>([])
  const recentBetSummary = ref<RecentBetSummary>(EMPTY_BET_SUMMARY)
  const selectedHashGame = computed(() =>
    hashGames.value.find(game => game.gameCode === selectedHashGameCode.value)
  )
  const hashGameName = computed(() => selectedHashGame.value?.gameName ?? '')
  let gameListRequestId = 0
  let gameInfoRequestId = 0
  let recentBetsRequestId = 0
  let clockOffset = 0
  const now = ref(Date.now())
  let countdownInterval: ReturnType<typeof setInterval> | undefined
  let roundRefreshPending = false
  let lastRoundRefreshAt = 0

  const clearRecentBets = () => {
    recentBetsRequestId++
    recentBets.value = []
    recentBetSummary.value = EMPTY_BET_SUMMARY
  }
  watch(account, clearRecentBets, { flush: 'sync' })

  /** 清空上一玩法的详情、走势和投注记录。 */
  const clearHashGameDisplay = () => {
    hashGameInfo.value = null
    hashGameInfoCurrency.value = ''
    roadmapIssues.value = []
    roadmapStatus.value = 'idle'
    clearRecentBets()
  }

  /** 用路单接口返回的 items 更新当前玩法，区分空路单和请求失败。 */
  const loadHashGameRoadmap = async (gameCode: string, requestId: number) => {
    roadmapStatus.value = 'loading'
    try {
      const { result } = await Api.hashGame.getHashGameRoadmap(gameCode)
      if (requestId !== gameInfoRequestId) return
      if (!Array.isArray(result?.items)) throw new Error('路单响应缺少 items')
      roadmapIssues.value = result.items
      roadmapStatus.value = 'ready'
    } catch (error) {
      if (requestId !== gameInfoRequestId) return
      roadmapStatus.value = 'error'
      console.error(error)
    }
  }

  /** 获取玩法详情和历史路单，切换游戏或货币后忽略旧响应。 */
  const loadHashGameInfo = async (
    gameCode: string,
    currencyCode: string,
    refreshRoundOnly = false
  ) => {
    const requestId = ++gameInfoRequestId
    const startedAt = Date.now()
    await Promise.allSettled([
      Api.hashGame
        .getHashGameInfo({ gameCode, currency: currencyCode })
        .then(async ({ result }) => {
          if (
            requestId !== gameInfoRequestId ||
            result?.gameCode !== gameCode ||
            currencyCode !== currency.currentCurrencyCode.value
          )
            return
          const roundChanged = result.anchorBlockNum !== hashGameInfo.value?.anchorBlockNum
          now.value = Date.now()
          const serverTime = timestampMillis(result.serverTime)
          clockOffset = serverTime ? serverTime - (startedAt + now.value) / 2 : 0
          hashGameInfo.value = result
          hashGameInfoCurrency.value = currencyCode
          if (refreshRoundOnly && roundChanged) await loadHashGameRoadmap(gameCode, requestId)
        }),
      refreshRoundOnly ? undefined : loadHashGameRoadmap(gameCode, requestId)
    ])
  }

  const refreshHashGameRound = async () => {
    const info = hashGameInfo.value
    const currentTime = Date.now()
    if (!info || roundRefreshPending || currentTime - lastRoundRefreshAt < 3000) return
    lastRoundRefreshAt = currentTime
    roundRefreshPending = true
    try {
      await loadHashGameInfo(info.gameCode, currency.currentCurrencyCode.value, true)
    } finally {
      roundRefreshPending = false
    }
  }

  /** 首次进入时选中列表第一项，刷新列表时优先保留仍可用的玩法。 */
  const loadHashGameList = async () => {
    const requestId = ++gameListRequestId
    const previousCode = selectedHashGameCode.value
    gameInfoRequestId++
    clearHashGameDisplay()
    hashGames.value = []
    selectedHashGameCode.value = ''
    const requestedCurrency = currency.currentCurrencyCode.value
    try {
      const games = await requestHashGames(requestedCurrency, locale.value, { refresh: true })
      if (requestId !== gameListRequestId) return
      hashGames.value = games
      const game =
        hashGames.value.find(item => item.gameCode === previousCode) ?? hashGames.value[0]
      if (!game) return
      selectedHashGameCode.value = game.gameCode
      await loadHashGameInfo(game.gameCode, requestedCurrency)
    } catch (error) {
      console.error(error)
    }
  }

  /** H5 和 PC 均按真实游戏编码切换玩法。 */
  const selectHashGame = async (gameCode: string) => {
    periodsOpen.value = false
    if (!hashGames.value.some(game => game.gameCode === gameCode)) return
    if (gameCode === selectedHashGameCode.value && hashGameInfo.value) {
      if (roadmapStatus.value === 'error') {
        await loadHashGameRoadmap(gameCode, gameInfoRequestId)
      }
      return
    }
    selectedHashGameCode.value = gameCode
    clearHashGameDisplay()
    await loadHashGameInfo(gameCode, currency.currentCurrencyCode.value)
  }

  /** 打开近期投注时，读取当前玩法与币种的真实记录和汇总。 */
  const loadRecentBets = async () => {
    const gameCode = selectedHashGameCode.value
    const currencyCode = currency.currentCurrencyCode.value
    if (!gameCode || !currencyCode || !account.value) return
    const requestId = ++recentBetsRequestId
    try {
      const { result, success } = await Api.hashGame.getHashGameRecentBets({
        gameCode,
        currency: currencyCode
      })
      if (requestId !== recentBetsRequestId || success === false || !Array.isArray(result?.list))
        return
      const { records, summary } = recentGameBets(result.list, gameCode, currencyCode)
      recentBets.value = records
      recentBetSummary.value = summary
    } catch (error) {
      console.error(error)
    }
  }

  /** 页面挂载后加载玩法，并按服务端时间更新倒计时显示。 */
  onMounted(() => {
    countdownInterval = setInterval(() => {
      now.value = Date.now()
      const deadline = timestampMillis(hashGameInfo.value?.nextAnchorEstimatedTime)
      if (deadline && now.value + clockOffset >= deadline) void refreshHashGameRound()
    }, 1000)
    void loadHashGameList()
  })
  watch([currency.currentCurrencyCode, locale], () => void loadHashGameList())

  // 与首页共用余额请求及进行中的查询，进入路由时刷新，离开时停止监听。
  useUserBalancePolling()
  // H5 使用全屏内滚动，需要锁定背景页面；PC 交由主布局滚动，保持 CommonFooter 可达。
  usePageScrollLock(() => isMobile.value)

  const gameCode = selectedHashGameCode
  const chat = useHashGameChat(gameCode)
  const acceptWsEvent = chat.acceptWsEvent
  /** 优先使用请求层保存的认证令牌，缺失时回退用户资料中的交易令牌。 */
  const hashGameSocketToken = computed(() => {
    const storedToken =
      typeof window === 'undefined'
        ? ''
        : String(window.localStorage.getItem('xAuthToken') ?? '').trim()
    return storedToken || String(userStore.userInfo?.tradeToken ?? '').trim()
  })
  // Hash 游戏同时建立默认业务通道和公共聊天室通道；连接重建时由聊天室重新加载当前可展示消息。
  useHashGameSockets(gameCode, hashGameSocketToken, {
    onChatEvent: acceptWsEvent,
    onChatReconnect: chat.reloadChatMessages,
    onDefaultEvent: event => {
      if (event.code !== 0) return
      if (event.type === 'BLOCK_RESULT') {
        const anchor = hashGameInfo.value?.anchorBlockNum
        const block = event.data?.blockNum
        if (typeof anchor === 'number' && typeof block === 'number' && block >= anchor)
          void refreshHashGameRound()
      }
      if (
        event.type === 'CHAIN_LOTTERY_SETTLE' &&
        event.data?.currency === currency.currentCurrencyCode.value
      )
        void userStore.refreshBalance({ force: true })
    }
  })
  /** 当前阶段用本地模拟发送回包更新聊天室。 */
  const sendMockChatMessage = chat.acceptMockChatMessage
  const chatConfig = ref<HashChatConfig | null>(null)

  /** 按当前游戏读取真实聊天配置及本人投注展示方式。 */
  const refreshChatConfig = async () => {
    const code = gameCode.value
    chatConfig.value = null
    chat.betBroadcastMode.value = 'INDIVIDUAL'
    if (!code) return
    try {
      const response = await queryHashChatConfig(code)
      if (code !== gameCode.value || !response.success || !response.result) return
      chatConfig.value = response.result
      chat.betBroadcastMode.value = response.result.betBroadcastMode || 'INDIVIDUAL'
      chat.acceptWelcomeText(response.result.welcomeText)
    } catch {
      /* 下一次配置刷新时重试。 */
    }
  }

  /** 进入游戏或切换游戏时读取当前房间的聊天配置。 */
  watch(gameCode, refreshChatConfig, { immediate: true })
  const periodsOpen = ref(false)
  const historyPopupOpen = ref(false)
  const periodTriggerRef = ref<HTMLElement | null>(null)
  const periodMenuRef = ref<HTMLElement | null>(null)
  const currencyPopupOpen = ref(false)
  const roadmapVisible = ref(true)
  const roadmapMode = ref<RoadmapMode>('size')
  const chipOptions = ref<ChipOption[]>(CHIP_OPTIONS.map((chip, id) => ({ id, ...chip })))
  const selectedChip = ref(1)
  const chipEditorOpen = ref(false)
  const quickBetEnabled = ref(false)
  const quickBetPopupOpen = ref(false)
  // 背景音乐和游戏音效默认关闭，由 H5 与 PC 共用开关状态。
  const backgroundMusicEnabled = ref(false)
  const musicEnabled = ref(false)
  let backgroundAudio: HTMLAudioElement | undefined
  const chipEditorItems = ref<ChipDraft[]>([])
  const customChipItems = ref<CustomChipDraft[]>(
    CUSTOM_CHIP_HUES.map((hue, index) => ({
      id: 15 + index,
      value: '',
      hue
    }))
  )
  const editingChipId = ref(0)
  const keypadOpen = ref(false)
  const keypadValue = ref('')
  const chipEditorError = ref('')
  const chatVisible = ref(true)

  const algorithm = computed(
    () => hashGameInfo.value?.algorithm ?? selectedHashGame.value?.algorithm
  )
  const marketOptions = computed(() =>
    algorithm.value ? (MARKET_OPTIONS[algorithm.value] ?? []) : []
  )
  const betting = useHashGameBetting({
    account,
    currency: currency.currentCurrencyCode,
    gameCode,
    info: computed(() =>
      hashGameInfoCurrency.value === currency.currentCurrencyCode.value ? hashGameInfo.value : null
    ),
    now: computed(() => now.value + clockOffset),
    markets: marketOptions,
    balance: currency.currentBalance,
    quickBet: quickBetEnabled,
    openLogin: () => authModalStore.openLoginModal(),
    refreshBalance: async () => Boolean(await userStore.refreshBalance({ force: true })),
    notify: (key, type = 'fail') => globalShowToast({ message: t(key), type }),
    onPlaced: chat.acceptSuccessfulBet
  })
  const selectBet = (option: BetKey) => {
    if (!marketOptions.value.some(market => BET_KEYS[market] === option)) return
    const chip = chipOptions.value.find(item => item.value === selectedChip.value)
    if (chip) return betting.addChips([{ option, amount: chip.value, hue: chip.hue }])
  }
  const hasBetAmount = (key: BetKey) => (betting.betTotals.value[key] ?? 0) > 0
  const roadmapModes = computed<RoadmapMode[]>(() => {
    if (algorithm.value === 'PARITY') return ['size', 'parity']
    if (algorithm.value === 'SUM') return ['parity']
    return algorithm.value ? ['winner'] : []
  })
  watch(
    roadmapModes,
    modes => {
      if (!modes.includes(roadmapMode.value)) roadmapMode.value = modes[0] ?? 'size'
    },
    { immediate: true }
  )

  // 先用详情或列表的最近开奖填充，重复的期号以路单接口为准。
  const issues = computed(() => {
    const recentIssues =
      hashGameInfo.value?.recentIssues ?? selectedHashGame.value?.recentIssues ?? []
    const byBlock = new Map(recentIssues.map(issue => [issue.anchorBlockNum, issue] as const))
    for (const issue of roadmapIssues.value) {
      byBlock.set(issue.anchorBlockNum, issue)
    }
    return [...byBlock.values()].sort((a, b) => b.anchorBlockNum - a.anchorBlockNum).slice(0, 300)
  })
  const latestIssue = computed(() => issues.value[0])
  const round = computed(() => {
    const info = hashGameInfo.value
    const deadline = timestampMillis(info?.nextAnchorEstimatedTime)
    const online =
      chat.onlineCount.value ?? info?.onlineCount ?? selectedHashGame.value?.onlineCount
    return {
      online: online?.toLocaleString() ?? '—',
      lastBlock: latestIssue.value?.anchorBlockNum ?? '—',
      currentBlock: info?.anchorBlockNum ?? '—',
      explorerUrl: latestIssue.value
        ? issueExplorerUrl(latestIssue.value.explorerUrl, latestIssue.value.anchorBlockNum)
        : undefined,
      countdown: deadline
        ? Math.max(0, Math.ceil((deadline - now.value - clockOffset) / 1000))
        : '—'
    }
  })

  /** 赔率取详情接口，人数和金额取当前玩法、期号和币种的 WS 快照。 */
  const betOptions = computed(() => {
    const info = hashGameInfo.value
    const snapshot =
      info?.gameCode === gameCode.value && typeof info.anchorBlockNum === 'number'
        ? chat.betStats.value.get(info.anchorBlockNum)
        : undefined
    const stats = snapshot?.stats[currency.currentCurrencyCode.value]
    const total = marketOptions.value.reduce(
      (sum, option) => sum + (Number(stats?.[option]?.totalAmount) || 0),
      0
    )
    return marketOptions.value.map(option => {
      const key = BET_KEYS[option]
      const item = stats?.[option]
      const amount = Number(item?.totalAmount) || 0
      return {
        key,
        label: t(`hashGame.${key}`),
        color: BET_COLORS[key],
        odds: formatOdds(info?.oddsConfig, option),
        people: snapshot ? (item?.participantCount ?? 0) : '—',
        amount: snapshot ? formatStakeAmount(item?.totalAmount ?? 0) : '—',
        progress: total > 0 ? Math.round((amount / total) * 100) : 0
      }
    })
  })
  const betGridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${Math.max(1, betOptions.value.length)}, minmax(0, 1fr))`
  }))
  const defaultOdds = computed(() => betOptions.value[0]?.odds ?? '—')

  /** 对外接收 HTTP 开奖结果；请求时机与接口来源以后接入。 */
  const acceptHttpDraw = chat.acceptHttpDraw

  /** 对外接收 HTTP 结算结果；真实 HTTP 请求完成后还需刷新余额。 */
  const acceptRecentBets = chat.acceptRecentBets

  /** 关闭当前结算提示，依次展示下一币种及下一输赢状态。 */
  const dismissSettlement = chat.dismissSettlement

  // 聊天列表和结算弹窗共用页面状态，H5 / PC 可使用同一数据入口。
  const chatMessages = chat.messages
  const currentSettlement = chat.currentSettlement

  /** 用最近已开奖区块的哈希展示判定数字，和值玩法高亮末尾三个数字。 */
  const hashParts = computed(() => {
    const hash = latestIssue.value?.blockHash
    if (!hash) return { before: '—', digit: '', after: '' }
    const digits = [...hash.matchAll(/[0-9]/g)]
    const lastDigit = digits[digits.length - 1]?.index
    const first =
      algorithm.value === 'LUCKY'
        ? hash.length - 2
        : algorithm.value === 'SUM'
          ? digits[Math.max(0, digits.length - 3)]?.index
          : lastDigit
    const end = algorithm.value === 'LUCKY' ? hash.length : (lastDigit ?? -1) + 1
    if (first === undefined || first < 0)
      return { before: `…${hash.slice(-6)}`, digit: '', after: '' }
    return {
      before: `…${hash.slice(Math.min(first, Math.max(hash.length - 6, 0)), first)}`,
      digit: hash.slice(first, end),
      after: hash.slice(end)
    }
  })

  /** 从接口结果中提取与当前算法对应的开奖方向。 */
  const getIssueOutcomes = (issue: HashGameLotteryIssue) =>
    [...roadmapModes.value].reverse().flatMap(mode => issueOutcome(issue.result, mode) ?? [])

  const roundOutcome = computed(() =>
    latestIssue.value
      ? getIssueOutcomes(latestIssue.value)
          .map(key => t(`hashGame.${key}`))
          .join('、')
      : ''
  )
  const historyRecords = computed<HashGameHistoryRecord[]>(() => {
    const hashHighlight =
      algorithm.value === 'SUM' ? 'sum' : algorithm.value === 'LUCKY' ? 'lucky' : 'digit'
    const colorMode =
      hashHighlight === 'lucky'
        ? 'winner'
        : selectedHashGameCode.value === 'CL_TAIL_BS'
          ? 'size'
          : 'parity'
    return issues.value.map(issue => ({
      id: issue.anchorBlockNum,
      block: String(issue.anchorBlockNum),
      digit: String(issue.result.sum ?? issue.result.digit ?? issue.result.lastTwo ?? '—'),
      outcomes: getIssueOutcomes(issue),
      colorOutcome: issueOutcome(issue.result, colorMode),
      hashHighlight,
      blockHash: issue.blockHash,
      explorerUrl: issueExplorerUrl(issue.explorerUrl, issue.anchorBlockNum)
    }))
  })

  /** 关闭页面中打开的所有浮层。 */
  const closeOverlays = () => {
    periodsOpen.value = false
    historyPopupOpen.value = false
    chipEditorOpen.value = false
    quickBetPopupOpen.value = false
    keypadOpen.value = false
    currencyPopupOpen.value = false
  }

  /** 点击周期菜单外部时收起菜单。 */
  const handlePeriodOutsidePointerDown = (event: PointerEvent) => {
    if (!periodsOpen.value || !(event.target instanceof Node)) return
    if (
      periodTriggerRef.value?.contains(event.target) ||
      periodMenuRef.value?.contains(event.target)
    ) {
      return
    }
    periodsOpen.value = false
  }

  /** 用相同的历史期数计算计数、连开次数和路单。 */
  const roadmap = computed(() => {
    const mode = roadmapModes.value.includes(roadmapMode.value)
      ? roadmapMode.value
      : roadmapModes.value[0]
    const history = mode
      ? [...issues.value].reverse().flatMap(issue => issueOutcome(issue.result, mode) ?? [])
      : []
    const keys: readonly BetKey[] =
      mode === 'size'
        ? ['big', 'small']
        : mode === 'parity'
          ? ['odd', 'even']
          : algorithm.value === 'LUCKY'
            ? ['win', 'lose']
            : marketOptions.value.map(option => BET_KEYS[option])
    const latest = history[history.length - 1]
    let count = 0
    for (let index = history.length - 1; index >= 0 && history[index] === latest; index--) count++
    const counts = keys.map((key, index) => ({
      key,
      label: t(`hashGame.${key}Mark`),
      count: history.filter(value => value === key).length,
      color: ['#22A89A', '#E63533', '#407FFF'][index]
    }))
    const labels = new Map(counts.map(entry => [entry.key, entry]))
    const emptyMessage = history.length
      ? ''
      : roadmapStatus.value === 'ready'
        ? t('common.noData')
        : roadmapStatus.value === 'error'
          ? t('common.requestError')
          : ''
    return {
      counts,
      emptyMessage,
      columns: buildRoadColumns(history).map(column =>
        column.map(key => (key ? labels.get(key) : undefined))
      ),
      streak:
        latest && count >= 3 ? t('hashGame.streak', { name: t(`hashGame.${latest}`), count }) : ''
    }
  })

  /** 切换快捷投注开关。 */
  const toggleQuickBet = () => {
    if (!betting.busy.value) quickBetEnabled.value = !quickBetEnabled.value
  }

  /** 控制快捷投注弹层的开合，开关值与弹层显隐分别保存。 */
  const toggleQuickBetPopup = () => {
    quickBetPopupOpen.value = !quickBetPopupOpen.value
  }

  /** 点击弹层外部或按 Escape 时只关闭弹层，不重置快捷投注开关。 */
  const closeQuickBetPopup = () => {
    quickBetPopupOpen.value = false
  }

  /** 切换背景音乐开关状态。 */
  const toggleBackgroundMusic = () => {
    const enabled = !backgroundMusicEnabled.value
    backgroundMusicEnabled.value = enabled
    if (typeof Audio === 'undefined') return
    if (!backgroundAudio) {
      backgroundAudio = new Audio(backgroundMusicUrl)
      backgroundAudio.loop = true
      backgroundAudio.volume = 0.35
    }
    if (enabled) {
      void backgroundAudio.play().catch(() => {})
    } else {
      backgroundAudio.pause()
      backgroundAudio.currentTime = 0
    }
  }

  /** 切换游戏音乐开关状态。 */
  const toggleMusic = () => {
    musicEnabled.value = !musicEnabled.value
  }

  onBeforeUnmount(() => {
    gameListRequestId++
    gameInfoRequestId++
    recentBetsRequestId++
    if (countdownInterval) clearInterval(countdownInterval)
    backgroundAudio?.pause()
    if (backgroundAudio) backgroundAudio.currentTime = 0
  })

  /** 刷新余额；未登录时打开登录弹窗，失败时提示错误。 */
  const refreshBalance = async () => {
    if (isRefreshingBalance.value) return
    if (!userStore.userInfo?.tradeToken && !userStore.acctInfo?.memberId) {
      authModalStore.openLoginModal()
      return
    }
    await userStore.refreshBalance()
    if (userStore.balanceRefreshError) {
      globalShowToast({ message: t('common.requestError'), type: 'fail' })
    }
  }

  /** 打开币种选择弹窗并收起周期菜单。 */
  const openCurrencyPopup = () => {
    periodsOpen.value = false
    currencyPopupOpen.value = true
  }

  /** 设置展示币种，并清除当前投注选择。 */
  const selectCurrency = (code: string) => {
    currencyOverride.value = normalizeDisplayCurrencyCode(code)
    currency.setDisplayCurrency(code)
    currencyPopupOpen.value = false
  }

  /** 返回上一页；没有历史记录时回到首页。 */
  const handleBack = () => {
    if (router.options.history.state.back) router.back()
    else void navigateTo('/', { replace: true })
  }

  /** 打开历史记录弹窗并收起周期菜单。 */
  const openRecords = () => {
    periodsOpen.value = false
    historyPopupOpen.value = true
  }

  /** 关闭历史记录弹窗。 */
  const closeRecords = () => {
    historyPopupOpen.value = false
  }

  /** 选择筹码金额并关闭筹码设置面板。 */
  const chooseChip = (value: number) => {
    selectedChip.value = value
    chipEditorOpen.value = false
  }

  /** 根据当前启用状态初始化筹码设置面板。 */
  const openChipEditor = () => {
    periodsOpen.value = false
    chipEditorItems.value = CHIP_OPTIONS.map((chip, id) => ({
      id,
      ...chip,
      value: String(chip.value),
      enabled: chipOptions.value.some(option => option.id === id)
    }))
    customChipItems.value = customChipItems.value.map(chip => ({ ...chip }))
    chipEditorError.value = ''
    keypadOpen.value = false
    chipEditorOpen.value = true
  }

  /** 打开指定自定义筹码的金额键盘。 */
  const editCustomChip = (chip: CustomChipDraft) => {
    editingChipId.value = chip.id
    keypadValue.value = ''
    chipEditorError.value = ''
    keypadOpen.value = true
  }

  /** 切换预设筹码是否显示。 */
  const togglePresetChip = (id: number) => {
    const chip = chipEditorItems.value.find(item => item.id === id)
    if (chip) chip.enabled = !chip.enabled
  }

  /** 在自定义筹码金额中输入数字或删除末位。 */
  const appendKeypadValue = (key: string) => {
    if (key === 'delete') keypadValue.value = keypadValue.value.slice(0, -1)
    else if (keypadValue.value.length < 7) keypadValue.value += key
    chipEditorError.value = ''
  }

  /** 校验并保存自定义筹码金额。 */
  const confirmKeypadValue = () => {
    const custom = customChipItems.value.find(chip => chip.id === editingChipId.value)
    if (!custom) return
    const value = Number(keypadValue.value)
    if (
      !/^\d+$/.test(keypadValue.value) ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value > 9999999
    ) {
      chipEditorError.value = t('hashGame.invalidChipAmount')
      return
    }
    const duplicatePreset = chipEditorItems.value.some(chip => Number(chip.value) === value)
    const duplicateCustom = customChipItems.value.some(
      chip => chip.id !== custom.id && Number(chip.value) === value
    )
    if (duplicatePreset || duplicateCustom) {
      chipEditorError.value = t('hashGame.duplicateChipAmount')
      return
    }
    custom.value = String(value)
    keypadOpen.value = false
    chipEditorError.value = ''
  }

  /** 保存筹码设置，并同步更新当前选中的筹码。 */
  const saveChipEditor = () => {
    const updatedChips: ChipOption[] = [
      ...customChipItems.value
        .filter(chip => chip.value)
        .map(chip => ({
          id: chip.id,
          hue: chip.hue,
          value: Number(chip.value)
        })),
      ...chipEditorItems.value
        .filter(chip => chip.enabled)
        .map(chip => ({ id: chip.id, hue: chip.hue, value: Number(chip.value) }))
    ]

    // 按固定槽位替换金额，保持配色、排列和当前选中筹码一致。
    const selectedId = chipOptions.value.find(chip => chip.value === selectedChip.value)?.id
    chipOptions.value = updatedChips
    customChipItems.value = customChipItems.value.map(chip => ({ ...chip }))
    const selected = updatedChips.find(chip => chip.id === selectedId)
    if (selected) selectedChip.value = selected.value
    else if (updatedChips.length) selectedChip.value = updatedChips[0].value
    chipEditorOpen.value = false
  }

  return {
    t,
    ...currency,
    isRefreshingBalance,
    hashGames,
    hashGameName,
    selectedHashGameCode,
    selectHashGame,
    periodsOpen,
    historyPopupOpen,
    historyRecords,
    periodTriggerRef,
    periodMenuRef,
    currencyPopupOpen,
    roadmapVisible,
    roadmapMode,
    chipOptions,
    selectedChip,
    chipEditorOpen,
    quickBetEnabled,
    quickBetPopupOpen,
    backgroundMusicEnabled,
    musicEnabled,
    chipEditorItems,
    customChipItems,
    editingChipId,
    keypadOpen,
    keypadValue,
    appendKeypadValue,
    confirmKeypadValue,
    editCustomChip,
    togglePresetChip,
    chipEditorError,
    chatVisible,
    chatMessages,
    chatConfig,
    refreshChatConfig,
    sendMockChatMessage,
    currentSettlement,
    acceptWsEvent,
    acceptHttpDraw,
    acceptRecentBets,
    dismissSettlement,
    betChips: betting.chips,
    betTotals: betting.betTotals,
    betBusy: betting.busy,
    canCancelBet: betting.canCancel,
    canRepeatBet: betting.canRepeat,
    canConfirmBet: betting.canConfirm,
    hasBetAmount,
    round,
    roundOutcome,
    hashParts,
    recentBets,
    recentBetSummary,
    loadRecentBets,
    roadmap,
    roadmapModes,
    betOptions,
    betGridStyle,
    defaultOdds,
    refreshBalance,
    openCurrencyPopup,
    selectCurrency,
    handleBack,
    openRecords,
    closeRecords,
    selectBet,
    cancelBet: betting.cancelBet,
    repeatBets: betting.repeatBets,
    confirmBets: betting.submitDraft,
    chooseChip,
    toggleQuickBet,
    toggleQuickBetPopup,
    closeQuickBetPopup,
    toggleBackgroundMusic,
    toggleMusic,
    openChipEditor,
    saveChipEditor,
    closeOverlays,
    handlePeriodOutsidePointerDown
  }
}

// 先从内部工厂推导共享状态类型，再导出 composable，避免组件类型引用形成循环推断。
export type HashGamePageState = ReturnType<typeof createHashGamePageState>
export const useHashGamePage: () => HashGamePageState = createHashGamePageState
