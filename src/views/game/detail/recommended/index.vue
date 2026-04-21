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
          <button type="button" class="game-card w-full text-left" @click="handleGameClick(item)">
            <div class="relative w-full aspect-[0.75] overflow-hidden rounded-lg">
              <gameErrImg :img="getGameImage(item)" />
              <div class="absolute inset-0 pointer-events-none game-card-shadow" />
              <div class="absolute left-2 right-2 bottom-1.5">
                <div
                  class="text-[10px] sm:text-xs font-extrabold leading-[1.05rem] text-common-100 mb-0.5"
                >
                  {{ getItemName(item) }}
                </div>
                <div class="flex items-center justify-between gap-1">
                  <div class="text-[10px] font-bold text-theme-primary truncate">
                    {{ getProviderName(item) }}
                  </div>
                  <div class="flex items-center rounded-md bg-mask-20 px-1">
                    <component :is="casinoIcons.player_count" class="size-3 fill-common-100" />
                    <span class="ml-0.5 text-[10px] font-semibold text-common-100">{{
                      toNumber(item.initScoreNum)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
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
            <button type="button" class="game-card w-full text-left" @click="handleGameClick(item)">
              <div class="game-card-media relative w-full aspect-[0.75] overflow-hidden rounded-lg">
                <gameErrImg class="game-card-image h-full w-full" :img="getGameImage(item)" />
                <div class="game-card-hover absolute inset-0 z-[1]">
                  <div class="game-card-hover-mask absolute inset-0" />
                  <div class="game-card-play">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M24.9106 13.9439L13.964 6.44441C13.5849 6.18474 13.1412 6.03268 12.681 6.0047C12.2209 5.97673 11.7617 6.07391 11.3534 6.28572C10.945 6.49753 10.603 6.81589 10.3645 7.2063C10.1259 7.59671 9.99987 8.04429 10 8.50052V23.4995C9.99987 23.9557 10.1259 24.4033 10.3645 24.7937C10.603 25.1841 10.945 25.5025 11.3534 25.7143C11.7617 25.9261 12.2209 26.0233 12.681 25.9953C13.1412 25.9673 13.5849 25.8153 13.964 25.5556L24.9106 18.0561C25.2467 17.8261 25.5214 17.5189 25.7111 17.1608C25.9009 16.8027 26 16.4044 26 16C26 15.5956 25.9009 15.1973 25.7111 14.8392C25.5214 14.4811 25.2467 14.1739 24.9106 13.9439Z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div class="absolute inset-0 z-[2] pointer-events-none game-card-shadow" />
                <div class="absolute left-2 right-2 bottom-1.5 z-[3]">
                  <div class="text-xs font-extrabold leading-[1.05rem] text-common-100 mb-0.5">
                    {{ getItemName(item) }}
                  </div>
                  <div class="flex items-center justify-between gap-1">
                    <div class="text-[12px] font-bold text-theme-primary truncate">
                      {{ getProviderName(item) }}
                    </div>
                    <div class="flex items-center rounded-md bg-mask-20 px-1">
                      <component :is="casinoIcons.player_count" class="size-3 fill-common-100" />
                      <span class="ml-0.5 text-[11px] font-semibold text-common-100">{{
                        toNumber(item.initScoreNum)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
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
import gameErrImg from '@/components/common/gameErrImg.vue'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { casinoIcons } from '@/static/svg/casino'
import { navigateTo } from '@/utils/router'
import { navigateToName } from '@/utils/router'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

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
const gameImageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')
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

const toNumber = (value: unknown) => {
  const nextNumber = Number(value)
  return Number.isFinite(nextNumber) ? nextNumber : 0
}

const toImageUrl = (value: unknown) => {
  const imagePath = String(value ?? '').trim()
  if (!imagePath) {
    return ''
  }
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }
  return `${gameImageBaseUrl}${imagePath}`
}

const getItemName = (item: GameDataItem) => {
  const gameName = String(item.itemName ?? '').trim()
  return gameName || '--'
}

const getProviderName = (item: GameDataItem) => {
  const providerName = String(item.platformName ?? '').trim()
  return providerName || 'PG'
}

const getGameImage = (item: GameDataItem) => {
  const fallbackImage = item.conUrl ?? item.icon2 ?? item.gameItemHotVo?.defaultImage
  return {
    maintain: false,
    src: toImageUrl(fallbackImage)
  }
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

.game-card {
  border: 0;
  background: transparent;
  padding: 0;
  transition: transform 0.35s ease;
}

.game-card-image {
  transition:
    transform 0.35s ease,
    filter 0.35s ease;
}

.game-card-hover {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.game-card-hover-mask {
  background: rgba(8, 12, 18, 0.45);
}

.game-card-play {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.88);
  transition: transform 0.35s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-card-play svg {
  width: 24px;
  height: 24px;
  fill: #fff;
  transform: translateX(1px);
}

.game-card-shadow {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 35%, rgba(0, 0, 0, 0.62) 100%);
}

@media (hover: hover) and (pointer: fine) {
  .recommended-page-pc .game-card:hover {
    transform: translateY(-8px);
  }

  .recommended-page-pc .game-card:hover .game-card-image {
    transform: scale(1.05);
    filter: brightness(0.84);
  }

  .recommended-page-pc .game-card:hover .game-card-hover {
    opacity: 1;
  }

  .recommended-page-pc .game-card:hover .game-card-play {
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
