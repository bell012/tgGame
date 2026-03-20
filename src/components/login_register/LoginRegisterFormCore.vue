<template>
  <slot
    :active-tab="activeTab"
    :show-password="showPassword"
    :show-confirm-password="showConfirmPassword"
    :form-data="formData"
    :checkbox-animating="checkboxAnimating"
    :countdown="countdown"
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
    :handle-signup-code-input="handleSignupCodeInput"
    :handle-signin-password-input="handleSigninPasswordInput"
    :handle-signup-password-input="handleSignupPasswordInput"
    :handle-signup-confirm-password-input="handleSignupConfirmPasswordInput"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Api from '@/api'
import {
  handlePhoneInput,
  handlePasswordInput,
  handleVerificationCodeInput,
  isValidPassword
} from '@/utils/phone-input'

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

// 验证码倒计时
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

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
    formData.value.signup.code.length === 6 &&
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
  try {
    // 获取当前语言
    const language = localStorage.getItem('language') || 'en'
    const languageCode = language === 'zh-CN' ? 'zh' : 'en'

    // 构建注册参数
    const registerData = {
      memberId: `63${formData.value.signup.account}`,
      channelId: '1',
      languageCode: languageCode,
      requestMethod: 1,
      currency: 'usd',
      smsCode: formData.value.signup.code, // 验证码
      memberPwd: formData.value.signup.password,
      areaCode: '63',
      telephone: formData.value.signup.account
    }
    // 注册接口
    const response = await Api.auth.register(registerData)
    console.log('注册成功:', response)
  } catch (error) {
    console.error(error)
  }
}

// 发送验证码
const handleSendCode = async () => {
  if (countdown.value > 0) {
    return
  }

  try {
    const telephone = formData.value.signup.account
    if (!telephone) {
      return
    }

    if (telephone.length !== 10) {
      return
    }
    // 发送短信接口
    const response = await Api.auth.sendSms({
      telephone: telephone,
      areaCode: '63'
    })
    console.log('短信接口返回数据:', response)
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

// 处理注册验证码输入
const handleSignupCodeInput = (event: Event) => {
  handleVerificationCodeInput(event, value => {
    formData.value.signup.code = value
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
  countdown,
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
  handleSignupCodeInput,
  handleSigninPasswordInput,
  handleSignupPasswordInput,
  handleSignupConfirmPasswordInput
})
</script>
