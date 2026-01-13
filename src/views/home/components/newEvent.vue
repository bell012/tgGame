<template>
  <div class="latest-wrap">
    <!-- Header -->
    <div class="header">
      <h2>最新回合及赛事</h2>

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
          <tr role="row">
            <th role="columnheader">游戏</th>
            <th class="sm:w-auto" role="columnheader">玩家</th>
            <th class="h5-hide" role="columnheader">投注金额</th>
            <th role="columnheader">倍率</th>
            <th role="columnheader" class="right">盈余</th>
          </tr>
        </thead>

        <tbody role="rowgroup">
          <tr v-for="(item, index) in list" :key="index" class="table-row" role="row">
            <td class="w-[30%] sm:w-auto" role="cell">
              <div class="flex items-center justify-start">
                <img class="icon" alt="game" :src="BlackJack" />
                <span class="ellipsis">Lucky Jaguar</span>
              </div>
            </td>

            <td class="w-24 sm:w-auto" role="cell">
              <div class="ellipsis">Player Name</div>
            </td>

            <td class="cell h5-hide" role="cell">
              <div class="flex items-center justify-center">
                <span>{{ item.bet }}</span>
                <img :src="USDT" class="icon" alt="" />
              </div>
            </td>

            <td class="cell sm:w-auto" role="cell">
              <div>0.00x</div>
            </td>

            <td class="w-30 text-secondary" role="cell">
              <div class="flex items-center justify-end">
                <span class="text-nowrap">- {{ item.bet }}</span>
                <img :src="USDT" class="icon" alt="" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import BlackJack from './img/BlackJack.svg?url'
import USDT from '@/static/svg/coin/USDT.black.svg?url'
const tabs = ['最新投注', '龙虎榜', '下注比赛']
const activeTab = ref('最新投注')

const list = ref(
  Array.from({ length: 6 }).map(() => ({
    bet: '399.99'
  }))
)
</script>

<style scoped>
.latest-wrap {
  padding: 12px;
  border-radius: 12px;
  color: #e5e7eb;
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
  background: #2a2f2f;
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
  background: #3a3f3f;
  color: #fff;
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
.table td:last-child,
.table th:last-child {
  text-align: right;
}
.table-head th {
  padding: 10px 14px;
  background: #353a3a;
  color: #cbd5e1;
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

.table tbody tr:nth-child(odd) {
  background: var(--color-background-level-3);
  color: var(--color-text-level-1);
}
.table tbody tr:nth-child(even) {
  background: var(--color-background-level-2);
  color: var(--color-text-level-1);
}
.cell {
  gap: 8px;
  overflow: hidden;
  height: 48px;
}

.icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  display: inline;
  margin: 0 4px;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 767px) {
  .latest-wrap {
    padding: 0;
  }
  .h5-hide {
    display: none;
  }
}
</style>
