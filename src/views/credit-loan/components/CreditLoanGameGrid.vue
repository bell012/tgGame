<template>
  <div class="w-full">
    <div
      v-if="isLoading && games.length === 0"
      class="grid w-full grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3"
    >
      <div
        v-for="index in PAGE_SIZE"
        :key="index"
        class="aspect-[330/438] rounded-lg bg-bg-2 animate-pulse"
      />
    </div>
    <div
      v-else-if="games.length > 0"
      class="grid w-full grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3"
      :class="{ 'opacity-60': isLoading && !isMobile }"
    >
      <div v-for="(game, index) in games" :key="game.rowId ?? index" class="aspect-[330/438]">
        <casinoGameCard :game="game" @click="handleClick(game.rowId)" />
      </div>
    </div>
    <ThemedEmptyState
      v-else
      :dark-image="defaultImgDark"
      :light-image="defaultImgLight"
      :message="t('creditLoan.empty')"
      container-class="mt-[17px]"
      image-class="w-[220px] h-[200px] object-contain mb-2.5"
      text-class="text-xs text-center text-text-1"
    />

    <template v-if="isMobile">
      <div
        v-if="isLoading && games.length > 0"
        class="mt-2 h-10 rounded-lg bg-bg-2 animate-pulse"
      />
      <div v-if="hasMore" ref="loadMoreRef" class="h-1 w-full" />
    </template>
    <DesktopPagination
      v-else
      class="mt-4"
      :current-page="page"
      :total-pages="totalPages"
      @change="page = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameDataItem } from '@/api/interface/game'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useGameStore } from '@/stores/game'
import { navigateToName } from '@/utils/router'
import casinoGameCard from '@/views/fun/casino/components/casinoGameCard.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'

const props = defineProps<{
  gameTypeCode: string
}>()

const PAGE_SIZE = 24

const { t } = useI18n()
const gameStore = useGameStore()
const isMobile = useIsMobile()

const games = ref<GameDataItem[]>([])
const page = ref(1)
const totalPages = ref(1)
const isLoading = ref(false)
const loadMoreRef = ref<HTMLElement | null>(null)
const hasMore = computed(() => page.value < totalPages.value)
let requestToken = 0
let loadMoreObserver: IntersectionObserver | null = null

const fetchGames = async () => {
  const currentToken = ++requestToken
  const isAppend = isMobile.value && page.value > 1
  isLoading.value = true

  try {
    const res = await gameStore.queryGameDataPage({
      gameTypeCode: props.gameTypeCode || undefined,
      sortByOrderId: true,
      sortDirection: 'asc',
      rowType: 3,
      page: page.value,
      pageSize: PAGE_SIZE
    })

    if (currentToken !== requestToken) return
    games.value = isAppend ? [...games.value, ...res.list] : res.list
    totalPages.value = res.totalPages
  } catch (error) {
    if (currentToken !== requestToken) return
    console.error('credit loan games failed', error)
    if (!isAppend) {
      games.value = []
      totalPages.value = 1
    }
  } finally {
    if (currentToken === requestToken) {
      isLoading.value = false
      void nextTick(setupLoadMoreObserver)
    }
  }
}

const setupLoadMoreObserver = () => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null

  if (!isMobile.value || !hasMore.value || !loadMoreRef.value) return

  loadMoreObserver = new IntersectionObserver(
    entries => {
      if (!entries.some(entry => entry.isIntersecting) || isLoading.value || !hasMore.value) {
        return
      }
      page.value += 1
    },
    { root: null, rootMargin: '200px 0px 200px 0px' }
  )
  loadMoreObserver.observe(loadMoreRef.value)
}

const handleClick = (rowId?: string | number) => {
  if (!rowId) return
  navigateToName('gameDetail', { params: { rowId } })
}

const reload = () => {
  if (page.value !== 1) {
    page.value = 1
    return
  }
  void fetchGames()
}

watch(page, () => {
  void fetchGames()
})

watch(() => props.gameTypeCode, reload, { immediate: true })

watch(isMobile, reload)

onUnmounted(() => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null
})
</script>
