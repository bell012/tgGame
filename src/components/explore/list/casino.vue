<template>
  <!-- 游戏列表区域 -->
  <responsive-grid-pager
    :items="pagedGameList"
    v-model:page="page"
    :total-pages="totalPages"
    key-field="rowId"
    class="casino-grid-pager mt-[8px]"
  >
    <template #item="{ item }">
      <div class="game-card group w-full relative cursor-pointer" @click="itemClick(item)">
        <!-- 卡片-->
        <div class="game-card-media w-full aspect-[0.75] overflow-hidden rounded-lg relative">
          <gameRemoteImg class="game-card-image-wrap h-full w-full" :img="getGameImage(item)" />
          <div class="game-card-shadow"></div>
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
          <div class="game-card-meta">
            <div class="game-card-title">{{ getItemName(item) }}</div>
            <div class="game-card-subline">
              <div class="game-card-provider">{{ getProviderName(item) }}</div>
              <div class="game-card-player">
                <PlayerCountIcon class="game-card-player-icon" />
                <div class="game-card-player-num">{{ toScore(item.initScoreNum) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </responsive-grid-pager>
</template>

<script setup lang="ts">
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import ResponsiveGridPager from '@/components/common/ResponsiveGridPager.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import PlayerCountIcon from '@/static/svg/casino/player_count.svg?component'
import { computed, inject, onBeforeUnmount, Ref, ref, watch } from 'vue'
import { navigateToName } from '@/utils/router'

const isMobile = useIsMobile()
const isCloseDesktopModal = inject('search-close-desktop-modal') as Ref<boolean>

type CasinoGameItem = {
  id?: string | number
  rowId?: string | number
  icon2?: string
  itemName?: string
  platformName?: string
  providerName?: string
  brandName?: string
  itemCode?: string | number
  platformCode?: string | number
  brandCode?: string | number
  hot?: number | string
  initScoreNum?: number | string
  num?: number
  gameItemHotVo?: {
    hot?: number | string
  }
}

const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)

const resolveGameImageSrc = (icon2?: string) => {
  const source = String(icon2 ?? '').trim()
  if (!source) {
    return ''
  }

  if (isAbsoluteUrl(source)) {
    return source
  }

  const normalizedBaseUrl = String(baseUrl ?? '').replace(/\/+$/, '')
  const normalizedSource = source.replace(/^\/+/, '')

  if (!normalizedBaseUrl) {
    return source
  }

  return `${normalizedBaseUrl}/${normalizedSource}`
}

const getGameImage = (item: CasinoGameItem) => {
  return {
    maintain: false,
    src: resolveGameImageSrc(item.icon2),
    fit: 'cover' as const
  }
}

const injectedGameList = inject<Ref<unknown[]>>('explore-game-list', ref([]))
const keyword = inject('explore-keywords') as Ref<string>
const injectedHotGameList = inject<Ref<CasinoGameItem[]>>('explore-hot-game-list', ref([]))
const injectCurrentSort = inject<Ref<string>>('explore-current-sort', ref('0'))
const injectCurrentProvider = inject<Ref<string[]>>('explore-current-provider', ref([]))
const injectedProviderNameMap = inject<Ref<Record<string, string>>>(
  'explore-provider-name-map',
  ref({})
)

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

const toScore = (value: unknown) => {
  const score = Number(value)
  return Number.isFinite(score) ? score : 0
}

const getItemName = (item: CasinoGameItem) => {
  const title = String(item.itemName ?? item.platformName ?? '').trim()
  return title || '--'
}

const getProviderName = (item: CasinoGameItem) => {
  const directProviderName = String(item.providerName ?? item.brandName ?? '').trim()
  if (directProviderName) {
    return directProviderName
  }

  const brandCode = String(item.brandCode ?? '').trim()
  const mappedProviderName = String(injectedProviderNameMap.value[brandCode] ?? '').trim()
  if (mappedProviderName) {
    return mappedProviderName
  }

  const fallbackProviderName = String(item.platformName ?? '').trim()
  return fallbackProviderName || '--'
}
</script>

<style scoped lang="scss">
.game-card-image-wrap :deep(.game-remote-img) {
  transition:
    transform 0.35s ease,
    filter 0.35s ease;
}

.game-card-image-wrap :deep(.game-remote-img:not(.error)) {
  width: 100%;
  height: 100%;
}

.game-card-media {
  background: var(--color-background-level-2);
}

.game-card {
  transition: transform 0.35s ease;
}

.game-card-shadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.02) 0%,
    rgba(0, 0, 0, 0.12) 45%,
    rgba(0, 0, 0, 0.68) 100%
  );
  z-index: 1;
}

.game-card-image-wrap.is-error + .game-card-shadow,
.game-card-image-wrap.is-error ~ .game-card-mask {
  display: none;
}

.game-card-image-wrap.is-error ~ .game-card-meta .game-card-title,
.game-card-image-wrap.is-error ~ .game-card-meta .game-card-provider {
  display: none;
}

.game-card-image-wrap.is-error ~ .game-card-meta .game-card-subline {
  justify-content: flex-end;
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
  z-index: 2;
}

.game-card-meta {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 6px;
  z-index: 3;
}

.game-card-title {
  margin-bottom: 4px;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}

.game-card-subline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.game-card-provider {
  flex: 1;
  min-width: 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.game-card-player {
  display: inline-flex;
  align-items: center;
  height: 20px;
  border-radius: 6px;
  padding: 2px 6px 2px 5px;
  background: var(--color-mask-20);
  backdrop-filter: blur(1px);
}

.game-card-player-icon {
  width: 12px;
  height: 12px;
  margin-right: 3px;
  color: #fff;
  fill: currentColor;
  flex-shrink: 0;
}

.game-card-player-num {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
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

  .game-card:hover .game-card-image-wrap :deep(.game-remote-img:not(.error)) {
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

.casino-grid-pager :deep(.grid.w-full) {
  gap: 8px;
}

@media (min-width: 768px) {
  .casino-grid-pager :deep(.grid.w-full) {
    gap: 11px;
  }
}
</style>
