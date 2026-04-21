<template>
  <div ref="pageRootRef" class="w-full">
    <div class="my-2.5 w-full">
      <filterSheet
        :sortOptions="sortOptions"
        :providerOptions="providerOptions"
        :selected-sort="selectedSort"
        :selected-providers="selectedProviders"
        :hide-sort="hideSortFilter"
        @update:sort="handleSort"
        @update:providers="handleProvider"
      />
    </div>
    <div v-if="isLoading" class="grid w-full grid-cols-3 gap-2.5 sm:grid-cols-8">
      <div
        v-for="index in resolvedPageSize"
        :key="index"
        class="aspect-[330/438] rounded-lg bg-bg-2 animate-pulse"
      />
    </div>
    <div v-else-if="pageData.length > 0" class="grid w-full grid-cols-3 gap-2.5 sm:grid-cols-8">
      <div v-for="(game, index) in pageData" :key="game.rowId ?? index" class="aspect-[330/438]">
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

    <div
      v-if="!isMobile && total > 0 && totalPages > 1"
      class="mt-4 flex items-center justify-center"
    >
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
import { useIsMobile } from '@/composables/useMediaQuery'
import type { GameBrandItem, GameDataItem } from '@/api/interface/game'
import type { GameQueryOptions } from '@/stores/game'
import filterSheet from './filterSheet.vue'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'
import defaultImg from '@/static/img/explore/default.png'
import defaultWhiteImg from '@/static/img/explore/default_white.png'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import casinoGameCard from './casinoGameCard.vue'

interface Props {
  queryOptions?: GameQueryOptions
  modules?: GameQueryOptions
  sortValue?: string
  providerNames?: string[]
  providerCodes?: string[]
  hideSortWhenKeyword?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:sort', value: string): void
  (e: 'update:providers', value: string[]): void
  (e: 'update:providerNames', value: string[]): void
  (e: 'update:providerFilter', value: { providerCodes: string[]; providerNames: string[] }): void
}>()
const { t } = useI18n()
const gameStore = useGameStore()
const isMobile = useIsMobile()
const pageRootRef = ref<HTMLElement | null>(null)
const closeDesktopModalFlag = inject<Ref<boolean> | null>('search-close-desktop-modal', null)

const sortOptions = [
  { label: t('search.sortDefault'), value: 'default' },
  { label: 'A-Z', value: 'a-z' },
  { label: 'Z-A', value: 'z-a' }
]
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const pageData = ref<GameDataItem[]>([])
const brandOptions = ref<GameBrandItem[]>([])
const selectedSort = ref(props.sortValue || sortOptions[0].value)
const selectedProviders = ref<string[]>(props.providerCodes ?? [])
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)
const fallbackQueryOptions: GameQueryOptions = {
  rowType: 3,
  pageSize: 27
}
const resolvedPageSize = computed(() => {
  return Math.max(
    1,
    (props.queryOptions ?? props.modules ?? {}).pageSize ?? fallbackQueryOptions.pageSize ?? 27
  )
})
const providerOptions = computed(() => {
  return brandOptions.value.map(item => ({
    label: item.brandName,
    value: item.brandCode,
    icon: getBrandIcon(item)
  }))
})
const resolvedQueryOptions = computed<GameQueryOptions>(() => {
  const baseOptions = {
    ...fallbackQueryOptions,
    ...(props.queryOptions ?? props.modules ?? {})
  }
  const sortOptionMap: Record<string, Partial<GameQueryOptions>> = {
    default: { sortByOrderId: true, sortDirection: 'desc' },
    'a-z': { sortByOrderId: true, sortByItemName: true, sortDirection: 'asc' },
    'z-a': { sortByOrderId: true, sortByItemName: true, sortDirection: 'desc' }
  }

  return {
    ...baseOptions,
    ...sortOptionMap[selectedSort.value],
    brandCodes: selectedProviders.value
  }
})
const hideSortFilter = computed(() => {
  if (!props.hideSortWhenKeyword) {
    return false
  }

  const keyword = String((props.queryOptions ?? props.modules ?? {}).keyword ?? '').trim()
  return keyword.length > 0
})
const resolvedQueryKey = computed(() =>
  JSON.stringify({
    queryOptions: resolvedQueryOptions.value,
    isMobile: isMobile.value
  })
)
const baseQueryKey = computed(() =>
  JSON.stringify({
    ...(props.queryOptions ?? props.modules ?? {}),
    sortValue: props.sortValue ?? null,
    providerCodes: props.providerCodes ?? [],
    providerNames: props.providerNames ?? []
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

const getBrandIcon = (item: GameBrandItem) => {
  const imagePath = item.banner || item.icon
  return imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''
}

const syncSelectedProvidersFromNames = (providerNames: string[]) => {
  if (brandOptions.value.length === 0) {
    return
  }

  const nextProviders = providerNames
    .map(providerName => providerName.trim())
    .filter(Boolean)
    .map(providerName => {
      const matchedBrand = brandOptions.value.find(item => item.brandName.trim() === providerName)
      return matchedBrand?.brandCode?.trim() ?? ''
    })
    .filter(Boolean)

  selectedProviders.value = [...new Set(nextProviders)]
}

const handleSort = (value: string) => {
  selectedSort.value = value
  emit('update:sort', value)
}

const handleProvider = (value: string[]) => {
  selectedProviders.value = value
  emit('update:providers', value)
  const providerNames = value
    .map(providerCode => {
      const matchedBrand = brandOptions.value.find(
        item => item.brandCode.trim() === providerCode.trim()
      )
      return matchedBrand?.brandName?.trim() ?? ''
    })
    .filter(Boolean)

  const uniqueProviderNames = [...new Set(providerNames)]

  emit('update:providerNames', uniqueProviderNames)
  emit('update:providerFilter', {
    providerCodes: [...value],
    providerNames: uniqueProviderNames
  })
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
    if (isMobile.value) {
      const list = await gameStore.queryGameData(resolvedQueryOptions.value)

      page.value = 1
      total.value = list.length
      totalPages.value = 1
      pageData.value = list
      return
    }

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

const getBrandData = async () => {
  brandOptions.value = await gameStore.queryGameBrandData()
  syncSelectedProvidersFromNames(props.providerNames ?? [])
}

watch(
  () => props.sortValue,
  value => {
    selectedSort.value = value || sortOptions[0].value
  }
)

watch(
  () => props.providerCodes,
  value => {
    if ((value ?? []).length > 0) {
      selectedProviders.value = [...(value ?? [])]
      return
    }

    syncSelectedProvidersFromNames(props.providerNames ?? [])
  },
  { deep: true }
)

watch(
  () => props.providerNames,
  value => {
    syncSelectedProvidersFromNames(value ?? [])
  },
  { deep: true }
)

watch(baseQueryKey, () => {
  selectedSort.value = props.sortValue || sortOptions[0].value

  if (props.providerCodes && props.providerCodes.length > 0) {
    selectedProviders.value = [...props.providerCodes]
    return
  }

  if (props.providerNames && props.providerNames.length > 0) {
    syncSelectedProvidersFromNames(props.providerNames)
    return
  }

  selectedProviders.value = []
})

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

void getBrandData()
</script>
<style scoped lang="scss"></style>
