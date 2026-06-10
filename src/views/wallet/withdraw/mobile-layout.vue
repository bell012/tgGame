<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="w-full shrink-0 flex flex-col bg-bg-2">
      <div class="flex bg-bg-2 dark:bg-bg-8">
        <button
          v-for="tab in withdrawTabs"
          :key="tab.value"
          class="relative flex-1 text-sm sm:text-base font-[800] transition-all duration-200 tab-button-new"
          :class="[
            selectWithdrawTab?.value === tab.value ? 'text-text-1 pb-1.5' : 'text-text-2 pb-1.5'
          ]"
          :disabled="isWithdrawPanelLoading"
          @click.stop="handleClickWithdrawTab(tab)"
        >
          <span>{{ tab.label }}</span>
          <div
            v-if="selectWithdrawTab?.value === tab.value"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
          ></div>
        </button>
      </div>
    </div>
    <div class="w-full flex-1 min-h-0 overflow-y-auto overscroll-contain bg-bg-1 p-3.5">
      <WithdrawMobileCryptoSkeleton v-if="isWithdrawPanelLoading && isCryptoWithdrawTab" />
      <WithdrawMobileFiatSkeleton v-else-if="isWithdrawPanelLoading" />
      <MobileCryptoPanel
        v-else-if="selectWithdrawTab?.value === 'Crypto'"
        :methodsOptions="cryptoWithdrawMethodsOptions"
        :selectMethodsOption="selectPaymentMethodsOption"
        :accountCardOption="selectAccountCardOption"
        :hasSelectedReceiveAddress="hasSelectedReceiveAddress"
        :amount="amount"
        :quickAmounts="quickAmounts"
        :isWithdrawDisabled="isWithdrawDisabled"
        :currencySymbol="currencySymbol"
        :isRefreshingBalance="isRefreshingBalance"
        :formattedBalance="formattedBalance"
        :youGetAmount="youGetAmount"
        @methodTabClick="handleWithdrawMethodTabClick"
        @update:amount="amount = $event"
        @applyQuickAmount="applyQuickAmount"
        @handleOpenAcountListPop="openAcountListPop"
        @refreshBalance="refreshBalance"
        @beginSubmitWithdraw="beginSubmitWithdraw"
      />
      <MobileFiatPanel
        v-else-if="selectWithdrawTab?.value === 'Fiat'"
        :methodsOptions="fiatPaymentMethodsOptions"
        :selectMethodsOption="selectPaymentMethodsOption"
        :accountCardOption="selectAccountCardOption"
        :hasSelectedReceiveAddress="hasSelectedReceiveAddress"
        :amount="amount"
        :quickAmounts="quickAmounts"
        :isWithdrawDisabled="isWithdrawDisabled"
        :currencySymbol="currencySymbol"
        :isRefreshingBalance="isRefreshingBalance"
        :formattedBalance="formattedBalance"
        @methodTabClick="handleWithdrawMethodTabClick"
        @update:amount="amount = $event"
        @applyQuickAmount="applyQuickAmount"
        @handleOpenAcountListPop="openAcountListPop"
        @refreshBalance="refreshBalance"
        @beginSubmitWithdraw="beginSubmitWithdraw"
      />
    </div>
    <mobileAccountListPop
      v-model="accountListPopVisible"
      :title="
        selectPaymentMethodsOption?.kind == 'crypto'
          ? t('withdraw.address_list_title', { currency: selectPaymentMethodsOption.label })
          : t('withdraw.e_wallet_title')
      "
      :addLabel="
        selectPaymentMethodsOption?.kind == 'crypto'
          ? t('withdraw.address_list_title', { currency: selectPaymentMethodsOption.label })
          : t('withdraw.e_wallet_title')
      "
      :accountOptions="accountCardOptions"
      :selectedAccountOption="selectAccountCardOption"
      :canAddAccount="canAddAccount"
      @close="closeAcountListPop"
      @openAddAcountCard="openAddAcountCard"
      @handleSelectedAccountOption="handleSelectedAccountOption"
    />
    <KindReminderPop
      v-model="kindReminderVisible"
      @settings="handleKindReminderSettings"
      @skip="handleKindReminderSkid"
      @close="handleKindReminderSkid"
    />
    <AddAccountPop
      v-model="addAccountOptionVisible"
      :option="selectPaymentMethodsOption"
      @close="closeAddAcountCard"
      @confirm="addAcountCard"
    />
    <AccountSmsVerificationPop
      v-model="smsVerificationVisible"
      :phone-number="maskedPhoneNumber"
      :sending="isSendingSmsCode"
      :loading="isCheckingSmsCode || isSubmittingAdd"
      :countdown-trigger="smsCountdownTrigger"
      @close="closeSmsVerification"
      @resend="handleAddAccountOptionSmsVerificationResend"
      @confirm="handleAddAccountOptionSmsVerificationConfirm"
    />
    <AccountPaymentPasswordPop
      v-model="paymentPasswordVisible"
      :loading="isCheckingPaymentPassword || isSubmittingAdd"
      @close="closePaymentPasswordVerification"
      @confirm="handleAddAccountOptionPaymentPasswordVerificationConfirm"
    />
    <orderPop
      v-model="withdrawOrderVisible"
      :orderItem="withdrawOrder"
      @close="closeWithdrawOrder"
    />
    <withdrawPaymentPasswordPop
      v-model="withdrawPaymentPasswordVisible"
      :amount="amount ?? 0"
      :currency-code="resolvedCurrency"
      :loading="isWithdrawSubmitting"
      :show-amount-section="true"
      @confirm="handleWithdrawPaymentPasswordVerificationConfirm"
      @close="closeWithdrawPaymentPasswordVerification"
    />
    <withdrawSmsVerificationPop
      v-model="withdrawSmsVerificationVisible"
      :amount="amount ?? 0"
      :currency-code="resolvedCurrency"
      :phone-number="maskedPhoneNumber"
      :sending="isWithdrawSendingSmsCode"
      :loading="isWithdrawCheckingSmsCode || isWithdrawSubmitting"
      :countdown-trigger="withdrawSmsCountdownTrigger"
      :show-amount-section="true"
      @resend="handleSmsVerificationResend"
      @confirm="handleWithdrawSmsVerificationConfirm"
      @close="closeWithdrawSmsVerification"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useWithdrawFlow } from '@/components/withdraw/shared/useWithdrawFlow'
import MobileCryptoPanel from '@/components/withdraw/mobileCryptoPanel.vue'
import MobileFiatPanel from '@/components/withdraw/mobileFiatPanel.vue'
import mobileAccountListPop from '@/components/withdraw/mobileAccountListPop.vue'
import KindReminderPop from '@/components/paymentMethods/kindReminderPop.vue'
import AddAccountPop from '@/components/paymentMethods/addAccountPop.vue'
import AccountSmsVerificationPop from '@/components/paymentMethods/smsVerificationPop.vue'
import AccountPaymentPasswordPop from '@/components/paymentMethods/paymentPasswordPop.vue'
import orderPop from '@/components/withdraw/orderPop.vue'
import withdrawSmsVerificationPop from '@/components/withdraw/withdrawSmsVerificationPop.vue'
import withdrawPaymentPasswordPop from '@/components/withdraw/withdrawPaymentPasswordPop.vue'
import WithdrawMobileCryptoSkeleton from './components/WithdrawMobileCryptoSkeleton.vue'
import WithdrawMobileFiatSkeleton from './components/WithdrawMobileFiatSkeleton.vue'

import { computed, onMounted } from 'vue'

const { t } = useI18n()

const {
  smsCountdownTrigger,
  isSubmittingAdd,
  isCheckingSmsCode,
  isSendingSmsCode,
  isCheckingPaymentPassword,
  smsVerificationVisible,
  paymentPasswordVisible,
  addAccountOptionVisible,
  closeAddAcountCard,
  addAcountCard,
  closeSmsVerification,
  handleAddAccountOptionSmsVerificationResend,
  handleAddAccountOptionSmsVerificationConfirm,
  closePaymentPasswordVerification,
  handleAddAccountOptionPaymentPasswordVerificationConfirm,

  maskedPhoneNumber,
  hasLoadedWithdraw,
  withdrawTabs,
  selectWithdrawTab,
  cryptoWithdrawMethodsOptions,
  fiatPaymentMethodsOptions,
  selectPaymentMethodsOption,
  accountCardOptions,
  canAddAccount,
  accountListPopVisible,
  kindReminderVisible,
  selectAccountCardOption,
  hasSelectedReceiveAddress,
  amount,
  quickAmounts,
  isWithdrawDisabled,
  currencySymbol,
  isRefreshingBalance,
  formattedBalance,
  youGetAmount,
  withdrawOrderVisible,
  withdrawOrder,
  withdrawPaymentPasswordVisible,
  withdrawSmsVerificationVisible,
  isWithdrawSendingSmsCode,
  isWithdrawCheckingSmsCode,
  isWithdrawSubmitting,
  withdrawSmsCountdownTrigger,
  resolvedCurrency,
  handleClickWithdrawTab,
  handleWithdrawMethodTabClick,
  openAcountListPop,
  closeAcountListPop,
  openAddAcountCard,
  handleSelectedAccountOption,
  applyQuickAmount,
  refreshBalance,
  handleKindReminderSettings,
  handleKindReminderSkid,
  closeWithdrawOrder,
  handleSmsVerificationResend,
  handleWithdrawSmsVerificationConfirm,
  handleWithdrawPaymentPasswordVerificationConfirm,
  closeWithdrawSmsVerification,
  closeWithdrawPaymentPasswordVerification,
  beginSubmitWithdraw,
  cryptoInitialization
} = useWithdrawFlow()

const isWithdrawPanelLoading = computed(() => !hasLoadedWithdraw.value)

const isCryptoWithdrawTab = computed(() => selectWithdrawTab.value?.value !== 'Fiat')

onMounted(async () => {
  await cryptoInitialization()
})
</script>

<style scoped lang="scss"></style>
