import type { TicketResultDialogState } from '@/views/activity/ticket/shell/ticketDialog'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { ComposerTranslation } from 'vue-i18n'

type ResultState = ComputedRef<TicketResultDialogState>

export function useTicketResultCardsCopy(result: ResultState, t: ComposerTranslation) {
  const vouchers = computed(() => result.value.vouchers)

  const resolvedTitle = computed(
    () => result.value.title ?? t('luckySpinPage.result.congratulations')
  )

  const resolvedSubtext = computed(() => {
    if (result.value.subtext) return result.value.subtext
    const count = result.value.voucherCount || vouchers.value.length
    return t('luckySpinPage.result.receivedVouchers', { count })
  })

  const resolvedButtonText = computed(
    () => result.value.buttonText ?? t('luckySpinPage.result.useNow')
  )

  return {
    vouchers,
    resolvedTitle,
    resolvedSubtext,
    resolvedButtonText
  }
}
