<template>
  <div>
    <!-- PC 端布局 -->
    <div class="hidden md:block max-w-[1336px] mx-auto">
      <h2 class="text-xl font-[700] text-text-1 mb-4">{{ $t('wallet.title') }}</h2>
      <div class="flex justify-center gap-6">
        <!-- 左侧菜单 -->
        <aside class="w-[280px] flex-shrink-0">
          <div class="bg-bg-2 rounded-xl p-4">
            <nav class="space-y-2.5">
              <div
                v-for="item in menuItems"
                :key="item.tab"
                :class="[
                  'flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-all text-base',
                  currentTab === item.tab ? 'bg-theme-primary text-text-4 font-bold' : 'text-text-2'
                ]"
                @click="handleMenuClick(item.path)"
              >
                <component :is="item.icon" class="w-6 h-6" />
                {{ item.label }}
              </div>
            </nav>
          </div>
        </aside>

        <!-- 右侧内容区 -->
        <main class="flex-1 min-w-0">
          <div class="bg-bg-2 rounded-xl overflow-hidden">
            <PcLayout />
          </div>
        </main>
      </div>

      <!-- 公共底部 -->
      <CommonFooter class="mt-[40px]" />
    </div>

    <!-- H5 端布局 -->
    <div class="block md:hidden fixed inset-0 bg-bg-1 overflow-y-auto">
      <H5Header :title="$t('betHistory.title')" :show-sort="true" @sort="handleSort" />

      <div class="py-3.5">
        <!-- 无数据状态 -->
        <div v-if="!hasBets" class="flex flex-col items-center justify-center mt-[100px]">
          <img :src="noDataImg" alt="No data" class="h-[200px] w-auto mb-2.5" />
          <p class="text-text-1 text-xs font-[500] mb-5">
            {{ $t('betHistory.noBetHistoryYet') }}
          </p>
          <button
            class="w-[200px] h-[40px] rounded-lg bg-theme-primary text-text-4 font-[700] text-sm flex items-center justify-center"
            @click="handleStartPlaying"
          >
            {{ $t('betHistory.startPlaying') }}
          </button>
        </div>

        <!-- 有数据状态 -->
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="bet in betList"
            :key="bet.id"
            class="bg-bg-2 rounded-lg py-2.5 cursor-pointer"
            @click="handleBetClick(bet)"
          >
            <div class="flex items-center px-3.5">
              <div class="w-[49px] h-[65px] rounded-lg overflow-hidden flex-shrink-0 mr-2.5">
                <img :src="bet.gameIcon" alt="" class="w-full h-full object-cover" />
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="text-text-1 font-[700] text-sm mb-2.5">
                  {{ bet.gameName }}
                </h3>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-text-1">
                    {{ $t('betHistory.betAmount') }} : {{ bet.betAmount }}
                  </span>
                  <span
                    :class="[
                      'font-bold',
                      bet.result === 'win'
                        ? 'text-secondary-2'
                        : bet.result === 'loss'
                          ? 'text-secondary-4'
                          : 'text-text-1'
                    ]"
                  >
                    {{ bet.result === 'win' ? $t('betHistory.win') : $t('betHistory.loss') }}
                    :
                    {{ bet.resultAmount }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 线 -->
            <div class="w-full h-[1px] bg-opacity-15 my-2.5"></div>

            <div class="flex items-center justify-between px-3.5">
              <p class="text-text-2 text-xs">
                {{ bet.time }}
              </p>
              <div
                class="size-[20px] bg-opacity-10 rounded-md flex items-center justify-center cursor-pointer"
                @click.stop="handleBetClick(bet)"
              >
                <ArrowRightIcon class="w-3.5 h-3.5 text-text-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选弹窗 -->
      <FilterPopup
        v-model:visible="showFilterPopup"
        v-model="filterValues"
        :filter-groups="filterGroups"
        @apply="handleFilterApply"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import PcLayout from './pc-layout.vue'
import CommonFooter from '@/components/commonFooter.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import BetSvg from '@/static/svg/bet.svg?component'
import noDataImg from '@/static/img/personalCenter/noData.png'
import bet from '@/static/img/personalCenter/bet.png'

const { t } = useI18n()

// PC 端菜单相关
const currentTab = ref('bet-history')
const menuItems = computed(() => [
  {
    path: '/bet-history',
    tab: 'bet-history',
    label: t('wallet.betHistory'),
    icon: BetSvg
  }
])

const handleMenuClick = (path: string) => {
  navigateTo(path)
}

interface BetItem {
  id: number
  gameName: string
  gameIcon: string
  betAmount: string
  result: 'win' | 'loss'
  resultAmount: string
  time: string
}

const hasBets = ref(true)

const betList = ref<BetItem[]>([
  {
    id: 1,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1001',
    result: 'loss',
    resultAmount: '1001',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 2,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1002',
    result: 'win',
    resultAmount: '1002',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 3,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'loss',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 4,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 5,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 6,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 7,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 8,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 9,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 10,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 11,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 12,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  }
])

const handleStartPlaying = () => {
  navigateTo('/')
}

const handleBetClick = (bet: BetItem) => {
  navigateTo(`/bet-details/${bet.id}`, {
    state: { betData: JSON.stringify(bet) }
  })
}

// 筛选弹窗
const showFilterPopup = ref(false)
const filterValues = ref<Record<string, string | string[]>>({})

// 定义筛选组
const filterGroups: FilterGroup[] = [
  {
    title: 'Game Type Selection',
    options: [
      { label: 'Slot', value: 'slot' },
      { label: 'Chess', value: 'chess' },
      { label: 'Fishing', value: 'fishing' },
      { label: 'Casino', value: 'casino' },
      { label: 'Sports', value: 'sports' },
      { label: 'Lottery', value: 'lottery' }
    ]
  },
  {
    title: 'Win/Loss Selection',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Win', value: 'win' },
      { label: 'Loss', value: 'loss' }
    ]
  },
  {
    title: 'Statuses Selection',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Settled', value: 'settled' },
      { label: 'Unsettled', value: 'unsettled' }
    ]
  },
  {
    title: 'Date Selection',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Today', value: 'today' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Last 3 Days', value: 'last3days' },
      { label: 'Last 15 Days', value: 'last15days' },
      { label: 'Last 30 Days', value: 'last30days' }
    ]
  },
  {
    title: 'Platform Selection',
    options: [
      { label: 'All', value: 'all' },
      { label: 'PG', value: 'pg' },
      { label: 'PA', value: 'pa' },
      { label: 'JDB', value: 'jdb' },
      { label: 'CQ9', value: 'cq9' },
      { label: 'MG', value: 'mg' }
    ]
  }
]

const handleSort = () => {
  showFilterPopup.value = true
}

const handleFilterApply = (values: Record<string, string | string[]>) => {
  console.log('Filter applied with values:', values)
}
</script>

<style scoped lang="scss"></style>
