<template>
  <!-- 两端共享投注状态，移动端独立组织分组赛事与底部投注单。 -->
  <template v-if="isMobile">
    <SportsH5Page :page="page" />
    <SportsBetSlipH5 :page="page" />
  </template>

  <div v-else class="w-full min-w-0 bg-bg-1 font-inter text-text-1" data-testid="sports-page">
    <!-- 导航入口自带页面间距，不重复添加外层内边距。 -->
    <SportsNavigation :counts="{ football: matches.length }" />

    <section class="mt-4" aria-label="Live matches">
      <div
        class="relative flex items-start gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabindex="0"
        aria-label="Live matches"
        data-testid="sports-live-strip"
      >
        <article
          v-for="match in liveMatches"
          :key="match.id"
          class="relative flex min-h-[262px] w-[444px] shrink-0 flex-col rounded-xl bg-bg-5 p-3"
          :data-sports-match="`live:${match.id}`"
        >
          <div class="flex h-6 items-center justify-between gap-3 text-sm text-text-2">
            <div class="flex min-w-0 items-center gap-2">
              <SoccerIcon class="h-6 w-6 shrink-0" aria-hidden="true" />
              <span class="shrink-0">{{ match.country }}</span>
              <ArrowRightIcon class="h-1.5 w-1.5 shrink-0" aria-hidden="true" />
              <span class="truncate">{{ match.league }}</span>
            </div>
            <span class="shrink-0 text-text-1">80’ Second Half</span>
          </div>

          <MatchVersus
            class="mt-8"
            :home-src="homeShirt"
            :home-name="match.home.name"
            :away-src="awayShirt"
            :away-name="match.away.name"
            :home-score="match.homeScore"
            :away-score="match.awayScore"
          />

          <!-- 完整盘口按公开协议接入，标题、排序和展开按钮交由组件渲染。 -->
          <div class="mt-auto pt-4">
            <MatchOdds
              :markets="getLiveMarkets(match.id)"
              :expanded="expandedMatchId === `live:${match.id}`"
              @update:expanded="setMatchExpanded(`live:${match.id}`, $event)"
              @select="selectOdds(match.id, $event)"
            />
          </div>
        </article>
      </div>
    </section>

    <section class="mx-5 mt-4 space-y-4" data-testid="sports-filters">
      <LeagueTabs />
      <FilterSearch />
    </section>

    <!-- PC 统一四列；展开面板覆盖后续卡片，不改变网格占位。 -->
    <section ref="matchList" class="mx-5 mb-10 mt-4 scroll-mt-20" aria-label="Upcoming matches">
      <div class="grid min-w-0 grid-cols-4 gap-3" data-testid="sports-match-grid">
        <SportsMatchCard
          v-for="match in pagedMatches"
          :key="match.id"
          :match="match"
          :markets="getMatchMarkets(match.id)"
          :expanded="expandedMatchId === match.id"
          :favorite="favorites.includes(match.id)"
          @update:expanded="setMatchExpanded(match.id, $event)"
          @favorite="toggleFavorite(match.id)"
          @select="selectOdds(match.id, $event)"
          @media="showMediaPlaceholder"
        />
      </div>
      <nav class="mt-8" aria-label="Match pagination" data-testid="sports-pagination">
        <DesktopPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change="changePage"
        />
      </nav>
    </section>

    <CommonFooter />

    <SportsBetSlip
      :open="betSlipOpen"
      :mode="mode"
      :selections="selections"
      :parlays="parlays"
      :balance-text="balanceText"
      :currency-symbol="currencySymbol"
      :total-stake-text="totalStakeText"
      :potential-return-text="potentialReturnText"
      :can-submit="canSubmit"
      :refreshing="refreshing"
      :notice="notice"
      :focused-stake-id="focusedStakeId"
      @toggle="betSlipOpen = !betSlipOpen"
      @remove="removeSelection"
      @stake="updateStake"
      @parlay-stake="updateParlayStake"
      @focus-stake="focusStake"
      @max="maxStake"
      @quick-amount="quickAmount"
      @mode="setMode"
      @clear="clearBets"
      @submit="submitMockBet"
      @refresh="refreshBalance"
      @unsupported="showUnsupported"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import CommonFooter from '@/components/commonFooter.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import { globalShowToast } from '@/utils/toast'
import SoccerIcon from '@/static/svg/sports/soccer.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import homeShirt from '@/static/svg/sports/home-shirt.svg?url'
import awayShirt from '@/static/svg/sports/away-shirt.svg?url'
import SportsNavigation from './components/sports-navigation/index.vue'
import MatchVersus from './components/match-versus/index.vue'
import MatchOdds from './components/match-odds/index.vue'
import LeagueTabs from './components/liansai_tabs.vue'
import FilterSearch from './components/filter_search.vue'
import SportsMatchCard from './components/SportsMatchCard.vue'
import SportsBetSlip from './components/SportsBetSlip.vue'
import SportsH5Page from './components/SportsH5Page.vue'
import SportsBetSlipH5 from './components/SportsBetSlipH5.vue'
import { H5_MATCHES } from './h5-data'
import { useSportsPage } from './index'

const isMobile = useIsMobile()
const matchList = ref<HTMLElement | null>(null)
const page = useSportsPage({ additionalMatches: H5_MATCHES })
const {
  matches,
  currentPage,
  totalPages,
  pagedMatches,
  setPage,
  liveMatches,
  expandedMatchId,
  favorites,
  betSlipOpen,
  mode,
  selections,
  parlays,
  balanceText,
  currencySymbol,
  totalStakeText,
  potentialReturnText,
  canSubmit,
  notice,
  refreshing,
  focusedStakeId,
  toggleFavorite,
  setMatchExpanded,
  getMatchMarkets,
  getLiveMarkets,
  selectOdds,
  removeSelection,
  updateStake,
  updateParlayStake,
  focusStake,
  maxStake,
  quickAmount,
  setMode,
  clearBets,
  submitMockBet,
  refreshBalance,
  showUnsupported
} = page

async function changePage(page: number) {
  if (page === currentPage.value) return
  setPage(page)
  await nextTick()
  matchList.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

function showMediaPlaceholder(kind: 'video' | 'animation') {
  globalShowToast(
    kind === 'video'
      ? 'Live video is not available in this local preview.'
      : 'Match animation is not available in this local preview.'
  )
}
</script>
