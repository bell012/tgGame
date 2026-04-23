<template>
  <!-- 佣金记录页面 -->
  <section class="min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]">
    <!-- 页面容器 -->
    <div class="min-h-screen bg-bg-1" style="font-family: Inter, avertastd, sans-serif">
      <H5Header
        :title="$t('referral.commissionRecords.title')"
        :show-sort="true"
        @sort="handleSort"
      />

      <!-- 页面主体 -->
      <main class="px-[14px] pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[14px]">
        <!-- 搜索区域 -->
        <section>
          <!-- 搜索框 -->
          <label
            class="flex h-[42px] items-center gap-[10px] rounded-[8px] border border-opacity-10 bg-opacity-5 px-[14px]"
          >
            <!-- 搜索图标 -->
            <SearchIcon class="h-[18px] w-[18px] text-text-2" />

            <!-- 搜索输入框 -->
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="$t('referral.commissionRecords.searchPlaceholder')"
              class="min-w-0 flex-1 bg-transparent text-[14px] font-[500] leading-[17px] text-text-1 outline-none placeholder:text-text-3"
            />
          </label>
        </section>

        <!-- 筛选汇总区域 -->
        <section class="mt-[10px] flex items-center justify-between gap-[10px]">
          <!-- 左侧标题 -->
          <p class="text-[14px] font-[400] leading-[17px] text-text-1">
            {{ $t('referral.commissionRecords.summaryTitle') }}
          </p>

          <!-- 汇总金额 -->
          <p class="text-right text-[14px] font-[400] leading-[17px] text-text-1">
            {{
              $t('referral.commissionRecords.totalAmount', { amount: formatAmount(totalAmount) })
            }}
          </p>
        </section>

        <!-- 列表区域 -->
        <section v-if="filteredRecords.length > 0" class="mt-[10px] flex flex-col gap-[7px]">
          <!-- 记录卡片 -->
          <article
            v-for="item in filteredRecords"
            :key="item.id"
            class="overflow-hidden rounded-[10px] bg-bg-2"
          >
            <!-- 卡片头部 -->
            <div
              class="flex items-center justify-between gap-[16px] border-b border-opacity-5 px-[14px] py-[10px]"
            >
              <!-- 左侧信息 -->
              <div class="flex min-w-0 items-center gap-[7px]">
                <!-- 图标容器 -->
                <div
                  class="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-opacity-5 text-[18px] font-[700] leading-none text-text-1"
                >
                  {{ item.iconText }}
                </div>

                <!-- 标题 -->
                <p class="truncate text-[15px] font-[600] leading-[18px] text-text-1">
                  {{ item.title }}
                </p>
              </div>

              <!-- 金额 -->
              <p class="shrink-0 text-[16px] font-[700] leading-[19px] text-text-1">
                {{ item.amount > 0 ? '+' : '' }}{{ formatAmount(item.amount) }}
              </p>
            </div>

            <!-- 卡片底部 -->
            <div class="flex items-center justify-between gap-[12px] px-[14px] py-[10px]">
              <!-- 子账号 -->
              <p class="min-w-0 truncate text-[12px] font-[400] leading-[15px] text-text-2">
                {{ $t('referral.commissionRecords.subAccount', { account: item.subAccount }) }}
              </p>

              <!-- 时间 -->
              <p class="shrink-0 text-[12px] font-[400] leading-[15px] text-text-2">
                {{ item.time }}
              </p>
            </div>
          </article>
        </section>

        <button
          v-if="filteredRecords.length > 0 && currentPage < totalPages"
          type="button"
          class="mt-[12px] flex h-[38px] w-full items-center justify-center rounded-[8px] bg-bg-2 text-[12px] font-[700] text-text-1"
          :disabled="isLoading"
          @click="handleLoadMore"
        >
          {{ isLoading ? $t('common.loading') : $t('common.loadingMore') }}
        </button>

        <p
          v-if="isLoading && filteredRecords.length === 0"
          class="py-8 text-center text-[12px] font-[500] text-text-2"
        >
          {{ $t('common.loading') }}
        </p>

        <ThemedEmptyState
          v-else-if="!isLoading && filteredRecords.length === 0"
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :image-alt="$t('referral.commissionRecords.title')"
          :message="$t('common.noData')"
          text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
        />

        <FilterPopup
          v-model:visible="showFilterPopup"
          v-model="filterValues"
          :filter-groups="filterGroups"
          @apply="handleFilterApply"
        />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import Api from '@/api'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import {
  default as defaultImgDark,
  default as defaultImgLight
} from '@/static/img/explore/default.png'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import { formatTimestamp } from '@/utils/date'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type RecordStatus = '0' | '1' | '2'
type RecordPeriod = 'today' | 'week' | 'month'
type SettlementFilterType = 'all' | '1' | '2' | '3'

interface CommissionRecord {
  id: string
  title: string
  amount: number
  subAccount: string
  time: string
  iconText: string
  status: number
  settlementType: number
}

const { t } = useI18n()

const showFilterPopup = ref(false)
const filterValues = ref<Record<string, string | string[]>>({})
const searchKeyword = ref('')
const selectedStatusFilter = ref<'all' | RecordStatus>('all')
const selectedTimeFilter = ref<'all' | RecordPeriod>('all')
const selectedSettlementTypeFilter = ref<SettlementFilterType>('all')
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 20

const filterGroups = computed<FilterGroup[]>(() => [
  {
    title: t('referral.commissionRecords.filterTitles.status'),
    options: [
      { label: t('referral.commissionRecords.filters.all'), value: 'all' },
      { label: t('referral.commissionRecords.filters.unclaimed'), value: '0' },
      { label: t('referral.commissionRecords.filters.claimed'), value: '1' },
      { label: t('referral.commissionRecords.filters.expired'), value: '2' }
    ]
  },
  {
    title: t('referral.commissionRecords.filterTitles.settlementType'),
    options: [
      { label: t('referral.commissionRecords.filters.all'), value: 'all' },
      { label: t('referral.commissionRecords.filters.daily'), value: '1' },
      { label: t('referral.commissionRecords.filters.weekly'), value: '2' },
      { label: t('referral.commissionRecords.filters.monthly'), value: '3' }
    ]
  },
  {
    title: t('referral.commissionRecords.filterTitles.time'),
    options: [
      { label: t('referral.commissionRecords.filters.all'), value: 'all' },
      { label: t('referral.commissionRecords.filters.today'), value: 'today' },
      { label: t('referral.commissionRecords.filters.week'), value: 'week' },
      { label: t('referral.commissionRecords.filters.month'), value: 'month' }
    ]
  }
])

const records = ref<CommissionRecord[]>([])

const filteredRecords = computed(() =>
  records.value.filter(item => {
    const keyword = searchKeyword.value.trim().toLowerCase()
    return (
      keyword.length === 0 ||
      item.subAccount.toLowerCase().includes(keyword) ||
      item.title.toLowerCase().includes(keyword)
    )
  })
)

const totalAmount = computed(() =>
  filteredRecords.value.reduce((sum, item) => sum + item.amount, 0)
)

const getSingleValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

const handleSort = () => {
  showFilterPopup.value = true
}

const handleFilterApply = (values: Record<string, string | string[]>) => {
  const status = getSingleValue(values['0']) as 'all' | RecordStatus
  const settlementType = getSingleValue(values['1']) as SettlementFilterType
  const time = getSingleValue(values['2']) as 'all' | RecordPeriod

  if (status) selectedStatusFilter.value = status
  if (settlementType) selectedSettlementTypeFilter.value = settlementType
  if (time) selectedTimeFilter.value = time
}

const getSettlementTypeLabel = (settlementType: number) => {
  const labelMap: Record<number, string> = {
    1: t('referral.commissionRecords.filters.daily'),
    2: t('referral.commissionRecords.filters.weekly'),
    3: t('referral.commissionRecords.filters.monthly')
  }

  return labelMap[settlementType] || '--'
}

const getTimeRange = (period: 'all' | RecordPeriod) => {
  if (period === 'all') return {}

  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (period === 'week') {
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
  }

  if (period === 'month') {
    start.setDate(1)
  }

  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  return {
    startTime: start.getTime(),
    endTime: end.getTime()
  }
}

const mapCommissionRecord = (item: any): CommissionRecord => {
  const settlementType = Number(item?.settlementType ?? 0)
  const status = Number(item?.status ?? 0)
  const creationTime = Number(item?.creationTime ?? 0)

  return {
    id: String(item?.rowId ?? `${item?.userId ?? ''}-${creationTime}-${status}`),
    title: getSettlementTypeLabel(settlementType),
    amount: Number(item?.amount ?? 0),
    subAccount: String(item?.userAccount || item?.userId || '--'),
    time: formatTimestamp(creationTime),
    iconText: '$',
    status,
    settlementType
  }
}

const fetchCommissionRecords = async (targetPage = 1) => {
  isLoading.value = true

  try {
    const param: Record<string, unknown> = {
      ...getTimeRange(selectedTimeFilter.value),
      current: targetPage,
      size: pageSize
    }

    if (selectedStatusFilter.value !== 'all') {
      param.status = Number(selectedStatusFilter.value)
    }

    if (selectedSettlementTypeFilter.value !== 'all') {
      param.settlementType = Number(selectedSettlementTypeFilter.value)
    }

    const response = await Api.agent.queryCommissionRecords(param, {
      channelId: '4'
    })
    const result = response?.result || {}
    const nextRecords = Array.isArray(result.records) ? result.records.map(mapCommissionRecord) : []

    records.value = targetPage > 1 ? [...records.value, ...nextRecords] : nextRecords
    currentPage.value = Number(result.current || targetPage)
    totalPages.value = Math.max(1, Number(result.pages || 1))
  } catch (error) {
    console.error(error)
    if (targetPage === 1) {
      records.value = []
      currentPage.value = 1
      totalPages.value = 1
    }
  } finally {
    isLoading.value = false
  }
}

const handleLoadMore = () => {
  if (isLoading.value || currentPage.value >= totalPages.value) return
  void fetchCommissionRecords(currentPage.value + 1)
}

// 格式化金额显示。
const formatAmount = (amount: number) => (Number.isFinite(amount) ? amount : 0).toFixed(2)

watch([selectedStatusFilter, selectedSettlementTypeFilter, selectedTimeFilter], () => {
  void fetchCommissionRecords(1)
})

onMounted(() => {
  void fetchCommissionRecords(1)
})
</script>
