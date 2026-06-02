import Api from '@/api'
import type {
  LuckySpinInfoResult,
  LuckySpinResult,
  LuckySpinResultVariant,
  LuckySpinVoucherCardData
} from '../../shared/types'
import { closeTicketToast } from '../../shell/ticketToast'
import { navigateTo } from '@/utils/router'
import { showToast } from 'vant'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export interface LuckySpinWheelExpose {
  stopAt: (index: number) => void
  init: () => void
}

export const useLuckySpinGame = (
  wheelRef: Ref<LuckySpinWheelExpose | null>,
  visible: Ref<boolean>
) => {
  const { t } = useI18n()

  const isLoading = ref(false)
  const loadError = ref(false)
  const isSpinning = ref(false)
  const spinInfo = ref<LuckySpinInfoResult | null>(null)
  const activeGameIndex = ref(0)

  const showReminder = ref(false)
  const showResult = ref(false)
  const resultVariant = ref<LuckySpinResultVariant>('cash')
  const resultHighlight = ref('')
  const resultVouchers = ref<LuckySpinVoucherCardData[]>([])
  const pendingResult = ref<LuckySpinResult | null>(null)

  const syncActiveGameIndex = (info: LuckySpinInfoResult, gameId?: string) => {
    const targetId = gameId ?? 'lucky_spin'
    const index = info.voucherGames.findIndex(item => item.id === targetId)
    activeGameIndex.value = index >= 0 ? index : 0
  }

  const resetModalState = () => {
    isSpinning.value = false
    showReminder.value = false
    showResult.value = false
    pendingResult.value = null
    resultHighlight.value = ''
    resultVouchers.value = []
    loadError.value = false
    spinInfo.value = null
    wheelRef.value?.init()
  }

  const loadSpinInfo = async () => {
    isLoading.value = true
    loadError.value = false

    try {
      const response = await Api.activity.queryLuckySpinInfo()
      if (response.success && response.result) {
        spinInfo.value = response.result
        syncActiveGameIndex(response.result)
        return
      }

      spinInfo.value = null
      loadError.value = true
    } catch {
      spinInfo.value = null
      loadError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const openResult = (result: LuckySpinResult) => {
    const { prize } = result

    if (prize.type === 'cash') {
      resultVariant.value = 'cash'
      resultHighlight.value = prize.label
    } else if (prize.type === 'spin_again') {
      resultVariant.value = 'spin_again'
      resultHighlight.value = t('luckySpinPage.result.spinAgain')
    } else if (prize.type === 'no_prize') {
      resultVariant.value = 'no_prize'
      resultHighlight.value = t('luckySpinPage.result.noPrize')
    } else if (prize.type === 'voucher') {
      resultVouchers.value = result.vouchers ?? []
      resultVariant.value = (result.vouchers?.length ?? 0) > 1 ? 'voucher_multi' : 'voucher_single'
    }

    showResult.value = true
  }

  const handleWheelGo = async () => {
    if (isSpinning.value) return

    if (!spinInfo.value?.remainingSpins) {
      showReminder.value = true
      return
    }

    isSpinning.value = true

    try {
      const response = await Api.activity.doLuckySpin()
      if (!response.success || !response.result) {
        isSpinning.value = false
        wheelRef.value?.init()
        showToast({
          message: t('luckySpinPage.loadFailed'),
          position: 'middle',
          type: 'fail'
        })
        return
      }

      pendingResult.value = response.result
      wheelRef.value?.stopAt(response.result.prizeIndex)
    } catch {
      isSpinning.value = false
      wheelRef.value?.init()
      showToast({
        message: t('luckySpinPage.loadFailed'),
        position: 'middle',
        type: 'fail'
      })
    }
  }

  const handleSpinEnd = async () => {
    isSpinning.value = false
    if (pendingResult.value) {
      openResult(pendingResult.value)
      pendingResult.value = null
    }

    try {
      const response = await Api.activity.queryLuckySpinInfo()
      if (response.success && response.result && spinInfo.value) {
        spinInfo.value.remainingSpins = response.result.remainingSpins
        spinInfo.value.totalVouchers = response.result.totalVouchers
      }
    } catch {
      // ignore refresh failure
    }
  }

  const handleGamePrev = () => {
    if (!spinInfo.value?.voucherGames.length) return
    activeGameIndex.value =
      (activeGameIndex.value - 1 + spinInfo.value.voucherGames.length) %
      spinInfo.value.voucherGames.length
  }

  const handleGameNext = () => {
    if (!spinInfo.value?.voucherGames.length) return
    activeGameIndex.value = (activeGameIndex.value + 1) % spinInfo.value.voucherGames.length
  }

  const handleDeposit = () => {
    showReminder.value = false
    closeTicketToast()
    navigateTo('/deposit')
  }

  const handleClosePage = () => {
    if (isSpinning.value) return
    closeTicketToast()
  }

  watch(
    visible,
    nextVisible => {
      if (nextVisible) {
        void loadSpinInfo()
        return
      }
      resetModalState()
    },
    { immediate: false }
  )

  return {
    isLoading,
    loadError,
    isSpinning,
    spinInfo,
    activeGameIndex,
    showReminder,
    showResult,
    resultVariant,
    resultHighlight,
    resultVouchers,
    loadSpinInfo,
    syncActiveGameIndex,
    handleWheelGo,
    handleSpinEnd,
    handleGamePrev,
    handleGameNext,
    handleDeposit,
    handleClosePage
  }
}
