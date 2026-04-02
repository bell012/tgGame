<template>
  <div class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
    <H5Header :title="pageTitle" />
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
</template>

<script setup lang="ts">
import Api from '@/api'
import H5Header from '@/components/common/H5Header.vue'
import ResponsiveGridPager from '@/components/common/ResponsiveGridPager.vue'
import gameErrImg from '@/components/common/gameErrImg.vue'
import { casinoIcons } from '@/static/svg/casino'
import { navigateTo } from '@/utils/router'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

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

const PAGE_SIZE = 27
const gameImageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')
const route = useRoute()
const cacheGlobal = globalThis as typeof globalThis & GameDetailCacheGlobal

const page = ref(1)
const gameList = ref<GameDataItem[]>([])
const pageTitle = ref('Recommended Games')

const totalPages = computed(() => Math.max(1, Math.ceil(gameList.value.length / PAGE_SIZE)))

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
    return Number(hotValue) === 0
  })
}

const getGameData = async () => {
  const cacheData = cacheGlobal.__gameDetailGameDataCache__
  if (Array.isArray(cacheData) && cacheData.length > 0) {
    return cacheData
  }

  const res = await Api.home.getGameData()
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
        pageTitle.value = getQueryValue(currentGame?.platformName) || pageTitle.value
      }
    }

    gameList.value = resolveCurrentCategoryHotGameList(sectionList, targetTypeCode)
  } catch (error) {
    console.error('initPageData failed', error)
    gameList.value = []
  }
}

const handleGameClick = (item: GameDataItem) => {
  const itemCode = getQueryValue(item.itemCode)
  const platformCode = getQueryValue(item.platformCode)

  if (!itemCode || !platformCode) {
    return
  }

  navigateTo('/game/detail', {
    query: {
      itemCode,
      platformCode
    }
  })
}

onMounted(() => {
  void initPageData()
})
</script>

<style scoped lang="scss">
.game-card {
  border: 0;
  background: transparent;
  padding: 0;
}

.game-card-shadow {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 35%, rgba(0, 0, 0, 0.62) 100%);
}
</style>
