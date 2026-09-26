import { computed, onDeactivated, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseSportsStake } from './shared'
import type { SportsBetMode } from '../../shared/types'
import type { SportsPageState } from '../../index'

export type SportsKeyboardKey = string | 'delete'

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
  const rows = computed(() =>
    page.mode.value === 'single'
      ? page.selections.value.map(item => ({ ...item, combinationCount: 1 }))
      : page.parlays.value
  )
  const activeRow = computed(
    () => rows.value.find(item => item.id === page.focusedStakeId.value) ?? rows.value[0]
  )
  const busy = page.submitting
  let replaceNextKey = false
  const cancelEdit = () => {
    editingAmounts.value = false
    amountDrafts.value = []
    editError.value = ''
  }
  const close = () => {
    keyboardOpen.value = false
    cancelEdit()
    page.betSlipOpen.value = false
  }
  const focusStake = (id: string, kind: SportsBetMode) => {
    if (busy.value || rows.value.find(item => item.id === id)?.submissionState) return
    page.focusStake(id, kind)
    keyboardOpen.value = true
    replaceNextKey = true
  }
  const writeStake = (value: string) => {
    if (!activeRow.value || activeRow.value.submissionState || busy.value) return
    if (page.mode.value === 'single') page.updateStake(activeRow.value.id, value)
    else page.updateParlayStake(activeRow.value.id, value)
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
    if (
      !target ||
      target.submissionState ||
      busy.value ||
      editingAmounts.value ||
      page.balance.value === null
    )
      return
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
      keyboardOpen.value = true
    }
  }
  const removeSelection = (id: string) => {
    if (busy.value) return
    const wasParlay = page.mode.value === 'parlay'
    page.removeSelection(id)
    if (wasParlay && page.selections.value.length) page.setMode('parlay', true)
    if (!page.selections.value.length) keyboardOpen.value = false
  }
  const clear = () => {
    if (busy.value) return
    page.clearBets()
    keyboardOpen.value = false
  }
  const submit = async () => {
    if (busy.value || editingAmounts.value || !page.selections.value.length) return
    if (!page.canSubmit.value) return
    keyboardOpen.value = false
    await page.submitBet()
  }

  watch(
    page.betSlipOpen,
    opened => {
      if (opened) {
        keyboardOpen.value = page.mode.value === 'single' && page.selections.value.length > 0
        replaceNextKey = true
      } else {
        keyboardOpen.value = false
        cancelEdit()
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
      cancelEdit()
    },
    { flush: 'sync' }
  )
  onDeactivated(close)

  return {
    keyboardOpen,
    quickAmounts,
    editingAmounts,
    amountDrafts,
    editError,
    busy,
    activeRow,
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
