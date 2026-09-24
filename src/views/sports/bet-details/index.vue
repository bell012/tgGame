<template>
  <!-- 体育投注详情 H5 页面 -->
  <section class="fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1">
    <H5Header
      :title="t('betDetails.title')"
      :show-sort="true"
      :right-icon="KefuIcon"
      @sort="openKefuPopup"
    />

    <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5">
      <article class="rounded-lg bg-bg-2 p-3.5">
        <header class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-[8px]">
            <div
              class="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-bg-3"
            >
              <component
                :is="betDetail.sportIcon"
                class="h-[30px] w-[30px] fill-current text-icon-2 [&_circle]:fill-current [&_path]:fill-current [&_rect]:fill-current"
              />
            </div>
            <h1 class="min-w-0 truncate text-[18px] font-[700] text-text-1">
              {{ t('betHistory.filterOptions.sports') }}
            </h1>
          </div>

          <span
            :class="[
              'shrink-0 rounded-[14px] px-[15px] py-[2px] text-[13px] font-[400] text-common-100',
              betDetail.statusBadgeClass
            ]"
          >
            {{ betDetail.statusLabel }}
          </span>
        </header>

        <div class="mt-3.5 border-t border-opacity-10 pt-3.5">
          <h2 class="text-[14px] font-[700] text-text-1">{{ betDetail.matchName }}</h2>
          <p class="mt-2 text-[12px] font-[400] text-text-2">{{ betDetail.leagueName }}</p>
        </div>

        <section class="mt-3.5 rounded-lg bg-bg-4 p-3.5">
          <p class="text-[14px] font-[400] text-text-2">{{ betDetail.marketName }}</p>
          <p class="mt-[8px] text-[14px] font-[400] text-text-1">
            {{ betDetail.selectionName }}
            <span v-if="betDetail.handicapText" class="ml-1">{{ betDetail.handicapText }}</span>
            <span class="ml-2">{{ betDetail.oddsText }}</span>
          </p>
          <button
            v-if="!betDetail.settled"
            type="button"
            class="mt-3.5 text-[14px] font-[400] text-theme-primary"
            @click="handleConfirm"
          >
            {{ t('betDetails.confirm') }}
          </button>
        </section>

        <section class="mt-2.5 space-y-5 rounded-lg bg-bg-4 p-3.5">
          <div class="flex items-center justify-between gap-4">
            <span class="text-[14px] font-[400] text-text-3">{{ t('betDetails.currency') }}</span>
            <span class="text-right text-[14px] font-[400] text-text-1">
              {{ betDetail.currency }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-[14px] font-[400] text-text-3">
              {{ t('betHistory.betAmount') }}
            </span>
            <span class="text-right text-[14px] font-[400] text-text-1">
              {{ betDetail.betAmount }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-[14px] font-[400] text-text-3">{{ t('betDetails.winLoss') }}</span>
            <span class="text-right text-[14px] font-[400] text-text-1">
              {{ betDetail.winLossText }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-[14px] font-[400] text-text-3">{{ t('betDetails.orderNo') }}</span>
            <div class="flex min-w-0 items-center gap-1">
              <span class="min-w-0 truncate text-right text-[14px] font-[400] text-text-1">
                {{ betDetail.orderNo }}
              </span>
              <button type="button" class="shrink-0 p-1" @click="copyOrderNo">
                <CopyIcon class="h-4 w-4 text-text-2" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-[14px] font-[400] text-text-3">{{ t('betDetails.createdAt') }}</span>
            <span class="text-right text-[14px] font-[400] text-text-1">
              {{ betDetail.createdAt }}
            </span>
          </div>
        </section>
      </article>
    </main>

    <!-- 提前结算弹窗 -->
    <SportsBuyBackSheet v-model:visible="showBuyBackSheet" :wager="sourceBetDetail" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { formatUsDateTime12h } from '@/utils/date'
import { globalShowToast } from '@/utils/toast'
import type { SportsBetHistoryWager } from '@/api/interface/sport'
import CopyIcon from '@/static/svg/copy.svg?component'
import KefuIcon from '@/static/svg/vip/kefu.svg?component'
import {
  findSportItemBySportId,
  sportItems,
  type SportItem
} from '../components/sports-navigation/sport-items'
import SportsBuyBackSheet from '../components/SportsBuyBackSheet.vue'

type SportsBetDetailDisplay = {
  sportIcon?: SportItem['icon']
  statusLabel: string
  statusBadgeClass: string
  settled: boolean
  matchName: string
  leagueName: string
  marketName: string
  selectionName: string
  handicapText: string
  oddsText: string
  currency: string
  betAmount: string
  winLossText: string
  orderNo: string
  createdAt: string
}

const { t } = useI18n()
const router = useRouter()
const { currentCurrencyCode } = useDisplayCurrency()

usePageScrollLock(() => true)

const showBuyBackSheet = ref(false)

// 转成数字，兼容接口返回字符串、空值或 null。
const toSportsBetNumber = (value: number | string | null | undefined) => {
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

// 金额展示统一保留两位小数。
const formatSportsBetAmount = (value: number | string | null | undefined) => {
  const fixed = toSportsBetNumber(value).toFixed(2)
  return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed
}

// 赔率按接口原始数字展示，避免强制补零影响体育赔率阅读。
const formatSportsBetOdds = (value: number | string | null | undefined) => {
  const numericValue = toSportsBetNumber(value)
  return numericValue ? String(numericValue) : '--'
}

// 根据接口金额字段判断注单是否已结算。
const isSportsBetSettled = (item: SportsBetHistoryWager) =>
  toSportsBetNumber(item.btbba) > 0 || toSportsBetNumber(item.mwla) !== 0

// 未结算取 pp，已结算取 btbba；btbba 为 0 时回退 mwla。
const getSportsBetResultAmount = (item: SportsBetHistoryWager) =>
  isSportsBetSettled(item) ? (toSportsBetNumber(item.btbba) > 0 ? item.btbba : item.mwla) : item.pp

// 通过投注项 sid 匹配 sportItems 图标，找不到时使用默认球种图标。
const getSportsBetIcon = (item: SportsBetHistoryWager) =>
  findSportItemBySportId(item.wil[0]?.sid)?.icon ?? sportItems[0]?.icon

// 从路由 state 中读取体育投注详情数据，支持字符串和对象两种传递方式。
const readSportsBetDetailFromState = () => {
  const state = history.state as {
    sportsBetData?: string | SportsBetHistoryWager
    data?: string | SportsBetHistoryWager
  }
  const rawData = state?.sportsBetData ?? state?.data

  if (!rawData) {
    return null
  }

  try {
    return typeof rawData === 'string' ? (JSON.parse(rawData) as SportsBetHistoryWager) : rawData
  } catch (error) {
    console.error(error)
    return null
  }
}

// 生成带正负号的输赢金额文本。
const formatWinLossText = (value: number | string | null | undefined) => {
  const amount = toSportsBetNumber(value)
  const prefix = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${prefix}${formatSportsBetAmount(Math.abs(amount))}`
}

// 将体育投注原始注单转换为详情页展示字段。
const mapSportsBetDetail = (item: SportsBetHistoryWager): SportsBetDetailDisplay => {
  const selection = item.wil[0]
  const settled = isSportsBetSettled(item)
  const resultAmount = getSportsBetResultAmount(item)

  return {
    sportIcon: getSportsBetIcon(item),
    statusLabel: settled
      ? t('betHistory.filterOptions.settled')
      : t('betHistory.filterOptions.unsettled'),
    statusBadgeClass: settled ? 'bg-secondary-4' : 'bg-secondary-7',
    settled,
    matchName: `${selection?.htn ?? '--'} VS ${selection?.atn ?? '--'}`,
    leagueName: selection?.cn ?? '--',
    marketName: selection?.btn ?? '--',
    selectionName: selection?.sen ?? '--',
    handicapText: selection?.dih ? `(${selection.dih})` : '',
    oddsText: `@ ${formatSportsBetOdds(selection?.o)}`,
    currency: currentCurrencyCode.value,
    betAmount: formatSportsBetAmount(item.isa),
    winLossText: formatWinLossText(resultAmount),
    orderNo: String(item.wid),
    createdAt: formatUsDateTime12h(item.wcdt)
  }
}

const emptyBetDetail = computed<SportsBetDetailDisplay>(() => ({
  sportIcon: sportItems[0]?.icon,
  statusLabel: '',
  statusBadgeClass: '',
  settled: true,
  matchName: '--',
  leagueName: '--',
  marketName: '--',
  selectionName: '--',
  handicapText: '',
  oddsText: '@ --',
  currency: currentCurrencyCode.value,
  betAmount: '0',
  winLossText: '0',
  orderNo: '',
  createdAt: '--'
}))

const sourceBetDetail = computed(() => readSportsBetDetailFromState())
const betDetail = computed(() =>
  sourceBetDetail.value ? mapSportsBetDetail(sourceBetDetail.value) : emptyBetDetail.value
)

// 点击客服图标，当前先按需求预留打印。
const openKefuPopup = () => {
  console.log('点击客服')
}

// 点击详情页确认按钮时打开提前结算底部弹窗。
const handleConfirm = () => {
  if (!sourceBetDetail.value) {
    return
  }

  showBuyBackSheet.value = true
}

// 复制订单号并展示公共成功提示。
const copyOrderNo = () => {
  void navigator.clipboard?.writeText(betDetail.value.orderNo)
  globalShowToast(t('betDetails.copy'))
}

// 无可用详情数据时回退投注历史页，详情数据由投注历史列表通过路由 state 传入。
if (!readSportsBetDetailFromState()) {
  router.replace('/sports/bet-history')
}
</script>
