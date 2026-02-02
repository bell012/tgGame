<template>
  <div class="latest-wrap max-w-[1248px] mx-auto sm:px-4 sm:py-4">
    <!-- Header -->
    <div class="header">
      <h2>{{ $t('home.LatestRound&Race') }}</h2>

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
      <table
        class="table [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4"
        role="table"
        style="overflow-anchor: none"
      >
        <thead class="table-head pc-only" role="rowgroup">
          <tr role="row" class="bg-bg-2 text-text-2">
            <th>{{ $t('home.Game') }}</th>
            <th class="sm:w-auto" role="columnheader">{{ $t('home.Player') }}</th>
            <th class="h5-hide" role="columnheader">{{ $t('home.BetAmount') }}</th>
            <th>{{ $t('home.Multiplier') }}</th>
            <th class="text-right">{{ $t('home.Profit') }}</th>
          </tr>
        </thead>

        <TransitionGroup tag="tbody" name="live">
          <tr
            v-for="(item, index) in rows"
            :key="item.id"
            :class="[index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
          >
            <td class="py-2 px-3 flex items-center gap-1">
              <img :src="item.gameIcon" class="w-3.5 h-3.5" :alt="item.game" />
              <span class="text-text-1 truncate max-w-[58px]">
                {{ item.game }}
              </span>
            </td>
            <td class="py-2 px-3 text-text-1 truncate max-w-[60px]">
              {{ item.player }}
            </td>
            <td class="cell h5-hide" role="cell">
              <div class="flex items-center justify-center">
                <span>{{ item.BetAmount }}</span>
                <img src="@/static/img/flag/USD.webp" class="icon" alt="" />
              </div>
            </td>
            <td class="py-2 px-3 text-center text-[12px]">x{{ item.multiplier }}</td>
            <td class="py-2 px-3 flex items-center justify-end gap-1 text-[12px]">
              <span :class="item.profit >= 0 ? 'text-[var(--color-secondary-level-4)]' : ''">
                {{ item.profit >= 0 ? '+' : '' }}{{ item.profit }}
              </span>
              <img src="@/static/img/flag/USD.webp" class="w-3 h-3" :alt="item.game" />
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BlackJack from './img/BlackJack.svg?url'
const { t } = useI18n()
const tabs = [t('home.LatestBet'), t('home.HighRoller')]
const activeTab = ref(t('home.LatestBet'))
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
  /* background: var(--color-background-level-8); */
  /* color: var(--color-text-level-2); */
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
