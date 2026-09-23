<template>
  <nav class="flex w-full items-center gap-5 rounded-xl bg-bg-2 px-6 py-3">
    <div class="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto pr-1">
      <button
        v-for="(item, index) in sportItems"
        :key="item.key"
        type="button"
        class="flex shrink-0 cursor-pointer border-none bg-transparent p-0 transition-colors duration-200"
        :class="props.selectedSportId === item.sportId ? 'text-theme-primary' : 'text-icon-2'"
        @click="handleSelect(index)"
      >
        <span class="inline-block pr-3">
          <span class="relative block h-9 w-9">
            <component
              :is="item.icon"
              class="block h-9 w-9 fill-current [&_path]:fill-current [&_rect]:fill-current"
            />
            <span
              v-if="getSportCount(item) > 0"
              class="absolute right-0 top-1 min-w-[18px] translate-x-[86%] -translate-y-[25%] rounded pt-0 px-[2px] pb-[1px] text-center text-[11px] font-[700] leading-[14px] text-[#FFF] bg-secondary-2"
            >
              {{ getSportCount(item) }}
            </span>
          </span>
        </span>
      </button>
    </div>
    <button
      type="button"
      class="flex shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-icon-2 transition-colors duration-200 hover:text-text-1"
      aria-label="betting history"
      @click="handleBettingHistory"
    >
      <BettingHistoryIcon
        class="block h-[30px] w-[30px] fill-current [&_path]:fill-current [&_rect]:fill-current"
      />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { navigateTo } from '@/utils/router'
import BettingHistoryIcon from './icon/betting-history.svg?component'
import { sportItems, type SportItem } from './sport-items'

const props = defineProps<{
  selectedSportId: number
  counts?: Partial<Record<string, number>>
}>()

const emit = defineEmits<{
  change: [index: number, key: string]
}>()

function getSportCount(item: SportItem) {
  return props.counts?.[item.key] ?? 0
}

// 点击 PC 投注历史图标进入体育投注历史页。
function handleBettingHistory() {
  navigateTo('/sports/bet-history')
}

// 点击球种后向父级暴露当前选择，由主体育逻辑统一处理。
function handleSelect(index: number) {
  emit('change', index, sportItems[index].key)
}
</script>
