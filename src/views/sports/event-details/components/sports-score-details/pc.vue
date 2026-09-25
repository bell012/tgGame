<template>
  <section class="w-full min-w-0 font-inter text-text-1" data-testid="sports-score-details">
    <div
      class="scrollbar-none flex touch-pan-x items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Market categories"
    >
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="activeFilter === tab.key"
        class="inline-flex h-[33px] shrink-0 items-center gap-1.5 rounded-[32px] border-0 p-2 text-sm font-normal transition-colors"
        :class="
          activeFilter === tab.key
            ? 'bg-bg-2 text-text-1'
            : 'bg-transparent text-text-2 lg:hover:text-text-1'
        "
        @click="activeFilter = tab.key"
      >
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count > 0"
          class="inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] leading-4 tabular-nums"
          :class="activeFilter === tab.key ? 'bg-bg-3 text-text-1' : 'bg-bg-2 text-text-2'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      <article
        v-for="market in visibleMarkets"
        :key="market.id"
        class="flex min-w-0 flex-col rounded-xl bg-bg-5 px-2 py-4"
      >
        <h3 class="text-sm font-bold leading-5 text-text-1">{{ market.title }}</h3>

        <template v-if="market.kind === 'dual-column'">
          <div class="mt-3 grid grid-cols-2 gap-2 text-center text-xs leading-4 text-text-2">
            <span class="truncate">{{ market.leftHeader }}</span>
            <span class="truncate">{{ market.rightHeader }}</span>
          </div>
          <div class="mt-2 flex flex-col gap-2">
            <div
              v-for="(row, rowIndex) in getDualColumnRows(market)"
              :key="`${market.id}-row-${rowIndex}`"
              class="grid grid-cols-2 gap-2"
            >
              <button
                type="button"
                class="flex h-11 min-w-0 items-center justify-between rounded-lg bg-bg-3 px-3 py-2 text-left transition-colors lg:hover:bg-bg-2"
              >
                <span class="truncate text-sm font-normal text-text-2">{{ row.left.line }}</span>
                <span class="shrink-0 text-sm font-bold tabular-nums text-text-1">{{
                  displayOdds(row.left.selection)
                }}</span>
              </button>
              <button
                type="button"
                class="flex h-11 min-w-0 items-center justify-between rounded-lg bg-bg-3 px-3 py-2 text-left transition-colors lg:hover:bg-bg-2"
              >
                <span class="truncate text-sm font-normal text-text-2">{{ row.right.line }}</span>
                <span class="shrink-0 text-sm font-bold tabular-nums text-text-1">{{
                  displayOdds(row.right.selection)
                }}</span>
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="market.kind === '1x2'">
          <div class="mt-3 flex gap-2">
            <button
              v-for="option in market.options"
              :key="option.label"
              type="button"
              class="flex h-11 min-w-0 flex-1 items-center justify-between rounded-lg bg-bg-3 px-3 py-2 text-left transition-colors lg:hover:bg-bg-2"
            >
              <span class="truncate text-sm font-normal text-text-2">{{ option.label }}</span>
              <span class="shrink-0 text-sm font-bold tabular-nums text-text-1">{{
                displayOdds(option.selection)
              }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="market.kind === 'score-picker'">
          <div class="mt-3 flex flex-col gap-3">
            <div
              v-for="team in market.teams"
              :key="team.teamId"
              class="flex min-w-0 items-center gap-2"
            >
              <img
                class="h-6 w-6 shrink-0 object-contain"
                :src="team.logo"
                :alt="team.name"
                draggable="false"
              />
              <span class="min-w-0 flex-1 truncate text-sm font-normal text-text-1">
                {{ team.name }}
              </span>
              <div class="inline-flex h-8 shrink-0 items-center rounded-lg bg-bg-3 p-0.5">
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-md text-text-2 transition-colors lg:hover:bg-bg-2 lg:hover:text-text-1"
                  @click="adjustScore(market.id, team.teamId, -1)"
                >
                  −
                </button>
                <span
                  class="flex h-7 min-w-[28px] items-center justify-center text-sm font-bold tabular-nums text-text-1"
                >
                  {{ getScore(market.id, team.teamId) }}
                </span>
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-md text-text-2 transition-colors lg:hover:bg-bg-2 lg:hover:text-text-1"
                  @click="adjustScore(market.id, team.teamId, 1)"
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-full items-center justify-between rounded-lg bg-bg-3 px-3 py-2 text-left transition-colors lg:hover:bg-bg-2"
            >
              <span class="truncate text-sm font-normal text-text-2">{{ market.line }}</span>
              <span class="shrink-0 text-sm font-bold tabular-nums text-text-1">{{
                market.odds
              }}</span>
            </button>
          </div>
        </template>

        <button
          v-if="shouldShowExpand(market)"
          type="button"
          class="mt-3 inline-flex w-full items-center justify-center gap-1 border-0 bg-transparent py-1 text-xs font-normal text-text-2 transition-colors lg:hover:text-text-1"
          :aria-expanded="isMarketExpanded(market.id)"
          @click="toggleMarketExpanded(market.id)"
        >
          {{ isMarketExpanded(market.id) ? 'Show Less' : 'Show All' }}
          <CaretUp
            class="h-3 w-3 transition-transform"
            :class="isMarketExpanded(market.id) ? '' : 'rotate-180'"
            aria-hidden="true"
          />
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import CaretUp from '@/static/svg/sports/caret-up.svg?component'
import type { SportMarketLine, SportWagerSelection } from '@/api/interface/sport'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  buildScoreDetailsFilterTabs,
  mapMarketLinesToCards,
  resolveOddsForFormat,
  type EventDetailsOddsFormat
} from './map-market-lines'
import type { DualColumnMarketCard, ScoreDetailsFilterKey, ScoreDetailsMarketCard } from './types'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    marketLines?: SportMarketLine[]
    oddsFormat?: EventDetailsOddsFormat
  }>(),
  {
    oddsFormat: 1
  }
)

const COLLAPSED_ROW_LIMIT = 3

const activeFilter = ref<ScoreDetailsFilterKey>('all')

const allMarkets = computed(() => mapMarketLinesToCards(props.marketLines ?? [], props.oddsFormat))

const displayOdds = (selection?: SportWagerSelection) =>
  selection ? resolveOddsForFormat(selection, props.oddsFormat) : ''

const filterTabs = computed(() =>
  buildScoreDetailsFilterTabs(props.marketLines ?? [], t('sports.eventDetails.filterAll'))
)

const visibleMarkets = computed(() => {
  if (activeFilter.value === 'all') {
    return allMarkets.value
  }
  return allMarkets.value.filter(market => market.betTypeName === activeFilter.value)
})

watch(
  () => props.marketLines,
  () => {
    activeFilter.value = 'all'
    expandedMarketIds.value = new Set()
  }
)

type TeamSide = 'home' | 'away'

const scoreByMarket = ref<Record<string, Record<TeamSide, number>>>({})
const expandedMarketIds = ref<Set<string>>(new Set())

const isMarketExpanded = (marketId: string) => expandedMarketIds.value.has(marketId)

const toggleMarketExpanded = (marketId: string) => {
  const next = new Set(expandedMarketIds.value)
  if (next.has(marketId)) {
    next.delete(marketId)
  } else {
    next.add(marketId)
  }
  expandedMarketIds.value = next
}

const shouldShowExpand = (market: ScoreDetailsMarketCard) =>
  market.kind === 'dual-column' && market.rows.length > COLLAPSED_ROW_LIMIT

const getDualColumnRows = (market: DualColumnMarketCard) => {
  if (!shouldShowExpand(market) || isMarketExpanded(market.id)) {
    return market.rows
  }
  return market.rows.slice(0, COLLAPSED_ROW_LIMIT)
}

const getScore = (marketId: string, teamId: TeamSide) =>
  scoreByMarket.value[marketId]?.[teamId] ?? 0

const adjustScore = (marketId: string, teamId: TeamSide, delta: number) => {
  const current = scoreByMarket.value[marketId] ?? { home: 0, away: 0 }
  scoreByMarket.value = {
    ...scoreByMarket.value,
    [marketId]: {
      ...current,
      [teamId]: Math.max(0, current[teamId] + delta)
    }
  }
}
</script>
