<template>
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-3 gap-x-1">
      <p
        v-for="market in markets"
        :key="`${market.id}-title`"
        class="text-center text-[10px] font-normal leading-[10px] text-text-2"
      >
        {{ market.title }}
      </p>
    </div>
    <div class="grid grid-cols-3 items-start gap-x-1">
      <div v-for="market in markets" :key="market.id" class="flex min-w-0 flex-col gap-1">
        <button
          v-for="option in market.options"
          :key="option.id"
          type="button"
          class="flex w-full flex-col items-center justify-center rounded-[5px]"
          :class="cellClass(market, option)"
          @click="emit('select', { market, option })"
        >
          <span
            class="text-[12px] font-normal leading-none"
            :class="option.selected ? 'text-text-4' : 'text-text-2'"
          >
            {{ option.label }}
          </span>
          <span
            class="flex items-center justify-center gap-0.5 text-[12px] font-bold leading-none"
            :class="option.selected ? 'text-text-4' : 'text-text-1'"
          >
            <span
              v-if="option.trend === 'up'"
              class="text-[12px] leading-none"
              :class="option.selected ? 'text-text-4' : 'text-theme-primary'"
            >
              ↑
            </span>
            <span
              v-if="option.trend === 'down'"
              class="text-[12px] leading-none"
              :class="option.selected ? 'text-text-4' : 'text-assistRed'"
            >
              ↓
            </span>
            {{ option.odds }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OddsMarket, OddsOption, OddsSelectPayload } from './types'

defineProps<{
  markets: OddsMarket[]
}>()

const emit = defineEmits<{
  select: [payload: OddsSelectPayload]
}>()

const cellClass = (market: OddsMarket, option: OddsOption) => {
  const compact = market.options.length >= 3
  const size = compact
    ? 'h-[37px] gap-0.5 px-[10px] py-[3px]'
    : 'h-[58px] gap-[3px] px-[5px] py-[7px]'
  const tone = option.selected ? 'bg-theme-primary' : 'bg-bg-3'
  return `${size} ${tone}`
}
</script>
