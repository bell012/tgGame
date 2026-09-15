<template>
  <Teleport to="body">
    <Transition name="online-customer" @after-leave="handleAfterLeave">
      <section
        v-if="visible"
        class="online-customer-panel"
        :class="{ 'is-mobile': isMobile }"
        :style="panelStyle"
        role="dialog"
        :aria-modal="isMobile || undefined"
        aria-labelledby="online-customer-title"
        @keydown.esc="close"
      >
        <header class="online-customer-header">
          <h2 id="online-customer-title">{{ t('onlineCustomer.title') }}</h2>
          <button
            ref="closeButton"
            class="online-customer-close"
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
        </header>
        <div class="online-customer-content" :aria-busy="loading || frameLoading">
          <iframe
            v-if="iframeUrl && !frameError"
            :key="iframeUrl"
            :src="iframeUrl"
            :title="t('onlineCustomer.title')"
            allow="clipboard-write"
            @load="frameLoading = false"
            @error="handleFrameError"
          />
          <div v-if="errorKey || frameError" class="online-customer-status" role="alert">
            <p>{{ t(errorKey || 'onlineCustomer.frameFailed') }}</p>
            <button type="button" @click="retry">{{ t('onlineCustomer.retry') }}</button>
          </div>
          <div
            v-else-if="loading || frameLoading"
            class="online-customer-status loading"
            role="status"
          >
            <span class="online-customer-spinner" aria-hidden="true" />
            <p>{{ t('onlineCustomer.loading') }}</p>
          </div>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useOnlineCustomerService } from '@/composables/useOnlineCustomerService'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, loading, url, errorKey, close, retry, afterLeave } = useOnlineCustomerService()
const frameLoading = ref(false)
const frameError = ref(false)
const leaving = ref(false)
const closeButton = ref<HTMLButtonElement | null>(null)
let previousFocus: HTMLElement | null = null

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

watch(iframeUrl, value => {
  frameLoading.value = Boolean(value)
  frameError.value = false
})
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
  z-index: 100010;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  background: var(--color-background-level-2);
  color: var(--color-text-level-1);
  box-shadow: 0 8px 32px #0005;
}
.online-customer-panel.is-mobile {
  inset: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  border-radius: 0;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
    env(safe-area-inset-left);
}
.online-customer-header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  padding: 8px 12px;
}
.online-customer-header h2 {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
}
.online-customer-header .online-customer-close {
  position: relative;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-level-2);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}
.online-customer-panel button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}
.online-customer-close svg {
  transition:
    color 160ms ease,
    transform 160ms ease;
}
.online-customer-header .online-customer-close:focus-visible {
  outline: none;
  color: var(--color-text-level-1);
}
@media (hover: hover) {
  .online-customer-close:hover {
    color: var(--color-text-level-1);
  }
}
.online-customer-close:active svg {
  transform: scale(0.92);
}
@media (prefers-reduced-motion: reduce) {
  .online-customer-close svg {
    transition: none;
  }
}
.online-customer-content {
  position: relative;
  flex: 1;
  min-height: 0;
}
.online-customer-content iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
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
  background: var(--color-background-level-2);
}
.online-customer-status.loading {
  pointer-events: none;
}
.online-customer-status button {
  padding: 10px 24px;
  border: 1px solid currentColor;
  border-radius: 8px;
}
.online-customer-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: online-customer-spin 0.8s linear infinite;
}
.online-customer-enter-active,
.online-customer-leave-active {
  transition: opacity 200ms ease;
}
.online-customer-enter-from,
.online-customer-leave-to {
  opacity: 0;
}
@keyframes online-customer-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
