<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0 bg-mask-60-1"
          :style="{ zIndex: TICKET_DIALOG_Z.resultMask }"
          @click.self="close"
        />
      </transition>

      <transition name="result-popup-transition">
        <div
          v-show="visible"
          class="fixed inset-0 flex flex-col items-center justify-center px-6 py-8"
          :style="{ zIndex: TICKET_DIALOG_Z.resultPanel }"
          @click.self="close"
        >
          <section
            role="dialog"
            aria-modal="true"
            class="modal-container w-full"
            :class="isMobile ? 'max-w-[320px]' : 'max-w-[360px]'"
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
                <LottiePlayer
                  v-if="isCashVariant"
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
          </section>

          <button
            type="button"
            class="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-common-30 text-common-80"
            :aria-label="t('common.cancel')"
            @click="close"
          >
            ✕
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import LottiePlayer from '@/components/LottiePlayer.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import {
  LUCKY_SPIN_CASH_RESULT_LOTTIE,
  RESULT_HERO_IMAGES,
  TICKET_DIALOG_Z
} from '@/views/activity/ticket/shared/constants'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTicketResultHeroCopy } from './composables/useTicketResultHeroCopy'
import { useTicketResultHeroDialog } from './composables/useTicketResultHeroDialog'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, result, close } = useTicketResultHeroDialog()
const { resolvedTitle, resolvedHighlight, resolvedHeroImage, resolvedSubtext, resolvedButtonText } =
  useTicketResultHeroCopy(result, t)

const isCashVariant = computed(() => result.value.variant === 'cash')
const cashHeroFallback = RESULT_HERO_IMAGES.cash
const showHeroArea = computed(() => isCashVariant.value || Boolean(resolvedHeroImage.value))
</script>

<style scoped lang="scss">
@use '../dialog-transitions.scss';
</style>
