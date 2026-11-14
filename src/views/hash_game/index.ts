import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useUserBalancePolling } from '@/composables/useUserBalancePolling'
import { useAuthModalStore } from '@/stores/authModal'
import { useUserStore } from '@/stores/user'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'

type RoadmapMode = 'size' | 'parity'
type BetKey = 'big' | 'small' | 'odd' | 'even'
type ChipOption = { id: number; value: number; hue: number }
type ChipDraft = { id: number; value: string; hue: number; enabled: boolean }
type CustomChipDraft = { id: number; value: string; hue: number }
export const HASH_GAME_PERIOD_OPTIONS = [6, 15, 30, 45] as const
export type RecentBetRecord = {
  id: string
  block: string
  blockHash: string
  selection: 'odd' | 'even'
  betAmount: number
  profitLoss: number
  betTime: string
}
export type RecentBetSummary = {
  betCount: number
  betAmount: number
  todayProfitLoss: number
}
export type HashGameHistoryRecord = {
  id: number
  block: string
  digit: string
  outcome: 'evenSmall' | 'oddBig'
  blockHash: string
}

const MOCK_RECENT_BETS: RecentBetRecord[] = Array.from({ length: 12 }, (_, index) => ({
  id: `ts0768456746746746${index}`,
  block: '85598756',
  blockHash: '89hf84947772d6a3bca88102f7c6943d',
  selection: index % 2 === 0 ? 'odd' : 'even',
  betAmount: 876.98,
  profitLoss: index % 2 === 1 ? 1000 : -1,
  betTime: '12/18/2026 11:14:15 AM'
}))
const MOCK_RECENT_BET_SUMMARY: RecentBetSummary = {
  betCount: 1,
  betAmount: 183.91,
  todayProfitLoss: -876.98
}
const MOCK_HASH_GAME_HISTORY: HashGameHistoryRecord[] = Array.from({ length: 24 }, (_, index) => {
  const evenSmall = index % 2 === 0
  const digit = evenSmall ? '2' : '7'
  return {
    id: index,
    block: '85598756',
    digit,
    outcome: evenSmall ? 'evenSmall' : 'oddBig',
    blockHash: `...8c14fc4fe${digit}`
  }
})

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

// 仅展示用的走势，每列为同一结果连续出现的次数。
const MOCK_RESULT_COLUMNS = [
  [true, 5],
  [false, 3],
  [true, 1],
  [false, 4],
  [true, 2],
  [true, 1],
  [true, 2],
  [false, 1],
  [true, 3],
  [false, 5],
  [true, 1],
  [false, 3],
  [true, 3],
  [false, 1],
  [true, 4],
  [false, 3],
  [true, 5],
  [false, 2],
  [true, 1],
  [false, 4],
  [true, 2],
  [false, 1]
] as const

export const useHashGamePage = () => {
  const { t } = useI18n()
  const router = useRouter()
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()
  userStore.syncStoredUserData()
  const { isRefreshingBalance } = storeToRefs(userStore)
  const currency = useDisplayCurrency()

  // 与首页共用余额请求及进行中的查询，进入路由时刷新，离开时停止监听。
  useUserBalancePolling()
  // 本页为固定全屏布局，页面内容在自身容器内滚动。
  usePageScrollLock(() => true)

  const selectedPeriod = ref(15)
  const periodOptions = HASH_GAME_PERIOD_OPTIONS
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
  const selectedBet = ref<BetKey | null>(null)
  let lastSelection: { key: BetKey; chip: number } | null = null

  const mockRound = reactive({
    online: '2,999',
    lastBlock: '85346144',
    currentBlock: '85346144',
    hash: '...3c2e79',
    countdown: 3,
    positiveCount: 25,
    negativeCount: 22,
    streak: 5
  })
  const hashParts = computed(() => {
    const hash = mockRound.hash
    // 高亮最后一个十进制数字，后面可能仍有哈希字母。
    const match = /[0-9](?=[^0-9]*$)/.exec(hash)
    if (!match) return { before: hash, digit: '', after: '' }
    return {
      before: hash.slice(0, match.index),
      digit: match[0],
      after: hash.slice(match.index + 1)
    }
  })
  const mockBet = { odds: '1.96', people: 86, amount: '30.6K', progress: 36 }

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

  const resultLabels = computed(() => {
    const positive = roadmapMode.value === 'size' ? 'big' : 'odd'
    const negative = roadmapMode.value === 'size' ? 'small' : 'even'
    return {
      positive: t(`hashGame.${positive}Mark`),
      negative: t(`hashGame.${negative}Mark`),
      streak: t('hashGame.streak', { name: t(`hashGame.${positive}`), count: mockRound.streak })
    }
  })

  const resultColumns = MOCK_RESULT_COLUMNS.map(([positive, count], column) =>
    Array.from({ length: 5 }, (_, row) => ({
      id: `${column}-${row}`,
      positive,
      filled: row < count
    }))
  )

  const betOptions = computed(() => [
    { key: 'big' as const, label: t('hashGame.big'), color: '#FF5350' },
    { key: 'small' as const, label: t('hashGame.small'), color: '#407FFF' },
    { key: 'odd' as const, label: t('hashGame.odd'), color: '#34D8C7' },
    { key: 'even' as const, label: t('hashGame.even'), color: '#FF9822' }
  ])

  /** 切换游戏周期并关闭周期菜单。 */
  const selectPeriod = (seconds: number) => {
    selectedPeriod.value = seconds
    periodsOpen.value = false
  }

  // 快捷投注开关
  const toggleQuickBet = () => {
    quickBetEnabled.value = !quickBetEnabled.value
  }

  const toggleQuickBetPopup = () => {
    quickBetPopupOpen.value = !quickBetPopupOpen.value
  }

  const closeQuickBetPopup = () => {
    quickBetPopupOpen.value = false
  }

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
    currency.setDisplayCurrency(code)
    currencyPopupOpen.value = false
    selectedBet.value = null
    lastSelection = null
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

  // 筹码和选项仅作本地选择展示，不调用投注接口、不扣减余额。
  /** 选择投注项并记录当前筹码，供重复投注使用。 */
  const selectBet = (key: BetKey) => {
    selectedBet.value = key
    lastSelection = { key, chip: selectedChip.value }
  }
  /** 清除当前投注项。 */
  const cancelSelection = () => {
    selectedBet.value = null
  }
  /** 恢复上一次投注的投注项和筹码。 */
  const repeatSelection = () => {
    if (!lastSelection) return
    selectedChip.value = lastSelection.chip
    selectedBet.value = lastSelection.key
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

  /** 保存筹码设置，并同步更新当前及上次选中的筹码。 */
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
    const repeatedId = chipOptions.value.find(chip => chip.value === lastSelection?.chip)?.id
    chipOptions.value = updatedChips
    customChipItems.value = customChipItems.value.map(chip => ({ ...chip }))
    const selected = updatedChips.find(chip => chip.id === selectedId)
    if (selected) selectedChip.value = selected.value
    else if (updatedChips.length) selectedChip.value = updatedChips[0].value
    const repeated = updatedChips.find(chip => chip.id === repeatedId)
    if (lastSelection && repeated) lastSelection.chip = repeated.value
    chipEditorOpen.value = false
  }

  return {
    t,
    ...currency,
    isRefreshingBalance,
    selectedPeriod,
    periodOptions,
    periodsOpen,
    historyPopupOpen,
    historyRecords: MOCK_HASH_GAME_HISTORY,
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
    selectedBet,
    mockRound,
    hashParts,
    mockBet,
    recentBets: MOCK_RECENT_BETS,
    recentBetSummary: MOCK_RECENT_BET_SUMMARY,
    resultLabels,
    resultColumns,
    betOptions,
    selectPeriod,
    refreshBalance,
    openCurrencyPopup,
    selectCurrency,
    handleBack,
    openRecords,
    closeRecords,
    selectBet,
    cancelSelection,
    repeatSelection,
    chooseChip,
    toggleQuickBet,
    toggleQuickBetPopup,
    closeQuickBetPopup,
    openChipEditor,
    saveChipEditor,
    closeOverlays,
    handlePeriodOutsidePointerDown
  }
}

export type HashGamePageState = ReturnType<typeof useHashGamePage>
