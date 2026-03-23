<template>
  <div class="bg-bg-1">
    <H5Header :title="$t('locales.betHistory.title')" :show-sort="true" @sort="handleSort" />

    <div class="py-3.5">
      <!-- 无数据状态 -->
      <div v-if="!hasBets" class="flex flex-col items-center justify-center mt-[100px]">
        <img :src="noDataImg" alt="No data" class="h-[200px] w-auto mb-2.5" />
        <p class="text-text-1 text-xs font-[500] mb-5">
          {{ $t('locales.betHistory.noBetHistoryYet') }}
        </p>
        <button
          class="w-[200px] h-[40px] rounded-lg bg-theme-primary text-text-4 font-[700] text-sm flex items-center justify-center"
          @click="handleStartPlaying"
        >
          {{ $t('locales.betHistory.startPlaying') }}
        </button>
      </div>

      <!-- 有数据状态 -->
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="bet in betList"
          :key="bet.id"
          class="bg-bg-2 rounded-lg py-2.5 cursor-pointer"
          @click="handleBetClick(bet)"
        >
          <div class="flex items-center px-3.5">
            <div class="w-[49px] h-[65px] rounded-lg overflow-hidden flex-shrink-0 mr-2.5">
              <img :src="bet.gameIcon" alt="" class="w-full h-full object-cover" />
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="text-text-1 font-[700] text-sm mb-2.5">
                {{ bet.gameName }}
              </h3>
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-1">
                  {{ $t('locales.betHistory.betAmount') }} : {{ bet.betAmount }}
                </span>
                <span
                  :class="[
                    'font-bold',
                    bet.result === 'win'
                      ? 'text-secondary-2'
                      : bet.result === 'loss'
                        ? 'text-secondary-4'
                        : 'text-text-1'
                  ]"
                >
                  {{
                    bet.result === 'win'
                      ? $t('locales.betHistory.win')
                      : $t('locales.betHistory.loss')
                  }}
                  :
                  {{ bet.resultAmount }}
                </span>
              </div>
            </div>
          </div>

          <!-- 线 -->
          <div class="w-full h-[1px] bg-opacity-15 my-2.5"></div>

          <div class="flex items-center justify-between px-3.5">
            <p class="text-text-2 text-xs">
              {{ bet.time }}
            </p>
            <div
              class="size-[20px] bg-opacity-10 rounded-md flex items-center justify-center cursor-pointer"
              @click.stop="handleBetClick(bet)"
            >
              <ArrowRightIcon class="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import H5Header from '@/components/common/H5Header.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import noDataImg from '@/static/img/personalCenter/noData.png'
import bet from '@/static/img/personalCenter/bet.png'

const router = useRouter()

interface BetItem {
  id: number
  gameName: string
  gameIcon: string
  betAmount: string
  result: 'win' | 'loss'
  resultAmount: string
  time: string
}

const hasBets = ref(true)

const betList = ref<BetItem[]>([
  {
    id: 1,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1001',
    result: 'loss',
    resultAmount: '1001',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 2,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1002',
    result: 'win',
    resultAmount: '1002',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 3,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'loss',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 4,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 5,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 6,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 7,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 8,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 9,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 10,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 11,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  },
  {
    id: 12,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    betAmount: '1000',
    result: 'win',
    resultAmount: '1000',
    time: '12/18/2026 11:14:15 AM'
  }
])

const handleStartPlaying = () => {
  router.push('/')
}

const handleBetClick = (bet: BetItem) => {
  router.push({
    path: `/bet-details/${bet.id}`,
    state: { betData: JSON.stringify(bet) }
  })
}

const handleSort = () => {
  console.log('Sort clicked')
}
</script>

<style scoped lang="scss"></style>
