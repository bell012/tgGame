<template>
  <!-- 体育H5投注历史页面 -->
  <section
    v-if="isMobile"
    class="sports-bet-history-mobile fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg-1 font-inter sm:hidden"
  >
    <H5Header :title="t('betHistory.title')" :show-sort="true" @sort="openMobileFilter" />

    <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5">
      <div v-if="mobileHistoryList.length > 0" class="flex flex-col gap-[7px]">
        <article
          v-for="item in mobileHistoryList"
          :key="item.id"
          @click="openSportsBetDetails(item)"
          class="relative overflow-hidden rounded-lg bg-bg-2 px-3.5 py-[10px]"
        >
          <span
            :class="[
              'absolute right-0 top-0 rounded-bl-[10px] px-[6px] py-[3px] text-[11px] font-[400]',
              item.statusBadgeClass
            ]"
          >
            {{ item.statusLabel }}
          </span>

          <div class="flex items-center gap-2.5">
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

            <div class="min-w-0 flex-1">
              <h2 class="min-w-0 truncate text-[14px] font-[700] text-text-1">
                {{ item.matchName }}
              </h2>
              <div class="mt-2.5 flex items-center justify-between gap-3">
                <p class="min-w-0 flex-1 text-[14px] font-[400] text-text-1">
                  {{ t('betHistory.betAmount') }} : {{ item.betAmount }}
                </p>
                <p :class="['shrink-0 text-[14px] font-[700]', item.amountClass]">
                  {{ item.resultLabel }} : {{ item.resultAmount }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-2.5 flex items-center justify-between gap-2.5 pt-2.5">
            <p class="min-w-0 flex-1 text-[12px] font-[400] text-text-2">
              {{ item.createdAt }}
            </p>
            <div class="flex shrink-0 items-center gap-[8px]">
              <button
                v-if="!item.settled"
                type="button"
                class="rounded-[6px] bg-theme-primary px-[8px] py-[3px] text-[12px] font-[400] text-text-4"
              >
                {{ t('betHistory.earlySettlement') }}
              </button>
              <button
                type="button"
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
import { formatUsDateTime12h } from '@/utils/date'
import type { SportsBetHistoryWager } from '@/api/interface/sport'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import SportsNavigationPc from '../components/sports-navigation/pc.vue'
import {
  buildSportTodayCountMap,
  findSportItemBySportId,
  sportItems,
  type SportItem
} from '../components/sports-navigation/sport-items'

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

// 临时体育投注历史假数据；接口有真实 wl 数据后删除这一段并替换数据源。
const SPORTS_BET_HISTORY_MOCK_LIST: SportsBetHistoryWager[] = [
  {
    wid: '2609240037339871',
    wcdt: 1790224653805,
    mc: 'test_1000019885_cny',
    isa: 5,
    mwla: 0,
    ot: 3,
    wat: 1,
    bp: 'App',
    bcr: 0,
    bcs: 2,
    bss: 0,
    br: 0,
    bts: 0,
    prid: 2609240038208724,
    bbp: 4.7,
    btbba: 0,
    noc: 0,
    combs: 0,
    pp: 4.15,
    cas: true,
    wil: [
      {
        waics: 2,
        wict: 1,
        waict: 1,
        waicr: 0,
        m: 2,
        eid: 113955661,
        en: '',
        etid: 1,
        edt: 1790244300000,
        sid: 1,
        rsid: 1,
        cid: 1653,
        cn: '麒麟挑战杯(在日本)',
        egtid: 1,
        htid: 76849,
        htn: '日本',
        atid: 18201,
        atn: '乌拉圭',
        ft: 'H',
        btid: 2,
        btn: '大/小',
        peid: 1,
        btsid: 3,
        sen: '大',
        otid: 0,
        o: 1.83,
        h: 2.25,
        dih: '2/2.5',
        gtid: 1,
        seo: 0,
        md: 0,
        mlid: 2535880797,
        sp: '',
        dh: 0,
        pid: 10,
        pn: '日本',
        ei: { crs: false }
      }
    ],
    sw: 1,
    ber: 1
  },
  {
    wid: '2609230320203578',
    wcdt: '2026-09-23T03:20:20.6031239-04:00',
    mc: 'test_1000020467_cny',
    isa: 8.5,
    mwla: -8.5,
    ot: 3,
    wat: 1,
    bp: 'App',
    bcr: 0,
    bcs: 2,
    bss: 1,
    br: 0,
    bts: 0,
    prid: null,
    bbp: null,
    btbba: 0,
    noc: 0,
    combs: 0,
    coo: null,
    pp: 28.98,
    cas: false,
    pbo: null,
    sdt: '2026-09-24T00:22:04.1745151-04:00',
    btsdt: null,
    ou: 2,
    wil: [
      {
        waics: 2,
        wict: 1,
        waict: 1,
        waicr: 0,
        m: 2,
        eid: 113957396,
        en: '',
        etid: 1,
        edt: '2026-09-23T22:00:00-04:00',
        sid: 11,
        rsid: 2,
        cid: 1103,
        cn: 'WNBA美国女子职业篮球联赛',
        egtid: 1,
        rbt: null,
        htid: 9581,
        htn: '西雅图暴风',
        atid: 5467,
        atn: '达拉斯飞翼',
        ft: 'H',
        btid: 4,
        btn: '独赢',
        peid: 1,
        btsid: 8,
        sen: '主',
        eon: null,
        otid: 0,
        otn: null,
        pbo: null,
        o: 4.41,
        ao: null,
        h: null,
        dih: null,
        hthts: 42,
        athts: 49,
        htfts: 91,
        atfts: 103,
        wahts: null,
        waats: null,
        gtid: 1,
        seo: 0,
        md: 0,
        mlid: 2535922576,
        sp: '',
        soid: null,
        os: null,
        dh: 0,
        wtl: null,
        ws: null,
        pid: 140,
        pn: 'WNBA',
        ei: '',
        rai: null,
        wio: 2
      }
    ],
    rs: null,
    sw: 1,
    bo: null,
    bc: null,
    ber: 0
  },
  {
    wid: 'mock-settled-basketball-1',
    wcdt: '2026-12-18T11:14:15',
    mc: 'mock_member_cny',
    isa: 1000,
    mwla: -1000,
    ot: 3,
    wat: 1,
    bp: 'App',
    bcr: 0,
    bcs: 2,
    bss: 1,
    br: 0,
    bts: 0,
    prid: null,
    bbp: null,
    btbba: 0,
    noc: 0,
    combs: 0,
    pp: 1000,
    cas: false,
    wil: [
      {
        waics: 2,
        wict: 1,
        waict: 1,
        waicr: 0,
        m: 2,
        eid: 900000001,
        en: '',
        etid: 1,
        edt: '2026-12-18T11:14:15',
        sid: 36,
        rsid: 2,
        cid: 9001,
        cn: 'Mock Basketball League',
        egtid: 1,
        htid: 90001,
        htn: '格兰维尔',
        atid: 90002,
        atn: '费雷泽公园',
        ft: 'H',
        btid: 4,
        btn: '独赢',
        peid: 1,
        btsid: 8,
        sen: '主',
        otid: 0,
        o: 1.88,
        h: null,
        dih: null,
        gtid: 1,
        seo: 0,
        md: 0,
        mlid: 900000001,
        sp: '',
        dh: 0,
        pid: 140,
        pn: 'Basketball',
        ei: ''
      }
    ],
    sw: 1,
    ber: 0
  }
]

type SportsBetHistoryDisplayItem = {
  id: string
  sportIcon?: SportItem['icon']
  raw: SportsBetHistoryWager
  matchName: string
  statusLabel: string
  settled: boolean
  betAmount: string
  resultLabel: string
  resultAmount: string
  amountClass: string
  statusBadgeClass: string
  createdAt: string
}

// 转成数字，兼容接口后续可能返回字符串或 null。
const toSportsBetNumber = (value: number | string | null | undefined) => {
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

// 金额展示统一保留两位小数。
const formatSportsBetAmount = (value: number | string | null | undefined) =>
  toSportsBetNumber(value).toFixed(2)

// 根据接口金额字段判断注单是否已结算。
const isSportsBetSettled = (item: SportsBetHistoryWager) =>
  toSportsBetNumber(item.btbba) > 0 || toSportsBetNumber(item.mwla) !== 0

// 未结算取 pp，已结算取 btbba；btbba 为 0 时回退 mwla。
const getSportsBetResultAmount = (item: SportsBetHistoryWager) =>
  isSportsBetSettled(item) ? (toSportsBetNumber(item.btbba) > 0 ? item.btbba : item.mwla) : item.pp

// 通过体育投注项 sid 找到 sportItems 中对应的图标。
const getSportsBetIcon = (item: SportsBetHistoryWager) => {
  return findSportItemBySportId(item.wil[0]?.sid)?.icon ?? sportItems[0]?.icon
}

// 将接口原始 wl 记录转换成 H5 卡片展示数据。
const mapSportsBetHistoryItem = (item: SportsBetHistoryWager): SportsBetHistoryDisplayItem => {
  const selection = item.wil[0]
  const settled = isSportsBetSettled(item)
  const resultAmount = getSportsBetResultAmount(item)
  const resultNumber = toSportsBetNumber(resultAmount)

  return {
    id: String(item.wid),
    sportIcon: getSportsBetIcon(item),
    raw: item,
    matchName: `${selection?.htn ?? '--'} VS ${selection?.atn ?? '--'}`,
    statusLabel: settled
      ? t('betHistory.filterOptions.settled')
      : t('betHistory.filterOptions.unsettled'),
    settled,
    betAmount: formatSportsBetAmount(item.isa),
    resultLabel: resultNumber < 0 ? t('betHistory.loss') : t('betHistory.win'),
    resultAmount: formatSportsBetAmount(Math.abs(resultNumber)),
    amountClass: resultNumber < 0 ? 'text-secondary-4' : 'text-secondary-2',
    statusBadgeClass: settled ? 'bg-secondary-3 text-secondary-4' : 'bg-bg-3 text-text-2',
    createdAt: formatUsDateTime12h(item.wcdt)
  }
}

const mobileHistoryList = computed(() =>
  SPORTS_BET_HISTORY_MOCK_LIST.filter(item =>
    filterValues.value.status === 'settled' ? isSportsBetSettled(item) : !isSportsBetSettled(item)
  ).map(mapSportsBetHistoryItem)
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

// H5 点击投注记录右箭头进入体育投注详情
const openSportsBetDetails = (item: SportsBetHistoryDisplayItem) => {
  navigateTo(`/sports/bet-details/${item.id}`, {
    state: {
      sportsBetData: JSON.stringify(item.raw)
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
