<template>
  <slot
    :show-password="showPassword"
    :show-confirm-password="showConfirmPassword"
    :form-data="formData"
    :is-reset-valid="isResetValid"
    :countdown="countdown"
    :toggle-password="togglePassword"
    :toggle-confirm-password="toggleConfirmPassword"
    :handle-send-code="handleSendCode"
    :handle-reset-password="handleResetPassword"
    :handle-account-input="handleAccountInput"
    :handle-code-input="handleCodeInput"
    :handle-password-input="handlePasswordInputHandler"
    :handle-confirm-password-input="handleConfirmPasswordInput"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePersistentCountdown } from '@/composables/usePersistentCountdown'
import {
  handlePhoneInput,
  handlePasswordInput,
  handleVerificationCodeInput,
  isValidPhoneNumber,
  isValidPassword
} from '@/utils/phone-input'
import Api from '@/api'
import { getDefaultAreaCode } from '@/utils/locale'
import { StringExtension } from '@/utils/string-extension'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const defaultAreaCode = getDefaultAreaCode()
const RESET_PASSWORD_SMS_COUNTDOWN_STORAGE_KEY = 'reset-password-sms-countdown'

const {
  remainingSeconds: countdown,
  startCountdown,
  syncCountdown
} = usePersistentCountdown({
  storageKey: RESET_PASSWORD_SMS_COUNTDOWN_STORAGE_KEY,
  durationSeconds: 60
})

// 密码显示状态
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 表单数据
const formData = ref({
  account: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 重置密码表单验证
const isResetValid = computed(() => {
  return (
    isValidPhoneNumber(formData.value.account) &&
    formData.value.code.length > 0 &&
    isValidPassword(formData.value.password) &&
    formData.value.password === formData.value.confirmPassword
  )
})

// 处理账号输入
const handleAccountInput = (event: Event) => {
  handlePhoneInput(event, (value: string) => {
    formData.value.account = value
  })
}

// 处理验证码输入
const handleCodeInput = (event: Event) => {
  handleVerificationCodeInput(event, (value: string) => {
    formData.value.code = value
  })
}

// 处理密码输入
const handlePasswordInputHandler = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.password = value
  })
}

// 处理确认密码输入
const handleConfirmPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.confirmPassword = value
  })
}

// 切换密码显示/隐藏
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 切换确认密码显示/隐藏
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// 发送验证码
const handleSendCode = async () => {
  if (countdown.value > 0) {
    return
  }

  try {
    const telephone = formData.value.account
    if (!telephone) {
      showToast({
        message: t('common.pleaseEnterThePhoneNumber'),
        type: 'fail',
        zIndex: 10001
      })
      return
    }

    if (!isValidPhoneNumber(telephone)) {
      return
    }

    // 发送短信接口
    const response = await Api.auth.sendSms({
      telephone: telephone,
      areaCode: defaultAreaCode
    })
    if (response && response.message) {
      showToast({
        message: response.message,
        duration: 2000,
        wordBreak: 'break-word',
        zIndex: 10001
      })
    }

    // 只有短信接口返回 C2 时，才开始60秒倒计时
    if (response?.code === 'C2') {
      startCountdown()
    }
  } catch (error) {
    console.error(error)
  }
}

// 重置密码
const handleResetPassword = async () => {
  try {
    // 构建重置密码参数
    const resetPasswordData = {
      memberPwd: StringExtension.md5(formData.value.password), // 新密码
      smsCode: formData.value.code, // 短信验证码
      telephone: formData.value.account, // 手机号
      areaCode: defaultAreaCode, // 区号
      memberId: formData.value.account // 会员账号
    }

    // 重置密码接口
    const response = await Api.auth.resetPassword(resetPasswordData)
    if (response && response.message) {
      showToast({
        message: response.message,
        duration: 2000,
        wordBreak: 'break-word',
        zIndex: 10001
      })
    }

    // 重置密码成功，清空表单
    if (response && response.success) {
      resetForm()
    }
  } catch (error) {
    console.error(error)
  }
}

// 重置表单数据
const resetForm = () => {
  // 重置表单字段
  formData.value.account = ''
  formData.value.code = ''
  formData.value.password = ''
  formData.value.confirmPassword = ''

  // 重置密码显示状态
  showPassword.value = false
  showConfirmPassword.value = false

  // 同步当前倒计时状态
  syncCountdown()
}

defineExpose({
  formData,
  showPassword,
  showConfirmPassword,
  isResetValid,
  countdown,
  togglePassword,
  toggleConfirmPassword,
  handleSendCode,
  handleResetPassword,
  handleAccountInput,
  handleCodeInput,
  handlePasswordInputHandler,
  handleConfirmPasswordInput,
  resetForm
})
</script>
