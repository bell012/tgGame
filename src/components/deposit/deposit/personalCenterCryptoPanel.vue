<template>
  <div class="w-full bg-bg-2 p-6 rounded-lg font-['Inter']">
    <div class="w-full flex">
      <div class="flex gap-4 flex-1">
        <button
          v-for="coin in visibleCoins"
          :key="coin.code"
          type="button"
          class="appearance-none py-2 px-6 rounded-full bg-bg-3 lg:hover:bg-theme-3 text-sm text-text-2 flex items-center border"
          :style="{
            border: `1px solid ${coin.code === coinCode ? 'var(--color-theme-level-1)' : 'transparent'}`
          }"
          :class="{
            'text-theme-primary': coin.code === coinCode
          }"
          @click.stop="selectCoinCode(coin.code)"
        >
          <img class="w-5 aspect-square mr-1" :src="coin.icon" />
          {{ coin.name }}
        </button>
      </div>
      <button
        type="button"
        class="appearance-none p-1.5 sm:p-2 rounded-full bg-bg-3 lg:hover:bg-[var(--color-theme-level-3)] text-xs flex items-center border"
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

    <div class="mt-6">
      <div class="flex items-center justify-between">
        <p class="text-sm text-text-1">{{ t('deposit.deposit_amount') }}</p>
        <div class="flex items-center">
          <AmountInfoIcon class="w-4 h-4 mr-1" />
          <p class="text-sm text-text-2">{{ t('deposit.deposit_amount') }}</p>
        </div>
      </div>
      <div
        class="flex items-center w-full mt-2 p-3 rounded-lg bg-input-3 border border-[color:var(--color-opacity-10)] focus-within:border-[color:var(--color-theme-level-1)] focus-within:ring-0"
      >
        <DepositTokenIcon class="w-6 h-6 mr-3" />
        <input
          type="number"
          v-model="amount"
          placeholder="Please select a deposit amount"
          class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-sm"
        />
        <button
          v-show="!isDepositDisabled"
          class="w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
          @click="amount = undefined"
        >
          <CloseIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="mt-6 w-full relative">
      <div
        ref="presetsRef"
        class="grid grid-cols-6 gap-2 p-2 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
        :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[104px] overflow-hidden'"
      >
        <button
          v-for="preset in presetAmounts"
          :key="preset"
          @click="amount = preset"
          class="py-2.5 rounded-lg lg:hover:bg-theme-primary"
          :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
        >
          {{ preset }}
        </button>
      </div>
      <div class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg py-2">
        <button
          class="mx-auto flex items-center gap-1 text-xs text-text-3 lg:hover:text-text-1 transition"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Collapse' : 'Expand' }}
          <ExpandUpDoubleIcon v-if="expanded" class="w-[9px] h-2" />
          <ExpandDownDoubleIcon v-else class="w-[9px] h-2" />
        </button>
      </div>
    </div>

    <div class="w-full mt-6">
      <button
        class="w-full py-4 lg:hover:btn-primary rounded-xl font-semibold text-text-4"
        :class="[!isDepositDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
        :disabled="isDepositDisabled"
        @click="doDeposit"
      >
        {{ t('deposit.deposit_now') }}
      </button>
    </div>

    <div class="mt-6 w-full flex items-center justify-center" @click="loadWallet">
      <div class="text-sm text-text-1 mr-2">Load from your wallet</div>
      <div class="flex items-center">
        <img class="h-6 mr-1" :src="groupIcon" />
        <div class="text-sm text-text-1">+300</div>
      </div>
    </div>
  </div>

  <depositOrderPop
    v-model:model-value="orderPopShow"
    v-model:orderInfo="orderInfo"
    @close="handleClose"
    @hidden="handleHidden"
  />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/deposit-token.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import USDCIcon from '@/static/img/crypto/USDC.png'
import USDTIcon from '@/static/img/crypto/USDT.png'
import ETHIcon from '@/static/img/crypto/ETH.png'
import BTCIcon from '@/static/img/crypto/BTC.png'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import BNBIcon from '@/static/img/crypto/BNB.png'
import groupIcon from '@/static/img/crypto/groupIcons.png'
import { showToast } from 'vant'
import depositOrderPop from '../order/depositOrderPop.vue'
import { CryptOrderType, defaultCryptOrder } from '../order/orderType'
import { usePresetGrid } from '../shared/usePresetGrid'

const { t } = useI18n()
const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const presetAmounts = [
  200, 500, 1000, 1500, 2000, 3000, 5000, 10000, 20000, 30000, 50000, 100000, 200000, 300000,
  500000, 1000000, 2000000, 3000000
]
const unavailableMessage = 'Unavailable'

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

const amount = ref<number>()
const coinCode = ref('USDT')
const coinMoreShow = ref(false)
const orderPopShow = ref(false)
const orderInfo = ref<CryptOrderType>(defaultCryptOrder)
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
const visibleCoins = computed(() => coins.slice(0, 6))

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

const loadWallet = () => {
  showUnavailableToast()
}

const doDeposit = () => {
  orderInfo.value = {
    order_no: 'ts0768456746746746746',
    created_at: '12/18/2026 11:14:15 AM',
    amount: amount.value ?? 0,
    method: coinCode.value,
    method_icon: USDTIcon,
    rate: 'Rate：1USDT≈7.15PHP（You Get≈3750PHP）',
    network: 'TRC20',
    address_token: 'tu899iugh889k9ijehddndk987he73178uh1ko671usuth55278',
    type: 'Crypto',
    status: 'loading'
  }
  orderPopShow.value = true
}

const handleClose = () => {
  emit('hidden', false)
}

const handleHidden = () => {
  // emit('hidden', true)
}
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
