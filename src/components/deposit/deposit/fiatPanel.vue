<template>
  <div class="w-full min-h-full bg-bg-2 p-4 rounded-lg">
    <p class="text-sm font-bold leading-normal text-text-1">Deposit Methods</p>
    <div class="mt-2.5 overflow-hidden">
      <div class="flex flex-nowrap gap-1 overflow-x-auto scrollbar-hide touch-pan-x">
        <div
          class="shrink-0 flex items-center justify-center p-4 rounded-xl lg:hover:bg-theme-3 lg:hover:border-theme-primary"
          :class="{
            'border border-theme-primary bg-theme-3': selectedMethod.name === item.name,
            'border border-transparent bg-bg-4': selectedMethod.name !== item.name
          }"
          v-for="(item, index) in payMethods"
          :key="index"
          @click.stop="selectedMethod = item"
        >
          <img class="mr-4 h-6" :src="item.icon" />
          <p class="text-base font-bold leading-normal text-text-1">{{ item.name }}</p>
        </div>
      </div>
    </div>
    <p class="mt-4 text-sm font-bold leading-normal text-text-1">Deposit Amount</p>
    <div
      class="flex items-center w-full mt-2 p-3 rounded-lg bg-input-3 border border-[color:var(--color-opacity-10)] focus-within:border-[color:var(--color-theme-level-1)] focus-within:ring-0"
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
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M13.3945 1.08887C15.5023 1.0889 17.0836 1.63982 18.1738 2.74121C18.7694 3.33506 19.1946 4.08322 19.4502 4.98438H20.8965V6.68359H19.7197C19.7293 6.86234 19.7363 7.04521 19.7363 7.23242C19.7363 7.4072 19.7302 7.57854 19.7217 7.74609H20.8965V9.44531H19.457C19.2022 10.3554 18.7746 11.1157 18.1738 11.7246C17.0836 12.826 15.5023 13.3769 13.3945 13.377H8.72656V21.7695H5.76855V9.44531H4.57031V7.74609H5.76855V6.68359H4.57031V4.98438H5.76855V1.08887H13.3945ZM8.72656 9.44531V11.1279C10.6538 10.873 14.7658 11.8471 16.2432 9.44531H8.72656ZM8.72656 7.74609H16.7617C16.7685 7.67093 16.7743 7.59413 16.7783 7.51562C16.8124 7.27339 16.8209 6.98862 16.7969 6.68359H8.72656V7.74609ZM8.72656 4.98438H16.2529C15.6932 4.10328 14.6393 3.39074 12.7715 3.39062H8.72656V4.98438Z"
            fill="#2AEE88"
          />
        </svg>
      </div>
      <input
        type="number"
        v-model="amount"
        placeholder="Please select or enter deposit amount."
        class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0"
      />
    </div>
    <div class="mt-4 w-full relative">
      <div
        ref="presetsRef"
        class="grid grid-cols-3 gap-3 p-5 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
        :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[140px] overflow-hidden'"
      >
        <button
          v-for="preset in presetAmounts"
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
        class="w-full py-4 lg:hover:btn-primary rounded-xl font-semibold text-text-4"
        :class="[!isDepositDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
        :disabled="isDepositDisabled"
        @click="doDeposit"
      >
        {{ t('deposit.deposit_now') }}
      </button>
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
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import payPalIcon from '@/static/img/payment/payPal.png'
import depositOrderPop from '../order/depositOrderPop.vue'
import { defaultFiatOrder, FiatOrderType } from '../order/orderType'
import { usePresetGrid } from '../shared/usePresetGrid'

const { t } = useI18n()
interface MethodOption {
  name: string
  icon: string
}

const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const presetAmounts = [200, 500, 1000, 1500, 2000, 3000, 5000, 10000, 20000, 30000, 50000, 100000]

const payMethods = [
  {
    name: 'GCash',
    icon: gCashIcon
  },
  {
    name: 'Maya',
    icon: mayaIcon
  },
  {
    name: 'GrabPay',
    icon: grabPayIcon
  },
  {
    name: 'PayPal',
    icon: payPalIcon
  }
]
const selectedMethod = ref<MethodOption>(payMethods[0])
const amount = ref<number>()
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const orderInfo = ref<FiatOrderType>(defaultFiatOrder)
const orderPopShow = ref(false)
const isDepositDisabled = computed(() => !amount.value || Number(amount.value) <= 0)

const handleClose = () => {
  emit('hidden', false)
}

const handleHidden = () => {
  emit('hidden', true)
}

const doDeposit = () => {
  orderInfo.value = {
    order_no: 'ts0768456746746746746',
    created_at: '12/18/2026 11:14:15 AM',
    amount: amount.value ?? 0,
    method: selectedMethod.value.name,
    method_icon: selectedMethod.value.icon,
    currency: 'PHP',
    bonus: '50',
    type: 'Fiat',
    status: 'Success'
  }
  emit('hidden', true)
  orderPopShow.value = true
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
