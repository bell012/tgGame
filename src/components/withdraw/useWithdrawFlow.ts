import { computed, ref } from 'vue'
import type { WithdrawOrderStatus, WithdrawSubmitPayload } from './types'

const createOrderNo = () => `ts${Date.now()}`

const createCreatedAt = () => {
  return new Date().toLocaleString('en-US')
}

export const useWithdrawFlow = () => {
  const activePayload = ref<WithdrawSubmitPayload | null>(null)
  const kindReminderVisible = ref(false)
  const paymentPasswordVisible = ref(false)
  const smsVerificationVisible = ref(false)
  const withdrawOrderVisible = ref(false)
  const orderStatus = ref<WithdrawOrderStatus>('processing')
  const orderNo = ref('')
  const createdAt = ref('')

  const shouldRequireKindReminder = ref(true)

  const amount = computed(() => activePayload.value?.amount ?? 0)
  const currencyCode = computed(() => activePayload.value?.currencyCode || 'PHP')
  const maskedPhoneNumber = computed(() => activePayload.value?.phoneNumber || '+63-999****9999')

  const beginWithdrawFlow = (payload: WithdrawSubmitPayload) => {
    activePayload.value = payload

    if (shouldRequireKindReminder.value) {
      kindReminderVisible.value = true
      return
    }

    paymentPasswordVisible.value = true
  }

  const handleKindReminderSkip = () => {
    paymentPasswordVisible.value = true
  }

  const handleKindReminderSettings = () => {
    window.dispatchEvent(new CustomEvent('withdraw-open-settings'))
  }

  const handlePaymentPasswordConfirm = () => {
    paymentPasswordVisible.value = false
    smsVerificationVisible.value = true
  }

  const handleSmsVerificationConfirm = () => {
    smsVerificationVisible.value = false

    const payload = activePayload.value
    if (!payload) {
      return
    }

    orderNo.value = createOrderNo()
    createdAt.value = createCreatedAt()
    orderStatus.value = 'processing'
    withdrawOrderVisible.value = true
  }

  const resetWithdrawFlow = () => {
    kindReminderVisible.value = false
    paymentPasswordVisible.value = false
    smsVerificationVisible.value = false
    withdrawOrderVisible.value = false
  }

  const closeWithdrawOrder = () => {
    withdrawOrderVisible.value = false
  }

  return {
    kindReminderVisible,
    paymentPasswordVisible,
    smsVerificationVisible,
    withdrawOrderVisible,
    amount,
    currencyCode,
    maskedPhoneNumber,
    activePayload,
    orderStatus,
    orderNo,
    createdAt,
    beginWithdrawFlow,
    handleKindReminderSkip,
    handleKindReminderSettings,
    handlePaymentPasswordConfirm,
    handleSmsVerificationConfirm,
    closeWithdrawOrder,
    resetWithdrawFlow
  }
}
