<template>
  <div class="mt-[12px]">
    <!-- Header -->
    <div class="grid lg:grid-cols-2 grid-cols-1 gap-4">
      <h2>Latest Bet</h2>
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
        <TransitionGroup tag="tbody" name="live">
          <tr
            v-for="(item, index) in rows"
            :key="item.id"
            :class="[index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2']"
          >
            <td class="py-2 px-3 flex items-center gap-1">
              <span class="text-text-1 truncate">
                {{ item.game }}
              </span>
            </td>
            <td class="py-2 px-3 text-text-1 truncate">
              {{ item.player }}
            </td>
            <td class="cell" role="cell">
              <div class="flex items-center justify-center">
                <span>{{ item.BetAmount }}</span>
                <img src="@/static/img/flag/USD.webp" class="icon" alt="" />
              </div>
            </td>
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
import { ref, onMounted } from 'vue'
// import { useI18n } from 'vue-i18n'
// const { t } = useI18n()

const tabs = ['All Bets', 'My Bets', 'High Roller']
const activeTab = ref('All Bets')
interface IRow {
  id: number
  game: string
  player: string
  BetAmount: number
  multiplier: number
  profit: number
}

const rows = ref<IRow[]>([])
let uid = 0

const randomRow = (): IRow => {
  const profit = Math.floor(Math.random() * 5000) - 2500
  return {
    id: uid++,
    game: 'Wild Strory',
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
  for (let i = 0; i < 10; i++) {
    pushRow()
  }
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
