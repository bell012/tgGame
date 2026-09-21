<template>
  <div class="flex flex-col gap-3">
    <section
      v-for="(line, marketIndex) in visibleMarketLines"
      :key="line.MarketlineId"
      class="flex flex-col gap-3"
    >
      <p class="flex items-center gap-2 text-[14px] font-normal leading-none text-text-2">
        <span>{{ line.BetTypeName }}</span>
        <span v-if="line.PeriodId !== 1 && line.PeriodName">{{ line.PeriodName }}</span>
      </p>
      <div class="flex items-stretch gap-2">
        <button
          v-for="selection in visibleSelections(line)"
          :key="selection.WagerSelectionId"
          type="button"
          class="flex h-11 min-w-0 flex-1 items-center justify-between rounded-lg px-4 py-3"
          :class="
            isWagerSelected(selection, selectedWagerSelectionId)
              ? 'bg-theme-primary text-text-4'
              : 'bg-bg-3 text-text-1'
          "
          @click="emit('select', { market: line, option: selection })"
        >
          <span
            class="flex min-w-0 items-center gap-2 truncate text-[14px] font-normal"
            :class="
              isWagerSelected(selection, selectedWagerSelectionId) ? 'text-text-4' : 'text-text-1'
            "
          >
            <span class="truncate">{{ selection.SelectionName }}</span>
            <span v-if="shouldShowHandicap(line, selection)" class="shrink-0">{{
              selection.Handicap
            }}</span>
          </span>
          <span class="shrink-0 text-[14px] font-bold">{{ selection.Odds }}</span>
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
import { hasFiniteOdds, isWagerSelected, shouldShowHandicap } from './display'
import type { OddsSelectPayload, SportMarketLine } from './types'

const props = withDefaults(
  defineProps<{
    MarketLines: SportMarketLine[]
    selectedWagerSelectionId?: number | string
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

const visibleMarketLines = computed(() => {
  if (expanded.value || props.MarketLines.length === 0) {
    return props.MarketLines
  }
  return props.MarketLines.slice(0, 1)
})

const visibleSelections = (line: SportMarketLine) =>
  (line.WagerSelections ?? []).filter(hasFiniteOdds)

const toggleExpanded = () => {
  emit('update:expanded', !expanded.value)
}
</script>
