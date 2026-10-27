<template>
  <!-- H5 -->
  <div v-if="isMobile" class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1">
    <H5Header
      :title="t('betHistory.title')"
      show-sort
      disable-default-back
      @back="emit('back')"
      @sort="showFilterPopup = true"
    />

    <div ref="scrollRoot" class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div class="px-3.5 pb-6 pt-3">
        <div
          v-if="mobileError && mobileList.length === 0"
          class="mt-[100px] flex justify-center"
          @click="retryMobile"
        >
          <p class="text-xs font-[500] text-secondary-4">{{ t('common.requestError') }}</p>
        </div>

        <ThemedEmptyState
          v-else-if="!mobileLoading && mobileList.length === 0"
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :message="t('common.noData')"
          container-class="mt-[60px]"
          image-class="w-[160px] h-[160px] object-contain"
          text-class="mt-2 text-xs font-[700] text-center text-text-1"
        />

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="item in mobileList"
            :key="item.id"
            class="cursor-pointer overflow-hidden rounded-xl bg-bg-2"
            @click="handleMobileItemClick(item)"
          >
            <div class="flex items-center gap-2.5 px-3.5 py-2.5">
              <div class="size-[52px] shrink-0 overflow-hidden rounded-lg bg-bg-3">
                <img :src="item.gameIcon" alt="" class="h-full w-full object-cover" />
              </div>

              <div class="flex min-w-0 flex-1 flex-col gap-2.5">
                <div class="flex items-center gap-2">
                  <h3 class="min-w-0 flex-1 truncate text-sm font-[700] text-text-1">
                    {{ item.gameName }}
                  </h3>
                  <span
                    class="shrink-0 rounded-[3px] bg-secondary-2 px-1 text-xs leading-4 text-white"
                  >
                    {{ t('creditLoan.betRecords.loan') }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="min-w-0 flex-1 truncate text-text-1">
                    {{ t('betHistory.betAmount') }}：{{ item.betAmount }}
                  </span>
                  <span class="shrink-0 font-[700]" :class="getResultClass(item)">
                    {{
                      item.settled
                        ? `${item.result === 'win' ? t('betHistory.win') : t('betHistory.loss')}：${item.resultAmount}`
                        : '--'
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div class="h-px bg-opacity-6" />

            <div class="flex h-11 items-center justify-between px-3.5">
              <span class="text-xs text-text-2">{{ item.time }}</span>
              <div class="flex items-center gap-2.5">
                <span
                  class="text-xs font-[700]"
                  :class="item.settled ? 'text-secondary-4' : 'text-assistOrange'"
                >
                  {{ getStatusLabel(item) }}
                </span>
                <span class="flex size-5 items-center justify-center rounded-md bg-opacity-10">
                  <ArrowRightIcon class="h-3 w-3 text-text-2" />
                </span>
              </div>
            </div>
          </div>

          <p v-if="mobileLoading" class="py-3 text-center text-xs text-text-2">
            {{ mobileList.length === 0 ? t('common.loading') : t('common.loadingMore') }}
          </p>
          <p
            v-else-if="mobileError"
            class="py-3 text-center text-xs text-secondary-4"
            @click="retryMobile"
          >
            {{ t('common.requestError') }}
          </p>
          <p v-else-if="mobileFinished" class="py-3 text-center text-xs text-text-2">
            {{ t('betHistory.noMore') }}
          </p>

          <div ref="loadMoreSentinel" class="h-px w-full" />
        </div>
      </div>
    </div>

    <FilterPopup
      v-model:visible="showFilterPopup"
      :model-value="{ ...filterValues }"
      :filter-groups="filterGroups"
      @apply="handleFilterApply"
    />
  </div>

  <!-- PC -->
  <div v-else class="flex min-h-[556px] flex-col rounded-xl bg-bg-2 p-6">
    <div class="flex flex-wrap items-center gap-2">
      <CustomSelect
        v-for="group in filterGroups"
        :key="group.key"
        v-model="filterValues[group.key]"
        class="w-[240px]"
        :options="group.options"
        :placeholder="group.title"
        use-placeholder-when-all
      />
    </div>

    <div class="mt-4 grid h-12 grid-cols-4 items-center gap-3 rounded-lg bg-bg-3 px-6">
      <span class="text-sm font-[700] text-text-1">{{ t('betHistory.type') }}</span>
      <span class="text-center text-sm font-[700] text-text-1">{{ t('betHistory.time') }}</span>
      <span class="text-center text-sm font-[700] text-text-1">
        {{ t('betHistory.betAmount') }}
      </span>
      <span class="text-right text-sm font-[700] text-text-1">{{ t('betHistory.profit') }}</span>
    </div>

    <div v-if="pcLoading && pcList.length === 0" class="mt-2 flex flex-col gap-2">
      <div v-for="index in 6" :key="index" class="h-12 animate-pulse rounded-lg bg-bg-3" />
    </div>

    <div v-else-if="pcList.length > 0" class="flex flex-col" :class="{ 'opacity-60': pcLoading }">
      <div
        v-for="item in pcList"
        :key="item.id"
        class="grid h-14 cursor-pointer grid-cols-4 items-center gap-3 border-b border-opacity-5 px-6 text-sm font-[700]"
        @click="handlePcItemClick(item)"
      >
        <span class="truncate text-text-1">{{ item.gameName }}</span>
        <span class="text-center text-text-2">{{ item.time }}</span>
        <span class="text-center text-text-1">{{ item.betAmount }}</span>
        <div class="flex items-center justify-end gap-1">
          <span :class="getResultClass(item)">
            {{ item.settled ? item.resultAmount : '--' }}
          </span>
          <ArrowLeftIcon class="h-4 w-4 text-text-1" />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-1 items-center justify-center">
      <ThemedEmptyState
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        :message="t('common.noData')"
        container-class="mt-0"
        image-class="w-[160px] h-[160px] object-contain"
        text-class="mt-2 text-xs font-[700] text-center text-text-1"
      />
    </div>

    <DesktopPagination
      v-if="pcTotalPages > 1 && pcList.length > 0"
      class="mt-5"
      :current-page="pcPage"
      :total-pages="pcTotalPages"
      @change="handlePcPageChange"
    />

    <BetDetailsModal v-model="showDetailModal" :bet="selectedBet" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { navigateTo } from '@/utils/router'
import Api from '@/api'
import type { QueryOrderInfoResult } from '@/api/interface/record.interface'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import BetDetailsModal from '@/views/wallet/betDetails/BetDetailsModal.vue'
import ArrowRightIcon from '@/static/svg/arrow_right2.svg?component'
import ArrowLeftIcon from '@/static/svg/arrow_left2.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import {
  BET_HISTORY_PAGE_SIZE,
  buildBetHistoryQueryForm,
  createBetHistoryGameTypeOptions,
  createBetHistoryPlatformOptions,
  createBetHistoryStatusOptions,
  createBetHistoryTimeOptions,
  createBetHistoryWinlostOptions,
  createDefaultBetHistoryFilterValues,
  hasMoreByTotal,
  mapRecordToItem,
  normalizeBetHistoryFilterValues,
  type BetHistoryFilterValues,
  type Item
} from '@/views/wallet/betHistory/shared'

type LoanBetRecord = QueryOrderInfoResult['records'][number]

interface LoanBetItem extends Item {
  settled: boolean
}

const LOAN_BET_CURRENCY = 'JB'

const emit = defineEmits<{
  back: []
}>()

const { t } = useI18n()
const isMobile = useIsMobile()

const filterValues = ref<BetHistoryFilterValues>(createDefaultBetHistoryFilterValues())
const showFilterPopup = ref(false)

const filterGroups = computed<(FilterGroup & { key: keyof BetHistoryFilterValues })[]>(() => [
  {
    key: 'gameType',
    title: t('betHistory.filterGroups.gameType'),
    options: createBetHistoryGameTypeOptions(t)
  },
  {
    key: 'winlost',
    title: t('betHistory.filterGroups.winLoss'),
    options: createBetHistoryWinlostOptions(t)
  },
  {
    key: 'status',
    title: t('betHistory.filterGroups.status'),
    options: createBetHistoryStatusOptions(t)
  },
  {
    key: 'time',
    title: t('betHistory.filterGroups.date'),
    options: createBetHistoryTimeOptions(t)
  },
  {
    key: 'platform',
    title: t('betHistory.filterGroups.platform'),
    options: createBetHistoryPlatformOptions(t)
  }
])

const toLoanBetItem = (record: LoanBetRecord): LoanBetItem => ({
  ...mapRecordToItem(record, t),
  settled: record.status === 1
})

const getResultClass = (item: LoanBetItem) => {
  if (!item.settled) return 'text-assistOrange'
  return item.result === 'win' ? 'text-secondary-2' : 'text-secondary-4'
}

const getStatusLabel = (item: LoanBetItem) =>
  item.settled ? t('creditLoan.betRecords.completed') : t('creditLoan.betRecords.pending')

const fetchLoanBetRecords = async (page: number, pageSize: number) => {
  const response = await Api.record.queryOrderInfoPage(
    buildBetHistoryQueryForm({
      page,
      pageSize,
      filterValues: filterValues.value,
      currency: LOAN_BET_CURRENCY
    })
  )

  if (!response.success) {
    throw new Error(response.message || t('common.requestError'))
  }

  const total = Number(response.result?.total) || 0

  return {
    list: response.result?.records ?? [],
    total,
    pages: Number(response.result?.pages) || Math.max(1, Math.ceil(total / pageSize))
  }
}

// H5：无限滚动
const scrollRoot = ref<HTMLElement | null>(null)
const loadMoreSentinel = ref<HTMLElement | null>(null)

const {
  list: mobileList,
  loading: mobileLoading,
  finished: mobileFinished,
  error: mobileError,
  refresh: refreshMobile,
  retry: retryMobile
} = useInfiniteScroll<LoanBetItem, Awaited<ReturnType<typeof fetchLoanBetRecords>>>({
  sentinel: loadMoreSentinel,
  root: scrollRoot,
  enabled: () => isMobile.value,
  pageSize: BET_HISTORY_PAGE_SIZE,
  load: ({ page, pageSize }) => fetchLoanBetRecords(page, pageSize),
  getItems: response => response.list.map(toLoanBetItem),
  getTotal: response => response.total,
  getHasMore: (response, { page, pageSize, items }) =>
    hasMoreByTotal(response.total, page, pageSize, items.length),
  dedupeBy: item => item.id,
  onError: error => {
    console.error('loan bet records failed', error)
  }
})

const handleFilterApply = (values: Record<string, string | string[]>) => {
  filterValues.value = normalizeBetHistoryFilterValues(values)
}

const handleMobileItemClick = (item: LoanBetItem) => {
  navigateTo(`/bet-details/${item.id}`, {
    state: { betData: JSON.stringify(item) }
  })
}

// PC：分页
const pcList = ref<LoanBetItem[]>([])
const pcLoading = ref(false)
const pcPage = ref(1)
const pcTotalPages = ref(1)
const showDetailModal = ref(false)
const selectedBet = ref<LoanBetItem | null>(null)
let pcRequestToken = 0

const fetchPcPage = async (page: number) => {
  const currentToken = ++pcRequestToken
  pcLoading.value = true

  try {
    const res = await fetchLoanBetRecords(page, BET_HISTORY_PAGE_SIZE)
    if (currentToken !== pcRequestToken) return
    pcList.value = res.list.map(toLoanBetItem)
    pcPage.value = page
    pcTotalPages.value = res.pages
  } catch (error) {
    if (currentToken !== pcRequestToken) return
    console.error('loan bet records failed', error)
    pcList.value = []
    pcTotalPages.value = 1
  } finally {
    if (currentToken === pcRequestToken) {
      pcLoading.value = false
    }
  }
}

const handlePcPageChange = (page: number) => {
  if (page === pcPage.value) return
  void fetchPcPage(page)
}

const handlePcItemClick = (item: LoanBetItem) => {
  selectedBet.value = item
  showDetailModal.value = true
}

const reload = () => {
  if (isMobile.value) {
    void refreshMobile()
  } else {
    void fetchPcPage(1)
  }
}

watch(filterValues, reload, { deep: true })
watch(
  isMobile,
  mobile => {
    if (!mobile) void fetchPcPage(1)
  },
  { immediate: true }
)
</script>
