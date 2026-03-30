<template>
  <div class="w-full font-['Inter']">
    <div class="w-full flex">
      <div class="flex gap-2 flex-1">
        <button
          v-for="coin in visibleCoins"
          :key="coin.code"
          type="button"
          class="appearance-none p-2 rounded-full bg-bg-2 text-xs text-text-2 flex items-center border"
          :style="{
            border: `1px solid ${coin.code === coinCode ? 'var(--color-theme-level-1)' : 'transparent'}`
          }"
          :class="{
            'text-text-1': coin.code === coinCode
          }"
          @click.stop="selectCoinCode(coin.code)"
        >
          <img class="w-5 aspect-square mr-1" :src="coin.icon" />
          {{ coin.name }}
        </button>
      </div>
      <button
        type="button"
        class="appearance-none p-1.5 rounded-full bg-bg-2 text-xs flex items-center border"
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
        <h2 class="mr-1">{{ t('deposit.deposit_more') }}</h2>
        <ChevronRightSmallIcon class="w-1 h-2" />
      </button>
    </div>
    <div class="mt-3.5 p-3.5 bg-bg-2 rounded-lg">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="text-xs font-normal leading-normal">Withdraw Currency</div>
          <CustomSelect class="mt-2 w-full" v-model="currency" :options="currencyOptions" />
        </div>
        <div>
          <div class="text-xs font-normal leading-normal">Select Network</div>
          <CustomSelect class="mt-2 w-full" v-model="selectNetwork" :options="networkOptions" />
        </div>
      </div>
      <div class="mt-5">
        <div class="text-xs font-normal leading-normal">Receive Address</div>
        <div
          class="mt-2 p-3 w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <input
            type="text"
            v-model="address"
            placeholder="Please enter the receiving address"
            class="w-full text-xs bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs"
          />
        </div>
      </div>
      <div class="mt-5">
        <div class="text-xs font-normal leading-normal">Withdraw Amount</div>
        <div
          class="mt-2 p-3 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <DepositTokenIcon class="w-5 h-5 mr-2 shrink-0 text-theme-primary" />
          <input
            type="number"
            v-model="amount"
            placeholder="Please enter the withdrawal amount"
            class="flex-1 min-w-0 text-base font-bold bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs placeholder:font-normal"
          />
          <div v-if="!isAmountDisabled" class="flex items-center shrink-0 ml-2">
            <p class="text-text-1 text-xs mr-1 whitespace-nowrap">You Get ≈ 100</p>
            <!-- string -->
            <img
              v-if="typeof currencyOption?.icon === 'string'"
              :src="currencyOption.icon"
              class="w-4 h-4 object-contain"
            />
            <!-- component -->
            <component v-else-if="currencyOption?.icon" :is="currencyOption.icon" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3.5 flex items-center">
          <div class="text-xs font-normal leading-normal">
            Balance：<span class="text-theme-primary">5000PHP</span>
          </div>
          <RefreshIcon class="w-3.5 text-icon-2 ml-1" />
        </div>
      </div>
      <div class="mt-5 p-2.5 rounded-lg bg-theme-3 flex items-start">
        <InfoIcon class="w-5 h-5 mr-1 shrink-0 text-theme-primary" />
        <div class="text-xs text-text-2 font-normal leading-normal">
          Please make sure the recipient address is correct. Funds cannot be recovered if sent to
          the wrong address.
        </div>
      </div>
      <div class="mt-5 flex items-center">
        <AmountInfoIcon class="w-3.5 h-3.5 mr-1 text-icon-2" />
        <div class="text-xs text-text-2">How to withdraw crypto?</div>
      </div>
      <button
        class="mt-5 w-full h-10 flex items-center justify-center rounded-lg font-semibold text-text-4"
        :class="[!isWithdrawDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
        :disabled="isWithdrawDisabled"
        @click="doWithdrawDeposit"
      >
        Withdraw Now
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import BTCIcon from '@/static/img/crypto/BTC.png'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import BNBIcon from '@/static/img/crypto/BNB.png'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/fiat-order-amount.svg?component'
import CustomSelect from '@/components/common/CustomSelect.vue'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import RefreshIcon from '@/static/svg/refresh.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'

const { t } = useI18n()
const unavailableMessage = 'Unavailable'
const amount = ref<number>()
const address = ref('')
const currency = ref('USDT')
const coinCode = ref('USDT')
const coinMoreShow = ref(false)
const visibleCoins = computed(() => coins.value.slice(0, 3))
const coins = computed(() => [
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
])
const currencyOptions = computed(() => [
  { label: 'USDT', value: 'USDT', icon: USDTIcon },
  { label: 'ETH', value: 'ETH', icon: ETHIcon },
  { label: 'BTC', value: 'BTC', icon: BTCIcon },
  { label: 'USDC', value: 'USDC', icon: USDCIcon }
])
const currencyOption = computed(() => {
  return currencyOptions.value.find(opt => opt.value === currency.value)
})
const selectNetwork = ref('TRC20')
const networkOptions = computed(() => [
  { label: 'Tron（TRC20）', value: 'TRC20' },
  { label: 'Ethereum（ERC20）', value: 'ERC20' },
  { label: 'Tron（TRC21）', value: 'TRC21' },
  { label: 'Tron（TRC22）', value: 'TRC22' },
  { label: 'Tron（TRC23）', value: 'TRC23' }
])
const isAmountDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
const isWithdrawDisabled = computed(() => isAmountDisabled.value || !address.value)

const showUnavailableToast = () => {
  showToast({
    message: unavailableMessage,
    type: 'fail'
  })
}

const selectCoinCode = (code: string) => {
  if (code !== 'USDT') {
    showUnavailableToast()
    return
  }

  coinCode.value = code
  coinMoreShow.value = false
}

const openCoinMorePanel = () => {
  showUnavailableToast()
  return
}

const doWithdrawDeposit = () => {}
</script>
<style scoped lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  appearance: textfield; /* 禁用默认浏览器样式 */
  -webkit-appearance: textfield; /* 针对 Safari 和 Webkit 浏览器 */
  -moz-appearance: textfield; /* 针对 Firefox */
}
</style>
