<template>
  <div class="casino-page pt-2.5 sm:p-4 w-full font-['Inter']" :style="mobileStyle">
    <div
      v-if="!isLoggedIn"
      class="banner bg-bg-3 relative aspect-[1.73] sm:aspect-[4.785] rounded-xl mb-2.5"
    >
      <img
        class="absolute right-0 bottom-0 w-full md:w-auto md:h-full"
        src="/src/static/img/casino/banner_bg.webp"
        alt="casino"
      />
      <div
        class="absolute left-2 top-0 flex h-full origin-top flex-col py-4 sm:left-[14%] sm:top-1/2 sm:-translate-y-1/2 sm:h-auto sm:items-center sm:py-0 sm:text-center"
      >
        <h1 class="font-inter text-xl font-bold leading-normal text-text-1">
          {{ t('casino.banner_title') }}
        </h1>
        <div
          class="rounded-xl p-0 text-lg font-semibold sm:mt-4 sm:px-[60px] sm:py-3 sm:backdrop-blur-md sm:bg-[rgba(169,169,169,0.2)]"
        >
          <h2 class="font-inter text-xs font-medium leading-[18px] text-text-1">
            {{ t('casino.banner_sign_up') }}
          </h2>
          <h2 class="font-inter text-xs sm:text-sm font-bold leading-normal text-theme-primary">
            ₱1,176,029.77
          </h2>
          <h2 class="font-inter text-xs font-medium leading-[18px] text-text-1">
            {{ t('casino.banner_subtitle') }}
          </h2>
        </div>
        <button
          class="flex justify-center items-center mt-auto w-[94px] h-[35px] py-[9px] px-[15px] pl-[16px] rounded-lg btn-primary text-xs sm:text-sm font-bold leading-normal text-center text-text-4 sm:mt-5 sm:w-[200px]"
          type="button"
          @click.stop="showLoginModal = true"
        >
          {{ t('casino.join_now') }}
        </button>
      </div>
    </div>
    <div
      ref="searchRef"
      class="relative flex items-center self-stretch py-[10px] px-[10px] rounded-lg border border-opacity-10 bg-opacity-6 focus-within:border-theme-primary focus-within:ring-2 transition"
    >
      <img class="w-[18px] h-[18px]" src="/src/static/img/casino/search.webp" alt="search" />
      <input
        v-model="searchText"
        @keydown.enter.prevent="onSearch"
        @focus="showHistoryPanel = true"
        class="flex-1 ml-[10px] h-[18px] bg-transparent outline-none focus:outline-none focus:ring-0"
        type="text"
        :placeholder="t('casino.placeholder')"
      />
      <button
        v-show="searchText"
        class="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-1 rounded-lg flex items-center justify-center z-10"
        @click="searchText = ''"
      >
        <CloseIcon class="w-[18px] h-[18px] fill-text-1" />
      </button>
      <div
        v-show="showHistoryPanel && !searchText"
        @click.stop="showHistoryPanel = false"
        class="absolute left-0 right-0 p-4 top-full w-full z-20 mt-3 flex flex-col items-center rounded-lg bg-bg-2 border border-[var(--color-border-level-1)]"
      >
        <button
          class="absolute -right-2 -top-2 w-5 h-5 bg-bg-4 flex items-center justify-center z-10 rounded-full"
          @click.stop="showHistoryPanel = false"
        >
          <CloseIcon class="w-[12px] h-[12px] fill-text-1" />
        </button>
        <div class="text-xs text-text-2">
          {{ t('casino.search_tips') }}
        </div>
        <!-- 历史记录 -->
        <div class="flex justify-between w-full text-xs my-2.5">
          <div class="font-bold">{{ t('casino.history') }}</div>
          <div class="text-text-2" @click.stop="deleteAll()">
            {{ t('casino.clear') }}（{{ searchHistory?.length }}）
          </div>
        </div>
        <div class="w-full">
          <div v-if="searchHistory?.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(item, inx) in searchHistory.slice(0, 5)"
              :key="inx"
              class="px-1.5 py-1 rounded bg-opacity-10 inline-flex items-center"
            >
              <div
                class="text-xs text-text-2 mr-0.5 break-words max-w-full"
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
    <div class="min-h-screen w-full relative">
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
              'bg-opacity-10': item.sysGameTypeCode === currentTabCode,
              active: item.sysGameTypeCode === currentTabCode
            }"
            class="flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center lg:hover:bg-opacity-10"
            @click.stop="onTabButton(item)"
          >
            <img
              v-if="typeof item?.icon === 'string'"
              :src="item.icon"
              class="w-5 h-5 mr-[7px] object-contain"
            />
            <component
              v-else-if="item?.icon"
              :is="item.icon"
              :class="item.sysGameTypeCode === currentTabCode ? 'fill-primary' : 'fill-text-2'"
              class="w-5 h-5 mr-[7px]"
            />
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
        <component :is="getPageStyle" :modules="lobbyButtons" />
      </div>
    </div>
  </div>

  <!-- 注册弹窗 -->
  <LoginModal v-model="showLoginModal" default-tab="register" />
  <CommonFooter class="hidden sm:block" />
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCasinoTabButtons } from '@/composables/useCasinoTabButtons'
import { useLayoutStore } from '@/stores/layout'
import { useIsMobile } from '@/composables/useMediaQuery'
import LoginModal from '@/components/login_register/LoginModal.vue'
import CommonFooter from '@/components/commonFooter.vue'
import { navigateTo } from '@/utils/router'
import CloseIcon from '@/static/svg/close.svg?component'
import { casinoIcons } from '@/static/svg/casino'
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

const { t } = useI18n()
const layoutStore = useLayoutStore()
const isMobile = useIsMobile()
const mobileStyle = computed(() => {
  if (isMobile.value) {
    return {
      marginTop: `${layoutStore.TOPNAV_HEIGHT}px`
    }
  }
})

const tabRefs = ref<HTMLButtonElement[]>([])
const showLoginModal = ref(false)
const showHistoryPanel = ref(false)
const searchText = ref('')
const searchHistory = ref<string[]>(['Sweet', 'Gates', 'Lucky', ' Llama', 'Olympus', 'Duck'])
const suggestedArr = ref<string[]>([
  'Sweet Rush Bonanza',
  'Duck Hunters',
  'Gates of Olympus Super Scatter',
  'Sugar Rush 1000',
  'Lucky Coming',
  'The Llama Adventure'
])

const getCurrentTab = computed(() => {
  const key = props.tabKey ?? ''
  return tabButtons.value.find(tab => tab.sysGameTypeCode === key)
})
const currentTabCode = computed(() => getCurrentTab.value?.sysGameTypeCode)
const getPageStyle = computed(() => {
  switch (getCurrentTab.value?.sysGameTypeCode) {
    case '':
      return pageStyle1
    case '1':
      return pageStyle2
    case '2':
      return pageStyle3
    case '4':
      return pageStyle4
    default:
      return pageStyle2
  }
})
const searchRef = ref<HTMLDivElement | null>(null)
const tabScrollRef = ref<HTMLDivElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const hasSyncedActiveTab = ref(false)

const updateScrollState = () => {
  const el = tabScrollRef.value
  if (!el) return

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

const onTabButton = (tab: any) => {
  if (tab.sysGameTypeCode === '') return navigateTo('/casino')
  navigateTo(`/casino/${tab.sysGameTypeCode}`)
}

const onSearch = () => {
  console.log('触发搜索:', searchText.value)
}

const goSearch = (item: string) => {
  searchText.value = item
  console.log('点击搜索历史和建议:', item)
}

const deleteItme = (item: string) => {
  console.log('删除搜索历史记录', item)
}

const deleteAll = () => {
  console.log('删除全部搜索历史记录')
}

const handleClickOutside = (e: MouseEvent) => {
  if (!searchRef.value) return

  const target = e.target as Node
  if (!searchRef.value.contains(target)) {
    showHistoryPanel.value = false
  }
}

// 用户信息
const userInfo = ref<any>(null)

// 是否已登录
const isLoggedIn = computed(() => {
  return userInfo.value && userInfo.value.tradeToken
})
const { tabButtons, lobbyButtons, loadCasinoTabButtons } = useCasinoTabButtons({ isLoggedIn })
// localStorage 用户信息
const loadUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo)
    } catch (error) {
      console.error(error)
      userInfo.value = null
    }
  }
}

const getGameData = async (forceRefresh = false) => {
  try {
    await loadCasinoTabButtons(forceRefresh)
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
      scrollTabIntoView(index, hasSyncedActiveTab.value ? 'smooth' : 'auto')
      hasSyncedActiveTab.value = true
    }
  },
  { immediate: true }
)

let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  loadUserInfo()
  getGameData()
  updateScrollState()

  document.addEventListener('click', handleClickOutside)
  if (tabScrollRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateScrollState()
    })

    resizeObserver.observe(tabScrollRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss"></style>
