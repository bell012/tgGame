<template>
  <div class="flex flex-col gap-3">
    <div class="grid gap-x-1" :class="columnClass">
      <p
        v-for="line in MarketLines"
        :key="`${line.MarketlineId}-title`"
        class="flex flex-col items-center gap-0.5 text-center text-[10px] font-normal leading-[10px] text-text-2"
      >
        <span>{{ line.BetTypeName }}</span>
        <span v-if="line.PeriodId !== 1 && line.PeriodName">{{ line.PeriodName }}</span>
      </p>
    </div>
    <div class="grid items-start gap-x-1" :class="columnClass">
      <div v-for="line in MarketLines" :key="line.MarketlineId" class="flex min-w-0 flex-col gap-1">
        <button
          v-for="selection in visibleSelections(line)"
          :key="selection.WagerSelectionId"
          type="button"
          class="flex w-full flex-col items-center justify-center rounded-[5px]"
          :class="cellClass(line, selection)"
          @click="emit('select', { market: line, option: selection })"
        >
          <span
            class="text-[12px] font-normal leading-none"
            :class="isSelected(selection) ? 'text-text-4' : 'text-text-2'"
          >
            {{ selection.SelectionName }}
            <span v-if="shouldShowHandicap(line, selection)">{{ selection.Handicap }}</span>
          </span>
          <span
            class="flex items-center justify-center gap-0.5 text-[12px] font-bold leading-none"
            :class="isSelected(selection) ? 'text-text-4' : 'text-text-1'"
          >
            {{ selection.Odds }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hasFiniteOdds, isWagerSelected, shouldShowHandicap } from './display'
import type { OddsSelectPayload, SportMarketLine, SportWagerSelection } from './types'

const props = defineProps<{
  MarketLines: SportMarketLine[]
  selectedWagerSelectionId?: number | string
}>()

const emit = defineEmits<{
  select: [payload: OddsSelectPayload]
}>()

const columnClass = computed(() => {
  if (props.MarketLines.length <= 1) return 'grid-cols-1'
  if (props.MarketLines.length === 2) return 'grid-cols-2'
  return 'grid-cols-3'
})

const visibleSelections = (line: SportMarketLine) =>
  (line.WagerSelections ?? []).filter(hasFiniteOdds)

const isSelected = (selection: SportWagerSelection) =>
  isWagerSelected(selection, props.selectedWagerSelectionId)

const cellClass = (line: SportMarketLine, selection: SportWagerSelection) => {
  const compact = visibleSelections(line).length >= 3
  const size = compact
    ? 'h-[37px] gap-0.5 px-[10px] py-[3px]'
    : 'h-[58px] gap-[3px] px-[5px] py-[7px]'
  const tone = isSelected(selection) ? 'bg-theme-primary' : 'bg-bg-3'
  return `${size} ${tone}`
}
</script>
