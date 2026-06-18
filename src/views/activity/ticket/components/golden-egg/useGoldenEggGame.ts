import type { UseTicketResult } from '@/api/interface/activity'

import { openTicketResultDialogFromAmount } from '../../shared/mappers/mapReceiveTickets'
import { useTicketUseAction } from '../../shared'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export type GoldenEggStage = 'standby' | 'opening' | 'opened'

interface UseGoldenEggGameOptions {
  onOpenAnimationStart: (index: number) => boolean
  onResetAnimations: () => void
}

export const useGoldenEggGame = ({
  onOpenAnimationStart,
  onResetAnimations
}: UseGoldenEggGameOptions) => {
  const { t } = useI18n()
  const { runUseTicket, isPending } = useTicketUseAction()

  const activeStage = ref<GoldenEggStage>('standby')
  const activeOpeningIndex = ref<number | null>(null)
  const pendingUseResult = ref<UseTicketResult | null>(null)

  const resetGame = () => {
    activeStage.value = 'standby'
    activeOpeningIndex.value = null
    pendingUseResult.value = null
    onResetAnimations()
  }

  const handleOpenComplete = (index: number) => {
    if (activeOpeningIndex.value !== index) return
    activeStage.value = 'opened'

    if (pendingUseResult.value) {
      openTicketResultDialogFromAmount(pendingUseResult.value)
      pendingUseResult.value = null
    }
  }

  const startOpenAnimation = (index: number, result: UseTicketResult) => {
    pendingUseResult.value = result
    activeStage.value = 'opening'
    activeOpeningIndex.value = index

    if (onOpenAnimationStart(index)) return
    handleOpenComplete(index)
  }

  const handleSmash = (index: number) => {
    if (activeStage.value !== 'standby' || isPending.value) return

    void runUseTicket({
      voucherName: t('ticketPage.goldenEgg.title'),
      fallbackErrorMessage: t('luckySpinPage.loadFailed'),
      onSuccess: result => {
        startOpenAnimation(index, result)
      },
      onError: resetGame
    })
  }

  return {
    activeStage,
    activeOpeningIndex,
    isPending,
    handleSmash,
    handleOpenComplete,
    resetGame
  }
}
