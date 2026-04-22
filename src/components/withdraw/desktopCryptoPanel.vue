<template>
  <div class="w-full bg-bg-2 p-6 rounded-lg font-['Inter']">
    <div class="w-full flex">
      <div v-if="methodsOptions" class="flex gap-4 flex-1">
        <button
          v-for="(coin, index) in methodsOptions"
          :key="index"
          type="button"
          class="appearance-none py-2 px-6 rounded-full bg-bg-3 lg:hover:bg-theme-3 text-sm text-text-2 flex items-center border"
          :style="{
            border: `1px solid ${selectMethodsOption?.label === coin.label ? 'var(--color-theme-level-1)' : 'transparent'}`
          }"
          :class="{
            'text-theme-primary': selectMethodsOption?.label === coin.label
          }"
          @click.stop="selectCoinCode(coin)"
        >
          <img class="w-5 aspect-square mr-1" :src="coin.customIcon" />
          {{ coin.label }}
        </button>
      </div>
      <button
        type="button"
        class="appearance-none p-1.5 sm:p-2 rounded-full bg-bg-3 lg:hover:bg-[var(--color-theme-level-3)] text-xs flex items-center border"
        :style="{
          border: `1px solid transparent`
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
    <div class="mt-6 flex items-start justify-between">
      <div class="w-full">
        <div class="flex items-center justify-between text-sm leading-normal">
          <span class="font-bold">{{ t('withdraw.receive_crypto') }}</span>
          <div class="flex items-center text-text-2">
            <AmountInfoIcon class="mr-1 h-4 w-4 shrink-0" />
            <span>{{ t('withdraw.crypto_help') }}</span>
          </div>
        </div>
        <div
          ref="addressCardsRef"
          class="mt-2 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide touch-pan-x scroll-smooth"
          @wheel.prevent="handleAddressCardsWheel"
        >
          <template v-if="accountCardOptions">
            <AccountCard
              v-for="item in accountCardOptions"
              :key="item.rowId"
              :data-address-card-id="item.rowId"
              :option="item"
              :is-active="accountCardOption?.rowId === item.rowId"
              :enableDelete="false"
              :showDelete="false"
              @set-default="handleModifyDefaultAccountCard"
              @select="handleReceiveAddressCardClick"
            />
          </template>
          <button
            v-if="canAddAccount"
            type="button"
            class="flex h-[154px] w-[280px] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-theme-primary text-base font-bold text-theme-primary"
            @click="emit('openAddAcountCard')"
          >
            <AddPlusIcon class="mb-3 h-4 w-4 text-current" />
            {{ t('withdraw.add_address', { currency: accountCardOption?.label }) }}
          </button>
        </div>
      </div>
    </div>
    <div class="mt-6">
      <div class="text-sm font-bold leading-normal">{{ t('withdraw.amount') }}</div>
      <div
        class="mt-2 flex w-full items-center rounded-lg border border-opacity-10 bg-input-3 p-3 focus-within:border-theme-primary focus-within:ring-0"
      >
        <span class="mr-3 text-xl font-bold leading-none text-theme-primary">{{
          currencySymbol
        }}</span>
        <input
          type="number"
          v-model="amountModel"
          :placeholder="t('withdraw.amount_placeholder')"
          class="min-w-0 flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
        />
        <div v-if="amountModel && youGetAmount" class="ml-3 mr-2 flex shrink-0 items-center">
          <p class="mr-1 whitespace-nowrap text-xs text-text-1">
            {{ t('withdraw.you_get') }} ≈ {{ youGetAmount }}
          </p>
          <div class="h-4 w-4">
            <gameRemoteImg
              v-if="selectMethodsOption?.customRoundIcon"
              :img="{
                src: selectMethodsOption?.customRoundIcon,
                maintain: false,
                fit: 'contain'
              }"
              class="h-full w-full"
              :alt="selectMethodsOption?.label"
            />
          </div>
        </div>
        <button
          v-show="amountModel"
          class="z-10 h-6 w-6 rounded-md bg-opacity-10 sm:flex items-center justify-center"
          @click="undefinedAmount"
        >
          <CloseIcon class="w-4 h-4" />
        </button>
      </div>
      <div class="mt-2 flex items-center">
        <div class="text-sm font-bold leading-normal">
          {{ t('withdraw.balance') }}：<span class="text-theme-primary">{{
            formattedBalance
          }}</span>
        </div>
        <button
          type="button"
          class="ml-1 inline-flex items-center justify-center text-icon-2"
          @click="emit('refreshBalance')"
        >
          <RefreshIcon class="w-5" :class="{ 'animate-spin': isRefreshingBalance }" />
        </button>
      </div>
    </div>
    <div class="mt-4">
      <div v-if="quickAmounts && quickAmounts.length > 0" class="relative w-full">
        <div
          ref="presetsRef"
          class="grid grid-cols-6 gap-2 rounded-tl-lg rounded-tr-lg bg-bg-4 p-2 transition-all duration-300"
          :class="{
            'max-h-64 overflow-y-auto': expanded,
            'max-h-[104px] overflow-hidden': !expanded,
            'rounded-tl-lg rounded-tr-lg': showExpandButton,
            'rounded-lg': !showExpandButton
          }"
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
    <div class="mt-6 p-3 rounded-lg bg-theme-3 flex items-start">
      <InfoIcon class="w-4 h-4 mr-1 shrink-0 text-theme-primary" />
      <div class="text-xs text-text-2 font-normal leading-normal">
        {{ t('withdraw.crypto_address_notice') }}
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
import { showToast } from 'vant'
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import BNBIcon from '@/static/img/crypto/BNB.png'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import RefreshIcon from '@/static/svg/refresh.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import AccountCard from '@/components/paymentMethods/accountCard.vue'
import type { FastAmountItem } from '@/api/interface/withdraw'
import { usePresetGrid } from '@/components/deposit/shared/usePresetGrid'
import type {
  AccountCardOption,
  PaymentMethodsOption
} from '@/components/paymentMethods/shared/usePaymentMethodsService'

interface Props {
  methodsOptions?: PaymentMethodsOption[]
  selectMethodsOption?: PaymentMethodsOption
  accountCardOption?: AccountCardOption
  accountCardOptions?: AccountCardOption[]
  hasSelectedReceiveAddress: boolean
  amount?: number
  quickAmounts?: FastAmountItem[]
  isWithdrawDisabled: boolean
  currencySymbol: string
  isRefreshingBalance: boolean
  formattedBalance: string
  youGetAmount: string
  canAddAccount?: boolean
}
const props = defineProps<Props>()

const { t } = useI18n()
const unavailableMessage = 'Unavailable'

const emit = defineEmits<{
  'update:amount': [value: number | undefined]
  methodTabClick: [value: PaymentMethodsOption]
  applyQuickAmount: [value: FastAmountItem]
  handleOpenAcountListPop: []
  refreshBalance: []
  beginSubmitWithdraw: []
  openAddAcountCard: []
  handleSelectedAccountOption: [value: AccountCardOption]
  modifyDefaultAccountCard: [value: AccountCardOption]
}>()

const addressCardsRef = ref<HTMLDivElement | null>(null)
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const showExpandButton = computed(() => props.quickAmounts && props.quickAmounts.length > 12)
const amountModel = computed({
  get: () => props.amount,
  set: value => emit('update:amount', value)
})

const showUnavailableToast = () => {
  showToast({
    message: unavailableMessage,
    type: 'fail'
  })
}

const selectCoinCode = (option: PaymentMethodsOption) => {
  if (option.label !== 'USDT') {
    showUnavailableToast()
    return
  }
  emit('methodTabClick', option)
}

const openCoinMorePanel = () => {
  showUnavailableToast()
  return
}

const applyQuickAmount = (value: FastAmountItem) => {
  emit('applyQuickAmount', value)
}

const handleAddressCardsWheel = (event: WheelEvent) => {
  const container = addressCardsRef.value

  if (!container) {
    return
  }

  container.scrollLeft += event.deltaY
}

const handleReceiveAddressCardClick = async (option: AccountCardOption) => {
  emit('handleSelectedAccountOption', option)
  await nextTick()

  const container = addressCardsRef.value
  const target = container?.querySelector<HTMLElement>(`[data-address-card-id="${option.rowId}"]`)

  target?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

const formatQuickAmount = (value: FastAmountItem['amount']) => {
  const amountValue = Number(value ?? 0)

  if (!Number.isFinite(amountValue)) {
    return '--'
  }

  return String(amountValue)
}

const doWithdrawDeposit = () => {
  if (props.isWithdrawDisabled) {
    return
  }
  emit('beginSubmitWithdraw')
}

const undefinedAmount = () => {
  amountModel.value = undefined
}

const handleModifyDefaultAccountCard = (option: AccountCardOption) => {
  emit('modifyDefaultAccountCard', option)
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
