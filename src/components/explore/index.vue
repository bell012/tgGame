<template>
  <div class="search-container">
    <div :class="{ 'search-filter-panel': isMobile }">
      <top-input :data-list="typeList" @change-type="changeTypeHandler" @search="topInputSearch" />
    </div>

    <div class="min-h-screen w-full relative">
      <div
        class="absolute left-0 top-0 z-10 hidden h-[38px] items-center justify-center bg-bg-1 pr-2 sm:flex"
        :class="canScrollLeft ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'"
      >
        <button
          class="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-opacity-10"
          @click="scrollLeft"
        >
          <component :is="casinoIcons.chevron_left" class="icon size-4 fill-text-1" />
        </button>
      </div>

      <div>
        <div
          ref="tabScrollRef"
          class="my-3.5 flex w-full flex-row gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-none touch-pan-x"
          @scroll="updateScrollState"
        >
          <button
            v-for="(item, index) in tabButtons"
            :key="item.sysGameTypeCode || `tab-${index}`"
            :ref="el => (tabRefs[index] = el as HTMLButtonElement)"
            :class="{
              'bg-bg-2': item.sysGameTypeCode === currentTabCode
            }"
            class="flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center lg:hover:bg-bg-2"
            @click.stop="onTabButton(item)"
          >
            <div class="h-5 w-5 mr-[7px]">
              <img
                v-if="item.sysGameTypeCode !== currentTabCode && typeof item.icon === 'string'"
                :src="item.icon"
                class="w-full h-full object-contain"
              />
              <img
                v-else-if="
                  item.sysGameTypeCode === currentTabCode && typeof item.iconSelect === 'string'
                "
                :src="item.iconSelect"
                class="w-full h-full object-contain"
              />
              <component
                v-else-if="item.icon"
                :is="item.icon"
                :class="item.sysGameTypeCode === currentTabCode ? 'fill-primary' : 'fill-text-2'"
                class="w-full h-full"
              />
            </div>
            <div
              :class="item.sysGameTypeCode === currentTabCode ? 'text-text-1' : 'text-text-2'"
              class="font-[700]"
            >
              {{ item.sysGameTypeName }}
            </div>
          </button>
        </div>
      </div>

      <div
        class="absolute right-0 top-0 z-10 hidden h-[38px] items-center justify-center bg-bg-1 pl-2 sm:flex"
        :class="canScrollRight ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'"
      >
        <button
          class="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-opacity-10"
          @click="scrollRight"
        >
          <component :is="casinoIcons.chevron_left" class="icon size-4 rotate-180 fill-text-1" />
        </button>
      </div>

      <div class="tabs-content min-h-48">
        <component :is="currentPageStyle" v-bind="currentPageProps" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameQueryOptions } from '@/stores/game'
import { useGameStore } from '@/stores/game'
import { useCasinoTabButtons, type CasinoTabButtonItem } from '@/composables/useCasinoTabButtons'
import { useIsMobile } from '@/composables/useMediaQuery'
import { casinoIcons } from '@/static/svg/casino'
import { getCasinoPageMode, getCasinoQueryOptions } from '@/views/fun/casino/casinoPageConfig'
import pageStyle2 from '@/views/fun/casino/components/pageStyle2.vue'
import pageStyle3 from '@/views/fun/casino/components/pageStyle3.vue'
import pageStyle4 from '@/views/fun/casino/components/pageStyle4.vue'
import TopInput from './top-input/index.vue'

type ExploreHotGameItem = {
  platformName?: string
}

const { t } = useI18n()
const isMobile = useIsMobile()
const gameStore = useGameStore()

const keywords = ref('')
provide('explore-keywords', keywords)

const currentType = ref('casino')
provide('explore-current-type', currentType)

const exploreHotGameList = ref<ExploreHotGameItem[]>([])
provide('explore-hot-game-list', exploreHotGameList)

const typeList = computed(() => [{ id: 'casino', name: t('bottom_tab_bar.casino') }])

const activeSearchKeyword = ref('')

const topInputSearch = (value: string) => {
  activeSearchKeyword.value = value.trim()
}

const changeTypeHandler = (value: string) => {
  if (value !== 'casino') {
    return
  }

  currentType.value = 'casino'
}

const tabRefs = ref<HTMLButtonElement[]>([])
const tabScrollRef = ref<HTMLDivElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const hasSyncedActiveTab = ref(false)
const currentTabCode = ref('')

const { tabButtons, loadCasinoTabButtons } = useCasinoTabButtons()

const getCurrentTab = computed(() => {
  if (!tabButtons.value.length) {
    return undefined
  }

  return (
    tabButtons.value.find(item => item.sysGameTypeCode === currentTabCode.value) ??
    tabButtons.value[0]
  )
})

const trimmedSearchKeyword = computed(() => activeSearchKeyword.value.trim())

const currentPageStyle = computed(() => {
  const currentCode = getCurrentTab.value?.sysGameTypeCode ?? ''
  const pageMode = getCasinoPageMode(currentCode)

  switch (pageMode) {
    case 'pageStyle2':
      return pageStyle2
    case 'pageStyle4':
      return pageStyle4
    default:
      return pageStyle3
  }
})

const currentQueryOptions = computed<GameQueryOptions | undefined>(() => {
  const currentCode = getCurrentTab.value?.sysGameTypeCode ?? ''
  const baseQueryOptions = getCasinoQueryOptions(currentCode, {
    isMobile: isMobile.value
  })

  if (!trimmedSearchKeyword.value) {
    return baseQueryOptions
  }

  return {
    ...(baseQueryOptions ?? {
      pageSize: isMobile.value ? 27 : 32
    }),
    keyword: trimmedSearchKeyword.value
  }
})

const currentPageProps = computed<Record<string, unknown>>(() => {
  return {
    queryOptions: currentQueryOptions.value
  }
})

const updateScrollState = () => {
  const element = tabScrollRef.value
  if (!element) {
    return
  }

  canScrollLeft.value = element.scrollLeft > 0
  canScrollRight.value = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
}

const scrollLeft = () => {
  const element = tabScrollRef.value
  if (!element) {
    return
  }

  element.scrollBy({
    left: -element.clientWidth,
    behavior: 'smooth'
  })

  requestAnimationFrame(updateScrollState)
}

const scrollRight = () => {
  const element = tabScrollRef.value
  if (!element) {
    return
  }

  element.scrollBy({
    left: element.clientWidth,
    behavior: 'smooth'
  })

  requestAnimationFrame(updateScrollState)
}

const scrollTabIntoView = (index: number, behavior: 'auto' | 'smooth' = 'smooth') => {
  const container = tabScrollRef.value
  const target = tabRefs.value[index]

  if (!container || !target) {
    return
  }

  const targetLeft = target.offsetLeft
  const targetCenter = targetLeft + target.offsetWidth / 2
  const nextScrollLeft = Math.max(0, targetCenter - container.clientWidth / 2)
  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)

  container.scrollTo({
    left: Math.min(nextScrollLeft, maxScrollLeft),
    behavior
  })
}

const clearSearch = () => {
  keywords.value = ''
  activeSearchKeyword.value = ''
}

const onTabButton = (tab: CasinoTabButtonItem) => {
  if (tab.sysGameTypeCode === currentTabCode.value) {
    return
  }

  clearSearch()
  currentTabCode.value = tab.sysGameTypeCode
}

const loadSuggestedGames = async () => {
  try {
    const hotGameResult = await gameStore.queryGameDataPage({
      rowType: 3,
      hot: 1,
      page: 1,
      pageSize: 12,
      sortByHotOrderId: true
    })

    exploreHotGameList.value = hotGameResult.list
      .map(item => {
        const platformName = String(item.platformName ?? item.itemName ?? '').trim()
        return {
          platformName
        }
      })
      .filter(item => Boolean(item.platformName))
  } catch (error) {
    console.error('loadSuggestedGames failed', error)
    exploreHotGameList.value = []
  }
}

watch(
  tabButtons,
  list => {
    if (!list.length) {
      currentTabCode.value = ''
      return
    }

    const hasCurrentCode = list.some(item => item.sysGameTypeCode === currentTabCode.value)
    if (!hasCurrentCode) {
      currentTabCode.value = list[0].sysGameTypeCode
    }
  },
  { immediate: true }
)

watch(
  () => getCurrentTab.value,
  async tab => {
    if (!tab) {
      return
    }

    await nextTick()
    const index = tabButtons.value.findIndex(item => item.sysGameTypeCode === tab.sysGameTypeCode)
    if (index !== -1) {
      scrollTabIntoView(index, hasSyncedActiveTab.value ? 'smooth' : 'auto')
      hasSyncedActiveTab.value = true
    }
  },
  { immediate: true }
)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  void loadCasinoTabButtons()
  void loadSuggestedGames()
  updateScrollState()

  if (tabScrollRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateScrollState()
    })

    resizeObserver.observe(tabScrollRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
@media (max-width: 767px) {
  .search-container {
    padding-top: 60px;
  }

  .search-filter-panel {
    background: var(--color-background-level-1);
    margin-left: -12px;
    margin-right: -12px;
    padding: 10px 12px 8px;
    margin-bottom: 0;
  }
}
</style>
