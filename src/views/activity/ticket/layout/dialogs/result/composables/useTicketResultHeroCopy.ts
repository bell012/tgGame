import type { TicketResultDialogState } from '@/views/activity/ticket/shell/ticketDialog'
import { RESULT_HERO_IMAGES } from '@/views/activity/ticket/shared/constants'
import type { LuckySpinResultVariant } from '@/views/activity/ticket/shared/types'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { ComposerTranslation } from 'vue-i18n'

type ResultState = ComputedRef<TicketResultDialogState>
type HeroVariant = Extract<LuckySpinResultVariant, 'cash' | 'spin_again' | 'no_prize'>

const isHeroVariant = (variant: LuckySpinResultVariant): variant is HeroVariant =>
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

  const resolvedButtonText = computed(() => {
    if (result.value.buttonText) return result.value.buttonText
    if (variant.value === 'cash') return t('luckySpinPage.result.nextRound')
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
