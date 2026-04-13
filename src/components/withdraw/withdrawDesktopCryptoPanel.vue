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
          <button
            v-for="item in availableReceiveAddresses"
            :key="item.id"
            type="button"
            :data-address-card-id="item.id"
            class="relative flex h-[154px] w-[280px] shrink-0 flex-col justify-center rounded-xl border bg-transparent text-base font-bold text-common-100 transition-colors"
            :style="{
              border:
                selectedReceiveAddress?.id === item.id
                  ? '1px solid var(--color-theme-level-1)'
                  : '1px solid transparent'
            }"
            @click="handleReceiveAddressCardClick(item.id)"
          >
            <component
              :is="resolveCoinCardBackground(item.coinCode)"
              v-if="resolveCoinCardBackground(item.coinCode)"
              class="absolute left-0 top-0 h-full w-full"
            />
            <div v-else class="absolute left-0 top-0 h-full w-full rounded-xl bg-bg-4" />
            <div class="relative z-10 h-full w-full px-3 py-2">
              <div class="flex items-center">
                <img
                  class="mr-2 aspect-square w-[34px] rounded-full border border-common-100"
                  :src="item.icon || USDTIcon"
                />
                {{ currency }}
              </div>
              <div class="mt-4 flex items-center justify-between text-xs">
                <div>{{ t('withdraw.network_label') }}：</div>
                <div class="text-right font-bold capitalize">{{ item.network }}</div>
              </div>
              <div class="mt-2 flex items-start justify-between text-xs">
                <div class="mr-2 shrink-0">{{ t('withdraw.receiving_address_text') }}：</div>
                <div class="min-w-0 break-all text-right font-bold capitalize">
                  {{ item.address }}
                </div>
              </div>
              <div
                class="absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-xl bg-mask-20 px-3 py-2 text-xs"
              >
                <div>{{ t('withdraw.default_wallet') }}</div>
                <button
                  type="button"
                  class="flex h-4 w-[30px] items-center rounded-full p-px transition-colors duration-200"
                  :class="item.defaultCard === 1 ? 'bg-theme-primary' : 'bg-white/60'"
                  @click.stop="handleToggleReceiveAddressDefault(item.id)"
                >
                  <div
                    class="h-[14px] w-[14px] rounded-full bg-common-100 transition-transform duration-200"
                    :class="item.defaultCard === 1 ? 'translate-x-[14px]' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </button>
          <button
            v-if="canAddAddress"
            type="button"
            class="flex h-[154px] w-[280px] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-theme-primary text-base font-bold text-theme-primary"
            @click="openAddAddress"
          >
            <AddPlusIcon class="mb-3 h-4 w-4 text-current" />
            {{ t('withdraw.add_address', { currency: currency }) }}
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
          v-model="amount"
          :placeholder="t('withdraw.amount_placeholder')"
          class="min-w-0 flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
        />
        <div v-if="!isAmountDisabled && youGetAmount" class="ml-3 mr-2 flex shrink-0 items-center">
          <p class="mr-1 whitespace-nowrap text-xs text-text-1">
            {{ t('withdraw.you_get') }} ≈ {{ youGetAmount }}
          </p>
          <img
            v-if="typeof currencyOption?.icon === 'string'"
            :src="currencyOption.icon"
            class="h-4 w-4 object-contain"
          />
        </div>
        <button
          v-show="!isAmountDisabled"
          class="z-10 h-6 w-6 rounded-md bg-opacity-10 sm:flex items-center justify-center"
          @click="amount = undefined"
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
          @click="refreshBalance"
        >
          <RefreshIcon class="w-5" :class="{ 'animate-spin': isRefreshingBalance }" />
        </button>
      </div>
    </div>
    <div class="mt-4">
      <div v-if="quickAmounts.length" class="relative w-full">
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
    <withdrawCryptoAddAddressPop
      v-model="addAddressVisible"
      v-model:input-value="pendingAddress"
      v-model:network="selectNetwork"
      :currency-code="currency"
      :network-options="networkOptions"
      :icon="typeof currencyOption?.icon === 'string' ? currencyOption.icon : ''"
      @close="closeAddAddress"
      @confirm="confirmAddAddress"
    />
    <withdrawPaymentPasswordPop
      v-model="addAddressPaymentPasswordVisible"
      :amount="0"
      :currency-code="currency"
      :loading="isSubmittingAddAddress"
      :show-amount-section="false"
      :confirm-text="t('common.confirm')"
      :description-text="t('withdraw.verification_transaction_password')"
      @close="closeAddAddressPaymentPassword"
      @confirm="handleAddAddressPaymentPasswordConfirm"
    />
    <withdrawSmsVerificationPop
      v-model="addAddressSmsVerificationVisible"
      :amount="0"
      :currency-code="currency"
      :phone-number="maskedPhoneNumber"
      :sending="isSendingAddAddressSmsCode"
      :loading="isCheckingAddAddressSmsCode || isSubmittingAddAddress"
      :countdown-trigger="addAddressSmsCountdownTrigger"
      :show-amount-section="false"
      :confirm-text="t('common.confirm')"
      @close="closeAddAddressSmsVerification"
      @resend="handleAddAddressSmsVerificationResend"
      @confirm="handleAddAddressSmsVerificationConfirm"
    />
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
import USDTIcon from '@/static/img/crypto/USDT.png'
import USDTCardIcon from '@/static/svg/withdraw/USDT_card.svg?component'
import withdrawCryptoAddAddressPop from './withdrawCryptoAddAddressPop.vue'
import withdrawPaymentPasswordPop from './withdrawPaymentPasswordPop.vue'
import withdrawSmsVerificationPop from './withdrawSmsVerificationPop.vue'
import type { FastAmountItem } from '@/api/interface/withdraw'
import { usePresetGrid } from '@/components/deposit/shared/usePresetGrid'
import type { WithdrawSubmitPayload } from './shared/types'
import { useWithdrawCrypto } from './shared/useWithdrawCrypto'

const { t } = useI18n()
const unavailableMessage = 'Unavailable'
const {
  address,
  amount,
  applyQuickAmount,
  addAddressPaymentPasswordVisible,
  addAddressSmsVerificationVisible,
  addAddressSmsCountdownTrigger,
  balanceAmount,
  availableReceiveAddresses,
  addAddressVisible,
  canAddAddress,
  coinCode,
  coinMoreShow,
  currency,
  currencyOption,
  currencySymbol,
  closeAddAddress,
  closeAddAddressPaymentPassword,
  closeAddAddressSmsVerification,
  currentCurrency,
  handleAddAddressPaymentPasswordConfirm,
  handleAddAddressSmsVerificationConfirm,
  handleAddAddressSmsVerificationResend,
  handleSelectReceiveAddress,
  handleToggleReceiveAddressDefault,
  formattedBalance,
  isCheckingAddAddressSmsCode,
  isAmountDisabled,
  isRefreshingBalance,
  isSendingAddAddressSmsCode,
  isSubmittingAddAddress,
  isWithdrawDisabled,
  maskedPhoneNumber,
  matchedWithdrawMethod,
  networkOptions,
  openAddAddress,
  pendingAddress,
  quickAmounts,
  refreshBalance,
  selectedReceiveAddress,
  selectCoinCode: applySelectCoinCode,
  selectNetwork,
  youGetAmount,
  visibleCoins,
  confirmAddAddress
} = useWithdrawCrypto()

const emit = defineEmits<{
  submit: [payload: WithdrawSubmitPayload]
}>()

const addressCardsRef = ref<HTMLDivElement | null>(null)
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const showExpandButton = computed(() => quickAmounts.value.length > 6)

const showUnavailableToast = () => {
  showToast({
    message: unavailableMessage,
    type: 'fail'
  })
}

const selectCoinCode = (code: string) => {
  if (!applySelectCoinCode(code)) {
    showUnavailableToast()
  }
}

const openCoinMorePanel = () => {
  showUnavailableToast()
  return
}

const resolveCoinCardBackground = (code: string) => {
  if (code === 'USDT') {
    return USDTCardIcon
  }

  return null
}

const handleAddressCardsWheel = (event: WheelEvent) => {
  const container = addressCardsRef.value

  if (!container) {
    return
  }

  container.scrollLeft += event.deltaY
}

const handleReceiveAddressCardClick = async (id: string) => {
  handleSelectReceiveAddress(id)
  await nextTick()

  const container = addressCardsRef.value
  const target = container?.querySelector<HTMLElement>(`[data-address-card-id="${id}"]`)

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
  if (isWithdrawDisabled.value) {
    return
  }

  emit('submit', {
    tabType: 'Crypto',
    amount: Number(amount.value),
    balanceAmount: balanceAmount.value,
    channelId: 3,
    currencyCode: currentCurrency.value,
    methodLabel: currency.value,
    methodIcon:
      selectedReceiveAddress.value?.icon ||
      (typeof currencyOption.value?.icon === 'string' ? currencyOption.value.icon : ''),
    paymentCode: matchedWithdrawMethod.value?.paymentCode,
    accountRowId: selectedReceiveAddress.value?.id,
    address: address.value,
    network: selectNetwork.value
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
