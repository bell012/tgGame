<template>
  <div class="latest-wrap max-w-[1248px] mx-auto sm:px-4 sm:py-4">
    <!-- Header -->
    <div class="header">
      <h2>{{ $t('home.LatestRound&Race') }}</h2>

      <div class="tabs">
        <button
          v-for="tab in tabItems"
          :key="tab.type"
          type="button"
          :class="['tab', { active: activeType === tab.type }]"
          @click="activeType = tab.type"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="table [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4" role="table">
        <thead class="table-head pc-only" role="rowgroup">
          <tr role="row" class="bg-bg-2 text-text-2">
            <td class="w-[36%] px-3 py-[10px]">{{ $t('home.Game') }}</td>
            <td class="w-[26%] px-3 py-[10px]">{{ $t('home.Player') }}</td>
            <td class="w-[16%] px-3 py-[10px] text-center">{{ $t('home.Multiplier') }}</td>
            <td class="w-[22%] px-3 py-[10px] text-right">{{ $t('home.Profit') }}</td>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr
            v-for="index in 10"
            :key="`sk-${index}`"
            :class="['table-row-fixed', index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
          >
            <td colspan="5" class="table-cell-fixed px-3 py-2">
              <div class="h-6 animate-pulse rounded bg-bg-2" />
            </td>
          </tr>
        </tbody>
        <tbody v-else class="tbody-scroll">
          <tr
            v-for="(item, index) in displayRows"
            :key="`${item.id}-${index}`"
            :class="[
              'table-row-fixed',
              index === 0 ? 'table-row-enter' : '',
              index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2'
            ]"
          >
            <td class="px-3 py-2">
              <div
                :key="item.id"
                class="flex min-w-0 items-center gap-1 cursor-pointer"
                @click="handleGameClick()"
              >
                <img :src="item.gameIcon" class="w-3.5 h-3.5" :alt="item.game" />
                <span class="min-w-0 truncate text-text-1">
                  {{ item.game }}
                </span>
              </div>
            </td>
            <td class="px-3 py-2" @click="handlePlayerClick()">
              <span class="block truncate text-text-1">
                {{ item.player }}
              </span>
            </td>
            <td class="py-2 px-3 text-center text-[12px]">x{{ item.multiplier }}</td>
            <td class="px-3 py-2 text-[12px]">
              <div class="flex items-center justify-end gap-1">
                <span :class="item.profit >= 0 ? 'text-[var(--color-secondary-level-4)]' : ''">
                  {{ item.profit >= 0 ? '+' : '' }}{{ item.profit }}
                </span>
                <img :src="currencyIcon" class="w-3 h-3" :alt="item.game" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCurrentCurrency } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import Api from '@/api'
import placeholderImg from '@/static/img/home/errImg.png'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'

const { t } = useI18n()
const currentCurrency = computed(() => getCurrentCurrency())
const currencyIcon = computed(() => getCurrencyIconByCode(currentCurrency.value))

const tabItems = computed(() => [
  { type: 1 as const, label: t('home.LatestBet') },
  { type: 2 as const, label: t('home.HighRoller') }
])
const activeType = ref<1 | 2>(1)

interface LiveRow {
  id: number
  game: string
  gameIcon: string
  player: string
  betAmount: number
  multiplier: number
  profit: number
}

const MAX_VISIBLE_ROWS = 10
/** 列表轮播间隔 */
const SCROLL_INTERVAL_MS = 1000
const RECENT_BIG_WINS_REFRESH_INTERVAL_MS = 10 * 60 * 1000

const sourceRows = ref<LiveRow[]>([])
const displayRows = ref<LiveRow[]>([])
const loading = ref(false)

const handleGameClick = () => {
  navigateTo('/bet-history')
}

const handlePlayerClick = () => {
  navigateTo('/personal-center/my-profile')
}

let autoScrollTimer: number | null = null
let recentBigWinsTimer: number | null = null
let nextScrollIndex = 0

const stopAutoScroll = () => {
  if (autoScrollTimer != null) {
    window.clearTimeout(autoScrollTimer)
    autoScrollTimer = null
  }
}

const stopRecentBigWinsTimer = () => {
  if (recentBigWinsTimer != null) {
    window.clearInterval(recentBigWinsTimer)
    recentBigWinsTimer = null
  }
}

const scheduleNextScroll = () => {
  autoScrollTimer = window.setTimeout(() => {
    const list = sourceRows.value
    const nextRow = list[nextScrollIndex]
    if (!nextRow || list.length === 0) {
      return
    }
    displayRows.value = [nextRow, ...displayRows.value.slice(0, MAX_VISIBLE_ROWS - 1)]
    nextScrollIndex = (nextScrollIndex + 1) % list.length
    scheduleNextScroll()
  }, SCROLL_INTERVAL_MS)
}

const startAutoScroll = () => {
  stopAutoScroll()
  const list = sourceRows.value
  if (list.length === 0) {
    displayRows.value = []
    return
  }
  if (list.length <= MAX_VISIBLE_ROWS) {
    displayRows.value = [...list]
    return
  }
  displayRows.value = list.slice(0, MAX_VISIBLE_ROWS)
  nextScrollIndex = MAX_VISIBLE_ROWS % list.length
  scheduleNextScroll()
}

const parseAmount = (value: unknown) => {
  const n = Number(String(value ?? '').trim())
  return Number.isFinite(n) ? n : 0
}

const toGameImageUrl = (value?: string) => {
  const path = String(value ?? '').trim()
  if (!path) return ''
  if (/^(data:|blob:|https?:\/\/|\/)/i.test(path)) return path
  const base = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')
  return base ? `${base}${path}` : path
}

const getRecentBigWinsData = async () => {
  stopAutoScroll()
  loading.value = true
  try {
    const res = await Api.home.getLatestList(
      {
        type: activeType.value
      }
    )
    const list = Array.isArray(res?.result) ? res.result : []
    console.log(res, '------')
    sourceRows.value = list.map((item: Record<string, unknown>, index: number) => {
      const icon = toGameImageUrl(String(item.coverImg ?? ''))
      return {
        id: Number(item.rowId ?? index),
        game: String(item.gameName ?? '--'),
        gameIcon: icon || placeholderImg,
        player: String(item.nickName ?? '--'),
        betAmount: parseAmount(item.bet ?? item.wager ?? item.betAmount),
        multiplier: parseAmount(item.multiple),
        profit: parseAmount(item.winAmount)
      }
    })
  } catch (error) {
    sourceRows.value = []
    console.error('getRecentBigWins failed', error)
  } finally {
    loading.value = false
  }
}

watch(
  [() => activeType.value, () => currentCurrency.value],
  () => {
    void getRecentBigWinsData()
  },
  { immediate: true }
)

watch(
  sourceRows,
  () => {
    startAutoScroll()
  },
  { deep: true }
)

onMounted(() => {
  stopRecentBigWinsTimer()
  recentBigWinsTimer = window.setInterval(() => {
    void getRecentBigWinsData()
  }, RECENT_BIG_WINS_REFRESH_INTERVAL_MS)
})

onUnmounted(() => {
  stopAutoScroll()
  stopRecentBigWinsTimer()
})
</script>

<style scoped>
.latest-wrap {
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header h2 {
  font-size: 16px;
  font-weight: 600;
}

.tabs {
  display: flex;
  background: var(--color-background-level-8);
  border-radius: 8px;
  overflow: hidden;
}

.tab {
  padding: 6px 12px;
  background: transparent;
  color: #9ca3af;
  border: none;
  width: 132px;
}

.tab.active {
  background: var(--color-background-level-7);
  color: var(--color-text-level-1);
}

.table-wrap {
  margin-top: 12px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 10px;
  contain: layout paint;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: center;
  will-change: transform;
  transform: translateZ(0);
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

.table-row-fixed {
  height: 48px;
  padding: 0;
  overflow: hidden;
}

.table-cell-fixed {
  height: 48px;
  vertical-align: middle;
  box-sizing: border-box;
  overflow: hidden;
}

.table tbody tr td {
  vertical-align: middle;
  box-sizing: border-box;
}

/* 顶部轮播插入新行时的轻微过渡
.tbody-scroll .table-row-enter {
  animation: newEvent-row-in 0.45s ease-out;
} */

@keyframes newEvent-row-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@media (max-width: 767px) {
  .latest-wrap {
    padding: 0;
  }
  .h5-hide {
    display: none;
  }
  .tabs .tab {
    width: 520px;
  }
}
</style>
