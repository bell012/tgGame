<template>
  <div class="container mx-auto px-4 py-8 pt-20">
    <h1 class="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
      {{ t('home.title') }}
    </h1>
    <div
      class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 transition-all duration-300"
    >
      <p class="text-gray-700 dark:text-gray-300 mb-4">{{ t('home.welcome') }}</p>

      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {{ t('home.languageSwitch') }}
          </h3>
          <div class="flex gap-2">
            <button
              class="flex-1 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
              @click="changeLanguage('en')"
            >
              English
            </button>
            <button
              class="flex-1 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
              @click="changeLanguage('zh')"
            >
              中文
            </button>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {{ t('home.counterDemo') }}
          </h3>
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('home.counter') }}: <span class="font-bold text-lg">{{ count }}</span>
            </p>
            <button
              class="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200"
              @click="increment"
            >
              {{ t('home.increment') }}
            </button>
          </div>
        </div>
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

<style scoped lang="scss"> 
</style>

