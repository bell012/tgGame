<template>
  <div
    :class="
      isMobile
        ? 'game-detail-mobile fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1'
        : ''
    "
  >
    <h5-header v-if="isMobile" class="shrink-0">
      {{ currentGameDetail?.itemName ?? '' }}
    </h5-header>
    <div
      ref="detailPageRef"
      class="detail-page w-full max-w-[1248px] mx-auto pt-[14px] sm:pt-[20px] px-[12px] pb-[20px] sm:pb-[24px]"
      :class="
        isMobile
          ? 'min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain'
          : ''
      "
    >
      <!-- Loading -->
      <div v-if="isGameDataLoading" class="detail-loading-mask" aria-live="polite" aria-busy="true">
        <div class="detail-loading-spinner" />
      </div>
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
  </div>
  <!-- Footer -->
  <CommonFooter class="hidden sm:block mt-[40px]" />
</template>
<script setup lang="ts">
import '@/views/game/detail/styles/colors.css'
import Api from '@/api'
import { readIsCollections } from '@/api/interface/game'
import CommonFooter from '@/components/commonFooter.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useGameStore } from '@/stores/game'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { navigateTo } from '@/utils/router'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BetsList from './common/bets-list/index.vue'
import GameList from './common/game-list/index.vue'
import RecentGames from './common/recent-games/index.vue'
import DesktopCurrencyInfo from './desktop/currency-info/index.vue'
import H5CurrencyInfo from './h5/currency-info/index.vue'
import H5Header from './h5/header.vue'
import {
  calculateGameDetailRtp,
  parseCollectionsCount,
  findGameDetailItemByIdentity,
  isValidGameDetailResult,
  normalizeGameDetailRecord,
  normalizeGameDetailValue,
  queryGameDetailRecommendedItems,
  splitGameTypeCodes
} from './shared'

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

// ===== 组合式依赖 =====
const { t } = useI18n()
const props = defineProps<{ rowId: string }>()
const isMobile = useIsMobile()
const localeStore = useLocaleStore()
const userStore = useUserStore()
const gameStore = useGameStore()
const { currentLanguage } = storeToRefs(localeStore)

// ===== 基础状态 =====
const detailPageRef = ref<HTMLElement | null>(null)
const gameData = ref<GameDataItem[]>([])
const isGameDataLoading = ref(false)
const currentGameDetailState = ref<CurrentGameDetail>(null)

/** 与 getCommentSubject.result.isCollections 同步，供收藏星标 inject */
const gameDetailSubjectIsCollections = ref<boolean | null>(null)
const gameDetailCollectionsCount = ref<number | null>(null)
const gameDetailRtp = ref<number | null>(null)
let favoriteRequestVersion = 0

// ===== provide =====
provide('game-detail-game-data', gameData)
provide('game-detail-subject-is-collections', gameDetailSubjectIsCollections)
provide('game-detail-collections-count', gameDetailCollectionsCount)
provide('game-detail-rtp', gameDetailRtp)

// ===== 滚动条状态 =====
const isBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined'
let scrollbarHiddenParent: HTMLElement | null = null

// ===== 滚动条处理 =====
const clearParentScrollbarHidden = () => {
  if (!scrollbarHiddenParent) {
    return
  }

  scrollbarHiddenParent.classList.remove('game-detail-hide-scrollbar')
  scrollbarHiddenParent = null
}

const hideParentScrollbar = () => {
  if (!isBrowserEnv || isMobile.value) {
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

// ===== 工具函数 =====
const isGameTypeCodeMatched = (targetGameTypeCode: unknown, candidateGameTypeCode: unknown) => {
  const targetCodeList = splitGameTypeCodes(targetGameTypeCode)
  const candidateCodeList = splitGameTypeCodes(candidateGameTypeCode)

  if (targetCodeList.length === 0 || candidateCodeList.length === 0) {
    return false
  }

  const targetCodeSet = new Set(targetCodeList)
  return candidateCodeList.some(code => targetCodeSet.has(code))
}

const buildRecommendedPageQuery = (pageTitle: string) => {
  return {
    ...(currentGameRowId.value ? { rowId: currentGameRowId.value } : {}),
    ...(pageTitle ? { title: pageTitle } : {})
  }
}

// ===== 派生状态 =====
const rowId = computed(() => normalizeGameDetailValue(props.rowId))
const currentGameDetail = computed<CurrentGameDetail>(() => currentGameDetailState.value)
const currentGameRowId = computed(() =>
  normalizeGameDetailValue(currentGameDetail.value?.rowId ?? rowId.value)
)

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

provide('game-detail-current-game', currentGameDetail)
provide('game-detail-row-id', rowId)

// ===== 数据同步 =====
const syncFavoriteFromCommentSubject = async (gameIdRaw: string) => {
  if (!gameIdRaw || gameIdRaw !== rowId.value) {
    return
  }

  userStore.syncStoredUserData()
  const version = ++favoriteRequestVersion
  const session = userStore.userInfo?.tradeToken
  const memberRowIdNum = Number(userStore.acctInfo?.memberRowId)
  const isCurrent = () =>
    version === favoriteRequestVersion &&
    gameIdRaw === rowId.value &&
    session === userStore.userInfo?.tradeToken &&
    Object.is(memberRowIdNum, Number(userStore.acctInfo?.memberRowId))

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
    if (!isCurrent()) return
    ensureApiBusinessSuccess(res)
    gameDetailSubjectIsCollections.value = readIsCollections(res.result?.isCollections)
    gameDetailCollectionsCount.value = parseCollectionsCount(res.result?.collectionsCount)
  } catch {
    if (isCurrent()) gameDetailCollectionsCount.value = null
  }
}
provide('game-detail-refresh-favorite', () => syncFavoriteFromCommentSubject(rowId.value))

// ===== 数据请求 =====
const fetchCurrentGameDetail = async () => {
  const targetRowId = rowId.value
  favoriteRequestVersion += 1
  gameDetailSubjectIsCollections.value = null
  gameDetailCollectionsCount.value = null

  try {
    const res = await Api.game.queryGameDetails({ rowId: targetRowId }, API_REQUEST_OPTIONS)
    const result = res?.result
    const listData = (await gameStore.ensureGameData()) as unknown as GameDataItem[]
    const fallbackItem = findGameDetailItemByIdentity(listData, { rowId: targetRowId })

    if (isValidGameDetailResult(result)) {
      currentGameDetailState.value = normalizeGameDetailRecord(
        fallbackItem ?? undefined,
        result
      ) as CurrentGameDetail
    } else if (fallbackItem) {
      currentGameDetailState.value = normalizeGameDetailRecord(fallbackItem) as CurrentGameDetail
    } else {
      currentGameDetailState.value = null
    }
  } catch (error) {
    console.error('getCurrentGameDetailByApi failed', error)
  } finally {
    await nextTick()
    hideParentScrollbar()
    if (isMobile.value && detailPageRef.value) detailPageRef.value.scrollTop = 0
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

// ===== 监听 =====
watch(
  () => [currentGameDetail.value?.rtpMin, currentGameDetail.value?.rtpMax] as const,
  ([min, max]) => {
    gameDetailRtp.value = calculateGameDetailRtp(min, max)
  },
  { immediate: true }
)

watch([() => userStore.userInfo?.tradeToken, () => userStore.acctInfo?.memberRowId], () => {
  gameDetailSubjectIsCollections.value = null
  gameDetailCollectionsCount.value = null
  void syncFavoriteFromCommentSubject(rowId.value)
})

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

// ===== 生命周期 =====
onMounted(async () => {
  await nextTick()
  hideParentScrollbar()
})

onUnmounted(() => {
  favoriteRequestVersion += 1
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

@media (max-width: 767px) {
  .detail-page {
    -webkit-overflow-scrolling: touch;
  }
}

.detail-loading-mask {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-detail-loading-mask);
  backdrop-filter: blur(1px);
}

.detail-loading-spinner {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 3px solid var(--color-detail-loading-track);
  border-top-color: var(--color-common-100);
  animation: detail-loading-spin 0.8s linear infinite;
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
