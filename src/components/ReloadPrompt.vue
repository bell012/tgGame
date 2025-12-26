<template>
  <div
    v-if="offlineReady || needRefresh"
    class="fixed bottom-4 right-4 z-50 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <svg
          v-if="offlineReady"
          class="w-6 h-6 text-green-500"
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
          class="w-6 h-6 text-blue-500"
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
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {{ offlineReady ? t('pwa.offlineReady') : t('pwa.newContent') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ offlineReady ? t('pwa.offlineMessage') : t('pwa.updateMessage') }}
        </p>
      </div>
    </div>
    <div class="mt-4 flex gap-2">
      <button
        v-if="needRefresh"
        class="flex-1 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        @click="updateServiceWorker()"
      >
        {{ t('pwa.reload') }}
      </button>
      <button
        class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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

