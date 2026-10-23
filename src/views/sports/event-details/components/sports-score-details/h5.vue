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
        class="scrollbar-none flex min-w-0 flex-1 touch-pan-x items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-3.5"
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

    <ThemedEmptyState
      v-if="showEmpty"
      :dark-image="emptyImage"
      :light-image="emptyImageLight"
      :message="t('sports.eventDetails.noBettingMarkets')"
      container-class="mt-6 min-h-[280px] justify-center pb-8"
      image-class="h-[200px] w-[220px] object-contain"
      text-class="mt-7 text-center text-[12px] font-medium leading-[18px] text-text-1"
      data-testid="sports-score-details-h5-empty"
    />

    <div v-else class="mt-3 flex flex-col gap-2 pr-3.5">
      <article
        v-for="group in visibleMarkets"
        :key="group.id"
        class="overflow-hidden rounded-lg bg-bg-2"
      >
        <header class="flex items-center gap-2 px-2.5 py-3.5 border-b border-b-opacity-6">
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent p-0 text-left"
            :aria-expanded="isSectionOpen(group.id)"
            @click="toggleSection(group.id)"
          >
            <img
              class="h-3 w-3 shrink-0 object-contain"
              :src="isSectionOpen(group.id) ? upIcon : downIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            <h3 class="truncate text-sm font-bold leading-5 text-text-1">{{ group.title }}</h3>
          </button>
          <button
            type="button"
            class="flex h-6 w-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
            :aria-label="isPinned(group.id) ? 'Unpin market' : 'Pin market'"
            :aria-pressed="isPinned(group.id)"
            @click="togglePin(group.id)"
          >
            <img
              class="h-[14px] w-[14px] object-contain"
              :src="pinIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
          </button>
        </header>

        <div v-if="isSectionOpen(group.id)" class="px-2.5 pb-3.5 pt-3.5">
          <div
            v-for="(market, marketIndex) in group.markets"
            :key="market.id"
            :class="marketIndex > 0 ? 'mt-3' : ''"
          >
            <h4
              v-if="marketIndex > 0 && market.title !== group.markets[marketIndex - 1]?.title"
              class="mb-2 text-sm font-bold leading-5 text-text-1"
            >
              {{ market.title }}
            </h4>
            <div
              v-if="group.betTypeId === 1 && marketIndex === 0 && hasTeamNames"
              class="mb-3 grid grid-cols-2 gap-2 text-sm font-bold leading-[18px] text-text-1"
              data-testid="sports-score-details-h5-teams"
            >
              <div class="flex min-w-0 items-center gap-1.5">
                <TeamLogo
                  :sport-id="sportId"
                  class="h-5 w-5 shrink-0 rounded-full object-contain"
                  :src="homeTeamLogo"
                  alt=""
                  draggable="false"
                  aria-hidden="true"
                />
                <span class="line-clamp-2 min-w-0 break-words" :title="homeTeamName">
                  {{ homeTeamName }}
                </span>
              </div>
              <div class="flex min-w-0 items-center justify-end gap-1.5">
                <span class="line-clamp-2 min-w-0 break-words text-right" :title="awayTeamName">
                  {{ awayTeamName }}
                </span>
                <TeamLogo
                  :sport-id="sportId"
                  class="h-5 w-5 shrink-0 rounded-full object-contain"
                  :src="awayTeamLogo"
                  alt=""
                  draggable="false"
                  aria-hidden="true"
                />
              </div>
            </div>

            <template v-if="market.kind === 'dual-column'">
              <div class="flex flex-col gap-2">
                <div
                  v-for="(row, rowIndex) in getDualColumnRows(market)"
                  :key="`${market.id}-row-${rowIndex}`"
                  class="grid grid-cols-2 gap-2"
                >
                  <button
                    type="button"
                    :disabled="isSelectionUnavailable(market.id, row.left.selection)"
                    class="flex min-h-[33px] min-w-0 items-center gap-2 rounded-lg p-2 text-left transition-colors"
                    :class="[
                      oddsButtonClass(row.left.selection, market.id),
                      isSelectionUnavailable(market.id, row.left.selection)
                        ? 'justify-center items-center'
                        : 'justify-between'
                    ]"
                    @click="pickSelection(market.id, row.left.selection)"
                  >
                    <template
                      v-if="
                        isMarketLocked(market.id) ||
                        !row.left.selection ||
                        resolveOddsForFormat(row.left.selection, oddsFormat) === ''
                      "
                    >
                      <img
                        class="h-[18px] w-[18px] shrink-0 object-contain"
                        :src="lockIcon"
                        alt=""
                        draggable="false"
                        aria-hidden="true"
                      />
                    </template>
                    <template v-else-if="isMarketClosed(market.id)">
                      <span class="text-sm font-bold tabular-nums">--</span>
                    </template>
                    <template v-else>
                      <span
                        class="min-w-0 flex-1 whitespace-normal break-words text-sm font-normal [overflow-wrap:anywhere]"
                        >{{ formatCellLine(market.leftHeader, row.left.line) }}</span
                      >
                      <span class="shrink-0 text-sm font-bold tabular-nums">{{
                        row.left.odds
                      }}</span>
                    </template>
                  </button>
                  <button
                    v-if="row.right.selection"
                    type="button"
                    :disabled="isSelectionUnavailable(market.id, row.right.selection)"
                    class="flex min-h-[33px] min-w-0 items-center gap-2 rounded-lg p-2 text-left transition-colors"
                    :class="[
                      oddsButtonClass(row.right.selection, market.id),
                      isSelectionUnavailable(market.id, row.right.selection)
                        ? 'justify-center items-center'
                        : 'justify-between'
                    ]"
                    @click="pickSelection(market.id, row.right.selection)"
                  >
                    <template
                      v-if="
                        isMarketLocked(market.id) ||
                        !row.right.selection ||
                        resolveOddsForFormat(row.right.selection, oddsFormat) === ''
                      "
                    >
                      <img
                        class="h-[18px] w-[18px] shrink-0 object-contain"
                        :src="lockIcon"
                        alt=""
                        draggable="false"
                        aria-hidden="true"
                      />
                    </template>
                    <template v-else-if="isMarketClosed(market.id)">
                      <span class="text-sm font-bold tabular-nums">--</span>
                    </template>
                    <template v-else>
                      <span
                        class="min-w-0 flex-1 whitespace-normal break-words text-sm font-normal [overflow-wrap:anywhere]"
                        >{{ formatCellLine(market.rightHeader, row.right.line) }}</span
                      >
                      <span class="shrink-0 text-sm font-bold tabular-nums">{{
                        row.right.odds
                      }}</span>
                    </template>
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
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="option in market.options"
                  :key="option.selection?.WagerSelectionId ?? option.label"
                  type="button"
                  :disabled="isSelectionUnavailable(market.id, option.selection)"
                  class="flex min-h-[33px] min-w-0 items-center gap-2 rounded-lg p-2 text-left transition-colors"
                  :class="[
                    oddsButtonClass(option.selection, market.id),
                    isSelectionUnavailable(market.id, option.selection)
                      ? 'justify-center items-center'
                      : 'justify-between'
                  ]"
                  @click="pickSelection(market.id, option.selection)"
                >
                  <template
                    v-if="
                      isMarketLocked(market.id) ||
                      !option.selection ||
                      resolveOddsForFormat(option.selection, oddsFormat) === ''
                    "
                  >
                    <img
                      class="h-[18px] w-[18px] shrink-0 object-contain"
                      :src="lockIcon"
                      alt=""
                      draggable="false"
                      aria-hidden="true"
                    />
                  </template>
                  <template v-else-if="isMarketClosed(market.id)">
                    <span class="text-sm font-bold tabular-nums">--</span>
                  </template>
                  <template v-else>
                    <span
                      class="min-w-0 flex-1 whitespace-normal break-words text-sm font-normal [overflow-wrap:anywhere]"
                      >{{ formatLabel(option.label) }}</span
                    >
                    <span class="shrink-0 text-sm font-bold tabular-nums">{{ option.odds }}</span>
                  </template>
                </button>
              </div>
            </template>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SportMarketLine, SportWagerSelection } from '@/api/interface/sport'
import type { OddsSelectPayload } from '@/views/sports/components/match-odds/types'
import { isWagerSelected } from '@/views/sports/components/match-odds/display'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import emptyImage from '@/static/img/explore/default.png'
import TeamLogo from '@/views/sports/components/team-logo/index.vue'
import emptyImageLight from '@/static/img/explore/default_white.png'
import { resolveOddsForFormat as readOddsForFormat } from './map-market-lines'
import { resolveSelectionName } from '../../../shared/selection-name'
import lockIcon from './img/bold.svg?url'
import doubleIcon from './img/double.svg?url'
import downIcon from './img/down.svg?url'
import pinIcon from './img/top.svg?url'
import upIcon from './img/up.svg?url'
import {
  buildScoreDetailsFilterTabs,
  mapMarketLinesToGroups,
  type EventDetailsOddsFormat
} from './map-market-lines'
import type { DualColumnMarketCard, ScoreDetailsFilterKey, ScoreDetailsMarketCard } from './types'

const { t } = useI18n()
const formatLabel = (value: string) => value.trim()

const formatCellLine = (header: string, line: string) => {
  const text = header.trim()
  if (!text) {
    return line
  }
  if (text === line.trim()) {
    return formatLabel(line)
  }
  const label = formatLabel(text)
  return line ? `${label} ${line}` : label
}

const props = withDefaults(
  defineProps<{
    sportId?: number
    marketLines?: SportMarketLine[]
    oddsFormat?: EventDetailsOddsFormat
    selectedWagerSelectionId?: number
    showEmpty?: boolean
    homeTeamName?: string
    awayTeamName?: string
    homeTeamLogo?: string
    awayTeamLogo?: string
  }>(),
  {
    oddsFormat: 3,
    showEmpty: false
  }
)

const emit = defineEmits<{ pick: [payload: OddsSelectPayload] }>()

const COLLAPSED_ROW_LIMIT = 3

const activeFilter = ref<ScoreDetailsFilterKey>('all')
/** 置顶顺序：数组靠前 = 列表越靠前 */
const pinnedMarketOrder = ref<string[]>([])
const openSectionIds = ref<Set<string>>(new Set())
const expandedMarketIds = ref<Set<string>>(new Set())

const hasTeamNames = computed(() => Boolean(props.homeTeamName || props.awayTeamName))

const teams = computed(() => ({ HomeTeam: props.homeTeamName, AwayTeam: props.awayTeamName }))
const resolveOddsForFormat = (selection: SportWagerSelection, format: EventDetailsOddsFormat) =>
  resolveSelectionName(selection, teams.value) === null ? '' : readOddsForFormat(selection, format)
const allMarkets = computed(() =>
  mapMarketLinesToGroups(props.marketLines ?? [], props.oddsFormat, teams.value)
)

const filterTabs = computed(() =>
  buildScoreDetailsFilterTabs(
    props.marketLines ?? [],
    t('sports.eventDetails.filterAll'),
    props.oddsFormat,
    teams.value
  )
)

const visibleMarkets = computed(() => {
  const list =
    activeFilter.value === 'all'
      ? allMarkets.value
      : allMarkets.value.filter(group => String(group.betTypeId) === activeFilter.value)
  const pinIndex = new Map(pinnedMarketOrder.value.map((id, index) => [id, index]))
  return [...list].sort((a, b) => {
    const aPin = pinIndex.get(a.id)
    const bPin = pinIndex.get(b.id)
    const aRank = aPin === undefined ? Number.POSITIVE_INFINITY : aPin
    const bRank = bPin === undefined ? Number.POSITIVE_INFINITY : bPin
    return aRank - bRank
  })
})

watch(
  () => props.marketLines,
  () => {
    activeFilter.value = 'all'
    expandedMarketIds.value = new Set()
    const validIds = new Set(allMarkets.value.map(market => market.id))
    openSectionIds.value = new Set(validIds)
    pinnedMarketOrder.value = pinnedMarketOrder.value.filter(id => validIds.has(id))
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
  const next = new Set(openSectionIds.value)
  const collapse = allSectionsExpanded.value
  for (const market of visibleMarkets.value) {
    if (collapse) next.delete(market.id)
    else next.add(market.id)
  }
  openSectionIds.value = next
}

const isPinned = (marketId: string) => pinnedMarketOrder.value.includes(marketId)

const togglePin = (marketId: string) => {
  const without = pinnedMarketOrder.value.filter(id => id !== marketId)
  if (without.length === pinnedMarketOrder.value.length) {
    pinnedMarketOrder.value = [marketId, ...without]
    return
  }
  pinnedMarketOrder.value = without
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

const findMarketLine = (marketLineId: string) =>
  props.marketLines?.find(item => String(item.MarketlineId) === marketLineId)

/** isl：true 封盘，展示锁图标（优先于关盘 --） */
const isMarketLocked = (marketLineId: string) => findMarketLine(marketLineId)?.IsLocked === true

/** mlsid：1 开盘正常展示，2 关盘时赔率格统一显示 -- */
const isMarketClosed = (marketLineId: string) =>
  findMarketLine(marketLineId)?.MarketlineStatusId === 2

const isOddsButtonUnavailable = (marketLineId: string) =>
  isMarketLocked(marketLineId) || isMarketClosed(marketLineId)

const isSelectionUnavailable = (marketLineId: string, selection?: SportWagerSelection) =>
  isOddsButtonUnavailable(marketLineId) ||
  !selection ||
  resolveOddsForFormat(selection, props.oddsFormat) === ''

const pickSelection = (marketLineId: string, selection?: SportWagerSelection) => {
  if (!selection || isSelectionUnavailable(marketLineId, selection)) {
    return
  }
  const line = findMarketLine(marketLineId)
  if (!line) {
    return
  }
  emit('pick', { market: line, option: selection })
}

const oddsButtonClass = (selection?: SportWagerSelection, marketLineId?: string) => {
  if (marketLineId && isSelectionUnavailable(marketLineId, selection)) {
    return 'bg-bg-3 text-text-1'
  }
  return selection && isWagerSelected(selection, props.selectedWagerSelectionId)
    ? 'bg-theme-primary text-text-4'
    : 'bg-bg-3 text-text-1 [&_span:first-child]:text-text-2'
}
</script>
