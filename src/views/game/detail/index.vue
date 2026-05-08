<template>
  <div
    ref="detailPageRef"
    class="detail-page w-full max-w-[1248px] mx-auto pt-[14px] sm:pt-[20px] px-[12px] pb-[20px] sm:pb-[24px]"
  >
    <!-- Loading -->
    <div v-if="isGameDataLoading" class="detail-loading-mask" aria-live="polite" aria-busy="true">
      <div class="detail-loading-spinner" />
    </div>
    <!-- Header -->
    <h5-header class="block sm:hidden">
      {{ currentGameDetail?.itemName ?? '' }}
    </h5-header>
    <!-- Currency Info -->
    <template v-if="isMobile">
      <h5-currency-info />
    </template>
    <template v-else>
      <desktop-currency-info />
    </template>
    <!-- Game Content -->
    <recent-games />
    <template v-if="hasCurrentCategoryHotGames">
      <game-list
        :title="t('home.RecommendedGames')"
        :list="currentCategoryHotGameList"
        @all-click="openCurrentCategoryAllGamesPage"
      />
    </template>
    <bets-list />
  </div>
  <!-- Footer -->
  <CommonFooter class="hidden sm:block mt-[40px]" />
</template>
<script setup lang="ts">
import Api from '@/api'
import CommonFooter from '@/components/commonFooter.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateTo } from '@/utils/router'
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  normalizeGameDetailValue,
  splitGameTypeCodes,
  queryGameDetailRecommendedItems
} from './shared'
import H5Header from './h5/header.vue'
import H5CurrencyInfo from './h5/currency-info/index.vue'
import DesktopCurrencyInfo from './desktop/currency-info/index.vue'
import BetsList from './common/bets-list/index.vue'
import RecentGames from './common/recent-games/index.vue'
import GameList from './common/game-list/index.vue'

type GameDataItem = {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
  gameTypeCode?: string
  sysGameTypeCode?: string
  itemName?: string
  platformName?: string
  hot?: number | string
  icon2?: string
  conUrl?: string
  initScoreNum?: number | string
  subGame?: GameDataItem[]
  gameItemHotVo?: {
    defaultImage?: string
    hot?: number | string
  }
}

type CurrentGameDetail =
  | ({
      rowId?: string | number
      itemCode?: string | number
      platformCode?: string
      itemName?: string
      platformName?: string
      gameTypeCode?: string
      sysGameTypeName?: string
      sysGameTypeCode?: string
    } & Record<string, unknown>)
  | null

// ===== 常量 =====
const API_REQUEST_OPTIONS = {
  showSuccessToast: false,
  showErrorToast: true
} as const

// ===== 基础状态 =====
const gameData = ref<GameDataItem[]>([])
provide('game-detail-game-data', gameData)

const { t } = useI18n()
const isMobile = useIsMobile()
const route = useRoute()
const isGameDataLoading = ref(false)
const currentGameDetailState = ref<CurrentGameDetail>(null)
const detailPageRef = ref<HTMLElement | null>(null)
const isBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined'
let scrollbarHiddenParent: HTMLElement | null = null

const clearParentScrollbarHidden = () => {
  if (!scrollbarHiddenParent) {
    return
  }
  scrollbarHiddenParent.classList.remove('game-detail-hide-scrollbar')
  scrollbarHiddenParent = null
}

const hideParentScrollbar = () => {
  if (!isBrowserEnv) {
    return
  }

  clearParentScrollbarHidden()

  let currentParent = detailPageRef.value?.parentElement ?? null
  while (currentParent) {
    const { overflowY } = window.getComputedStyle(currentParent)
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll'
    if (isScrollable) {
      currentParent.classList.add('game-detail-hide-scrollbar')
      scrollbarHiddenParent = currentParent
      return
    }
    currentParent = currentParent.parentElement
  }
}

const resetScrollToTop = () => {
  if (!isBrowserEnv) {
    // iOS / WebView fallback
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    return
  }

  let currentParent = detailPageRef.value?.parentElement ?? null
  while (currentParent) {
    const { overflowY } = window.getComputedStyle(currentParent)
    const isScrollable =
      (overflowY === 'auto' || overflowY === 'scroll') &&
      currentParent.scrollHeight > currentParent.clientHeight
    if (isScrollable) {
      if (typeof currentParent.scrollTo === 'function') {
        currentParent.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        currentParent.scrollTop = 0
      }
      return
    }
    currentParent = currentParent.parentElement
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}

// ===== 工具函数 =====
const buildRecommendedPageQuery = (pageTitle: string) => {
  return {
    ...(currentGameRowId.value ? { rowId: currentGameRowId.value } : {}),
    ...(pageTitle ? { title: pageTitle } : {})
  }
}

// ===== 派生状态 =====
const rowId = computed(() => normalizeGameDetailValue(route.params.rowId))
const currentGameDetail = computed<CurrentGameDetail>(() => currentGameDetailState.value)
provide('game-detail-current-game', currentGameDetail)

const currentGameRowId = computed(() =>
  normalizeGameDetailValue(currentGameDetail.value?.rowId ?? rowId.value)
)
const isGameTypeCodeMatched = (targetGameTypeCode: unknown, candidateGameTypeCode: unknown) => {
  const targetCodeList = splitGameTypeCodes(targetGameTypeCode)
  const candidateCodeList = splitGameTypeCodes(candidateGameTypeCode)

  if (targetCodeList.length === 0 || candidateCodeList.length === 0) {
    return false
  }

  const targetCodeSet = new Set(targetCodeList)
  return candidateCodeList.some(code => targetCodeSet.has(code))
}

const currentCategoryHotGameList = computed<GameDataItem[]>(() => {
  const sourceList = gameData.value as unknown as GameDataItem[]
  const targetGameTypeCode = currentGameDetail.value?.gameTypeCode
  const excludeRowId = normalizeGameDetailValue(currentGameRowId.value)

  if (!targetGameTypeCode) {
    return sourceList
  }

  return sourceList.filter(item => {
    if (excludeRowId && normalizeGameDetailValue(item.rowId) === excludeRowId) {
      return false
    }

    return isGameTypeCodeMatched(targetGameTypeCode, item.gameTypeCode)
  })
})

const hasCurrentCategoryHotGames = computed(() => currentCategoryHotGameList.value.length > 0)

// ===== 数据请求 =====
const fetchCurrentGameDetail = async () => {
  const targetRowId = rowId.value

  try {
    const res = await Api.game.queryGameDetails({ rowId: targetRowId }, API_REQUEST_OPTIONS)
    const result = res?.result
    if (result && typeof result === 'object') {
      currentGameDetailState.value = result as CurrentGameDetail
    }
  } catch (error) {
    console.error('getCurrentGameDetailByApi failed', error)
  } finally {
    await nextTick()
    hideParentScrollbar()
    resetScrollToTop()
  }
}

const fetchGameDataForApp = async () => {
  isGameDataLoading.value = true
  try {
    gameData.value = (await queryGameDetailRecommendedItems()) as unknown as GameDataItem[]
  } catch (error) {
    console.error('queryGameItemPage for game detail failed', error)
    gameData.value = []
  } finally {
    isGameDataLoading.value = false
    await nextTick()
    hideParentScrollbar()
  }
}

// ===== 页面动作 =====
const openCurrentCategoryAllGamesPage = () => {
  navigateTo('/game/detail/recommended', {
    query: buildRecommendedPageQuery(t('home.RecommendedGames'))
  })
}

// ===== 监听与生命周期 =====
watch(
  rowId,
  () => {
    void fetchCurrentGameDetail()
  },
  { immediate: true, flush: 'post' }
)

onMounted(async () => {
  await fetchGameDataForApp()
  await nextTick()
  hideParentScrollbar()
})

onUnmounted(() => {
  clearParentScrollbarHidden()
})
</script>
<style scoped lang="scss">
.detail-page {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.detail-page::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.detail-loading-mask {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 12, 18, 0.36);
  backdrop-filter: blur(1px);
}

.detail-loading-spinner {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.34);
  border-top-color: #fff;
  animation: detail-loading-spin 0.8s linear infinite;
}

:global(:root.light) .detail-page .detail-loading-spinner {
  border-color: rgba(27, 36, 49, 0.24);
  border-top-color: #1b2431;
}

@keyframes detail-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.game-detail-hide-scrollbar) {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

:global(.game-detail-hide-scrollbar::-webkit-scrollbar) {
  width: 0;
  height: 0;
  display: none;
}
</style>
