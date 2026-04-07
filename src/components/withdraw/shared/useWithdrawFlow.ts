import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { storeToRefs } from 'pinia'
import type { WithdrawOrderStatus, WithdrawSubmitPayload } from './types'
import { submitWithdrawWorkflow } from './withdrawWorkflow'
import { useUserStore } from '@/stores/user'

export const useWithdrawFlow = () => {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)
  const activePayload = ref<WithdrawSubmitPayload | null>(null)
  const kindReminderVisible = ref(false)
  const paymentPasswordVisible = ref(false)
  const smsVerificationVisible = ref(false)
  const withdrawOrderVisible = ref(false)
  const isSubmitting = ref(false)
  const orderStatus = ref<WithdrawOrderStatus>('processing')
  const orderNo = ref('')
  const createdAt = ref('')
  const orderAmountText = ref('')
  const orderMethodLabel = ref('')
  const pendingPaymentPassword = ref('')

  const shouldRequireKindReminder = computed(
    () => Number(userInfo.value?.checkTransactionPwd ?? 0) !== 1
  )

  const amount = computed(() => activePayload.value?.amount ?? 0)
  const currencyCode = computed(() => activePayload.value?.currencyCode || 'PHP')
  const maskedPhoneNumber = computed(() => {
    const areaCode = String(userInfo.value?.areaCode ?? '').trim()
    const telephone = String(userInfo.value?.telephone ?? '')
      .trim()
      .replace(/\D/g, '')

    if (!telephone) {
      return ''
    }

    if (telephone.length <= 4) {
      return `+${areaCode}-${telephone}`
    }

    const prefix = telephone.slice(0, 3)
    const suffix = telephone.slice(-4)

    return `+${areaCode}-${prefix}****${suffix}`
  })

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

  const handlePaymentPasswordConfirm = (password: string) => {
    pendingPaymentPassword.value = password
    paymentPasswordVisible.value = false
    smsVerificationVisible.value = true
  }

  const handleSmsVerificationConfirm = async (code: string) => {
    const payload = activePayload.value
    if (!payload || isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      const orderDetail = await submitWithdrawWorkflow({
        payload,
        verifyCode: code,
        modifyBy: pendingPaymentPassword.value
      })

      smsVerificationVisible.value = false
      orderNo.value = orderDetail.orderNo
      createdAt.value = orderDetail.createdAt
      orderStatus.value = orderDetail.status
      orderAmountText.value = orderDetail.amountText
      orderMethodLabel.value = orderDetail.methodLabel
      withdrawOrderVisible.value = true
      pendingPaymentPassword.value = ''
    } catch (error) {
      const messageKey = error instanceof Error ? error.message : 'withdraw.submit_failed'

      showToast({
        message: messageKey.startsWith('withdraw.') ? t(messageKey) : messageKey,
        type: 'fail'
      })
    } finally {
      isSubmitting.value = false
    }
  }

  const resetWithdrawFlow = () => {
    kindReminderVisible.value = false
    paymentPasswordVisible.value = false
    smsVerificationVisible.value = false
    withdrawOrderVisible.value = false
    pendingPaymentPassword.value = ''
  }

  const closeWithdrawOrder = () => {
    withdrawOrderVisible.value = false
  }

  return {
    kindReminderVisible,
    paymentPasswordVisible,
    smsVerificationVisible,
    withdrawOrderVisible,
    isSubmitting,
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
    handleSmsVerificationConfirm,
    closeWithdrawOrder,
    resetWithdrawFlow
  }
}
