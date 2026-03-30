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
    :handle-signin-password-input="handleSigninPasswordInput"
    :handle-signup-account-input="handleSignupAccountInput"
    :handle-signup-code-input="handleSignupCodeInput"
    :handle-signup-password-input="handleSignupPasswordInput"
    :handle-signup-confirm-password-input="handleSignupConfirmPasswordInput"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Api from '@/api'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import {
  handlePhoneInput,
  handlePasswordInput,
  handleVerificationCodeInput,
  isValidPassword
} from '@/utils/phone-input'
import { getLanguageCode, getCurrentCurrency } from '@/utils/locale'

interface Props {
  defaultTab?: 'signin' | 'signup'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin'
})

const emit = defineEmits<{
  'open-reset-password': []
  'register-success': []
  'login-success': []
}>()

const userStore = useUserStore()

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

// 从 localStorage 读取保存的账号
const getSavedAccount = () => {
  try {
    const saved = localStorage.getItem('rememberedAccount')
    if (saved) {
      return saved
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

// 表单数据
const savedAccount = getSavedAccount()
const formData = ref({
  // 登录表单
  signin: {
    account: savedAccount || '',
    password: '',
    rememberMe: savedAccount ? true : false
  },
  // 注册表单
  signup: {
    account: '',
    code: '',
    password: '',
    confirmPassword: ''
  }
})

// 倒计时
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 登录表单验证
const isSigninValid = computed(() => {
  return formData.value.signin.account.length === 10 && formData.value.signin.password.length > 0
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

// 复选框动画状态
const checkboxAnimating = ref({
  rememberMe: false
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

// 处理登录账号输入
const handleSigninAccountInput = (event: Event) => {
  handlePhoneInput(event, (value: string) => {
    formData.value.signin.account = value
  })
}

// 处理登录密码输入
const handleSigninPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signin.password = value
  })
}

// 处理注册账号输入
const handleSignupAccountInput = (event: Event) => {
  handlePhoneInput(event, (value: string) => {
    formData.value.signup.account = value
  })
}

// 处理注册验证码输入
const handleSignupCodeInput = (event: Event) => {
  handleVerificationCodeInput(event, (value: string) => {
    formData.value.signup.code = value
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

// 登录
const handleLogin = async () => {
  try {
    const loginData = {
      memberId: formData.value.signin.account,
      telephone: formData.value.signin.account,
      memberPwd: formData.value.signin.password,
      areaCode: '63',
      channelId: '1',
      requestMethod: '0'
    }

    // 登录接口
    const response = await Api.auth.login(loginData)
    if (response && response.message) {
      showToast({
        message: response.message,
        duration: 2000,
        wordBreak: 'break-word',
        zIndex: 10001
      })
    }

    if (response.success && response.result && response.result.tradeToken) {
      // 根据"记住我"状态保存或清除账号
      if (formData.value.signin.rememberMe) {
        localStorage.setItem('rememberedAccount', formData.value.signin.account)
      } else {
        localStorage.removeItem('rememberedAccount')
      }
      try {
        await userStore.refreshCurrentUserData(formData.value.signin.account)
      } catch (error) {
        console.error(error)
      }
      emit('login-success')
    }
  } catch (error) {
    console.error(error)
  }
}

// 注册
const handleRegister = async () => {
  try {
    // 获取当前语言
    const languageCode = getLanguageCode()
    // 获取当前币种
    const currency = getCurrentCurrency()

    const registerData = {
      memberId: `63${formData.value.signup.account}`,
      channelId: '1',
      languageCode: languageCode,
      requestMethod: 1,
      currency: currency.toLowerCase(),
      smsCode: formData.value.signup.code,
      memberPwd: formData.value.signup.password,
      areaCode: '63',
      telephone: formData.value.signup.account
    }

    // 注册接口
    const response = await Api.auth.register(registerData)
    if (response && response.message) {
      showToast({
        message: response.message,
        duration: 2000,
        wordBreak: 'break-word',
        zIndex: 10001
      })
    }

    if (response.success && response.result) {
      try {
        await userStore.refreshCurrentUserData(formData.value.signup.account)
      } catch (error) {
        console.error(error)
      }
      emit('register-success')
    }
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

// 第三方登录
const handleSocialLogin = (provider: string) => {
  console.log('第三方登录:', provider)
}

// 打开忘记密码
const openResetPassword = () => {
  emit('open-reset-password')
}

// 重置表单数据
const resetForm = () => {
  const savedAccount = getSavedAccount()

  // 重置登录表单
  formData.value.signin.account = savedAccount || ''
  formData.value.signin.password = ''
  formData.value.signin.rememberMe = savedAccount ? true : false

  // 重置注册表单
  formData.value.signup.account = ''
  formData.value.signup.code = ''
  formData.value.signup.password = ''
  formData.value.signup.confirmPassword = ''

  // 重置密码显示状态
  showPassword.value.signin = false
  showPassword.value.signup = false
  showPassword.value.confirmPassword = false
  showConfirmPassword.value = false

  // 清除倒计时
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdown.value = 0

  // 重置到默认标签页
  activeTab.value = props.defaultTab
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
  resetForm,
  handleSigninAccountInput,
  handleSigninPasswordInput,
  handleSignupAccountInput,
  handleSignupCodeInput,
  handleSignupPasswordInput,
  handleSignupConfirmPasswordInput
})
</script>
