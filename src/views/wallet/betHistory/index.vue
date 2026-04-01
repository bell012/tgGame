<template>
  <div>
    <!-- PC 端布局 -->
    <WalletLayout current-tab="bet-history" class="hidden md:block">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <PcLayout />
      </div>
    </WalletLayout>

    <!-- H5 端布局 -->
    <div class="fixed inset-0 block bg-bg-1 md:hidden flex flex-col overflow-hidden">
      <H5Header :title="$t('betHistory.title')" :show-sort="true" @sort="handleSort" />

      <div ref="scrollRoot" class="flex-1 overflow-y-auto">
        <div class="py-3.5 px-3.5">
          <!-- 无数据状态 -->
          <div
            v-if="error && dataList.length === 0"
            class="flex flex-col items-center justify-center mt-[100px] gap-3"
          >
            <p class="text-secondary-4 text-xs font-[500]" @click="handleRetry">
              {{ $t('common.requestError') }}
            </p>
          </div>

          <div
            v-else-if="!loading && dataList.length === 0"
            class="flex flex-col items-center justify-center mt-[100px]"
          >
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
              v-for="item in dataList"
              :key="item.id"
              class="bg-bg-2 rounded-lg py-2.5 cursor-pointer"
              @click="handleBetClick(item)"
            >
              <div class="flex items-center px-3.5">
                <div class="w-[49px] h-[65px] rounded-lg overflow-hidden flex-shrink-0 mr-2.5">
                  <img :src="item.gameIcon" alt="" class="w-full h-full object-cover" />
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-text-1 font-[700] text-sm mb-2.5">
                    {{ item.gameName }}
                  </h3>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-text-1">
                      {{ $t('betHistory.betAmount') }} : {{ item.betAmount }}
                    </span>
                    <span
                      :class="[
                        'font-bold',
                        item.result === 'win'
                          ? 'text-secondary-2'
                          : item.result === 'loss'
                            ? 'text-secondary-4'
                            : 'text-text-1'
                      ]"
                    >
                      {{ item.result === 'win' ? $t('betHistory.win') : $t('betHistory.loss') }}
                      :
                      {{ item.resultAmount }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 线 -->
              <div class="w-full h-[1px] bg-opacity-15 my-2.5"></div>

              <div class="flex items-center justify-between px-3.5">
                <p class="text-text-2 text-xs">
                  {{ item.time }}
                </p>
                <div
                  class="size-[20px] bg-opacity-10 rounded-md flex items-center justify-center cursor-pointer"
                  @click.stop="handleBetClick(item)"
                >
                  <ArrowRightIcon class="w-3.5 h-3.5 text-text-2" />
                </div>
              </div>
            </div>

            <p v-if="loading" class="py-3 text-center text-xs text-text-2">
              {{ dataList.length === 0 ? $t('common.loading') : $t('common.loadingMore') }}
            </p>
            <p
              v-else-if="error"
              class="py-3 text-center text-xs text-secondary-4"
              @click="handleRetry"
            >
              {{ $t('common.requestError') }}
            </p>
            <p
              v-else-if="finished && dataList.length > 0"
              class="py-3 text-center text-xs text-text-2"
            >
              {{ $t('betHistory.noMore') }}
            </p>

            <div ref="loadMoreSentinel" class="h-px w-full"></div>
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
import { computed, ref } from 'vue'
import Api from '@/api'
import type { QueryOrderInfoPageForm, QueryOrderInfoResult } from '@/api/interface/record.interface'
import { navigateTo } from '@/utils/router'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { getCurrentCurrency, getFormattedBalance } from '@/utils/locale'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import WalletLayout from '../index.vue'
import PcLayout from './pc-layout.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import noDataImg from '@/static/img/personalCenter/noData.png'
import bet from '@/static/img/personalCenter/bet.png'

type QueryRecord = QueryOrderInfoResult['records'][number]
type FilterValue = string | string[] | undefined

interface Item {
  id: number
  gameType: string
  gameName: string
  gameIcon: string
  betAmount: string
  result: 'win' | 'loss'
  resultAmount: string
  currency: string
  orderNo: string
  createdAt: string
  time: string
  rawData: QueryRecord
}

const PAGE_SIZE = 10
const { t } = useI18n()
const currentCurrency = getCurrentCurrency()

const scrollRoot = ref<HTMLElement | null>(null)
const loadMoreSentinel = ref<HTMLElement | null>(null)

const createDefaultFilterValues = () => ({
  time: 'all',
  winlost: 'all',
  status: 'all',
  gameType: 'all'
})

const filterValues = ref<Record<string, string | string[]>>(createDefaultFilterValues())

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'time',
    title: t('betHistory.filterGroups.time'),
    options: [
      { label: t('betHistory.filterOptions.all'), value: 'all' },
      { label: t('betHistory.filterOptions.today'), value: 'today' },
      { label: t('betHistory.filterOptions.yesterday'), value: 'yesterday' },
      { label: t('betHistory.filterOptions.last3Days'), value: 'last3days' },
      { label: t('betHistory.filterOptions.last15Days'), value: 'last15days' },
      { label: t('betHistory.filterOptions.last30Days'), value: 'last30days' }
    ]
  },
  {
    key: 'winlost',
    title: t('betHistory.filterGroups.winLoss'),
    options: [
      { label: t('betHistory.filterOptions.all'), value: 'all' },
      { label: t('betHistory.win'), value: '1' },
      { label: t('betHistory.loss'), value: '0' }
    ]
  },
  {
    key: 'status',
    title: t('betHistory.filterGroups.status'),
    options: [
      { label: t('betHistory.filterOptions.all'), value: 'all' },
      { label: t('betHistory.filterOptions.settled'), value: '1' },
      { label: t('betHistory.filterOptions.unsettled'), value: '0' }
    ]
  },
  {
    key: 'gameType',
    title: t('betHistory.filterGroups.gameType'),
    options: [
      { label: t('betHistory.filterOptions.all'), value: 'all' },
      { label: t('betHistory.filterOptions.lottery'), value: 'CP' },
      { label: t('betHistory.filterOptions.sports'), value: 'TY' },
      { label: t('betHistory.filterOptions.live'), value: 'ZR' },
      { label: t('betHistory.filterOptions.electronic'), value: 'DZ' },
      { label: t('betHistory.filterOptions.chess'), value: 'QP' },
      { label: t('betHistory.filterOptions.fishing'), value: 'BY' },
      { label: t('betHistory.filterOptions.esports'), value: 'DJ' }
    ]
  }
])

const getSingleValue = (value: FilterValue) => {
  if (Array.isArray(value)) {
    return value[0] ?? 'all'
  }

  return value ?? 'all'
}

const getTimeRange = (value: string) => {
  const now = new Date()
  const endOfDay = (date: Date) => {
    const next = new Date(date)
    next.setHours(23, 59, 59, 999)
    return next.getTime()
  }
  const startOfDay = (date: Date) => {
    const next = new Date(date)
    next.setHours(0, 0, 0, 0)
    return next.getTime()
  }

  if (value === 'all') {
    return { secondStartTime: null, secondEndTime: null }
  }

  if (value === 'today') {
    return {
      secondStartTime: startOfDay(now),
      secondEndTime: now.getTime()
    }
  }

  if (value === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    return {
      secondStartTime: startOfDay(yesterday),
      secondEndTime: endOfDay(yesterday)
    }
  }

  const dayMap: Record<string, number> = {
    last3days: 3,
    last15days: 15,
    last30days: 30
  }
  const days = dayMap[value]

  if (!days) {
    return { secondStartTime: null, secondEndTime: null }
  }

  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - (days - 1))

  return {
    secondStartTime: startOfDay(startDate),
    secondEndTime: now.getTime()
  }
}

const getGameTypeLabel = (code: string) => {
  const labelMap: Record<string, string> = {
    CP: t('betHistory.filterOptions.lottery'),
    TY: t('betHistory.filterOptions.sports'),
    ZR: t('betHistory.filterOptions.live'),
    DZ: t('betHistory.filterOptions.electronic'),
    QP: t('betHistory.filterOptions.chess'),
    BY: t('betHistory.filterOptions.fishing'),
    DJ: t('betHistory.filterOptions.esports')
  }

  return (labelMap[code] ?? code) || '--'
}

const formatAmount = (amount: number, currency?: string) =>
  getFormattedBalance(amount, currency || currentCurrency, 2)

const formatTime = (time: number) => new Date(time).toLocaleString()

const mapRecordToItem = (record: QueryRecord): Item => {
  const gameType = getGameTypeLabel(record.sysGameTypeCode)
  const gameName =
    record.remark ||
    record.betContent1 ||
    record.betContent2 ||
    [gameType, record.platformCode].filter(Boolean).join(' / ') ||
    record.gameCode ||
    record.betId ||
    '--'

  return {
    id: record.rowId,
    gameType,
    gameName,
    gameIcon: bet,
    betAmount: formatAmount(record.betAmount, record.currency),
    result: record.gameAmount >= 0 ? 'win' : 'loss',
    resultAmount: formatAmount(Math.abs(record.gameAmount), record.currency),
    currency: record.currency,
    orderNo: record.betId || record.issueId || String(record.rowId),
    createdAt: formatTime(record.createTime || record.betTime),
    time: formatTime(record.betTime),
    rawData: record
  }
}

const buildQueryForm = (page: number, pageSize: number): QueryOrderInfoPageForm => {
  const timeValue = getSingleValue(filterValues.value.time)
  const winlostValue = getSingleValue(filterValues.value.winlost)
  const statusValue = getSingleValue(filterValues.value.status)
  const gameTypeValue = getSingleValue(filterValues.value.gameType)
  const { secondStartTime, secondEndTime } = getTimeRange(timeValue)

  return {
    secondStartTime,
    secondEndTime,
    winlost: winlostValue === 'all' ? null : Number(winlostValue),
    page: {
      current: page,
      size: pageSize
    },
    param: {
      currency: currentCurrency,
      sysGameTypeCode: gameTypeValue === 'all' ? null : gameTypeValue,
      platformCode: null,
      gameCode: null,
      status: statusValue === 'all' ? null : Number(statusValue)
    }
  }
}

const fetchBetHistory = async (page: number, pageSize: number) => {
  const response = await Api.record.queryOrderInfoPage(buildQueryForm(page, pageSize))

  if (!response.success) {
    throw new Error(response.message || t('common.requestError'))
  }

  return response
}

const {
  list: dataList,
  loading,
  finished,
  error,
  refresh
} = useInfiniteScroll<Item, Awaited<ReturnType<typeof Api.record.queryOrderInfoPage>>>({
  sentinel: loadMoreSentinel,
  root: scrollRoot,
  pageSize: PAGE_SIZE,
  load: async ({ page, pageSize }) => fetchBetHistory(page, pageSize),
  getItems: response => response.result?.records?.map(mapRecordToItem) ?? [],
  getTotal: response => response.result?.total,
  getHasMore: (response, { page, pageSize, items }) => {
    const total = response.result?.total
    if (typeof total === 'number') {
      return page * pageSize < total
    }

    return items.length >= pageSize
  },
  dedupeBy: item => item.id,
  onError: requestError => {
    console.error(requestError)
  }
})

const handleStartPlaying = () => {
  navigateTo('/')
}

const handleBetClick = (item: Item) => {
  navigateTo(`/bet-details/${item.id}`, {
    state: { betData: JSON.stringify(item) }
  })
}

// 筛选弹窗
const showFilterPopup = ref(false)

const handleSort = () => {
  showFilterPopup.value = true
}

const handleFilterApply = async (values: Record<string, string | string[]>) => {
  filterValues.value = {
    ...createDefaultFilterValues(),
    ...values
  }
  await refresh()
}

const handleRetry = async () => {
  await refresh()
}
</script>

<style scoped lang="scss"></style>
