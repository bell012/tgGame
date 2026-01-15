<template>
  <div class="w-full overflow-hidden rounded-xl bg-[var(--color-background-level-2)]">
    <table class="w-full text-sm text-text-2 text-[14px]">
      <thead class="bg-[var(--color-opacity-6)] text-[12px]">
        <tr>
          <td class="py-[10px] px-3">游戏</td>
          <td class="py-[10px] px-3">玩家</td>
          <td class="py-[10px] px-3 text-center">倍数</td>
          <td class="py-[10px] px-3 text-right">盈余</td>
        </tr>
      </thead>
      <TransitionGroup tag="tbody" name="live">
        <tr
          v-for="(item, index) in rows"
          :key="item.id"
          :class="[
            index % 2 === 0 ? 'bg-[var(--color-opacity-10)]' : 'bg-[var(--color-opacity-6)]'
          ]"
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import pokerIcon from '@/static/img/test/poker_icon.png'

interface LiveRow {
  id: number
  game: string
  gameIcon: string
  player: string
  multiplier: number
  profit: number
}

const rows = ref<LiveRow[]>([])
let timer: number | null = null
let uid = 0

const games = [
  { name: 'Crash', icon: pokerIcon },
  { name: 'Mines', icon: pokerIcon },
  { name: 'Slots', icon: pokerIcon }
]

function randomRow(): LiveRow {
  const game = games[Math.floor(Math.random() * games.length)]
  const profit = Math.floor(Math.random() * 5000) - 2500

  return {
    id: uid++,
    game: game.name,
    gameIcon: game.icon,
    player: `Player_${Math.floor(Math.random() * 1000)}`,
    multiplier: Number((Math.random() * 20 + 1).toFixed(2)),
    profit: profit
  }
}

function pushRow() {
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
.live-enter-active,
.live-leave-active {
  transition: all 0.15s ease;
}

.live-enter-from {
  opacity: 0;
  transform: translateY(-1px);
}

.live-leave-to {
  opacity: 0;
  transform: translateY(1px);
}
</style>
