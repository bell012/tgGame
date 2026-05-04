<template>
  <div class="fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1">
    <H5Header
      :title="$t('betDetails.title')"
      :show-sort="true"
      :right-icon="KefuIcon"
      @sort="openKefuPopup"
    />

    <div class="bet-details-scroll-root flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <div class="py-3.5 px-3.5">
        <div class="bg-bg-2 rounded-lg px-3.5 pb-3.5 pt-[30px] flex flex-col items-center">
          <div class="w-[49px] h-[65px] rounded-lg overflow-hidden mb-2">
            <img :src="betDetail.gameIcon" alt="" class="w-full h-full object-cover" />
          </div>

          <p class="text-text-1 text-lg font-[700] mb-2">{{ betDetail.gameType }}</p>

          <h2 class="text-text-1 text-sm font-[700] mb-[30px]">{{ betDetail.gameName }}</h2>

          <!-- Win/Loss 状态 -->
          <div class="w-full flex items-center justify-between mb-2.5 bg-bg-4 rounded-lg p-3.5">
            <span
              :class="[
                'text-sm',
                betDetail.result === 'win' ? 'text-secondary-2' : 'text-secondary-4'
              ]"
            >
              {{ betDetail.result === 'win' ? $t('betHistory.win') : $t('betHistory.loss') }}
            </span>
            <span
              :class="[
                'text-base font-[700]',
                betDetail.result === 'win' ? 'text-secondary-2' : 'text-secondary-4'
              ]"
            >
              {{ betDetail.result === 'win' ? '+' : '-' }}{{ betDetail.resultAmount }}
            </span>
          </div>

          <!-- 详细信息列表 -->
          <div class="w-full space-y-5 bg-bg-4 rounded-lg p-3.5">
            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('betDetails.currency') }}</span>
              <span class="text-text-1 text-sm">{{ betDetail.currency }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('betHistory.betAmount') }}</span>
              <span class="text-text-1 text-sm">{{ betDetail.betAmount }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('betDetails.winLoss') }}</span>
              <span class="text-text-1 text-sm">
                {{ betDetail.result === 'win' ? '+' : '-' }}{{ betDetail.resultAmount }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('betDetails.orderNo') }}</span>
              <div class="flex items-center gap-1 max-w-[75%]">
                <span class="text-text-1 text-sm truncate">{{ betDetail.orderNo }}</span>
                <button class="p-1" @click="copyOrderNo">
                  <CopyIcon class="w-4 h-4 text-text-2" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('betDetails.createdAt') }}</span>
              <span class="text-text-1 text-sm">{{ betDetail.createdAt }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import H5Header from '@/components/common/H5Header.vue'
import CopyIcon from '@/static/svg/copy.svg?component'
import bet from '@/static/img/personalCenter/bet.png'
import { globalShowToast } from '@/utils/toast'
import { useI18n } from 'vue-i18n'
import KefuIcon from '@/static/svg/vip/kefu.svg?component'

const { t } = useI18n()
const router = useRouter()

interface Item {
  id: number
  gameType?: string
  gameName: string
  gameIcon: string
  betAmount: string
  result: 'win' | 'loss'
  resultAmount: string
  currency?: string
  orderNo?: string
  createdAt?: string
  time: string
}

interface BetDetail {
  id: number
  gameType: string
  gameName: string
  gameIcon: string
  result: 'win' | 'loss'
  resultAmount: string
  currency: string
  betAmount: string
  orderNo: string
  createdAt: string
}

const betDetail = ref<BetDetail>({
  id: 0,
  gameType: '',
  gameName: '',
  gameIcon: bet,
  result: 'win',
  resultAmount: '0',
  currency: 'PHP',
  betAmount: '0',
  orderNo: '',
  createdAt: ''
})

onMounted(() => {
  const state = history.state as { betData?: string; data?: string }
  const currentData = state?.data ?? state?.betData

  if (currentData) {
    try {
      const betItem: Item = JSON.parse(currentData)
      betDetail.value = {
        id: betItem.id,
        gameType: betItem.gameType || '',
        gameName: betItem.gameName,
        gameIcon: betItem.gameIcon,
        result: betItem.result,
        resultAmount: betItem.resultAmount,
        currency: betItem.currency || '',
        betAmount: betItem.betAmount,
        orderNo: betItem.orderNo || `ts${betItem.id}${Date.now()}`,
        createdAt: betItem.createdAt || betItem.time
      }
    } catch (error) {
      console.error(error)
      router.back()
    }
  } else {
    router.back()
  }
})

const copyOrderNo = () => {
  navigator.clipboard.writeText(betDetail.value.orderNo)
  globalShowToast(t('betDetails.copy'))
}

// 点击客服
const openKefuPopup = () => {
  console.log('点击客服')
}
</script>

<style scoped lang="scss">
.bet-details-scroll-root {
  -webkit-overflow-scrolling: touch;
}
</style>
