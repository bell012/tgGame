<template>
  <div class="detail-page w-full h-full max-w-[1248px] mx-auto pt-[60px] px-[12px]">
    <div v-if="isGameDataLoading" class="detail-loading-mask" aria-live="polite" aria-busy="true">
      <div class="detail-loading-spinner"></div>
    </div>
    <h5-header class="block sm:hidden">{{ currentGameDetail?.itemName ?? '' }}</h5-header>
    <h5-currency-info v-if="isMobile"></h5-currency-info>
    <desktop-currency-info v-else></desktop-currency-info>
    <recent-games></recent-games>
    <game-list
      v-if="currentCategoryHotGameList.length > 0"
      :title="t('home.RecommendedGames')"
      :list="currentCategoryHotGameList"
      @all-click="openCurrentCategoryAllGamesPage"
    ></game-list>
    <bets-list></bets-list>
  </div>
  <CommonFooter class="hidden sm:block mt-[40px]" />
</template>
<script setup lang="ts">
import Api from '@/api'
import CommonFooter from '@/components/commonFooter.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateTo } from '@/utils/router'
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import H5Header from './h5/header.vue'
import H5CurrencyInfo from './h5/currency-info/index.vue'
import DesktopCurrencyInfo from './desktop/currency-info/index.vue'
import BetsList from './common/bets-list/index.vue'
import RecentGames from './common/recent-games/index.vue'
import GameList from './common/game-list/index.vue'

type GameDataItem = {
  itemCode?: string | number
  platformCode?: string
  sysGameTypeCode?: string
  platformName?: string
  hot?: number | string
  icon2?: string
  conUrl?: string
  initScoreNum?: number | string
  gameItemHotVo?: {
    defaultImage?: string
    hot?: number | string
  }
}

type GameDataProvider = {
  subGame?: GameDataItem[]
}

type GameDataSection = {
  sysGameTypeCode?: string
  sysGameTypeName?: string
  subGame?: GameDataProvider[]
}

type GameDetailCacheGlobal = {
  __gameDetailGameDataCache__?: GameDataSection[]
  __gameDetailAllListCache__?: GameDataItem[]
  __gameDetailAllPageTitleCache__?: string
}

type CurrentGameDetail =
  | ({
      rowId?: string | number
      itemName?: string
      platformName?: string
      sysGameTypeName?: string
      sysGameTypeCode?: string
    } & Record<string, unknown>)
  | null

const gameDetailCacheGlobal = globalThis as typeof globalThis & GameDetailCacheGlobal

const gameData = ref<GameDataSection[]>([])
provide('game-detail-game-data', gameData)

const { t } = useI18n()

const isMobile = useIsMobile()
const route = useRoute()
const isGameDataLoading = ref(false)

const getQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

const rowId = computed(() => getQueryValue(route.params.rowId))
const currentGameDetailState = ref<CurrentGameDetail>(null)

const currentGameDetail = computed<CurrentGameDetail>(() => currentGameDetailState.value)

provide('game-detail-current-game', currentGameDetail)

const currentGameTypeCode = computed(() => getQueryValue(currentGameDetail.value?.sysGameTypeCode))

const currentCategoryHotGameList = computed<GameDataItem[]>(() => {
  const targetTypeCode = currentGameTypeCode.value
  if (!targetTypeCode) {
    return []
  }

  const targetSection = gameData.value.find(
    section => getQueryValue(section?.sysGameTypeCode) === targetTypeCode
  )
  if (!targetSection) {
    return []
  }

  const providerList = Array.isArray(targetSection.subGame) ? targetSection.subGame : []
  const allGames = providerList.flatMap(provider =>
    Array.isArray(provider?.subGame) ? provider.subGame : []
  )

  return allGames.filter(game => {
    const hotValue = game.gameItemHotVo?.hot ?? game.hot
    return Number(hotValue) === 1
  })
})

const getCurrentGameDetailByApi = async () => {
  const targetRowId = rowId.value

  try {
    const res = await Api.game.queryGameDetails(
      { rowId: targetRowId },
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    const result = res?.result
    if (result && typeof result === 'object') {
      currentGameDetailState.value = result as CurrentGameDetail
    }
  } catch (error) {
    console.error('getCurrentGameDetailByApi failed', error)
  }
}

const openCurrentCategoryAllGamesPage = () => {
  const nextList = Array.isArray(currentCategoryHotGameList.value)
    ? [...currentCategoryHotGameList.value]
    : []
  const pageTitle = getQueryValue(
    currentGameDetail.value?.platformName ?? currentGameDetail.value?.itemName
  )

  gameDetailCacheGlobal.__gameDetailAllListCache__ = nextList
  gameDetailCacheGlobal.__gameDetailAllPageTitleCache__ = pageTitle

  navigateTo('/game/detail/recommended', {
    query: {
      ...(getQueryValue(currentGameDetail.value?.rowId)
        ? { rowId: getQueryValue(currentGameDetail.value?.rowId) }
        : {}),
      ...(currentGameTypeCode.value ? { sysGameTypeCode: currentGameTypeCode.value } : {}),
      ...(pageTitle ? { title: pageTitle } : {})
    }
  })
}

const getGameDataForApp = async () => {
  const cachedList = gameDetailCacheGlobal.__gameDetailGameDataCache__
  if (Array.isArray(cachedList) && cachedList.length) {
    gameData.value = cachedList
    return
  }

  isGameDataLoading.value = true
  try {
    const res = await Api.home.getGameData({
      showSuccessToast: false,
      showErrorToast: true
    })
    const nextList = Array.isArray(res?.result) ? (res.result as GameDataSection[]) : []
    gameData.value = nextList
    gameDetailCacheGlobal.__gameDetailGameDataCache__ = nextList
  } catch (error) {
    console.error('getGameDataForApp failed', error)
    gameData.value = []
  } finally {
    isGameDataLoading.value = false
  }
}

watch(
  rowId,
  () => {
    void getCurrentGameDetailByApi()
  },
  { immediate: true, flush: 'post' }
)

onMounted(async () => {
  await getGameDataForApp()
})
</script>
<style scoped lang="scss">
.detail-page {
  position: relative;
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
</style>
