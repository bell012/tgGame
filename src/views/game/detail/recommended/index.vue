<template>
  <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
    <H5Header :title="pageTitle" disable-default-back @back="handleBack" />
    <div
      ref="mobileScrollRef"
      class="recommended-page-mobile__body flex-1 min-h-0 overflow-y-auto px-2.5 pt-2.5 pb-4 sm:px-4"
    >
      <ResponsiveGridPager
        v-if="!isPageLoading"
        :items="pagedGameList"
        v-model:page="page"
        :total-pages="totalPages"
        key-field="rowId"
      >
        <template #item="{ item }">
          <div class="w-full aspect-[330/438]">
            <casinoGameCard
              class="size-full text-left"
              :game="toCasinoCardGame(item)"
              @click="handleGameClick(item)"
            />
          </div>
        </template>
      </ResponsiveGridPager>
      <div v-else class="grid w-full grid-cols-3 gap-[11px]" aria-busy="true">
        <div
          v-for="index in mobileSkeletonCount"
          :key="`mobile-skeleton-${index}`"
          class="aspect-[330/438] rounded-lg bg-bg-2 animate-pulse"
        ></div>
      </div>
      <div
        v-if="isPageLoading"
        class="recommended-page-loading-mask"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="recommended-page-loading-spinner" />
      </div>
    </div>
  </div>

  <div v-else class="recommended-page-pc">
    <div class="recommended-page-pc__container">
      <div class="recommended-page-pc__header">
        <button type="button" class="recommended-page-pc__back-btn" @click="handleBack">
          <ArrowLeftIcon class="h-3.5 w-3.5 text-text-1" />
        </button>
        <h1 class="recommended-page-pc__title">{{ pageTitle }}</h1>
      </div>

      <div class="recommended-page-pc__body">
        <ResponsiveGridPager
          v-if="!isPageLoading"
          class="recommended-page-pc__pager"
          :items="pagedGameList"
          v-model:page="page"
          :total-pages="totalPages"
          key-field="rowId"
        >
          <template #item="{ item }">
            <div class="w-full aspect-[330/438] sm:aspect-auto sm:h-[213px] sm:w-[160px]">
              <casinoGameCard
                class="size-full text-left"
                :game="toCasinoCardGame(item)"
                @click="handleGameClick(item)"
              />
            </div>
          </template>
        </ResponsiveGridPager>
        <div v-else class="recommended-page-pc__skeleton-grid" aria-busy="true">
          <div
            v-for="index in pcSkeletonCount"
            :key="`pc-skeleton-${index}`"
            class="recommended-page-pc__skeleton-card bg-bg-2 animate-pulse"
          ></div>
        </div>
        <div
          v-if="isPageLoading"
          class="recommended-page-loading-mask"
          aria-live="polite"
          aria-busy="true"
        >
          <div class="recommended-page-loading-spinner" />
        </div>
      </div>
    </div>
    <CommonFooter class="mt-[40px]" />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import H5Header from '@/components/common/H5Header.vue'
import CommonFooter from '@/components/commonFooter.vue'
import ResponsiveGridPager from '@/components/common/ResponsiveGridPager.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useGameStore } from '@/stores/game'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { navigateTo } from '@/utils/router'
import { navigateToName } from '@/utils/router'
import { computed, nextTick, onActivated, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { GameDataItem as CasinoCardGameDataItem } from '@/api/interface/game'
import casinoGameCard from '@/components/explore/casinoGameCard.vue'
import {
  normalizeGameDetailValue,
  queryGameDetailRecommendedItems,
  splitGameTypeCodes
} from '../shared'

type GameDataItem = {
  rowId?: string | number
  brandCode?: string
  itemCode?: string | number
  platformCode?: string
  itemName?: string
  platformName?: string
  gameTypeCode?: string
  sysGameTypeCode?: string
  rowType?: number | string
  initScoreNum?: number | string
  hot?: number | string
  icon2?: string
  icon1?: string
  icon3?: string
  icon4?: string
  conUrl?: string
  recommendPicInfo?: string
  hotPicInfo?: string
  stylePicInfo?: string
  subGame?: GameDataItem[]
  gameItemHotVo?: {
    defaultImage?: string
    hot?: number | string
  }
}

const PAGE_SIZE = 40
const MOBILE_SKELETON_COUNT = 12
const PC_SKELETON_COUNT = 24
const isMobile = useIsMobile()
const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const { t } = useI18n()

const page = ref(1)
const gameList = ref<GameDataItem[]>([])
const isPageLoading = ref(true)
const mobileScrollRef = ref<HTMLElement | null>(null)
const defaultPageTitle = computed(() => t('home.RelatedGames'))
const pageTitle = computed(() => defaultPageTitle.value)

const totalPages = computed(() => Math.max(1, Math.ceil(gameList.value.length / PAGE_SIZE)))
const sourceRowId = computed(() => normalizeGameDetailValue(route.query.rowId))
const sourcePlatformCode = computed(() => normalizeGameDetailValue(route.query.platformCode))
const sourceBrandCode = computed(() => {
  const queryBrandCode = normalizeGameDetailValue(route.query.brandCode)
  if (queryBrandCode) {
    return queryBrandCode
  }

  return sourcePlatformCode.value.split('_')[0]?.trim() ?? ''
})
const currentGameTypeCode = ref('')
const mobileSkeletonCount = MOBILE_SKELETON_COUNT
const pcSkeletonCount = PC_SKELETON_COUNT

const pagedGameList = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return gameList.value.slice(start, start + PAGE_SIZE)
})

const resolveGameImagePath = (item: GameDataItem) => {
  return String(item.icon4 ?? '').trim()
}

const isGameTypeCodeMatched = (targetGameTypeCode: unknown, candidateGameTypeCode: unknown) => {
  const targetCodeList = splitGameTypeCodes(targetGameTypeCode)
  const candidateCodeList = splitGameTypeCodes(candidateGameTypeCode)

  if (targetCodeList.length === 0 || candidateCodeList.length === 0) {
    return false
  }

  const targetCodeSet = new Set(targetCodeList)
  return candidateCodeList.some(code => targetCodeSet.has(code))
}

const fetchCurrentGameTypeCode = async () => {
  if (!sourceRowId.value) {
    currentGameTypeCode.value = ''
    return
  }

  try {
    const res = await Api.game.queryGameDetails(
      { rowId: sourceRowId.value },
      { showSuccessToast: false, showErrorToast: true }
    )
    currentGameTypeCode.value = normalizeGameDetailValue(res?.result?.gameTypeCode)
  } catch (error) {
    console.error('fetchCurrentGameTypeCode failed', error)
    currentGameTypeCode.value = ''
  }
}

const toCasinoCardGame = (item: GameDataItem): CasinoCardGameDataItem => {
  const initScoreNum = Number(item.initScoreNum ?? 0)
  const imagePath = resolveGameImagePath(item)

  return {
    ...(item as Record<string, unknown>),
    rowId: Number(item.rowId ?? 0),
    itemName: String(item.itemName ?? item.platformName ?? '').trim(),
    icon2: imagePath,
    conUrl: imagePath,
    initScoreNum,
    // 保持本页历史表现：人数显示接近 initScoreNum（避免 card 内随机区间影响）
    initScoreStar: initScoreNum
  } as CasinoCardGameDataItem
}

const initPageData = async () => {
  isPageLoading.value = true
  try {
    await fetchCurrentGameTypeCode()

    const excludeRowId = sourceRowId.value
    const targetBrandCode = sourceBrandCode.value
    const targetPlatformCode = sourcePlatformCode.value
    const targetGameTypeCode = currentGameTypeCode.value

    if (targetBrandCode) {
      const providerGames = (await gameStore.queryGameData({
        rowType: 3,
        brandCodes: [targetBrandCode]
      })) as unknown as GameDataItem[]

      gameList.value = providerGames.filter(
        item => !excludeRowId || normalizeGameDetailValue(item.rowId) !== excludeRowId
      )
      return
    }

    const sourceList = (await queryGameDetailRecommendedItems()) as unknown as GameDataItem[]

    if (targetPlatformCode) {
      gameList.value = sourceList.filter(item => {
        if (excludeRowId && normalizeGameDetailValue(item.rowId) === excludeRowId) {
          return false
        }

        return normalizeGameDetailValue(item.platformCode) === targetPlatformCode
      })
      return
    }

    if (!targetGameTypeCode) {
      gameList.value = sourceList.filter(
        item => !excludeRowId || normalizeGameDetailValue(item.rowId) !== excludeRowId
      )
      return
    }

    gameList.value = sourceList.filter(item => {
      if (excludeRowId && normalizeGameDetailValue(item.rowId) === excludeRowId) {
        return false
      }

      return isGameTypeCodeMatched(targetGameTypeCode, item.gameTypeCode)
    })
  } catch (error) {
    console.error('initPageData failed', error)
    gameList.value = []
  } finally {
    isPageLoading.value = false
  }
}

const handleGameClick = (item: GameDataItem) => {
  navigateToName('gameDetail', { params: { rowId: item.rowId } })
}

const handleBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
    return
  }

  if (sourceRowId.value) {
    navigateToName('gameDetail', {
      replace: true,
      params: {
        rowId: sourceRowId.value
      }
    })
    return
  }

  navigateTo('/')
}

const resetPageScrollTop = async () => {
  await nextTick()
  mobileScrollRef.value?.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
}

onMounted(() => {
  void resetPageScrollTop()
})

onActivated(() => {
  void resetPageScrollTop()
})

watch(
  [sourceRowId, sourcePlatformCode, sourceBrandCode],
  () => {
    page.value = 1
    void resetPageScrollTop()
    void initPageData()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.recommended-page-pc {
  width: 100%;
  min-height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.recommended-page-pc__container {
  flex: 1;
  width: 100%;
  max-width: none;
  margin: 0;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recommended-page-pc__header {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 14px;
  width: min(100%, 1350px);
  box-sizing: border-box;
}

.recommended-page-pc__back-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-opacity-10);
}

.recommended-page-pc__title {
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  color: var(--color-text-level-1);
  text-align: left;
}

.recommended-page-pc__body {
  position: relative;
  padding: 12px 14px 18px;
  min-height: 0;
  width: min(100%, 1350px);
  box-sizing: border-box;
}

.recommended-page-pc__pager {
  width: 100%;
}

.recommended-page-pc__pager :deep(.sm\:grid-cols-8) {
  grid-template-columns: repeat(8, 160px);
}

.recommended-page-pc__pager :deep(.grid) {
  gap: 10px;
  width: fit-content;
  max-width: 100%;
  margin-inline: auto;
}

.recommended-page-pc__skeleton-grid {
  display: grid;
  grid-template-columns: repeat(8, 160px);
  gap: 10px;
  width: fit-content;
  max-width: 100%;
  margin-inline: auto;
}

.recommended-page-pc__skeleton-card {
  width: 160px;
  height: 213px;
  border-radius: 8px;
}

.recommended-page-mobile__body {
  position: relative;
}

.recommended-page-loading-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 12, 18, 0.36);
  backdrop-filter: blur(1px);
}

.recommended-page-loading-spinner {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.34);
  border-top-color: #fff;
  animation: recommended-page-loading-spin 0.8s linear infinite;
}

@keyframes recommended-page-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(:root.light) .recommended-page-loading-spinner {
  border-color: rgba(27, 36, 49, 0.24);
  border-top-color: #1b2431;
}
</style>
