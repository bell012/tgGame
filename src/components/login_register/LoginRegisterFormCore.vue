<template>
  <slot
    :active-tab="activeTab"
    :show-password="showPassword"
    :show-confirm-password="showConfirmPassword"
    :form-data="formData"
    :checkbox-animating="checkboxAnimating"
    :is-signin-valid="isSigninValid"
    :is-signup-valid="isSignupValid"
    :set-active-tab="setActiveTab"
    :toggle-password="togglePassword"
    :toggle-confirm-password="toggleConfirmPassword"
    :handle-checkbox-click="handleCheckboxClick"
    :handle-login="handleLogin"
    :handle-register="handleRegister"
    :handle-send-code="handleSendCode"
    :handle-social-login="handleSocialLogin"
    :open-reset-password="openResetPassword"
    :handle-signin-account-input="handleSigninAccountInput"
    :handle-signup-account-input="handleSignupAccountInput"
    :handle-signin-password-input="handleSigninPasswordInput"
    :handle-signup-password-input="handleSignupPasswordInput"
    :handle-signup-confirm-password-input="handleSignupConfirmPasswordInput"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Api from '@/api'
import { handlePhoneInput, handlePasswordInput, isValidPassword } from '@/utils/phone-input'

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

// 登录表单验证
const isSigninValid = computed(() => {
  return (
    formData.value.signin.account.length === 10 && isValidPassword(formData.value.signin.password)
  )
})

// 注册表单验证
const isSignupValid = computed(() => {
  return (
    formData.value.signup.account.length === 10 &&
    formData.value.signup.code.length > 0 &&
    isValidPassword(formData.value.signup.password) &&
    formData.value.signup.password === formData.value.signup.confirmPassword
  )
})

// 设置激活的标签页
const setActiveTab = (tab: 'signin' | 'signup') => {
  activeTab.value = tab
  if (tab === 'signin') {
    formData.value.signin.account = ''
    formData.value.signin.password = ''
  } else {
    formData.value.signup.account = ''
    formData.value.signup.code = ''
    formData.value.signup.password = ''
    formData.value.signup.confirmPassword = ''
  }
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
  try {
    const telephone = formData.value.signup.account
    if (!telephone) {
      console.log('请输入手机号')
      return
    }
    // 调用发送短信接口
    const response = await Api.auth.sendSms({
      telephone: telephone,
      areaCode: '63'
    })
    console.log('短信接口返回数据:', response)
  } catch (error) {
    console.error(error)
  }
}

// 第三方登录
const handleSocialLogin = (provider: string) => {
  console.log('第三方登录:', provider)
}

// 打开忘记密码
const openResetPassword = () => {
  emit('open-reset-password')
}

// 处理登录账号输入
const handleSigninAccountInput = (event: Event) => {
  handlePhoneInput(event, value => {
    formData.value.signin.account = value
  })
}

// 处理注册账号输入
const handleSignupAccountInput = (event: Event) => {
  handlePhoneInput(event, value => {
    formData.value.signup.account = value
  })
}

// 处理登录密码输入
const handleSigninPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signin.password = value
  })
}

// 处理注册密码输入
const handleSignupPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signup.password = value
  })
}

// 处理注册确认密码输入
const handleSignupConfirmPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signup.confirmPassword = value
  })
}

defineExpose({
  formData,
  activeTab,
  showPassword,
  showConfirmPassword,
  checkboxAnimating,
  isSigninValid,
  isSignupValid,
  setActiveTab,
  togglePassword,
  toggleConfirmPassword,
  handleCheckboxClick,
  handleLogin,
  handleRegister,
  handleSendCode,
  handleSocialLogin,
  openResetPassword,
  handleSigninAccountInput,
  handleSignupAccountInput,
  handleSigninPasswordInput,
  handleSignupPasswordInput,
  handleSignupConfirmPasswordInput
})
</script>
