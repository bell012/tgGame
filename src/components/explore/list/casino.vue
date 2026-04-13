<template>
  <!-- 游戏列表区域 -->
  <responsive-grid-pager
    :items="pagedGameList"
    v-model:page="page"
    :total-pages="totalPages"
    key-field="rowId"
    class="mt-[20px]"
  >
    <template #item="{ item }">
      <div class="game-card group w-full relative cursor-pointer" @click="itemClick(item)">
        <!-- 卡片-->
        <div class="w-full aspect-[0.75] overflow-hidden rounded-lg">
          <SmartImage
            :src="baseUrl + item.icon2"
            alt=""
            class="game-card-image w-full h-full object-contain"
            @error="handleImageError"
          />
          <div class="game-card-mask">
            <div class="game-card-play">
              <svg class="game-card-play-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M5.25 5.653c0-1.427 1.529-2.33 2.779-1.643l5.5 3.03c1.295.714 1.295 2.572 0 3.286l-5.5 3.03c-1.25.687-2.779-.216-2.779-1.643V5.653Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
          </div>
        </div>
        <div
          class="flex px-1 py-1 bg-[var(--color-mask-20)] rounded-md absolute items-center bottom-1 right-1"
        >
          <SmartImage :src="numImg" alt="" class="w-2.5 h-2.5 mr-0.5" />
          <div class="text-[10px] text-text-1">{{ item.initScoreNum ?? 0 }}</div>
        </div>
      </div>
    </template>
  </responsive-grid-pager>
</template>

<script setup lang="ts">
import SmartImage from '@/components/common/SmartImage.vue'
import ResponsiveGridPager from '@/components/common/ResponsiveGridPager.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import gameImg from '@/static/img/explore/game.png'
import numImg from '@/static/img/explore/num.png'
import { computed, inject, onBeforeUnmount, Ref, ref, watch } from 'vue'
import { navigateToName } from '@/utils/router'

const isMobile = useIsMobile()
const isCloseDesktopModal = inject('search-close-desktop-modal') as Ref<boolean>

type CasinoGameItem = {
  id?: string | number
  rowId?: string | number
  icon2?: string
  platformName?: string
  itemCode?: string | number
  platformCode?: string | number
  brandCode?: string | number
  hot?: number | string
  initScoreNum?: number
  num?: number
  gameItemHotVo?: {
    hot?: number | string
  }
}

const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL

const injectedGameList = inject<Ref<unknown[]>>('explore-game-list', ref([]))
const keyword = inject('explore-keywords') as Ref<string>
const injectedHotGameList = inject<Ref<CasinoGameItem[]>>('explore-hot-game-list', ref([]))
const injectCurrentSort = inject<Ref<string>>('explore-current-sort', ref('0'))
const injectCurrentProvider = inject<Ref<string[]>>('explore-current-provider', ref([]))

const gameList = computed<CasinoGameItem[]>(() =>
  Array.isArray(injectedGameList.value) ? (injectedGameList.value as CasinoGameItem[]) : []
)

const page = ref(1)
const PAGE_SIZE = 40
const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())

const selectedProviderCodes = computed(
  () =>
    new Set(
      (Array.isArray(injectCurrentProvider.value) ? injectCurrentProvider.value : [])
        .map(item => String(item ?? '').trim())
        .filter(Boolean)
    )
)

// 过滤
const filteredGameList = computed(() => {
  if (normalizedKeyword.value.length < 2) {
    return gameList.value
  }

  return gameList.value.filter(item =>
    String(item.platformName ?? '')
      .toLowerCase()
      .includes(normalizedKeyword.value)
  )
})

const providerFilteredGameList = computed(() => {
  if (selectedProviderCodes.value.size === 0) {
    return filteredGameList.value
  }

  return filteredGameList.value.filter(item =>
    selectedProviderCodes.value.has(String(item.brandCode ?? '').trim())
  )
})

// 排序
const sortedFilteredGameList = computed(() => {
  const sortType = injectCurrentSort.value

  if (sortType === '0') {
    return providerFilteredGameList.value
  }

  const sortedList = [...providerFilteredGameList.value]

  sortedList.sort((a, b) => {
    const firstLetterA = String(a.platformName ?? '')
      .trim()
      .charAt(0)
      .toLowerCase()
    const firstLetterB = String(b.platformName ?? '')
      .trim()
      .charAt(0)
      .toLowerCase()

    const compareResult = firstLetterA.localeCompare(firstLetterB, 'en', { sensitivity: 'base' })
    return sortType === '2' ? -compareResult : compareResult
  })

  return sortedList
})

// 热门
const hotGameList = computed(() =>
  sortedFilteredGameList.value.filter(item => {
    const hotValue = item.gameItemHotVo?.hot ?? item.hot
    return Number(hotValue) === 1
  })
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedFilteredGameList.value.length / PAGE_SIZE))
)
const pagedGameList = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  return sortedFilteredGameList.value.slice(start, end)
})

watch(sortedFilteredGameList, () => {
  page.value = 1
})

watch(
  hotGameList,
  value => {
    injectedHotGameList.value = value
  },
  { immediate: true }
)

watch(totalPages, () => {
  if (page.value > totalPages.value) {
    page.value = totalPages.value
  }
  if (page.value < 1) {
    page.value = 1
  }
})

onBeforeUnmount(() => {
  injectedHotGameList.value = []
})

const itemClick = (item: CasinoGameItem) => {
  if (!isMobile.value) {
    isCloseDesktopModal.value = true
  }
  const rowId = String(item.rowId ?? '').trim()
  navigateToName('gameDetail', { params: { rowId } })
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target) return
  // 避免默认图也加载失败时反复触发 error。
  target.onerror = null
  target.src = gameImg
}
</script>

<style scoped lang="scss">
.game-card-image {
  transition:
    transform 0.35s ease,
    filter 0.35s ease;
}

.game-card {
  transition: transform 0.35s ease;
}

.game-card-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(8, 12, 18, 0.18) 0%, rgba(8, 12, 18, 0.55) 100%);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.game-card-play {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(1px);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(8px) scale(0.92);
  transition: transform 0.35s ease;
}

.game-card-play-icon {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 42px;
  height: 42px;
  display: block;
  transform: translateY(2px);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18));
}

@media (hover: hover) and (pointer: fine) {
  .game-card:hover {
    transform: translateY(-10px);
  }

  .game-card:hover .game-card-image {
    transform: scale(1.06);
    filter: brightness(0.82);
  }

  .game-card:hover .game-card-mask {
    opacity: 1;
  }

  .game-card:hover .game-card-play {
    transform: translateY(0) scale(1);
  }
}
</style>
