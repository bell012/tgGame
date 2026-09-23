<template>
  <section class="w-full min-w-0 font-inter text-text-1" data-testid="sports-score-details-h5">
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-2"
        :aria-label="allSectionsExpanded ? 'Collapse all markets' : 'Expand all markets'"
        @click="toggleAllSections"
      >
        <img
          class="h-[13px] w-[13px] object-contain"
          :src="doubleIcon"
          alt=""
          draggable="false"
          aria-hidden="true"
        />
      </button>

      <div
        class="scrollbar-none flex min-w-0 flex-1 touch-pan-x items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Market categories"
      >
        <button
          v-for="tab in h5FilterTabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="activeFilter === tab.key"
          class="inline-flex h-[33px] shrink-0 items-center rounded-lg border-0 py-2.5 px-5 text-[13px] transition-colors"
          :class="
            activeFilter === tab.key
              ? 'bg-theme-primary text-text-4 font-bold'
              : 'bg-bg-2 text-text-2 font-normal'
          "
          @click="activeFilter = tab.key"
        >
          {{ h5TabLabel(tab.key, tab.label) }}
        </button>
      </div>
    </div>

    <div class="mt-3 flex flex-col gap-2 pr-3.5">
      <article
        v-for="market in visibleMarkets"
        :key="market.id"
        class="overflow-hidden rounded-lg bg-bg-2"
      >
        <header class="flex items-center gap-2 px-3 py-3">
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent p-0 text-left"
            :aria-expanded="isSectionOpen(market.id)"
            @click="toggleSection(market.id)"
          >
            <img
              class="h-3 w-3 shrink-0 object-contain"
              :src="isSectionOpen(market.id) ? upIcon : downIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            <h3 class="truncate text-sm font-bold leading-5 text-text-1">{{ market.title }}</h3>
          </button>
          <button
            type="button"
            class="flex h-6 w-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
            :aria-label="isPinned(market.id) ? 'Unpin market' : 'Pin market'"
            :aria-pressed="isPinned(market.id)"
            @click="togglePin(market.id)"
          >
            <img
              class="h-[18px] w-[18px] object-contain"
              :src="pinIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
          </button>
        </header>

        <div v-if="isSectionOpen(market.id)" class="px-3 pb-3">
          <template v-if="market.kind === 'dual-column'">
            <div
              v-if="market.id === 'handicap'"
              class="mb-3 grid grid-cols-2 gap-2 border-b border-bg-3 pb-3"
            >
              <div class="flex min-w-0 items-center gap-1.5">
                <img
                  class="h-5 w-5 shrink-0 rounded-full object-cover"
                  :src="handicapTeams.home.logo"
                  alt=""
                  draggable="false"
                  aria-hidden="true"
                />
                <span class="truncate text-xs font-normal text-text-2">{{
                  handicapTeams.home.name
                }}</span>
              </div>
              <div class="flex min-w-0 items-center justify-end gap-1.5">
                <span class="truncate text-xs font-normal text-text-2">{{
                  handicapTeams.away.name
                }}</span>
                <img
                  class="h-5 w-5 shrink-0 rounded-full object-cover"
                  :src="handicapTeams.away.logo"
                  alt=""
                  draggable="false"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div
                v-for="(row, rowIndex) in getDualColumnRows(market)"
                :key="`${market.id}-row-${rowIndex}`"
                class="grid grid-cols-2 gap-2"
              >
                <button
                  type="button"
                  class="flex h-[33px] min-w-0 items-center justify-between rounded-lg p-2 text-left transition-colors"
                  :class="oddsButtonClass(selectionKey(market.id, rowIndex, 'left'))"
                  @click="selectOdds(selectionKey(market.id, rowIndex, 'left'))"
                >
                  <span class="truncate text-sm font-normal">{{ row.left.line }}</span>
                  <span class="shrink-0 text-sm font-bold tabular-nums">{{ row.left.odds }}</span>
                </button>
                <button
                  type="button"
                  class="flex h-[33px] min-w-0 items-center justify-between rounded-lg p-2 text-left transition-colors"
                  :class="oddsButtonClass(selectionKey(market.id, rowIndex, 'right'))"
                  @click="selectOdds(selectionKey(market.id, rowIndex, 'right'))"
                >
                  <span class="truncate text-sm font-normal">{{ row.right.line }}</span>
                  <span class="shrink-0 text-sm font-bold tabular-nums">{{ row.right.odds }}</span>
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="market.kind === '1x2'">
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="option in h5OneXTwoOptions(market.options)"
                :key="option.key"
                type="button"
                class="flex h-[33px] min-w-0 flex-col items-center justify-center rounded-lg p-2 transition-colors"
                :class="oddsButtonClass(selectionKey(market.id, 0, option.key))"
                @click="selectOdds(selectionKey(market.id, 0, option.key))"
              >
                <span class="text-xs font-normal leading-none">{{ option.shortLabel }}</span>
                <span class="mt-0.5 text-sm font-bold tabular-nums leading-none">{{
                  option.odds
                }}</span>
              </button>
            </div>
          </template>

          <template v-else-if="market.kind === 'score-picker'">
            <div class="flex flex-col gap-3">
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
                <div class="inline-flex h-8 shrink-0 items-center rounded-lg bg-bg-2 p-0.5">
                  <button
                    type="button"
                    class="flex h-7 w-7 items-center justify-center rounded-md text-text-2"
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
                    class="flex h-7 w-7 items-center justify-center rounded-md text-text-2"
                    @click="adjustScore(market.id, team.teamId, 1)"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                type="button"
                class="flex h-[33px] w-full items-center justify-between rounded-lg p-2 text-left transition-colors"
                :class="oddsButtonClass(`${market.id}-line`)"
                @click="selectOdds(`${market.id}-line`)"
              >
                <span class="truncate text-sm font-normal">{{ market.line }}</span>
                <span class="shrink-0 text-sm font-bold tabular-nums">{{ market.odds }}</span>
              </button>
            </div>
          </template>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import doubleIcon from './img/double.svg?url'
import downIcon from './img/down.svg?url'
import pinIcon from './img/top.svg?url'
import upIcon from './img/up.svg?url'
import {
  SCORE_DETAILS_FILTER_TABS,
  SCORE_DETAILS_HANDICAP_TEAMS,
  SCORE_DETAILS_MARKETS
} from './mock-data'
import type { DualColumnMarketCard, OneXTwoOption, ScoreDetailsFilterKey } from './types'

const DEFAULT_COLLAPSED_SECTIONS = new Set(['odd-even', 'correct-score'])

const h5FilterTabKeys: ScoreDetailsFilterKey[] = ['all', 'popular', 'handicap-totals', 'corners']

const h5FilterTabs = SCORE_DETAILS_FILTER_TABS.filter(tab => h5FilterTabKeys.includes(tab.key))

const handicapTeams = SCORE_DETAILS_HANDICAP_TEAMS

const activeFilter = ref<ScoreDetailsFilterKey>('all')
const selectedOddsKey = ref('handicap-0-left')
const pinnedMarketIds = ref<Set<string>>(new Set())
const openSectionIds = ref<Set<string>>(
  new Set(
    SCORE_DETAILS_MARKETS.map(market => market.id).filter(id => !DEFAULT_COLLAPSED_SECTIONS.has(id))
  )
)
type TeamSide = 'home' | 'away'

const scoreByMarket = ref<Record<string, Record<TeamSide, number>>>({})

const visibleMarkets = computed(() => {
  const list =
    activeFilter.value === 'all'
      ? SCORE_DETAILS_MARKETS
      : SCORE_DETAILS_MARKETS.filter(market => market.filters.includes(activeFilter.value))
  return [...list].sort((a, b) => {
    const aPinned = pinnedMarketIds.value.has(a.id) ? 0 : 1
    const bPinned = pinnedMarketIds.value.has(b.id) ? 0 : 1
    return aPinned - bPinned
  })
})

const allSectionsExpanded = computed(() =>
  visibleMarkets.value.every(market => openSectionIds.value.has(market.id))
)

const h5TabLabel = (key: ScoreDetailsFilterKey, label: string) => {
  if (key === 'handicap-totals') return 'Spread & Totals'
  return label
}

const isSectionOpen = (marketId: string) => openSectionIds.value.has(marketId)

const toggleSection = (marketId: string) => {
  const next = new Set(openSectionIds.value)
  if (next.has(marketId)) {
    next.delete(marketId)
  } else {
    next.add(marketId)
  }
  openSectionIds.value = next
}

const toggleAllSections = () => {
  if (allSectionsExpanded.value) {
    openSectionIds.value = new Set()
    return
  }
  openSectionIds.value = new Set(visibleMarkets.value.map(market => market.id))
}

const isPinned = (marketId: string) => pinnedMarketIds.value.has(marketId)

const togglePin = (marketId: string) => {
  const next = new Set(pinnedMarketIds.value)
  if (next.has(marketId)) {
    next.delete(marketId)
  } else {
    next.add(marketId)
  }
  pinnedMarketIds.value = next
}

const selectionKey = (marketId: string, rowIndex: number, side: string) =>
  `${marketId}-${rowIndex}-${side}`

const selectOdds = (key: string) => {
  selectedOddsKey.value = key
}

const oddsButtonClass = (key: string) =>
  selectedOddsKey.value === key
    ? 'bg-theme-primary text-text-4'
    : 'bg-bg-3 text-text-1 [&_span:first-child]:text-text-2'

const getDualColumnRows = (market: DualColumnMarketCard) => market.rows

const h5OneXTwoOptions = (options: OneXTwoOption[]) => {
  const order = ['Home', 'Away', 'Draw'] as const
  const shortByLabel: Record<string, string> = {
    Home: 'H',
    Away: 'A',
    Draw: 'D'
  }
  return order
    .map(label => options.find(option => option.label === label))
    .filter((option): option is OneXTwoOption => Boolean(option))
    .map(option => ({
      key: shortByLabel[option.label] ?? option.label,
      shortLabel: shortByLabel[option.label] ?? option.label,
      odds: option.odds
    }))
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
