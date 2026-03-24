<template>
  <div class="w-full h-full bg-bg-2 p-3 rounded-lg relative">
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

    <div
      class="mt-4 text-sm border-b border-opacity-10 pb-2.5 relative overflow-x-auto scrollbar-hide touch-pan-x"
    >
      <div class="flex items-center w-max relative">
        <template v-for="(item, index) in wageringList" :key="index">
          <button
            @click="wageringActiveCode = item"
            class="relative text-sm transition-colors whitespace-nowrap"
            :class="
              wageringActiveCode === item ? 'text-text-1' : 'text-text-2 lg:hover:text-text-1'
            "
          >
            {{ item }}
            <span
              v-if="wageringActiveCode === item"
              class="absolute left-0 -bottom-2.5 h-[2px] w-full bg-theme-primary"
            ></span>
          </button>
          <div v-if="index !== wageringList.length - 1" class="h-4 w-px bg-opacity-10 mx-5"></div>
        </template>
      </div>
    </div>

    <div class="w-full relative">
      <p class="text-xs text-secondary-7 py-3">No wagering required for withdrawal</p>
      <div
        class="grid grid-cols-3 gap-3 p-5 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
        :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[128px] overflow-hidden'"
      >
        <button
          v-for="preset in presets"
          :key="preset"
          @click="amount = preset"
          class="py-3 rounded-lg lg:hover:bg-theme-primary"
          :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
        >
          {{ preset }}
        </button>
      </div>
      <div class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg pb-3">
        <button
          class="mx-auto flex items-center gap-1 text-xs text-text-3 lg:hover:text-text-1 transition"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Collapse' : 'Expand' }}
          <div v-if="expanded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9"
              height="8"
              viewBox="0 0 9 8"
              fill="none"
            >
              <path
                d="M0.227124 3.79809C0.342523 3.89698 0.529925 3.89698 0.645324 3.79809L4.19418 0.757177L7.74304 3.79696C7.85843 3.89584 8.04584 3.89583 8.16124 3.79696C8.27661 3.69809 8.27678 3.53761 8.16049 3.43871L4.46268 0.270345C4.44944 0.249411 4.4339 0.228837 4.41328 0.211141C4.35202 0.158648 4.27033 0.134749 4.19003 0.137984C4.11283 0.136975 4.03508 0.161083 3.97622 0.211518C3.95616 0.228721 3.94066 0.248552 3.92758 0.268837L0.227124 3.43984C0.111786 3.53872 0.111798 3.6992 0.227124 3.79809Z"
                fill="#7B7D7D"
              />
              <path
                d="M0.227164 7.61179C0.342563 7.71069 0.529965 7.71069 0.645364 7.61179L4.19422 4.57089L7.74308 7.61066C7.85847 7.70955 8.04588 7.70954 8.16128 7.61066C8.27665 7.5118 8.27682 7.35132 8.16053 7.25242L4.46272 4.08405C4.44948 4.06312 4.43394 4.04255 4.41332 4.02485C4.35206 3.97236 4.27037 3.94846 4.19007 3.95169C4.11287 3.95068 4.03512 3.97479 3.97626 4.02523C3.9562 4.04243 3.9407 4.06226 3.92762 4.08255L0.227164 7.25355C0.111826 7.35243 0.111838 7.51291 0.227164 7.61179Z"
                fill="#7B7D7D"
              />
            </svg>
          </div>
          <div v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9"
              height="8"
              viewBox="0 0 9 8"
              fill="none"
            >
              <path
                d="M0.227175 4.02622C0.342586 3.92745 0.530023 3.92737 0.645375 4.02622L4.19423 7.0675L7.74309 4.02735C7.8585 3.92854 8.04593 3.92849 8.16129 4.02735C8.27669 4.12624 8.27655 4.28708 8.16016 4.38597L4.46197 7.55434C4.44874 7.57517 4.43351 7.59592 4.41295 7.61354C4.35223 7.66554 4.27156 7.68905 4.19197 7.68632C4.11408 7.68781 4.03566 7.66368 3.97627 7.61279C3.95656 7.59589 3.94136 7.57648 3.92838 7.5566L0.227175 4.38484C0.111775 4.28595 0.111775 4.12511 0.227175 4.02622Z"
                fill="#7B7D7D"
              />
              <path
                d="M0.227175 0.212779C0.342586 0.11401 0.530023 0.113929 0.645375 0.212779L4.19423 3.25406L7.74309 0.21391C7.8585 0.115104 8.04593 0.115048 8.16129 0.21391C8.27669 0.312801 8.27655 0.47364 8.16016 0.572529L4.46197 3.7409C4.44874 3.76173 4.43351 3.78249 4.41295 3.8001C4.35223 3.85211 4.27156 3.87561 4.19197 3.87288C4.11408 3.87437 4.03566 3.85024 3.97627 3.79935C3.95656 3.78245 3.94136 3.76304 3.92838 3.74316L0.227175 0.571398C0.111775 0.472508 0.111775 0.311669 0.227175 0.212779Z"
                fill="#7B7D7D"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <div class="w-full mt-4">
      <button
        class="w-full py-4 lg:hover:btn-primary rounded-xl font-semibold"
        :class="[
          amount && Number(amount) > 0 ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed'
        ]"
        :disabled="!amount || Number(amount) <= 0"
      >
        {{ t('locales.home.deposit_now') }}
      </button>
    </div>
  </div>

  <div
    class="mt-3 w-full bg-bg-2 p-4 rounded-lg flex items-center justify-between"
    @click="loadWallet"
  >
    <div class="text-sm text-text-1">Load from your wallet</div>
    <div class="flex items-center">
      <img class="h-6 mr-1" :src="groupIcon" />
      <div class="text-sm text-text-1">+300</div>
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
import groupIcon from '@/static/img/crypto/groupIcons.png'
import { showToast } from 'vant'

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
const presets = [200, 500, 1000, 1500, 2000, 3000, 5000, 10000, 20000, 30000, 50000, 100000]
const wageringList = ['No Wagering', '1x Wagering', '5x Wagering', '10x Wagering']
const wageringActiveCode = ref('No Wagering')

const selectedChannel = ref('Channel 1')
const amount = ref<number | null>(null)
const coinCode = ref<string | ''>('USDT')
const coinBaseCode = ref<string | ''>('USDT')
const coinMoreShow = ref<boolean>(false)
const expanded = ref<boolean>(false)

const selectCoinCode = (code: string) => {
  if (code !== 'USDT') {
    showToast({
      message: 'Unavailable',
      type: 'fail'
    })

    return
  }
  coinCode.value = code
  coinBaseCode.value = code
  coinMoreShow.value = false
}

const openCoinMorePanel = () => {
  showToast({
    message: 'Unavailable',
    type: 'fail'
  })
  return
  // coinCode.value = ''
  // coinMoreShow.value = !coinMoreShow.value
  // if (!coinMoreShow.value) {
  //   coinCode.value = coinBaseCode.value
  // }
}

const loadWallet = () => {
  showToast({
    message: 'Unavailable',
    type: 'fail'
  })
  return
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
