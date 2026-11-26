<template>
  <div class="w-full">
    <div class="flex items-center gap-2">
      <div class="shrink-0 text-[13px] font-bold leading-5 text-text-1">
        {{ t('gameDetail.selectedCurrency') }}
      </div>
      <CurrencySelect
        class="min-w-0 flex-1"
        :disabled="loading"
        :change-currency="changeCurrency"
      />
    </div>
    <div class="mt-4 text-center text-[11px] font-bold leading-4 text-text-2">
      {{ t('gameDetail.playNowHint') }}
    </div>
    <button
      type="button"
      class="mt-4 flex min-h-10 w-full items-center justify-center gap-1 rounded-lg bg-theme-primary px-2 py-1 text-sm font-bold text-text-4"
      :disabled="loading"
      :class="{ 'opacity-50 cursor-not-allowed': loading }"
      @click="emit('play')"
    >
      <img :src="playIcon" alt="" class="size-4 shrink-0 object-contain" />
      {{ t('gameDetail.playNow') }}
    </button>
  </div>
</template>
<script setup lang="ts">
import playIcon from '@/static/img/game/detail/play.png'
import CurrencySelect from '../currency-select/index.vue'
import { useI18n } from 'vue-i18n'

defineProps<{ loading?: boolean; changeCurrency?: (value: string) => Promise<boolean> }>()
const emit = defineEmits<{ play: [] }>()
const { t } = useI18n()
</script>
