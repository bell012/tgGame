<template>
  <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
    <H5Header :title="pageTitle" disable-default-back @back="handleBack" />
    <div class="flex-1 min-h-0 overflow-y-auto px-2.5 pt-2.5 pb-4 sm:px-4">
      <ResponsiveGridPager
        :items="pagedGameList"
        v-model:page="page"
        :total-pages="totalPages"
        key-field="rowId"
      >
        <template #item="{ item }">
          <casinoGameCard
            class="w-full text-left"
            :game="toCasinoCardGame(item)"
            @click="handleGameClick(item)"
          />
        </template>
      </ResponsiveGridPager>
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
          class="recommended-page-pc__pager"
          :items="pagedGameList"
          v-model:page="page"
          :total-pages="totalPages"
          key-field="rowId"
        >
          <template #item="{ item }">
            <casinoGameCard
              class="w-full text-left"
              :game="toCasinoCardGame(item)"
              @click="handleGameClick(item)"
            />
          </template>
        </ResponsiveGridPager>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import H5Header from '@/components/common/H5Header.vue'
import ResponsiveGridPager from '@/components/common/ResponsiveGridPager.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { navigateTo } from '@/utils/router'
import { navigateToName } from '@/utils/router'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { GameDataItem as CasinoCardGameDataItem } from '@/api/interface/game'
import casinoGameCard from '@/views/fun/casino/components/casinoGameCard.vue'

type GameDataItem = {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
  itemName?: string
  platformName?: string
  sysGameTypeCode?: string
  initScoreNum?: number | string
  hot?: number | string
  icon2?: string
  conUrl?: string
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
  subGame?: GameDataProvider[]
}

type GameDetailCurrent = {
  sysGameTypeCode?: string
  platformName?: string
}

type GameDetailCacheGlobal = {
  __gameDetailGameDataCache__?: GameDataSection[]
  __gameDetailAllListCache__?: GameDataItem[]
  __gameDetailAllPageTitleCache__?: string
}

const PAGE_SIZE = 40
const isMobile = useIsMobile()
const route = useRoute()
const router = useRouter()
const cacheGlobal = globalThis as typeof globalThis & GameDetailCacheGlobal
const { t } = useI18n()

const page = ref(1)
const gameList = ref<GameDataItem[]>([])
const defaultPageTitle = computed(() => t('home.RecommendedGames'))
const pageTitle = ref(defaultPageTitle.value)
const isCustomPageTitle = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(gameList.value.length / PAGE_SIZE)))
const sourceRowId = computed(() => getQueryValue(route.query.rowId))

const pagedGameList = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return gameList.value.slice(start, start + PAGE_SIZE)
})

const getQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

const toCasinoCardGame = (item: GameDataItem): CasinoCardGameDataItem => {
  const initScoreNum = Number(item.initScoreNum ?? 0)
  return {
    ...(item as Record<string, unknown>),
    rowId: Number(item.rowId ?? 0),
    itemName: String(item.itemName ?? '').trim(),
    icon2: String(item.icon2 ?? item.conUrl ?? '').trim(),
    initScoreNum,
    // 保持本页历史表现：人数显示接近 initScoreNum（避免 card 内随机区间影响）
    initScoreStar: initScoreNum
  } as CasinoCardGameDataItem
}

const findGameDetailByCodes = (
  data: unknown,
  targetItemCode: string,
  targetPlatformCode: string
): GameDetailCurrent | null => {
  if (!targetItemCode || !targetPlatformCode) {
    return null
  }

  const visited = new WeakSet<object>()

  const dfs = (node: unknown): GameDetailCurrent | null => {
    if (!node || typeof node !== 'object') {
      return null
    }

    if (Array.isArray(node)) {
      for (const child of node) {
        const found = dfs(child)
        if (found) {
          return found
        }
      }
      return null
    }

    if (visited.has(node)) {
      return null
    }
    visited.add(node)

    const currentNode = node as Record<string, unknown>
    const currentItemCode = getQueryValue(currentNode.itemCode)
    const currentPlatformCode = getQueryValue(currentNode.platformCode)

    if (currentItemCode === targetItemCode && currentPlatformCode === targetPlatformCode) {
      return currentNode as GameDetailCurrent
    }

    for (const value of Object.values(currentNode)) {
      const found = dfs(value)
      if (found) {
        return found
      }
    }
    return null
  }

  return dfs(data)
}

const resolveCurrentCategoryHotGameList = (sections: GameDataSection[], typeCode: string) => {
  if (!typeCode) {
    return []
  }

  const targetSection = sections.find(
    section => getQueryValue(section?.sysGameTypeCode) === getQueryValue(typeCode)
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
}

const getGameData = async () => {
  const cacheData = cacheGlobal.__gameDetailGameDataCache__
  if (Array.isArray(cacheData) && cacheData.length > 0) {
    return cacheData
  }

  const res = await Api.home.getGameData({
    showSuccessToast: false,
    showErrorToast: true
  })
  const nextList = Array.isArray(res?.result) ? (res.result as GameDataSection[]) : []
  cacheGlobal.__gameDetailGameDataCache__ = nextList
  return nextList
}

const initPageData = async () => {
  const cacheTitle =
    getQueryValue(route.query.title) || cacheGlobal.__gameDetailAllPageTitleCache__ || ''
  const cachedList = cacheGlobal.__gameDetailAllListCache__

  if (cacheTitle) {
    pageTitle.value = cacheTitle
    isCustomPageTitle.value = true
  }

  if (Array.isArray(cachedList) && cachedList.length > 0) {
    gameList.value = [...cachedList]
    return
  }

  try {
    const sectionList = await getGameData()
    let targetTypeCode = getQueryValue(route.query.sysGameTypeCode)

    if (!targetTypeCode) {
      const currentItemCode = getQueryValue(route.query.itemCode)
      const currentPlatformCode = getQueryValue(route.query.platformCode)
      const currentGame = findGameDetailByCodes(sectionList, currentItemCode, currentPlatformCode)
      targetTypeCode = getQueryValue(currentGame?.sysGameTypeCode)
      if (!cacheTitle) {
        const platformName = getQueryValue(currentGame?.platformName)
        if (platformName) {
          pageTitle.value = platformName
          isCustomPageTitle.value = true
        }
      }
    }

    gameList.value = resolveCurrentCategoryHotGameList(sectionList, targetTypeCode)
  } catch (error) {
    console.error('initPageData failed', error)
    gameList.value = []
  }
}

const handleGameClick = (item: GameDataItem) => {
  navigateToName('gameDetail', { params: { rowId: item.rowId } })
}

const handleBack = () => {
  if (sourceRowId.value) {
    navigateToName('gameDetail', {
      replace: true,
      params: {
        rowId: sourceRowId.value
      }
    })
    return
  }

  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
    return
  }

  navigateTo('/')
}

onMounted(() => {
  void initPageData()
})

watch(defaultPageTitle, value => {
  if (!isCustomPageTitle.value) {
    pageTitle.value = value
  }
})
</script>

<style scoped lang="scss">
.recommended-page-pc {
  width: 100%;
  padding: 0;
}

.recommended-page-pc__container {
  width: 100%;
  max-width: 1248px;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-background-level-2);
}

.recommended-page-pc__header {
  position: relative;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-level-2);
  border-bottom: 1px solid var(--color-border-level-1);
}

.recommended-page-pc__back-btn {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
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
  font-size: 24px;
  line-height: 1;
  font-weight: 800;
  color: var(--color-text-level-1);
}

.recommended-page-pc__body {
  padding: 12px 14px 16px;
}

.recommended-page-pc__pager :deep(.sm\:grid-cols-8) {
  grid-template-columns: repeat(8, minmax(0, 1fr));
}

.recommended-page-pc__pager :deep(.grid) {
  gap: 10px;
}
</style>
