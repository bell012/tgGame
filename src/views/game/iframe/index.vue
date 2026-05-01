<template>
  <div class="game-iframe-page">
    <button type="button" class="game-iframe-page__close-btn" @click="openExitDialog">
      <img :src="closeIcon" alt="close" class="game-iframe-page__close-icon" />
    </button>

    <iframe
      v-if="iframeSrc"
      class="game-iframe-page__frame"
      :src="iframeSrc"
      frameborder="0"
      allowfullscreen
    />
    <div v-else class="game-iframe-page__empty">{{ t('gameDetail.invalidGameUrl') }}</div>

    <div v-if="showExitDialog" class="game-iframe-page__dialog-mask" @click="closeExitDialog">
      <div class="game-iframe-page__dialog" @click.stop>
        <button type="button" class="game-iframe-page__dialog-close" @click="closeExitDialog">
          ×
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import closeIcon from '@/static/svg/game/detail/close.svg?url'

const router = useRouter()
const { t } = useI18n()
const showExitDialog = ref(false)
const isConfirmLoading = ref(false)
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
  let res: any
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
  position: relative;
  width: 100%;
  height: 100dvh;
  background: #000;
}

.game-iframe-page__frame {
  width: 100%;
  height: 100%;
  border: 0;
}

.game-iframe-page__empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.game-iframe-page__close-btn {
  position: absolute;
  top: 48px;
  left: 14px;
  z-index: 20;
  width: 50px;
  height: 50px;
  border: 0;
  border-radius: 9999px;
  padding: 0;
  background: rgba(0, 0, 0, 0.55);
  cursor: pointer;
}

.game-iframe-page__close-icon {
  width: 100%;
  height: 100%;
}

.game-iframe-page__dialog-mask {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
}

.game-iframe-page__dialog {
  position: relative;
  width: min(360px, 100%);
  border-radius: 12px;
  padding: 18px 16px 14px;
  background: #22282d;
  color: #fff;
}

.game-iframe-page__dialog-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: #d5d5d5;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.game-iframe-page__dialog-title {
  font-size: 16px;
  font-weight: 700;
}

.game-iframe-page__dialog-text {
  margin-top: 14px;
  margin-bottom: 18px;
  font-size: 14px;
  line-height: 1.4;
  color: #d5d5d5;
}

.game-iframe-page__dialog-confirm,
.game-iframe-page__dialog-cancel {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.game-iframe-page__dialog-confirm:disabled,
.game-iframe-page__dialog-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.game-iframe-page__dialog-confirm {
  color: #000;
  background: #38e186;
}

.game-iframe-page__dialog-cancel {
  margin-top: 12px;
  color: #c9c9c9;
  background: #3a3f45;
}
</style>
