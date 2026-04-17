<template>
  <div ref="pageRootRef" class="w-full">
    <div v-if="isLoading" class="grid w-full gap-2.5 grid-cols-3 sm:grid-cols-8">
      <div
        v-for="index in resolvedPageSize"
        :key="index"
        class="aspect-[330/438] rounded-lg bg-bg-2 animate-pulse"
      />
    </div>

    <div v-else-if="pageData.length > 0" class="grid w-full gap-2.5 grid-cols-3 sm:grid-cols-8">
      <div v-for="(game, i) in pageData" :key="game.rowId ?? i" class="aspect-[330/438]">
        <casinoGameCard :game="game" @click="handleClick(game.rowId)" />
      </div>
    </div>

    <ThemedEmptyState
      v-else
      :dark-image="defaultImg"
      :light-image="defaultWhiteImg"
      :message="t('search.stay')"
      container-class="mt-[17px]"
      image-class="w-[220px] h-[200px] object-contain mb-2.5"
      text-class="text-xs text-center text-text-1"
    />

    <div v-if="total > 0" class="mt-4 flex items-center justify-center">
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
import { computed, inject, nextTick, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateToName } from '@/utils/router'
import { useGameStore } from '@/stores/game'
import type { GameDataItem } from '@/api/interface/game'
import type { GameQueryOptions } from '@/stores/game'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'
import defaultImg from '@/static/img/explore/default.png'
import defaultWhiteImg from '@/static/img/explore/default_white.png'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import casinoGameCard from './casinoGameCard.vue'

interface Props {
  queryOptions?: GameQueryOptions
  modules?: GameQueryOptions
}

const props = defineProps<Props>()
const { t } = useI18n()

const gameStore = useGameStore()
const pageRootRef = ref<HTMLElement | null>(null)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const isLoading = ref(false)
const pageData = ref<GameDataItem[]>([])
const closeDesktopModalFlag = inject<Ref<boolean> | null>('search-close-desktop-modal', null)
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)
const fallbackQueryOptions: GameQueryOptions = {
  rowType: 3,
  pageSize: 27
}
const resolvedQueryOptions = computed<GameQueryOptions>(() => ({
  ...fallbackQueryOptions,
  ...(props.queryOptions ?? props.modules ?? {})
}))
const resolvedPageSize = computed(() => Math.max(1, resolvedQueryOptions.value.pageSize ?? 27))
const resolvedQueryKey = computed(() => JSON.stringify(resolvedQueryOptions.value))

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
    const res = await gameStore.queryGameDataPage({
      ...resolvedQueryOptions.value,
      page: page.value,
      pageSize: resolvedPageSize.value
    })

    total.value = res.total
    totalPages.value = res.totalPages
    pageData.value = res.list
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
<style scoped lang="scss"></style>
