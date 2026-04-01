<template>
  <div>
    <!-- PC 端布局 -->
    <WalletLayout current-tab="transaction" class="hidden md:block">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <PcLayout />
      </div>
    </WalletLayout>

    <!-- H5 端布局 -->
    <div class="block md:hidden fixed inset-0 bg-bg-1 overflow-y-auto">
      <H5Header :title="$t('personalCenter.transaction')" :show-sort="true" @sort="handleSort" />

      <div class="py-3.5 px-3.5">
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
            class="bg-bg-2 rounded-lg py-2.5 px-3.5 cursor-pointer"
            @click="handleBetClick(bet)"
          >
            <div class="flex items-center mb-5">
              <div
                class="w-10 h-10 rounded-full bg-opacity-5 mr-1.5 flex items-center justify-center"
              >
                <Transaction_add
                  v-if="bet.result === 'win'"
                  class="w-[22px] h-[22px] text-text-1"
                />
                <Transaction_dec
                  v-if="bet.result === 'loss'"
                  class="w-[22px] h-[22px] text-text-1"
                />
              </div>

              <div class="flex items-center justify-between w-full">
                <h3 class="text-text-1 font-[700] text-sm">
                  {{ bet.gameName }}
                </h3>
                <p>{{ bet.result === 'win' ? '+' : '-' }}{{ bet.betAmount }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between">
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
import { ref } from 'vue'
import { navigateTo } from '@/utils/router'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import WalletLayout from '../index.vue'
import PcLayout from './pc-layout.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import noDataImg from '@/static/img/personalCenter/noData.png'
import bet from '@/static/img/personalCenter/bet.png'
import Transaction_add from '@/static/svg/transaction_add.svg?component'
import Transaction_dec from '@/static/svg/transaction_dec.svg?component'

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
  navigateTo(`/transaction-details/${bet.id}`, {
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
