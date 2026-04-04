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
            :key="item.paymentCode ?? index"
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
    <div class="mt-6">
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
        <div v-if="quickAmounts.length" class="mt-4 w-full relative">
          <div
            ref="presetsRef"
            class="grid grid-cols-6 gap-2 rounded-tl-lg rounded-tr-lg bg-bg-4 p-2 transition-all duration-300"
            :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[104px] overflow-hidden'"
          >
            <button
              v-for="(item, index) in quickAmounts"
              :key="`${item.amount ?? index}`"
              type="button"
              class="rounded-lg py-2.5 text-sm font-semibold lg:hover:bg-theme-primary"
              :class="[
                Number(item.amount ?? 0) === Number(amount ?? 0)
                  ? 'bg-theme-primary text-text-4'
                  : 'bg-bg-2 text-text-1'
              ]"
              @click="applyQuickAmount(item)"
            >
              {{ formatQuickAmount(item.amount) }}
            </button>
          </div>
          <div v-if="showExpandButton" class="w-full rounded-bl-lg rounded-br-lg bg-bg-4 py-2">
            <button
              type="button"
              class="mx-auto flex items-center gap-1 text-xs text-text-3 transition lg:hover:text-text-1"
              @click="expanded = !expanded"
            >
              {{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}
              <ExpandUpDoubleIcon v-if="expanded" class="h-2 w-[9px]" />
              <ExpandDownDoubleIcon v-else class="h-2 w-[9px]" />
            </button>
          </div>
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
import CloseIcon from '@/static/svg/close.svg?component'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { computed, type ComponentPublicInstance, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FastAmountItem } from '@/api/interface/withdraw'
import { usePresetGrid } from '@/components/deposit/shared/usePresetGrid'
import type { WithdrawSubmitPayload } from './types'
import { useWithdrawFiat } from './useWithdrawFiat'

const { t } = useI18n()
const {
  accountName,
  amount,
  applyQuickAmount,
  currentCurrency,
  currencySymbol,
  formattedBalance,
  isAmountDisabled,
  isWithdrawDisabled,
  payMethods,
  phoneNumber,
  quickAmounts,
  selectedAccount,
  selectedMethod,
  selectMethod: selectMethodOption
} = useWithdrawFiat()

const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const showExpandButton = computed(() => quickAmounts.value.length > 6)

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

const selectMethod = async (method: (typeof payMethods.value)[number], index: number) => {
  await selectMethodOption(method)
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

const formatQuickAmount = (value: FastAmountItem['amount']) => {
  const nextAmount = Number(value ?? 0)

  return Number.isFinite(nextAmount) && nextAmount > 0
    ? nextAmount.toLocaleString()
    : String(value ?? '')
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
    paymentCode: selectedMethod.value.paymentCode,
    accountRowId: selectedAccount.value?.rowId,
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
