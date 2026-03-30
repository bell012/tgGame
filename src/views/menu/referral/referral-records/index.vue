<template>
  <!-- 推荐记录页面 -->
  <section class="min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]">
    <!-- 页面容器 -->
    <div class="min-h-screen bg-bg-1" style="font-family: Inter, avertastd, sans-serif">
      <!-- 顶部导航栏 -->
      <H5Header
        :title="$t('referral.referralRecords.title')"
        :show-sort="true"
        @sort="handleSort"
      />

      <!-- 页面主体 -->
      <main class="px-[14px] pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[14px]">
        <!-- 搜索区域 -->
        <section>
          <!-- 搜索框容器 -->
          <label
            class="flex h-[42px] items-center gap-[10px] rounded-[8px] border border-opacity-10 bg-opacity-5 px-[14px]"
          >
            <SearchIcon class="h-[18px] w-[18px] text-text-2" />
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="$t('referral.referralRecords.searchPlaceholder')"
              class="min-w-0 flex-1 bg-transparent text-[14px] font-[500] leading-[17px] text-text-1 outline-none placeholder:text-text-3"
            />
          </label>
        </section>

        <!-- 列表区域 -->
        <section v-if="filteredRecords.length > 0" class="mt-[10px] flex flex-col gap-[7px]">
          <!-- 记录卡片 -->
          <article
            v-for="item in filteredRecords"
            :key="item.id"
            class="overflow-hidden rounded-[10px] bg-bg-2"
          >
            <!-- 卡片内容区 -->
            <div class="flex h-[67px] items-center justify-between gap-[14px] px-[14px]">
              <!-- 左侧信息区 -->
              <div class="flex min-w-0 flex-col gap-[7px]">
                <!-- 账号文本 -->
                <p class="truncate text-[14px] font-[700] leading-[17px] text-text-1">
                  {{ item.account }}
                </p>
                <!-- 时间文本 -->
                <p class="truncate text-[12px] font-[400] leading-[15px] text-text-2">
                  {{ item.time }}
                </p>
              </div>

              <!-- 右侧状态文本 -->
              <p
                class="shrink-0 text-[14px] font-[700] leading-[17px]"
                :class="getStatusClass(item.status)"
              >
                {{ getStatusLabel(item.status) }}
              </p>
            </div>
          </article>
        </section>

        <!-- 空状态区域 -->
        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          image-alt="$t('referral.referralRecords.title')"
          message="No data available at the moment."
          text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
        />

        <!-- 筛选弹窗 -->
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

type ReferralStatus = 'valid' | 'invalid'
type ReferralPeriod = 'today' | 'week' | 'month'

interface ReferralRecord {
  id: number
  account: string
  time: string
  status: ReferralStatus
  period: ReferralPeriod
}

const { t } = useI18n()

const showFilterPopup = ref(false)
const filterValues = ref<Record<string, string | string[]>>({})
const searchKeyword = ref('')
const selectedStatusFilter = ref<'all' | ReferralStatus>('all')
const selectedTimeFilter = ref<'all' | ReferralPeriod>('all')

const filterGroups = computed<FilterGroup[]>(() => [
  {
    title: t('referral.referralRecords.filterTitles.status'),
    options: [
      { label: t('referral.referralRecords.filters.all'), value: 'all' },
      { label: t('referral.referralRecords.filters.valid'), value: 'valid' },
      { label: t('referral.referralRecords.filters.invalid'), value: 'invalid' }
    ]
  },
  {
    title: t('referral.referralRecords.filterTitles.time'),
    options: [
      { label: t('referral.referralRecords.filters.all'), value: 'all' },
      { label: t('referral.referralRecords.filters.today'), value: 'today' },
      { label: t('referral.referralRecords.filters.week'), value: 'week' },
      { label: t('referral.referralRecords.filters.month'), value: 'month' }
    ]
  }
])

const records = ref<ReferralRecord[]>([
  {
    id: 1,
    account: '927123456',
    time: '12/18/2026 11:14:15 AM',
    status: 'valid',
    period: 'today'
  },
  {
    id: 2,
    account: '927123457',
    time: '12/18/2026 10:05:12 AM',
    status: 'valid',
    period: 'today'
  },
  {
    id: 3,
    account: '927123458',
    time: '12/17/2026 09:22:33 PM',
    status: 'invalid',
    period: 'week'
  },
  {
    id: 4,
    account: '927123459',
    time: '12/14/2026 02:45:16 PM',
    status: 'valid',
    period: 'week'
  },
  {
    id: 5,
    account: '927123460',
    time: '12/06/2026 08:30:20 AM',
    status: 'invalid',
    period: 'month'
  }
])

const filteredRecords = computed(() =>
  records.value.filter(item => {
    const keyword = searchKeyword.value.trim().toLowerCase()
    const matchesKeyword = keyword.length === 0 || item.account.toLowerCase().includes(keyword)
    const matchesStatus =
      selectedStatusFilter.value === 'all' || item.status === selectedStatusFilter.value
    const matchesTime =
      selectedTimeFilter.value === 'all' || item.period === selectedTimeFilter.value

    return matchesKeyword && matchesStatus && matchesTime
  })
)

// 获取筛选值中的单选字符串。
const getSingleValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

// 打开筛选弹窗。
const handleSort = () => {
  showFilterPopup.value = true
}

// 应用筛选弹窗中的筛选条件。
const handleFilterApply = (values: Record<string, string | string[]>) => {
  const status = getSingleValue(values['0']) as 'all' | ReferralStatus
  const time = getSingleValue(values['1']) as 'all' | ReferralPeriod

  if (status) selectedStatusFilter.value = status
  if (time) selectedTimeFilter.value = time
}

// 返回状态文案。
const getStatusLabel = (status: ReferralStatus) => t(`referral.referralRecords.filters.${status}`)

// 返回状态颜色类名。
const getStatusClass = (status: ReferralStatus) =>
  status === 'valid' ? 'text-[#4ADE80]' : 'text-[#FF8A8A]'
</script>
