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
    <div class="mt-6 grid grid-cols-2 gap-5">
      <div class="relative">
        <div class="text-sm font-bold leading-normal">{{ t('withdraw.withdraw_currency') }}</div>
        <CustomSelect
          class="mt-2 w-full"
          v-model="currency"
          :options="currencyOptions"
          disabled
          @disabled-click="showUnavailableToast"
        />
      </div>
      <div class="relative">
        <div class="text-sm font-bold leading-normal">{{ t('withdraw.select_network') }}</div>
        <CustomSelect
          class="mt-2 w-full"
          v-model="selectNetwork"
          :options="networkOptions"
          disabled
          @disabled-click="showUnavailableToast"
        />
      </div>
    </div>
    <div class="mt-6 grid grid-cols-2 gap-5">
      <div class="relative">
        <div class="flex items-center justify-between text-sm font-bold leading-normal">
          <span>{{ t('withdraw.receive_crypto') }}</span>
          <button
            v-if="hasSelectedReceiveAddress"
            type="button"
            class="flex items-center text-sm font-normal text-text-1"
            @click="handleChangeReceiveAddress"
          >
            {{ t('withdraw.change') }}
            <ChevronRightSmallIcon class="ml-1 h-2 w-1" />
          </button>
        </div>
        <div class="relative mt-2">
          <button
            v-if="!hasSelectedReceiveAddress && canAddAddress"
            type="button"
            class="flex h-12 w-full items-center justify-center rounded-lg border border-dashed border-theme-primary text-base font-bold text-theme-primary"
            @click="openAddressList"
          >
            <AddPlusIcon class="mr-2 h-4 w-4 text-current" />
            {{ t('withdraw.add_address', { currency: currency }) }}
          </button>
          <button
            v-else
            type="button"
            class="flex h-12 w-full items-center rounded-lg bg-opacity-6 p-3 text-left"
            @click="handleChangeReceiveAddress"
          >
            <img
              v-if="typeof currencyOption?.icon === 'string'"
              :src="currencyOption.icon"
              class="mr-2 h-6 w-6 shrink-0 object-contain"
            />
            <div class="min-w-0 flex-1 text-sm font-semibold text-text-1">
              <p class="truncate">{{ selectedReceiveAddress?.address }}</p>
            </div>
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
        </div>
        <div class="mt-2 flex items-center">
          <AmountInfoIcon class="w-4 h-4 mr-1" />
          <div class="text-sm text-text-2">{{ t('withdraw.crypto_help') }}</div>
        </div>
      </div>
      <div>
        <div class="text-sm font-bold leading-normal">{{ t('withdraw.amount') }}</div>
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
import { useI18n } from 'vue-i18n'
import DOGEIcon from '@/static/img/crypto/DOGE.png'
import TRXIcon from '@/static/img/crypto/TRX.png'
import BNBIcon from '@/static/img/crypto/BNB.png'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import CustomSelect from '@/components/common/CustomSelect.vue'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import RefreshIcon from '@/static/svg/refresh.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
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
  currencyOptions,
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
  refreshBalance,
  selectedReceiveAddress,
  selectCoinCode: applySelectCoinCode,
  selectNetwork,
  visibleCoins,
  confirmAddAddress
} = useWithdrawCrypto()

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
