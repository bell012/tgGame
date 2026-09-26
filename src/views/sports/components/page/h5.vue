<template>
  <div
    class="min-h-dvh w-full min-w-0 max-w-full bg-bg-1 pb-[calc(88px+env(safe-area-inset-bottom))] font-inter text-text-1"
    :data-sport="activeSport"
    data-testid="sports-h5-page"
  >
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

    <!-- 热门区加载失败不影响下方赛事。 -->
    <p v-if="page.hotEventsLoading.value" class="mx-[14px] mb-3 text-xs text-text-2" role="status">
      {{ page.sportsLoadingText.value }}
    </p>
    <div
      v-else-if="page.hotEventsError.value"
      class="mx-[14px] mb-3 flex items-center gap-3 text-xs text-text-2"
      role="status"
    >
      <span>{{ page.sportsLoadFailedText.value }}</span>
      <button
        type="button"
        class="shrink-0 text-theme-primary disabled:opacity-50"
        :disabled="page.hotEventsLoading.value"
        @click="page.retryHotEvents"
      >
        {{ page.sportsRetryText.value }}
      </button>
    </div>

    <section
      v-if="liveMatches.length"
      aria-label="Popular matches"
      class="min-w-0"
      data-testid="sports-h5-live-section"
    >
      <div
        ref="liveStrip"
        class="flex min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto px-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabindex="0"
        aria-label="Popular matches"
        data-testid="sports-h5-live-strip"
      >
        <article
          v-for="match in liveMatches"
          :key="match.id"
          v-match-visibility="{ sportId: match.sportId, eventId: match.EventId }"
          class="flex min-h-[150px] w-full min-w-0 shrink-0 snap-center flex-col rounded-lg bg-bg-2 px-2.5 py-3"
          :data-sports-live-match="match.id"
        >
          <div class="flex h-[14px] min-w-0 items-center gap-[14px] text-[10px] leading-3">
            <span class="shrink-0 text-text-2">{{ page.getMatchTime(match) }}</span>
            <span class="min-w-0 flex-1 truncate text-[11px]" :title="match.league">{{
              match.league
            }}</span>
            <span
              v-if="match.totalMarkets !== undefined"
              class="flex shrink-0 items-center gap-0.5 rounded bg-theme-primary py-px pl-[5px] pr-[3px] font-medium text-text-4"
              :aria-label="`${match.totalMarkets} markets`"
            >
              {{ match.totalMarkets }}
              <ChevronIcon class="h-2 w-2 -rotate-90" aria-hidden="true" />
            </span>
          </div>

          <MatchVersus
            class="mt-3 min-h-[52px]"
            :home-src="match.home.badge"
            :away-src="match.away.badge"
            :HomeTeam="match.HomeTeam"
            :AwayTeam="match.AwayTeam"
            :HomeScore="match.HomeScore"
            :AwayScore="match.AwayScore"
            :HomeTeamId="match.HomeTeamId"
            :AwayTeamId="match.AwayTeamId"
            :center-caption="liveStripCaption(match)"
          />

          <!-- 长队名允许换行，盘口靠底部对齐。 -->
          <div class="mt-auto pt-3">
            <MatchOdds
              v-if="match.MarketLines.length"
              :MarketLines="match.MarketLines"
              :selected-wager-selection-id="page.getSelectedWagerSelectionId(match.id)"
              picker="liveStrip"
              @select="selectOdds(match.id, $event)"
            />
            <div v-else class="h-9" aria-hidden="true" data-testid="sports-h5-live-odds-slot"></div>
          </div>
        </article>
      </div>
    </section>

    <section class="mx-[14px] mt-3" :aria-label="`${activeSportLabel} matches by league`">
      <div class="mb-3 flex h-[30px] items-center gap-[7px]">
        <LeagueTabs_H5
          :collect-only="page.collectOnly.value"
          :search-keyword="page.searchInput.value"
          @filter-change="page.handleLeagueSortChange"
          @league-filter="page.handleLeagueFilter"
          @collect-change="page.handleCollectChange"
          @search-change="page.handleSearchChange"
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

      <div v-if="groups.length" class="space-y-[5px]" data-testid="sports-h5-league-list">
        <section v-for="group in visibleGroups" :key="group.id" :data-league-id="group.id">
          <h2>
            <button
              :id="`${idPrefix}-${group.id}-heading`"
              type="button"
              class="flex min-h-[34px] w-full items-center gap-1.5 rounded-lg bg-bg-2 px-2.5 py-[7px] text-left text-xs font-medium text-text-2 focus-visible:outline focus-visible:outline-theme-primary"
              :aria-expanded="isGroupExpanded(group.id)"
              :aria-controls="`${idPrefix}-${group.id}-matches`"
              data-testid="sports-h5-league-toggle"
              @click="toggleGroup(group.id)"
            >
              <img :src="leagueIcon" alt="" class="h-5 w-5 shrink-0 object-contain" />
              <span class="min-w-0 flex-1 truncate" :title="group.name">{{ group.name }}</span>
              <span
                class="min-w-4 shrink-0 rounded bg-theme-primary px-[5px] text-center text-[10px] font-medium leading-[15px] text-text-4"
                :aria-label="`${getGroupMatchCount(group)} matches`"
              >
                {{ getGroupMatchCount(group) }}
              </span>
              <ChevronIcon
                class="ml-1 h-3 w-3 shrink-0 text-icon-3 transition-transform"
                :class="isGroupExpanded(group.id) ? 'rotate-180' : ''"
                aria-hidden="true"
              />
            </button>
          </h2>
          <div
            v-show="isGroupExpanded(group.id)"
            :id="`${idPrefix}-${group.id}-matches`"
            class="mt-[5px] space-y-[5px]"
            role="region"
            :aria-labelledby="`${idPrefix}-${group.id}-heading`"
          >
            <MatchCardH5
              v-for="match in group.matches"
              :key="match.id"
              v-match-visibility="{
                sportId: match.sportId,
                eventId: match.EventId,
                enabled: isGroupExpanded(group.id)
              }"
              :match="match"
              :time-label="page.getMatchTime(match)"
              :MarketLines="match.MarketLines"
              :selected-wager-selection-id="page.getSelectedWagerSelectionId(match.id)"
              :favorite="match.IsFavourite"
              :favorite-pending="page.isMatchFavoritePending(match.id)"
              @favorite="page.handleMatchFavorite(match.id)"
              @select="selectOdds(match.id, $event)"
              @media="showMediaPlaceholder"
            />
            <p
              v-if="getGroupLoadState(group.id)?.loading"
              class="py-3 text-center text-xs text-text-2"
              role="status"
            >
              {{ $t('common.loadingMore') }}
            </p>
            <div
              v-else-if="getGroupLoadState(group.id)?.error"
              class="flex items-center justify-center gap-3 py-3 text-xs text-text-2"
              role="status"
            >
              <span>{{ page.sportsLoadFailedText.value }}</span>
              <button
                type="button"
                class="shrink-0 text-theme-primary"
                @click="retryGroup(group.id)"
              >
                {{ page.sportsRetryText.value }}
              </button>
            </div>
          </div>
        </section>
      </div>
      <!-- 联赛分批显示，展开时再补查赛事。 -->
      <div
        v-if="hasMoreCachedGroups"
        ref="loadMoreSentinel"
        class="h-px w-full"
        aria-hidden="true"
        data-testid="sports-h5-load-more"
      ></div>
      <template v-if="groups.length && !hasMoreCachedGroups && !page.homepageLoading.value">
        <p
          v-if="page.matchesLoading.value"
          class="py-4 text-center text-xs text-text-2"
          role="status"
        >
          {{ $t('common.loadingMore') }}
        </p>
        <div
          v-else-if="page.matchesError.value && !page.homepageError.value"
          class="flex items-center justify-center gap-3 py-4 text-xs text-text-2"
          role="status"
        >
          <span>{{ page.sportsLoadFailedText.value }}</span>
          <button
            type="button"
            class="shrink-0 text-theme-primary disabled:opacity-50"
            :disabled="page.matchesLoading.value"
            @click="page.retrySports"
          >
            {{ page.sportsRetryText.value }}
          </button>
        </div>
      </template>
    </section>
    <p
      v-if="page.homepageLoading.value"
      class="mx-[14px] py-6 text-center text-xs text-text-2"
      role="status"
    >
      {{ page.sportsLoadingText.value }}
    </p>
    <ThemedEmptyState
      v-else-if="!groups.length && !page.homepageError.value"
      :dark-image="emptyImage"
      :light-image="emptyImageLight"
      :message="page.sportsEmptyText.value"
      container-class="mx-[14px] mt-10"
      image-class="h-[180px] w-[198px] object-contain"
      text-class="mt-4 text-center text-xs text-text-2"
    />
    <Floating
      v-if="pageActive"
      v-show="!page.betSlipOpen.value"
      :bet-count="page.selections.value.length"
      @select="page.handleFloatingEntry"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  ref,
  useId,
  watch
} from 'vue'
import { useRoute } from 'vue-router'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import { useLayoutStore } from '@/stores/layout'
import { globalShowToast } from '@/utils/toast'
import { stripLocalePrefix } from '@/utils/locale'
import ChevronIcon from '@/static/svg/casino/dropdown_chevron.svg?component'
import leagueIcon from '@/static/svg/sports/liansai_tabs/icon1.svg?url'
import emptyImage from '@/static/img/explore/default.png'
import emptyImageLight from '@/static/img/explore/default_white.png'
import SportsNavigation from '../sports-navigation/index.vue'
import FilterSearch_H5 from '../filter_search/H5.vue'
import MatchVersus from '../match-versus/index.vue'
import MatchOdds from '../match-odds/index.vue'
import { pickOverUnderOrFirstMarketLine } from '../match-odds/display'
import MatchCardH5 from '../match-card/h5.vue'
import type { SportsMatch } from '../../shared/types'
import type { SportsPageState } from '../../index'
import { useMatchVisibility } from '../../composables/useMatchVisibility'
import type { OddsSelectPayload } from '../match-odds/types'
import LeagueTabs_H5 from '../liansai_tabs/H5.vue'
import Floating from '../floating/index.vue'

const props = defineProps<{ page: SportsPageState }>()
const idPrefix = useId()
const layoutStore = useLayoutStore()
const route = useRoute()
const navigationHeader = ref<HTMLElement | null>(null)
const navigationHeight = ref(layoutStore.TOPNAV_HEIGHT + layoutStore.BOTTOM_TAB_HEIGHT + 56)
const activeSport = computed(() => props.page.selectedSportKey.value)
const liveStrip = ref<HTMLElement | null>(null)
const expandedGroups = ref<Record<string, boolean>>({})
const expandNewGroups = ref(false)
const LEAGUE_BATCH_SIZE = 10
const visibleGroupCount = ref(LEAGUE_BATCH_SIZE)
const loadMoreSentinel = ref<HTMLElement | null>(null)
const pageActive = ref(true)
let pageDisposed = false
const { vMatchVisibility } = useMatchVisibility({
  enabled: () => !props.page.betSlipOpen.value && stripLocalePrefix(route.path) === '/sports',
  topInset: () => navigationHeight.value,
  onChange: targets => props.page.setVisibleMatches('h5', targets)
})

// 同步固定导航的高度，给正文留出位置。
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
const liveStripCaption = (match: SportsMatch) => {
  const line = pickOverUnderOrFirstMarketLine(match.MarketLines)[0]
  if (!line) return ''
  if (line.PeriodId !== 1 && line.PeriodName) return `${line.BetTypeName} ${line.PeriodName}`
  return line.BetTypeName
}
const groups = computed(() => {
  const result = new Map<string, { id: string; name: string; matches: SportsMatch[] }>()
  // 预览没有赛事的联赛也保留标题，展开时补查。
  for (const league of props.page.displayLeagueGroups.value) {
    const id = `${props.page.selectedSportId.value}:${league.CompetitionId}`
    result.set(id, { id, name: league.CompetitionName, matches: [] })
  }
  for (const match of matches.value) {
    const group = result.get(match.leagueId)
    if (group) group.matches.push(match)
    else result.set(match.leagueId, { id: match.leagueId, name: match.league, matches: [match] })
  }
  return [...result.values()]
})
const visibleGroups = computed(() => groups.value.slice(0, visibleGroupCount.value))
const hasMoreCachedGroups = computed(() => visibleGroupCount.value < groups.value.length)

// 每次追加一批联赛，不拆分联赛内的赛事。
const loadMoreCachedGroups = () => {
  if (!pageActive.value || !hasMoreCachedGroups.value) return
  visibleGroupCount.value = Math.min(
    visibleGroupCount.value + LEAGUE_BATCH_SIZE,
    groups.value.length
  )
}
const loadMoreObserver = useIntersectionObserver({
  target: loadMoreSentinel,
  rootMargin: '0px 0px 200px 0px',
  enabled: () => pageActive.value && hasMoreCachedGroups.value,
  onChange: ({ isIntersecting }) => {
    if (isIntersecting) loadMoreCachedGroups()
  }
})

// 切换查询条件时重置展示数量，追加缓存不重置。
watch(
  () => props.page.matchListContext.value,
  () => {
    visibleGroupCount.value = LEAGUE_BATCH_SIZE
    expandNewGroups.value = false
  },
  { flush: 'sync' }
)
// 列表更新后重新检测底部，未铺满一屏时继续加载。
watch([() => groups.value.length, visibleGroupCount], () => loadMoreObserver.reconnect(), {
  flush: 'post'
})
onActivated(() => {
  pageActive.value = true
  syncExpandedLeagues()
  loadMoreObserver.reconnect()
})
onDeactivated(() => {
  pageActive.value = false
  props.page.syncExpandedLeagues([])
  loadMoreObserver.disconnect()
})
onScopeDispose(() => {
  pageDisposed = true
  pageActive.value = false
  props.page.syncExpandedLeagues([])
  loadMoreObserver.disconnect()
})

// 默认展开首组，按联赛 ID 记住展开状态。
const isGroupExpanded = (id: string) =>
  expandedGroups.value[id] ?? (expandNewGroups.value || groups.value[0]?.id === id)
const allGroupsCollapsed = computed(() => groups.value.every(group => !isGroupExpanded(group.id)))
const toggleGroup = (id: string) => {
  expandedGroups.value = { ...expandedGroups.value, [id]: !isGroupExpanded(id) }
}
const toggleAllGroups = () => {
  const expand = allGroupsCollapsed.value
  expandNewGroups.value = expand
  expandedGroups.value = {
    ...expandedGroups.value,
    ...Object.fromEntries(groups.value.map(group => [group.id, expand]))
  }
}

const getCompetitionId = (groupId: string): number | null => {
  const parts = groupId.split(':')
  const id = Number(parts[1])
  return parts.length === 2 && Number.isSafeInteger(id) && id > 0 ? id : null
}
const getGroupMatchCount = (group: { id: string; matches: SportsMatch[] }) =>
  props.page.leagueCounts.value.get(group.id) ?? group.matches.length
const getGroupLoadState = (groupId: string) => {
  if (props.page.keyword.value.trim()) return undefined
  const id = getCompetitionId(groupId)
  return id === null ? undefined : props.page.getLeagueLoadState(id)
}
const retryGroup = (groupId: string) => {
  if (pageDisposed || !pageActive.value || props.page.keyword.value.trim()) return
  const id = getCompetitionId(groupId)
  if (id !== null) props.page.retryLeague(id)
}

// 只补查已显示且展开的联赛，搜索结果不补查。
const expandedCompetitionIds = computed(() =>
  visibleGroups.value
    .filter(group => isGroupExpanded(group.id))
    .map(group => getCompetitionId(group.id))
    .filter((id): id is number => id !== null)
)
const syncExpandedLeagues = () => {
  props.page.syncExpandedLeagues(
    !pageDisposed && pageActive.value && !props.page.keyword.value.trim()
      ? expandedCompetitionIds.value
      : []
  )
}
watch(
  [
    () => props.page.matchListContext.value,
    () => props.page.keyword.value,
    () => expandedCompetitionIds.value.join(','),
    pageActive
  ],
  syncExpandedLeagues,
  { immediate: true, flush: 'post' }
)
// 切换球种后，热门区滚动回起点。
watch(activeSport, async () => {
  await nextTick()
  if (pageDisposed || !pageActive.value) return
  liveStrip.value?.scrollTo({ left: 0, behavior: 'instant' })
})

// 增删选项时保留串关模式，点击赔率后打开投注单。
const selectOdds = async (matchId: string, payload: OddsSelectPayload) => {
  const wasParlay = props.page.mode.value === 'parlay'
  if (!(await props.page.selectOdds(matchId, payload))) return
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
