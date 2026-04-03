<template>
  <div class="mt-[12px]">
    <!-- Header -->
    <div class="grid lg:grid-cols-2 grid-cols-1 gap-4">
      <h2 class="flex items-center">Latest Bet</h2>
      <div class="flex lg:justify-end items-center sm:justify-start justify-start">
        <div class="bet-tabs flex items-center">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="['bet-tab', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>
    </div>
    <!-- Table -->
    <div class="table-wrap">
      <table
        class="table [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4"
        role="table"
        style="overflow-anchor: none"
      >
        <thead class="table-head pc-only" role="rowgroup">
          <tr role="row" class="bg-bg-2 text-text-2">
            <th>Bet ID</th>
            <th class="sm:w-auto">Bet</th>
            <th>Payout</th>
            <th class="text-right">Profit</th>
          </tr>
        </thead>
        <tbody v-if="rows.length">
          <tr
            v-for="(item, index) in rows"
            :key="item.id"
            :class="[index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
          >
            <td class="py-2 px-3 flex items-center gap-1">
              <span class="text-text-1 truncate">
                {{ item.betId }}
              </span>
            </td>
            <td class="cell" role="cell">
              <div class="flex items-center justify-center">
                <span>{{ item.bet }}</span>
                <img
                  :src="currentCurrencyIcon"
                  class="icon object-contain"
                  :alt="currentRequestCurrency"
                />
              </div>
            </td>
            <td class="py-2 px-3 text-text-1 truncate">
              {{ item.payout }}
            </td>
            <td class="py-2 px-3 flex items-center justify-end gap-1 text-[12px]">
              <span :class="item.profitNumber >= 0 ? 'text-[var(--color-secondary-level-4)]' : ''">
                {{ item.profitNumber >= 0 ? '+' : '' }}{{ item.profit }}
              </span>
              <img
                :src="currentCurrencyIcon"
                class="w-3 h-3 object-contain"
                :alt="currentRequestCurrency"
              />
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr class="bg-bg-2">
            <td colspan="4" class="py-6 text-center text-[12px] text-[var(--color-text-level-2)]">
              {{ isLoading ? 'Loading...' : 'No data' }}
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
import { getCurrencyIconByCode } from '../currency-select-options'
import { storeToRefs } from 'pinia'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
// import { useI18n } from 'vue-i18n'
// const { t } = useI18n()

const tabs = ['All Bets', 'My Bets', 'High Roller'] as const
const activeTab = ref('All Bets')

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
const isLoading = ref(false)

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

const currentBetType = computed<1 | 2>(() => (activeTab.value === 'My Bets' ? 2 : 1))

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
  const profitNumber = parseAmount(item.profit)
  return {
    id: `${betId}-${index}`,
    betId,
    bet: formatAmount(item.bet),
    payout: formatAmount(item.payout),
    profit: formatAmount(item.profit),
    profitNumber
  }
}

const fetchBetRecords = async () => {
  const platformCode = currentPlatformCode.value
  const gameCode = currentGameCode.value
  if (!platformCode || !gameCode) {
    rows.value = []
    return
  }

  isLoading.value = true
  try {
    const res = await Api.game.getGameBetRecordList({
      page: {
        current: 1,
        size: 100
      },
      platformCode,
      gameCode,
      currency: currentRequestCurrency.value,
      betType: currentBetType.value
    })
    const rawResult = res?.result
    const records = (rawResult as { records?: unknown } | undefined)?.records
    const recordList = Array.isArray(rawResult)
      ? (rawResult as GameBetRecordItem[])
      : Array.isArray(records)
        ? (records as GameBetRecordItem[])
        : []

    rows.value = recordList.map((item, index) => mapRecordToRow(item, index))
  } catch (error) {
    console.error('fetchBetRecords failed', error)
    rows.value = []
  } finally {
    isLoading.value = false
  }
}

watch(
  [activeTab, currentPlatformCode, currentGameCode, currentRequestCurrency],
  () => {
    void fetchBetRecords()
  },
  { immediate: true }
)
</script>

<style scoped>
.latest-wrap {
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
}

.bet-tabs {
  background: var(--color-background-level-8);
  border-radius: 8px;
  overflow: hidden;
}

.bet-tab {
  padding: 6px 28px;
  background: transparent;
  color: #9ca3af;
  border: none;
}

.bet-tab.active {
  background: var(--color-background-level-7);
  color: var(--color-text-level-1);
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
.table-head th {
  padding: 10px 14px;
  font-weight: 600;
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
</style>
