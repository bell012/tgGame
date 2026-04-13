import Api from '@/api'
import { usePersistentCountdown } from '@/composables/usePersistentCountdown'
import { useUserStore } from '@/stores/user'
import { getDefaultAreaCode, getDefaultAreaCodeDisplay } from '@/utils/locale'
import {
  handlePhoneInput,
  handleVerificationCodeInput,
  isValidPhoneNumber
} from '@/utils/phone-input'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { computed, nextTick, onMounted, ref, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

const CURRENT_SMS_COUNTDOWN_STORAGE_KEY = 'change-mobile-number-current-sms-countdown'
const NEW_SMS_COUNTDOWN_STORAGE_KEY = 'change-mobile-number-new-sms-countdown'

export const useChangeMobileNumber = () => {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { userInfo, acctInfo } = storeToRefs(userStore)
  const defaultAreaCode = getDefaultAreaCode()
  const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()

  const currentStep = ref<'currentVerification' | 'newNumber' | 'success'>('currentVerification')
  const currentVerificationCode = ref('')
  const newTelephone = ref('')
  const newVerificationCode = ref('')
  const updatedTelephone = ref('')
  const isSendingCurrentCode = ref(false)
  const isConfirmingCurrentCode = ref(false)
  const isSendingNewCode = ref(false)
  const isConfirmingNewCode = ref(false)
  const isAcknowledgingSuccess = ref(false)
  const hasRequestedCurrentSmsCode = ref(false)
  const hasRequestedNewSmsCode = ref(false)
  const showSmsCodeHelpPopup = ref(false)
  const currentVerificationInputRef = ref<HTMLInputElement | null>(null)
  const newVerificationInputRef = ref<HTMLInputElement | null>(null)

  const currentCountdownState = usePersistentCountdown({
    storageKey: CURRENT_SMS_COUNTDOWN_STORAGE_KEY,
    durationSeconds: 60
  })

  const {
    remainingSeconds: currentRemainingSeconds,
    startCountdown: startCurrentCountdown,
    clearCountdown: clearCurrentCountdown,
    syncCountdown: syncCurrentCountdown
  } = currentCountdownState

  const isCurrentResendCountdownRunning: ComputedRef<boolean> = currentCountdownState.isRunning

  const newCountdownState = usePersistentCountdown({
    storageKey: NEW_SMS_COUNTDOWN_STORAGE_KEY,
    durationSeconds: 60
  })

  const {
    remainingSeconds: newRemainingSeconds,
    startCountdown: startNewCountdown,
    clearCountdown: clearNewCountdown,
    syncCountdown: syncNewCountdown
  } = newCountdownState

  const isNewResendCountdownRunning: ComputedRef<boolean> = newCountdownState.isRunning

  const resolvedTelephone = computed(() => String(userInfo.value?.telephone ?? '').trim())

  const currentPhoneNumberDisplay = computed(() =>
    resolvedTelephone.value
      ? `${defaultAreaCodeDisplay} ${resolvedTelephone.value}`
      : `${defaultAreaCodeDisplay} --`
  )

  const newPhoneNumberDisplay = computed(() =>
    newTelephone.value
      ? `${defaultAreaCodeDisplay} ${newTelephone.value}`
      : `${defaultAreaCodeDisplay} --`
  )

  const updatedPhoneNumberDisplay = computed(() =>
    updatedTelephone.value
      ? `${defaultAreaCodeDisplay} ${updatedTelephone.value}`
      : `${defaultAreaCodeDisplay} --`
  )

  const currentResendActionText = computed(() => {
    if (isCurrentResendCountdownRunning.value) {
      return t('common.resendInSeconds', { seconds: currentRemainingSeconds.value })
    }

    return hasRequestedCurrentSmsCode.value ? t('common.resendCode') : t('common.sendCode')
  })

  const newResendActionText = computed(() => {
    if (isNewResendCountdownRunning.value) {
      return t('common.resendInSeconds', { seconds: newRemainingSeconds.value })
    }

    return hasRequestedNewSmsCode.value ? t('common.resendCode') : t('common.sendCode')
  })

  const currentResendActionClass = computed(() =>
    isSendingCurrentCode.value || isCurrentResendCountdownRunning.value
      ? 'text-text-2'
      : 'text-theme-primary'
  )

  const newResendActionClass = computed(() =>
    isSendingNewCode.value || isNewResendCountdownRunning.value
      ? 'text-text-2'
      : 'text-theme-primary'
  )

  const isCurrentConfirmButtonDisabled: ComputedRef<boolean> = computed(
    () => currentVerificationCode.value.length !== 6 || isConfirmingCurrentCode.value
  )

  const isSendNewCodeButtonActive: ComputedRef<boolean> = computed(
    () => isValidPhoneNumber(newTelephone.value) && !isSendingNewCode.value
  )

  const isNewConfirmButtonDisabled: ComputedRef<boolean> = computed(
    () =>
      !isValidPhoneNumber(newTelephone.value) ||
      newVerificationCode.value.length !== 6 ||
      isConfirmingNewCode.value
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
   * 聚焦当前手机号验证码输入框。
   */
  const focusCurrentVerificationInput = async () => {
    await nextTick()
    currentVerificationInputRef.value?.focus()
  }

  /**
   * 聚焦新手机号验证码输入框。
   */
  const focusNewVerificationInput = async () => {
    await nextTick()
    newVerificationInputRef.value?.focus()
  }

  /**
   * 初始化页面用户信息与双验证码倒计时状态。
   */
  const initializePage = async () => {
    userStore.syncStoredUserData()

    const currentMemberId = userInfo.value?.memberId || acctInfo.value?.memberId

    if (currentMemberId) {
      await userStore.refreshUserInfo(currentMemberId)
    } else {
      await userStore.refreshCurrentUserData()
    }

    syncCurrentCountdown()
    syncNewCountdown()
    hasRequestedCurrentSmsCode.value = currentRemainingSeconds.value > 0
    hasRequestedNewSmsCode.value = newRemainingSeconds.value > 0
  }

  /**
   * 打开短信验证码帮助弹窗。
   */
  const openSmsCodeHelpPopup = () => {
    showSmsCodeHelpPopup.value = true
  }

  /**
   * 处理当前手机号验证码输入。
   */
  const handleCurrentVerificationCodeChange = (event: Event) => {
    handleVerificationCodeInput(event, value => {
      currentVerificationCode.value = value
    })
  }

  /**
   * 处理新手机号输入。
   */
  const handleNewTelephoneChange = (event: Event) => {
    handlePhoneInput(event, value => {
      newTelephone.value = value
    })
  }

  /**
   * 处理新手机号验证码输入。
   */
  const handleNewVerificationCodeChange = (event: Event) => {
    handleVerificationCodeInput(event, value => {
      newVerificationCode.value = value
    })
  }

  /**
   * 重置新手机号相关的表单状态。
   */
  const resetNewMobileFlowState = () => {
    newTelephone.value = ''
    newVerificationCode.value = ''
    updatedTelephone.value = ''
    hasRequestedNewSmsCode.value = false
    clearNewCountdown()
  }

  /**
   * 重置修改手机号页面本地状态。
   */
  const resetChangeMobileNumberState = (options?: { clearCountdowns?: boolean }) => {
    const shouldClearCountdowns = options?.clearCountdowns === true

    currentStep.value = 'currentVerification'
    currentVerificationCode.value = ''
    newTelephone.value = ''
    newVerificationCode.value = ''
    updatedTelephone.value = ''
    showSmsCodeHelpPopup.value = false

    if (shouldClearCountdowns) {
      clearCurrentCountdown()
      clearNewCountdown()
      hasRequestedCurrentSmsCode.value = false
      hasRequestedNewSmsCode.value = false
      return
    }

    syncCurrentCountdown()
    syncNewCountdown()
    hasRequestedCurrentSmsCode.value = currentRemainingSeconds.value > 0
    hasRequestedNewSmsCode.value = newRemainingSeconds.value > 0
  }

  /**
   * 给指定手机号发送短信验证码。
   */
  const sendSmsCode = async (telephone: string) => {
    return Api.auth.sendSms({
      telephone,
      areaCode: defaultAreaCode
    })
  }

  /**
   * 发送或重发当前手机号验证码。
   */
  const handleSendOrResendCurrentCode = async () => {
    if (isSendingCurrentCode.value || isCurrentResendCountdownRunning.value) {
      return
    }

    if (!resolvedTelephone.value) {
      showMessageToast(t('common.phoneNumberUnavailable'), 10001)
      return
    }

    try {
      isSendingCurrentCode.value = true
      const response = await sendSmsCode(resolvedTelephone.value)

      if (response?.code === 'C2') {
        hasRequestedCurrentSmsCode.value = true
        startCurrentCountdown()
        await focusCurrentVerificationInput()
      }
    } catch (error) {
      console.error(error)
    } finally {
      isSendingCurrentCode.value = false
    }
  }

  /**
   * 校验当前手机号验证码，成功后进入新手机号输入步骤。
   */
  const handleConfirmCurrentStep = async () => {
    if (isCurrentConfirmButtonDisabled.value) {
      return
    }

    try {
      isConfirmingCurrentCode.value = true
      const response = await Api.auth.checkSms({
        telephone: resolvedTelephone.value,
        areaCode: defaultAreaCode,
        smsCode: currentVerificationCode.value
      })

      if (response?.code === 'C2') {
        currentVerificationCode.value = ''
        hasRequestedCurrentSmsCode.value = false
        clearCurrentCountdown()
        resetNewMobileFlowState()
        currentStep.value = 'newNumber'
        return
      }

      currentVerificationCode.value = ''
      await focusCurrentVerificationInput()
    } finally {
      isConfirmingCurrentCode.value = false
    }
  }

  /**
   * 发送新手机号验证码。
   */
  const handleSendNewCode = async () => {
    await handleSendOrResendNewCode()
  }

  /**
   * 重新发送新手机号验证码。
   */
  const handleSendOrResendNewCode = async () => {
    if (isSendingNewCode.value || isNewResendCountdownRunning.value) {
      return
    }

    if (!isValidPhoneNumber(newTelephone.value)) {
      showMessageToast(t('common.pleaseEnterThePhoneNumber'))
      return
    }

    try {
      isSendingNewCode.value = true
      const response = await sendSmsCode(newTelephone.value)

      if (response?.code === 'C2') {
        hasRequestedNewSmsCode.value = true
        startNewCountdown()
        await focusNewVerificationInput()
      }
    } catch (error) {
      console.error(error)
    } finally {
      isSendingNewCode.value = false
    }
  }

  /**
   * 提交新手机号与验证码，成功后进入完成页。
   */
  const handleConfirmNewMobileNumber = async () => {
    if (isNewConfirmButtonDisabled.value) {
      return
    }

    try {
      isConfirmingNewCode.value = true
      const response = await Api.user.modifyMemberTelePhone(
        {
          telephone: newTelephone.value,
          areaCode: defaultAreaCode,
          smsCode: newVerificationCode.value,
          phoneBindStatus: 0
        },
        {
          showErrorToast: true
        }
      )

      if (response?.code === 'C2') {
        updatedTelephone.value = newTelephone.value
        newVerificationCode.value = ''
        hasRequestedNewSmsCode.value = false
        clearNewCountdown()
        currentStep.value = 'success'
        return
      }

      newVerificationCode.value = ''
      await focusNewVerificationInput()
    } catch (error) {
      console.error(error)
    } finally {
      isConfirmingNewCode.value = false
    }
  }

  /**
   * 成功页点击 OK 后清空状态并触发重新登录。
   */
  const handleAcknowledgeSuccess = async () => {
    if (isAcknowledgingSuccess.value) {
      return
    }

    try {
      isAcknowledgingSuccess.value = true
      resetChangeMobileNumberState({ clearCountdowns: true })
      await userStore.handleAuthExpired()
    } finally {
      isAcknowledgingSuccess.value = false
    }
  }

  onMounted(() => {
    void initializePage()
  })

  return {
    t,
    currentStep,
    defaultAreaCodeDisplay,
    currentVerificationCode,
    newTelephone,
    newVerificationCode,
    updatedTelephone,
    isSendingCurrentCode,
    isConfirmingCurrentCode,
    isSendingNewCode,
    isConfirmingNewCode,
    isAcknowledgingSuccess,
    showSmsCodeHelpPopup,
    currentVerificationInputRef,
    newVerificationInputRef,
    isCurrentResendCountdownRunning,
    isNewResendCountdownRunning,
    currentPhoneNumberDisplay,
    newPhoneNumberDisplay,
    updatedPhoneNumberDisplay,
    currentResendActionText,
    newResendActionText,
    currentResendActionClass,
    newResendActionClass,
    isCurrentConfirmButtonDisabled,
    isSendNewCodeButtonActive,
    isNewConfirmButtonDisabled,
    focusCurrentVerificationInput,
    focusNewVerificationInput,
    openSmsCodeHelpPopup,
    resetChangeMobileNumberState,
    handleCurrentVerificationCodeChange,
    handleNewTelephoneChange,
    handleNewVerificationCodeChange,
    handleSendOrResendCurrentCode,
    handleConfirmCurrentStep,
    handleSendNewCode,
    handleSendOrResendNewCode,
    handleConfirmNewMobileNumber,
    handleAcknowledgeSuccess
  }
}
