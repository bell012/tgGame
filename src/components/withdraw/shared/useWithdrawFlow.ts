import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import { showToast } from 'vant'
import { storeToRefs } from 'pinia'
import type { WithdrawOrderStatus, WithdrawSubmitPayload } from './types'
import { submitWithdrawWorkflow } from './withdrawWorkflow'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'

export const useWithdrawFlow = () => {
  const FAIL_TOAST_DURATION = 3000
  const { t } = useI18n()
  const userStore = useUserStore()
  const siteConfigStore = useSiteConfigStore()
  const { userInfo } = storeToRefs(userStore)
  const activePayload = ref<WithdrawSubmitPayload | null>(null)
  const kindReminderVisible = ref(false)
  const paymentPasswordVisible = ref(false)
  const smsVerificationVisible = ref(false)
  const withdrawOrderVisible = ref(false)
  const isSendingSmsCode = ref(false)
  const isCheckingSmsCode = ref(false)
  const isSubmitting = ref(false)
  const smsCountdownTrigger = ref(0)
  const orderStatus = ref<WithdrawOrderStatus>('processing')
  const orderNo = ref('')
  const createdAt = ref('')
  const orderAmountText = ref('')
  const orderMethodLabel = ref('')
  const pendingPaymentPassword = ref('')

  const shouldRequireKindReminder = computed(
    () => Number(userInfo.value?.checkTransactionPwd ?? 0) !== 1
  )
  const withdrawVerifyWay = computed(() =>
    String(
      (
        siteConfigStore.config as
          | {
              baseSiteConfig?: {
                isWithdrawalPasswordRequired?: string | number
              }
            }
          | null
          | undefined
      )?.baseSiteConfig?.isWithdrawalPasswordRequired ?? ''
    ).trim()
  )
  const needWithdrawBusiPwd = computed(() => withdrawVerifyWay.value === '1')
  const needWithdrawTelephoneSms = computed(() => withdrawVerifyWay.value === '2')

  const amount = computed(() => activePayload.value?.amount ?? 0)
  const currencyCode = computed(() => activePayload.value?.currencyCode || 'PHP')
  const resolvedAreaCode = computed(() => String(userInfo.value?.areaCode ?? '').trim())
  const resolvedTelephone = computed(() =>
    String(userInfo.value?.telephone ?? '')
      .trim()
      .replace(/\D/g, '')
  )
  const maskedPhoneNumber = computed(() => {
    const areaCode = resolvedAreaCode.value
    const telephone = resolvedTelephone.value

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

  const finalizeWithdrawSubmit = async (verifyCode?: string) => {
    const payload = activePayload.value

    if (!payload || isSubmitting.value || isCheckingSmsCode.value) {
      return
    }

    try {
      isSubmitting.value = true
      const orderDetail = await submitWithdrawWorkflow({
        payload,
        verifyCode,
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
        type: 'fail',
        duration: FAIL_TOAST_DURATION
      })
    } finally {
      isSubmitting.value = false
    }
  }

  const beginWithdrawFlow = async (payload: WithdrawSubmitPayload) => {
    activePayload.value = payload

    if (payload.tabType === 'Crypto') {
      await finalizeWithdrawSubmit()
      return
    }

    await siteConfigStore.initSiteConfig()

    if (needWithdrawBusiPwd.value && shouldRequireKindReminder.value) {
      kindReminderVisible.value = true
      return
    }

    if (needWithdrawBusiPwd.value) {
      paymentPasswordVisible.value = true
      return
    }

    if (needWithdrawTelephoneSms.value) {
      smsVerificationVisible.value = true
      return
    }

    await finalizeWithdrawSubmit()
  }

  const handleKindReminderSkip = () => {
    if (!needWithdrawBusiPwd.value) {
      return
    }

    paymentPasswordVisible.value = true
  }

  const handleKindReminderSettings = () => {
    window.dispatchEvent(new CustomEvent('withdraw-open-settings'))
  }

  const handlePaymentPasswordConfirm = (password: string) => {
    pendingPaymentPassword.value = password
    paymentPasswordVisible.value = false

    if (needWithdrawTelephoneSms.value) {
      smsVerificationVisible.value = true
      return
    }

    void finalizeWithdrawSubmit()
  }

  const sendSmsCode = async () => {
    if (isSendingSmsCode.value) {
      return false
    }

    if (!resolvedTelephone.value) {
      showToast({
        message: t('common.phoneNumberUnavailable'),
        type: 'fail',
        duration: FAIL_TOAST_DURATION
      })
      return false
    }

    try {
      isSendingSmsCode.value = true
      const response = await Api.auth.sendSms({
        telephone: resolvedTelephone.value,
        areaCode: resolvedAreaCode.value
      })

      if (response?.message) {
        showToast({
          message: response.message,
          type: response?.code === 'C2' ? 'success' : 'fail'
        })
      }

      if (response?.code === 'C2') {
        smsCountdownTrigger.value += 1
        return true
      }

      return false
    } finally {
      isSendingSmsCode.value = false
    }
  }

  const handleSmsVerificationResend = async () => {
    await sendSmsCode()
  }

  const handleSmsVerificationConfirm = async (code: string) => {
    if (isSubmitting.value || isCheckingSmsCode.value) {
      return
    }

    try {
      isCheckingSmsCode.value = true
      const checkResponse = await Api.auth.checkSms({
        telephone: resolvedTelephone.value,
        areaCode: resolvedAreaCode.value,
        smsCode: code
      })

      if (checkResponse?.code !== 'C2') {
        showToast({
          message: checkResponse?.message || t('withdraw.sms_code_invalid'),
          type: 'fail',
          duration: FAIL_TOAST_DURATION
        })
        return
      }

      await finalizeWithdrawSubmit(code)
    } finally {
      isCheckingSmsCode.value = false
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

  watch(smsVerificationVisible, value => {
    if (!value) {
      return
    }

    void sendSmsCode()
  })

  return {
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
    closeWithdrawOrder,
    resetWithdrawFlow
  }
}
