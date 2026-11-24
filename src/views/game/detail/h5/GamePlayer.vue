<template>
  <div class="mt-[10px]">
    <div class="relative aspect-[1041/592]">
      <div
        class="overflow-hidden bg-bg-1"
        :class="
          fullscreen ? 'fixed inset-0 z-[10000] h-dvh w-full' : 'absolute inset-0 rounded-t-[10px]'
        "
      >
        <GameDetailPreview class="size-full" />
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
        <div v-if="session && !fullscreen" class="absolute inset-0 size-full" aria-hidden="true" />
        <button
          v-if="fullscreen"
          type="button"
          class="absolute top-[max(12px,env(safe-area-inset-top))] z-[1] size-[50px] rounded-full bg-mask-60-1"
          :class="session?.horizontal ? 'right-3' : 'left-3'"
          :aria-label="t('gameDetail.exitGame')"
          @click="requestExit"
        >
          <img :src="closeIcon" alt="" class="size-full" />
        </button>
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
          <div class="mb-[30px] mt-3.5 text-[15px] leading-5 text-text-2">
            {{ t(fullscreen ? 'gameDetail.collapseOrExitGame' : 'gameDetail.exitGameConfirm') }}
          </div>
          <button
            v-if="fullscreen"
            type="button"
            class="h-10 w-full rounded-lg bg-theme-primary text-sm font-bold text-text-4 disabled:opacity-70"
            :disabled="busy"
            @click="answerExit('collapse')"
          >
            {{ t('gameDetail.collapseGame') }}
          </button>
          <button
            type="button"
            class="h-10 w-full rounded-lg text-sm font-bold disabled:opacity-70"
            :class="fullscreen ? 'mt-[13px] bg-bg-3 text-text-2' : 'bg-theme-primary text-text-4'"
            :disabled="busy"
            @click="answerExit('exit')"
          >
            {{ t(busy ? 'common.loading' : fullscreen ? 'gameDetail.exitGame' : 'common.confirm') }}
          </button>
          <button
            type="button"
            class="mt-[13px] h-10 w-full rounded-lg bg-bg-3 text-sm font-bold text-text-2 disabled:opacity-70"
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
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import closeIcon from '@/static/svg/game/detail/close.svg?url'
import CloseIcon from '@/static/svg/close.svg?component'
import GameDetailPreview from '../common/GameDetailPreview.vue'
import CurrencyBar from './currency-bar/index.vue'
import { useEmbeddedGame } from './useEmbeddedGame'

const { t } = useI18n()
const emit = defineEmits<{ fullscreenChange: [value: boolean] }>()
const {
  session,
  fullscreen,
  busy,
  frameLoading,
  loadError,
  showExitDialog,
  leaving,
  playGame,
  changeCurrency,
  finishFrameLoad,
  failFrameLoad,
  answerExit,
  requestExit
} = useEmbeddedGame()
watch(fullscreen, value => emit('fullscreenChange', value), { flush: 'sync' })
usePageScrollLock(computed(() => fullscreen.value || showExitDialog.value))
</script>
