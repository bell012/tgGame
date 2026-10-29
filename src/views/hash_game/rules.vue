<template>
  <div class="fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1">
    <H5Header :title="t('hashGame.gameRules')" />

    <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[12px] py-[12px]">
      <div
        class="mb-[20px] flex items-center gap-[10px]"
        role="tablist"
        :aria-label="t('hashGame.gameRules')"
      >
        <button
          v-for="period in periodOptions"
          :key="period"
          type="button"
          role="tab"
          class="h-[30px] px-[6px] rounded-[8px] text-[13px]"
          :class="
            selectedPeriod === period
              ? 'bg-theme-primary text-text-4 font-[600]'
              : 'bg-bg-2 text-text-2 font-[400]'
          "
          :aria-selected="selectedPeriod === period"
          @click="selectedPeriod = period"
        >
          {{ period }}s Hash
        </button>
      </div>

      <div class="overflow-hidden">
        <img
          :src="rulesImage"
          :alt="t('hashGame.gameRules')"
          class="block h-auto w-full rounded-[8px] object-contain"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import rulesImage from '@/static/img/1125.png'
import { HASH_GAME_PERIOD_OPTIONS } from './index'

const { t } = useI18n()
const periodOptions = HASH_GAME_PERIOD_OPTIONS
const selectedPeriod = ref<(typeof periodOptions)[number]>(periodOptions[0])
</script>
