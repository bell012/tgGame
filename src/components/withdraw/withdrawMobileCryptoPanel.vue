<template>
  <div class="w-full font-['Inter']">
    <div class="flex w-full gap-2">
      <div class="flex flex-1 gap-2 overflow-x-auto scrollbar-hide touch-pan-x">
        <button
          v-for="coin in visibleCoins"
          :key="coin.code"
          type="button"
          class="shrink-0 appearance-none py-2 px-2.5 rounded-full bg-bg-2 text-xs text-text-2 flex items-center justify-center border"
          :style="{
            border: `1px solid ${coin.code === coinCode ? 'var(--color-theme-level-1)' : 'transparent'}`
          }"
          :class="{
            'text-text-1 bg-theme-3': coin.code === coinCode
          }"
          @click.stop="selectCoinCode(coin.code)"
        >
          <img class="w-5 aspect-square mr-1" :src="coin.icon" />
          {{ coin.name }}
        </button>
      </div>
      <button
        type="button"
        class="shrink-0 appearance-none p-2 rounded-full bg-bg-2 text-xs flex items-center border"
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
      <div>
        <div
          class="flex items-center justify-between text-xs sm:text-sm font-normal leading-normal"
        >
          <span>{{ t('withdraw.receive_crypto') }}</span>
          <button
            v-if="hasSelectedReceiveAddress"
            type="button"
            class="flex items-center text-xs sm:text-sm text-text-2"
            @click="handleChangeReceiveAddress"
          >
            {{ t('withdraw.change') }}
            <ChevronRightSmallIcon class="ml-1 h-2 w-1" />
          </button>
        </div>
        <button
          v-if="!hasSelectedReceiveAddress"
          type="button"
          class="mt-2 flex h-[45px] w-full items-center justify-center rounded-lg border border-dashed border-theme-primary text-sm font-bold text-theme-primary"
          @click="openAddressList"
        >
          <AddPlusIcon class="mr-2 h-4 w-4 text-current" />
          {{ t('withdraw.add_address', { currency }) }}
        </button>
        <button
          v-else
          type="button"
          class="mt-2 flex w-full items-center rounded-lg bg-opacity-6 p-[14px] text-left"
          @click="handleChangeReceiveAddress"
        >
          <img
            v-if="typeof currencyOption?.icon === 'string'"
            :src="currencyOption.icon"
            class="mr-3 h-[25px] w-[25px] shrink-0 object-contain"
          />
          <div class="min-w-0 flex-1 text-sm font-semibold text-text-1">
            <p class="truncate">{{ selectedReceiveAddress?.address }}</p>
          </div>
        </button>
      </div>
      <div class="mt-5">
        <div class="text-xs font-normal leading-normal">{{ t('withdraw.amount') }}</div>
        <div
          class="mt-2 p-3 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <span class="mr-2 shrink-0 text-lg font-bold leading-none text-theme-primary">{{
            currencySymbol
          }}</span>
          <input
            type="number"
            v-model="amount"
            :placeholder="t('withdraw.amount_placeholder')"
            class="flex-1 min-w-0 text-base font-bold bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs placeholder:font-normal"
          />
          <div v-if="!isAmountDisabled && youGetAmount" class="ml-2 flex shrink-0 items-center">
            <p class="mr-1 whitespace-nowrap text-xs text-text-1">
              {{ t('withdraw.you_get') }} ≈ {{ youGetAmount }}
            </p>
            <img
              v-if="typeof currencyOption?.icon === 'string'"
              :src="currencyOption.icon"
              class="h-4 w-4 object-contain"
            />
          </div>
        </div>
        <div class="mt-3.5 flex items-center">
          <div class="text-xs font-normal leading-normal">
            {{ t('withdraw.balance') }}：<span class="text-theme-primary">{{
              formattedBalance
            }}</span>
          </div>
          <button
            type="button"
            class="ml-1 inline-flex items-center justify-center text-icon-2"
            @click="refreshBalance"
          >
            <RefreshIcon class="w-3.5" :class="{ 'animate-spin': isRefreshingBalance }" />
          </button>
        </div>
      </div>
      <div v-if="quickAmounts.length" class="mt-4 w-full relative">
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
      <div class="mt-5 p-2.5 rounded-lg bg-theme-3 flex items-start">
        <InfoIcon class="w-5 h-5 mr-1 shrink-0 text-theme-primary" />
        <div class="text-xs text-text-2 font-normal leading-normal">
          {{ t('withdraw.crypto_address_notice') }}
        </div>
      </div>
      <div class="mt-5 flex items-center">
        <AmountInfoIcon class="w-3.5 h-3.5 mr-1 text-icon-2" />
        <div class="text-xs text-text-2">{{ t('withdraw.crypto_help') }}</div>
      </div>
      <button
        class="mt-5 w-full h-10 flex items-center justify-center rounded-lg font-semibold text-text-4"
        :class="[!isWithdrawDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
        :disabled="isWithdrawDisabled"
        @click="doWithdrawDeposit"
      >
        {{ t('withdraw.withdraw_now') }}
      </button>

      <withdrawCryptoAddressListPop
        v-model="addressListVisible"
        :items="availableReceiveAddresses"
        :selected-id="selectedReceiveAddress?.id"
        :currency-code="currency"
        :icon="typeof currencyOption?.icon === 'string' ? currencyOption.icon : ''"
        :show-add-button="canAddAddress"
        @select="handleSelectReceiveAddress"
        @add="openAddAddress"
      />
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
  </div>
</template>
<script setup lang="ts">
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import BNBIcon from '@/static/img/crypto/BNB.png'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import RefreshIcon from '@/static/svg/refresh.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import { computed, ref } from 'vue'
import type { FastAmountItem } from '@/api/interface/withdraw'
import { usePresetGrid } from '@/components/deposit/shared/usePresetGrid'
import withdrawCryptoAddressListPop from './withdrawCryptoAddressListPop.vue'
import withdrawCryptoAddAddressPop from './withdrawCryptoAddAddressPop.vue'
import withdrawPaymentPasswordPop from './withdrawPaymentPasswordPop.vue'
import withdrawSmsVerificationPop from './withdrawSmsVerificationPop.vue'
import type { WithdrawSubmitPayload } from './shared/types'
import { useWithdrawCrypto } from './shared/useWithdrawCrypto'

const { t } = useI18n()
const unavailableMessage = 'Unavailable'
const {
  address,
  addressListVisible,
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
  handleChangeReceiveAddress,
  handleAddAddressPaymentPasswordConfirm,
  handleAddAddressSmsVerificationConfirm,
  handleAddAddressSmsVerificationResend,
  handleSelectReceiveAddress,
  hasSelectedReceiveAddress,
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
  openAddressList,
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

const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const showExpandButton = computed(() => quickAmounts.value.length > 3)

const emit = defineEmits<{
  submit: [payload: WithdrawSubmitPayload]
}>()

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
    channelId: 4,
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
