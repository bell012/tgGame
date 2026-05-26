<template>
  <div ref="pageRootRef" class="flex w-full min-h-0 flex-1 flex-col">
    <div :class="filterSheetWrapClass">
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
import type { GameDataItem } from '@/api/interface/game'
import type { GamePlatformOption } from '@/stores/game'
import type { GameQueryOptions } from '@/stores/game'
import ExplorePcPagination from './ExplorePcPagination.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import casinoGameCard from './casinoGameCard.vue'
import filterSheet from './filterSheet.vue'

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
const platformOptions = ref<GamePlatformOption[]>([])
const selectedSort = ref(props.sortValue || sortOptions[0].value)
const selectedProviders = ref<string[]>(props.providerCodes ?? [])

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
  return platformOptions.value.map(item => ({
    label: item.platformName,
    value: item.platformCode,
    icon: getPlatformIcon(item)
  }))
})

const currentGameTypeCode = computed(() => {
  return String((props.queryOptions ?? props.modules ?? {}).gameTypeCode ?? '').trim()
})

const resolvedQueryOptions = computed<GameQueryOptions>(() => {
  const baseOptions = {
    ...fallbackQueryOptions,
    ...(props.queryOptions ?? props.modules ?? {})
  }

  const sortOptionMap: Record<string, Partial<GameQueryOptions>> = {
    default: { sortByOrderId: true, sortDirection: 'asc' },
    'a-z': { sortByOrderId: true, sortByItemName: true, sortDirection: 'asc' },
    'z-a': { sortByOrderId: true, sortByItemName: true, sortDirection: 'desc' }
  }

  return {
    ...baseOptions,
    ...sortOptionMap[selectedSort.value],
    platformCodes: selectedProviders.value
  }
})

const hideSortFilter = computed(() => {
  if (!props.hideSortWhenKeyword) {
    return false
  }

  const keyword = String((props.queryOptions ?? props.modules ?? {}).keyword ?? '').trim()
  return keyword.length > 0
})

const filterSheetWrapClass = computed(() => {
  if (isMobile.value) {
    return 'mt-1 mb-[11px] w-full'
  }

  if (!hideSortFilter.value) {
    return 'my-2.5 w-full shrink-0'
  }

  return 'my-2.5 w-full shrink-0 sm:max-w-[420px]'
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

const getPlatformIcon = (item: GamePlatformOption) => {
  const imagePath = item.icon4
  return imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''
}

const syncSelectedProvidersFromNames = (providerNames: string[]) => {
  if (platformOptions.value.length === 0) {
    return
  }

  const nextProviders = providerNames
    .map(providerName => providerName.trim())
    .filter(Boolean)
    .map(providerName => {
      const matchedPlatform = platformOptions.value.find(
        item => item.platformName.trim() === providerName
      )
      return matchedPlatform?.platformCode?.trim() ?? ''
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
      const matchedPlatform = platformOptions.value.find(
        item => item.platformCode.trim() === providerCode.trim()
      )
      return matchedPlatform?.platformName?.trim() ?? ''
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

const getPlatformData = async () => {
  platformOptions.value = await gameStore.queryGamePlatformsByGameTypeCode(
    currentGameTypeCode.value
  )
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

watch(
  currentGameTypeCode,
  () => {
    void getPlatformData()
  },
  { immediate: true }
)
</script>
