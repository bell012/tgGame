<template>
  <div class="casino-page p-0 sm:p-4 w-full">
    <div class="banner bg-bg-3 relative aspect-[1.73] sm:aspect-[4.785] rounded-xl">
      <img
        class="absolute right-0 bottom-0 w-full"
        src="/src/static/img/casino/banner_bg.webp"
        alt="casino"
      />
      <div
        class="absolute left-2 top-0 flex h-full origin-top flex-col py-4 sm:left-[14%] sm:top-[6%] sm:h-auto sm:items-center sm:py-0 sm:text-center"
      >
        <h1
          class="font-inter text-[20px] font-bold leading-normal text-[var(--color-text-level-1,#FFF)]"
        >
          {{ t('locales.casino.banner_title') }}
        </h1>
        <div>
          <h2
            class="font-inter text-[12px] font-medium leading-[18px] text-[var(--color-text-level-1,#FFF)]"
          >
            {{ t('locales.casino.banner_sign_up') }}
          </h2>
          <h2
            class="font-inter text-[14px] font-bold leading-normal text-[var(--color-theme-level-1,#2AEE88)]"
          >
            ₱1,176,029.77
          </h2>
          <h2
            class="font-inter text-[12px] font-medium leading-[18px] text-[var(--color-text-level-1,#FFF)]"
          >
            {{ t('locales.casino.banner_subtitle') }}
          </h2>
        </div>
        <button
          class="flex justify-center items-center mt-auto w-[94px] h-[35px] py-[9px] px-[15px] pl-[16px] rounded-lg bg-[linear-gradient(90deg,#24EE89_0%,#9FE871_100%)] shadow-[0_0_12px_rgba(35,238,136,0.3),0_-2px_0_#1DCA6A_inset] font-inter text-[14px] font-bold leading-normal text-center text-[var(--color-text-level-4,#000)]"
          type="button"
          @click.stop="showLoginModal = true"
        >
          {{ t('locales.casino.join_now') }}
        </button>
      </div>
    </div>
    <div
      class="relative flex items-center self-stretch py-[10px] px-[10px] rounded-lg border mt-[10px] border-[var(--color-opacity-10,rgba(255,255,255,0.1))] bg-[var(--color-opacity-6,rgba(255,255,255,0.06))] focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-400/40 transition"
    >
      <img class="w-[18px] h-[18px]" src="/src/static/img/casino/search.webp" alt="search" />
      <input
        v-model="searchText"
        @keydown.enter.prevent="onSearch"
        @focus="showHistoryPanel = true"
        @blur="showHistoryPanel = false"
        class="flex-1 ml-[10px] h-[18px] bg-transparent outline-none focus:outline-none focus:ring-0"
        type="text"
        :placeholder="t('locales.casino.placeholder')"
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
        class="absolute left-0 right-0 p-4 top-full w-full z-20 mt-3 flex flex-col items-center rounded-lg bg-[var(--color-background-level-2)] border border-[var(--color-border-level-1)]"
      >
        <button
          class="absolute -right-2 -top-2 w-5 h-5 bg-bg-4 flex items-center justify-center z-10 rounded-full"
          @click="showHistoryPanel = false"
        >
          <CloseIcon class="w-[12px] h-[12px] fill-text-1" />
        </button>
        <div class="text-xs text-[var(--color-text-level-2)]">
          {{ t('locales.casino.search_tips') }}
        </div>
        <!-- 历史记录 -->
        <div class="flex justify-between w-full text-xs my-2.5">
          <div class="font-bold">{{ t('locales.casino.history') }}</div>
          <div class="text-[var(--color-text-level-2)]" @click.stop="deleteAll()">
            {{ t('locales.casino.clear') }}（{{ searchHistory?.length }}）
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
          <div class="font-bold">{{ t('locales.casino.suggested') }}</div>
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
    <div class="min-h-screen w-full">
      <!-- 顶部横行滚动tab选择 -->
      <div class="flex w-full flex-row overflow-x-auto scrollbar-none my-3.5 gap-0.5">
        <button
          v-for="(item, inx) in tabList"
          :key="inx"
          :class="{
            'bg-[var(--color-opacity-10)]': item.id === currentTabId,
            active: item.id === currentTabId
          }"
          class="flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center hover:bg-[var(--color-opacity-10)]"
          @click.stop="onTabButton(item)"
        >
          <component
            :is="casinoIcons[item.icon]"
            :class="item.id === currentTabId ? 'fill-primary' : 'fill-text-2'"
            class="w-5 h-5 mr-[7px]"
          />
          <div :class="item.id === currentTabId ? 'text-text-1' : 'text-text-2'" class="font-[700]">
            {{ item.name }}
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LoginModal from '@/components/login_register/LoginModal.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import { casinoIcons } from '@/static/svg/casino'
import pageStyle1 from './components/pageStyle1.vue'
import pageStyle2 from './components/pageStyle2.vue'

const { t } = useI18n()

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
const currentTabId = ref(1)
const currentTabStyle = ref(1)
const tabList = ref([
  {
    id: 1,
    style: 1,
    name: '大厅',
    icon: 'home'
  },
  {
    id: 2,
    style: 2,
    name: 'BC 原创',
    icon: 'bc'
  },
  {
    id: 3,
    style: 3,
    name: '老虎机',
    icon: 'slots'
  },
  {
    id: 4,
    style: 4,
    name: '扑克',
    icon: 'poker'
  },
  {
    id: 5,
    style: 5,
    name: '供应商',
    icon: 'favorites_full'
  },
  {
    id: 6,
    style: 6,
    name: '游戏主题',
    icon: 'themes'
  }
])

const getPageStyle = computed(() => {
  switch (currentTabStyle.value) {
    case 1:
      return pageStyle1
    case 2:
      return pageStyle2
    default:
      return pageStyle2
  }
})

const onTabButton = (tab: any) => {
  currentTabId.value = tab.id
  currentTabStyle.value = tab.style
}

const onSearch = () => {
  console.log('触发搜索:', searchText.value)
}

const goSearch = (item: string) => {
  console.log('点击搜索历史和建议:', item)
}

const deleteItme = (item: string) => {
  console.log('删除搜索历史记录', item)
}

const deleteAll = () => {
  console.log('删除全部搜索历史记录')
}
</script>

<style scoped lang="scss"></style>
