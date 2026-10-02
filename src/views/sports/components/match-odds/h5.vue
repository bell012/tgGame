<template>
  <div v-if="isStrip && stripLine" class="flex items-stretch gap-1">
    <button
      v-for="selection in visibleSelections(stripLine)"
      :key="selection.WagerSelectionId"
      type="button"
      class="flex h-9 min-w-0 flex-1 items-center justify-between rounded-lg px-3"
      :class="isSelected(selection) ? 'bg-theme-primary text-text-4' : 'bg-bg-3 text-text-1'"
      @click="emit('select', { market: stripLine, option: selection })"
    >
      <span class="flex min-w-0 items-center gap-1 truncate text-[12px] font-normal">
        <span class="truncate">{{ selectionLabel(selection) }}</span>
        <span v-if="shouldShowHandicap(stripLine, selection)" class="shrink-0">{{
          formatHandicap(selection.Handicap)
        }}</span>
      </span>
      <span class="shrink-0 text-[12px] font-bold" :class="oddsNumberClass(selection)">
        <span v-if="oddsArrow(selection)" aria-hidden="true">{{ oddsArrow(selection) }}</span
        >{{ selection.Odds }}
      </span>
    </button>
  </div>

  <div v-else class="flex flex-col gap-3">
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
          v-for="(selection, index) in listCells(line)"
          :key="selection?.WagerSelectionId ?? `${line.MarketlineId}-locked-${index}`"
          type="button"
          class="flex w-full flex-col items-center justify-center rounded-[5px]"
          :class="cellClass(line, selection)"
          @click="onListSelect(line, selection)"
        >
          <img
            v-if="line.IsLocked"
            class="h-[18px] w-[18px] shrink-0 object-contain"
            :src="lockIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <template v-else-if="selection">
            <span
              class="text-[12px] font-normal leading-none"
              :class="isSelected(selection) ? 'text-text-4' : 'text-text-2'"
            >
              {{ selectionLabel(selection) }}
              <span v-if="shouldShowHandicap(line, selection)">{{
                formatHandicap(selection.Handicap)
              }}</span>
            </span>
            <span
              class="flex items-center justify-center gap-0.5 text-[12px] font-bold leading-none"
              :class="oddsNumberClass(selection)"
            >
              <span v-if="oddsArrow(selection)" aria-hidden="true">{{ oddsArrow(selection) }}</span>
              {{ selection.Odds }}
            </span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import lockIcon from '../../event-details/components/sports-score-details/img/bold.svg?url'
import {
  formatHandicap,
  hasFiniteOdds,
  isWagerSelected,
  selectionLetterKey,
  shouldShowHandicap
} from './display'
import { noteMarketLines, trendOf } from './odds-trend'
import type { OddsSelectPayload, SportMarketLine, SportWagerSelection } from './types'

const props = withDefaults(
  defineProps<{
    MarketLines: SportMarketLine[]
    selectedWagerSelectionId?: number | string
    layout?: 'list' | 'strip'
    HomeTeam?: string
    AwayTeam?: string
  }>(),
  {
    layout: 'list'
  }
)

const emit = defineEmits<{
  select: [payload: OddsSelectPayload]
}>()

const { t } = useI18n()

const selectionLabel = (selection: SportWagerSelection) => {
  const key = selectionLetterKey(selection)
  return key ? t(key) : selection.SelectionName
}

const isStrip = computed(() => props.layout === 'strip')
const stripLine = computed(() => props.MarketLines[0])

const columnClass = computed(() => {
  if (props.MarketLines.length <= 1) return 'grid-cols-1'
  if (props.MarketLines.length === 2) return 'grid-cols-2'
  return 'grid-cols-3'
})

const visibleSelections = (line: SportMarketLine) =>
  (line.WagerSelections ?? []).filter(hasFiniteOdds)

const lockedPlaceholderCount = (line: SportMarketLine) => (line.BetTypeId === 3 ? 3 : 2)

const listCells = (line: SportMarketLine): Array<SportWagerSelection | undefined> => {
  if (!line.IsLocked) return visibleSelections(line)
  const selections = line.WagerSelections ?? []
  if (selections.length) return selections
  return Array.from({ length: lockedPlaceholderCount(line) })
}

const isSelected = (selection: SportWagerSelection) =>
  isWagerSelected(selection, props.selectedWagerSelectionId)

const oddsNumberClass = (selection: SportWagerSelection) => {
  if (isSelected(selection)) return 'text-text-4'
  const trend = trendOf(selection.WagerSelectionId)
  if (trend === 'up') return 'text-theme-primary'
  if (trend === 'down') return 'text-secondary-2'
  return 'text-text-1'
}

const oddsArrow = (selection: SportWagerSelection) => {
  if (isSelected(selection)) return ''
  const trend = trendOf(selection.WagerSelectionId)
  return trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''
}

watch(() => props.MarketLines, noteMarketLines, { deep: true, immediate: true })

const onListSelect = (line: SportMarketLine, selection?: SportWagerSelection) => {
  if (line.IsLocked || !selection) return
  emit('select', { market: line, option: selection })
}

const cellClass = (line: SportMarketLine, selection?: SportWagerSelection) => {
  const compact = listCells(line).length >= 3
  const size = compact
    ? 'h-[37px] gap-0.5 px-[10px] py-[3px]'
    : 'h-[58px] gap-[3px] px-[5px] py-[7px]'
  const tone = !line.IsLocked && selection && isSelected(selection) ? 'bg-theme-primary' : 'bg-bg-3'
  return `${size} ${tone}`
}
</script>
