<template>
  <div
    class="min-h-dvh w-full min-w-0 max-w-full bg-bg-1 pb-[calc(88px+env(safe-area-inset-bottom))] font-inter text-text-1"
    :data-sport="activeSport"
    data-testid="sports-h5-page"
  >
    <!-- 导航组件已包含顶部避让；日期分类在其底部留位，避免重复叠加页面间距。 -->
    <header
      ref="navigationHeader"
      class="fixed inset-x-0 top-0 z-40 bg-bg-1"
      data-testid="sports-h5-sticky-navigation"
    >
      <SportsNavigation @change="page.handleSportChange" />
      <FilterSearch_H5
        class="mb-[12px] h-[38px] px-[14px]"
        @filter-change="page.handleMatchFilterChange"
      />
    </header>
    <div :style="{ height: `${navigationHeight}px` }" aria-hidden="true"></div>

    <div
      v-if="page.homepageError.value"
      class="mx-[14px] mb-3 flex items-center gap-3 text-xs text-text-2"
      role="status"
    >
      <span>{{ page.sportsLoadFailedText.value }}</span>
      <button
        type="button"
        class="shrink-0 text-theme-primary disabled:opacity-50"
        :disabled="page.homepageLoading.value"
        @click="page.retrySports"
      >
        {{ page.sportsRetryText.value }}
      </button>
    </div>

    <section
      v-if="liveMatches.length"
      aria-label="Live matches"
      class="min-w-0"
      data-testid="sports-h5-live-section"
    >
      <div
        ref="liveStrip"
        class="flex min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto px-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabindex="0"
        aria-label="Live matches"
        data-testid="sports-h5-live-strip"
      >
        <article
          v-for="match in liveMatches"
          :key="match.id"
          class="w-full min-w-0 shrink-0 snap-center rounded-lg bg-bg-2 p-2.5"
          :data-sports-live-match="match.id"
        >
          <div class="flex h-4 min-w-0 items-center gap-3 text-[10px] leading-4">
            <span class="shrink-0 text-text-2">{{ match.phase }}</span>
            <span class="min-w-0 flex-1 truncate" :title="match.league">{{ match.league }}</span>
            <span
              v-if="match.totalMarkets !== undefined"
              class="shrink-0 rounded bg-theme-primary px-1 text-text-4"
              :aria-label="`${match.totalMarkets} markets`"
            >
              {{ match.totalMarkets }}
            </span>
          </div>

          <MatchVersus
            class="mt-3"
            :home-src="match.home.badge"
            :away-src="match.away.badge"
            :HomeTeam="match.HomeTeam"
            :AwayTeam="match.AwayTeam"
            :HomeScore="match.HomeScore"
            :AwayScore="match.AwayScore"
            :HomeTeamId="match.HomeTeamId"
            :AwayTeamId="match.AwayTeamId"
          />

          <MatchOdds
            v-if="match.MarketLines.length"
            class="mt-3"
            :MarketLines="match.MarketLines"
            :selected-wager-selection-id="page.getSelectedWagerSelectionId(match.id)"
            @select="selectOdds(match.id, $event)"
          />
          <div
            v-else
            class="mt-3 h-9"
            aria-hidden="true"
            data-testid="sports-h5-live-odds-slot"
          ></div>
        </article>
      </div>
    </section>

    <section class="mx-[14px] mt-3" :aria-label="`${activeSportLabel} matches by league`">
      <div class="mb-3 flex h-[30px] items-center gap-[7px]">
        <!-- 搜索、收藏筛选及排序区域 -->
        <LeagueTabs_H5
          :collect-only="page.collectOnly.value"
          @filter-change="page.handleLeagueSortChange"
          @league-filter="page.handleLeagueFilter"
          @collect-change="page.handleCollectChange"
        />
        <button
          v-if="groups.length"
          type="button"
          class="flex h-[30px] w-[30px] shrink-0 flex-col items-center justify-center rounded-lg bg-bg-2 text-text-2 focus-visible:outline focus-visible:outline-theme-primary"
          :aria-label="allGroupsCollapsed ? 'Expand all leagues' : 'Collapse all leagues'"
          :aria-expanded="!allGroupsCollapsed"
          data-testid="sports-h5-toggle-all-leagues"
          @click="toggleAllGroups"
        >
          <ChevronIcon
            class="h-2.5 w-2.5"
            :class="allGroupsCollapsed ? '' : 'rotate-180'"
            aria-hidden="true"
          />
          <ChevronIcon
            class="-mt-1 h-2.5 w-2.5"
            :class="allGroupsCollapsed ? '' : 'rotate-180'"
            aria-hidden="true"
          />
        </button>
      </div>

      <div v-if="groups.length" class="space-y-1.5" data-testid="sports-h5-league-list">
        <section v-for="group in groups" :key="group.id" :data-league-id="group.id">
          <h2>
            <button
              :id="`${idPrefix}-${group.id}-heading`"
              type="button"
              class="flex min-h-[34px] w-full items-center gap-2 rounded-lg bg-bg-2 px-2.5 py-1.5 text-left text-xs text-text-2 focus-visible:outline focus-visible:outline-theme-primary"
              :aria-expanded="isGroupExpanded(group.id)"
              :aria-controls="`${idPrefix}-${group.id}-matches`"
              data-testid="sports-h5-league-toggle"
              @click="toggleGroup(group.id)"
            >
              <img :src="leagueIcon" alt="" class="h-5 w-5 shrink-0 object-contain" />
              <span class="min-w-0 flex-1 break-words">{{ group.name }}</span>
              <span
                class="min-w-4 shrink-0 rounded bg-theme-primary px-1 text-center text-[10px] font-bold leading-[14px] text-text-4"
                :aria-label="`${group.matches.length} matches`"
              >
                {{ group.matches.length }}
              </span>
              <ChevronIcon
                class="h-2.5 w-2.5 shrink-0 transition-transform"
                :class="isGroupExpanded(group.id) ? 'rotate-180' : ''"
                aria-hidden="true"
              />
            </button>
          </h2>
          <div
            v-show="isGroupExpanded(group.id)"
            :id="`${idPrefix}-${group.id}-matches`"
            class="mt-1.5 space-y-1.5"
            role="region"
            :aria-labelledby="`${idPrefix}-${group.id}-heading`"
          >
            <MatchCardH5
              v-for="match in group.matches"
              :key="match.id"
              :match="match"
              :MarketLines="match.MarketLines"
              :selected-wager-selection-id="page.getSelectedWagerSelectionId(match.id)"
              :favorite="favorites.has(match.id)"
              @favorite="page.toggleFavorite(match.id)"
              @select="selectOdds(match.id, $event)"
              @media="showMediaPlaceholder"
            />
          </div>
        </section>
      </div>
    </section>
    <p
      v-if="page.homepageLoading.value"
      class="mx-[14px] py-6 text-center text-xs text-text-2"
      role="status"
    >
      {{ page.sportsLoadingText.value }}
    </p>
    <!-- 空结果仍保留筛选入口，不回退到其他球种或模拟赛事。 -->
    <ThemedEmptyState
      v-else-if="!groups.length && !page.homepageError.value"
      :dark-image="emptyImage"
      :light-image="emptyImageLight"
      :message="page.sportsEmptyText.value"
      container-class="mx-[14px] mt-10"
      image-class="h-[180px] w-[198px] object-contain"
      text-class="mt-4 text-center text-xs text-text-2"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onScopeDispose, ref, useId, watch } from 'vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useLayoutStore } from '@/stores/layout'
import { globalShowToast } from '@/utils/toast'
import ChevronIcon from '@/static/svg/casino/dropdown_chevron.svg?component'
import leagueIcon from '@/static/svg/sports/liansai_tabs/icon1.svg?url'
import emptyImage from '@/static/img/explore/default.png'
import emptyImageLight from '@/static/img/explore/default_white.png'
import SportsNavigation from '../sports-navigation/index.vue'
import FilterSearch_H5 from '../filter_search/H5.vue'
import MatchVersus from '../match-versus/index.vue'
import MatchOdds from '../match-odds/index.vue'
import MatchCardH5 from '../match-card/h5.vue'
import type { SportsMatch, SportsPageState } from '../../index'
import type { OddsSelectPayload } from '../match-odds/types'
import LeagueTabs_H5 from '../liansai_tabs/H5.vue'

const props = defineProps<{ page: SportsPageState }>()
const idPrefix = useId()
const layoutStore = useLayoutStore()
const navigationHeader = ref<HTMLElement | null>(null)
const navigationHeight = ref(layoutStore.TOPNAV_HEIGHT + layoutStore.BOTTOM_TAB_HEIGHT + 56)
const activeSport = computed(() => props.page.selectedSportKey.value)
const liveStrip = ref<HTMLElement | null>(null)
const expandedGroups = ref<Record<string, boolean>>({})

// 页面外层不是实际滚动容器，局部固定导航并同步等高占位，不改动全局布局。
let navigationObserver: ResizeObserver | undefined
onMounted(() => {
  if (!navigationHeader.value) return
  const updateHeight = () => {
    if (navigationHeader.value) navigationHeight.value = navigationHeader.value.offsetHeight
  }
  updateHeight()
  navigationObserver = new ResizeObserver(updateHeight)
  navigationObserver.observe(navigationHeader.value)
})
onScopeDispose(() => navigationObserver?.disconnect())

const activeSportLabel = computed(() => props.page.selectedSportLabel.value)
const matches = computed(() => props.page.matches.value)
const liveMatches = computed(() => props.page.liveMatches.value)
const favorites = computed(() => new Set(props.page.favorites.value))
const groups = computed(() => {
  const result = new Map<string, { id: string; name: string; matches: SportsMatch[] }>()
  for (const match of matches.value) {
    const group = result.get(match.leagueId)
    if (group) group.matches.push(match)
    else result.set(match.leagueId, { id: match.leagueId, name: match.league, matches: [match] })
  }
  return [...result.values()]
})

// 未操作时仅首组展开；各球种使用稳定联赛 ID，切换后保留用户的展开状态。
const isGroupExpanded = (id: string) => expandedGroups.value[id] ?? groups.value[0]?.id === id
const allGroupsCollapsed = computed(() => groups.value.every(group => !isGroupExpanded(group.id)))
const toggleGroup = (id: string) => {
  expandedGroups.value = { ...expandedGroups.value, [id]: !isGroupExpanded(id) }
}
const toggleAllGroups = () => {
  const expand = allGroupsCollapsed.value
  expandedGroups.value = {
    ...expandedGroups.value,
    ...Object.fromEntries(groups.value.map(group => [group.id, expand]))
  }
}
// 球种变化只复位实时区滚动位置，业务筛选联动统一由页面主逻辑处理。
watch(activeSport, async () => {
  await nextTick()
  liveStrip.value?.scrollTo({ left: 0, behavior: 'instant' })
})

// 列表取消选项与弹层删除保持一致：保留待补全串关，并立即显示当前投注单。
const selectOdds = (matchId: string, payload: OddsSelectPayload) => {
  const wasParlay = props.page.mode.value === 'parlay'
  props.page.selectOdds(matchId, payload)
  if (wasParlay && props.page.selections.value.length) props.page.setMode('parlay', true)
  props.page.betSlipOpen.value = true
}

const showMediaPlaceholder = (kind: 'video' | 'animation') => {
  globalShowToast(
    kind === 'video'
      ? 'Live video is not available in this local preview.'
      : 'Match animation is not available in this local preview.'
  )
}
</script>
