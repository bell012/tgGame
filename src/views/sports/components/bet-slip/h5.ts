import { computed, onDeactivated, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseSportsStake } from './shared'
import type { SportsBetMode } from '../../shared/types'
import type { SportsPageState } from '../../index'

export type SportsKeyboardKey = string | 'delete'
export type SportsBetResult = 'idle' | 'confirming' | 'success' | 'failed'

/** 键盘输入最多保留两位小数。 */
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

export const useSportsH5Bet = (page: SportsPageState) => {
  const { t } = useI18n()
  const keyboardOpen = ref(false)
  const quickAmounts = ref([20, 50, 100, 200, 500, 1000])
  const editingAmounts = ref(false)
  const amountDrafts = ref<string[]>([])
  const editError = ref('')
  const acceptBetterOdds = page.acceptBetterOdds
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
  const submitError = computed(() => {
    if (page.validationError.value) return page.validationError.value
    if (attempted.value && page.totalStake.value <= 0) return t('sports.betEnterStake')
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
    if (!target || busy.value || editingAmounts.value || page.balance.value === null) return
    page.maxStake(target.id, page.mode.value)
    replaceNextKey = true
  }
  const chooseQuickAmount = (index: number) => {
    if (busy.value || editingAmounts.value || quickAmounts.value[index] === undefined) return
    writeStake(String(quickAmounts.value[index]))
    replaceNextKey = true
  }
  const startEdit = () => {
    if (busy.value) return
    // 编辑时只取前四项，保存后替换快捷金额。
    amountDrafts.value = quickAmounts.value.slice(0, 4).map(String)
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
    const balance = page.balance.value
    if (balance === null) {
      editError.value = t('sports.balanceUnavailable')
      return
    }
    const amounts = amountDrafts.value.map(parseSportsStake)
    if (amounts.some(value => value === null || value <= 0 || value > balance)) {
      editError.value = 'Enter four positive amounts within your balance.'
      return
    }
    const validAmounts = amounts.filter((value): value is number => value !== null)
    if (validAmounts.length !== 4 || new Set(validAmounts).size !== 4) {
      editError.value = 'Enter four different quick amounts.'
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
      if (
        page.setMode('parlay', true) &&
        !page.selections.value.some(item => item.betStatus === 'unavailable')
      )
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
    // 仅模拟结果，不请求投注接口或修改真实余额。
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
  // 只比较实际值，赛事对象刷新时不重置编辑状态。
  watch(
    [
      () => page.currencySymbol.value,
      () => page.mode.value,
      () => page.selections.value.map(item => item.id).join('|')
    ],
    () => {
      clearTimers()
      result.value = 'idle'
      attempted.value = false
      cancelEdit()
    },
    { flush: 'sync' }
  )
  // 投注内容变化后取消本次模拟，避免旧计时器清空新选项。
  watch(
    () =>
      JSON.stringify([
        page.selections.value.map(({ id, odds, stake, mockBetStatus }) => [
          id,
          odds,
          stake,
          mockBetStatus
        ]),
        page.parlays.value.map(({ id, odds, stake, combinationCount }) => [
          id,
          odds,
          stake,
          combinationCount
        ])
      ]),
    () => {
      clearTimers()
      result.value = 'idle'
    },
    { flush: 'sync' }
  )
  onDeactivated(close)
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
