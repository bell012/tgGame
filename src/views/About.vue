<template>
  <div class="container mx-auto px-4 py-8 pt-20">
    <h1 class="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
      {{ t('about.title') }}
    </h1>
    <div
      class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 transition-all duration-300"
    >
      <p class="text-gray-700 dark:text-gray-300 mb-4">{{ t('about.description') }}</p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {{ t('about.backHome') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

