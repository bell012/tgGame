import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import { casinoIcons } from '@/static/svg/casino'
import { sideIcons } from '@/static/svg/side'
import { navigateTo } from '@/utils/router'
import { computed, onMounted, ref } from 'vue'
import type { RebateCategory, RebateRow, RebateTab } from './types'

const pickField = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }

  return undefined
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const toRateNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'string' && value.includes('%')) {
    return toNumber(value.replace('%', ''), fallback)
  }

  return toNumber(value, fallback)
}

const toRateText = (value: unknown, fallback = '0.00%') => {
  if (typeof value === 'string') {
    const normalizedValue = value.trim()
    if (!normalizedValue) {
      return fallback
    }

    if (normalizedValue.includes('%')) {
      return normalizedValue
    }

    const parsedValue = Number(normalizedValue)
    return Number.isFinite(parsedValue) ? `${parsedValue.toFixed(2)}%` : fallback
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value.toFixed(2)}%`
  }

  return fallback
}

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase()
    return normalizedValue === '1' || normalizedValue === 'true' || normalizedValue === 'yes'
  }

  return false
}

const normalizeRebateRow = (value: unknown, index: number): RebateRow | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const rawRow = value as Record<string, unknown>
  const rawValidBets = pickField(rawRow, [
    'validBets',
    'validBet',
    'betRange',
    'threshold',
    'title',
    'name'
  ])
  const validBets = String(rawValidBets ?? '').trim()
  if (!validBets) {
    return null
  }

  const rawRate = pickField(rawRow, ['rebateRate', 'rate', 'rebate', 'ratio', 'percent'])
  const rawCurrent = pickField(rawRow, ['isCurrent', 'current', 'active', 'selected'])
  const rawId = pickField(rawRow, ['id', 'rowId', 'levelId', 'sortNum'])

  return {
    id: String(rawId ?? `row-${index}`),
    validBets,
    rebateRate: toRateText(rawRate, '0.00%'),
    isCurrent: toBoolean(rawCurrent)
  }
}

export const useRebatePage = () => {
  const isMobile = useIsMobile()
  const { side } = sideIcons

  const activeTab = ref<RebateTab>('records')
  const activeCategory = ref('slots')
  const showClaimSuccessPopup = ref(false)
  const showRebateRecordsPopup = ref(false)
  const showEligibleTurnoverPopup = ref(false)
  const showRebateRulesPopup = ref(false)

  const todayValidBets = ref(0)
  const eligibleTurnover = ref(0)
  const pendingRebateTurnover = ref(0)
  const promoBonusTurnoverDeduction = ref(0)
  const claimableAmount = ref(0)
  const currentValidBets = ref(0)
  const targetValidBets = ref(500000)
  const currentRebateValue = ref(0.7)
  const nextRebateValue = ref(0.8)
  const rebateRowsFromApi = ref<RebateRow[]>([])

  const applyRebateRateResponse = (result: unknown) => {
    if (!result) {
      return
    }

    const rawResult: Record<string, unknown> = Array.isArray(result)
      ? { list: result }
      : ((result as Record<string, unknown>) ?? {})

    const todayValidBetsValue = pickField(rawResult, [
      'todayValidBets',
      'todayValidBet',
      'todayBetAmount'
    ])
    const eligibleTurnoverValue = pickField(rawResult, [
      'eligibleTurnover',
      'validTurnover',
      'turnoverAmount'
    ])
    const claimableAmountValue = pickField(rawResult, [
      'claimableAmount',
      'rebateAmount',
      'canReceiveAmount',
      'receiveAmount'
    ])
    const pendingRebateTurnoverValue = pickField(rawResult, [
      'pendingRebateTurnover',
      'pendingTurnover',
      'pendingBetAmount',
      'waitRebateTurnover'
    ])
    const promoBonusTurnoverDeductionValue = pickField(rawResult, [
      'promoBonusTurnoverDeduction',
      'bonusTurnoverDeduction',
      'turnoverDeduction',
      'deductionAmount'
    ])
    const currentValidBetsValue = pickField(rawResult, [
      'currentValidBets',
      'currentBetAmount',
      'validBetAmount'
    ])
    const targetValidBetsValue = pickField(rawResult, [
      'targetValidBets',
      'nextLevelValidBets',
      'targetBetAmount'
    ])
    const currentRebateRate = pickField(rawResult, [
      'currentRebate',
      'currentRebateRate',
      'rebateRate'
    ])
    const nextRebateRate = pickField(rawResult, ['nextRebate', 'nextRebateRate'])

    if (todayValidBetsValue !== undefined) {
      todayValidBets.value = toNumber(todayValidBetsValue, todayValidBets.value)
    }
    if (eligibleTurnoverValue !== undefined) {
      eligibleTurnover.value = toNumber(eligibleTurnoverValue, eligibleTurnover.value)
    }
    if (claimableAmountValue !== undefined) {
      claimableAmount.value = toNumber(claimableAmountValue, claimableAmount.value)
    }
    if (promoBonusTurnoverDeductionValue !== undefined) {
      promoBonusTurnoverDeduction.value = toNumber(
        promoBonusTurnoverDeductionValue,
        promoBonusTurnoverDeduction.value
      )
    }
    if (pendingRebateTurnoverValue !== undefined) {
      pendingRebateTurnover.value = toNumber(
        pendingRebateTurnoverValue,
        pendingRebateTurnover.value
      )
    } else if (eligibleTurnoverValue !== undefined) {
      pendingRebateTurnover.value =
        toNumber(eligibleTurnoverValue, eligibleTurnover.value) + promoBonusTurnoverDeduction.value
    }
    if (currentValidBetsValue !== undefined) {
      currentValidBets.value = toNumber(currentValidBetsValue, currentValidBets.value)
    }
    if (targetValidBetsValue !== undefined) {
      targetValidBets.value = toNumber(targetValidBetsValue, targetValidBets.value)
    }
    if (currentRebateRate !== undefined) {
      currentRebateValue.value = toRateNumber(currentRebateRate, currentRebateValue.value)
    }
    if (nextRebateRate !== undefined) {
      nextRebateValue.value = toRateNumber(nextRebateRate, nextRebateValue.value)
    }

    const rawRateList = pickField(rawResult, [
      'rebateRates',
      'rebateRateList',
      'list',
      'rows',
      'records'
    ])

    if (!Array.isArray(rawRateList)) {
      return
    }

    const normalizedRows = rawRateList
      .map((item, index) => normalizeRebateRow(item, index))
      .filter((item): item is RebateRow => item !== null)

    if (normalizedRows.length === 0) {
      return
    }

    if (!normalizedRows.some(item => item.isCurrent)) {
      normalizedRows[0].isCurrent = true
    }

    rebateRowsFromApi.value = normalizedRows
  }

  const loadRebateRate = async () => {
    try {
      const response = await Api.user.selectRebateRate()
      if (!response?.success) {
        throw new Error(response?.message || 'load rebate rate failed')
      }

      applyRebateRateResponse(response.result)
    } catch (error) {
      console.error('loadRebateRate failed', error)
    }
  }

  onMounted(() => {
    void loadRebateRate()
  })

  const categoryOptions = computed<RebateCategory[]>(() => [
    {
      id: 'slots',
      label: '老虎机',
      icon: casinoIcons.slots
    },
    {
      id: 'table',
      label: '桌面游戏',
      icon: casinoIcons.table_games
    },
    {
      id: 'fishing',
      label: '捕鱼',
      icon: casinoIcons.fishing
    },
    {
      id: 'roulette',
      label: '轮盘',
      icon: casinoIcons.roulette
    },
    {
      id: 'sports',
      label: '体育',
      icon: casinoIcons.football
    },
    {
      id: 'lottery',
      label: '彩票',
      icon: side.lotteryIcon
    }
  ])

  const formatAmount = (value: number) => {
    return value.toFixed(2)
  }

  const formatDetailAmount = (value: number) => {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }

  const todayValidBetsText = computed(() => formatAmount(todayValidBets.value))
  const eligibleTurnoverText = computed(() => formatAmount(eligibleTurnover.value))
  const pendingRebateTurnoverText = computed(() => formatDetailAmount(pendingRebateTurnover.value))
  const promoBonusTurnoverDeductionText = computed(() =>
    formatDetailAmount(promoBonusTurnoverDeduction.value)
  )
  const claimableAmountText = computed(() => formatAmount(claimableAmount.value))

  const currentRebateText = computed(() => `${currentRebateValue.value.toFixed(2)}%`)
  const nextRebateText = computed(() => `${nextRebateValue.value.toFixed(2)}%`)
  const currentValidBetsPlainText = computed(() => String(Math.floor(currentValidBets.value)))
  const targetValidBetsText = computed(() => String(Math.floor(targetValidBets.value)))

  const progressPercent = computed(() => {
    if (!targetValidBets.value) {
      return 0
    }

    const ratio = (currentValidBets.value / targetValidBets.value) * 100
    return Math.min(Math.max(ratio, 0), 100)
  })

  const progressPercentText = computed(() => `${Math.floor(progressPercent.value)}%`)

  const defaultRebateRows = computed<RebateRow[]>(() => {
    const validBetTiers = ['1+', '100K+', '200K+', '300K+', '400K+', '500K+', '600K+', '700K+']
    const rateValues = isMobile.value
      ? [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4]
      : [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]

    return validBetTiers.map((validBets, index) => ({
      id: `row-${validBets}-${index}`,
      validBets,
      rebateRate: `${rateValues[index].toFixed(2)}%`,
      isCurrent: index === 0
    }))
  })

  const rebateRows = computed<RebateRow[]>(() => {
    if (rebateRowsFromApi.value.length > 0) {
      return rebateRowsFromApi.value
    }

    return defaultRebateRows.value
  })

  const handleClaimRebate = () => {
    showClaimSuccessPopup.value = true
  }

  const handleClaimSuccessConfirm = () => {
    showClaimSuccessPopup.value = false
  }

  const handleOpenRebateRecords = () => {
    activeTab.value = 'records'

    if (isMobile.value) {
      void navigateTo('/personal-center/rebate-records')
      return
    }

    showRebateRecordsPopup.value = true
  }

  const closeRebateRecordsPopup = () => {
    showRebateRecordsPopup.value = false
  }

  const openEligibleTurnoverPopup = () => {
    showEligibleTurnoverPopup.value = true
  }

  const closeEligibleTurnoverPopup = () => {
    showEligibleTurnoverPopup.value = false
  }

  const openRebateRulesPopup = () => {
    activeTab.value = 'rules'
    showRebateRulesPopup.value = true
  }

  const closeRebateRulesPopup = () => {
    showRebateRulesPopup.value = false
    activeTab.value = 'records'
  }

  const handleSupportClick = () => {
    console.log('open live support')
  }

  return {
    activeCategory,
    activeTab,
    categoryOptions,
    claimableAmountText,
    closeEligibleTurnoverPopup,
    closeRebateRecordsPopup,
    closeRebateRulesPopup,
    currentRebateText,
    currentValidBetsPlainText,
    eligibleTurnoverText,
    handleClaimRebate,
    handleClaimSuccessConfirm,
    handleOpenRebateRecords,
    handleSupportClick,
    isMobile,
    nextRebateText,
    openEligibleTurnoverPopup,
    openRebateRulesPopup,
    pendingRebateTurnoverText,
    progressPercent,
    progressPercentText,
    promoBonusTurnoverDeductionText,
    rebateRows,
    showClaimSuccessPopup,
    showEligibleTurnoverPopup,
    showRebateRecordsPopup,
    showRebateRulesPopup,
    supportHeaderIcon: side.helpIcon,
    targetValidBetsText,
    todayValidBetsText
  }
}
