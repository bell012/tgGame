<template>
  <div ref="pageRootRef" class="search-container" :style="mobileStyle">
    <div :class="{ 'search-filter-panel': isMobile }">
      <top-input :data-list="typeList" @change-type="changeTypeHandler" @search="topInputSearch" />
    </div>
    <template v-if="currentType === 'casino'">
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
            class="explore-tabs-scroll my-3.5 flex w-full flex-row gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-none touch-pan-x"
            @scroll="updateScrollState"
          >
            <button
              v-for="(item, index) in tabButtons"
              :key="item.sysGameTypeCode || `tab-${index}`"
              :ref="el => (tabRefs[index] = el as HTMLButtonElement)"
              :class="{ 'explore-tab-button--active': isActiveCasinoTab(item) }"
              class="explore-tab-button flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center lg:hover:bg-bg-2"
              @click.stop="onTabButton(item)"
            >
              <div class="explore-tab-icon h-5 w-5 mr-[7px]">
                <img
                  v-if="!isActiveCasinoTab(item) && typeof item.icon === 'string'"
                  :src="item.icon"
                  class="w-full h-full object-contain"
                />
                <img
                  v-else-if="isActiveCasinoTab(item) && typeof item.iconSelect === 'string'"
                  :src="item.iconSelect"
                  class="w-full h-full object-contain"
                />
                <component
                  v-else-if="item.icon"
                  :is="item.icon"
                  :class="isActiveCasinoTab(item) ? 'fill-primary' : 'fill-text-2'"
                  class="w-full h-full"
                />
              </div>
              <div class="explore-tab-label font-[700] text-text-2">
                {{ item.sysGameTypeName }}
              </div>
            </button>
          </div>
        </div>

        <div
          class="absolute right-0 top-0 z-10 hidden h-[38px] items-center justify-center bg-bg-1 pl-2 sm:flex"
          :class="
            canScrollRight ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
          "
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
    </template>
    <template v-if="currentType === 'sports'">
      <div class="min-h-screen w-full relative"></div>
    </template>
    <template v-if="currentType === 'lottery'">
      <div class="min-h-screen w-full relative"></div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  type StyleValue
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { GameQueryOptions } from '@/stores/game'
import { useGameStore } from '@/stores/game'
import { useLayoutStore } from '@/stores/layout'
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
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const gameStore = useGameStore()
const layoutStore = useLayoutStore()
const EXPLORE_CASINO_TAB_QUERY_KEY = 'casinoTab'

const pageRootRef = ref<HTMLElement | null>(null)
const mobileStyle = computed<StyleValue | undefined>(() => {
  if (!isMobile.value) {
    return undefined
  }

  const topNavHeight = layoutStore.TOPNAV_HEIGHT
  const bottomTabHeight = layoutStore.BOTTOM_TAB_HEIGHT

  return {
    boxSizing: 'border-box',
    height: `calc(100dvh - ${topNavHeight + bottomTabHeight}px)`,
    marginTop: `${topNavHeight}px`,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch'
  }
})

const keywords = ref('')
provide('explore-keywords', keywords)

const currentType = ref('casino')
provide('explore-current-type', currentType)

const exploreHotGameList = ref<ExploreHotGameItem[]>([])
provide('explore-hot-game-list', exploreHotGameList)
const exploreSuggestedList = ref<string[]>([])
provide('explore-suggested-list', exploreSuggestedList)

const typeList = computed(() => [
  { id: 'casino', name: t('bottom_tab_bar.casino') },
  { id: 'sports', name: t('bottom_tab_bar.sports') },
  { id: 'lottery', name: t('home.Lottery') }
])

const activeSearchKeyword = ref('')

const topInputSearch = (value: string) => {
  activeSearchKeyword.value = value.trim()
}

const changeTypeHandler = (value: string) => {
  currentType.value = value || 'casino'
}

const tabRefs = ref<HTMLButtonElement[]>([])
const tabScrollRef = ref<HTMLDivElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const hasSyncedActiveTab = ref(false)

const getQueryStringValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '')
  }

  return String(value ?? '')
}

const getRouteTabCode = () => getQueryStringValue(route.query[EXPLORE_CASINO_TAB_QUERY_KEY])
const isExploreRoute = computed(() => String(route.name || '').replace(/^Locale/, '') === 'explore')
const currentTabCode = ref(getRouteTabCode())

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
  const options = baseQueryOptions ?? {
    pageSize: isMobile.value ? 27 : 32
  }
  if (!trimmedSearchKeyword.value) {
    return options
  }
  return {
    ...options,
    keyword: trimmedSearchKeyword.value
  }
})

const currentPageProps = computed<Record<string, unknown>>(() => {
  const baseProps: Record<string, unknown> = {
    queryOptions: currentQueryOptions.value
  }

  if (currentPageStyle.value === pageStyle3) {
    return {
      ...baseProps,
      hideSortWhenKeyword: true
    }
  }

  return baseProps
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

const isActiveCasinoTab = (tab: CasinoTabButtonItem) => tab.sysGameTypeCode === currentTabCode.value

const scrollElementToTop = (element: Element | HTMLElement | null) => {
  element?.scrollTo({
    top: 0,
    behavior: 'auto'
  })
}

const scrollScrollableAncestorsToTop = (element: HTMLElement | null) => {
  let current: HTMLElement | null = element

  while (current) {
    const { overflowY } = window.getComputedStyle(current)
    const isScrollable = ['auto', 'scroll', 'overlay'].includes(overflowY)

    if ((isScrollable && current.scrollHeight > current.clientHeight) || current.scrollTop > 0) {
      scrollElementToTop(current)
    }

    current = current.parentElement
  }
}

const scrollPageToTop = () => {
  nextTick(() => {
    scrollScrollableAncestorsToTop(pageRootRef.value)
    scrollElementToTop(document.scrollingElement)
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  })
}

const syncRouteTabCode = (tabCode: string) => {
  if (!isExploreRoute.value || getRouteTabCode() === tabCode) {
    return
  }

  const nextQuery = { ...route.query }

  if (tabCode) {
    nextQuery[EXPLORE_CASINO_TAB_QUERY_KEY] = tabCode
  } else {
    delete nextQuery[EXPLORE_CASINO_TAB_QUERY_KEY]
  }

  void router.replace({ query: nextQuery })
}

const onTabButton = (tab: CasinoTabButtonItem) => {
  if (tab.sysGameTypeCode === currentTabCode.value) {
    return
  }

  // 切换分类时保留当前关键词，并基于新分类自动刷新检索结果
  activeSearchKeyword.value = keywords.value.trim()
  currentTabCode.value = tab.sysGameTypeCode
  syncRouteTabCode(tab.sysGameTypeCode)
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

    exploreSuggestedList.value = [
      ...new Set(hotGameResult.list.map(item => item.itemName?.trim() ?? ''))
    ]
      .filter(Boolean)
      .slice(0, 6)
  } catch (error) {
    console.error('loadSuggestedGames failed', error)
    exploreSuggestedList.value = []
  }
}

watch(
  tabButtons,
  list => {
    if (!list.length) {
      return
    }

    const routeTabCode = getRouteTabCode()
    const hasRouteTabCode = list.some(item => item.sysGameTypeCode === routeTabCode)

    if (routeTabCode && hasRouteTabCode) {
      currentTabCode.value = routeTabCode
      return
    }

    const hasCurrentCode = list.some(item => item.sysGameTypeCode === currentTabCode.value)
    if (!hasCurrentCode) {
      currentTabCode.value = list[0].sysGameTypeCode
      syncRouteTabCode(currentTabCode.value)
    }
  },
  { immediate: true }
)

watch(
  () => route.query[EXPLORE_CASINO_TAB_QUERY_KEY],
  value => {
    if (!isExploreRoute.value) {
      return
    }

    const routeTabCode = getQueryStringValue(value)

    if (!tabButtons.value.length) {
      currentTabCode.value = routeTabCode
      return
    }

    const nextTabCode =
      routeTabCode && tabButtons.value.some(item => item.sysGameTypeCode === routeTabCode)
        ? routeTabCode
        : tabButtons.value[0].sysGameTypeCode

    if (currentTabCode.value !== nextTabCode) {
      currentTabCode.value = nextTabCode
    }
  }
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
  scrollPageToTop()
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
.explore-tab-button--active {
  background: var(--color-background-level-2);

  .explore-tab-label {
    color: var(--color-text-level-1);
  }
}

@media (max-width: 767px) {
  .search-filter-panel {
    background: var(--color-background-level-1);
    margin-left: -12px;
    margin-right: -12px;
    padding: 10px 12px 8px;
    margin-bottom: 0;
  }

  .explore-tabs-scroll {
    height: 62px;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    margin-bottom: 0;
  }

  .explore-tab-button {
    height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    font-size: 16px;
    line-height: 20px;
    color: var(--color-text-level-2);
  }

  .explore-tab-button--active {
    background: var(--color-background-level-2);
  }

  .explore-tab-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  .explore-tab-label {
    max-width: 120px;
    overflow: hidden;
    color: var(--color-text-level-2);
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .explore-tab-button--active .explore-tab-label {
    color: var(--color-text-level-1);
    font-weight: 700;
  }
}
</style>
