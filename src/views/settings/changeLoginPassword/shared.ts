import Api from '@/api'
import { usePersistentCountdown } from '@/composables/usePersistentCountdown'
import { useUserStore } from '@/stores/user'
import { getDefaultAreaCode, getDefaultAreaCodeDisplay } from '@/utils/locale'
import {
  handlePasswordInput,
  handleVerificationCodeInput,
  isValidPassword
} from '@/utils/phone-input'
import { StringExtension } from '@/utils/string-extension'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { computed, nextTick, onMounted, ref, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

const SMS_COUNTDOWN_STORAGE_KEY = 'change-login-password-sms-countdown'

export const useChangeLoginPassword = () => {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { userInfo, acctInfo } = storeToRefs(userStore)
  const defaultAreaCode = getDefaultAreaCode()
  const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()

  const currentStep = ref<'verification' | 'password'>('verification')
  const verificationCode = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)
  const isSendingCode = ref(false)
  const isConfirmingCode = ref(false)
  const isUpdatingPassword = ref(false)
  const hasRequestedSmsCode = ref(false)
  const showSmsCodeHelpPopup = ref(false)
  const verificationInputRef = ref<HTMLInputElement | null>(null)

  const countdownState = usePersistentCountdown({
    storageKey: SMS_COUNTDOWN_STORAGE_KEY,
    durationSeconds: 60
  })

  const { remainingSeconds, startCountdown, syncCountdown } = countdownState

  const isResendCountdownRunning: ComputedRef<boolean> = countdownState.isRunning

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
      !isValidPassword(newPassword.value) ||
      !confirmPassword.value ||
      newPassword.value !== confirmPassword.value ||
      isUpdatingPassword.value
  )

  /**
   * 聚焦验证码输入框。
   */
  const focusVerificationInput = async () => {
    await nextTick()
    verificationInputRef.value?.focus()
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
   * 处理新密码输入。
   */
  const handleNewPasswordChange = (event: Event) => {
    handlePasswordInput(event, value => {
      newPassword.value = value
    })
  }

  /**
   * 处理确认密码输入。
   */
  const handleConfirmPasswordChange = (event: Event) => {
    handlePasswordInput(event, value => {
      confirmPassword.value = value
    })
  }

  /**
   * 切换新密码显隐状态。
   */
  const toggleNewPassword = () => {
    showNewPassword.value = !showNewPassword.value
  }

  /**
   * 切换确认密码显隐状态。
   */
  const toggleConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  /**
   * 重置修改登录密码页面本地表单状态。
   */
  const resetChangeLoginPasswordState = () => {
    currentStep.value = 'verification'
    verificationCode.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showNewPassword.value = false
    showConfirmPassword.value = false
    showSmsCodeHelpPopup.value = false
  }

  /**
   * 发送或重新发送短信验证码。
   */
  const handleSendOrResendCode = async () => {
    if (isSendingCode.value || isResendCountdownRunning.value) {
      return
    }

    if (!resolvedTelephone.value) {
      showToast({
        message: t('common.phoneNumberUnavailable'),
        duration: 2000,
        wordBreak: 'break-word',
        zIndex: 10001
      })
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
   * 校验短信验证码并进入下一步。
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
        currentStep.value = 'password'
        return
      }

      verificationCode.value = ''
      await focusVerificationInput()
    } finally {
      isConfirmingCode.value = false
    }
  }

  /**
   * 提交新的登录密码。
   */
  const handleUpdatePassword = async () => {
    if (isUpdatePasswordButtonDisabled.value) {
      return
    }

    try {
      isUpdatingPassword.value = true
      const response = await Api.user.modifyMemberInfo(
        {
          memberPwd: StringExtension.md5(newPassword.value)
        },
        {
          showErrorToast: true
        }
      )

      if (response?.code === 'C2') {
        resetChangeLoginPasswordState()
        await userStore.handleAuthExpired()
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
    t,
    currentStep,
    verificationCode,
    newPassword,
    confirmPassword,
    showNewPassword,
    showConfirmPassword,
    isSendingCode,
    isConfirmingCode,
    isUpdatingPassword,
    showSmsCodeHelpPopup,
    verificationInputRef,
    isResendCountdownRunning,
    phoneNumberDisplay,
    resendActionText,
    resendActionClass,
    isConfirmButtonDisabled,
    isUpdatePasswordButtonDisabled,
    focusVerificationInput,
    openSmsCodeHelpPopup,
    resetChangeLoginPasswordState,
    handleVerificationCodeChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    toggleNewPassword,
    toggleConfirmPassword,
    handleSendOrResendCode,
    handleConfirmStep,
    handleUpdatePassword
  }
}
