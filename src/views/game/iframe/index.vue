<template>
  <div class="game-iframe-page">
    <iframe
      v-if="iframeSrc"
      class="game-iframe-page__frame"
      :src="iframeSrc"
      frameborder="0"
      allowfullscreen
    />
    <div v-else class="game-iframe-page__empty">{{ t('gameDetail.invalidGameUrl') }}</div>

    <div
      class="game-iframe-page__swipe-edge"
      aria-hidden="true"
      @touchstart="handleSwipeStart"
      @touchmove="handleSwipeMove"
      @touchend="handleSwipeEnd"
      @touchcancel="handleSwipeEnd"
    />
    <button
      type="button"
      class="game-iframe-page__close-btn"
      :class="{ 'game-iframe-page__close-btn--right-top': isHorizontal === '1' }"
      @click="openExitDialog"
    >
      <img :src="closeIcon" alt="close" class="game-iframe-page__close-icon" />
    </button>

    <div v-if="showExitDialog" class="game-iframe-page__dialog-mask" @click="closeExitDialog">
      <div class="game-iframe-page__dialog" @click.stop>
        <button type="button" class="game-iframe-page__dialog-close" @click="closeExitDialog">
          <CloseIcon class="game-iframe-page__dialog-close-icon" aria-hidden="true" />
        </button>
        <div class="game-iframe-page__dialog-title">{{ t('withdraw.kind_reminder_title') }}</div>
        <div class="game-iframe-page__dialog-text">{{ t('gameDetail.exitGameConfirm') }}</div>
        <button
          type="button"
          class="game-iframe-page__dialog-confirm"
          :disabled="isConfirmLoading"
          @click="confirmExit"
        >
          {{ isConfirmLoading ? t('common.loading') : t('common.confirm') }}
        </button>
        <button
          type="button"
          class="game-iframe-page__dialog-cancel"
          :disabled="isConfirmLoading"
          @click="closeExitDialog"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { LogoutAllPlatformResponse } from '@/api/interface/game'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import closeIcon from '@/static/svg/game/detail/close.svg?url'
import CloseIcon from '@/static/svg/close.svg?component'

const router = useRouter()
const { t } = useI18n()
const showExitDialog = ref(false)
const isConfirmLoading = ref(false)
const swipeStartX = ref(0)
const swipeStartY = ref(0)
const launchState = computed(() => {
  if (typeof window === 'undefined') {
    return null
  }

  const state = window.history.state as { gameLaunch?: Record<string, unknown> } | null
  return state?.gameLaunch ?? null
})

const iframeSrc = computed(() => {
  const url = String(launchState.value?.url ?? '').trim()
  return url
})
const gameCode = computed(() => {
  return String(launchState.value?.gameCode ?? '').trim()
})
const companyCode = computed(() => {
  return String(launchState.value?.companyCode ?? '').trim()
})
const detailRowId = computed(() => {
  return String(launchState.value?.rowId ?? '').trim()
})

const isHorizontal = computed(() => {
  return String(launchState.value?.isHorizontal ?? '').trim()
})

const handleSwipeStart = (event: TouchEvent) => {
  const touch = event.touches[0]
  if (!touch) {
    return
  }

  swipeStartX.value = touch.clientX
  swipeStartY.value = touch.clientY
}

const handleSwipeMove = (event: TouchEvent) => {
  const touch = event.touches[0]
  if (!touch) {
    return
  }

  const distanceX = touch.clientX - swipeStartX.value
  const distanceY = Math.abs(touch.clientY - swipeStartY.value)

  if (distanceX >= 40 && distanceY <= 50) {
    openExitDialog()
  }
}

const handleSwipeEnd = () => {
  swipeStartX.value = 0
  swipeStartY.value = 0
}

const openExitDialog = () => {
  showExitDialog.value = true
}

const closeExitDialog = () => {
  showExitDialog.value = false
}

const confirmExit = async () => {
  if (isConfirmLoading.value) {
    return
  }

  isConfirmLoading.value = true
  let res: LogoutAllPlatformResponse | undefined
  try {
    res = await Api.game.logoutAllPlatform({
      companyCode: companyCode.value,
      gameCode: gameCode.value
    })
  } catch (error) {
    console.error('logoutAllPlatform failed', error)
    isConfirmLoading.value = false
    return
  }

  if (res?.code !== 'C2') {
    isConfirmLoading.value = false
    return
  }

  showExitDialog.value = false

  if (detailRowId.value) {
    await navigateTo(`/game/${detailRowId.value}`, { replace: true })
    isConfirmLoading.value = false
    return
  }

  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
    isConfirmLoading.value = false
    return
  }

  await navigateTo('/', { replace: true })
  isConfirmLoading.value = false
}
</script>

<style scoped>
.game-iframe-page {
  position: fixed;
  inset: 0;
  z-index: 9999;
  isolation: isolate;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #000;
}

.game-iframe-page__frame {
  position: fixed;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  border: 0;
}

.game-iframe-page__empty {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.game-iframe-page__swipe-edge {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2147483646;
  width: max(calc(env(safe-area-inset-left) + 24px), 24px);
  height: 100vh;
  height: 100dvh;
  background: transparent;
  touch-action: none;
}

.game-iframe-page__close-btn {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 2147483647;
  width: 50px;
  height: 50px;
  border: 0;
  border-radius: 9999px;
  padding: 0;
  background: rgba(0, 0, 0, 0.55);
  transform: translateZ(0);
  will-change: transform;
  cursor: pointer;
  opacity: 1;
  visibility: visible;
}

.game-iframe-page__close-btn--right-top {
  left: auto;
  right: 12px;
}

@media (orientation: landscape) {
  .game-iframe-page__swipe-edge {
    width: max(calc(env(safe-area-inset-left) + 44px), 44px);
  }

  .game-iframe-page__close-btn {
    top: 10px;
    left: 10px;
  }

  .game-iframe-page__close-btn--right-top {
    left: auto;
    right: 10px;
  }
}

.game-iframe-page__close-icon {
  width: 100%;
  height: 100%;
}

.game-iframe-page__dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
}

.game-iframe-page__dialog {
  position: relative;
  width: min(300px, 100%);
  border-radius: 14px;
  padding: 20px;
  background: var(--color-background-level-1);
  color: var(--color-text-level-1);
}

.game-iframe-page__dialog-close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  padding: 0;
  background: var(--color-opacity-10);
  color: var(--color-text-level-1);
  cursor: pointer;
}

.game-iframe-page__dialog-close-icon {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.game-iframe-page__dialog-close-icon :deep(path) {
  fill: currentColor;
}

.game-iframe-page__dialog-title {
  padding-right: 40px;
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
}

.game-iframe-page__dialog-text {
  margin-top: 14px;
  margin-bottom: 30px;
  font-size: 15px;
  line-height: 20px;
  color: var(--color-text-level-2);
}

.game-iframe-page__dialog-confirm,
.game-iframe-page__dialog-cancel {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  cursor: pointer;
}

.game-iframe-page__dialog-confirm:disabled,
.game-iframe-page__dialog-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.game-iframe-page__dialog-confirm {
  color: var(--color-text-level-4);
  background: var(--color-theme-level-1);
}

.game-iframe-page__dialog-cancel {
  margin-top: 13px;
  color: var(--color-text-level-2);
  background: var(--color-background-level-3);
}

:global(:root.light) .game-iframe-page__dialog-cancel {
  background: var(--color-background-level-3);
}
</style>
