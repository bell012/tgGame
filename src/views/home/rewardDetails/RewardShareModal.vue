<template>
  <Teleport to="body">
    <Transition name="reward-share-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 py-6 sm:p-6"
        @click.self="close"
      >
        <div
          class="relative w-full max-w-[420px] rounded-2xl bg-bg-2 shadow-2xl"
          role="dialog"
          aria-modal="true"
          :aria-label="t('rewardDetails.shareDialogAria')"
        >
          <button
            type="button"
            class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-text-1 transition hover:bg-white/15"
            :aria-label="t('rewardDetails.closeShare')"
            @click="close"
          >
            <CloseIcon class="h-3.5 w-3.5" />
          </button>

          <div class="px-5 pb-5 pt-6 sm:px-9 sm:pb-6 sm:pt-5">
            <div class="flex gap-3 pr-8">
              <img
                :src="kingIcon"
                alt=""
                class="h-14 w-14 shrink-0 rounded-full object-cover shadow-[0_4px_16px_rgba(245,180,60,0.35)]"
              />
              <div class="min-w-0 flex-1 pt-0.5">
                <p class="m-0 text-lg font-bold leading-snug text-text-1">
                  {{ t('rewardDetails.shareMomentTitle') }}
                </p>
                <p class="mt-1 line-clamp-2 text-sm font-medium leading-snug text-text-1">
                  {{ props.gameSubtitle }}
                </p>
              </div>
            </div>

            <div class="mt-5 rounded-[14px] bg-bg-9 px-3 pb-4 pt-3.5 sm:px-4 sm:pb-[18px] sm:pt-4">
              <p class="m-0 mb-3.5 text-center text-sm leading-tight text-text-1 sm:mb-4">
                {{ t('rewardDetails.shareViaSocial') }}
              </p>

              <div class="flex flex-col items-center gap-y-3.5 sm:gap-y-4" role="presentation">
                <div class="flex justify-center gap-[10px] sm:gap-3">
                  <div
                    v-for="(item, idx) in socialIconsRow1"
                    :key="`r1-${idx}`"
                    class="flex h-[52px] w-[52px] shrink-0 items-center justify-center ring-1"
                  >
                    <img
                      :src="item"
                      alt=""
                      class="h-11 w-11 select-none rounded-full object-contain pointer-events-none"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>
                </div>
                <div class="flex justify-center gap-[10px] sm:gap-3">
                  <div
                    v-for="(item, idx) in socialIconsRow2"
                    :key="`r2-${idx}`"
                    class="flex h-[52px] w-[52px] shrink-0 items-center justify-center"
                  >
                    <img
                      :src="item"
                      alt=""
                      class="h-11 w-11 select-none rounded-full object-contain pointer-events-none"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 flex w-full items-center justify-center rounded-xl border-0 py-3.5 text-base font-bold text-[#0d1a14] shadow-[0_6px_20px_rgba(42,238,136,0.35)] transition active:scale-[0.99] sm:mt-4"
              :class="copyGradientClass"
              @click="copyLink"
            >
              {{ t('rewardDetails.copyLink') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import iconEmail from '@/static/svg/coin/Email.svg?url'
import iconFacebook from '@/static/svg/coin/FaceBook.svg?url'
import kingIcon from '@/static/svg/coin/king.svg?url'
import iconLine from '@/static/svg/coin/line.svg?url'
import iconLinkedIn from '@/static/svg/coin/in.svg?url'
import iconSkype from '@/static/svg/coin/s.svg?url'
import iconTelegram from '@/static/svg/coin/tg.svg?url'
import iconUrl from '@/static/svg/coin/url.svg?url'
import iconWhatsapp from '@/static/svg/coin/Whatsapp.svg?url'
import iconX from '@/static/svg/coin/x.svg?url'
import { useUserStore } from '@/stores/user'
import { copyTextWithFallback } from '@/utils/clipboard'
import { globalShowToast } from '@/utils/toast'

const { t } = useI18n()
const userStore = useUserStore()

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    gameSubtitle?: string
  }>(),
  {
    gameSubtitle: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const copyGradientClass =
  'bg-gradient-to-r from-[#2aee88] via-[#5ef0a0] to-[#9fe871] hover:brightness-105'

const socialIconsRow1 = [iconUrl, iconFacebook, iconWhatsapp, iconTelegram, iconEmail] as const

const socialIconsRow2 = [iconLine, iconX, iconSkype, iconLinkedIn] as const

const close = () => {
  emit('update:modelValue', false)
}

const buildShareUrlWithUserId = () => {
  if (typeof window === 'undefined') return ''
  const userId = userStore.acctInfo?.memberRowId || ''
  if (!userId) return ''

  const origin = window.location.origin.replace(/\/+$/, '')
  return `${origin}?id=${encodeURIComponent(userId)}`
}

const copyLink = async () => {
  const url = buildShareUrlWithUserId()

  if (!url) {
    globalShowToast({
      message: t('rewardDetails.copyLinkFail'),
      type: 'fail'
    })
    return
  }

  const copied = await copyTextWithFallback(url)

  globalShowToast({
    message: copied ? t('rewardDetails.copyLinkSuccess') : t('rewardDetails.copyLinkFail'),
    type: copied ? 'success' : 'fail'
  })
}
</script>

<style scoped>
.reward-share-fade-enter-active,
.reward-share-fade-leave-active {
  transition: opacity 0.2s ease;
}

.reward-share-fade-enter-active .relative,
.reward-share-fade-leave-active .relative {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.reward-share-fade-enter-from,
.reward-share-fade-leave-to {
  opacity: 0;
}

.reward-share-fade-enter-from .relative,
.reward-share-fade-leave-to .relative {
  transform: translateY(8px) scale(0.96);
}

@media (min-width: 640px) {
  .reward-share-fade-enter-from .relative,
  .reward-share-fade-leave-to .relative {
    transform: translateY(6px) scale(0.98);
  }
}
</style>
