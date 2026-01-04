<template>
  <div v-if="showInstallPrompt" class="install-prompt">
    <div class="prompt-content">
      <div class="icon-wrapper">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div class="text-content">
        <h3 class="title">{{ t('locales.pwa.installTitle') }}</h3>
        <p class="message">{{ t('locales.pwa.installMessage') }}</p>
      </div>
      <button class="close-btn" @click="dismissPrompt">
        <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    <div class="button-group">
      <button class="btn-install" @click="install">
        {{ t('locales.pwa.install') }}
      </button>
      <button class="btn-later" @click="dismissPrompt">
        {{ t('locales.pwa.later') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const showInstallPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  })

  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false
    deferredPrompt = null
  })
})

const install = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    showInstallPrompt.value = false
  }

  deferredPrompt = null
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  deferredPrompt = null
}
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 50;
  max-width: 24rem;
  background: linear-gradient(
    135deg,
    var(--color-background-level-3),
    var(--color-background-level-5)
  );
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px var(--color-shadow-level-3);
  padding: 1rem;
  border: 1px solid var(--color-border-level-1);
}

.prompt-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.icon-wrapper {
  flex-shrink: 0;
}

.icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-theme-level-1);
}

.text-content {
  flex: 1;
}

.title {
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--color-text-level-1);
}

.message {
  font-size: 0.875rem;
  color: var(--color-text-level-2);
}

.close-btn {
  flex-shrink: 0;
  color: var(--color-text-level-1);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text-level-2);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.button-group {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.btn-install {
  flex: 1;
  padding: 0.5rem 1rem;
  background-color: var(--color-button-primary);
  color: var(--color-text-level-4);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.btn-install:hover {
  background-color: var(--color-button-primary-hover);
}

.btn-later {
  flex: 1;
  padding: 0.5rem 1rem;
  background-color: var(--color-button-secondary);
  color: var(--color-text-level-1);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.btn-later:hover {
  background-color: var(--color-button-secondary-hover);
}
</style>
