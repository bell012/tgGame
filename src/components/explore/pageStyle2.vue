<template>
  <div ref="pageRootRef" class="w-full">
    <div v-if="isLoading" class="grid w-full grid-cols-3 gap-[11px] sm:grid-cols-8">
      <div
        v-for="index in resolvedPageSize"
        :key="index"
        class="aspect-[330/438] rounded-lg bg-bg-2 animate-pulse"
      />
    </div>

    <div v-else-if="pageData.length > 0" class="grid w-full grid-cols-3 gap-[11px] sm:grid-cols-8">
      <div v-for="(game, index) in pageData" :key="game.rowId ?? index" class="aspect-[330/438]">
        <casinoGameCard :game="game" @click="handleClick(game.rowId)" />
      </div>
    </div>

    <ThemedEmptyState
      v-else
      :dark-image="defaultImgDark"
      :light-image="defaultImgLight"
      :message="t('search.stay')"
      container-class="mt-[17px] sm:mt-0 sm:min-h-[400px] sm:flex sm:flex-col sm:justify-center"
      image-class="w-[220px] h-[200px] object-contain mb-2.5"
      text-class="text-xs text-center text-text-1"
    />

    <ExplorePcPagination
      v-if="!isMobile && total > 0 && totalPages > 1"
      :page="page"
      :total-pages="totalPages"
      @change="goToPage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateToName } from '@/utils/router'
import { useGameStore } from '@/stores/game'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { GameDataItem } from '@/api/interface/game'
import type { GameQueryOptions } from '@/stores/game'
import ExplorePcPagination from './ExplorePcPagination.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import casinoGameCard from './casinoGameCard.vue'

interface Props {
  queryOptions?: GameQueryOptions
  modules?: GameQueryOptions
}

const props = defineProps<Props>()
const { t } = useI18n()

const gameStore = useGameStore()
const isMobile = useIsMobile()
const pageRootRef = ref<HTMLElement | null>(null)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const isLoading = ref(false)
const pageData = ref<GameDataItem[]>([])
const closeDesktopModalFlag = inject<Ref<boolean> | null>('search-close-desktop-modal', null)

const fallbackQueryOptions: GameQueryOptions = {
  rowType: 3,
  pageSize: 27
}

const resolvedQueryOptions = computed<GameQueryOptions>(() => ({
  ...fallbackQueryOptions,
  ...(props.queryOptions ?? props.modules ?? {})
}))

const resolvedPageSize = computed(() => Math.max(1, resolvedQueryOptions.value.pageSize ?? 27))

const resolvedQueryKey = computed(() =>
  JSON.stringify({
    queryOptions: resolvedQueryOptions.value,
    isMobile: isMobile.value
  })
)

const getScrollParent = (element: HTMLElement | null) => {
  if (!element || typeof window === 'undefined') {
    return null
  }

  let parent = element.parentElement

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent)
    const isScrollable = ['auto', 'scroll', 'overlay'].includes(overflowY)

    if (isScrollable && parent.scrollHeight > parent.clientHeight) {
      return parent
    }

    parent = parent.parentElement
  }

  return null
}

const scrollToFirstRow = async () => {
  await nextTick()
  const target = pageRootRef.value

  if (!target || typeof window === 'undefined') {
    return
  }

  const scrollParent = getScrollParent(target)

  if (scrollParent) {
    scrollParent.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    return
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const goToPage = (nextPage: number) => {
  page.value = Math.min(Math.max(1, nextPage), Math.max(1, totalPages.value))
  void scrollToFirstRow()
}

const closeDesktopModal = () => {
  if (closeDesktopModalFlag) {
    closeDesktopModalFlag.value = true
  }
}

const handleClick = (rowId?: string | number) => {
  if (!rowId) {
    return
  }

  closeDesktopModal()
  navigateToName('gameDetail', { params: { rowId } })
}

const getGameData = async () => {
  isLoading.value = true

  try {
    if (isMobile.value) {
      const list = await gameStore.queryGameData(resolvedQueryOptions.value)

      page.value = 1
      total.value = list.length
      totalPages.value = 1
      pageData.value = list
      return
    }

    const result = await gameStore.queryGameDataPage({
      ...resolvedQueryOptions.value,
      page: page.value,
      pageSize: resolvedPageSize.value
    })

    total.value = result.total
    totalPages.value = result.totalPages
    pageData.value = result.list
  } finally {
    isLoading.value = false
  }
}

watch(page, () => {
  void getGameData()
})

watch(
  resolvedQueryKey,
  () => {
    if (page.value !== 1) {
      page.value = 1
      return
    }

    void getGameData()
  },
  { immediate: true }
)
</script>
