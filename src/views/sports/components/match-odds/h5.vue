<template>
  <div v-if="isStrip && stripLine" class="flex items-stretch gap-1">
    <button
      v-for="selection in visibleSelections(stripLine)"
      :key="selection.WagerSelectionId"
      type="button"
      class="flex min-h-9 min-w-0 flex-1 items-center justify-between gap-1 rounded-lg px-3"
      :class="
        !isLocked(stripLine, selection) && isSelected(selection)
          ? 'bg-theme-primary text-text-4'
          : 'bg-bg-3 text-text-1'
      "
      :disabled="isLocked(stripLine, selection)"
      @click="onListSelect(stripLine, selection)"
    >
      <img
        v-if="isLocked(stripLine, selection)"
        :src="lockIcon"
        class="mx-auto size-[18px] object-contain"
        alt=""
      />
      <template v-else>
        <span class="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 text-[12px] font-normal">
          <span class="min-w-0 max-w-full truncate" :title="selectionLabel(selection)">{{
            selectionLabel(selection)
          }}</span>
          <span
            v-if="shouldShowHandicap(stripLine, selection)"
            class="max-w-full shrink-0 break-words"
            >{{ formatHandicap(selection.Handicap) }}</span
          >
        </span>
        <span
          class="flex shrink-0 items-center text-[12px] font-bold"
          :class="oddsNumberClass(selection)"
        >
          <component
            v-if="oddsArrow(selection)"
            :is="oddsArrow(selection)"
            class="h-3 w-3 shrink-0"
            aria-hidden="true"
          />
          {{ displayOdds(selection) }}
        </span>
      </template>
    </button>
  </div>

  <div v-else class="flex flex-col gap-3">
    <div class="grid gap-x-1" :class="columnClass">
      <p
        v-for="line in MarketLines"
        :key="`${line.MarketlineId}-title`"
        class="flex min-w-0 flex-col items-center gap-0.5 text-center text-[10px] font-normal leading-[15px] text-text-2"
      >
        <span class="w-full truncate" :title="line.BetTypeName">{{ line.BetTypeName }}</span>
        <span
          v-if="line.PeriodId !== 1 && line.PeriodName"
          class="w-full truncate"
          :title="line.PeriodName"
          >{{ line.PeriodName }}</span
        >
      </p>
    </div>
    <div class="grid items-start gap-x-1" :class="columnClass">
      <div v-for="line in MarketLines" :key="line.MarketlineId" class="flex min-w-0 flex-col gap-1">
        <button
          v-for="(selection, index) in listCells(line)"
          :key="selection?.WagerSelectionId ?? `${line.MarketlineId}-locked-${index}`"
          type="button"
          class="flex w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-[5px]"
          :title="selection ? selectionLabel(selection) : undefined"
          :class="cellClass(line, selection)"
          :disabled="isLocked(line, selection)"
          @click="onListSelect(line, selection)"
        >
          <img
            v-if="isLocked(line, selection)"
            class="h-[18px] w-[18px] shrink-0 object-contain"
            :src="lockIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <template v-else-if="selection">
            <span
              class="flex w-full flex-wrap items-center justify-center gap-x-1 text-[12px] font-normal leading-[14.667px]"
              :class="isSelected(selection) ? 'text-text-4' : 'text-text-2'"
            >
              <span class="min-w-0 max-w-full truncate">{{ selectionLabel(selection) }}</span>
              <!-- 只截断名称；盘口值独立换行，避免长名称遮住让分或大小数值。 -->
              <span
                v-if="shouldShowHandicap(line, selection)"
                class="max-w-full shrink-0 break-words"
                >{{ formatHandicap(selection.Handicap) }}</span
              >
            </span>
            <!-- 赔率与箭头空间不足时换行，数字不参与名称截断。 -->
            <span
              class="flex w-full shrink-0 flex-wrap items-center justify-center text-[12px] font-bold leading-[14.667px]"
              :class="oddsNumberClass(selection)"
            >
              <component
                v-if="oddsArrow(selection)"
                :is="oddsArrow(selection)"
                class="h-3 w-3 shrink-0"
                aria-hidden="true"
              />
              <span class="max-w-full shrink-0 break-words">{{ displayOdds(selection) }}</span>
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
import OddsUpIcon from '@/static/svg/sports/h5-odds-up.svg?component'
import OddsDownIcon from '@/static/svg/sports/h5-odds-down.svg?component'
import lockIcon from '../../event-details/components/sports-score-details/img/bold.svg?url'
import {
  formatHandicap,
  hasDisplayableCardOdds,
  isWagerSelected,
  MAX_CARD_SELECTIONS,
  selectionLetterKey
} from './display'
import { useSportsOdds } from '../../composables/useSportsOdds'
import { formatOdds, resolveSelectionOdds } from '../../shared/odds'
import {
  resolveSelectionName,
  selectionNeedsHandicap as shouldShowHandicap
} from '../../shared/selection-name'
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
const { oddsType } = useSportsOdds()
const nameTeams = computed(() => ({
  HomeTeam: t('sports.oddsHome'),
  AwayTeam: t('sports.oddsAway')
}))
const displayOdds = (selection: SportWagerSelection) =>
  resolveSelectionName(selection, nameTeams.value) === null
    ? ''
    : formatOdds(resolveSelectionOdds(selection, oddsType.value))
const isLocked = (line: SportMarketLine, selection?: SportWagerSelection) =>
  line.IsLocked || line.MarketlineStatusId !== 1 || !selection || displayOdds(selection) === ''

const selectionLabel = (selection: SportWagerSelection) => {
  if (/[{}]/.test(selection.SelectionName)) {
    return resolveSelectionName(selection, nameTeams.value) ?? ''
  }
  const key = selectionLetterKey(selection)
  return key ? t(key) : (resolveSelectionName(selection, nameTeams.value) ?? '')
}

const isStrip = computed(() => props.layout === 'strip')
const stripLine = computed(() => props.MarketLines[0])

const columnClass = computed(() => {
  if (props.MarketLines.length <= 1) return 'grid-cols-1'
  if (props.MarketLines.length === 2) return 'grid-cols-2'
  return 'grid-cols-3'
})

const visibleSelections = (line: SportMarketLine) =>
  (line.WagerSelections ?? []).filter(hasDisplayableCardOdds).slice(0, MAX_CARD_SELECTIONS)

const lockedPlaceholderCount = (line: SportMarketLine) => (line.BetTypeId === 3 ? 3 : 2)

const listCells = (line: SportMarketLine): Array<SportWagerSelection | undefined> => {
  if (!line.IsLocked) return visibleSelections(line)
  const selections = line.WagerSelections ?? []
  if (selections.length) return selections.slice(0, MAX_CARD_SELECTIONS)
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
  return trend === 'up' ? OddsUpIcon : trend === 'down' ? OddsDownIcon : undefined
}

watch(() => props.MarketLines, noteMarketLines, { deep: true, immediate: true })

const onListSelect = (line: SportMarketLine, selection?: SportWagerSelection) => {
  if (!selection || isLocked(line, selection)) return
  emit('select', { market: line, option: selection })
}

const cellClass = (line: SportMarketLine, selection?: SportWagerSelection) => {
  const compact = listCells(line).length >= 3
  const size = compact ? 'min-h-[37px] px-[3px] py-[3px]' : 'min-h-[58px] px-[5px] py-[7px]'
  const tone =
    !isLocked(line, selection) && selection && isSelected(selection)
      ? 'bg-theme-primary'
      : 'bg-bg-3'
  return `${size} ${tone}`
}
</script>
