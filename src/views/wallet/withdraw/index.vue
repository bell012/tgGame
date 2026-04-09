<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header
        :title="t('withdraw.title')"
        showSort
        :rightIcon="DetailsIcon"
        @sort="openWithdrawOrder"
      />
      <div class="flex-1 min-h-0">
        <withdrawMobile class="h-full" @submit="beginWithdrawFlow" />
      </div>
    </div>
    <WalletLayout v-else current-tab="withdraw">
      <div class="overflow-hidden">
        <withdrawDesktop @submit="beginWithdrawFlow" />
      </div>
    </WalletLayout>

    <withdrawKindReminderPop
      v-model="kindReminderVisible"
      @settings="handleKindReminderSettings"
      @skip="handleKindReminderSkip"
    />
    <withdrawPaymentPasswordPop
      v-model="paymentPasswordVisible"
      :amount="amount"
      :currency-code="currencyCode"
      :loading="isSubmitting"
      :show-amount-section="true"
      @confirm="handlePaymentPasswordConfirm"
    />
    <withdrawSmsVerificationPop
      v-model="smsVerificationVisible"
      :amount="amount"
      :currency-code="currencyCode"
      :phone-number="maskedPhoneNumber"
      :sending="isSendingSmsCode"
      :loading="isCheckingSmsCode || isSubmitting"
      :countdown-trigger="smsCountdownTrigger"
      :show-amount-section="true"
      @resend="handleSmsVerificationResend"
      @confirm="handleSmsVerificationConfirm"
    />
    <withdrawOrderPop
      v-model="withdrawOrderVisible"
      :status="orderStatus"
      :amount-text="resolvedOrderAmountText"
      :order-no="orderNo"
      :created-at="createdAt"
      :method-label="resolvedOrderMethodLabel"
      @close="closeWithdrawOrder"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import withdrawMobile from '@/components/withdraw/withdrawMobile.vue'
import withdrawDesktop from '@/components/withdraw/withdrawDesktop.vue'
import withdrawKindReminderPop from '@/components/withdraw/withdrawKindReminderPop.vue'
import withdrawPaymentPasswordPop from '@/components/withdraw/withdrawPaymentPasswordPop.vue'
import withdrawSmsVerificationPop from '@/components/withdraw/withdrawSmsVerificationPop.vue'
import withdrawOrderPop from '@/components/withdraw/withdrawOrderPop.vue'
import { useWithdrawFlow } from '@/components/withdraw/shared/useWithdrawFlow'
import WalletLayout from '../index.vue'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'

const { t } = useI18n()
const isMobile = useIsMobile()
const {
  kindReminderVisible,
  paymentPasswordVisible,
  smsVerificationVisible,
  withdrawOrderVisible,
  isSendingSmsCode,
  isCheckingSmsCode,
  isSubmitting,
  smsCountdownTrigger,
  amount,
  currencyCode,
  maskedPhoneNumber,
  activePayload,
  orderStatus,
  orderNo,
  createdAt,
  orderAmountText,
  orderMethodLabel,
  beginWithdrawFlow,
  handleKindReminderSkip,
  handleKindReminderSettings,
  handlePaymentPasswordConfirm,
  handleSmsVerificationResend,
  handleSmsVerificationConfirm,
  closeWithdrawOrder
} = useWithdrawFlow()

const fallbackOrderAmountText = computed(
  () => `${Number(amount.value || 0).toFixed(0)}${currencyCode.value}`
)
const fallbackOrderMethodLabel = computed(() => activePayload.value?.methodLabel || 'USDT')
const resolvedOrderAmountText = computed(
  () => orderAmountText.value || fallbackOrderAmountText.value
)
const resolvedOrderMethodLabel = computed(
  () => orderMethodLabel.value || fallbackOrderMethodLabel.value
)

const openWithdrawOrder = () => {
  if (!activePayload.value || !orderNo.value) {
    return
  }

  withdrawOrderVisible.value = true
}
</script>
<style scoped lang="scss"></style>
