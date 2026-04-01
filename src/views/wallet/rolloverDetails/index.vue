<template>
  <div class="fixed inset-0 bg-bg-1 overflow-y-auto">
    <H5Header :title="$t('personalCenter.transactionDetails')" />

    <div class="py-3.5 px-3.5">
      <div class="bg-bg-2 rounded-lg px-3.5 pb-3.5 pt-[30px] flex flex-col items-center">
        <p class="text-text-1 text-[25px] font-[700] mb-2.5">
          {{ detail.result === 'win' ? '+' : '-' }}{{ detail.betAmount }}
        </p>

        <h2 class="text-text-1 text-sm font-[700] mb-[30px]">{{ detail.gameName }}</h2>

        <!-- 详细信息列表 -->
        <div class="w-full space-y-5 bg-bg-4 rounded-lg p-3.5">
          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('betDetails.currency') }}</span>
            <span class="text-text-1 text-sm">{{ detail.currency }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('betHistory.betAmount') }}</span>
            <span class="text-text-1 text-sm">{{ detail.betAmount }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('betDetails.orderNo') }}</span>
            <div class="flex items-center gap-1">
              <span class="text-text-1 text-sm">{{ detail.orderNo }}</span>
              <button class="p-1 hover:bg-opacity-5 rounded transition-colors" @click="copyOrderNo">
                <CopyIcon class="w-4 h-4 text-text-2" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('betDetails.createdAt') }}</span>
            <span class="text-text-1 text-sm">{{ detail.createdAt }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('personalCenter.remarks') }}</span>
            <span class="text-text-1 text-sm">--</span>
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
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

interface Item {
  id: number
  gameName: string
  gameIcon: string
  betAmount: string
  result: 'win' | 'loss'
  resultAmount: string
  time: string
}

interface Detail {
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

const detail = ref<Detail>({
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
  const state = history.state as { betData?: string }
  if (state?.betData) {
    try {
      const betItem: Item = JSON.parse(state.betData)
      detail.value = {
        id: betItem.id,
        gameType: 'Slot',
        gameName: betItem.gameName,
        gameIcon: betItem.gameIcon,
        result: betItem.result,
        resultAmount: betItem.resultAmount,
        currency: 'PHP',
        betAmount: betItem.betAmount,
        orderNo: `ts${betItem.id}${Date.now()}`,
        createdAt: betItem.time
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
  navigator.clipboard.writeText(detail.value.orderNo)
  showToast({
    message: t('betDetails.copy'),
    type: 'success'
  })
}
</script>

<style scoped lang="scss"></style>
