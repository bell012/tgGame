import type { UseTicketResult } from '@/api/interface/activity'
import {
  getActiveTicketParams,
  globalTicketToastState,
  openTicketTaskPop
} from '../../shell/ticketToast'
import {
  findPrizeIndexInWheelConfig,
  mapWheelConfigToPrizes
} from '../../shared/mappers/mapWheelConfig'
import { openTicketResultDialogFromUse } from '../../shared/mappers/mapReceiveTickets'
import { useTicketUseAction } from '../../shared'
import { globalShowToast } from '@/utils/toast'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const clearPendingSpin = (pendingUseResult: Ref<UseTicketResult | null>) => {
  pendingUseResult.value = null
}

export interface LuckySpinWheelExpose {
  spinTo: (index: number) => void
  init: () => void
  clearSectorHighlight: () => void
}

export const useLuckySpinGame = (wheelRef: Ref<LuckySpinWheelExpose | null>) => {
  const { t } = useI18n()

  const isSpinning = ref(false)
  const pendingUseResult = ref<UseTicketResult | null>(null)

  const { runUseTicket } = useTicketUseAction()

  const wheelPrizes = computed(() =>
    mapWheelConfigToPrizes(globalTicketToastState.activeTicketRecord?.wheelConfig)
  )

  const canSpin = computed(() => Boolean(getActiveTicketParams().rowId))

  const resetSpinState = () => {
    isSpinning.value = false
    clearPendingSpin(pendingUseResult)
    wheelRef.value?.init()
  }

  const openResultFromUse = (result: UseTicketResult) => {
    openTicketResultDialogFromUse(result)
  }

  const failSpin = () => {
    isSpinning.value = false
    clearPendingSpin(pendingUseResult)
    wheelRef.value?.clearSectorHighlight()
  }

  const handleWheelGo = async () => {
    if (isSpinning.value) return

    const params = getActiveTicketParams()

    if (!params.rowId) {
      openTicketTaskPop()
      return
    }

    isSpinning.value = true
    clearPendingSpin(pendingUseResult)

    await runUseTicket({
      voucherName: t('luckySpinPage.title'),
      fallbackErrorMessage: t('luckySpinPage.loadFailed'),
      openReminderOnMissingRow: false,
      onSuccess: useResult => {
        const wheelConfig = globalTicketToastState.activeTicketRecord?.wheelConfig
        const prizeIndex = findPrizeIndexInWheelConfig(
          wheelConfig,
          Number(useResult.rewardType ?? 2),
          useResult.rewardAmount
        )

        if (prizeIndex < 0) {
          failSpin()
          globalShowToast({
            message: t('luckySpinPage.loadFailed'),
            type: 'fail'
          })
          return
        }

        pendingUseResult.value = useResult
        wheelRef.value?.spinTo(prizeIndex)
      },
      onError: failSpin
    })
  }

  const handleSpinEnd = () => {
    isSpinning.value = false
    if (pendingUseResult.value) {
      openResultFromUse(pendingUseResult.value)
      clearPendingSpin(pendingUseResult)
    }
  }

  const handleResultDismiss = () => {
    wheelRef.value?.clearSectorHighlight()
  }

  const registerWheelRef = (el: unknown) => {
    wheelRef.value = (el as LuckySpinWheelExpose | null) ?? null
  }

  return {
    isSpinning,
    wheelPrizes,
    canSpin,
    handleWheelGo,
    handleSpinEnd,
    handleResultDismiss,
    registerWheelRef,
    resetSpinState
  }
}
