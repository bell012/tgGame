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

    <!-- 热门加载与失败独立展示，成功但无热门数据时不占用列表空间。 -->
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
          class="w-full min-w-0 shrink-0 snap-center rounded-lg bg-bg-2 p-2.5"
          :data-sports-live-match="match.id"
        >
          <div class="flex h-4 min-w-0 items-center gap-3 text-[10px] leading-4">
            <span class="shrink-0 text-text-2">{{ match.phase || match.kickoff }}</span>
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
            :center-caption="liveStripCaption(match)"
          />

          <MatchOdds
            v-if="match.MarketLines.length"
            class="mt-2"
            :MarketLines="match.MarketLines"
            :selected-wager-selection-id="page.getSelectedWagerSelectionId(match.id)"
            picker="liveStrip"
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

      <div v-if="groups.length" class="space-y-1.5" data-testid="sports-h5-league-list">
        <section v-for="group in visibleGroups" :key="group.id" :data-league-id="group.id">
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
                :aria-label="`${getGroupMatchCount(group)} matches`"
              >
                {{ getGroupMatchCount(group) }}
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
      <!-- 联赛标题按缓存分批展示，新展示且展开的分组再补查联赛赛事。 -->
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
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
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
import { pickOverUnderOrFirstMarketLine } from '../match-odds/display'
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
const expandNewGroups = ref(false)
const LEAGUE_BATCH_SIZE = 10
const visibleGroupCount = ref(LEAGUE_BATCH_SIZE)
const loadMoreSentinel = ref<HTMLElement | null>(null)
const pageActive = ref(true)
let pageDisposed = false

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
const liveStripCaption = (match: SportsMatch) => {
  const line = pickOverUnderOrFirstMarketLine(match.MarketLines)[0]
  if (!line) return ''
  if (line.PeriodId !== 1 && line.PeriodName) return `${line.BetTypeName} ${line.PeriodName}`
  return line.BetTypeName
}
const groups = computed(() => {
  const result = new Map<string, { id: string; name: string; matches: SportsMatch[] }>()
  // 保留空预览联赛的标题入口，展开后仍可从联赛分页接口补回赛事。
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

// 联赛内赛事完整保留；后台逐页追加缓存时，已展示的联赛数量不回退。
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

// 只有查询范围切换才恢复首批，缓存追加与同条件重试不重置本地分页。
watch(
  () => props.page.matchListContext.value,
  () => {
    visibleGroupCount.value = LEAGUE_BATCH_SIZE
    expandNewGroups.value = false
  },
  { flush: 'sync' }
)
// 新缓存到达或本地批次渲染后，重新检测底部位置，兼容折叠列表未铺满一屏。
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

// 未操作时仅首组展开；各球种使用稳定联赛 ID，切换后保留用户的展开状态。
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

// 只补查当前展示且展开的联赛；搜索结果仅本地展开，收起与停用取消后续翻页。
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
// 球种变化只复位实时区滚动位置，业务筛选联动统一由页面主逻辑处理。
watch(activeSport, async () => {
  await nextTick()
  if (pageDisposed || !pageActive.value) return
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
