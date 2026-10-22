<template>
  <!-- 体育H5投注历史页面 -->
  <section
    v-if="isMobile"
    class="sports-bet-history-mobile fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg-1 font-inter"
  >
    <H5Header :title="t('betHistory.title')" :show-sort="true" @sort="openMobileFilter" />

    <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5">
      <div v-if="mobileHistoryList.length > 0" class="flex flex-col gap-[7px]">
        <article
          v-for="item in mobileHistoryList"
          :key="item.id"
          @click="openSportsBetDetails(item)"
          class="relative overflow-hidden rounded-[10px] bg-bg-2"
        >
          <span
            v-if="item.settled"
            :class="[
              'absolute right-0 top-0 rounded-bl-[10px] px-[10px] py-[3px] text-[11px] font-normal leading-[13.333px]',
              item.statusBadgeClass
            ]"
          >
            {{ item.resultLabel }}
          </span>

          <div class="flex min-h-[85px] items-center gap-2.5 px-3.5 py-2.5">
            <div
              class="flex h-[65px] w-[49px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-[7px] bg-bg-3 text-text-1"
            >
              <div class="flex h-[30px] w-[30px] items-center justify-center">
                <component
                  :is="item.sportIcon"
                  class="h-[30px] w-[30px] fill-current text-icon-2 [&_circle]:fill-current [&_path]:fill-current [&_rect]:fill-current"
                />
              </div>
              <span class="text-[12px] font-[400] text-text-1">
                {{ t('betHistory.filterOptions.sports') }}
              </span>
            </div>

            <div class="min-w-0 flex-1 self-start pt-[10.5px]">
              <h2 class="min-w-0 truncate text-[14px] font-bold leading-[17px] text-text-1">
                {{ item.matchName }}
                <span
                  v-if="item.parlay"
                  class="ml-1 rounded bg-theme-primary px-1 text-[11px] font-normal leading-[13.333px] text-text-4"
                  >{{ t('sportsHistory.comboBadge') }}</span
                >
              </h2>
              <div
                class="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 leading-[17px]"
              >
                <p class="min-w-0 flex-1 text-[14px] font-[400] text-text-1">
                  {{ t('betHistory.betAmount') }} : {{ item.betAmount }}
                </p>
                <p :class="['shrink-0 text-[14px] font-[700]', item.amountClass]">
                  {{ item.resultAmount }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="flex min-h-10 items-center justify-between gap-2.5 border-t border-solid border-opacity-15 px-3.5 py-[9px]"
          >
            <p class="min-w-0 flex-1 text-[12px] font-[400] text-text-2">
              {{ item.createdAt }}
            </p>
            <div class="flex shrink-0 items-center gap-[8px]">
              <button
                v-if="!item.settled"
                type="button"
                class="flex h-5 items-center justify-center rounded-[5px] px-[8px] text-[12px] font-[400] leading-4"
                :class="
                  item.cashOutAvailable ? 'bg-theme-primary text-text-4' : 'bg-bg-3 text-text-3'
                "
                :disabled="!item.cashOutAvailable || cashOut.submitting.value"
                @click.stop="cashOut.open(item.raw)"
              >
                {{ t('sportsHistory.cashOut') }}
              </button>
              <span
                class="text-xs"
                :class="item.settled ? 'text-theme-primary' : 'text-secondary-7'"
                >{{ item.statusLabel }}</span
              >
              <button
                type="button"
                :aria-label="t('betDetails.title')"
                class="flex h-5 w-5 items-center justify-center rounded-[6px] bg-opacity-10"
              >
                <ArrowRightIcon class="h-[12px] w-[12px] text-icon-2" />
              </button>
            </div>
          </div>
        </article>
      </div>

      <div
        v-else
        class="flex min-h-[calc(100vh-96px)] flex-col items-center justify-center pb-[120px]"
      >
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
  <section
    v-else
    class="min-h-[calc(100vh-64px)] bg-bg-1 px-[20px] py-[16px] font-inter text-text-1"
  >
    <div class="mb-[20px] text-[20px] font-[700] text-text-1">{{ t('sports.bet_history') }}</div>
    <div class="flex flex-wrap items-center justify-between gap-3">
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

    <div v-if="mobileHistoryList.length > 0" class="mt-5 grid grid-cols-3 items-start gap-4">
      <HistoryCardPc
        v-for="item in mobileHistoryList"
        :key="item.id"
        :item="item"
        :confirming="cashOut.selected.value?.wid === item.raw.wid"
        :submitting="cashOut.submitting.value"
        @open="cashOut.open(item.raw)"
        @close="cashOut.close"
        @confirm="cashOut.submit"
      />
    </div>

    <div v-else class="flex min-h-[calc(100vh-310px)] flex-col items-center justify-center pb-12">
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

  <!-- 提前结算弹窗 -->
  <SportsBuyBackSheet
    :visible="isMobile && Boolean(cashOut.selected.value)"
    :item="cashOutItem"
    :submitting="cashOut.submitting.value"
    @close="cashOut.close"
    @confirm="cashOut.submit"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import CryptoJS from 'crypto-js'
import Api from '@/api'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'
import { useSportsAuthStore } from '@/stores/sportsAuth'
import type { SportsCredentials } from '@/stores/sportsAuth'
import { useUserStore } from '@/stores/user'
import { globalShowToast } from '@/utils/toast'
import { navigateTo } from '@/utils/router'
import type { SportsBetHistoryResponse, SportsBetHistoryWager } from '@/api/interface/sport'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import SportsBuyBackSheet from '../components/SportsBuyBackSheet.vue'
import HistoryCardPc from './components/HistoryCardPc.vue'
import { mapHistoryWager } from './shared'
import type { HistoryWagerView } from './shared'
import { useHistoryCashOut } from './useHistoryCashOut'

type SportsBetHistoryStatus = 'settled' | 'unsettled'
type SportsBetHistoryTime =
  'all' | 'today' | 'yesterday' | 'last3days' | 'last15days' | 'last30days'
type SportsBetHistoryFilterValues = {
  status: SportsBetHistoryStatus
  time: SportsBetHistoryTime
} & Record<string, string | string[]>

const { t } = useI18n()
const isMobile = useIsMobile()
const { currentCurrencyCode } = useDisplayCurrency()
const sportsStore = useSportsStore()
const siteConfigStore = useSiteConfigStore()
const { languageCode } = storeToRefs(sportsStore)
const sportsAuth = useSportsAuthStore()
const userStore = useUserStore()
const getCredentialOwner = () =>
  JSON.stringify([
    userStore.userInfo?.tradeToken,
    userStore.userInfo?.memberId,
    userStore.acctInfo?.memberId,
    currentCurrencyCode.value,
    languageCode.value
  ])

// 判断体育网关是否返回登录凭据失效状态，102 为令牌失效，202 为用户名无效。
const isSportsAuthExpiredCode = (code: unknown) => [102, 202].includes(Number(code))

// 使用指定凭据请求当前投注历史分类，重试时会重新生成时间戳和鉴权参数。
const requestSportsBetHistory = (
  baseUrl: string,
  settled: boolean,
  credentials: SportsCredentials
): Promise<SportsBetHistoryResponse> => {
  const authParams = {
    LanguageCode: languageCode.value,
    MemberCode: credentials.memberCode,
    Token: credentials.token,
    TimeStamp: createSportsGatewayTimeStamp()
  }
  if (settled) {
    const params = {
      ...resolveStatementDateRange(filterValues.value.time),
      DateType: 2 as const,
      StartTime: '12:00:00' as const,
      EndTime: '11:59:59' as const,
      ...authParams
    }
    console.log('已结算携带参数', params)
    return Api.sport.getStatement(baseUrl, params)
  }
  const params = {
    BetConfirmationStatus: [1, 2, 3, 4] as [1, 2, 3, 4],
    ...authParams
  }
  console.log('未结算携带参数', params)
  return Api.sport.getBetList(baseUrl, params)
}

// 体育历史接口遇到 102/202 时，清掉旧凭据并用 ensureCredentials 重新获取后只重试当前接口一次。
const requestSportsBetHistoryWithCredentialRetry = async (
  baseUrl: string,
  settled: boolean,
  isCurrent: () => boolean
): Promise<SportsBetHistoryResponse | null> => {
  let credentials = await sportsAuth.ensureCredentials()
  if (!isCurrent()) return null
  if (!credentials) {
    console.warn('[sportsBetHistoryMissingParams]', { baseUrl, authParams: null })
    return null
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (!sportsAuth.isCredentialsCurrent(credentials)) return null
    const response = await requestSportsBetHistory(baseUrl, settled, credentials)
    if (!isCurrent()) return null
    if (!isSportsAuthExpiredCode(response.stc)) return response
    sportsAuth.clearCredentials(credentials)
    if (attempt === 1) return response
    credentials = await sportsAuth.ensureCredentials()
    if (!isCurrent()) return null
    if (!credentials) return response
  }

  return null
}

usePageScrollLock(() => isMobile.value)

const showMobileFilterPopup = ref(false)
const sportsBetHistoryList = ref<SportsBetHistoryWager[]>([])
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

const mobileHistoryList = computed(() =>
  sportsBetHistoryList.value.map(item => mapHistoryWager(item, currentCurrencyCode.value, t))
)
const cashOut = useHistoryCashOut(() => {
  void fetchSportsBetHistory()
})
const cashOutItem = computed(() =>
  cashOut.selected.value
    ? mapHistoryWager(cashOut.selected.value, currentCurrencyCode.value, t)
    : null
)

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

// 查询前获取同一组体育凭据。
const fetchSportsBetHistory = async () => {
  const requestId = ++historyRequestId
  const owner = getCredentialOwner()
  let context: number | undefined
  const isCurrent = () =>
    requestId === historyRequestId &&
    owner === getCredentialOwner() &&
    (context === undefined || context === sportsAuth.contextVersion)
  cashOut.close()
  sportsBetHistoryList.value = []

  try {
    await siteConfigStore.initSiteConfig()
    if (!isCurrent()) return
    const baseUrl = siteConfigStore.getConfigString('IM.im_app_url')
    if (!baseUrl) {
      console.warn('[sportsBetHistoryMissingParams]', { baseUrl, authParams: null })
      return
    }
    context = sportsAuth.contextVersion
    const settled = filterValues.value.status === 'settled'
    const response = await requestSportsBetHistoryWithCredentialRetry(baseUrl, settled, isCurrent)
    if (!isCurrent() || !response) return
    console.log(settled ? '已结算响应数据' : '未结算响应数据', response)
    if (isSportsAuthExpiredCode(response.stc)) {
      globalShowToast({ type: 'fail', message: t('sports.betLoginFailed') })
      return
    }
    sportsBetHistoryList.value = Array.isArray(response?.wl) ? response.wl : []
  } catch (error) {
    if (isCurrent()) {
      sportsBetHistoryList.value = []
      console.error(error)
    }
  }
}

// PC/H5 共用返回体育投注首页，后续真实数据接入时也能复用这个入口。
const handleStartPlaying = () => {
  navigateTo('/sports')
}

// H5 点击投注记录右箭头进入体育投注详情
const openSportsBetDetails = (item: HistoryWagerView) => {
  navigateTo(`/sports/bet-details/${item.id}`, {
    state: {
      sportsBetData: JSON.stringify(item.raw),
      sportsBetOwner: JSON.stringify([
        userStore.userInfo?.memberId,
        userStore.acctInfo?.memberId,
        currentCurrencyCode.value
      ])
    }
  })
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
  'h-[40px] px-[30px] rounded-[32px] text-[14px] font-[400] transition-colors',
  active ? 'bg-bg-3 text-text-1 font-[700]' : 'bg-bg-9 text-text-2'
]

// 账号或币种变化时丢弃旧订单与确认状态，避免跨钱包展示和提交。
watch(getCredentialOwner, () => {
  void fetchSportsBetHistory()
})

onMounted(() => {
  sportsStore.markBetHistoryViewed()
  void fetchSportsBetHistory()
})
onScopeDispose(() => {
  historyRequestId += 1
})
</script>

<style scoped>
.sports-bet-history-mobile {
  height: 100vh;
  height: 100dvh;
  overscroll-behavior: none;
}
</style>
