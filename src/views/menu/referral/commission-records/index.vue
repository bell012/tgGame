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

        <ThemedEmptyState
          v-else
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
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import {
  default as defaultImgDark,
  default as defaultImgLight
} from '@/static/img/explore/default.png'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type RecordOutcome = 'win' | 'loss'
type RecordStatus = 'completed' | 'pending'
type RecordPeriod = 'today' | 'week' | 'month'
type RecordPlatform = 'casino' | 'sports' | 'slots'
type RecordGame = 'all_games' | 'slots' | 'sports' | 'casino'

interface CommissionRecord {
  id: number
  title: string
  amount: number
  subAccount: string
  time: string
  iconText: string
  outcome: RecordOutcome
  status: RecordStatus
  period: RecordPeriod
  platform: RecordPlatform
  game: Exclude<RecordGame, 'all_games'>
}

const { t } = useI18n()

const showFilterPopup = ref(false)
const filterValues = ref<Record<string, string | string[]>>({})
const searchKeyword = ref('')
const selectedGameFilter = ref<RecordGame>('all_games')
const selectedOutcomeFilter = ref<'all' | RecordOutcome>('all')
const selectedStatusFilter = ref<'all' | RecordStatus>('all')
const selectedTimeFilter = ref<'all' | RecordPeriod>('all')
const selectedPlatformFilter = ref<'all' | RecordPlatform>('all')

const filterGroups = computed<FilterGroup[]>(() => [
  {
    title: t('referral.commissionRecords.filterTitles.game'),
    options: [
      { label: t('referral.commissionRecords.filters.all_games'), value: 'all_games' },
      { label: t('referral.commissionRecords.filters.slots'), value: 'slots' },
      { label: t('referral.commissionRecords.filters.sports'), value: 'sports' },
      { label: t('referral.commissionRecords.filters.casino'), value: 'casino' }
    ]
  },
  {
    title: t('referral.commissionRecords.filterTitles.outcome'),
    options: [
      { label: t('referral.commissionRecords.filters.all'), value: 'all' },
      { label: t('referral.commissionRecords.filters.win'), value: 'win' },
      { label: t('referral.commissionRecords.filters.loss'), value: 'loss' }
    ]
  },
  {
    title: t('referral.commissionRecords.filterTitles.status'),
    options: [
      { label: t('referral.commissionRecords.filters.all'), value: 'all' },
      { label: t('referral.commissionRecords.filters.completed'), value: 'completed' },
      { label: t('referral.commissionRecords.filters.pending'), value: 'pending' }
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
  },
  {
    title: t('referral.commissionRecords.filterTitles.platform'),
    options: [
      { label: t('referral.commissionRecords.filters.all'), value: 'all' },
      { label: t('referral.commissionRecords.filters.casino'), value: 'casino' },
      { label: t('referral.commissionRecords.filters.sports'), value: 'sports' },
      { label: t('referral.commissionRecords.filters.slots'), value: 'slots' }
    ]
  }
])

const records = ref<CommissionRecord[]>([
  {
    id: 1,
    title: 'Deposit',
    amount: 1000,
    subAccount: '972345678',
    time: '12/18/2026 11:14',
    iconText: '+',
    outcome: 'win',
    status: 'completed',
    period: 'today',
    platform: 'casino',
    game: 'slots'
  },
  {
    id: 2,
    title: 'Invite Bonus',
    amount: 680,
    subAccount: '972345679',
    time: '12/17/2026 15:42',
    iconText: 'I',
    outcome: 'win',
    status: 'completed',
    period: 'week',
    platform: 'sports',
    game: 'sports'
  },
  {
    id: 3,
    title: 'Rebate',
    amount: 320,
    subAccount: '972345680',
    time: '12/16/2026 08:27',
    iconText: '%',
    outcome: 'loss',
    status: 'pending',
    period: 'week',
    platform: 'casino',
    game: 'casino'
  },
  {
    id: 4,
    title: 'Activity Reward',
    amount: 540,
    subAccount: '972345681',
    time: '12/10/2026 19:03',
    iconText: 'A',
    outcome: 'win',
    status: 'completed',
    period: 'month',
    platform: 'slots',
    game: 'slots'
  },
  {
    id: 5,
    title: 'VIP Bonus',
    amount: 750,
    subAccount: '972345682',
    time: '12/08/2026 21:16',
    iconText: 'V',
    outcome: 'loss',
    status: 'completed',
    period: 'month',
    platform: 'casino',
    game: 'casino'
  }
])

const filteredRecords = computed(() =>
  records.value.filter(item => {
    const keyword = searchKeyword.value.trim().toLowerCase()
    const matchesKeyword =
      keyword.length === 0 ||
      item.subAccount.toLowerCase().includes(keyword) ||
      item.title.toLowerCase().includes(keyword)

    const matchesGame =
      selectedGameFilter.value === 'all_games' || item.game === selectedGameFilter.value
    const matchesOutcome =
      selectedOutcomeFilter.value === 'all' || item.outcome === selectedOutcomeFilter.value
    const matchesStatus =
      selectedStatusFilter.value === 'all' || item.status === selectedStatusFilter.value
    const matchesTime =
      selectedTimeFilter.value === 'all' || item.period === selectedTimeFilter.value
    const matchesPlatform =
      selectedPlatformFilter.value === 'all' || item.platform === selectedPlatformFilter.value

    return (
      matchesKeyword &&
      matchesGame &&
      matchesOutcome &&
      matchesStatus &&
      matchesTime &&
      matchesPlatform
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
  const game = getSingleValue(values['0']) as RecordGame
  const outcome = getSingleValue(values['1']) as 'all' | RecordOutcome
  const status = getSingleValue(values['2']) as 'all' | RecordStatus
  const time = getSingleValue(values['3']) as 'all' | RecordPeriod
  const platform = getSingleValue(values['4']) as 'all' | RecordPlatform

  if (game) selectedGameFilter.value = game
  if (outcome) selectedOutcomeFilter.value = outcome
  if (status) selectedStatusFilter.value = status
  if (time) selectedTimeFilter.value = time
  if (platform) selectedPlatformFilter.value = platform
}

// 格式化金额显示。
const formatAmount = (amount: number) => amount.toFixed(2)
</script>
