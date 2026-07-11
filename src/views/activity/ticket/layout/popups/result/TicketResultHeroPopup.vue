<template>
  <TicketDialogOverlay
    :visible="visible"
    :mask-z-index="TICKET_DIALOG_Z.resultMask"
    :panel-z-index="TICKET_DIALOG_Z.resultPanel"
    layout="result"
    :panel-class="isMobile ? 'max-w-[320px]' : 'max-w-[360px]'"
    :close-aria-label="t('common.cancel')"
    @close="close"
  >
    <div class="flex flex-col items-center">
      <h2
        class="result-hero-title text-[42px] font-[700] leading-[42px]"
        :style="{ backgroundImage: resultHeroTitleGradient }"
      >
        {{ resolvedTitle }}
      </h2>
      <p class="mt-[16px] text-[60px] font-[700] leading-[60px] text-secondary-6">
        {{ resolvedHighlight }}
      </p>
      <p v-if="resolvedSubtext" class="mt-[16px] text-[18px] leading-[18px] text-common-100">
        {{ resolvedSubtext }}
      </p>

      <TicketResultHeroMedia :media="heroMedia" :playing="visible" />

      <button
        type="button"
        class="flex h-[44px] w-full max-w-[200px] items-center justify-center rounded-[10px] bg-theme-primary text-[15px] font-[700] text-text-4"
        @click="close"
      >
        {{ resolvedButtonText }}
      </button>
    </div>
  </TicketDialogOverlay>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { TICKET_DIALOG_Z } from '@/views/activity/ticket/shared/constants'
import { getTicketModalTheme } from '@/views/activity/ticket/shared/design-tokens'
import { globalTicketToastState } from '@/views/activity/ticket/shell/ticketToast'
import TicketDialogOverlay from '../shared/TicketDialogOverlay.vue'
import { resolveHeroMedia } from './heroMedia'
import TicketResultHeroMedia from './TicketResultHeroMedia.vue'
import { useTicketResultHeroCopy } from './useTicketResultCopy'
import { useTicketResultDialog } from './useTicketResultDialog'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, result, close } = useTicketResultDialog('hero')
const { resolvedTitle, resolvedHighlight, resolvedHeroImage, resolvedSubtext, resolvedButtonText } =
  useTicketResultHeroCopy(result, t)

const resultTicketRecord = computed(
  () => globalTicketToastState.lastConsumedTicketRecord ?? globalTicketToastState.activeTicketRecord
)

const heroMedia = computed(() =>
  resolveHeroMedia(result.value, resultTicketRecord.value, resolvedHeroImage.value)
)

const DEFAULT_RESULT_HERO_TITLE_GRADIENT = 'linear-gradient(180deg, #fffdf8 0%, #f9cf7b 100%)'

const HERO_LOTTIE_TITLE_THEME = {
  cash_voucher_result: 'cash_voucher',
  mystery_box_open: 'mystery_box'
} as const

const resultHeroTitleGradient = computed(() => {
  const heroLottie = result.value.heroLottie
  if (heroLottie && heroLottie in HERO_LOTTIE_TITLE_THEME) {
    return getTicketModalTheme(HERO_LOTTIE_TITLE_THEME[heroLottie]).titleGradient
  }

  return DEFAULT_RESULT_HERO_TITLE_GRADIENT
})
</script>

<style scoped>
.result-hero-title {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
