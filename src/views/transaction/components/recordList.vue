<template>
  <div v-if="localBets.length === 0" class="pb-6">
    <NoData />
  </div>

  <div v-else class="flex flex-col gap-2 px-0.5 pb-6 mt-3.5">
    <div
      v-for="bet in localBets"
      :key="bet.id"
      class="bg-bg-2 rounded-lg py-2.5 cursor-pointer"
      @click="emitSelect(bet)"
    >
      <div class="px-3.5">
        <div class="flex items-center justify-between mb-2.5">
          <div class="flex items-center min-w-0">
            <div
              class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-bg-4 flex items-center justify-center mr-2.5"
            >
              <img :src="bet.gameIcon" alt="" class="w-5 h-5 object-contain" />
            </div>

            <h3
              class="text-text-1 font-[700] text-sm overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {{ bet.gameName }}
            </h3>
          </div>

          <!-- 颜色：win绿色，loss红色 -->
          <span> {{ bet.result === 'win' ? '+' : '-' }}{{ bet.resultAmount }} </span>
        </div>
      </div>

      <div
        class="w-full"
        style="border-bottom: 1px solid var(--color-opacity-6, rgba(255, 255, 255, 0.06))"
      />

      <div class="px-3.5">
        <div class="flex items-center justify-between mt-2.5">
          <p class="text-text-2 text-xs truncate">
            {{ bet.time }}
          </p>

          <div
            class="size-[24px] bg-opacity-10 rounded-md flex items-center justify-center cursor-pointer"
            @click.stop="emitSelect(bet)"
          >
            <Arrow_right class="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Arrow_right from '@/static/svg/arrow_right.svg?component'
import NoData from './noData.vue'

export interface BetItem {
  id: number
  gameName: string
  gameIcon: string
  betAmount: string
  result: 'win' | 'loss'
  resultAmount: string
  time: string
}

const props = defineProps<{
  bets: BetItem[]
}>()

const emit = defineEmits<{
  (e: 'select', bet: BetItem): void
}>()

const emitSelect = (bet: BetItem) => {
  emit('select', bet)
}

const localBets = computed(() => props.bets || [])
</script>
