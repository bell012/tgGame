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

  const applyRebateOverviewResponse = (result: unknown) => {
    if (!result) {
      return
    }

    const rawResult = result as Record<string, unknown>

    const todayValidBetsValue = pickField(rawResult, ['betAmount'])
    const eligibleTurnoverValue = pickField(rawResult, ['flowAmount'])
    const claimableAmountValue = pickField(rawResult, ['rebatePoints'])

    if (todayValidBetsValue !== undefined) {
      todayValidBets.value = toNumber(todayValidBetsValue, todayValidBets.value)
    }
    if (eligibleTurnoverValue !== undefined) {
      eligibleTurnover.value = toNumber(eligibleTurnoverValue, eligibleTurnover.value)
    }
    if (claimableAmountValue !== undefined) {
      claimableAmount.value = toNumber(claimableAmountValue, claimableAmount.value)
    }
  }

  const loadRebateOverview = async () => {
    try {
      const response = await Api.user.queryRebateGameData()
      if (!response?.success) {
        throw new Error(response?.message || 'load rebate overview failed')
      }

      applyRebateOverviewResponse(response.result)
    } catch (error) {
      console.error('loadRebateOverview failed', error)
    }
  }

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

  const rebateRows = computed<RebateRow[]>(() => defaultRebateRows.value)

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

  onMounted(() => {
    void loadRebateOverview()
    void Api.user.rebateData()
    void Api.user.selectRebateRate()
  })

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
