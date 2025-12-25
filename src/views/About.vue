<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-8">{{ t('about.title') }}</h1>
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <p class="text-gray-700">{{ t('about.description') }}</p>
      <router-link to="/" class="inline-block mt-4 text-blue-500 hover:text-blue-700">
        {{ t('about.backHome') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

