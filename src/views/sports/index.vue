<template>
  <!-- 两端共享投注状态，移动端独立组织分组赛事与底部投注单。 -->
  <template v-if="isMobile">
    <H5Page :page="page" />
    <BetSlipH5 :page="page" />
  </template>

  <div v-else class="w-full min-w-0 bg-bg-1 font-inter text-text-1" data-testid="sports-page">
    <!-- 导航入口自带页面间距，不重复添加外层内边距。 -->
    <SportsNavigation @change="handleSportChange" />

    <!-- 热门加载与失败独立展示，不影响主赛事列表的筛选和加载状态。 -->
    <p v-if="page.hotEventsLoading.value" class="mx-5 mt-4 text-sm text-text-2" role="status">
      {{ page.sportsLoadingText.value }}
    </p>
    <div
      v-else-if="page.hotEventsError.value"
      class="mx-5 mt-4 flex items-center gap-3 text-sm text-text-2"
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

    <section v-if="liveMatches.length" class="mt-4" aria-label="Popular matches">
      <div
        class="relative flex items-start gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabindex="0"
        aria-label="Popular matches"
        data-testid="sports-live-strip"
      >
        <article
          v-for="match in liveMatches"
          :key="match.id"
          class="relative flex w-[444px] shrink-0 flex-col rounded-xl bg-bg-5 p-3"
          :data-sports-match="`live:${match.id}`"
        >
          <div class="flex h-6 items-center justify-between gap-3 text-sm text-text-2">
            <div class="flex min-w-0 items-center gap-2">
              <component
                :is="page.selectedSportIcon.value"
                v-if="page.selectedSportIcon.value"
                class="h-6 w-6 shrink-0 fill-current [&_path]:fill-current"
                aria-hidden="true"
              />
              <template v-if="match.country">
                <span class="shrink-0">{{ match.country }}</span>
                <ArrowRightIcon class="h-1.5 w-1.5 shrink-0" aria-hidden="true" />
              </template>
              <span class="truncate">{{ match.league }}</span>
            </div>
            <span class="shrink-0 text-text-1">{{ match.phase || match.kickoff }}</span>
          </div>

          <MatchVersus
            class="mt-8"
            :home-src="match.home.badge"
            :away-src="match.away.badge"
            :HomeTeam="match.HomeTeam"
            :AwayTeam="match.AwayTeam"
            :HomeScore="match.HomeScore"
            :AwayScore="match.AwayScore"
            :HomeTeamId="match.HomeTeamId"
            :AwayTeamId="match.AwayTeamId"
          />

          <div class="mt-4">
            <MatchOdds
              v-if="match.MarketLines.length"
              :MarketLines="match.MarketLines"
              :selected-wager-selection-id="getSelectedWagerSelectionId(match.id)"
              picker="liveStrip"
              :show-expand="false"
              @select="selectOdds(match.id, $event)"
            />
          </div>
        </article>
      </div>
    </section>

    <section class="mx-5 mt-4 space-y-4" data-testid="sports-filters">
      <div
        v-if="page.homepageError.value || page.matchesError.value"
        class="flex items-center gap-3 text-sm text-text-2"
        role="status"
      >
        <span>{{ page.sportsLoadFailedText.value }}</span>
        <button
          type="button"
          class="shrink-0 text-theme-primary disabled:opacity-50"
          :disabled="page.homepageLoading.value || page.matchesLoading.value"
          @click="page.retrySports"
        >
          {{ page.sportsRetryText.value }}
        </button>
      </div>
      <LeagueTabs_PC
        v-if="!isMobile"
        @filter-change="handleLeagueSortChange"
        @league-change="handleLeagueChange"
      />
      <FilterSearch_PC
        v-if="!isMobile"
        :collect-only="collectOnly"
        :search-keyword="page.searchInput.value"
        @search-change="page.handleSearchChange"
        @filter-change="handleMatchFilterChange"
        @collect-change="handleCollectChange"
      />
    </section>

    <!-- PC 统一四列；展开面板覆盖后续卡片，不改变网格占位。 -->
    <section ref="matchList" class="mx-5 mb-10 mt-4 scroll-mt-20" aria-label="Upcoming matches">
      <p
        v-if="page.homepageLoading.value"
        class="py-4 text-center text-sm text-text-2"
        role="status"
      >
        {{ page.sportsLoadingText.value }}
      </p>
      <ThemedEmptyState
        v-else-if="!page.matches.value.length && !page.homepageError.value"
        :dark-image="emptyImage"
        :light-image="emptyImageLight"
        :message="page.sportsEmptyText.value"
        image-class="h-[180px] w-[198px] object-contain"
        text-class="mt-4 text-center text-sm text-text-2"
      />
      <div class="grid min-w-0 grid-cols-4 gap-3" data-testid="sports-match-grid">
        <MatchCardPc
          v-for="match in pagedMatches"
          :key="match.id"
          :match="match"
          :MarketLines="match.MarketLines"
          :selected-wager-selection-id="getSelectedWagerSelectionId(match.id)"
          :expanded="expandedMatchId === match.id"
          :favorite="favorites.includes(match.id)"
          @update:expanded="setMatchExpanded(match.id, $event)"
          @favorite="toggleFavorite(match.id)"
          @select="selectOdds(match.id, $event)"
          @media="showMediaPlaceholder"
        />
      </div>
      <p
        v-if="page.matchesLoading.value && !page.homepageLoading.value"
        class="py-4 text-center text-sm text-text-2"
        role="status"
      >
        {{ $t('common.loadingMore') }}
      </p>
      <nav
        v-if="totalPages > 1"
        class="mt-8"
        aria-label="Match pagination"
        data-testid="sports-pagination"
      >
        <DesktopPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change="changePage"
        />
      </nav>
    </section>

    <CommonFooter />

    <BetSlipPc
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
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { globalShowToast } from '@/utils/toast'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import emptyImage from '@/static/img/explore/default.png'
import emptyImageLight from '@/static/img/explore/default_white.png'
import SportsNavigation from './components/sports-navigation/index.vue'
import MatchVersus from './components/match-versus/index.vue'
import MatchOdds from './components/match-odds/index.vue'
import LeagueTabs_PC from './components/liansai_tabs/pc.vue'
import FilterSearch_PC from './components/filter_search/pc.vue'
import MatchCardPc from './components/match-card/pc.vue'
import BetSlipPc from './components/bet-slip/pc.vue'
import H5Page from './components/page/h5.vue'
import BetSlipH5 from './components/bet-slip/h5.vue'
import { useSportsPage } from './index'

const isMobile = useIsMobile()
const matchList = ref<HTMLElement | null>(null)
const page = useSportsPage()
const {
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
  collectOnly,
  toggleFavorite,
  setMatchExpanded,
  getSelectedWagerSelectionId,
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
  showUnsupported,
  handleSportChange,
  handleMatchFilterChange,
  handleLeagueSortChange,
  handleLeagueChange,
  handleCollectChange
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
