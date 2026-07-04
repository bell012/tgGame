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
      <h2 class="result-hero-title text-[28px] font-[700]">{{ resolvedTitle }}</h2>
      <p class="mt-1 text-[40px] font-[700] text-secondary-6">{{ resolvedHighlight }}</p>
      <p v-if="resolvedSubtext" class="mt-1 text-[13px] text-common-100">
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
</script>

<style scoped>
.result-hero-title {
  background: linear-gradient(180deg, #ffffff 0%, #ffd700 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
