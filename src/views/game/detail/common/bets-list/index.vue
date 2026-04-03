<template>
  <div class="mt-[12px]">
    <!-- Header -->
    <div class="grid lg:grid-cols-2 grid-cols-1 gap-4">
      <h2 class="flex items-center">Latest Bet</h2>
      <div class="flex lg:justify-end items-center sm:justify-start justify-start">
        <div class="bet-tabs flex items-center">
          <button
            v-for="(tab, index) in tabs"
            :key="tab"
            :class="['bet-tab', { active: activeTab === index }]"
            @click="activeTab = index"
          >
            {{ tab }}
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
            <th>Player</th>
            <th>Profit</th>
            <th class="sm:w-auto">Bet</th>
            <th class="text-right">Multiplier</th>
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
                {{ item.player }}
              </span>
            </td>
            <td class="py-2 px-3 text-text-1 truncate">{{ item.profit }}x</td>
            <td class="cell" role="cell">
              <div class="flex items-center justify-center">
                <img
                  :src="currentCurrencyIcon"
                  class="icon object-contain"
                  :alt="currentRequestCurrency"
                />
                <span>{{ item.bet }}</span>
              </div>
            </td>
            <td class="py-2 px-3 flex items-center justify-end gap-1 text-[12px]">
              <img
                :src="currentCurrencyIcon"
                class="w-3 h-3 object-contain"
                :alt="currentRequestCurrency"
              />
              <span
                :class="
                  item.multiplierNumber >= 0
                    ? 'text-[var(--color-secondary-level-4)]'
                    : 'text-[#ff4d4f]'
                "
              >
                {{ item.multiplierNumber >= 0 ? '+' : '' }}{{ item.multiplier }}
              </span>
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

      <table
        v-else
        class="table high-roller-table [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4"
        role="table"
        style="overflow-anchor: none"
      >
        <thead class="table-head pc-only" role="rowgroup">
          <tr role="row" class="bg-bg-2 text-text-2">
            <th>Game</th>
            <th>Player</th>
            <th>Multiplier</th>
            <th class="text-right">Profit</th>
          </tr>
        </thead>
        <tbody v-if="highRollerRows.length">
          <tr
            v-for="(item, index) in highRollerRows"
            :key="item.id"
            :class="[index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
          >
            <td class="py-2 px-3">
              <div class="flex items-center gap-1 min-w-0">
                <img :src="item.gameIcon" class="w-3.5 h-3.5 object-contain" :alt="item.game" />
                <span class="text-text-1 truncate">{{ item.game }}</span>
              </div>
            </td>
            <td class="py-2 px-3 text-text-1 truncate">
              {{ item.player }}
            </td>
            <td class="py-2 px-3 text-text-1 truncate">{{ item.multiplier }}x</td>
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
import placeholderImg from '@/static/img/home/errImg.png'
import { getCurrencyIconByCode } from '../currency-select-options'
import { storeToRefs } from 'pinia'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'

const tabs = ['All Bets', 'My Bets', 'High Roller'] as const
const activeTab = ref(0)

type CurrentGameDetail = {
  itemCode?: string | number
  platformCode?: string
} | null

interface IRow {
  id: string
  player: string
  profit: string
  bet: string
  multiplier: string
  multiplierNumber: number
}

interface IHighRollerRow {
  id: string
  game: string
  gameIcon: string
  player: string
  multiplier: string
  profit: string
  profitNumber: number
}

const rows = ref<IRow[]>([])
const highRollerRows = ref<IHighRollerRow[]>([])
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

const currentBetType = computed<1 | 2>(() => (activeTab.value === 1 ? 2 : 1))
const gameImageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')

const parseAmount = (value: unknown) => {
  const parsed = Number(normalizeValue(value))
  return Number.isFinite(parsed) ? parsed : 0
}

const formatAmount = (value: unknown) => {
  const parsed = Number(normalizeValue(value))
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00'
}

const mapRecordToRow = (item: GameBetRecordItem, index: number): IRow => {
  const player =
    normalizeValue(item.memberName ?? item.memberId ?? item.userName ?? item.betId) || '-'
  const profitRate = parseAmount(item.multiple ?? item.mult ?? item.multiplier)
  const multiplierNumber = parseAmount(item.profit ?? item.winAmount)
  return {
    id: normalizeValue(item.betId) || `${player}-${index}`,
    player,
    profit: formatAmount(profitRate),
    bet: formatAmount(item.bet ?? item.wager),
    multiplier: formatAmount(item.profit ?? item.winAmount),
    multiplierNumber
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
  const game = normalizeValue(item.gameName) || '--'
  const profitNumber = parseAmount(item.winAmount)
  return {
    id: normalizeValue(item.rowId) || `${game}-${index}`,
    game,
    gameIcon: toGameImageUrl(item.coverImg),
    player: normalizeValue(item.nickName) || '--',
    multiplier: formatAmount(item.multiple),
    profit: formatAmount(item.winAmount),
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
  }
}

const fetchHighRollerRecords = async () => {
  try {
    const currency = currentRequestCurrency.value
    const res = await Api.home.getRecentBigWins({
      currency,
      curency: currency,
      type: 2
    })
    const rawResult = res?.result
    const recordList = Array.isArray(rawResult) ? rawResult : []
    highRollerRows.value = recordList.map((item, index) =>
      mapHighRollerToRow((item as Record<string, unknown>) ?? {}, index)
    )
  } catch (error) {
    console.error('fetchHighRollerRecords failed', error)
    highRollerRows.value = []
  }
}

const fetchTableData = async () => {
  isLoading.value = true
  try {
    if (activeTab.value === 2) {
      rows.value = []
      await fetchHighRollerRecords()
      return
    }

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
.high-roller-table td:nth-child(3),
.high-roller-table th:nth-child(3) {
  text-align: center;
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
