<template>
  <slot
    :active-tab="activeTab"
    :show-password="showPassword"
    :show-confirm-password="showConfirmPassword"
    :form-data="formData"
    :checkbox-animating="checkboxAnimating"
    :set-active-tab="setActiveTab"
    :toggle-password="togglePassword"
    :toggle-confirm-password="toggleConfirmPassword"
    :handle-checkbox-click="handleCheckboxClick"
    :handle-login="handleLogin"
    :handle-register="handleRegister"
    :handle-send-code="handleSendCode"
    :handle-social-login="handleSocialLogin"
    :open-reset-password="openResetPassword"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  defaultTab?: 'signin' | 'signup'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin'
})

const emit = defineEmits<{
  'open-reset-password': []
}>()

// 当前激活的标签页
const activeTab = ref<'signin' | 'signup'>(props.defaultTab)

watch(
  () => props.defaultTab,
  newTab => {
    activeTab.value = newTab
  }
)

// 密码显示状态
const showPassword = ref({
  signin: false,
  signup: false,
  confirmPassword: false
})

const showConfirmPassword = ref(false)

// 表单数据
const formData = ref({
  // 登录表单
  signin: {
    account: '',
    password: '',
    rememberMe: false
  },
  // 注册表单
  signup: {
    account: '',
    code: '',
    password: '',
    confirmPassword: ''
  }
})

// 复选框动画状态
const checkboxAnimating = ref({
  rememberMe: false
})

// 设置激活的标签页
const setActiveTab = (tab: 'signin' | 'signup') => {
  activeTab.value = tab
}

// 切换密码显示/隐藏
const togglePassword = (tab: 'signin' | 'signup' | 'confirmPassword') => {
  showPassword.value[tab] = !showPassword.value[tab]
}

// 切换确认密码显示/隐藏
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// 复选框点击处理
const handleCheckboxClick = (field: 'rememberMe') => {
  const willBeChecked = !formData.value.signin[field]

  if (willBeChecked) {
    checkboxAnimating.value[field] = true
    formData.value.signin[field] = true

    setTimeout(() => {
      checkboxAnimating.value[field] = false
    }, 300)
  } else {
    checkboxAnimating.value[field] = true
    setTimeout(() => {
      formData.value.signin[field] = false
      checkboxAnimating.value[field] = false
    }, 150)
  }
}

// 登录
const handleLogin = async () => {
  console.log('登录:')
}

// 注册
const handleRegister = async () => {
  console.log('注册:')
}

// 发送验证码
const handleSendCode = async () => {
  console.log('发送验证码到:')
}

// 第三方登录
const handleSocialLogin = (provider: string) => {
  console.log('第三方登录:', provider)
}

// 打开忘记密码
const openResetPassword = () => {
  emit('open-reset-password')
}

defineExpose({
  formData,
  activeTab,
  showPassword,
  showConfirmPassword,
  checkboxAnimating,
  setActiveTab,
  togglePassword,
  toggleConfirmPassword,
  handleCheckboxClick,
  handleLogin,
  handleRegister,
  handleSendCode,
  handleSocialLogin,
  openResetPassword
})
</script>
