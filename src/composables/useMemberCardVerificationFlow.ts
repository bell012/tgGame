import Api from '@/api'
import type { AddMemberCardForm } from '@/api/interface/withdraw'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import { computed, ref } from 'vue'

interface UseMemberCardVerificationFlowOptions<T> {
  buildRequestData: (data: T, verifyCode?: string) => AddMemberCardForm | null
  submitRequest: (requestData: AddMemberCardForm) => Promise<boolean>
  onRequireTransactionPassword?: () => void
  onSubmitted?: () => void | Promise<void>
  onSubmitFailed?: () => void | Promise<void>
}

type BeginSubmitResult = 'blocked' | 'password' | 'sms' | 'submitted' | 'failed'

export function useMemberCardVerificationFlow<T>(options: UseMemberCardVerificationFlowOptions<T>) {
  const siteConfigStore = useSiteConfigStore()
  const userStore = useUserStore()
  const pendingData = ref<T | null>(null)
  const isSendingSmsCode = ref(false)
  const isCheckingSmsCode = ref(false)
  const isCheckingPaymentPassword = ref(false)
  const isSubmitting = ref(false)
  const paymentPasswordVisible = ref(false)
  const smsVerificationVisible = ref(false)
  const smsCountdownTrigger = ref(0)

  const addAccountSecurityVerifyWay = computed(() => {
    const value = Number(
      (
        siteConfigStore.config as
          | {
              baseSiteConfig?: {
                add_member_card_security_verify_way?: string | number
              }
            }
          | null
          | undefined
      )?.baseSiteConfig?.add_member_card_security_verify_way ?? 0
    )

    return Number.isFinite(value) && value >= 0 ? value : 2
  })

  const hasTransactionPassword = computed(() =>
    Boolean(String(userStore.userInfo?.busiPwd ?? '').trim())
  )

  const resolvedAreaCode = computed(() => String(userStore.userInfo?.areaCode ?? '').trim())
  const resolvedTelephone = computed(() =>
    String(userStore.userInfo?.telephone ?? '')
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

    return `+${areaCode}-${telephone.slice(0, 3)}****${telephone.slice(-4)}`
  })

  const closeSmsVerification = () => {
    smsVerificationVisible.value = false
  }

  const closePaymentPasswordVerification = () => {
    paymentPasswordVisible.value = false
  }

  const resetVerificationState = () => {
    closeSmsVerification()
    closePaymentPasswordVerification()
  }

  const sendSmsCode = async () => {
    if (isSendingSmsCode.value) {
      return false
    }

    if (!resolvedTelephone.value) {
      showToast({
        message: 'Phone number unavailable',
        type: 'fail',
        duration: 3000
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

  const submitPending = async (verifyCode?: string) => {
    const data = pendingData.value

    if (!data) {
      return false
    }

    const requestData = options.buildRequestData(data, verifyCode)

    if (!requestData) {
      showToast({
        message: 'Unavailable',
        type: 'fail',
        duration: 3000
      })
      return false
    }

    try {
      isSubmitting.value = true
      const success = await options.submitRequest(requestData)

      if (!success) {
        await options.onSubmitFailed?.()
        return false
      }

      pendingData.value = null
      resetVerificationState()
      await options.onSubmitted?.()
      return true
    } finally {
      isSubmitting.value = false
    }
  }

  const beginSubmit = async (data: T): Promise<BeginSubmitResult> => {
    if (!hasTransactionPassword.value) {
      options.onRequireTransactionPassword?.()
      return 'blocked'
    }

    pendingData.value = data

    if (addAccountSecurityVerifyWay.value === 1) {
      smsVerificationVisible.value = true
      await sendSmsCode()
      return 'sms'
    }

    if (addAccountSecurityVerifyWay.value === 2) {
      paymentPasswordVisible.value = true
      return 'password'
    }

    return (await submitPending()) ? 'submitted' : 'failed'
  }

  const handleSmsVerificationResend = async () => {
    await sendSmsCode()
  }

  const handleSmsVerificationConfirm = async (code: string) => {
    if (isCheckingSmsCode.value || isSubmitting.value) {
      return false
    }

    try {
      isCheckingSmsCode.value = true
      const response = await Api.auth.checkSms({
        telephone: resolvedTelephone.value,
        areaCode: resolvedAreaCode.value,
        smsCode: code
      })

      if (response?.code !== 'C2') {
        showToast({
          message: String(response?.message || 'Invalid sms code'),
          type: 'fail',
          duration: 3000
        })
        return false
      }

      closeSmsVerification()
      return submitPending(code)
    } finally {
      isCheckingSmsCode.value = false
    }
  }

  const handlePaymentPasswordVerificationConfirm = async (password: string) => {
    if (isCheckingPaymentPassword.value || isSubmitting.value) {
      return false
    }

    try {
      isCheckingPaymentPassword.value = true
      closePaymentPasswordVerification()
      return submitPending(password)
    } finally {
      isCheckingPaymentPassword.value = false
    }
  }

  return {
    addAccountSecurityVerifyWay,
    hasTransactionPassword,
    maskedPhoneNumber,
    isSendingSmsCode,
    isCheckingSmsCode,
    isCheckingPaymentPassword,
    isSubmitting,
    paymentPasswordVisible,
    smsVerificationVisible,
    smsCountdownTrigger,
    beginSubmit,
    closeSmsVerification,
    closePaymentPasswordVerification,
    handleSmsVerificationResend,
    handleSmsVerificationConfirm,
    handlePaymentPasswordVerificationConfirm
  }
}
