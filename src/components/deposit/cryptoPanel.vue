<template>
  <div class="w-full h-full bg-bg-2 p-3 rounded-2xl">
    <div class="w-full h-full flex">
      <div class="flex gap-1 flex-1">
        <button
          v-for="coin in coins"
          :key="coin.code"
          type="button"
          class="appearance-none p-2 rounded-full bg-bg-3 lg:hover:bg-[var(--color-theme-level-3)] text-xs flex items-center border"
          :style="{
            border: `1px solid ${coin.code === coinCode ? 'var(--color-theme-level-1)' : 'transparent'}`
          }"
          @click.stop="selectCoinCode(coin.code)"
        >
          <img class="w-5 aspect-square mr-1" :src="coin.icon" />
          {{ coin.name }}
        </button>
      </div>
      <button
        type="button"
        class="appearance-none p-2 rounded-full bg-bg-3 lg:hover:bg-[var(--color-theme-level-3)] text-xs flex items-center border"
        :style="{
          border: `1px solid ${coinMoreShow ? 'var(--color-theme-level-1)' : 'transparent'}`
        }"
        @click.stop="openCoinMorePanel"
      >
        <div class="w-8 h-5 relative mr-3">
          <img class="w-5 aspect-square mr-1 absolute left-0 z-30" :src="DOGEIcon" />
          <img class="w-5 aspect-square mr-1 absolute left-2 z-20" :src="TRXIcon" />
          <img class="w-5 aspect-square mr-1 absolute left-4 z-10" :src="BNBIcon" />
        </div>
        <h2 class="mr-1">More</h2>
        <div class="w-1 h-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="4"
            height="8"
            viewBox="0 0 4 8"
            fill="none"
          >
            <path
              d="M0.167262 6.90878C0.389895 7.13781 0.75116 7.13781 0.974348 6.90878L3.84338 3.95557C4.0659 3.72614 4.0659 3.35415 3.84338 3.12517L0.974348 0.172072C0.751207 -0.0573574 0.389926 -0.0573574 0.167262 0.172072C-0.0557539 0.401174 -0.0557539 0.77308 0.167262 1.00257L2.63289 3.54039L0.16727 6.07792C-0.0557382 6.30735 -0.0557304 6.67927 0.16727 6.90882L0.167262 6.90878Z"
              fill="#B3BEC1"
            />
          </svg>
        </div>
      </button>
    </div>

    <!-- Channel -->
    <div class="px-6 mt-5">
      <p class="text-sm mb-2">Deposit Channel</p>
      <div class="flex gap-3">
        <button
          v-for="ch in channels"
          :key="ch"
          @click="selectedChannel = ch"
          :class="[
            'flex-1 py-2 rounded-lg border',
            selectedChannel === ch
              ? 'border-green-400 bg-green-400/10 text-green-400'
              : 'border-gray-600 text-gray-300'
          ]"
        >
          {{ ch }}
        </button>
      </div>
    </div>

    <!-- Amount -->
    <div class="px-6 mt-5">
      <p class="text-sm mb-2">Deposit Amount</p>
      <input
        type="number"
        v-model="amount"
        placeholder="Please select a deposit amount"
        class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400"
      />
    </div>

    <!-- Wager Tabs -->
    <div class="px-6 mt-4 flex gap-4 text-sm">
      <button class="text-green-400 border-b-2 border-green-400 pb-1">No Wagering</button>
      <button class="text-gray-400">1x Wagering</button>
      <button class="text-gray-400">5x Wagering</button>
      <button class="text-gray-400">10x Wagering</button>
    </div>

    <p class="px-6 text-xs text-yellow-400 mt-2">No wagering required for withdrawal</p>

    <!-- Presets -->
    <div class="grid grid-cols-3 gap-3 px-6 mt-4">
      <button
        v-for="preset in presets"
        :key="preset"
        @click="amount = preset"
        class="py-3 rounded-lg bg-gray-700 hover:bg-gray-600"
      >
        {{ preset }}
      </button>
    </div>

    <!-- Action -->
    <div class="px-6 py-5">
      <button class="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold">
        Deposit Now
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import BTCIcon from '@/static/img/crypto/BTC.png'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import BNBIcon from '@/static/img/crypto/BNB.png'

const coins = [
  {
    name: 'USDT',
    code: 'USDT',
    icon: USDTIcon
  },
  {
    name: 'ETH',
    code: 'ETH',
    icon: ETHIcon
  },
  {
    name: 'BTC',
    code: 'BTC',
    icon: BTCIcon
  },
  {
    name: 'USDC',
    code: 'USDC',
    icon: USDCIcon
  }
]
const channels = ['Channel 1', 'Channel 2', 'Channel 3']
const presets = [200, 500, 1000, 1500, 2000, 3000]

const selectedChannel = ref('Channel 1')
const amount = ref<number | ''>('')
const coinCode = ref<string | ''>('USDT')
const coinBaseCode = ref<string | ''>('USDT')
const coinMoreShow = ref<boolean>(false)

const selectCoinCode = (code: string) => {
  coinCode.value = code
  coinBaseCode.value = code
  coinMoreShow.value = false
}

const openCoinMorePanel = () => {
  coinCode.value = ''
  coinMoreShow.value = !coinMoreShow.value
  if (!coinMoreShow.value) {
    coinCode.value = coinBaseCode.value
  }
}
</script>
<style scoped lang="scss"></style>
