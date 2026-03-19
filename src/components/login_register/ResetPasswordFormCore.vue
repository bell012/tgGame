<template>
  <slot
    :show-password="showPassword"
    :show-confirm-password="showConfirmPassword"
    :form-data="formData"
    :is-reset-valid="isResetValid"
    :toggle-password="togglePassword"
    :toggle-confirm-password="toggleConfirmPassword"
    :handle-send-code="handleSendCode"
    :handle-reset-password="handleResetPassword"
    :handle-account-input="handleAccountInput"
    :handle-password-input="handlePasswordInputHandler"
    :handle-confirm-password-input="handleConfirmPasswordInput"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { handlePhoneInput, handlePasswordInput, isValidPassword } from '@/utils/phone-input'

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
  console.log('发送验证码到:')
}

// 重置密码
const handleResetPassword = async () => {
  console.log('重置密码:')
}

defineExpose({
  formData,
  showPassword,
  showConfirmPassword,
  isResetValid,
  togglePassword,
  toggleConfirmPassword,
  handleSendCode,
  handleResetPassword,
  handleAccountInput,
  handlePasswordInputHandler,
  handleConfirmPasswordInput
})
</script>
