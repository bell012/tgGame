import Api from '@/api'
import { usePersistentCountdown } from '@/composables/usePersistentCountdown'
import { useUserStore } from '@/stores/user'
import { getDefaultAreaCode, getDefaultAreaCodeDisplay } from '@/utils/locale'
import { handleVerificationCodeInput } from '@/utils/phone-input'
import { StringExtension } from '@/utils/string-extension'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { computed, nextTick, onMounted, ref, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

const SMS_COUNTDOWN_STORAGE_KEY = 'transaction-password-sms-countdown'

type TransactionPasswordMode = 'set' | 'change'

export const useTransactionPassword = () => {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { userInfo, acctInfo } = storeToRefs(userStore)
  const defaultAreaCode = getDefaultAreaCode()
  const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()

  const currentStep = ref<'verification' | 'password'>('verification')
  const transactionPasswordMode = ref<TransactionPasswordMode>('set')
  const verificationCode = ref('')
  const transactionPassword = ref('')
  const confirmTransactionPassword = ref('')
  const isSendingCode = ref(false)
  const isConfirmingCode = ref(false)
  const isUpdatingPassword = ref(false)
  const hasRequestedSmsCode = ref(false)
  const showSmsCodeHelpPopup = ref(false)
  const verificationInputRef = ref<HTMLInputElement | null>(null)
  const transactionPasswordInputRef = ref<HTMLInputElement | null>(null)
  const confirmTransactionPasswordInputRef = ref<HTMLInputElement | null>(null)

  const countdownState = usePersistentCountdown({
    storageKey: SMS_COUNTDOWN_STORAGE_KEY,
    durationSeconds: 60
  })

  const { remainingSeconds, startCountdown, clearCountdown, syncCountdown } = countdownState

  const isResendCountdownRunning: ComputedRef<boolean> = countdownState.isRunning

  /**
   * 同步交易密码模式。
   */
  const syncTransactionPasswordMode = () => {
    transactionPasswordMode.value = userInfo.value?.busiPwd ? 'change' : 'set'
  }

  const pageTitle = computed(() =>
    transactionPasswordMode.value === 'change'
      ? t('common.changeTransactionPassword')
      : t('common.setTransactionPassword')
  )

  const resolvedTelephone = computed(() => String(userInfo.value?.telephone ?? '').trim())
  const phoneNumberDisplay = computed(() =>
    resolvedTelephone.value
      ? `${defaultAreaCodeDisplay} ${resolvedTelephone.value}`
      : `${defaultAreaCodeDisplay} --`
  )

  const resendActionText = computed(() => {
    if (isResendCountdownRunning.value) {
      return t('common.resendInSeconds', { seconds: remainingSeconds.value })
    }

    return hasRequestedSmsCode.value ? t('common.resendCode') : t('common.sendCode')
  })

  const resendActionClass = computed(() =>
    isSendingCode.value || isResendCountdownRunning.value ? 'text-text-2' : 'text-theme-primary'
  )

  const isConfirmButtonDisabled: ComputedRef<boolean> = computed(
    () => verificationCode.value.length !== 6 || isConfirmingCode.value
  )

  const isUpdatePasswordButtonDisabled: ComputedRef<boolean> = computed(
    () =>
      transactionPassword.value.length !== 6 ||
      confirmTransactionPassword.value.length !== 6 ||
      transactionPassword.value !== confirmTransactionPassword.value ||
      isUpdatingPassword.value
  )

  /**
   * 统一弹出轻提示消息。
   */
  const showMessageToast = (message: string, zIndex: number = 10030) => {
    if (!message) {
      return
    }

    showToast({
      message,
      duration: 2000,
      wordBreak: 'break-word',
      zIndex
    })
  }

  /**
   * 聚焦验证码输入框。
   */
  const focusVerificationInput = async () => {
    await nextTick()
    verificationInputRef.value?.focus()
  }

  /**
   * 聚焦交易密码输入框。
   */
  const focusTransactionPasswordInput = async () => {
    await nextTick()
    transactionPasswordInputRef.value?.focus()
  }

  /**
   * 聚焦确认交易密码输入框。
   */
  const focusConfirmTransactionPasswordInput = async () => {
    await nextTick()
    confirmTransactionPasswordInputRef.value?.focus()
  }

  /**
   * 初始化页面用户信息与短信倒计时状态。
   */
  const initializePage = async () => {
    userStore.syncStoredUserData()

    const currentMemberId = userInfo.value?.memberId || acctInfo.value?.memberId

    if (currentMemberId) {
      await userStore.refreshUserInfo(currentMemberId)
    } else {
      await userStore.refreshCurrentUserData()
    }

    syncTransactionPasswordMode()
    syncCountdown()
    hasRequestedSmsCode.value = remainingSeconds.value > 0
  }

  /**
   * 打开短信验证码帮助弹窗。
   */
  const openSmsCodeHelpPopup = () => {
    showSmsCodeHelpPopup.value = true
  }

  /**
   * 处理验证码输入。
   */
  const handleVerificationCodeChange = (event: Event) => {
    handleVerificationCodeInput(event, value => {
      verificationCode.value = value
    })
  }

  /**
   * 处理交易密码输入。
   */
  const handleTransactionPasswordChange = (event: Event) => {
    handleVerificationCodeInput(event, value => {
      transactionPassword.value = value
    })
  }

  /**
   * 处理确认交易密码输入。
   */
  const handleConfirmTransactionPasswordChange = (event: Event) => {
    handleVerificationCodeInput(event, value => {
      confirmTransactionPassword.value = value
    })
  }

  /**
   * 重置交易密码页面本地状态。
   */
  const resetTransactionPasswordState = (options?: { clearCountdown?: boolean }) => {
    currentStep.value = 'verification'
    verificationCode.value = ''
    transactionPassword.value = ''
    confirmTransactionPassword.value = ''
    showSmsCodeHelpPopup.value = false

    if (options?.clearCountdown) {
      clearCountdown()
      hasRequestedSmsCode.value = false
      return
    }

    syncCountdown()
    hasRequestedSmsCode.value = remainingSeconds.value > 0
  }

  /**
   * 发送或重新发送短信验证码。
   */
  const handleSendOrResendCode = async () => {
    if (isSendingCode.value || isResendCountdownRunning.value) {
      return
    }

    if (!resolvedTelephone.value) {
      showMessageToast(t('common.phoneNumberUnavailable'), 10001)
      return
    }

    try {
      isSendingCode.value = true
      const response = await Api.auth.sendSms({
        telephone: resolvedTelephone.value,
        areaCode: defaultAreaCode
      })

      if (response?.code === 'C2') {
        hasRequestedSmsCode.value = true
        startCountdown()
        await focusVerificationInput()
      }
    } catch (error) {
      console.error(error)
    } finally {
      isSendingCode.value = false
    }
  }

  /**
   * 校验短信验证码并进入交易密码设置步骤。
   */
  const handleConfirmStep = async () => {
    if (isConfirmButtonDisabled.value) {
      return
    }

    try {
      isConfirmingCode.value = true
      const response = await Api.auth.checkSms({
        telephone: resolvedTelephone.value,
        areaCode: defaultAreaCode,
        smsCode: verificationCode.value
      })

      if (response?.code === 'C2') {
        verificationCode.value = ''
        currentStep.value = 'password'
        await focusTransactionPasswordInput()
        return
      }

      verificationCode.value = ''
      await focusVerificationInput()
    } finally {
      isConfirmingCode.value = false
    }
  }

  /**
   * 提交交易密码。
   */
  const handleUpdatePassword = async () => {
    if (isUpdatePasswordButtonDisabled.value) {
      return
    }

    try {
      isUpdatingPassword.value = true

      const response = await Api.user.modifyMemberInfo(
        {
          busiPwd: StringExtension.md5(transactionPassword.value)
        },
        {
          showSuccessToast: true,
          showErrorToast: true
        }
      )

      if (response?.code === 'C2') {
        resetTransactionPasswordState({ clearCountdown: true })
        await userStore.refreshCurrentUserData()
        syncTransactionPasswordMode()
        return
      }
    } catch (error) {
      console.error(error)
    } finally {
      isUpdatingPassword.value = false
    }
  }

  onMounted(() => {
    void initializePage()
  })

  return {
    pageTitle,
    t,
    currentStep,
    verificationCode,
    transactionPassword,
    confirmTransactionPassword,
    isSendingCode,
    isConfirmingCode,
    isUpdatingPassword,
    showSmsCodeHelpPopup,
    verificationInputRef,
    transactionPasswordInputRef,
    confirmTransactionPasswordInputRef,
    isResendCountdownRunning,
    phoneNumberDisplay,
    resendActionText,
    resendActionClass,
    isConfirmButtonDisabled,
    isUpdatePasswordButtonDisabled,
    focusVerificationInput,
    focusTransactionPasswordInput,
    focusConfirmTransactionPasswordInput,
    openSmsCodeHelpPopup,
    resetTransactionPasswordState,
    handleVerificationCodeChange,
    handleTransactionPasswordChange,
    handleConfirmTransactionPasswordChange,
    handleSendOrResendCode,
    handleConfirmStep,
    handleUpdatePassword
  }
}
