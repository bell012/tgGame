import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import { sideIcons } from '@/static/svg/side'
import { navigateTo } from '@/utils/router'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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

const getRebateCategoryLabel = (code: string, t: (key: string) => string) => {
  const labelMap: Record<string, string> = {
    CP: t('betHistory.filterOptions.lottery'),
    TY: t('betHistory.filterOptions.sports'),
    ZR: t('betHistory.filterOptions.live'),
    SX: t('betHistory.filterOptions.live'),
    DZ: t('betHistory.filterOptions.electronic'),
    QP: t('betHistory.filterOptions.chess'),
    BY: t('betHistory.filterOptions.fishing'),
    DJ: t('betHistory.filterOptions.esports')
  }

  return labelMap[code] || code || '--'
}

const toImageUrl = (value: unknown) => {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue
  }

  const baseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
  const imagePath = normalizedValue.replace(/^\/+/, '')

  return baseUrl ? `${baseUrl}/${imagePath}` : normalizedValue
}

export const useRebatePage = () => {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const { side } = sideIcons

  const activeTab = ref<RebateTab>('records')
  const activeCategory = ref('')
  const showClaimSuccessPopup = ref(false)
  const showRebateRecordsPopup = ref(false)
  const showEligibleTurnoverPopup = ref(false)
  const showRebateRulesPopup = ref(false)

  const todayValidBets = ref(0)
  const eligibleTurnover = ref(0)
  const pendingRebateTurnover = ref(0)
  const promoBonusTurnoverDeduction = ref(0)
  const claimableAmount = ref(0)
  const targetValidBets = ref(500000)
  const currentRebateValue = ref(0.7)
  const nextRebateValue = ref(0.8)
  const rebateCategoriesFromApi = ref<RebateCategory[]>([])
  const rebateDataRows = ref<Record<string, unknown>[]>([])

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

  const loadRebateCategories = async () => {
    try {
      const response = await Api.user.selectRebateRate()
      if (!response?.success || !Array.isArray(response.result)) {
        return
      }

      const seenCategoryIds = new Set<string>()
      const nextCategories = response.result.reduce<RebateCategory[]>((acc, item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return acc
        }

        const rawItem = item as Record<string, unknown>
        const sysGameTypeCode = String(rawItem.sysGameTypeCode ?? '').trim()

        if (!sysGameTypeCode || seenCategoryIds.has(sysGameTypeCode)) {
          return acc
        }

        seenCategoryIds.add(sysGameTypeCode)

        const icon = toImageUrl(rawItem.icon)
        const activeIcon = toImageUrl(rawItem.activeIcon)

        acc.push({
          id: sysGameTypeCode,
          label: getRebateCategoryLabel(sysGameTypeCode, t),
          icon: icon || activeIcon,
          activeIcon: activeIcon || icon
        })

        return acc
      }, [])

      rebateCategoriesFromApi.value = nextCategories

      if (
        nextCategories.length > 0 &&
        !nextCategories.some(category => category.id === activeCategory.value)
      ) {
        activeCategory.value = nextCategories[0].id
      }
    } catch (error) {
      console.error('loadRebateCategories failed', error)
    }
  }

  const loadRebateData = async () => {
    try {
      const response = await Api.user.rebateData()
      if (!response?.success || !Array.isArray(response.result)) {
        rebateDataRows.value = []
        return
      }

      rebateDataRows.value = response.result.filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object' && !Array.isArray(item)
      )
    } catch (error) {
      console.error('loadRebateData failed', error)
      rebateDataRows.value = []
    }
  }

  const categoryOptions = computed<RebateCategory[]>(() => rebateCategoriesFromApi.value)

  const currentCategoryCode = computed(() => activeCategory.value.trim())

  const currentCategoryRebateRows = computed(() =>
    rebateDataRows.value.filter(
      item => String(item.sysGameTypeCode ?? '').trim() === currentCategoryCode.value
    )
  )
  const currentValidBetsValue = computed(() =>
    currentCategoryRebateRows.value.reduce((total, item) => total + toNumber(item.betAmount), 0)
  )

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
  const currentValidBetsPlainText = computed(() => String(Math.floor(currentValidBetsValue.value)))
  const targetValidBetsText = computed(() => String(Math.floor(targetValidBets.value)))

  const progressPercent = computed(() => {
    if (!targetValidBets.value) {
      return 0
    }

    const ratio = (currentValidBetsValue.value / targetValidBets.value) * 100
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
    void loadRebateCategories()
    void loadRebateData()
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
