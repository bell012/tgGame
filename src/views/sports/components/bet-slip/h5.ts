import { computed, onScopeDispose, ref, watch } from 'vue'
import { parseSportsStake } from '../../index'
import type { SportsBetMode, SportsPageState } from '../../index'

export type SportsKeyboardKey = string | 'delete'
export type SportsBetResult = 'idle' | 'confirming' | 'success' | 'failed'

// 金额上下限仅用于本地交互演示，不代表真实投注规则。
export const H5_MIN_STAKE = 5
export const H5_MAX_STAKE = 311.11

/** 自定义数字键盘沿用页面的两位小数金额约束。 */
export const applySportsKeyboardKey = (raw: string, key: string, replace = false): string => {
  if (key === 'delete') return raw.slice(0, -1)
  if (!/^(?:\d|00|\.)$/.test(key)) return raw
  const current = replace ? '' : raw
  if (key === '.' && current.includes('.')) return current
  let next = `${current}${key}`
  if (next.startsWith('.')) next = `0${next}`
  next = next.replace(/^0+(?=\d)/, '')
  return parseSportsStake(next) === null ? raw : next
}

export const getH5StakeError = (raw: string): string => {
  if (!raw) return ''
  const amount = parseSportsStake(raw)
  if (amount === null) return 'Enter a valid amount.'
  if (amount < H5_MIN_STAKE) return `Minimum stake is ${H5_MIN_STAKE.toFixed(2)}.`
  if (amount > H5_MAX_STAKE) return `Maximum stake is ${H5_MAX_STAKE.toFixed(2)}.`
  return ''
}

/** 这里只持有弹层交互状态，投注选项和金额始终写回页面的同一份数据。 */
export const useSportsH5Bet = (page: SportsPageState) => {
  const keyboardOpen = ref(false)
  const quickAmounts = ref([20, 50, 100, 200, 500, 1000])
  const editingAmounts = ref(false)
  const amountDrafts = ref<string[]>([])
  const editError = ref('')
  const acceptBetterOdds = ref(true)
  const attempted = ref(false)
  const result = ref<SportsBetResult>('idle')
  const rows = computed(() =>
    page.mode.value === 'single'
      ? page.selections.value.map(item => ({ ...item, combinationCount: 1 }))
      : page.parlays.value
  )
  const activeRow = computed(
    () => rows.value.find(item => item.id === page.focusedStakeId.value) ?? rows.value[0]
  )
  const busy = computed(() => result.value === 'confirming' || result.value === 'success')
  const hasClosedMarket = computed(() =>
    page.selections.value.some(item => item.mockBetStatus === 'closed')
  )
  const submitError = computed(() => {
    if (hasClosedMarket.value) return 'This market is closed. Remove it to continue.'
    if (page.mode.value === 'parlay' && page.selections.value.length < 2)
      return 'Select at least two different events for a parlay.'
    if (page.totalStake.value > page.balance) return 'Insufficient balance.'
    const invalidRow = rows.value.find(item => getH5StakeError(item.stake))
    if (invalidRow) return getH5StakeError(invalidRow.stake)
    if (attempted.value && page.totalStake.value <= 0) return 'Enter a stake to place your bet.'
    return ''
  })
  let replaceNextKey = false
  let submitTimer: ReturnType<typeof setTimeout> | undefined
  let resultTimer: ReturnType<typeof setTimeout> | undefined

  const clearTimers = () => {
    clearTimeout(submitTimer)
    clearTimeout(resultTimer)
  }
  const cancelEdit = () => {
    editingAmounts.value = false
    amountDrafts.value = []
    editError.value = ''
  }
  const close = () => {
    clearTimers()
    if (result.value === 'success') page.submitMockBet()
    result.value = 'idle'
    keyboardOpen.value = false
    cancelEdit()
    page.betSlipOpen.value = false
  }
  const focusStake = (id: string, kind: SportsBetMode) => {
    if (busy.value) return
    page.focusStake(id, kind)
    keyboardOpen.value = true
    replaceNextKey = true
    result.value = 'idle'
  }
  const writeStake = (value: string) => {
    if (!activeRow.value || busy.value) return
    if (page.mode.value === 'single') page.updateStake(activeRow.value.id, value)
    else page.updateParlayStake(activeRow.value.id, value)
    result.value = 'idle'
  }
  const keyPress = (key: SportsKeyboardKey) => {
    if (busy.value || editingAmounts.value) return
    if (activeRow.value) {
      writeStake(applySportsKeyboardKey(activeRow.value.stake, key, replaceNextKey))
    }
    replaceNextKey = false
  }
  const maxStake = () => {
    const target = activeRow.value
    if (!target || busy.value || editingAmounts.value) return
    const otherStake = rows.value.reduce(
      (sum, row) =>
        row.id === target.id
          ? sum
          : sum + (parseSportsStake(row.stake) ?? 0) * row.combinationCount,
      0
    )
    const available = Math.max(0, page.balance - otherStake)
    const max = Math.min(
      H5_MAX_STAKE,
      Math.floor((available * 100) / target.combinationCount) / 100
    )
    writeStake(max.toFixed(2))
    replaceNextKey = true
  }
  const chooseQuickAmount = (index: number) => {
    if (busy.value || editingAmounts.value || quickAmounts.value[index] === undefined) return
    writeStake(String(quickAmounts.value[index]))
    replaceNextKey = true
  }
  const startEdit = () => {
    if (busy.value) return
    amountDrafts.value = quickAmounts.value.map(String)
    editError.value = ''
    editingAmounts.value = true
  }
  const updateAmountDraft = (index: number, value: string) => {
    if (!editingAmounts.value || busy.value || amountDrafts.value[index] === undefined) return
    amountDrafts.value[index] = value
    editError.value = ''
  }
  const reorderAmountDraft = (fromIndex: number, toIndex: number) => {
    if (
      !editingAmounts.value ||
      busy.value ||
      !Number.isInteger(fromIndex) ||
      !Number.isInteger(toIndex) ||
      fromIndex === toIndex ||
      amountDrafts.value[fromIndex] === undefined ||
      amountDrafts.value[toIndex] === undefined
    )
      return
    const next = [...amountDrafts.value]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    amountDrafts.value = next
    editError.value = ''
  }
  const saveEdit = () => {
    if (!editingAmounts.value || busy.value) return
    const amounts = amountDrafts.value.map(parseSportsStake)
    if (amounts.some(value => value === null || value <= 0 || value > page.balance)) {
      editError.value = 'Enter six positive amounts within your balance.'
      return
    }
    const validAmounts = amounts.filter((value): value is number => value !== null)
    if (validAmounts.length !== 6 || new Set(validAmounts).size !== 6) {
      editError.value = 'Enter six different quick amounts.'
      return
    }
    quickAmounts.value = validAmounts
    cancelEdit()
    replaceNextKey = true
  }
  const addEvent = () => close()
  const changeMode = () => {
    if (busy.value) return
    if (page.mode.value === 'single') {
      page.setMode('parlay', true)
      close()
    } else {
      page.setMode('single')
      attempted.value = false
      keyboardOpen.value = true
    }
  }
  const removeSelection = (id: string) => {
    if (busy.value) return
    const wasParlay = page.mode.value === 'parlay'
    page.removeSelection(id)
    if (wasParlay && page.selections.value.length) page.setMode('parlay', true)
    attempted.value = false
    if (!page.selections.value.length) keyboardOpen.value = false
  }
  const clear = () => {
    if (busy.value) return
    page.clearBets()
    attempted.value = false
    keyboardOpen.value = false
  }
  const submit = () => {
    if (busy.value || editingAmounts.value || !page.selections.value.length) return
    attempted.value = true
    if (submitError.value || !page.canSubmit.value) return
    keyboardOpen.value = false
    result.value = 'confirming'
    // 提交结果由固定 mock 标记决定；不请求接口、不读取或扣减真实账户余额。
    const shouldFail = page.selections.value.some(item => item.mockBetStatus === 'fail')
    submitTimer = setTimeout(() => {
      result.value = shouldFail ? 'failed' : 'success'
      if (!shouldFail) resultTimer = setTimeout(close, 1600)
    }, 1000)
  }

  watch(
    page.betSlipOpen,
    opened => {
      if (opened) {
        attempted.value = false
        result.value = 'idle'
        keyboardOpen.value = page.mode.value === 'single' && page.selections.value.length > 0
        replaceNextKey = true
      } else {
        clearTimers()
        if (result.value === 'success') page.submitMockBet()
        keyboardOpen.value = false
        cancelEdit()
        result.value = 'idle'
      }
    },
    { immediate: true }
  )
  watch(
    () => [page.currencySymbol.value, page.selections.value.map(item => item.id).join('|')],
    () => {
      clearTimers()
      result.value = 'idle'
      attempted.value = false
    }
  )
  onScopeDispose(clearTimers)

  return {
    keyboardOpen,
    quickAmounts,
    editingAmounts,
    amountDrafts,
    editError,
    acceptBetterOdds,
    result,
    busy,
    activeRow,
    submitError,
    close,
    focusStake,
    keyPress,
    maxStake,
    chooseQuickAmount,
    startEdit,
    updateAmountDraft,
    reorderAmountDraft,
    cancelEdit,
    saveEdit,
    addEvent,
    changeMode,
    removeSelection,
    clear,
    submit
  }
}
