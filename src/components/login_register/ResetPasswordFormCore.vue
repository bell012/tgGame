<template>
  <slot
    :show-password="showPassword"
    :show-confirm-password="showConfirmPassword"
    :form-data="formData"
    :toggle-password="togglePassword"
    :toggle-confirm-password="toggleConfirmPassword"
    :handle-send-code="handleSendCode"
    :handle-reset-password="handleResetPassword"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
  togglePassword,
  toggleConfirmPassword,
  handleSendCode,
  handleResetPassword
})
</script>
