<template>
  <nav class="flex w-full items-center gap-5 overflow-visible rounded-xl bg-bg-2 px-6 py-3">
    <div
      class="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      @scroll="hideSportTooltip"
    >
      <button
        v-for="(item, index) in sportItems"
        :key="item.key"
        type="button"
        class="relative flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent px-1 transition-colors duration-200"
        :class="getSportButtonClass(item)"
        :aria-label="t(item.i18nKey)"
        @mouseenter="showSportTooltip($event, item)"
        @mouseleave="hideSportTooltip"
        @focus="showSportTooltip($event, item)"
        @blur="hideSportTooltip"
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
      class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-icon-2 transition-colors duration-200 hover:text-theme-primary"
      aria-label="betting history"
      @click="handleBettingHistory"
    >
      <BettingHistoryIcon
        class="block h-[30px] w-[30px] fill-current [&_path]:fill-current [&_rect]:fill-current"
      />
    </button>
  </nav>
  <Teleport to="body">
    <span
      v-if="sportTooltip"
      class="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-md border border-bg-3 bg-bg-2 px-3 py-2 text-[13px] font-normal leading-none text-text-1 shadow-[0_4px_16px_rgba(0,0,0,0.24)]"
      role="tooltip"
      :style="sportTooltipStyle"
    >
      {{ sportTooltip.label }}
    </span>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { navigateTo } from '@/utils/router'
import BettingHistoryIcon from './icon/betting-history.svg?component'
import { sportItems, type SportItem } from './sport-items'

const { t } = useI18n()

const props = defineProps<{
  selectedSportId: number
  counts?: Partial<Record<string, number>>
}>()

const emit = defineEmits<{
  change: [index: number, key: string]
}>()

const sportTooltip = ref<{ x: number; y: number; label: string } | null>(null)

const sportTooltipStyle = computed(() => {
  if (!sportTooltip.value) {
    return undefined
  }

  return {
    left: `${sportTooltip.value.x}px`,
    top: `${sportTooltip.value.y}px`,
    transform: 'translateX(-50%)'
  }
})

function getSportCount(item: SportItem) {
  return props.counts?.[item.key] ?? 0
}

function getSportButtonClass(item: SportItem) {
  return props.selectedSportId === item.sportId
    ? 'text-theme-primary'
    : 'text-icon-2 hover:text-theme-primary'
}

function showSportTooltip(event: MouseEvent | FocusEvent, item: SportItem) {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) {
    return
  }

  const rect = target.getBoundingClientRect()
  sportTooltip.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 6,
    label: t(item.i18nKey)
  }
}

function hideSportTooltip() {
  sportTooltip.value = null
}

// 点击 PC 投注历史图标进入体育投注历史页。
function handleBettingHistory() {
  navigateTo('/sports/bet-history')
}

// 点击球种后向父级暴露当前选择，由主体育逻辑统一处理。
function handleSelect(index: number) {
  hideSportTooltip()
  emit('change', index, sportItems[index].key)
}
</script>
