<template>
  <div class="mt-[12px]">
    <!-- Header -->
    <div class="grid lg:grid-cols-2 grid-cols-1 gap-4">
      <h2 class="flex items-center text-base font-extrabold text-primary">
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
      <table
        v-if="activeTab === 0 || activeTab === 1"
        class="table [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4"
        role="table"
        style="overflow-anchor: none"
      >
        <thead class="table-head pc-only" role="rowgroup">
          <tr role="row" class="bg-bg-2 text-text-2">
            <th>{{ t('gameDetail.betId') }}</th>
            <th class="sm:w-auto">{{ t('gameDetail.bet') }}</th>
            <th>{{ t('gameDetail.payout') }}</th>
            <th class="text-right">{{ t('gameDetail.profit') }}</th>
          </tr>
        </thead>
        <tbody v-if="rows.length">
          <tr
            v-for="(item, index) in rows"
            :key="item.id"
            :class="[index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
          >
            <td class="py-2 px-3 text-text-1 truncate">
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
            <td class="py-2 px-3 text-text-1 truncate">{{ item.payout }}x</td>
            <td class="py-2 px-3 text-[12px]">
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
              <div
                v-if="isLoading"
                class="text-center text-[12px] text-[var(--color-text-level-2)]"
              >
                {{ t('common.loading') }}
              </div>
              <ThemedEmptyState
                v-else
                :dark-image="defaultImgDark"
                :light-image="defaultImgLight"
                :image-alt="t('gameDetail.noData')"
                :message="t('gameDetail.noData')"
                container-class="mt-0"
                image-class="h-[120px] w-auto mb-1.5"
                text-class="text-[12px] font-[500] leading-[18px] text-text-2"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table
        v-else
        class="table high-roller-table [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4"
        role="table"
        style="overflow-anchor: none"
      >
        <thead class="table-head pc-only" role="rowgroup">
          <tr role="row" class="bg-bg-2 text-text-2">
            <th>{{ t('home.Game') }}</th>
            <th>{{ t('home.Player') }}</th>
            <th>{{ t('home.Multiplier') }}</th>
            <th class="text-right">{{ t('home.Profit') }}</th>
          </tr>
        </thead>
        <tbody v-if="highRollerRows.length">
          <tr
            v-for="(item, index) in highRollerRows"
            :key="`${item.id}-${index}`"
            :class="[index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
          >
            <td class="py-2 px-3">
              <div
                class="flex items-center gap-1 min-w-0 cursor-pointer"
                @click="handleHighRollerGameClick"
              >
                <SmartImage
                  :src="item.gameIcon"
                  class="w-3.5 h-3.5 object-contain"
                  :alt="item.game"
                />
                <span class="text-text-1 truncate">{{ item.game }}</span>
              </div>
            </td>
            <td class="py-2 px-3 text-text-1 truncate cursor-pointer">
              {{ item.player }}
            </td>
            <td class="py-2 px-3 text-text-1 truncate">x{{ item.multiplier }}</td>
            <td class="py-2 px-3 text-[12px]">
              <div class="flex items-center justify-end gap-1">
                <span :class="item.profit >= 0 ? 'text-[var(--color-secondary-level-4)]' : ''">
                  {{ item.profit >= 0 ? '+' : '' }}{{ item.profit }}
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
              <div
                v-if="isLoading"
                class="text-center text-[12px] text-[var(--color-text-level-2)]"
              >
                {{ t('common.loading') }}
              </div>
              <ThemedEmptyState
                v-else
                :dark-image="defaultImgDark"
                :light-image="defaultImgLight"
                :image-alt="t('gameDetail.noData')"
                :message="t('gameDetail.noData')"
                container-class="mt-0"
                image-class="h-[120px] w-auto mb-1.5"
                text-class="text-[12px] font-[500] leading-[18px] text-text-2"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { GameBetRecordItem } from '@/api/interface/game'
import { useLocaleStore } from '@/stores/locale'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import placeholderImg from '@/static/img/home/errImg.png'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'
import { navigateTo } from '@/utils/router'
import { storeToRefs } from 'pinia'
import { computed, inject, onBeforeUnmount, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import SmartImage from '@/components/common/SmartImage.vue'

const activeTab = ref(0)
const { t } = useI18n()

const tabs = computed(() => [
  { value: 0, label: t('gameDetail.allBets') },
  { value: 1, label: t('gameDetail.myBets') },
  { value: 2, label: t('home.HighRoller') }
])

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

interface IHighRollerRow {
  id: number
  game: string
  gameIcon: string
  player: string
  multiplier: number
  profit: number
}

const rows = ref<IRow[]>([])
const betSourceRows = ref<IRow[]>([])
const highRollerSourceRows = ref<IHighRollerRow[]>([])
const highRollerRows = ref<IHighRollerRow[]>([])
const isLoading = ref(false)

const MAX_VISIBLE_ROWS = 10
const SCROLL_INTERVAL_MS = 1000

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const localeStore = useLocaleStore()
const { actualCurrency } = storeToRefs(localeStore)

const normalizeValue = (value: unknown) => String(value ?? '').trim()

const currentGameCode = computed(() => normalizeValue(currentGameDetail.value?.itemCode))
const currentPlatformCode = computed(() => normalizeValue(currentGameDetail.value?.platformCode))
const currentRequestCurrency = computed(
  () => normalizeValue(actualCurrency.value).toUpperCase() || 'USD'
)
const currentCurrencyIcon = computed(() => getCurrencyIconByCode(currentRequestCurrency.value))

const currentBetType = computed<1 | 2>(() => (activeTab.value === 1 ? 2 : 1))
const gameImageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')

const handleHighRollerGameClick = () => {
  navigateTo('/bet-history')
}

const parseAmount = (value: unknown) => {
  const parsed = Number(normalizeValue(value))
  return Number.isFinite(parsed) ? parsed : 0
}

const formatAmount = (value: unknown) => {
  const parsed = Number(normalizeValue(value))
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00'
}

const mapRecordToRow = (item: GameBetRecordItem, index: number): IRow => {
  const betId = normalizeValue(item.betId) || '-'
  const payoutRate = parseAmount(item.multiple ?? item.mult ?? item.multiplier)
  const profitNumber = parseAmount(item.profit ?? item.winAmount)
  return {
    id: `${betId}-${index}`,
    betId,
    bet: formatAmount(item.bet ?? item.wager),
    payout: formatAmount(payoutRate),
    profit: formatAmount(item.profit ?? item.winAmount),
    profitNumber
  }
}

const toGameImageUrl = (value: unknown) => {
  const path = normalizeValue(value)
  if (!path) {
    return placeholderImg
  }
  if (/^(data:|blob:|https?:\/\/|\/)/i.test(path)) {
    return path
  }
  return gameImageBaseUrl ? `${gameImageBaseUrl}${path}` : path
}

const mapHighRollerToRow = (item: Record<string, unknown>, index: number): IHighRollerRow => {
  const icon = toGameImageUrl(item.coverImg)
  return {
    id: Number(item.rowId ?? index),
    game: String(item.gameName ?? '--'),
    gameIcon: icon || placeholderImg,
    player: String(item.nickName ?? '--'),
    multiplier: parseAmount(item.multiple),
    profit: parseAmount(item.winAmount)
  }
}

const fetchBetRecords = async () => {
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
  } catch (error) {
    console.error('fetchBetRecords failed', error)
    betSourceRows.value = []
    rows.value = []
  }
}

const fetchHighRollerRecords = async () => {
  stopHighRollerAutoScroll()
  try {
    const currency = currentRequestCurrency.value
    const res = await Api.home.getRecentBigWins(
      {
        currency,
        type: 2
      },
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    const rawResult = res?.result
    const recordList = Array.isArray(rawResult) ? rawResult : []
    highRollerSourceRows.value = recordList.map((item, index) =>
      mapHighRollerToRow((item as Record<string, unknown>) ?? {}, index)
    )
  } catch (error) {
    console.error('fetchHighRollerRecords failed', error)
    highRollerSourceRows.value = []
    highRollerRows.value = []
  }
}

let highRollerAutoScrollTimer: number | null = null
let highRollerNextScrollIndex = 0
let betAutoScrollTimer: number | null = null
let betNextScrollIndex = 0

const stopHighRollerAutoScroll = () => {
  if (highRollerAutoScrollTimer != null) {
    window.clearTimeout(highRollerAutoScrollTimer)
    highRollerAutoScrollTimer = null
  }
}

const stopBetAutoScroll = () => {
  if (betAutoScrollTimer != null) {
    window.clearTimeout(betAutoScrollTimer)
    betAutoScrollTimer = null
  }
}

const scheduleNextHighRollerScroll = () => {
  highRollerAutoScrollTimer = window.setTimeout(() => {
    const list = highRollerSourceRows.value
    const nextRow = list[highRollerNextScrollIndex]
    if (!nextRow || list.length === 0) {
      return
    }

    highRollerRows.value = [nextRow, ...highRollerRows.value.slice(0, MAX_VISIBLE_ROWS - 1)]
    highRollerNextScrollIndex = (highRollerNextScrollIndex + 1) % list.length
    scheduleNextHighRollerScroll()
  }, SCROLL_INTERVAL_MS)
}

const startHighRollerAutoScroll = () => {
  stopHighRollerAutoScroll()
  const list = highRollerSourceRows.value
  if (list.length === 0) {
    highRollerRows.value = []
    return
  }

  if (list.length <= MAX_VISIBLE_ROWS) {
    highRollerRows.value = [...list]
    return
  }

  highRollerRows.value = list.slice(0, MAX_VISIBLE_ROWS)
  highRollerNextScrollIndex = MAX_VISIBLE_ROWS % list.length
  scheduleNextHighRollerScroll()
}

const scheduleNextBetScroll = () => {
  betAutoScrollTimer = window.setTimeout(() => {
    const list = betSourceRows.value
    const nextRow = list[betNextScrollIndex]
    if (!nextRow || list.length === 0) {
      return
    }

    rows.value = [nextRow, ...rows.value.slice(0, MAX_VISIBLE_ROWS - 1)]
    betNextScrollIndex = (betNextScrollIndex + 1) % list.length
    scheduleNextBetScroll()
  }, SCROLL_INTERVAL_MS)
}

const startBetAutoScroll = () => {
  stopBetAutoScroll()
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
  isLoading.value = true
  try {
    if (activeTab.value === 2) {
      stopBetAutoScroll()
      betSourceRows.value = []
      rows.value = []
      await fetchHighRollerRecords()
      return
    }

    stopHighRollerAutoScroll()
    highRollerSourceRows.value = []
    highRollerRows.value = []
    await fetchBetRecords()
  } finally {
    isLoading.value = false
  }
}

watch(
  [activeTab, currentPlatformCode, currentGameCode, currentRequestCurrency],
  () => {
    void fetchTableData()
  },
  { immediate: true }
)

watch(
  betSourceRows,
  () => {
    if (activeTab.value === 2) {
      stopBetAutoScroll()
      return
    }

    startBetAutoScroll()
  },
  { deep: true }
)

watch(
  highRollerSourceRows,
  () => {
    if (activeTab.value !== 2) {
      stopHighRollerAutoScroll()
      return
    }

    startHighRollerAutoScroll()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  stopBetAutoScroll()
  stopHighRollerAutoScroll()
})
</script>

<style scoped>
.latest-wrap {
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
}

.bet-tabs {
  background: var(--color-background-level-8);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.bet-tab {
  min-height: 34px;
  padding: 6px 28px;
  background: transparent;
  color: var(--color-text-level-2);
  border: 1px solid transparent;
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
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%),
    var(--color-background-level-7);
  border-color: var(--color-opacity-10);
  color: var(--color-text-level-1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.2);
}

:global(:root.light) .bet-tabs {
  border-radius: 10px;
  background: #e3e3e3;
  border: none;
}

:global(:root.light) .bet-tab {
  border-radius: 8px;
  color: #5f6368;
}

:global(:root.light) .bet-tab.active {
  background: #ffffff;
  border: 1px solid rgba(17, 17, 17, 0.08);
  box-shadow: none;
  color: #111111;
}

.table-wrap {
  margin-top: 12px;
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
  font-weight: 700;
  white-space: nowrap;
}

.table-row {
  padding: 0;
}

.table tbody tr td {
  vertical-align: middle;
  box-sizing: border-box;
}

.cell {
  gap: 8px;
  overflow: hidden;
  height: 48px;
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
    padding: 3px;
    gap: 3px;
  }

  .bet-tab {
    flex: 1;
    min-height: 32px;
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

  .table tbody tr td {
    padding: 9px 6px !important;
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
  }

  .bet-tab {
    flex: 1;
    min-height: 31px;
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

  .table tbody tr td {
    padding: 10px 6px !important;
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
    height: 40px;
  }
}
</style>
