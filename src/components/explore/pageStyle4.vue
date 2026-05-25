<template>
  <div ref="pageRootRef" class="flex w-full min-h-0 flex-1 flex-col">
    <div v-if="isLoading" class="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-7">
      <div
        v-for="index in resolvedPageSize"
        :key="index"
        class="h-[60px] rounded-lg bg-bg-2 animate-pulse"
      />
    </div>

    <div v-else-if="brandList.length > 0" class="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-7">
      <a
        v-for="item in brandList"
        :key="item.rowId"
        href="javascript:void(0);"
        class="flex h-16 shrink-0 items-center justify-center rounded-lg bg-bg-2"
        @click="handleClick(item)"
      >
        <div class="h-6 w-4/5 sm:h-11">
          <gameRemoteImg :img="getBrandImg(item)" :alt="item.brandName" />
        </div>
      </a>
    </div>

    <div v-else class="explore-pc-empty-wrap">
      <ThemedEmptyState
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        :message="t('search.stay')"
        container-class="explore-pc-empty-state mt-[17px] sm:mt-0"
        image-class="w-[220px] h-[200px] object-contain mb-2.5"
        text-class="text-xs text-center text-text-1"
      />
    </div>

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
import type { GameBrandItem } from '@/api/interface/game'
import type { GameQueryOptions } from '@/stores/game'
import ExplorePcPagination from './ExplorePcPagination.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'

interface Props {
  queryOptions?: GameQueryOptions & { keyword?: string }
  modules?: GameQueryOptions & { keyword?: string }
}

const props = defineProps<Props>()
const { t } = useI18n()
const gameStore = useGameStore()
const isMobile = useIsMobile()
const pageRootRef = ref<HTMLElement | null>(null)
const closeDesktopModalFlag = inject<Ref<boolean> | null>('search-close-desktop-modal', null)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const brandList = ref<GameBrandItem[]>([])
const resolvedQueryOptions = computed(() => props.queryOptions ?? props.modules ?? {})
const resolvedPageSize = computed(() => Math.max(1, resolvedQueryOptions.value.pageSize ?? 28))
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

const getBrandImg = (item: GameBrandItem) => {
  const imagePath = item.banner || item.icon
  const src = imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''

  return {
    maintain: false,
    src,
    fit: 'contain' as const
  }
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

const handleClick = (item: GameBrandItem) => {
  const brandCode = String(item.brandCode || '').trim()

  if (!brandCode) {
    return
  }

  closeDesktopModal()
  navigateToName('brandGameList', {
    params: { brandCode },
    query: {
      brandName: item.brandName?.trim() || undefined
    }
  })
}

const getBrandData = async () => {
  isLoading.value = true

  try {
    if (isMobile.value) {
      const list = await gameStore.queryGameBrandData({
        keyword: resolvedQueryOptions.value.keyword
      })

      page.value = 1
      total.value = list.length
      totalPages.value = 1
      brandList.value = list
      return
    }

    const result = await gameStore.queryGameBrandDataPage({
      keyword: resolvedQueryOptions.value.keyword,
      page: page.value,
      pageSize: resolvedPageSize.value
    })

    total.value = result.total
    totalPages.value = result.totalPages
    brandList.value = result.list
  } finally {
    isLoading.value = false
  }
}

watch(
  resolvedQueryKey,
  () => {
    if (page.value !== 1) {
      page.value = 1
      return
    }

    void getBrandData()
  },
  { immediate: true }
)

watch(page, () => {
  if (!resolvedQueryKey.value) {
    return
  }

  void getBrandData()
})
</script>
