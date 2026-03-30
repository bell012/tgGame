<template>
  <div class="casino-page p-0 sm:p-4 w-full">
    <div class="banner bg-bg-3 relative aspect-[1.73] sm:aspect-[4.785] rounded-xl">
      <img
        class="absolute right-0 bottom-0 w-full md:w-auto md:h-full"
        src="/src/static/img/casino/banner_bg.webp"
        alt="casino"
      />
      <div
        class="absolute left-2 top-0 flex h-full origin-top flex-col py-4 sm:left-[14%] sm:top-1/2 sm:-translate-y-1/2 sm:h-auto sm:items-center sm:py-0 sm:text-center"
      >
        <h1
          class="font-inter text-[20px] font-bold leading-normal text-[var(--color-text-level-1,#FFF)]"
        >
          {{ t('casino.banner_title') }}
        </h1>
        <div
          class="rounded-xl p-0 text-lg font-semibold sm:mt-4 sm:px-[60px] sm:py-[12px] sm:backdrop-blur-md sm:bg-[rgba(169,169,169,0.2)]"
        >
          <h2
            class="font-inter text-[12px] font-medium leading-[18px] text-[var(--color-text-level-1,#FFF)]"
          >
            {{ t('casino.banner_sign_up') }}
          </h2>
          <h2
            class="font-inter text-[14px] font-bold leading-normal text-[var(--color-theme-level-1,#2AEE88)]"
          >
            ₱1,176,029.77
          </h2>
          <h2
            class="font-inter text-[12px] font-medium leading-[18px] text-[var(--color-text-level-1,#FFF)]"
          >
            {{ t('casino.banner_subtitle') }}
          </h2>
        </div>
        <button
          class="flex justify-center items-center mt-auto w-[94px] h-[35px] py-[9px] px-[15px] pl-[16px] rounded-lg bg-[linear-gradient(90deg,#24EE89_0%,#9FE871_100%)] shadow-[0_0_12px_rgba(35,238,136,0.3),0_-2px_0_#1DCA6A_inset] font-inter text-[14px] font-bold leading-normal text-center text-[var(--color-text-level-4,#000)] sm:mt-5 sm:w-[200px]"
          type="button"
          @click.stop="showLoginModal = true"
        >
          {{ t('casino.join_now') }}
        </button>
      </div>
    </div>
    <div
      ref="searchRef"
      class="relative flex items-center self-stretch py-[10px] px-[10px] rounded-lg border mt-[10px] border-[var(--color-opacity-10,rgba(255,255,255,0.1))] bg-[var(--color-opacity-6,rgba(255,255,255,0.06))] focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-400/40 transition"
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
        class="absolute left-0 right-0 p-4 top-full w-full z-20 mt-3 flex flex-col items-center rounded-lg bg-[var(--color-background-level-2)] border border-[var(--color-border-level-1)]"
      >
        <button
          class="absolute -right-2 -top-2 w-5 h-5 bg-bg-4 flex items-center justify-center z-10 rounded-full"
          @click.stop="showHistoryPanel = false"
        >
          <CloseIcon class="w-[12px] h-[12px] fill-text-1" />
        </button>
        <div class="text-xs text-[var(--color-text-level-2)]">
          {{ t('casino.search_tips') }}
        </div>
        <!-- 历史记录 -->
        <div class="flex justify-between w-full text-xs my-2.5">
          <div class="font-bold">{{ t('casino.history') }}</div>
          <div class="text-[var(--color-text-level-2)]" @click.stop="deleteAll()">
            {{ t('casino.clear') }}（{{ searchHistory?.length }}）
          </div>
        </div>
        <div class="w-full">
          <div v-if="searchHistory?.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(item, inx) in searchHistory.slice(0, 5)"
              :key="inx"
              class="px-1.5 py-1 rounded bg-[var(--color-opacity-10)] inline-flex items-center"
            >
              <div
                class="text-xs text-[var(--color-text-level-2)] mr-0.5 break-words max-w-full"
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
              class="px-1.5 py-1 rounded bg-[var(--color-opacity-10)] flex items-center"
            >
              <div
                class="text-xs text-[var(--color-text-level-2)] break-words max-w-full"
                @click.stop="goSearch(item)"
              >
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
        v-if="canScrollLeft"
        class="absolute left-0 top-0 pr-2 h-[38px] z-10 hidden sm:flex items-center justify-center bg-[var(--color-background-level-1)]"
      >
        <button
          class="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-[var(--color-opacity-10)]"
          @click="scrollLeft"
        >
          <div class="icon size-4 fill-text-1">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
        </button>
      </div>
      <!-- 顶部横行滚动tab选择 -->
      <div
        :class="{
          'sm:ml-8': canScrollLeft,
          'sm:mr-8': canScrollRight
        }"
      >
        <div
          ref="tabScrollRef"
          class="flex w-full flex-row overflow-x-auto scrollbar-none my-3.5 gap-0.5"
          @scroll="updateScrollState"
        >
          <button
            v-for="(item, inx) in tabList"
            :key="inx"
            :ref="el => (tabRefs[inx] = el as HTMLButtonElement)"
            :class="{
              'bg-[var(--color-opacity-10)]': item.id === currentTabId,
              active: item.id === currentTabId
            }"
            class="flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center lg:hover:bg-[var(--color-opacity-10)]"
            @click.stop="onTabButton(item)"
          >
            <component
              :is="casinoIcons[item.icon]"
              :class="item.id === currentTabId ? 'fill-primary' : 'fill-text-2'"
              class="w-5 h-5 mr-[7px]"
            />
            <div
              :class="item.id === currentTabId ? 'text-text-1' : 'text-text-2'"
              class="font-[700]"
            >
              {{ item.name }}
            </div>
          </button>
        </div>
      </div>

      <!-- 右箭头 -->
      <div
        v-if="canScrollRight"
        class="absolute right-0 top-0 pl-2 h-[38px] z-10 hidden sm:flex items-center justify-center bg-[var(--color-background-level-1)]"
      >
        <button
          class="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-[var(--color-opacity-10)]"
          @click="scrollRight"
        >
          <div class="icon size-4 rotate-180 fill-text-1">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- 6种样式 -->
      <div class="tabs-content min-h-48">
        <component :is="getPageStyle" :modules="tabList" />
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
const tabList = ref([
  {
    id: 1,
    style: 1,
    name: 'Lobby',
    key: '',
    icon: 'lobby',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12',
      'game13',
      'game14',
      'game15',
      'game16'
    ]
  },
  {
    id: 2,
    style: 2,
    name: 'TG Originals',
    key: 'originate',
    icon: 'tg_originals',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12',
      'game13',
      'game14',
      'game15',
      'game16'
    ]
  },
  {
    id: 3,
    style: 2,
    name: 'Hot Games',
    key: 'hot_games',
    icon: 'hot_games',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12',
      'game13',
      'game14',
      'game15',
      'game16'
    ]
  },
  {
    id: 4,
    style: 3,
    name: 'Slots',
    key: 'slots',
    icon: 'slots',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10'
    ]
  },
  {
    id: 5,
    style: 3,
    name: 'Live Casino',
    key: 'live_casino',
    icon: 'live_casino',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12'
    ]
  },
  {
    id: 6,
    style: 3,
    name: 'Table Games',
    key: 'table_games',
    icon: 'table_games',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12'
    ]
  },
  {
    id: 7,
    style: 3,
    name: 'Fishing',
    key: 'fishing',
    icon: 'fishing',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12'
    ]
  },
  {
    id: 8,
    style: 2,
    name: 'Table Tennis',
    key: 'table_tennis',
    icon: 'table_tennis',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12',
      'game13',
      'game14'
    ]
  },
  {
    id: 9,
    style: 4,
    name: 'Game Provider',
    key: 'game_provider',
    icon: 'game_provider',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12',
      'game13',
      'game14'
    ]
  },
  {
    id: 10,
    style: 2,
    name: 'Favorites',
    key: 'favorites',
    icon: 'favorites',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12',
      'game13',
      'game14'
    ]
  },
  {
    id: 11,
    style: 2,
    name: 'Recent',
    key: 'recent',
    icon: 'recent',
    items: [
      'game1',
      'game2',
      'game3',
      'game4',
      'game5',
      'game6',
      'game7',
      'game8',
      'game9',
      'game10',
      'game11',
      'game12',
      'game13',
      'game14'
    ]
  }
])

const getCurrentTab = computed(() => {
  const key = props.tabKey ?? ''
  return tabList.value.find(tab => tab.key === key)
})
const currentTabId = computed(() => getCurrentTab.value?.id ?? 1)
const currentTabStyle = computed(() => getCurrentTab.value?.style ?? 1)
const getPageStyle = computed(() => {
  switch (currentTabStyle.value) {
    case 1:
      return pageStyle1
    case 2:
      return pageStyle2
    case 3:
      return pageStyle3
    case 4:
      return pageStyle4
    default:
      return pageStyle2
  }
})
const searchRef = ref<HTMLDivElement | null>(null)
const tabScrollRef = ref<HTMLDivElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

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
}

const scrollRight = () => {
  const el = tabScrollRef.value
  if (!el) return

  el.scrollBy({
    left: el.clientWidth,
    behavior: 'smooth'
  })
}

const onTabButton = (tab: any) => {
  if (tab.key === '') return navigateTo('/casino')
  navigateTo(`/casino/${tab.key}`)
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

watch(
  () => getCurrentTab.value,
  async tab => {
    if (!tab) return

    await nextTick()
    const index = tabList.value.findIndex(item => item.key === tab.key)
    if (index !== -1) {
      tabRefs.value[index]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      })
    }
  },
  { immediate: true }
)

let resizeObserver: ResizeObserver | null = null
onMounted(() => {
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
