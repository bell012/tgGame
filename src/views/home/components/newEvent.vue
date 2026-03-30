<template>
  <div class="latest-wrap max-w-[1248px] mx-auto sm:px-4 sm:py-4">
    <!-- Header -->
    <div class="header">
      <h2>{{ $t('home1.LatestRound&Race') }}</h2>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="table [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4" role="table">
        <thead class="table-head pc-only" role="rowgroup">
          <tr role="row" class="bg-bg-2 text-text-2">
            <th>{{ $t('home1.Game') }}</th>
            <th class="sm:w-auto" role="columnheader">{{ $t('home1.Player') }}</th>
            <th class="h5-hide" role="columnheader">{{ $t('home1.BetAmount') }}</th>
            <th>{{ $t('home1.Multiplier') }}</th>
            <th class="text-right">{{ $t('home1.Profit') }}</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in rows"
            :key="item.id"
            :class="['table-row-fixed', index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
          >
            <td class="table-cell-fixed">
              <div class="flex items-center gap-1">
                <img :src="item.gameIcon" class="w-3.5 h-3.5 flex-shrink-0" :alt="item.game" />
                <span class="text-text-1 truncate max-w-[58px] sm:max-w-[100%]">
                  {{ item.game }}
                </span>
              </div>
            </td>
            <td class="table-cell-fixed text-text-1 truncate max-w-[60px]">
              {{ item.player }}
            </td>
            <td class="table-cell-fixed h5-hide" role="cell">
              <div class="flex items-center justify-center">
                <span>{{ item.BetAmount }}</span>
                <img src="@/static/img/flag/USD.webp" class="icon" alt="" />
              </div>
            </td>
            <td class="table-cell-fixed text-center text-[12px]">x{{ item.multiplier }}</td>
            <td class="table-cell-fixed">
              <div class="flex items-center justify-end gap-1 text-[12px]">
                <span :class="item.profit >= 0 ? 'text-[var(--color-secondary-level-4)]' : ''">
                  {{ item.profit >= 0 ? '+' : '' }}{{ item.profit }}
                </span>
                <img
                  src="@/static/img/flag/USD.webp"
                  class="w-3 h-3 flex-shrink-0"
                  :alt="item.game"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BlackJack from './img/BlackJack.svg?url'
const { t } = useI18n()
const tabs = [t('home1.LatestBet'), t('home1.HighRoller')]
const activeTab = ref(t('home1.LatestBet'))
interface LiveRow {
  id: number
  game: string
  gameIcon: string
  player: string
  BetAmount: number
  multiplier: number
  profit: number
}

const rows = ref<LiveRow[]>([])
let timer: number | null = null
let uid = 0

const randomRow = (): LiveRow => {
  const profit = Math.floor(Math.random() * 5000) - 2500
  return {
    id: uid++,
    game: 'Wild Strory',
    gameIcon: BlackJack,
    player: 'Tujaodrayy',
    BetAmount: 399.99,
    multiplier: Number((Math.random() * 20 + 1).toFixed(2)),
    profit: profit
  }
}

const pushRow = () => {
  rows.value.unshift(randomRow())
  if (rows.value.length > 10) {
    rows.value.pop()
  }
}

onMounted(() => {
  for (let i = 0; i < 6; i++) {
    pushRow()
  }

  timer = window.setInterval(pushRow, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
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
  /* background: var(--color-background-level-8); */
  /* color: var(--color-text-level-2); */
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

/* .table tbody tr:nth-child(odd) {
  background: var(--color-background-level-3);
  color: var(--color-text-level-1);
}
.table tbody tr:nth-child(even) {
  background: var(--color-background-level-2);
  color: var(--color-text-level-1);
} */
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
