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
          v-for="tab in filterTabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="activeFilter === tab.key"
          class="inline-flex h-[33px] shrink-0 items-center gap-1.5 rounded-lg border-0 py-2.5 pl-5 pr-3 text-[13px] transition-colors"
          :class="
            activeFilter === tab.key
              ? 'bg-theme-primary text-text-4 font-bold'
              : 'bg-bg-2 text-text-2 font-normal'
          "
          @click="activeFilter = tab.key"
        >
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.count > 0"
            class="inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] leading-4 tabular-nums"
            :class="activeFilter === tab.key ? 'bg-bg-3/30 text-text-4' : 'bg-bg-3 text-text-2'"
          >
            {{ tab.count }}
          </span>
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
              v-if="market.leftHeader || market.rightHeader"
              class="mb-3 grid grid-cols-2 gap-2 text-center text-xs leading-4 text-text-2"
            >
              <span class="truncate">{{ market.leftHeader }}</span>
              <span class="truncate">{{ market.rightHeader }}</span>
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

            <button
              v-if="shouldShowExpand(market)"
              type="button"
              class="mt-2 inline-flex w-full items-center justify-center gap-1 border-0 bg-transparent py-1 text-xs font-normal text-text-2"
              :aria-expanded="isMarketExpanded(market.id)"
              @click="toggleMarketExpanded(market.id)"
            >
              {{ isMarketExpanded(market.id) ? 'Show Less' : 'Show All' }}
              <img
                class="h-3 w-3 object-contain transition-transform"
                :class="isMarketExpanded(market.id) ? '' : 'rotate-180'"
                :src="upIcon"
                alt=""
                draggable="false"
                aria-hidden="true"
              />
            </button>
          </template>

          <template v-else-if="market.kind === '1x2'">
            <div class="flex flex-col gap-2">
              <button
                v-for="option in market.options"
                :key="option.label"
                type="button"
                class="flex h-[33px] min-w-0 items-center justify-between rounded-lg p-2 text-left transition-colors"
                :class="oddsButtonClass(selectionKey(market.id, 0, option.label))"
                @click="selectOdds(selectionKey(market.id, 0, option.label))"
              >
                <span class="truncate text-sm font-normal">{{ option.label }}</span>
                <span class="shrink-0 text-sm font-bold tabular-nums">{{ option.odds }}</span>
              </button>
            </div>
          </template>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SportMarketLine } from '@/api/interface/sport'
import { computed, ref, watch } from 'vue'
import doubleIcon from './img/double.svg?url'
import downIcon from './img/down.svg?url'
import pinIcon from './img/top.svg?url'
import upIcon from './img/up.svg?url'
import { buildScoreDetailsFilterTabs, mapMarketLinesToCards } from './map-market-lines'
import type { DualColumnMarketCard, ScoreDetailsFilterKey, ScoreDetailsMarketCard } from './types'

const props = defineProps<{
  marketLines?: SportMarketLine[]
}>()

const COLLAPSED_ROW_LIMIT = 3

const activeFilter = ref<ScoreDetailsFilterKey>('all')
const selectedOddsKey = ref('')
const pinnedMarketIds = ref<Set<string>>(new Set())
const openSectionIds = ref<Set<string>>(new Set())
const expandedMarketIds = ref<Set<string>>(new Set())

const allMarkets = computed(() => mapMarketLinesToCards(props.marketLines ?? []))

const filterTabs = computed(() => buildScoreDetailsFilterTabs(props.marketLines ?? []))

const visibleMarkets = computed(() => {
  const list =
    activeFilter.value === 'all'
      ? allMarkets.value
      : allMarkets.value.filter(market => market.betTypeName === activeFilter.value)
  return [...list].sort((a, b) => {
    const aPinned = pinnedMarketIds.value.has(a.id) ? 0 : 1
    const bPinned = pinnedMarketIds.value.has(b.id) ? 0 : 1
    return aPinned - bPinned
  })
})

watch(
  () => props.marketLines,
  () => {
    activeFilter.value = 'all'
    expandedMarketIds.value = new Set()
    openSectionIds.value = new Set(allMarkets.value.map(market => market.id))
    selectedOddsKey.value = ''
  },
  { immediate: true }
)

const allSectionsExpanded = computed(() =>
  visibleMarkets.value.every(market => openSectionIds.value.has(market.id))
)

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

const selectionKey = (marketId: string, rowIndex: number, side: string) =>
  `${marketId}-${rowIndex}-${side}`

const selectOdds = (key: string) => {
  selectedOddsKey.value = key
}

const oddsButtonClass = (key: string) =>
  selectedOddsKey.value === key
    ? 'bg-theme-primary text-text-4'
    : 'bg-bg-3 text-text-1 [&_span:first-child]:text-text-2'
</script>
