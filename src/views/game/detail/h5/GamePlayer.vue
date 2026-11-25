<template>
  <div class="mt-[10px]">
    <div ref="placeholderRef" class="relative aspect-[1041/592]">
      <div
        ref="playerRef"
        class="overflow-hidden bg-bg-1"
        :class="
          displayFullscreen
            ? 'fixed inset-0 z-[10000] h-dvh w-full'
            : 'absolute inset-0 rounded-t-[10px]'
        "
      >
        <GameDetailPreview class="size-full" :name="previewName" :image="previewImage" />
        <iframe
          v-if="session"
          :key="session.key"
          :src="session.url"
          :title="t('gameDetail.playNow')"
          class="absolute inset-0 size-full border-0 bg-bg-1"
          :class="{
            invisible: !fullscreen && (frameLoading || loadError),
            'pointer-events-none': !fullscreen
          }"
          :inert="!fullscreen"
          :tabindex="fullscreen ? 0 : -1"
          allowfullscreen
          @load="finishFrameLoad"
          @error="failFrameLoad"
        />
        <button
          v-if="!fullscreen"
          type="button"
          class="absolute inset-0 size-full disabled:cursor-not-allowed"
          :aria-label="t(isLogin ? 'gameDetail.playNow' : 'gameDetail.guestCtaH5')"
          :disabled="isLogin && (busy || frameLoading || leaving)"
          @click="handlePreviewClick"
        />
        <GameFloatingControls
          :active="fullscreen"
          :disabled="busy || leaving"
          :frame-loading="frameLoading"
          :change-currency="changeCurrency"
          @exit="openExitPrompt"
          @collapse="collapseGame"
        />
      </div>
    </div>
    <CurrencyBar
      :loading="busy || frameLoading || leaving"
      :change-currency="changeCurrency"
      @play="playGame"
    />
    <Teleport to="body">
      <div
        v-if="showExitDialog"
        class="fixed inset-0 z-[10001] flex items-center justify-center bg-mask-60-1 p-5"
        @click.self="answerExit('cancel')"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="t('withdraw.kind_reminder_title')"
          class="relative w-full max-w-[300px] rounded-[14px] bg-bg-1 p-5 text-text-1"
        >
          <button
            type="button"
            class="absolute right-3.5 top-3.5 flex size-7 items-center justify-center rounded-md bg-opacity-10"
            :aria-label="t('common.cancel')"
            :disabled="busy"
            @click="answerExit('cancel')"
          >
            <CloseIcon class="size-2.5" />
          </button>
          <div class="pr-10 text-base font-bold leading-[22px]">
            {{ t('withdraw.kind_reminder_title') }}
          </div>
          <div class="mb-[30px] mt-3.5 text-sm leading-5 text-text-2">
            {{
              t(
                isDepositExit
                  ? 'gameDetail.exitGameForDepositConfirm'
                  : canCollapseOnExit
                    ? 'gameDetail.collapseOrExitGame'
                    : 'gameDetail.exitGameConfirm'
              )
            }}
          </div>
          <button
            v-if="canCollapseOnExit"
            type="button"
            class="h-10 w-full rounded-lg bg-theme-primary text-sm font-bold text-text-4 disabled:opacity-70"
            :disabled="busy"
            @click="answerExit('collapse')"
          >
            {{ t('gameDetail.collapseGame') }}
          </button>
          <button
            type="button"
            class="h-10 w-full rounded-lg text-sm disabled:opacity-70"
            :class="
              canCollapseOnExit
                ? 'mt-[13px] bg-opacity-10 font-normal text-text-2'
                : 'bg-theme-primary font-bold text-text-4'
            "
            :disabled="busy"
            @click="answerExit('exit')"
          >
            {{
              t(
                busy
                  ? 'common.loading'
                  : canCollapseOnExit
                    ? 'gameDetail.exitGame'
                    : 'common.confirm'
              )
            }}
          </button>
          <button
            type="button"
            class="mt-[13px] h-10 w-full rounded-lg bg-opacity-10 text-sm font-normal text-text-2 disabled:opacity-70"
            :disabled="busy"
            @click="answerExit('cancel')"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'
import CloseIcon from '@/static/svg/close.svg?component'
import GameDetailPreview from '../common/GameDetailPreview.vue'
import CurrencyBar from './currency-bar/index.vue'
import GameFloatingControls from './GameFloatingControls.vue'
import { useEmbeddedGame } from './useEmbeddedGame'
import { useGameExpandAnimation } from './useGameExpandAnimation'

defineProps<{ previewName?: string; previewImage?: string }>()
const { t } = useI18n()
const userStore = useUserStore()
const authModalStore = useAuthModalStore()
const isLogin = computed(() => Boolean(userStore.userInfo?.tradeToken))
const emit = defineEmits<{ fullscreenChange: [value: boolean] }>()
const {
  session,
  fullscreen,
  busy,
  frameLoading,
  loadError,
  showExitDialog,
  isDepositExit,
  canCollapseOnExit,
  leaving,
  playGame,
  changeCurrency,
  finishFrameLoad,
  failFrameLoad,
  answerExit,
  collapseGame,
  openExitPrompt
} = useEmbeddedGame()
const placeholderRef = ref<HTMLElement | null>(null)
const playerRef = ref<HTMLElement | null>(null)
const { displayFullscreen } = useGameExpandAnimation({
  fullscreen,
  placeholder: placeholderRef,
  player: playerRef,
  onFullscreenChange: value => emit('fullscreenChange', value)
})
const handlePreviewClick = () => {
  if (!isLogin.value) {
    authModalStore.openLoginModal()
    return
  }
  playGame()
}
usePageScrollLock(computed(() => displayFullscreen.value || showExitDialog.value))
</script>
