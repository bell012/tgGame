<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-8">{{ t('home.title') }}</h1>
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <p class="text-gray-700 mb-4">{{ t('home.welcome') }}</p>
      <div class="flex gap-4">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          @click="changeLanguage('en')"
        >
          English
        </button>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          @click="changeLanguage('zh')"
        >
          中文
        </button>
      </div>
      <div class="mt-4">
        <p class="text-sm text-gray-600">{{ t('home.counter') }}: {{ count }}</p>
        <button
          class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          @click="increment"
        >
          {{ t('home.increment') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const { t, locale } = useI18n()
const counterStore = useCounterStore()
const { count } = storeToRefs(counterStore)
const { increment } = counterStore

const changeLanguage = (lang: string) => {
  locale.value = lang
}
</script>

