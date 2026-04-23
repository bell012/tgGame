<template>
  <div
    ref="pageRootRef"
    class="casino-page max-w-[1248px] mx-auto px-3.5 py-3 sm:py-4 sm:px-3 w-full font-['Inter']"
    :style="mobileStyle"
  >
    <casinoSlideshow v-if="querySlideshowList.length > 0" :list="querySlideshowList" />

    <div
      ref="searchRef"
      class="relative flex items-center self-stretch py-[10px] px-[10px] rounded-lg border border-input-2 bg-input-1 focus-within:border-theme-primary focus-within:ring-2 transition"
    >
      <img class="w-[18px] h-[18px]" src="/src/static/img/casino/search.webp" alt="search" />
      <input
        v-model="searchText"
        @keydown.enter.prevent="onSearch"
        @focus="showHistoryPanel = true"
        class="flex-1 ml-[10px] h-[18px] bg-transparent outline-none focus:outline-none focus:ring-0 text-xs sm:text-sm"
        type="text"
        :placeholder="t('casino.placeholder')"
      />
      <button
        v-show="searchText"
        class="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-opacity-10 rounded-lg flex items-center justify-center z-10"
        @click="clearSearch"
      >
        <CloseIcon class="w-[18px] h-[18px] fill-icon-1" />
      </button>
      <div
        v-show="showHistoryPanel && !searchText"
        @click.stop="showHistoryPanel = false"
        class="absolute left-0 right-0 p-4 top-full w-full z-20 mt-3 flex flex-col items-center rounded-lg bg-bg-2 border border-opacity-10"
      >
        <button
          class="absolute -right-2 -top-2 w-5 h-5 bg-bg-3 flex items-center justify-center z-10 rounded-full"
          @click.stop="showHistoryPanel = false"
        >
          <CloseIcon class="w-[12px] h-[12px] fill-icon-2" />
        </button>
        <div class="text-xs text-text-2">
          {{ t('casino.search_tips') }}
        </div>
        <!-- 历史记录 -->
        <div v-if="searchHistory?.length > 0" class="flex justify-between w-full text-xs my-2.5">
          <div class="font-bold">{{ t('casino.history') }}</div>
          <div class="text-text-2" @click.stop="deleteAll()">
            {{ t('casino.clear') }}（{{ searchHistory?.length }}）
          </div>
        </div>
        <div class="w-full">
          <div
            v-if="searchHistory?.length > 0"
            class="flex flex-wrap gap-2 max-h-14 overflow-hidden"
          >
            <div
              v-for="(item, inx) in searchHistory.slice(0, 5)"
              :key="inx"
              class="px-1.5 py-1 rounded bg-opacity-10 inline-flex items-center"
            >
              <div
                class="text-xs text-text-2 mr-1 break-words max-w-full"
                @click.stop="goSearch(item)"
              >
                {{ item }}
              </div>
              <CloseIcon class="w-4 h-4 stroke-text-2 shrink-0" @click.stop="deleteItme(item)" />
            </div>
          </div>
        </div>
        <!-- 接口返回搜索建议 -->
        <div class="text-xs my-2.5 w-full">
          <div class="font-bold">{{ t('casino.suggested') }}</div>
        </div>
        <div class="w-full">
          <div v-if="suggestedArr?.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(item, inx) in suggestedArr"
              :key="inx"
              class="px-1.5 py-1 rounded bg-opacity-10 flex items-center"
            >
              <div class="text-xs text-text-2 break-words max-w-full" @click.stop="goSearch(item)">
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full relative">
      <!-- 左箭头 -->
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
      <!-- 顶部横行滚动tab选择 -->
      <div>
        <div
          ref="tabScrollRef"
          class="my-3.5 flex w-full flex-row gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-none touch-pan-x"
          @scroll="updateScrollState"
        >
          <button
            v-for="(item, inx) in tabButtons"
            :key="inx"
            :ref="el => (tabRefs[inx] = el as HTMLButtonElement)"
            :class="{
              'bg-bg-2': item.sysGameTypeCode === currentTabCode
            }"
            class="flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center lg:hover:bg-bg-2"
            @click.stop="onTabButton(item)"
          >
            <div class="h-5 w-5 mr-[7px]">
              <img
                v-if="item.sysGameTypeCode !== currentTabCode && typeof item?.icon === 'string'"
                :src="item.icon"
                class="w-full h-full object-contain"
              />
              <img
                v-else-if="
                  item.sysGameTypeCode === currentTabCode && typeof item?.iconSelect === 'string'
                "
                :src="item.iconSelect"
                class="w-full h-full object-contain"
              />
              <component
                v-else-if="item?.icon"
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

      <!-- 右箭头 -->
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

      <!-- 6种样式 -->
      <div class="tabs-content min-h-48">
        <component :is="getPageStyle" v-bind="currentPageProps" />
      </div>
    </div>
  </div>

  <!-- 注册弹窗 -->
  <LoginModal v-model="showLoginModal" default-tab="register" />
  <CommonFooter class="hidden sm:block" />
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated,
  type StyleValue
} from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { QuerySlideshowItem, QuerySlideshowRequest } from '@/api/interface/home.interface'
import { useCasinoTabButtons, type CasinoTabButtonItem } from '@/composables/useCasinoTabButtons'
import { useGameStore } from '@/stores/game'
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'
import { useIsMobile } from '@/composables/useMediaQuery'
import LoginModal from '@/components/login_register/LoginModal.vue'
import CommonFooter from '@/components/commonFooter.vue'
import { navigateTo } from '@/utils/router'
import { getStorageLanguageCode } from '@/utils/locale'
import CloseIcon from '@/static/svg/close.svg?component'
import { casinoIcons } from '@/static/svg/casino'
import { getCasinoPageMode, getCasinoQueryOptions } from './casinoPageConfig'
import casinoSlideshow from './components/casinoSlideshow.vue'
import pageStyle1 from './components/pageStyle1.vue'
import pageStyle2 from './components/pageStyle2.vue'
import pageStyle3 from './components/pageStyle3.vue'
import pageStyle4 from './components/pageStyle4.vue'

interface Props {
  tabKey?: string | undefined
}

const props = withDefaults(defineProps<Props>(), {
  tabKey: undefined
})

const { t, locale } = useI18n()
const layoutStore = useLayoutStore()
const isMobile = useIsMobile()
const mobileStyle = computed<StyleValue | undefined>(() => {
  if (isMobile.value) {
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
  }
})

const tabRefs = ref<HTMLButtonElement[]>([])
const pageRootRef = ref<HTMLElement | null>(null)
const showLoginModal = ref(false)
const showHistoryPanel = ref(false)
const searchText = ref('')
const activeSearchKeyword = ref('')
const suggestedArr = ref<string[]>([])
const querySlideshowList = ref<QuerySlideshowItem[]>([])
const gameStore = useGameStore()
const userStore = useUserStore()
const { searchHistory } = storeToRefs(gameStore)
const { userInfo } = storeToRefs(userStore)

const getCurrentTab = computed(() => {
  const key = props.tabKey ?? ''
  return tabButtons.value.find(tab => tab.sysGameTypeCode === key)
})
const currentTabCode = computed(() => getCurrentTab.value?.sysGameTypeCode)
const trimmedSearchKeyword = computed(() => activeSearchKeyword.value.trim())
const basePageStyle = computed(() => {
  const currentCode = getCurrentTab.value?.sysGameTypeCode ?? ''
  const pageMode = getCasinoPageMode(currentCode)

  switch (pageMode) {
    case 'lobby':
      return pageStyle1
    case 'pageStyle2':
      return pageStyle2
    case 'pageStyle4':
      return pageStyle4
    default:
      return pageStyle3
  }
})
const getPageStyle = computed(() => {
  if (trimmedSearchKeyword.value && basePageStyle.value === pageStyle1) {
    return pageStyle2
  }

  return basePageStyle.value
})
const currentQueryOptions = computed(() => {
  if (trimmedSearchKeyword.value) {
    if (basePageStyle.value === pageStyle1) {
      return {
        rowType: 3,
        pageSize: isMobile.value ? 27 : 32,
        keyword: trimmedSearchKeyword.value
      }
    }

    const baseQueryOptions = getCasinoQueryOptions(currentTabCode.value ?? '', {
      isMobile: isMobile.value
    })

    return {
      ...(baseQueryOptions ?? {
        pageSize: isMobile.value ? 27 : 32
      }),
      keyword: trimmedSearchKeyword.value
    }
  }

  return getCasinoQueryOptions(currentTabCode.value ?? '', { isMobile: isMobile.value })
})
const currentPageProps = computed(() => {
  switch (getPageStyle.value) {
    case pageStyle1:
      return {
        modules: lobbyButtons.value,
        loading: isLobbyButtonsLoading.value && !hasLoaded.value
      }
    case pageStyle2:
    case pageStyle3:
      return {
        queryOptions: currentQueryOptions.value
      }
    case pageStyle4:
      return {
        queryOptions: currentQueryOptions.value
      }
    default:
      return {}
  }
})
const searchRef = ref<HTMLDivElement | null>(null)
const tabScrollRef = ref<HTMLDivElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const hasSyncedActiveTab = ref(false)
const tabScrollLeft = ref(0)
let searchDebounceTimer: number | undefined

const findScrollableParent = (element: HTMLElement | null) => {
  let current = element?.parentElement ?? null

  while (current) {
    const { overflowY } = window.getComputedStyle(current)

    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      current.scrollHeight > current.clientHeight
    ) {
      return current
    }

    current = current.parentElement
  }

  return null
}

const scrollPageToTop = () => {
  nextTick(() => {
    findScrollableParent(pageRootRef.value)?.scrollTo({
      top: 0,
      behavior: 'auto'
    })

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  })
}

const updateScrollState = () => {
  const el = tabScrollRef.value
  if (!el) return

  tabScrollLeft.value = el.scrollLeft
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

const scrollLeft = () => {
  const el = tabScrollRef.value
  if (!el) return

  el.scrollBy({
    left: -el.clientWidth,
    behavior: 'smooth'
  })

  requestAnimationFrame(updateScrollState)
}

const scrollRight = () => {
  const el = tabScrollRef.value
  if (!el) return

  el.scrollBy({
    left: el.clientWidth,
    behavior: 'smooth'
  })

  requestAnimationFrame(updateScrollState)
}

const scrollTabIntoView = (index: number, behavior: 'auto' | 'smooth' = 'smooth') => {
  const container = tabScrollRef.value
  const target = tabRefs.value[index]
  if (!container || !target) return

  const targetLeft = target.offsetLeft
  const targetCenter = targetLeft + target.offsetWidth / 2
  const nextScrollLeft = Math.max(0, targetCenter - container.clientWidth / 2)
  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)

  container.scrollTo({
    left: Math.min(nextScrollLeft, maxScrollLeft),
    behavior
  })
}

const onTabButton = async (tab: CasinoTabButtonItem) => {
  clearSearch()

  if (tab.sysGameTypeCode === '') {
    if (currentTabCode.value === '') {
      scrollPageToTop()
      return
    }

    try {
      await navigateTo('/casino')
    } finally {
      scrollPageToTop()
    }
    return
  }

  navigateTo(`/casino/${tab.sysGameTypeCode}`)
}

let slideshowRequestToken = 0

const getQuerySlideshow = async () => {
  const requestToken = ++slideshowRequestToken

  try {
    const nextSlides: QuerySlideshowItem[] = []
    let currentPage = 1
    let totalPages = 1

    do {
      const requestData: QuerySlideshowRequest = {
        languageCode: getStorageLanguageCode(String(locale.value)),
        channelId: isMobile.value ? '4' : '3',
        deploymentPath: 1,
        requireLogin: isLoggedIn.value ? 1 : 0,
        page: {
          current: currentPage,
          size: 100
        }
      }

      const response = await Api.home.getQuerySlideshow(requestData)

      if (requestToken !== slideshowRequestToken) {
        return
      }

      const result = response?.result
      const records = Array.isArray(result?.records) ? result.records : []

      nextSlides.push(...records)
      currentPage = Number(result?.current ?? currentPage)
      totalPages = Math.max(1, Number(result?.pages ?? totalPages))
      currentPage += 1
    } while (currentPage <= totalPages)

    if (requestToken !== slideshowRequestToken) {
      return
    }

    querySlideshowList.value = nextSlides
  } catch (error) {
    if (requestToken !== slideshowRequestToken) {
      return
    }

    console.error('getQuerySlideshow failed', error)
    querySlideshowList.value = []
  }
}

const loadSuggestedGames = async () => {
  const hotGameResult = await gameStore.queryGameDataPage({
    rowType: 3,
    hot: 1,
    page: 1,
    pageSize: 12,
    sortByHotOrderId: true
  })

  suggestedArr.value = [...new Set(hotGameResult.list.map(item => item.itemName?.trim() ?? ''))]
    .filter(Boolean)
    .slice(0, 6)
}

const syncSearchHistory = (keyword: string) => {
  gameStore.addSearchHistory(keyword)
}

const onSearch = () => {
  const normalizedKeyword = searchText.value.trim()

  activeSearchKeyword.value = normalizedKeyword
  showHistoryPanel.value = false
  syncSearchHistory(normalizedKeyword)
}

const goSearch = (item: string) => {
  searchText.value = item
  activeSearchKeyword.value = item.trim()
  showHistoryPanel.value = false
  syncSearchHistory(item)
}

const deleteItme = (item: string) => {
  gameStore.removeSearchHistory(item)
}

const deleteAll = () => {
  gameStore.clearSearchHistory()
}

const clearSearch = () => {
  searchText.value = ''
  activeSearchKeyword.value = ''
  showHistoryPanel.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (!searchRef.value) return

  const target = e.target as Node
  if (!searchRef.value.contains(target)) {
    showHistoryPanel.value = false
  }
}

// 是否已登录
const isLoggedIn = computed(() => {
  return Boolean(userInfo.value?.tradeToken)
})
const { tabButtons, lobbyButtons, hasLoaded, isLobbyButtonsLoading, loadCasinoLobbyButtons } =
  useCasinoTabButtons({
    isLoggedIn
  })

const getGameData = async (forceRefresh = false) => {
  try {
    await loadCasinoLobbyButtons(forceRefresh)
  } catch (error) {
    console.error('getGameData failed', error)
  }
}

watch(
  () => getCurrentTab.value,
  async tab => {
    if (!tab) return

    await nextTick()
    const index = tabButtons.value.findIndex(item => item.sysGameTypeCode === tab.sysGameTypeCode)
    if (index !== -1) {
      scrollTabIntoView(index, 'auto')
      hasSyncedActiveTab.value = true
    }
  },
  { immediate: true }
)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  gameStore.loadSearchHistory()
  getGameData()
  void getQuerySlideshow()
  void loadSuggestedGames()
  scrollPageToTop()
  updateScrollState()

  document.addEventListener('click', handleClickOutside)
  if (tabScrollRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateScrollState()
    })

    resizeObserver.observe(tabScrollRef.value)
  }
})

onActivated(() => {
  nextTick(() => {
    const el = tabScrollRef.value
    if (!el) return

    el.scrollTo({
      left: tabScrollLeft.value,
      behavior: 'auto'
    })

    const currentIndex = tabButtons.value.findIndex(
      item => item.sysGameTypeCode === currentTabCode.value
    )

    if (currentIndex !== -1) {
      scrollTabIntoView(currentIndex, 'auto')
    }

    updateScrollState()
  })
})

onDeactivated(() => {
  tabScrollLeft.value = tabScrollRef.value?.scrollLeft ?? tabScrollLeft.value
})

onUnmounted(() => {
  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer)
  }

  resizeObserver?.disconnect()
  document.removeEventListener('click', handleClickOutside)
})

watch(searchText, value => {
  if (value.trim()) {
    if (searchDebounceTimer) {
      window.clearTimeout(searchDebounceTimer)
    }

    searchDebounceTimer = window.setTimeout(() => {
      onSearch()
    }, 300)
    return
  }

  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer)
  }

  activeSearchKeyword.value = ''
})

watch(
  () => props.tabKey,
  (value, previousValue) => {
    if (value === previousValue) {
      return
    }

    clearSearch()
    scrollPageToTop()
  }
)

watch(
  () => [locale.value, isMobile.value, isLoggedIn.value],
  () => {
    void getQuerySlideshow()
  }
)

watch(
  () => locale.value,
  () => {
    void getGameData(true)
  }
)
</script>

<style scoped lang="scss"></style>
