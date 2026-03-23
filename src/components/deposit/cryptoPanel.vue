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
        <h2 class="mr-1">{{ t('locales.home.deposit_more') }}</h2>
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

    <div class="mt-5">
      <p class="text-sm text-text-1">{{ t('locales.home.deposit_channel') }}</p>
      <div class="flex gap-2 mt-4">
        <button
          v-for="ch in channels"
          :key="ch"
          @click="selectedChannel = ch"
          type="button"
          :class="[
            'flex-1 flex justify-center items-center h-12 rounded-lg lg:hover:bg-[var(--color-theme-level-3)] border text-text-1',
            selectedChannel === ch ? 'bg-[var(--color-theme-level-3)]' : ''
          ]"
          :style="{
            border: `1px solid ${selectedChannel === ch ? 'var(--color-theme-level-1)' : 'var(--color-opacity-10)'}`
          }"
        >
          {{ ch }}
        </button>
      </div>
    </div>

    <div class="mt-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-text-1">{{ t('locales.home.deposit_amount') }}</p>
        <div class="flex items-center">
          <div class="w-4 h-4 mr-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M13.5369 3.06056C13.4445 2.98486 13.3365 2.93227 13.2212 2.90692C13.1059 2.88157 12.9864 2.88415 12.8722 2.91445L9.27437 3.86974C8.88482 3.97317 8.61357 4.32579 8.61357 4.72886V11.9551C8.61357 12.5385 9.16612 12.9637 9.73007 12.8143L13.2661 11.8777C13.4325 11.8337 13.5799 11.7336 13.6847 11.5931C13.7895 11.4526 13.8458 11.28 13.8446 11.1027V3.6831C13.8427 3.56198 13.814 3.44291 13.7606 3.335C13.7073 3.2271 13.6308 3.13322 13.5369 3.06056ZM7.38277 4.72936C7.38277 4.32606 7.11128 3.9733 6.72137 3.87008L3.11185 2.91445C2.99941 2.88758 2.8826 2.88674 2.76981 2.912C2.65702 2.93726 2.55105 2.988 2.45952 3.06056C2.36624 3.13583 2.29105 3.23232 2.23982 3.3425C2.18858 3.45269 2.16268 3.57359 2.16412 3.6958V11.1027C2.16425 11.2789 2.22116 11.4501 2.32589 11.5893C2.43062 11.7284 2.57722 11.8277 2.7426 11.8714L6.26463 12.8116C6.82898 12.9622 7.38277 12.5369 7.38277 11.9528V4.72936Z"
                fill="#B3BEC1"
              />
            </svg>
          </div>
          <p class="text-sm text-text-2">{{ t('locales.home.deposit_amount') }}</p>
        </div>
      </div>
      <div
        class="flex items-center w-full mt-3 p-3 rounded-lg bg-input-3 border border-[color:var(--color-opacity-10)] focus-within:border-[color:var(--color-theme-level-1)] focus-within:ring-0"
      >
        <div class="w-6 mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M22.1096 11.7598C22.1096 10.1569 17.7422 9.53054 14.2261 9.32788V7.11707H20.0924V2.99023H3.91844V7.11707H9.78476V9.32788C6.26867 9.51211 1.88281 10.1569 1.88281 11.7598C1.88281 13.3626 6.25016 13.989 9.76625 14.1917V22.1137H14.2261V14.1917C17.7422 13.989 22.1096 13.3626 22.1096 11.7598ZM11.9869 13.51C5.91706 13.51 2.60454 12.3493 2.60454 11.7598C2.60454 11.2439 5.12131 10.3043 9.76625 10.0648V13.0678H14.2261V10.0648C18.8711 10.3043 21.3878 11.2439 21.3878 11.7598C21.3693 12.3493 18.0568 13.51 11.9869 13.51Z"
              fill="#2AEE88"
            />
          </svg>
        </div>
        <input
          type="number"
          v-model="amount"
          placeholder="Please select a deposit amount"
          class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0"
        />
      </div>
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
import { useI18n } from 'vue-i18n'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import BTCIcon from '@/static/img/crypto/BTC.png'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import BNBIcon from '@/static/img/crypto/BNB.png'

const { t } = useI18n()
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
<style scoped lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
