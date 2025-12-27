<template>
  <div
    v-if="offlineReady || needRefresh"
    class="reload-prompt"
    role="alert"
  >
    <div class="prompt-content">
      <div class="icon-wrapper">
        <svg
          v-if="offlineReady"
          class="icon icon-success"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else
          class="icon icon-update"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
      <div class="text-content">
        <h3 class="title">
          {{ offlineReady ? t('pwa.offlineReady') : t('pwa.newContent') }}
        </h3>
        <p class="message">
          {{ offlineReady ? t('pwa.offlineMessage') : t('pwa.updateMessage') }}
        </p>
      </div>
    </div>
    <div class="button-group">
      <button
        v-if="needRefresh"
        class="btn-reload"
        @click="updateServiceWorker()"
      >
        {{ t('pwa.reload') }}
      </button>
      <button
        class="btn-close"
        @click="close"
      >
        {{ t('pwa.close') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const {
  offlineReady,
  needRefresh,
  updateServiceWorker
} = useRegisterSW()

const close = () => {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<style scoped>
.reload-prompt {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 50;
  max-width: 28rem;
  background-color: var(--color-background-level-2);
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px var(--color-shadow-level-3);
  padding: 1rem;
  border: 1px solid var(--color-border-level-1);
  transition: all 0.3s;
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
  width: 1.5rem;
  height: 1.5rem;
}

.icon-success {
  color: var(--color-secondary-level-4);
}

.icon-update {
  color: var(--color-theme-level-1);
}

.text-content {
  flex: 1;
}

.title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-level-1);
  margin-bottom: 0.25rem;
}

.message {
  font-size: 0.875rem;
  color: var(--color-text-level-2);
}

.button-group {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.btn-reload {
  flex: 1;
  padding: 0.5rem 1rem;
  background-color: var(--color-button-primary);
  color: var(--color-text-level-4);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.btn-reload:hover {
  background-color: var(--color-button-primary-hover);
}

.btn-close {
  flex: 1;
  padding: 0.5rem 1rem;
  background-color: var(--color-button-secondary);
  color: var(--color-text-level-1);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: var(--color-button-secondary-hover);
}
</style>

