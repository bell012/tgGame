<template>
  <div class="mt-[14px]">
    <!-- Header -->
    <div class="grid lg:grid-cols-2 grid-cols-1 gap-[14px]">
      <h2 class="flex items-center text-[14px] font-extrabold text-primary">
        {{ t('casino.latest_bet') }}
      </h2>
      <div class="flex w-full lg:w-auto lg:justify-end items-center sm:justify-start justify-start">
        <div class="bet-tabs flex w-full lg:w-auto items-center">
          <button
            v-for="(tab, index) in tabs"
            :key="tab.value"
            :class="['bet-tab', 'flex-1 lg:flex-none', { active: activeTab === index }]"
            @click="activeTab = index"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>
    <!-- Table -->
    <div class="table-wrap">
      <div
        v-if="activeTab !== 2"
        class="table-scroll-shell relative h-[430px] w-full overflow-hidden [overflow-anchor:none]"
      >
        <table class="table [&_td]:px-3 sm:[&_td]:px-4" role="table" style="overflow-anchor: none">
          <thead class="table-head pc-only" role="rowgroup">
            <tr role="row" class="text-text-2">
              <th>{{ t('gameDetail.betId') }}</th>
              <th class="sm:w-auto">{{ t('gameDetail.bet') }}</th>
              <th>{{ t('home.Multiplier') }}</th>
              <th class="text-right">{{ t('gameDetail.profit') }}</th>
            </tr>
          </thead>
          <tbody v-if="isLoading">
            <tr
              v-for="index in MAX_VISIBLE_ROWS"
              :key="`skeleton-${index}`"
              class="h-[39px]"
              :class="[index % 2 === 1 ? 'bg-bg-3' : 'bg-bg-2']"
            >
              <td class="h-[39px] px-3">
                <div class="h-3.5 w-24 max-w-full rounded bg-text-2/10" />
              </td>
              <td class="h-[39px] px-3">
                <div class="flex items-center justify-center gap-1">
                  <div class="h-3.5 w-10 rounded bg-text-2/10" />
                  <div class="h-3 w-3 shrink-0 rounded-full bg-text-2/10" />
                </div>
              </td>
              <td class="h-[39px] px-3">
                <div class="mx-auto h-3.5 w-10 rounded bg-text-2/10" />
              </td>
              <td class="h-[39px] px-3">
                <div class="ml-auto flex w-[73px] items-center justify-end gap-1 sm:w-[88px]">
                  <div class="h-3.5 w-12 rounded bg-text-2/10 sm:w-16" />
                  <div class="h-3 w-3 shrink-0 rounded-full bg-text-2/10" />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="rows.length">
            <tr
              v-for="(item, index) in rows"
              :key="`row-${index}`"
              :class="[index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
            >
              <td class="h-[39px] px-3 text-text-1 truncate">
                <span class="text-text-1 truncate">
                  {{ item.betId }}
                </span>
              </td>
              <td class="cell" role="cell">
                <div class="flex items-center justify-center">
                  <span class="order-1">{{ item.bet }}</span>
                  <SmartImage
                    :src="currentCurrencyIcon"
                    class="icon object-contain shrink-0 order-2"
                    :alt="currentRequestCurrency"
                  />
                </div>
              </td>
              <td class="h-[39px] px-3 text-text-1 truncate">
                {{ item.payout }}{{ multiplierUnit }}
              </td>
              <td class="profit-cell h-[39px] px-3">
                <div class="flex items-center justify-end gap-1">
                  <span
                    class="order-1"
                    :class="
                      item.profitNumber >= 0
                        ? 'text-[var(--color-secondary-level-4)]'
                        : 'text-[#ff4d4f]'
                    "
                  >
                    {{ item.profitNumber >= 0 ? '+' : '' }}{{ item.profit }}
                  </span>
                  <SmartImage
                    :src="currentCurrencyIcon"
                    class="w-3 h-3 object-contain shrink-0 order-2"
                    :alt="currentRequestCurrency"
                  />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr class="bg-bg-2">
              <td colspan="4" class="px-2 py-5">
                <ThemedEmptyState
                  :dark-image="defaultImgDark"
                  :light-image="defaultImgLight"
                  :image-alt="t('gameDetail.noData')"
                  :message="t('gameDetail.stayTunedComingSoon')"
                  container-class="mt-0"
                  image-class="h-[120px] w-auto mb-1.5"
                  text-class="text-[12px] font-[500] leading-[18px] text-text-2"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <LatestBetTable v-else :type="2" class="detail-high-roller-table" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { GameBetRecordItem } from '@/api/interface/game'
import LatestBetTable from '@/components/common/latestBetTable.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import { getCurrencyImageByCode } from '@/utils/locale'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useUserStore } from '@/stores/user'
import { computed, inject, onBeforeUnmount, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import SmartImage from '@/components/common/SmartImage.vue'
import { storeToRefs } from 'pinia'

const activeTab = ref(0)
const { t } = useI18n()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const isLoggedIn = computed(() => Boolean(userInfo.value?.tradeToken))

const tabs = computed(() => [
  { value: 0, label: t('gameDetail.allBets') },
  { value: 1, label: t('gameDetail.myBets') },
  { value: 2, label: t('home.HighRoller') }
])
const multiplierUnit = 'x' //computed(() => t('gameDetail.multiplierUnit'))

type CurrentGameDetail = {
  itemCode?: string | number
  platformCode?: string
} | null

interface IRow {
  id: string
  betId: string
  bet: string
  payout: string
  profit: string
  profitNumber: number
}

const rows = ref<IRow[]>([])
const betSourceRows = ref<IRow[]>([])
const isLoading = ref(false)

const MAX_VISIBLE_ROWS = 10
const BET_SCROLL_INTERVAL_MS = 1000
const INITIAL_AUTO_SCROLL_DELAY_MS = 1500

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const { currentCurrencyCode } = useDisplayCurrency()

const normalizeValue = (value: unknown) => String(value ?? '').trim()

const currentGameCode = computed(() => normalizeValue(currentGameDetail.value?.itemCode))
const currentPlatformCode = computed(() => normalizeValue(currentGameDetail.value?.platformCode))
const currentRequestCurrency = computed(
  () => normalizeValue(currentCurrencyCode.value).toUpperCase() || 'PHP'
)
const currentCurrencyIcon = computed(() => getCurrencyImageByCode(currentRequestCurrency.value))

const currentBetType = computed<1 | 2>(() => (activeTab.value === 1 ? 2 : 1))

const parseAmount = (value: unknown) => {
  const parsed = Number(normalizeValue(value))
  return Number.isFinite(parsed) ? parsed : 0
}

const formatApiAmount = (value: unknown) => {
  const text = normalizeValue(value)
  return text || '0'
}

const mapRecordToRow = (item: GameBetRecordItem, index: number): IRow => {
  const betId = normalizeValue(item.betId) || '-'
  const profitNumber = parseAmount(item.profit ?? item.winAmount)
  return {
    id: `${betId}-${index}`,
    betId,
    bet: formatApiAmount(item.bet ?? item.wager),
    payout: formatApiAmount(
      item.payout ?? item.payOut ?? item.multiple ?? item.mult ?? item.multiplier
    ),
    profit: formatApiAmount(item.profit ?? item.winAmount),
    profitNumber
  }
}

const fetchBetRecords = async () => {
  stopBetAutoScroll()
  const platformCode = currentPlatformCode.value
  const gameCode = currentGameCode.value
  if (!platformCode || !gameCode) {
    betSourceRows.value = []
    rows.value = []
    return
  }

  try {
    const res = await Api.game.getGameBetRecordList(
      {
        page: {
          current: 1,
          size: 100
        },
        platformCode,
        gameCode,
        currency: currentRequestCurrency.value,
        betType: currentBetType.value
      },
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    const rawResult = res?.result
    const records = (rawResult as { records?: unknown } | undefined)?.records
    const recordList = Array.isArray(rawResult)
      ? (rawResult as GameBetRecordItem[])
      : Array.isArray(records)
        ? (records as GameBetRecordItem[])
        : []

    betSourceRows.value = recordList.map((item, index) => mapRecordToRow(item, index))
    startBetAutoScroll()
  } catch (error) {
    console.error('fetchBetRecords failed', error)
    betSourceRows.value = []
    rows.value = []
  }
}

let betAutoScrollTimer: number | null = null
let betNextScrollIndex = 0
let deferBetInitialAutoScroll = true

const stopBetAutoScroll = () => {
  if (betAutoScrollTimer != null) {
    window.clearTimeout(betAutoScrollTimer)
    betAutoScrollTimer = null
  }
}

const scheduleNextBetScroll = () => {
  const delay = deferBetInitialAutoScroll ? INITIAL_AUTO_SCROLL_DELAY_MS : BET_SCROLL_INTERVAL_MS
  deferBetInitialAutoScroll = false

  betAutoScrollTimer = window.setTimeout(() => {
    const list = betSourceRows.value
    const nextRow = list[betNextScrollIndex]
    if (!nextRow || list.length === 0) {
      return
    }

    rows.value = [nextRow, ...rows.value.slice(0, MAX_VISIBLE_ROWS - 1)]
    betNextScrollIndex = (betNextScrollIndex + 1) % list.length
    scheduleNextBetScroll()
  }, delay)
}

const startBetAutoScroll = () => {
  stopBetAutoScroll()
  deferBetInitialAutoScroll = true
  const list = betSourceRows.value
  if (list.length === 0) {
    rows.value = []
    return
  }

  if (list.length <= MAX_VISIBLE_ROWS) {
    rows.value = [...list]
    return
  }

  rows.value = list.slice(0, MAX_VISIBLE_ROWS)
  betNextScrollIndex = MAX_VISIBLE_ROWS % list.length
  scheduleNextBetScroll()
}

const fetchTableData = async () => {
  if (activeTab.value === 2) {
    stopBetAutoScroll()
    betSourceRows.value = []
    rows.value = []
    return
  }

  isLoading.value = true
  try {
    if (!isLoggedIn.value) {
      stopBetAutoScroll()
      betSourceRows.value = []
      rows.value = []
      return
    }

    await fetchBetRecords()
  } finally {
    isLoading.value = false
  }
}

watch(
  [activeTab, currentPlatformCode, currentGameCode, currentRequestCurrency, isLoggedIn],
  () => {
    void fetchTableData()
  },
  { immediate: true }
)

watch([betSourceRows, activeTab], () => {
  if (isLoading.value || activeTab.value === 2) {
    return
  }
  startBetAutoScroll()
})

onBeforeUnmount(() => {
  stopBetAutoScroll()
})
</script>

<style scoped>
.latest-wrap {
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
}

.bet-tabs {
  background: var(--color-background-level-7);
  border-radius: 10px;
  height: 39px;
  padding: 0;
  gap: 0;
  overflow: hidden;
}

.bet-tab {
  height: 100%;
  min-height: 0;
  padding: 6px 28px;
  background: transparent;
  color: var(--color-text-level-2);
  border: none;
  border-radius: 8px;
  box-sizing: border-box;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: keep-all;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.bet-tab.active {
  background: var(--color-background-level-8);
  color: var(--color-text-level-1);
  box-shadow: none;
}

:global(:root.light) .bet-tabs {
  border-radius: 10px;
  background: var(--color-background-level-5);
  border: none;
}

:global(:root.light) .bet-tab {
  border-radius: 8px;
  color: var(--color-text-level-2);
  background: transparent;
}

:global(:root.light) .bet-tab.active {
  background: var(--color-background-level-3);
  border: none;
  box-shadow: none;
  color: var(--color-text-level-1);
}

.table-wrap {
  margin-top: 14px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 10px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: center;
}

.table tbody td:not([colspan]) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  vertical-align: middle;
}
.table td:nth-child(1),
.table th:nth-child(1) {
  text-align: left;
}
.high-roller-table td:nth-child(3),
.high-roller-table th:nth-child(3) {
  text-align: center;
}
.table-head th {
  padding: 10px 14px;
  height: 39px;
  font-weight: 700;
  white-space: nowrap;
  box-sizing: border-box;
  background: var(--color-background-level-2);
}

.table-row {
  padding: 0;
}

.table tbody tr td:not([colspan]) {
  vertical-align: middle;
  box-sizing: border-box;
  height: 39px;
  min-height: 39px;
  max-height: 39px;
}

.cell {
  gap: 8px;
  overflow: hidden;
  height: 39px;
}

.profit-cell {
  font-size: 14px;
}

.icon {
  height: 20px;
  flex: 0 0 20px;
  display: inline;
  margin: 0 4px;
}
/* 进入 / 离开动画 */
.latestList-enter-active,
.latestList-leave-active {
  transition: all 0.3s ease;
}
.live-enter-from {
  opacity: 0;
  transform: translateY(-1px);
}

.live-leave-to {
  opacity: 0;
  transform: translateY(1px);
}

/* 排序移动动画（关键） */
.latestList-move {
  transition: transform 0.3s ease;
}

@media (max-width: 1023px) {
  .bet-tab {
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .bet-tabs {
    width: 100%;
    height: 39px;
    padding: 0;
    gap: 0;
  }

  .bet-tab {
    flex: 1;
    height: 100%;
    min-height: 0;
    padding: 6px 6px;
    text-align: center;
    font-size: 13px;
    line-height: 1.1;
  }

  .bet-tab.active {
    box-shadow: none;
  }

  .table-head th {
    padding: 8px 6px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .table tbody tr td:not([colspan]) {
    height: 39px !important;
    min-height: 39px !important;
    max-height: 39px !important;
    padding: 0 6px !important;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .high-roller-table td:nth-child(1),
  .high-roller-table th:nth-child(1) {
    width: 26%;
  }

  .high-roller-table td:nth-child(2),
  .high-roller-table th:nth-child(2) {
    width: 23%;
  }

  .high-roller-table td:nth-child(3),
  .high-roller-table th:nth-child(3) {
    width: 24%;
  }

  .high-roller-table td:nth-child(4),
  .high-roller-table th:nth-child(4) {
    width: 27%;
  }

  .high-roller-table td:nth-child(1) span,
  .high-roller-table td:nth-child(2) span {
    white-space: nowrap;
  }

  .high-roller-table td:nth-child(3),
  .high-roller-table td:nth-child(4),
  .high-roller-table td:nth-child(4) span {
    white-space: nowrap;
  }
}

@media (max-width: 375px) {
  .bet-tabs {
    width: 100%;
    height: 39px;
  }

  .bet-tab {
    flex: 1;
    height: 100%;
    min-height: 0;
    padding: 6px 3px;
    text-align: center;
    font-size: 10px;
  }

  .table-head th {
    padding: 8px 6px;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .table tbody tr td:not([colspan]) {
    height: 39px !important;
    min-height: 39px !important;
    max-height: 39px !important;
    padding: 0 6px !important;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .table:not(.high-roller-table) td:nth-child(1),
  .table:not(.high-roller-table) th:nth-child(1) {
    width: 27%;
  }

  .table:not(.high-roller-table) td:nth-child(2),
  .table:not(.high-roller-table) th:nth-child(2) {
    width: 20%;
  }

  .table:not(.high-roller-table) td:nth-child(3),
  .table:not(.high-roller-table) th:nth-child(3) {
    width: 24%;
  }

  .table:not(.high-roller-table) td:nth-child(4),
  .table:not(.high-roller-table) th:nth-child(4) {
    width: 29%;
  }

  .table:not(.high-roller-table) td:nth-child(1) span,
  .table:not(.high-roller-table) td:nth-child(2),
  .table:not(.high-roller-table) td:nth-child(3) span,
  .table:not(.high-roller-table) td:nth-child(4) span {
    white-space: nowrap;
  }

  .high-roller-table td:nth-child(1),
  .high-roller-table th:nth-child(1) {
    width: 25%;
  }

  .high-roller-table td:nth-child(2),
  .high-roller-table th:nth-child(2) {
    width: 22%;
  }

  .high-roller-table td:nth-child(3),
  .high-roller-table th:nth-child(3) {
    width: 24%;
  }

  .high-roller-table td:nth-child(4),
  .high-roller-table th:nth-child(4) {
    width: 29%;
  }

  .high-roller-table td:nth-child(3),
  .high-roller-table td:nth-child(4),
  .high-roller-table td:nth-child(4) span {
    white-space: nowrap;
  }

  .icon {
    height: 14px;
    flex: 0 0 14px;
    margin: 0 2px;
  }

  .cell {
    height: 39px;
  }
}

@media (min-width: 1024px) {
  .bet-tab {
    font-size: 14px;
    line-height: 20px;
  }

  .table-head th {
    font-size: 14px;
    line-height: 20px;
  }

  .table tbody tr td:not([colspan]) {
    font-size: 14px;
    line-height: 20px;
  }

  :deep(.detail-high-roller-table table) {
    font-size: 14px;
    line-height: 20px;
  }
}

@media (min-width: 768px) {
  :global(:root:not(.light)) .bet-tabs {
    background: var(--color-background-level-3);
    border: none;
  }

  :global(:root:not(.light)) .bet-tab {
    border: none;
    background: transparent;
    color: var(--color-text-level-2);
  }

  :global(:root:not(.light)) .bet-tab.active {
    background: var(--color-background-level-2);
    color: var(--color-text-level-1);
  }

  :global(:root:not(.light)) .table-wrap {
    background: var(--color-background-level-3);
  }
}
</style>
