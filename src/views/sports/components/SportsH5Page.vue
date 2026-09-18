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
      <SportsNavigation @change="changeSport" />
      <div
        class="absolute inset-x-[14px] bottom-4 h-[38px]"
        aria-hidden="true"
        data-testid="sports-h5-date-filter-slot"
      ></div>
    </header>
    <div :style="{ height: `${navigationHeight}px` }" aria-hidden="true"></div>

    <template v-if="groups.length">
      <section aria-label="Live matches" class="min-w-0" data-testid="sports-h5-live-section">
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
                class="shrink-0 rounded bg-theme-primary px-1 text-text-4"
                :aria-label="`${match.markets.length} markets`"
              >
                {{ match.markets.length }}
              </span>
            </div>

            <MatchVersus
              class="mt-3"
              :home-src="match.sportKey === 'football' ? homeShirt : match.home.badge"
              :home-name="match.home.name"
              :away-src="match.sportKey === 'football' ? awayShirt : match.away.badge"
              :away-name="match.away.name"
              :home-score="match.homeScore"
              :away-score="match.awayScore"
              center-caption="1X2"
            />

            <!-- 实时卡横排赔率待组件提供公开接口，保留对应高度，不重复实现赔率按钮。 -->
            <div class="mt-3 h-9" aria-hidden="true" data-testid="sports-h5-live-odds-slot"></div>
          </article>
        </div>
      </section>

      <section class="mx-[14px] mt-3" :aria-label="`${activeSportLabel} matches by league`">
        <div class="mb-3 flex h-[30px] items-center gap-2">
          <!-- 搜索、收藏筛选及排序区域由筛选组件提供，暂保留接入槽位。 -->
          <div
            class="min-w-0 flex-1"
            aria-hidden="true"
            data-testid="sports-h5-search-filter-slot"
          ></div>
          <button
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

        <div class="space-y-1.5" data-testid="sports-h5-league-list">
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
              <SportsMatchCardH5
                v-for="match in group.matches"
                :key="match.id"
                :match="match"
                :markets="getMarkets(match.id)"
                :favorite="favorites.has(match.id)"
                @favorite="page.toggleFavorite(match.id)"
                @select="selectOdds(match.id, $event)"
                @media="showMediaPlaceholder"
              />
            </div>
          </section>
        </div>
      </section>
    </template>

    <!-- 公共导航包含更多球种；未配置的球种只展示空态，不借用其他球种的数据。 -->
    <ThemedEmptyState
      v-else
      :dark-image="emptyImage"
      :light-image="emptyImageLight"
      message="No events available for this sport."
      container-class="mx-[14px] mt-10"
      image-class="h-[180px] w-[198px] object-contain"
      text-class="mt-4 text-center text-xs text-text-2"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onScopeDispose, ref, useId } from 'vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useLayoutStore } from '@/stores/layout'
import { globalShowToast } from '@/utils/toast'
import ChevronIcon from '@/static/svg/casino/dropdown_chevron.svg?component'
import leagueIcon from '@/static/svg/sports/liansai_tabs/icon1.svg?url'
import homeShirt from '@/static/svg/sports/home-shirt.svg?url'
import awayShirt from '@/static/svg/sports/away-shirt.svg?url'
import emptyImage from '@/static/img/explore/default.png'
import emptyImageLight from '@/static/img/explore/default_white.png'
import SportsNavigation from './sports-navigation/index.vue'
import MatchVersus from './match-versus/index.vue'
import SportsMatchCardH5 from './SportsMatchCardH5.vue'
import { H5_MATCHES, H5_SPORTS } from '../h5-data'
import type { H5SportsMatch } from '../h5-data'
import type { SportsPageState } from '../index'
import type { OddsMarket, OddsSelectPayload } from './match-odds/types'

const props = defineProps<{ page: SportsPageState }>()
const idPrefix = useId()
const layoutStore = useLayoutStore()
const navigationHeader = ref<HTMLElement | null>(null)
const navigationHeight = ref(layoutStore.TOPNAV_HEIGHT + layoutStore.BOTTOM_TAB_HEIGHT + 56)
const activeSport = ref('football')
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

const activeSportLabel = computed(
  () => H5_SPORTS.find(sport => sport.key === activeSport.value)?.label ?? 'Sports'
)
const matches = computed(() => H5_MATCHES.filter(match => match.sportKey === activeSport.value))
const liveMatches = computed(() => matches.value.filter(match => match.live))
const favorites = computed(() => new Set(props.page.favorites.value))
const groups = computed(() => {
  const result = new Map<string, { id: string; name: string; matches: H5SportsMatch[] }>()
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
const changeSport = async (_index: number, key: string) => {
  activeSport.value = key
  await nextTick()
  liveStrip.value?.scrollTo({ left: 0, behavior: 'instant' })
}

// 列表取消选项与弹层删除保持一致：保留待补全串关，并立即显示当前投注单。
const selectOdds = (matchId: string, payload: OddsSelectPayload) => {
  const wasParlay = props.page.mode.value === 'parlay'
  props.page.selectOdds(matchId, payload)
  if (wasParlay && props.page.selections.value.length) props.page.setMode('parlay', true)
  props.page.betSlipOpen.value = true
}

// H5 组件只读取 label；盘口线合入展示文案，选择时仍按原始 ID 回查共享数据。
const getMarkets = (matchId: string): OddsMarket[] => {
  const markets = props.page.getMatchMarkets(matchId)
  return ['handicap', 'ou', '1x2'].flatMap(id => {
    const market = markets.find(item => item.id === id)
    if (!market) return []
    return [
      {
        ...market,
        options: market.options.map(option => ({
          ...option,
          label: !option.line
            ? option.label
            : id === 'handicap'
              ? option.line
              : `${option.id === 'over' ? 'O' : option.id === 'under' ? 'U' : option.label} ${option.line}`
        }))
      }
    ]
  })
}

const showMediaPlaceholder = (kind: 'video' | 'animation') => {
  globalShowToast(
    kind === 'video'
      ? 'Live video is not available in this local preview.'
      : 'Match animation is not available in this local preview.'
  )
}
</script>
