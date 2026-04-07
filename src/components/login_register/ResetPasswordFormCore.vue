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
import {
  handlePhoneInput,
  handlePasswordInput,
  handleVerificationCodeInput,
  isValidPassword
} from '@/utils/phone-input'
import Api from '@/api'
import { getDefaultAreaCode } from '@/utils/locale'
import { showToast } from 'vant'

const defaultAreaCode = getDefaultAreaCode()

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

// 倒计时
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 重置密码表单验证
const isResetValid = computed(() => {
  return (
    formData.value.account.length === 10 &&
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
      return
    }

    if (telephone.length !== 10) {
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

    // 开始60秒倒计时
    countdown.value = 60
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000)
  } catch (error) {
    console.error(error)
  }
}

// 重置密码
const handleResetPassword = async () => {
  try {
    // 构建重置密码参数
    const resetPasswordData = {
      memberPwd: formData.value.password, // 新密码
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

  // 清除倒计时
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdown.value = 0
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
