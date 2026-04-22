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
              'border border-theme-primary bg-theme-3': selectMethodsOption?.label === item.label,
              'border border-transparent bg-bg-4': selectMethodsOption?.label !== item.label
            }"
            v-for="(item, index) in methodsOptions"
            :key="index"
            :ref="el => setMethodItemRef(el, index)"
            @click.stop="selectMethod(item, index)"
          >
            <img class="h-5" :src="item.customIcon" />
            <p class="text-sm font-bold leading-normal text-text-1">{{ item.label }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-2.5 p-3.5 bg-bg-2 rounded-lg">
      <div>
        <div
          class="flex items-center justify-between text-xs sm:text-sm font-normal leading-normal"
        >
          <span>{{ t('withdraw.e_wallet_address') }}</span>
          <button
            v-if="hasSelectedReceiveAddress"
            type="button"
            class="flex items-center text-xs sm:text-sm text-text-2"
            @click="emit('handleOpenAcountListPop')"
          >
            {{ t('withdraw.change') }}
            <ChevronRightSmallIcon class="ml-1 h-2 w-1" />
          </button>
        </div>
        <button
          v-if="!hasSelectedReceiveAddress"
          type="button"
          class="mt-2 flex h-[45px] w-full items-center justify-center rounded-lg border border-dashed border-theme-primary text-sm font-bold text-theme-primary"
          @click="emit('handleOpenAcountListPop')"
        >
          <AddPlusIcon class="mr-2 h-4 w-4 text-current" />
          {{ t('withdraw.add_e_wallet') }}
        </button>
        <button
          v-else
          type="button"
          class="mt-2 flex w-full items-center rounded-lg bg-opacity-6 p-[14px] text-left"
          @click="emit('handleOpenAcountListPop')"
        >
          <div class="mr-3 h-[25px] w-[25px] shrink-0 overflow-hidden rounded-full">
            <gameRemoteImg
              v-if="accountCardOption?.customRoundIcon"
              :img="{ src: accountCardOption?.customRoundIcon, maintain: false, fit: 'contain' }"
              class="h-full w-full"
              :alt="accountCardOption?.label"
            />
          </div>
          <div class="min-w-0 flex-1 text-sm font-semibold text-text-1">
            <p class="truncate">
              {{ accountCardOption?.accountNo }}
            </p>
          </div>
        </button>
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
          v-model="amountModel"
          :placeholder="t('withdraw.amount_placeholder')"
          class="flex-1 text-base font-bold leading-normal text-text-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs placeholder:font-normal"
        />
      </div>
      <div v-if="quickAmounts && quickAmounts.length > 0" class="mt-4 w-full relative">
        <div
          ref="presetsRef"
          class="grid grid-cols-3 gap-2 rounded-tl-lg rounded-tr-lg bg-bg-4 p-2.5 transition-all duration-300"
          :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[106px] overflow-hidden'"
        >
          <button
            v-for="(item, index) in quickAmounts"
            :key="`${item.amount ?? index}`"
            type="button"
            class="rounded-lg py-[7px] text-base lg:hover:bg-theme-primary"
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
        <div
          v-if="showExpandButton"
          class="relative z-10 -mt-3 w-full rounded-bl-lg rounded-br-lg bg-bg-4 p-1.5"
        >
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
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import { computed, type ComponentPublicInstance, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FastAmountItem } from '@/api/interface/withdraw'
import { usePresetGrid } from '@/components/deposit/shared/usePresetGrid'

const { t } = useI18n()

import type {
  AccountCardOption,
  PaymentMethodsOption
} from '@/components/paymentMethods/shared/usePaymentMethodsService'

interface Props {
  methodsOptions?: PaymentMethodsOption[]
  selectMethodsOption?: PaymentMethodsOption
  accountCardOption?: AccountCardOption
  hasSelectedReceiveAddress: boolean
  amount?: number
  quickAmounts?: FastAmountItem[]
  isWithdrawDisabled: boolean
  currencySymbol: string
  isRefreshingBalance: boolean
  formattedBalance: string
}
const props = defineProps<Props>()

const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const showExpandButton = computed(() => props.quickAmounts && props.quickAmounts.length > 6)
const amountModel = computed({
  get: () => props.amount,
  set: value => emit('update:amount', value)
})

const emit = defineEmits<{
  'update:amount': [value: number | undefined]
  methodTabClick: [value: PaymentMethodsOption]
  applyQuickAmount: [value: FastAmountItem]
  handleOpenAcountListPop: []
  refreshBalance: []
  beginSubmitWithdraw: []
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

const selectMethod = async (option: PaymentMethodsOption, index: number) => {
  emit('methodTabClick', option)
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

const applyQuickAmount = (value: FastAmountItem) => {
  emit('applyQuickAmount', value)
}

const doWithdrawDeposit = () => {
  if (props.isWithdrawDisabled) {
    return
  }
  emit('beginSubmitWithdraw')
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
