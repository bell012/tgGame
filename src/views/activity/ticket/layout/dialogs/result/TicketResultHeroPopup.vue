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
      <h2 class="text-[18px] font-[700] text-common-100">{{ resolvedTitle }}</h2>
      <p class="mt-1 text-[28px] font-[700] text-[#F7D060]">{{ resolvedHighlight }}</p>
      <p v-if="resolvedSubtext" class="mt-1 text-[13px] text-common-60">
        {{ resolvedSubtext }}
      </p>

      <div
        v-if="showHeroArea"
        class="my-4 flex items-center justify-center"
        :class="isMobile ? 'h-[160px] w-[160px]' : 'h-[200px] w-[200px]'"
      >
        <GoldenEggPop v-if="isGoldenEggCashVariant" class="h-full w-full" />
        <LottiePlayer
          v-else-if="isCashVariant"
          :path="LUCKY_SPIN_CASH_RESULT_LOTTIE"
          :fallback-src="cashHeroFallback"
          :autoplay="visible"
          loop
          class="h-full w-full"
        />
        <img
          v-else-if="resolvedHeroImage"
          :src="resolvedHeroImage"
          alt=""
          class="h-full w-full object-contain"
        />
      </div>

      <button
        type="button"
        class="flex h-[44px] w-full max-w-[280px] items-center justify-center rounded-[10px] bg-theme-primary text-[15px] font-[700] text-text-4"
        @click="close"
      >
        {{ resolvedButtonText }}
      </button>
    </div>
  </TicketDialogOverlay>
</template>

<script setup lang="ts">
import LottiePlayer from '@/components/LottiePlayer.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import GoldenEggPop from '@/views/activity/ticket/components/golden-egg/golden-egg-pop.vue'
import { TICKET_TYPE_TO_GAME_ID } from '@/views/activity/ticket/shared/mbTicketMapper'
import {
  LUCKY_SPIN_CASH_RESULT_LOTTIE,
  RESULT_HERO_IMAGES,
  TICKET_DIALOG_Z
} from '@/views/activity/ticket/shared/constants'
import { globalTicketToastState } from '@/views/activity/ticket/shell/ticketToast'
import TicketDialogOverlay from '../shared/TicketDialogOverlay.vue'
import { useTicketResultHeroCopy } from './useTicketResultCopy'
import { useTicketResultDialog } from './useTicketResultDialog'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, result, close } = useTicketResultDialog('hero')
const { resolvedTitle, resolvedHighlight, resolvedHeroImage, resolvedSubtext, resolvedButtonText } =
  useTicketResultHeroCopy(result, t)

const isCashVariant = computed(() => result.value.variant === 'cash')
const resultTicketRecord = computed(
  () => globalTicketToastState.lastConsumedTicketRecord ?? globalTicketToastState.activeTicketRecord
)
const isGoldenEggCashVariant = computed(
  () =>
    isCashVariant.value &&
    TICKET_TYPE_TO_GAME_ID[Number(resultTicketRecord.value?.type)] === TICKET_TYPE_TO_GAME_ID[3]
)
const cashHeroFallback = RESULT_HERO_IMAGES.cash
const showHeroArea = computed(() => isCashVariant.value || Boolean(resolvedHeroImage.value))
</script>
