<template>
  <div :class="isMobile ? 'mt-[10px] mx-0.5' : ''">
    <div
      ref="placeholderRef"
      class="relative"
      :class="isMobile ? 'aspect-[1041/592]' : 'aspect-[1336/680]'"
    >
      <div
        ref="playerRef"
        class="overflow-hidden bg-bg-1"
        :class="
          displayFullscreen
            ? 'fixed inset-0 z-[10000] h-dvh w-full'
            : 'absolute inset-0 rounded-t-[10px] sm:rounded-t-xl'
        "
      >
        <GameDetailPreview
          class="size-full"
          :name="detail?.itemName"
          :image="detail?.icon2 ?? detail?.conUrl"
        />
        <iframe
          v-if="session"
          :key="session.key"
          :src="session.url"
          :title="t('gameDetail.playNow')"
          class="absolute inset-0 size-full border-0 bg-bg-1"
          :class="{
            invisible: !fullscreen && (frameLoading || loadError),
            'pointer-events-none': !fullscreen || depositOpen
          }"
          :inert="!fullscreen || depositOpen"
          :tabindex="fullscreen && !depositOpen ? 0 : -1"
          allowfullscreen
          @load="finishFrameLoad"
          @error="failFrameLoad"
        />
        <button
          v-if="!fullscreen && (isMobile || session)"
          type="button"
          class="absolute inset-0 size-full disabled:cursor-not-allowed"
          :aria-label="t(isLogin ? 'gameDetail.playNow' : 'gameDetail.guestCtaH5')"
          :disabled="isLogin && loading"
          @click="handlePlay"
        />
        <div
          v-if="!isMobile && !fullscreen"
          class="absolute left-1/2 top-1/2 z-[2] w-[480px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-bg-5 p-4 lg:p-8"
        >
          <PlayForm
            v-if="isLogin"
            :loading="loading"
            :change-currency="changeCurrency"
            @play="playGame"
          />
          <template v-else>
            <div class="mb-4 text-center text-[13px] font-normal leading-4 text-text-2">
              {{ t('gameDetail.signInPrompt', { gameName: displayGameName }) }}
            </div>
            <button
              type="button"
              class="flex min-h-10 w-full items-center justify-center gap-1 rounded-lg bg-theme-primary px-2 py-1 text-sm font-bold text-text-4"
              @click="handlePlay"
            >
              <img :src="playIcon" alt="" class="size-4 shrink-0 object-contain" />
              {{ t('gameDetail.guestCta') }}
            </button>
          </template>
        </div>
        <GameFloatingControls
          :active="fullscreen && !depositOpen"
          :disabled="busy || leaving"
          :frame-loading="frameLoading"
          :change-currency="changeCurrency"
          @exit="requestExit"
          @collapse="collapseGame"
          @deposit="openDeposit"
        />
      </div>
    </div>
    <CurrencyBar
      v-if="isMobile"
      :loading="loading"
      :change-currency="changeCurrency"
      @play="playGame"
      @deposit="openDeposit"
    />
    <DesktopCurrencyBar v-else />
    <GameDepositOverlay v-if="depositOpen" ref="depositOverlay" @close="closeDeposit" />
    <Teleport to="body">
      <div
        v-if="leaving"
        class="fixed inset-0 z-[10010] flex items-center justify-center"
        :class="showExitProgress ? 'bg-mask-60-1' : ''"
        aria-busy="true"
      >
        <div
          v-if="showExitProgress"
          role="status"
          class="rounded-xl bg-bg-2 px-5 py-3 text-sm font-medium text-text-1"
        >
          {{ t('gameDetail.exitingGame') }}
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { GameDetailForPlatformPlay } from '@/composables/useGamePlatformPlay'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'
import playIcon from '@/static/img/game/detail/play.png'
import GameDetailPreview from './GameDetailPreview.vue'
import CurrencyBar from '../h5/currency-bar/index.vue'
import DesktopCurrencyBar from '../desktop/currency-bar/index.vue'
import PlayForm from '../desktop/currency-info/play-form.vue'
import GameFloatingControls from './GameFloatingControls.vue'
import GameDepositOverlay from './GameDepositOverlay.vue'
import { useEmbeddedGame } from './useEmbeddedGame'
import { useGameExpandAnimation } from './useGameExpandAnimation'

const { t } = useI18n()
const isMobile = useIsMobile()
const userStore = useUserStore()
const authModalStore = useAuthModalStore()
const isLogin = computed(() => Boolean(userStore.userInfo?.tradeToken))
const detail = inject<ComputedRef<GameDetailForPlatformPlay>>(
  'game-detail-current-game',
  computed(() => null)
)
const displayGameName = computed(
  () => String(detail.value?.itemName ?? detail.value?.platformName ?? '').trim() || '--'
)
const depositOpen = ref(false)
const depositOverlay = ref<InstanceType<typeof GameDepositOverlay>>()
const closeDeposit = () => {
  depositOpen.value = false
  if (isLogin.value) void userStore.refreshBalance({ force: true })
}
const closeOverlay = () => {
  if (!depositOpen.value) return false
  if (!depositOverlay.value?.back()) closeDeposit()
  return true
}
const emit = defineEmits<{ fullscreenChange: [value: boolean] }>()
const {
  session,
  fullscreen,
  busy,
  frameLoading,
  loadError,
  showExitProgress,
  leaving,
  playGame,
  changeCurrency,
  finishFrameLoad,
  failFrameLoad,
  collapseGame,
  requestExit
} = useEmbeddedGame(detail, closeOverlay)
const loading = computed(() => busy.value || frameLoading.value || leaving.value)
const openDeposit = () => {
  if (!isLogin.value || busy.value || leaving.value) return
  depositOpen.value = true
}
watch([() => userStore.userInfo?.tradeToken, () => userStore.acctInfo?.memberRowId], () => {
  depositOpen.value = false
})
const placeholderRef = ref<HTMLElement | null>(null)
const playerRef = ref<HTMLElement | null>(null)
const { displayFullscreen } = useGameExpandAnimation({
  fullscreen,
  placeholder: placeholderRef,
  player: playerRef,
  onFullscreenChange: value => emit('fullscreenChange', value)
})
const handlePlay = () => {
  if (!isLogin.value) {
    authModalStore.openLoginModal()
    return
  }
  void playGame()
}
usePageScrollLock(computed(() => displayFullscreen.value || depositOpen.value))
</script>
