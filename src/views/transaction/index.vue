<template>
  <div class="bg-bg-1">
    <H5Header title="Transaction" showSort @sort="handleSort" />

    <div>
      <div v-if="!hasBets">
        <NoData />
      </div>

      <div v-else>
        <RecordList :bets="betList" @select="handleBetClick" />
      </div>
    </div>

    <FilterPopup
      v-model:visible="showFilterPopup"
      v-model="filterValues"
      :filter-groups="filterGroups"
      @apply="handleFilterApply"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import NoData from './components/noData.vue'
import RecordList, { type BetItem } from './components/recordList.vue'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import goldIcon from '@/static/svg/gold.svg?url'
import { navigateTo } from '@/utils/router'

const betList = ref<BetItem[]>([
  {
    id: 1,
    gameName: 'Dragon Hatch',
    gameIcon: goldIcon,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 2,
    gameName: 'Dragon Hatch',
    gameIcon: goldIcon,
    betAmount: '1000',
    result: 'loss',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  }
])

const hasBets = computed(() => betList.value.length > 0)

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

const handleBetClick = (bet: BetItem) => {
  navigateTo(`/transaction-details/${bet.id}`)
}
</script>
