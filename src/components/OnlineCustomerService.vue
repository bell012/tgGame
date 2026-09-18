<template>
  <Teleport to="body">
    <Transition name="online-customer" @after-leave="handleAfterLeave">
      <section
        v-if="visible"
        class="online-customer-panel"
        :class="{ 'is-mobile': isMobile, 'is-pending': isPending }"
        :style="panelStyle"
        role="dialog"
        :aria-modal="isMobile || undefined"
        :aria-label="t('onlineCustomer.title')"
        @keydown.esc="close"
      >
        <div class="online-customer-content" :aria-busy="isPending">
          <button
            ref="closeButton"
            class="online-customer-close"
            :class="{ 'is-neutral': isPending || errorKey || frameError }"
            :style="closeButtonStyle"
            type="button"
            :aria-label="t('onlineCustomer.close')"
            @click="close"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="m6 6 12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <iframe
            v-if="iframeUrl && !frameError"
            :key="iframeUrl"
            :src="iframeUrl"
            :title="t('onlineCustomer.title')"
            allow="clipboard-write"
            @load="frameLoading = false"
            @error="handleFrameError"
          />
          <div
            v-if="isPending"
            class="online-customer-loader"
            role="status"
            :aria-label="t('onlineCustomer.loading')"
          >
            <LottiePlayer
              v-if="loadingLottieUrl"
              :path="loadingLottieUrl"
              :fallback-src="loadingSpadeSrc"
              :respect-reduced-motion="false"
            />
            <img v-else :src="loadingSpadeSrc" alt="" />
          </div>
          <div v-if="errorKey || frameError" class="online-customer-status" role="alert">
            <p>{{ t(errorKey || 'onlineCustomer.frameFailed') }}</p>
            <button type="button" @click="retry">{{ t('onlineCustomer.retry') }}</button>
          </div>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LottiePlayer from '@/components/LottiePlayer.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useOnlineCustomerService } from '@/composables/useOnlineCustomerService'
import loadingSpadeSrc from '@/static/img/online-customer/loading-spade.png'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, loading, url, errorKey, loadingLottieUrl, close, retry, afterLeave } =
  useOnlineCustomerService()
const frameLoading = ref(false)
const frameError = ref(false)
const leaving = ref(false)
const closeButton = ref<HTMLButtonElement | null>(null)
let previousFocus: HTMLElement | null = null

const isPending = computed(
  () =>
    visible.value && (loading.value || frameLoading.value) && !errorKey.value && !frameError.value
)

const closeButtonStyle = {
  '--close-hit-size': '44px',
  '--close-size': '32px',
  '--close-radius': '8px',
  '--close-icon-size': '20px',
  '--close-offset': '6px'
}

// Inline pixel sizes stay fixed even when the application's rem scale changes.
const panelStyle = computed(() =>
  isMobile.value
    ? undefined
    : {
        width: '400px',
        height: '640px',
        right: '24px',
        bottom: '24px',
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100dvh - 48px)'
      }
)

const iframeUrl = computed(() => {
  if (!url.value || isMobile.value) {
    return url.value
  }

  try {
    const address = new URL(url.value)
    address.searchParams.set('pf', 'mobile')
    return address.href
  } catch {
    return url.value
  }
})

usePageScrollLock(() => isMobile.value && (visible.value || leaving.value))

watch(
  iframeUrl,
  value => {
    frameLoading.value = Boolean(value)
    frameError.value = false
  },
  { flush: 'sync' }
)
watch(visible, async value => {
  if (value) {
    leaving.value = false
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    if (visible.value) closeButton.value?.focus()
  } else {
    leaving.value = true
  }
})

const handleFrameError = () => {
  frameLoading.value = false
  frameError.value = true
}
const handleAfterLeave = () => {
  if (visible.value) return
  afterLeave()
  leaving.value = false
  if (previousFocus?.isConnected) previousFocus.focus()
  previousFocus = null
}
</script>

<style scoped>
.online-customer-panel {
  position: fixed;
  box-sizing: border-box;
  z-index: 100010;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  clip-path: inset(0 round 16px);
  background: var(--color-background-level-2);
  color: var(--color-text-level-1);
  box-shadow: 0 8px 32px #0005;
}
.online-customer-panel.is-pending {
  background: transparent;
  box-shadow: none;
}
.online-customer-panel.is-mobile {
  inset: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  border-radius: 0;
  clip-path: none;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
    env(safe-area-inset-left);
}
.online-customer-close {
  --close-background: #3185ff;
  --close-hover-background: #5299ff;
  --close-active-background: #2675e8;
  position: absolute;
  z-index: 2;
  top: var(--close-offset);
  right: var(--close-offset);
  display: grid;
  place-items: center;
  width: var(--close-hit-size);
  height: var(--close-hit-size);
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.online-customer-close.is-neutral {
  --close-background: rgba(255, 255, 255, 0.12);
  --close-hover-background: rgba(255, 255, 255, 0.18);
  --close-active-background: rgba(255, 255, 255, 0.24);
}
.online-customer-close::before {
  content: '';
  position: absolute;
  width: var(--close-size);
  height: var(--close-size);
  border-radius: var(--close-radius);
  background: var(--close-background);
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}
.online-customer-panel button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}
.online-customer-close svg {
  position: relative;
  width: var(--close-icon-size);
  height: var(--close-icon-size);
  transition: transform 160ms ease;
}
.online-customer-panel .online-customer-close:focus-visible {
  outline: none;
}
.online-customer-close:focus-visible::before {
  background: var(--close-hover-background);
}
@media (hover: hover) {
  .online-customer-close:hover::before {
    background: var(--close-hover-background);
  }
}
.online-customer-close:active::before {
  background: var(--close-active-background);
  transform: scale(0.92);
}
.online-customer-close:active svg {
  transform: scale(0.92);
}
@media (prefers-reduced-motion: reduce) {
  .online-customer-close::before,
  .online-customer-close svg {
    transition: none;
  }
}
.online-customer-content {
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: inherit;
}
.online-customer-content iframe {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: inherit;
  background: var(--color-background-level-2);
}
.online-customer-loader {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.online-customer-loader > * {
  width: 96px;
  height: 96px;
}
.online-customer-status {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
  border-radius: inherit;
  background: var(--color-background-level-2);
}
.online-customer-status button {
  padding: 10px 24px;
  border: 1px solid currentColor;
  border-radius: 8px;
}
.online-customer-enter-active,
.online-customer-leave-active {
  transition: opacity 200ms ease;
}
.online-customer-enter-from,
.online-customer-leave-to {
  opacity: 0;
}
</style>
