<template>
  <div class="flex flex-col gap-3">
    <section
      v-for="(market, marketIndex) in visibleMarkets"
      :key="market.id"
      class="flex flex-col gap-3"
    >
      <p class="text-[14px] font-normal leading-none text-text-2">{{ market.title }}</p>
      <div class="flex items-stretch gap-2">
        <button
          v-for="option in market.options"
          :key="option.id"
          type="button"
          class="flex h-11 min-w-0 flex-1 items-center justify-between rounded-lg bg-bg-3 px-4 py-3"
          @click="emit('select', { market, option })"
        >
          <span
            class="flex min-w-0 items-center gap-2 truncate text-[14px] font-normal text-text-1"
          >
            <span class="truncate">{{ option.label }}</span>
            <span v-if="option.line" class="shrink-0">{{ option.line }}</span>
          </span>
          <span class="shrink-0 text-[14px] font-bold text-text-1">{{ option.odds }}</span>
        </button>
        <button
          v-if="marketIndex === 0"
          type="button"
          class="flex h-11 shrink-0 items-center justify-center rounded-lg bg-bg-3 p-4"
          :aria-expanded="expanded"
          @click="toggleExpanded"
        >
          <CaretUp class="h-3 w-3 text-text-2" :class="{ 'rotate-180': !expanded }" />
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CaretUp from '@/static/svg/sports/caret-up.svg?component'
import { computed } from 'vue'
import type { OddsMarket, OddsSelectPayload } from './types'

const props = withDefaults(
  defineProps<{
    markets: OddsMarket[]
    expanded?: boolean
  }>(),
  {
    expanded: true
  }
)

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  select: [payload: OddsSelectPayload]
}>()

const expanded = computed(() => props.expanded)

/** 与参考稿一致：独赢(1X2) → 让球 → 大小；未知盘口保持原相对顺序排在后面 */
const PC_MARKET_ORDER = ['1x2', 'handicap', 'ou'] as const

const orderedMarkets = computed(() => {
  const markets = props.markets
  const rank = (id: string) => {
    const index = (PC_MARKET_ORDER as readonly string[]).indexOf(id)
    return index === -1 ? PC_MARKET_ORDER.length : index
  }
  return [...markets].sort((a, b) => {
    const byType = rank(a.id) - rank(b.id)
    if (byType !== 0) {
      return byType
    }
    return markets.indexOf(a) - markets.indexOf(b)
  })
})

const visibleMarkets = computed(() => {
  if (expanded.value || orderedMarkets.value.length === 0) {
    return orderedMarkets.value
  }
  return orderedMarkets.value.slice(0, 1)
})

const toggleExpanded = () => {
  emit('update:expanded', !expanded.value)
}
</script>
