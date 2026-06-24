import type { TicketResultDialogState } from '@/views/activity/ticket/shell/ticketDialog'
import { RESULT_HERO_IMAGES } from '@/views/activity/ticket/shared/constants'
import { resolveNextRoundTickets } from '@/views/activity/ticket/shared/ticketPostTrigger'
import type { TicketResultVariant } from '@/views/activity/ticket/shared/types'
import { globalTicketToastState } from '@/views/activity/ticket/shell/ticketToast'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { ComposerTranslation } from 'vue-i18n'

type ResultState = ComputedRef<TicketResultDialogState>
type HeroVariant = Extract<TicketResultVariant, 'cash' | 'spin_again' | 'no_prize'>

const isHeroVariant = (variant: TicketResultVariant): variant is HeroVariant =>
  variant === 'cash' || variant === 'spin_again' || variant === 'no_prize'

export function useTicketResultHeroCopy(result: ResultState, t: ComposerTranslation) {
  const variant = computed(() => result.value.variant)

  const resolvedTitle = computed(() => {
    if (result.value.title) return result.value.title
    if (variant.value === 'no_prize') return t('luckySpinPage.result.sorry')
    return t('luckySpinPage.result.congratsWon')
  })

  const resolvedHighlight = computed(() => result.value.highlightText ?? '')

  const resolvedHeroImage = computed(() => {
    if (result.value.heroImage) return result.value.heroImage
    if (isHeroVariant(variant.value)) return RESULT_HERO_IMAGES[variant.value]
    return ''
  })

  const resolvedSubtext = computed(() => {
    if (result.value.subtext) return result.value.subtext
    if (variant.value === 'cash') return t('luckySpinPage.result.creditedToWallet')
    if (variant.value === 'spin_again') return t('luckySpinPage.result.extraSpin')
    if (variant.value === 'no_prize') return t('luckySpinPage.result.betterLuck')
    return ''
  })

  // 是否进入下一轮的判定与结果弹窗关闭逻辑一致（见 useTicketResultDialog.close）：
  // enableTrigger=1 且存在下一轮票券（use 返回的 nextTickets 或 triggerConfig）时才有下一轮。
  const hasNextRound = computed(() => {
    const consumed = globalTicketToastState.lastConsumedTicketRecord
    return resolveNextRoundTickets(result.value.nextTickets, consumed).length > 0
  })

  const resolvedButtonText = computed(() => {
    if (result.value.buttonText) return result.value.buttonText
    if (variant.value === 'cash') {
      return hasNextRound.value ? t('luckySpinPage.result.nextRound') : t('luckySpinPage.result.ok')
    }
    return t('luckySpinPage.result.ok')
  })

  return {
    resolvedTitle,
    resolvedHighlight,
    resolvedHeroImage,
    resolvedSubtext,
    resolvedButtonText
  }
}

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
