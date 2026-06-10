<template>
  <div class="flex-1 min-h-0">
    <div class="w-full shrink-0 flex bg-bg-2 dark:bg-bg-8 rounded-lg">
      <button
        v-for="tab in withdrawTabs"
        :key="tab.value"
        class="relative flex-1 text-sm py-3 font-bold transition-all duration-200 tab-button-new rounded-lg"
        :class="[
          selectWithdrawTab?.value === tab.value ? 'text-text-1 bg-bg-7' : 'text-text-2 bg-bg-8'
        ]"
        :disabled="isWithdrawPanelLoading"
        @click.stop="handleDesktopClickWithdrawTab(tab)"
      >
        <span>{{ tab.label }}</span>
      </button>
    </div>
    <div class="mt-4 w-full bg-bg-1 rounded-lg">
      <WithdrawPcCryptoSkeleton v-if="isWithdrawPanelLoading && isCryptoWithdrawTab" />
      <WithdrawPcFiatSkeleton v-else-if="isWithdrawPanelLoading" />
      <DesktopCryptoPanel
        v-else-if="selectWithdrawTab?.value === 'Crypto'"
        :methodsOptions="cryptoWithdrawMethodsOptions"
        :selectMethodsOption="selectPaymentMethodsOption"
        :accountCardOption="selectAccountCardOption"
        :account-card-options="accountCardOptions"
        :hasSelectedReceiveAddress="hasSelectedReceiveAddress"
        :amount="amount"
        :quickAmounts="quickAmounts"
        :isWithdrawDisabled="isWithdrawDisabled"
        :currencySymbol="currencySymbol"
        :isRefreshingBalance="isRefreshingBalance"
        :formattedBalance="formattedBalance"
        :youGetAmount="youGetAmount"
        :canAddAccount="canAddAccount"
        @methodTabClick="handleDesktopWithdrawMethodTabClick"
        @update:amount="amount = $event"
        @applyQuickAmount="applyQuickAmount"
        @refreshBalance="refreshBalance"
        @beginSubmitWithdraw="beginSubmitWithdraw"
        @openAddAcountCard="openAddAcountCard"
        @handleSelectedAccountOption="handleSelectedAccountOption"
        @modifyDefaultAccountCard="modifyDefaultAccountCard"
      />
      <DesktopFiatPanel
        v-else-if="selectWithdrawTab?.value === 'Fiat'"
        :methodsOptions="fiatPaymentMethodsOptions"
        :selectMethodsOption="selectPaymentMethodsOption"
        :accountCardOption="selectAccountCardOption"
        :account-card-options="accountCardOptions"
        :hasSelectedReceiveAddress="hasSelectedReceiveAddress"
        :amount="amount"
        :quickAmounts="quickAmounts"
        :isWithdrawDisabled="isWithdrawDisabled"
        :currencySymbol="currencySymbol"
        :isRefreshingBalance="isRefreshingBalance"
        :formattedBalance="formattedBalance"
        :youGetAmount="youGetAmount"
        :canAddAccount="canAddAccount"
        @methodTabClick="handleDesktopWithdrawMethodTabClick"
        @update:amount="amount = $event"
        @applyQuickAmount="applyQuickAmount"
        @refreshBalance="refreshBalance"
        @beginSubmitWithdraw="beginSubmitWithdraw"
        @openAddAcountCard="openAddAcountCard"
        @handleSelectedAccountOption="handleSelectedAccountOption"
        @modifyDefaultAccountCard="modifyDefaultAccountCard"
      />
    </div>
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
import { useWithdrawFlow } from '@/components/withdraw/shared/useWithdrawFlow'
import DesktopCryptoPanel from '@/components/withdraw/desktopCryptoPanel.vue'
import DesktopFiatPanel from '@/components/withdraw/desktopFiatPanel.vue'
import WithdrawPcCryptoSkeleton from './components/WithdrawPcCryptoSkeleton.vue'
import WithdrawPcFiatSkeleton from './components/WithdrawPcFiatSkeleton.vue'
import KindReminderPop from '@/components/paymentMethods/kindReminderPop.vue'
import AddAccountPop from '@/components/paymentMethods/addAccountPop.vue'
import AccountSmsVerificationPop from '@/components/paymentMethods/smsVerificationPop.vue'
import AccountPaymentPasswordPop from '@/components/paymentMethods/paymentPasswordPop.vue'
import orderPop from '@/components/withdraw/orderPop.vue'
import withdrawSmsVerificationPop from '@/components/withdraw/withdrawSmsVerificationPop.vue'
import withdrawPaymentPasswordPop from '@/components/withdraw/withdrawPaymentPasswordPop.vue'
import { computed, onMounted } from 'vue'
import type { PaymentMethodsOption } from '@/components/paymentMethods/shared/usePaymentMethodsService'
import type { WithdrawTab } from '@/components/withdraw/shared/useWithdrawFlow'

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
  modifyDefaultAccountCard,

  maskedPhoneNumber,
  hasLoadedWithdraw,
  withdrawTabs,
  selectWithdrawTab,
  cryptoWithdrawMethodsOptions,
  fiatPaymentMethodsOptions,
  selectPaymentMethodsOption,
  accountCardOptions,
  canAddAccount,
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

const handleDesktopClickWithdrawTab = (tab: WithdrawTab) => {
  handleClickWithdrawTab(tab)
}

const handleDesktopWithdrawMethodTabClick = (option: PaymentMethodsOption) => {
  handleWithdrawMethodTabClick(option)
}

onMounted(async () => {
  await cryptoInitialization()
})
</script>

<style scoped lang="scss"></style>
