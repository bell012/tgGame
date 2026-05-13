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
    <h5-header class="block sm:hidden"> {{ currentGameDetail?.itemName ?? '' }} </h5-header>
    <!-- Currency Info -->
    <h5-currency-info v-if="isMobile" /> <desktop-currency-info v-else />
    <!-- Game Content -->
    <recent-games />
    <!-- 推荐游戏 -->
    <game-list
      v-if="hasCurrentCategoryHotGames"
      :title="t('home.RecommendedGames')"
      :list="currentCategoryHotGameList"
      @all-click="openCurrentCategoryAllGamesPage"
    />
    <!-- 投注表格 -->
    <bets-list />
  </div>
  <!-- Footer -->
  <CommonFooter class="hidden sm:block mt-[40px]" />
</template>
<script setup lang="ts">
import Api from '@/api'
import { readIsCollections } from '@/api/interface/game'
import CommonFooter from '@/components/commonFooter.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { navigateTo } from '@/utils/router'
import { storeToRefs } from 'pinia'
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

/** 与 getCommentSubject.result.isCollections 同步，供收藏星标 inject */
const gameDetailSubjectIsCollections = ref<boolean | null>(null)
provide('game-detail-subject-is-collections', gameDetailSubjectIsCollections)

const { t } = useI18n()
const isMobile = useIsMobile()
const route = useRoute()
const localeStore = useLocaleStore()
const userStore = useUserStore()
const { currentLanguage } = storeToRefs(localeStore)
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

const syncFavoriteFromCommentSubject = async (gameIdRaw: string) => {
  gameDetailSubjectIsCollections.value = null
  if (!gameIdRaw) {
    return
  }

  userStore.syncStoredUserData()
  const memberRowIdNum = Number(userStore.acctInfo?.memberRowId)

  try {
    const res = await Api.game.getCommentSubject(
      {
        gameId: gameIdRaw,
        sortType: 1,
        ...(Number.isFinite(memberRowIdNum) && memberRowIdNum > 0
          ? { memberRowId: memberRowIdNum }
          : {})
      },
      {
        showSuccessToast: false,
        showErrorToast: false
      }
    )
    const raw = (res?.result as { isCollections?: unknown } | null | undefined)?.isCollections
    gameDetailSubjectIsCollections.value = readIsCollections(raw)
  } catch {
    gameDetailSubjectIsCollections.value = null
  }
}

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
  gameDetailSubjectIsCollections.value = null

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
    if (targetRowId) {
      void syncFavoriteFromCommentSubject(targetRowId)
    }
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
  [rowId],
  () => {
    void fetchCurrentGameDetail()
    void fetchGameDataForApp()
  },
  { immediate: true, flush: 'post' }
)

watch(
  [currentLanguage],
  ([newLanguage], [oldLanguage]) => {
    if (!oldLanguage || newLanguage === oldLanguage) return

    void navigateTo('/', { replace: true })
  },
  { immediate: true, flush: 'post' }
)

onMounted(async () => {
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
