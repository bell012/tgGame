<template>
  <template v-if="isMobile">
    <H5Page :page="page" />
    <BetSlipH5 :page="page" />
  </template>

  <div v-else class="w-full min-w-0 bg-bg-1 font-inter text-text-1" data-testid="sports-page">
    <SportsNavigation class="!px-5" @change="handleSportChange" />

    <!-- 热门区加载失败不影响下方赛事。 -->
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
          v-match-visibility="{ sportId: match.sportId, eventId: match.EventId }"
          class="relative flex min-h-[204px] w-[360px] shrink-0 flex-col rounded-xl bg-bg-5 p-3"
          :data-sports-match="`live:${match.id}`"
        >
          <div class="flex h-5 items-center justify-between gap-3 text-xs text-text-2">
            <div class="flex min-w-0 items-center gap-2">
              <component
                :is="page.selectedSportIcon.value"
                v-if="page.selectedSportIcon.value"
                class="h-5 w-5 shrink-0 fill-current text-icon-2 [&_path]:fill-current"
                aria-hidden="true"
              />
              <template v-if="match.country">
                <span class="max-w-[40%] truncate" :title="match.country">{{ match.country }}</span>
                <ArrowRightIcon class="h-1.5 w-1.5 shrink-0" aria-hidden="true" />
              </template>
              <span class="truncate" :title="match.league">{{ match.league }}</span>
            </div>
            <span class="shrink-0 text-text-1">{{ page.getMatchTime(match) }}</span>
          </div>

          <MatchVersus
            class="mt-7"
            :home-src="match.home.badge"
            :away-src="match.away.badge"
            :HomeTeam="match.HomeTeam"
            :AwayTeam="match.AwayTeam"
            :HomeScore="match.HomeScore"
            :AwayScore="match.AwayScore"
            :HomeTeamId="match.HomeTeamId"
            :AwayTeamId="match.AwayTeamId"
          />

          <div class="mt-auto min-w-0 pt-3">
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
        @filter-change="handleMatchFilterChange"
        @collect-change="handleCollectChange"
      />
    </section>

    <!-- 卡片展开时覆盖下方内容，保留原网格位置。 -->
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
          v-match-visibility="{ sportId: match.sportId, eventId: match.EventId }"
          :match="match"
          :time-label="page.getMatchTime(match)"
          :MarketLines="match.MarketLines"
          :selected-wager-selection-id="getSelectedWagerSelectionId(match.id)"
          :expanded="expandedMatchId === match.id"
          :favorite="match.IsFavourite"
          :favorite-pending="isMatchFavoritePending(match.id)"
          @update:expanded="setMatchExpanded(match.id, $event)"
          @favorite="handleMatchFavorite(match.id)"
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
      :focused-stake-id="focusedStakeId"
      :submission-state="pcSubmissionState"
      @toggle="betSlipOpen = !betSlipOpen"
      @remove="removeSelection"
      @stake="updateStake"
      @parlay-stake="updateParlayStake"
      @focus-stake="focusStake"
      @max="maxStake"
      @quick-amount="quickAmount"
      @mode="setMode"
      @clear="clearBets"
      @submit="submitPcMockBet"
      @reuse="resetPcBetResult"
      @dismiss-result="finishPcBetResult"
      @refresh="refreshBalance"
      @unsupported="showPcUnsupported"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onDeactivated, onScopeDispose, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import CommonFooter from '@/components/commonFooter.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { globalShowToast } from '@/utils/toast'
import { stripLocalePrefix } from '@/utils/locale'
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
import { useMatchVisibility } from './composables/useMatchVisibility'

const isMobile = useIsMobile()
const matchList = ref<HTMLElement | null>(null)
const page = useSportsPage()
const layoutStore = useLayoutStore()
const route = useRoute()
const { vMatchVisibility } = useMatchVisibility({
  enabled: () => !isMobile.value && stripLocalePrefix(route.path) === '/sports',
  topInset: () => layoutStore.TOPNAV_HEIGHT,
  onChange: targets => page.setVisibleMatches('pc', targets)
})
const {
  currentPage,
  totalPages,
  pagedMatches,
  setPage,
  liveMatches,
  expandedMatchId,
  betSlipOpen,
  mode,
  selections,
  parlays,
  balanceText,
  currencySymbol,
  totalStakeText,
  potentialReturnText,
  canSubmit,
  refreshing,
  focusedStakeId,
  collectOnly,
  handleMatchFavorite,
  isMatchFavoritePending,
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

// 本地模拟投注，不创建订单。
const pcSubmissionState = ref<'idle' | 'confirming' | 'success' | 'failed'>('idle')
let pcSubmitTimer: ReturnType<typeof setTimeout> | undefined

function resetPcBetResult() {
  clearTimeout(pcSubmitTimer)
  pcSubmitTimer = undefined
  pcSubmissionState.value = 'idle'
}

function submitPcMockBet() {
  if (!canSubmit.value || pcSubmissionState.value !== 'idle') return
  pcSubmissionState.value = 'confirming'
  pcSubmitTimer = setTimeout(() => {
    pcSubmitTimer = undefined
    pcSubmissionState.value = 'success'
  }, 600)
}

function finishPcBetResult() {
  if (pcSubmissionState.value === 'success') submitMockBet()
  resetPcBetResult()
}

// 按投注内容判断是否变化，避免列表刷新重置投注单。
watch(
  () =>
    JSON.stringify([
      mode.value,
      currencySymbol.value,
      selections.value.map(item => [item.id, item.stake, item.odds]),
      parlays.value.map(item => [item.id, item.stake, item.odds])
    ]),
  resetPcBetResult,
  { flush: 'sync' }
)
watch(betSlipOpen, open => {
  if (!open) finishPcBetResult()
})
watch(isMobile, mobile => {
  if (mobile) resetPcBetResult()
})
onDeactivated(resetPcBetResult)
onScopeDispose(resetPcBetResult)

function showPcUnsupported(action: 'settings' | 'editAmounts' | 'history' | 'share') {
  if (action === 'history' || action === 'share') {
    globalShowToast('This is a local simulation. No real bet record was created.')
    return
  }
  showUnsupported()
}

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
