<template>
  <!-- 体育H5投注历史页面 -->
  <section
    v-if="isMobile"
    class="sports-bet-history-mobile fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg-1 font-inter sm:hidden"
  >
    <H5Header :title="t('betHistory.title')" :show-sort="true" @sort="openMobileFilter" />

    <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5">
      <div class="flex min-h-[calc(100vh-96px)] flex-col items-center justify-center pb-[120px]">
        <ThemedEmptyState
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :image-alt="t('common.noData')"
          :message="t('common.noData')"
          container-class="mt-0"
          image-class="h-[200px] w-auto object-contain mb-2.5"
          text-class="text-text-1 text-xs font-[500] mb-5"
        />
        <button
          type="button"
          class="flex h-[40px] w-[200px] items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
          @click="handleStartPlaying"
        >
          {{ t('betHistory.startPlaying') }}
        </button>
      </div>
    </main>

    <FilterPopup
      v-model:visible="showMobileFilterPopup"
      v-model="filterValues"
      :filter-groups="filterGroups"
      :live-update="true"
      @apply="handleMobileFilterApply"
    />
  </section>

  <!-- 体育pc投注历史页面 -->
  <section v-else class="min-h-[calc(100vh-64px)] bg-bg-1 px-6 py-4 font-inter text-text-1">
    <SportsNavigationPc
      :selected-sport-id="selectedSportId"
      :counts="sportTodayCounts"
      @change="handleSportChange"
    />

    <header class="mt-8">
      <h1 class="text-[22px] font-[700] leading-7 text-text-1">{{ t('betHistory.title') }}</h1>
    </header>

    <div class="mt-5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          :class="getDesktopFilterButtonClass(filterValues.status === option.value)"
          @click="selectDesktopStatus(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div
        v-if="filterValues.status === 'settled'"
        class="flex flex-wrap items-center justify-end gap-3"
      >
        <button
          v-for="option in dateOptions"
          :key="option.value"
          type="button"
          :class="getDesktopFilterButtonClass(filterValues.time === option.value)"
          @click="selectDesktopTime(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="flex min-h-[calc(100vh-310px)] flex-col items-center justify-center pb-12">
      <ThemedEmptyState
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        :image-alt="t('common.noData')"
        :message="t('common.noData')"
        container-class="mt-0"
        image-class="h-[200px] w-auto object-contain mb-2.5"
        text-class="text-text-1 text-sm font-[400] mb-7"
      />
      <button
        type="button"
        class="flex h-[46px] w-[240px] items-center justify-center rounded-lg bg-theme-primary text-base font-[700] text-text-4"
        @click="handleStartPlaying"
      >
        {{ t('betHistory.startPlaying') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import CryptoJS from 'crypto-js'
import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'
import { navigateTo } from '@/utils/router'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import SportsNavigationPc from '../components/sports-navigation/pc.vue'
import { buildSportTodayCountMap, sportItems } from '../components/sports-navigation/sport-items'

type SportsBetHistoryStatus = 'settled' | 'unsettled'
type SportsBetHistoryTime =
  'all' | 'today' | 'yesterday' | 'last3days' | 'last15days' | 'last30days'
type SportsBetHistoryFilterValues = {
  status: SportsBetHistoryStatus
  time: SportsBetHistoryTime
} & Record<string, string | string[]>

const { t } = useI18n()
const isMobile = useIsMobile()
const sportsStore = useSportsStore()
const siteConfigStore = useSiteConfigStore()
const { sportCounts, selectedSportId, languageCode, sportsToken } = storeToRefs(sportsStore)

usePageScrollLock(() => isMobile.value)

const showMobileFilterPopup = ref(false)
const filterValues = ref<SportsBetHistoryFilterValues>({
  status: 'unsettled',
  time: 'today'
})
let historyRequestId = 0

const statusOptions = computed(() => [
  { label: t('betHistory.filterOptions.unsettled'), value: 'unsettled' },
  { label: t('betHistory.filterOptions.settled'), value: 'settled' }
])

const dateOptions = computed(() => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('betHistory.filterOptions.today'), value: 'today' },
  { label: t('betHistory.filterOptions.yesterday'), value: 'yesterday' },
  { label: t('betHistory.filterOptions.last3Days'), value: 'last3days' },
  { label: t('betHistory.filterOptions.last15Days'), value: 'last15days' },
  { label: t('betHistory.filterOptions.last30Days'), value: 'last30days' }
])

const filterGroups = computed<FilterGroup[]>(() => {
  const groups: FilterGroup[] = [
    {
      key: 'status',
      title: t('betHistory.filterGroups.status'),
      options: statusOptions.value
    }
  ]

  if (filterValues.value.status === 'settled') {
    groups.push({
      key: 'time',
      title: t('betHistory.filterGroups.date'),
      options: dateOptions.value
    })
  }

  return groups
})

const sportTodayCounts = computed(() => buildSportTodayCountMap(sportCounts.value))

// 生成体育网关 TimeStamp
const createSportsGatewayTimeStamp = () =>
  CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(String(Date.now())))

// 将本地 Date 转成体育网关需要的 yyyy-MM-dd。
const formatSportsHistoryDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 按天偏移生成新日期，避免直接修改原始 Date。
const addSportsHistoryDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// 已结算接口按 EndDate 定义目标日期，StartDate 固定回退到跨天 12 点窗口。
const resolveStatementDateRange = (value: SportsBetHistoryTime) => {
  const today = new Date()
  const endDate = value === 'yesterday' ? addSportsHistoryDays(today, -1) : today
  const durationDaysMap: Record<SportsBetHistoryTime, number> = {
    all: 30,
    today: 1,
    yesterday: 1,
    last3days: 3,
    last15days: 15,
    last30days: 30
  }
  const startDate = addSportsHistoryDays(endDate, -durationDaysMap[value])

  return {
    StartDate: formatSportsHistoryDate(startDate),
    EndDate: formatSportsHistoryDate(endDate)
  }
}

// 组装两个历史接口共用的体育会员凭据参数。
const buildSportsHistoryAuthParams = async () => {
  const memberCode = await sportsStore.ensureSportsMemberCode()
  const token = sportsToken.value

  if (!memberCode || !token) {
    return null
  }

  return {
    LanguageCode: languageCode.value,
    MemberCode: memberCode,
    Token: token,
    TimeStamp: createSportsGatewayTimeStamp()
  }
}

// 根据当前筛选请求体育投注历史，并保留原始响应供确认字段结构。
const fetchSportsBetHistory = async () => {
  const requestId = ++historyRequestId

  try {
    await siteConfigStore.initSiteConfig()
    const baseUrl = siteConfigStore.getConfigString('IM.im_app_url')
    const authParams = await buildSportsHistoryAuthParams()

    if (!baseUrl || !authParams) {
      console.warn('[sportsBetHistoryMissingParams]', { baseUrl, authParams })
      return
    }

    if (filterValues.value.status === 'settled') {
      const dateRange = resolveStatementDateRange(filterValues.value.time)
      const params = {
        ...dateRange,
        DateType: 2 as const,
        StartTime: '12:00:00' as const,
        EndTime: '11:59:59' as const,
        ...authParams
      }
      console.log('已结算携带参数', params)
      const response = await Api.sport.getStatement(baseUrl, params)
      if (requestId !== historyRequestId) return
      console.log('已结算响应数据', response)
      return
    }

    const params = {
      BetConfirmationStatus: [1, 2, 3, 4] as [1, 2, 3, 4],
      ...authParams
    }
    console.log('未结算携带参数', params)
    const response = await Api.sport.getBetList(baseUrl, params)
    if (requestId !== historyRequestId) return
    console.log('未结算响应数据', response)
    return
  } catch (error) {
    if (requestId === historyRequestId) {
      console.error(error)
    }
  }
}

// PC/H5 共用返回体育投注首页，后续真实数据接入时也能复用这个入口。
const handleStartPlaying = () => {
  navigateTo('/sports')
}

// H5 点击右上角筛选图标时打开筛选弹窗。
const openMobileFilter = () => {
  showMobileFilterPopup.value = true
}

// H5 筛选弹窗确认后请求对应状态的体育投注历史。
const handleMobileFilterApply = (values: Record<string, string | string[]>) => {
  filterValues.value = {
    status: (Array.isArray(values.status)
      ? (values.status[0] ?? 'unsettled')
      : values.status) as SportsBetHistoryStatus,
    time: (Array.isArray(values.time)
      ? (values.time[0] ?? 'today')
      : (values.time ?? 'today')) as SportsBetHistoryTime
  }
  console.log('[sportsBetHistoryFilterApply]', filterValues.value)
  void fetchSportsBetHistory()
}

// PC 顶部球种切换沿用体育 Store，保持和体育投注首页同一组选中状态。
const handleSportChange = (index: number) => {
  const sport = sportItems[index]
  if (sport) {
    sportsStore.selectedSportId = sport.sportId
  }
}

// PC 状态筛选切换后，未结算请求 GetBetList，已结算请求 GetStatement。
const selectDesktopStatus = (value: string) => {
  filterValues.value.status = value as SportsBetHistoryStatus
  console.log('[sportsBetHistoryStatusChange]', filterValues.value)
  void fetchSportsBetHistory()
}

// PC 日期筛选只用于已结算接口，切换后重新请求 GetStatement。
const selectDesktopTime = (value: string) => {
  filterValues.value.time = value as SportsBetHistoryTime
  console.log('[sportsBetHistoryTimeChange]', filterValues.value)
  void fetchSportsBetHistory()
}

// 根据当前选中状态生成 PC 筛选按钮样式。
const getDesktopFilterButtonClass = (active: boolean) => [
  'h-[38px] min-w-[78px] rounded-[20px] px-7 text-sm font-[700] transition-colors',
  active ? 'bg-bg-3 text-text-1' : 'bg-bg-2 text-text-2'
]

onMounted(() => {
  void sportsStore.fetchSportCounts()
  void fetchSportsBetHistory()
})
</script>

<style scoped>
.sports-bet-history-mobile {
  height: 100vh;
  height: 100dvh;
  overscroll-behavior: none;
}
</style>
