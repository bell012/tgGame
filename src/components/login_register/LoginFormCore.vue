<template>
  <slot
    :active-tab="activeTab"
    :show-password="showPassword"
    :form-data="formData"
    :set-active-tab="setActiveTab"
    :toggle-password="togglePassword"
    :handle-login="handleLogin"
    :handle-send-otp="handleSendOtp"
    :handle-social-login="handleSocialLogin"
    :handle-key-login="handleKeyLogin"
    :switch-to-register="switchToRegister"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'switch-to-register': []
}>()

// 当前激活的标签页
const activeTab = ref<'password' | 'otp'>('password')
const showPassword = ref(false)
const formData = ref({
  username: '',
  password: '',
  otpContact: ''
})

// 激活的标签页
const setActiveTab = (tab: 'password' | 'otp') => {
  activeTab.value = tab
}

// 切换密码显示/隐藏
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 登录
const handleLogin = async () => {
  console.log('登录:', formData.value)
}

// 发送一次性验证码
const handleSendOtp = async () => {
  console.log('发送验证码到:', formData.value.otpContact)
}

// 第三方登录
const handleSocialLogin = (provider: string) => {
  console.log('第三方登录:', provider)
}

// 使用秘钥登录
const handleKeyLogin = () => {
  console.log('使用秘钥登录')
}

// 切换到注册
const switchToRegister = () => {
  emit('switch-to-register')
}

defineExpose({
  formData,
  activeTab,
  showPassword,
  setActiveTab,
  togglePassword,
  handleLogin,
  handleSendOtp,
  handleSocialLogin,
  handleKeyLogin
})
</script>

