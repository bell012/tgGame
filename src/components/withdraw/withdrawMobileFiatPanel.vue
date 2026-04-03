<template>
  <div class="w-full font-['Inter']">
    <div class="w-full p-3.5 bg-bg-2 rounded-lg">
      <p class="text-xs font-normal leading-normal text-text-1">{{ t('withdraw.methods') }}</p>
      <div class="mt-2.5 overflow-hidden">
        <div
          ref="methodListRef"
          class="flex flex-nowrap gap-1 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
          @wheel.prevent="handleMethodListWheel"
        >
          <div
            class="shrink-0 flex flex-col items-center justify-center p-2 rounded-lg basis-[31.25%]"
            :class="{
              'border border-theme-primary bg-theme-3': selectedMethod.name === item.name,
              'border border-transparent bg-bg-4': selectedMethod.name !== item.name
            }"
            v-for="(item, index) in payMethods"
            :key="index"
            :ref="el => setMethodItemRef(el, index)"
            @click.stop="selectMethod(item, index)"
          >
            <img class="h-5" :src="item.icon" />
            <p class="text-sm font-bold leading-normal text-text-1">{{ item.name }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-2.5 p-3.5 bg-bg-2 rounded-lg">
      <div>
        <div class="text-xs font-normal leading-normal">{{ t('withdraw.phone_number') }}</div>
        <div
          class="mt-2.5 p-3.5 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <div class="shrink-0 text-base font-bold leading-normal mr-2 text-theme-primary">+63</div>
          <input
            type="text"
            v-model="phoneNumber"
            :placeholder="t('withdraw.phone_placeholder')"
            class="flex-1 text-base font-bold leading-normal text-text-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs placeholder:font-normal"
          />
        </div>
      </div>
      <div class="mt-5">
        <div class="text-xs font-normal leading-normal">{{ t('withdraw.name') }}</div>
        <div
          class="mt-2.5 p-3.5 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <userIcon class="w-5 h-5 mr-2 shrink-0 text-theme-primary" />
          <input
            type="text"
            v-model="accountName"
            :placeholder="t('withdraw.name_placeholder')"
            class="flex-1 text-base font-bold leading-normal text-text-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs placeholder:font-normal"
          />
        </div>
      </div>
    </div>
    <div class="mt-2.5 p-3.5 bg-bg-2 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="text-xs font-normal leading-normal">{{ t('withdraw.amount') }}</div>
        <div class="flex items-center text-xs text-text-2">
          {{ t('withdraw.balance') }}：
          <span class="text-text-1 font-bold">{{ formattedBalance }}</span>
          <ChevronRightSmallIcon class="ml-1 w-1 h-2 text-text-1" />
        </div>
      </div>
      <div
        class="mt-2.5 p-3.5 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
      >
        <span class="mr-2 text-lg font-bold leading-none text-theme-primary">{{
          currencySymbol
        }}</span>
        <input
          type="number"
          v-model="amount"
          :placeholder="t('withdraw.amount_placeholder')"
          class="flex-1 text-base font-bold leading-normal text-text-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs placeholder:font-normal"
        />
      </div>
      <button
        class="mt-6 w-full h-10 flex items-center justify-center rounded-lg font-semibold text-text-4"
        :class="[!isWithdrawDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
        :disabled="isWithdrawDisabled"
        @click="doWithdrawDeposit"
      >
        {{ t('withdraw.withdraw_now') }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import userIcon from '@/static/svg/withdraw/user.svg?component'
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import payPalIcon from '@/static/img/payment/payPal.png'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import { type ComponentPublicInstance, computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'
import type { WithdrawSubmitPayload } from './types'

interface MethodOption {
  name: string
  icon: string
}

const { t } = useI18n()
const localeStore = useLocaleStore()
const { currentCurrency } = storeToRefs(localeStore)

const payMethods = computed<MethodOption[]>(() => [
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
])

const selectedMethod = ref(payMethods.value[0])
const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
const accountName = ref('')
const phoneNumber = ref('')
const amount = ref<number>()
const currencySymbol = computed(() => getCurrencySymbol(currentCurrency.value))
const formattedBalance = computed(() => getFormattedBalance(0, currentCurrency.value, 2))
const isAmountDisabled = computed(() => !amount.value || Number(amount.value) <= 0)
const isWithdrawDisabled = computed(
  () => isAmountDisabled.value || !accountName.value || !phoneNumber.value
)

const emit = defineEmits<{
  submit: [payload: WithdrawSubmitPayload]
}>()

const setMethodItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  const target =
    el instanceof HTMLElement
      ? el
      : el && '$el' in el && el.$el instanceof HTMLElement
        ? el.$el
        : null

  methodItemRefs.value[index] = target
}

const handleMethodListWheel = (event: WheelEvent) => {
  if (!methodListRef.value) return

  methodListRef.value.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

const selectMethod = (method: MethodOption, index: number) => {
  selectedMethod.value = method
  scrollMethodIntoView(index)
}

const scrollMethodIntoView = async (index: number) => {
  await nextTick()

  const target = methodItemRefs.value[index]
  if (!target || !methodListRef.value) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}
const doWithdrawDeposit = () => {
  if (isWithdrawDisabled.value) {
    return
  }

  emit('submit', {
    tabType: 'Fiat',
    amount: Number(amount.value),
    currencyCode: currentCurrency.value,
    methodLabel: selectedMethod.value.name,
    phoneNumber: phoneNumber.value,
    accountName: accountName.value
  })
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
