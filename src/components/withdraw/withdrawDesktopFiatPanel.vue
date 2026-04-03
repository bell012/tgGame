<template>
  <div class="w-full bg-bg-2 p-6 rounded-lg font-['Inter']">
    <div>
      <p class="text-sm font-bold leading-normal text-text-1">{{ t('withdraw.methods') }}</p>
      <div class="mt-2.5 overflow-hidden">
        <div
          ref="methodListRef"
          class="flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
          @wheel.prevent="handleMethodListWheel"
        >
          <div
            class="shrink-0 basis-[calc((100%-3rem)/4)] flex items-center justify-center p-4 rounded-xl lg:hover:bg-theme-3 lg:hover:border-theme-primary"
            :class="{
              'border border-theme-primary bg-theme-3': selectedMethod.name === item.name,
              'border border-transparent bg-bg-4': selectedMethod.name !== item.name
            }"
            v-for="(item, index) in payMethods"
            :key="index"
            :ref="el => setMethodItemRef(el, index)"
            @click.stop="selectMethod(item, index)"
          >
            <img class="mr-4 h-6" :src="item.icon" />
            <p class="text-base font-bold leading-normal text-text-1">{{ item.name }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-6 grid grid-cols-2 gap-5">
      <div>
        <div class="text-sm font-bold leading-normal">{{ t('withdraw.phone_number') }}</div>
        <div
          class="mt-2 p-3 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <input
            type="text"
            v-model="phoneNumber"
            :placeholder="t('withdraw.phone_placeholder')"
            class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
          />
          <button
            v-show="phoneNumber !== ''"
            class="w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
            @click="phoneNumber = ''"
          >
            <CloseIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        <div class="text-sm font-bold leading-normal">{{ t('withdraw.name') }}</div>
        <div
          class="mt-2 p-3 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <input
            type="text"
            v-model="accountName"
            :placeholder="t('withdraw.name_placeholder')"
            class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
          />
          <button
            v-show="accountName !== ''"
            class="w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
            @click="accountName = ''"
          >
            <CloseIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <div class="mt-6 grid grid-cols-2 gap-5">
      <div>
        <div class="flex items-center justify-between">
          <div class="text-sm font-bold leading-normal">{{ t('withdraw.amount') }}</div>
          <div class="flex items-center text-sm text-text-2">
            {{ t('withdraw.balance') }}：
            <span class="mr-1 text-text-1">{{ formattedBalance }}</span>
            <ChevronRightSmallIcon class="ml-1 w-1 h-2 text-text-1" />
          </div>
        </div>
        <div
          class="mt-2 p-3 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <span class="mr-3 text-xl font-bold leading-none text-theme-primary">{{
            currencySymbol
          }}</span>
          <input
            type="number"
            v-model="amount"
            :placeholder="t('withdraw.amount_placeholder')"
            class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
          />
          <button
            v-show="!isAmountDisabled"
            class="w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
            @click="amount = undefined"
          >
            <CloseIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <button
      class="mt-6 w-full h-12 flex items-center justify-center lg:hover:btn-primary rounded-lg font-semibold text-text-4"
      :class="[!isWithdrawDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
      :disabled="isWithdrawDisabled"
      @click="doWithdrawDeposit"
    >
      {{ t('withdraw.withdraw_now') }}
    </button>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import CloseIcon from '@/static/svg/close.svg?component'
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import payPalIcon from '@/static/img/payment/payPal.png'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import { type ComponentPublicInstance, computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import { getCurrencySymbol, getFormattedBalance } from '@/utils/locale'

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
