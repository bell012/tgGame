<template>
  <div v-if="primaryLine" class="flex flex-col">
    <section class="flex flex-col gap-3">
      <p
        v-if="showTitle"
        class="flex items-center gap-2 text-xs font-normal leading-none text-text-2"
      >
        <span>{{ primaryLine.BetTypeName }}</span>
        <span v-if="primaryLine.PeriodId !== 1 && primaryLine.PeriodName">{{
          primaryLine.PeriodName
        }}</span>
      </p>
      <div class="flex items-stretch gap-2">
        <button
          v-for="(selection, index) in lineCells(primaryLine)"
          :key="selection?.WagerSelectionId ?? `${primaryLine.MarketlineId}-locked-${index}`"
          type="button"
          class="flex h-11 min-w-0 flex-1 items-center rounded-lg px-4 py-3"
          :class="oddsButtonClass(primaryLine, selection)"
          @click="onSelect(primaryLine, selection)"
        >
          <img
            v-if="primaryLine.IsLocked"
            class="mx-auto h-[18px] w-[18px] shrink-0 object-contain"
            :src="lockIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <template v-else-if="selection">
            <span
              class="flex min-w-0 items-center gap-2 truncate text-xs font-normal"
              :class="
                isWagerSelected(selection, selectedWagerSelectionId) ? 'text-text-4' : 'text-text-1'
              "
            >
              <span class="truncate">{{ selectionLabel(selection) }}</span>
              <span v-if="shouldShowHandicap(primaryLine, selection)" class="shrink-0">{{
                selection.Handicap
              }}</span>
            </span>
            <span class="ml-auto shrink-0 text-xs font-bold">{{ selection.Odds }}</span>
          </template>
        </button>
        <button
          v-if="showExpand"
          type="button"
          class="flex h-11 shrink-0 items-center justify-center rounded-lg bg-bg-3 p-4"
          :aria-expanded="expanded"
          @click="toggleExpanded"
        >
          <CaretUp
            class="h-3 w-3 text-text-2 transition-transform duration-300 ease-out motion-reduce:transition-none"
            :class="{ 'rotate-180': !expanded }"
          />
        </button>
      </div>
    </section>
    <div
      v-if="extraLines.length"
      class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
      :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="min-h-0 overflow-hidden">
        <div class="flex flex-col gap-3 pt-3">
          <section v-for="line in extraLines" :key="line.MarketlineId" class="flex flex-col gap-3">
            <p
              v-if="showTitle"
              class="flex items-center gap-2 text-xs font-normal leading-none text-text-2"
            >
              <span>{{ line.BetTypeName }}</span>
              <span v-if="line.PeriodId !== 1 && line.PeriodName">{{ line.PeriodName }}</span>
            </p>
            <div class="flex items-stretch gap-2">
              <button
                v-for="(selection, index) in lineCells(line)"
                :key="selection?.WagerSelectionId ?? `${line.MarketlineId}-locked-${index}`"
                type="button"
                class="flex h-11 min-w-0 flex-1 items-center rounded-lg px-4 py-3"
                :class="oddsButtonClass(line, selection)"
                @click="onSelect(line, selection)"
              >
                <img
                  v-if="line.IsLocked"
                  class="mx-auto h-[18px] w-[18px] shrink-0 object-contain"
                  :src="lockIcon"
                  alt=""
                  draggable="false"
                  aria-hidden="true"
                />
                <template v-else-if="selection">
                  <span
                    class="flex min-w-0 items-center gap-2 truncate text-xs font-normal"
                    :class="
                      isWagerSelected(selection, selectedWagerSelectionId)
                        ? 'text-text-4'
                        : 'text-text-1'
                    "
                  >
                    <span class="truncate">{{ selectionLabel(selection) }}</span>
                    <span v-if="shouldShowHandicap(line, selection)" class="shrink-0">{{
                      formatHandicap(selection.Handicap)
                    }}</span>
                  </span>
                  <span class="ml-auto shrink-0 text-xs font-bold">{{ selection.Odds }}</span>
                </template>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CaretUp from '@/static/svg/sports/caret-up.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import lockIcon from '../../event-details/components/sports-score-details/img/bold.svg?url'
import {
  formatHandicap,
  hasFiniteOdds,
  isWagerSelected,
  selectionLetterKey,
  shouldShowHandicap
} from './display'
import type { OddsSelectPayload, SportMarketLine, SportWagerSelection } from './types'

const props = withDefaults(
  defineProps<{
    MarketLines: SportMarketLine[]
    selectedWagerSelectionId?: number | string
    expanded?: boolean
    showExpand?: boolean
    showTitle?: boolean
  }>(),
  {
    expanded: true,
    showExpand: true,
    showTitle: true
  }
)

const { t } = useI18n()

const selectionLabel = (selection: SportWagerSelection) => {
  const key = selectionLetterKey(selection)
  return key ? t(key) : selection.SelectionName
}

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  select: [payload: OddsSelectPayload]
}>()

const expanded = computed(() => props.expanded)
const primaryLine = computed(() => props.MarketLines[0])
const extraLines = computed(() => props.MarketLines.slice(1))

const visibleSelections = (line: SportMarketLine) =>
  (line.WagerSelections ?? []).filter(hasFiniteOdds)

const lockedPlaceholderCount = (line: SportMarketLine) => (line.BetTypeId === 3 ? 3 : 2)

const lineCells = (line: SportMarketLine): Array<SportWagerSelection | undefined> => {
  if (!line.IsLocked) return visibleSelections(line)
  const selections = line.WagerSelections ?? []
  if (selections.length) return selections
  return Array.from({ length: lockedPlaceholderCount(line) })
}

const oddsButtonClass = (line: SportMarketLine, selection?: SportWagerSelection) => {
  if (line.IsLocked || !selection) return 'justify-center bg-bg-3'
  return isWagerSelected(selection, props.selectedWagerSelectionId)
    ? 'justify-between bg-theme-primary text-text-4'
    : 'justify-between bg-bg-3 text-text-1 transition-colors lg:hover:bg-[#d0d2d2] dark:lg:hover:bg-bg-2'
}

const onSelect = (line: SportMarketLine, selection?: SportWagerSelection) => {
  if (line.IsLocked || !selection) return
  emit('select', { market: line, option: selection })
}

const toggleExpanded = () => {
  emit('update:expanded', !expanded.value)
}
</script>
