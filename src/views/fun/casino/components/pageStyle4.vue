<template>
  <div ref="pageRootRef" class="w-full">
    <div
      v-if="isLoading && brandList.length === 0"
      class="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-7"
    >
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
    <div
      v-if="isMobile && isLoading && brandList.length > 0"
      class="mt-2 h-10 rounded-lg bg-bg-2 animate-pulse"
    />
    <div v-if="isMobile && hasMore" ref="loadMoreRef" class="h-1 w-full" />

    <ThemedEmptyState
      v-if="!isLoading && brandList.length === 0"
      :dark-image="defaultImgDark"
      :light-image="defaultImgLight"
      :message="t('search.stay')"
      container-class="mt-[17px]"
      image-class="w-[220px] h-[200px] object-contain mb-2.5"
      text-class="text-xs text-center text-text-1"
    />

    <div v-if="!isMobile && total > 0" class="mt-4 flex items-center justify-center">
      <button
        type="button"
        class="flex h-9 items-center justify-center rounded-bl-lg rounded-tl-lg bg-bg-2 px-2.5 text-xs"
        :class="canPrev ? 'text-text-1 ' : 'text-text-2 opacity-50'"
        :disabled="!canPrev"
        @click="goPrev"
      >
        <LeftArrow class="w-2 h-2" />
      </button>

      <div class="mx-0.5 flex items-center bg-bg-2 px-2.5 py-1">
        <!-- 当前页码-->
        <div
          class="flex items-center justify-center rounded-md bg-bg-3 px-2 py-2 text-xs font-bold leading-3 text-text-1"
        >
          {{ page < 10 ? '0' + page : page }}
        </div>

        <!-- of -->
        <span class="mx-0.5 text-xs lowercase text-text-2">of</span>

        <!-- 总页码 -->
        <span
          class="flex items-center justify-center rounded-md px-2 py-2 text-xs font-bold leading-3 text-text-1"
          >{{ totalPages < 10 ? '0' + totalPages : totalPages }}</span
        >
      </div>

      <button
        type="button"
        class="flex h-9 items-center justify-center rounded-br-lg rounded-tr-lg bg-bg-2 px-2.5 text-xs"
        :class="canNext ? 'text-text-1 ' : 'text-text-2 opacity-50'"
        :disabled="!canNext"
        @click="goNext"
      >
        <RightArrow class="w-2 h-2" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateToName } from '@/utils/router'
import { useGameStore } from '@/stores/game'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { GameBrandItem } from '@/api/interface/game'
import type { GameQueryOptions } from '@/stores/game'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'
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
const loadMoreRef = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)
const hasMore = computed(() => isMobile.value && page.value < totalPages.value)
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

const goPrev = () => {
  page.value = Math.min(Math.max(1, page.value - 1), Math.max(1, totalPages.value))
  void scrollToFirstRow()
}

const goNext = () => {
  page.value = Math.min(Math.max(1, page.value + 1), Math.max(1, totalPages.value))
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
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  try {
    const res = await gameStore.queryGameBrandDataPage({
      keyword: resolvedQueryOptions.value.keyword,
      page: page.value,
      pageSize: resolvedPageSize.value
    })

    total.value = res.total
    totalPages.value = res.totalPages

    if (isMobile.value && page.value > 1) {
      brandList.value = [...brandList.value, ...res.list]
      return
    }

    brandList.value = res.list
  } finally {
    isLoading.value = false
    void nextTick(setupLoadMoreObserver)
  }
}

const setupLoadMoreObserver = () => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null

  if (!isMobile.value || !hasMore.value || !loadMoreRef.value) {
    return
  }

  loadMoreObserver = new IntersectionObserver(
    entries => {
      if (!entries.some(entry => entry.isIntersecting) || isLoading.value || !hasMore.value) {
        return
      }

      page.value += 1
    },
    {
      root: null,
      rootMargin: '200px 0px 200px 0px'
    }
  )

  loadMoreObserver.observe(loadMoreRef.value)
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

onMounted(() => {
  setupLoadMoreObserver()
})

onUnmounted(() => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null
})
</script>
<style scoped lang="scss"></style>
