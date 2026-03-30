<template>
  <div class="w-full bg-bg-2 p-4 rounded-lg font-['Inter']">
    <p class="text-xs sm:text-sm font-bold leading-normal text-text-1">Deposit Methods</p>
    <div class="mt-2.5 overflow-hidden">
      <div
        ref="methodListRef"
        class="flex flex-nowrap gap-1 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="handleMethodListWheel"
      >
        <div
          class="shrink-0 flex flex-col sm:flex-row items-center justify-center p-2 sm:p-4 rounded-xl lg:hover:bg-theme-3 lg:hover:border-theme-primary"
          :class="{
            'border border-theme-primary bg-theme-3': selectedMethod.name === item.name,
            'border border-transparent bg-bg-4': selectedMethod.name !== item.name,
            'basis-[31.25%]': isMobile
          }"
          v-for="(item, index) in payMethods"
          :key="index"
          :ref="el => setMethodItemRef(el, index)"
          @click.stop="selectMethod(item, index)"
        >
          <img class="sm:mr-4 h-6" :src="item.icon" />
          <p class="text-sm sm:text-base font-bold leading-normal text-text-1">{{ item.name }}</p>
        </div>
      </div>
    </div>
    <p class="mt-4 text-xs sm:text-sm font-bold leading-normal text-text-1">Deposit Amount</p>
    <div
      class="flex items-center w-full mt-2 p-3 rounded-lg bg-input-3 border border-[color:var(--color-opacity-10)] focus-within:border-[color:var(--color-theme-level-1)] focus-within:ring-0"
    >
      <DepositTokenIcon class="w-6 h-6 mr-3 text-theme-primary" />
      <input
        type="number"
        v-model="amount"
        placeholder="Please select or enter deposit amount."
        class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
      />
    </div>
    <div class="mt-4 w-full relative">
      <div
        ref="presetsRef"
        class="grid grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-5 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
        :class="
          expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[106px] sm:max-h-[148px] overflow-hidden'
        "
      >
        <button
          v-for="preset in presetAmounts"
          :key="preset"
          @click="amount = preset"
          class="py-[7px] sm:py-3 text-base sm:text-lg rounded-lg lg:hover:bg-theme-primary"
          :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
        >
          {{ preset }}
        </button>
      </div>
      <div class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg p-1.5 sm:p-3 relative -mt-3 z-10">
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
    <div class="w-full mt-4">
      <button
        class="w-full h-10 sm:h-12 flex items-center justify-center lg:hover:btn-primary rounded-lg font-semibold text-text-4"
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
import { computed, nextTick, ref, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import DepositTokenIcon from '@/static/svg/deposit/fiat-order-amount.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import payPalIcon from '@/static/img/payment/payPal.png'
import depositOrderPop from '../order/depositOrderPop.vue'
import { defaultFiatOrder, FiatOrderType } from '../order/orderType'
import { usePresetGrid } from '../shared/usePresetGrid'

const { t } = useI18n()
const isMobile = useIsMobile()
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
const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
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

const setMethodItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  const target =
    el instanceof HTMLElement
      ? el
      : el && '$el' in el && el.$el instanceof HTMLElement
        ? el.$el
        : null

  methodItemRefs.value[index] = target
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
