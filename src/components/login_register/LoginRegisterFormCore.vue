<template>
  <slot
    :active-tab="activeTab"
    :active-login-method="activeLoginMethod"
    :login-method-tabs="loginMethodTabs"
    :show-password="showPassword"
    :show-confirm-password="showConfirmPassword"
    :form-data="formData"
    :checkbox-animating="checkboxAnimating"
    :countdown="countdown"
    :is-signin-valid="isSigninValid"
    :is-signup-valid="isSignupValid"
    :show-signin-password="showSigninPassword"
    :show-signin-sms-code="showSigninSmsCode"
    :show-signin-captcha="showSigninCaptcha"
    :captcha-image-url="captchaImageUrl"
    :is-captcha-loading="isCaptchaLoading"
    :set-active-tab="setActiveTab"
    :set-active-login-method="setActiveLoginMethod"
    :toggle-password="togglePassword"
    :toggle-confirm-password="toggleConfirmPassword"
    :handle-checkbox-click="handleCheckboxClick"
    :handle-login="handleLogin"
    :handle-register="handleRegister"
    :handle-send-code="handleSendCode"
    :handle-social-login="handleSocialLogin"
    :open-reset-password="openResetPassword"
    :handle-signin-account-input="handleSigninAccountInput"
    :handle-signin-username-input="handleSigninUsernameInput"
    :handle-signin-phone-input="handleSigninPhoneInput"
    :handle-signin-password-input="handleSigninPasswordInput"
    :handle-signin-sms-code-input="handleSigninSmsCodeInput"
    :handle-signin-captcha-input="handleSigninCaptchaInput"
    :refresh-signin-captcha="fetchSigninCaptcha"
    :handle-signup-account-input="handleSignupAccountInput"
    :handle-signup-code-input="handleSignupCodeInput"
    :handle-signup-password-input="handleSignupPasswordInput"
    :handle-signup-confirm-password-input="handleSignupConfirmPasswordInput"
  />
</template>

<script setup lang="ts">
import Api from '@/api'
import type { LoginSetResult } from '@/api/interface/login_register'
import { usePersistentCountdown } from '@/composables/usePersistentCountdown'
import { useUserStore } from '@/stores/user'
import { AESUtils } from '@/utils/encrypt'
import { clearInvitationCode, getInvitationCode } from '@/utils/invitationAttribution'
import {
  generateRegisterMemberName,
  getCurrentCurrency,
  getDefaultAreaCode,
  getLanguageCode
} from '@/utils/locale'
import {
  formatSigninUsername,
  handlePasswordInput,
  handleSigninUsernameInput as handleSigninUsernameInputValue,
  handleLoosePhoneInput,
  handleVerificationCodeInput,
  isValidPhoneNumber,
  isValidSigninUsername,
  isValidPassword
} from '@/utils/phone-input'
import { StringExtension } from '@/utils/string-extension'
import { globalShowToast } from '@/utils/toast.ts'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type AuthTab = 'signin' | 'signup'
type SigninMethod = 'username' | 'phone'

interface Props {
  defaultTab?: AuthTab
  loginSetting?: LoginSetResult | null
}

const { t } = useI18n()

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin',
  loginSetting: null
})

const emit = defineEmits<{
  'open-reset-password': []
  'register-success': []
  'login-success': []
}>()

const userStore = useUserStore()
const defaultAreaCode = getDefaultAreaCode()
const REGISTER_SMS_COUNTDOWN_STORAGE_KEY = 'register-sms-countdown'
const REMEMBERED_ACCOUNT_STORAGE_KEY = 'rememberedAccount'
const REMEMBERED_PASSWORD_STORAGE_KEY = 'rememberedPassword'
const REMEMBERED_CREDENTIALS_KEY_SEED = 'tgGame-remember-signin'

const {
  remainingSeconds: countdown,
  startCountdown,
  syncCountdown
} = usePersistentCountdown({
  storageKey: REGISTER_SMS_COUNTDOWN_STORAGE_KEY,
  durationSeconds: 60
})

const activeTab = ref<AuthTab>(props.defaultTab)
const activeLoginMethod = ref<SigninMethod>('username')

watch(
  () => props.defaultTab,
  newTab => {
    activeTab.value = newTab
  }
)

const showPassword = ref({
  signin: false,
  signup: false,
  confirmPassword: false
})

const showConfirmPassword = ref(false)

const getRememberedCredentialsAESKey = () => {
  const host = typeof window !== 'undefined' ? window.location.host : 'tgGame'
  return StringExtension.tail16(`${host}-${REMEMBERED_CREDENTIALS_KEY_SEED}`)
}

const encryptRememberedValue = (value: string) => {
  if (!value) return ''

  try {
    return AESUtils.encryptAES(value, getRememberedCredentialsAESKey())
  } catch (error) {
    console.error(error)
    return value
  }
}

const decryptRememberedValue = (value: string) => {
  if (!value) return ''

  try {
    const decryptedValue = AESUtils.decryptAES(value, getRememberedCredentialsAESKey())
    return typeof decryptedValue === 'string' ? decryptedValue : String(decryptedValue ?? '')
  } catch {
    return value
  }
}

const getRememberedStorageValue = (key: string) => {
  try {
    const storedValue = localStorage.getItem(key) || ''
    return decryptRememberedValue(storedValue)
  } catch (error) {
    console.error(error)
    return ''
  }
}

const setRememberedStorageValue = (key: string, value: string) => {
  try {
    if (!value) {
      localStorage.removeItem(key)
      return
    }

    localStorage.setItem(key, encryptRememberedValue(value))
  } catch (error) {
    console.error(error)
  }
}

const getSavedSigninCredentials = () => {
  try {
    return {
      account: getRememberedStorageValue(REMEMBERED_ACCOUNT_STORAGE_KEY),
      password: getRememberedStorageValue(REMEMBERED_PASSWORD_STORAGE_KEY)
    }
  } catch (error) {
    console.error(error)
  }

  return {
    account: '',
    password: ''
  }
}

const savedSigninCredentials = getSavedSigninCredentials()
const formData = ref({
  signin: {
    account: savedSigninCredentials.account,
    usernameAccount: formatSigninUsername(savedSigninCredentials.account),
    phoneAccount: savedSigninCredentials.account,
    password: savedSigninCredentials.password,
    smsCode: '',
    captchaCode: '',
    captchaKey: '',
    rememberMe: Boolean(savedSigninCredentials.password)
  },
  signup: {
    account: '',
    code: '',
    password: '',
    confirmPassword: ''
  }
})

/**
 * 根据登录设置决定账号登录和手机号登录入口是否展示。
 */
const loginMethodTabs = computed(() => {
  const tabs: Array<{ key: SigninMethod; label: string }> = []
  const loginSetting = props.loginSetting

  if (!loginSetting || Number(loginSetting.normalAccount?.enable) === 1) {
    tabs.push({ key: 'username', label: t('common.username') })
  }

  if (!loginSetting || Number(loginSetting.mobileAccount?.enable) === 1) {
    tabs.push({ key: 'phone', label: t('common.phone') })
  }

  return tabs.length ? tabs : [{ key: 'username', label: t('common.username') }]
})

/**
 * 获取当前登录方式对应的后台配置。
 */
const activeSigninAccountSetting = computed(() => {
  if (activeLoginMethod.value === 'username') {
    return props.loginSetting?.normalAccount
  }

  return props.loginSetting?.mobileAccount
})

/**
 * 获取当前登录方式的校验方式，未返回时默认使用密码登录。
 */
const activeSigninVerifyMethod = computed(() => {
  return Number(activeSigninAccountSetting.value?.verifyMethod ?? 1)
})

/**
 * 当前登录方式是否需要输入密码。
 */
const showSigninPassword = computed(() => {
  return [1, 2].includes(activeSigninVerifyMethod.value)
})

/**
 * 当前手机号登录方式是否需要短信验证码。
 */
const showSigninSmsCode = computed(() => {
  return activeLoginMethod.value === 'phone' && [0, 2].includes(activeSigninVerifyMethod.value)
})

/**
 * 当前登录方式是否需要图形验证码。
 */
const showSigninCaptcha = computed(() => {
  return (
    activeTab.value === 'signin' &&
    activeLoginMethod.value === 'username' &&
    Number(props.loginSetting?.imageCaptchaEnabled) === 1
  )
})

const captchaImageUrl = ref('')
const isCaptchaLoading = ref(false)

/**
 * 获取当前登录方式下实际提交的账号。
 */
const getActiveSigninAccount = () => {
  if (activeLoginMethod.value === 'username') {
    return formData.value.signin.usernameAccount
  }

  return formData.value.signin.phoneAccount
}

/**
 * 同步当前登录账号到通用 account 字段。
 */
const syncSigninAccount = () => {
  formData.value.signin.account = getActiveSigninAccount()
}

/**
 * 判断当前登录表单是否满足提交条件。
 */
const isSigninValid = computed(() => {
  const account = getActiveSigninAccount()
  const isAccountValid =
    activeLoginMethod.value === 'username' ? isValidSigninUsername(account) : account.length > 0
  const hasPassword = !showSigninPassword.value || formData.value.signin.password.length > 0
  const hasSmsCode = !showSigninSmsCode.value || formData.value.signin.smsCode.length > 0
  const hasBaseFields = isAccountValid && hasPassword && hasSmsCode

  if (!showSigninCaptcha.value) {
    return hasBaseFields
  }

  return hasBaseFields && formData.value.signin.captchaCode.length > 0
})

const isSignupValid = computed(() => {
  return (
    formData.value.signup.account.length > 0 &&
    formData.value.signup.code.length > 0 &&
    formData.value.signup.password.length > 0 &&
    formData.value.signup.confirmPassword.length > 0
  )
})

const checkboxAnimating = ref({
  rememberMe: false
})

/**
 * 切换登录/注册页签，并按当前页签重置对应表单数据。
 */
const setActiveTab = (tab: AuthTab) => {
  activeTab.value = tab

  if (tab === 'signin') {
    const savedCredentials = getSavedSigninCredentials()
    formData.value.signin.account = savedCredentials.account
    formData.value.signin.usernameAccount = formatSigninUsername(savedCredentials.account)
    formData.value.signin.phoneAccount = savedCredentials.account
    formData.value.signin.password = savedCredentials.password
    formData.value.signin.smsCode = ''
    formData.value.signin.rememberMe = Boolean(savedCredentials.password)
  } else {
    formData.value.signup.account = ''
    formData.value.signup.code = ''
    formData.value.signup.password = ''
    formData.value.signup.confirmPassword = ''
  }
}

/**
 * 切换当前登录方式，并同步要提交的账号字段。
 */
const setActiveLoginMethod = (method: string) => {
  if (!loginMethodTabs.value.some(tab => tab.key === method)) {
    return
  }

  activeLoginMethod.value = method as SigninMethod
  formData.value.signin.smsCode = ''
  formData.value.signin.captchaCode = ''
  formData.value.signin.captchaKey = ''
  syncSigninAccount()
}

/**
 * 切换密码输入框显示状态。
 */
const togglePassword = (tab: 'signin' | 'signup' | 'confirmPassword') => {
  showPassword.value[tab] = !showPassword.value[tab]
}

/**
 * 切换确认密码输入框显示状态。
 */
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

/**
 * 处理记住密码复选框点击。
 */
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

/**
 * 处理旧账号登录输入，保留给移动端兼容入口。
 */
const handleSigninAccountInput = (event: Event) => {
  handleLoosePhoneInput(event, (value: string) => {
    formData.value.signin.account = value
    formData.value.signin.phoneAccount = value
  })
}

/**
 * 处理账号登录的用户名输入。
 */
const handleSigninUsernameInput = (event: Event) => {
  handleSigninUsernameInputValue(event, (value: string) => {
    formData.value.signin.usernameAccount = value
    formData.value.signin.account = value
  })
}

/**
 * 处理手机号登录的手机号输入。
 */
const handleSigninPhoneInput = (event: Event) => {
  handleLoosePhoneInput(event, (value: string) => {
    formData.value.signin.phoneAccount = value
    formData.value.signin.account = value
  })
}

/**
 * 处理登录密码输入。
 */
const handleSigninPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signin.password = value
  })
}

/**
 * 处理手机号登录短信验证码输入。
 */
const handleSigninSmsCodeInput = (event: Event) => {
  handleVerificationCodeInput(event, (value: string) => {
    formData.value.signin.smsCode = value
  })
}

/**
 * 处理登录图形验证码输入。
 */
const handleSigninCaptchaInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\s/g, '').slice(0, 8)
  formData.value.signin.captchaCode = value
  input.value = value
}

const handleSignupAccountInput = (event: Event) => {
  handleLoosePhoneInput(event, (value: string) => {
    formData.value.signup.account = value
  })
}

const handleSignupCodeInput = (event: Event) => {
  handleVerificationCodeInput(event, (value: string) => {
    formData.value.signup.code = value
  })
}

const handleSignupPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signup.password = value
  })
}

const handleSignupConfirmPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signup.confirmPassword = value
  })
}

const validatePhoneNumber = (value: string) => {
  if (!isValidPhoneNumber(value)) {
    globalShowToast(t('common.pleaseEnterCorrectPhone'))
    return false
  }

  return true
}

const validatePasswordRule = (value: string) => {
  if (!isValidPassword(value)) {
    globalShowToast(t('common.passwordRuleInvalid'))
    return false
  }

  return true
}

const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) {
    globalShowToast(t('common.passwordMismatch'))
    return false
  }

  return true
}

const readObjectValue = (value: unknown, key: string) => {
  if (!value || typeof value !== 'object' || !(key in value)) {
    return ''
  }

  const record = value as Record<string, unknown>
  return typeof record[key] === 'string' ? record[key] : ''
}

const normalizeCaptchaImageUrl = (value: string) => {
  if (!value) return ''

  if (/^(data:image\/|https?:\/\/|\/)/i.test(value)) {
    return value
  }

  if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 80) {
    return `data:image/png;base64,${value}`
  }

  return value
}

const resolveCaptchaPayload = (payload: unknown): { imageUrl: string; key: string } => {
  if (!payload || typeof payload !== 'object') {
    return {
      imageUrl: typeof payload === 'string' ? normalizeCaptchaImageUrl(payload) : '',
      key: ''
    }
  }

  const imageKeys = [
    'imageBase64',
    'image',
    'imageUrl',
    'img',
    'imgUrl',
    'captcha',
    'captchaImage',
    'captchaImg',
    'captchaBase64',
    'base64'
  ]
  const keyKeys = ['captchaKey', 'key', 'uuid', 'captchaId', 'captchaUuid']
  const imageUrl = imageKeys.map(key => readObjectValue(payload, key)).find(Boolean) || ''
  const captchaKey = keyKeys.map(key => readObjectValue(payload, key)).find(Boolean) || ''

  if (imageUrl || captchaKey) {
    return {
      imageUrl: normalizeCaptchaImageUrl(imageUrl),
      key: captchaKey
    }
  }

  const record = payload as Record<string, unknown>
  for (const nestedKey of ['result', 'data']) {
    if (nestedKey in record) {
      const resolved = resolveCaptchaPayload(record[nestedKey])
      if (resolved.imageUrl || resolved.key) {
        return resolved
      }
    }
  }

  return { imageUrl: '', key: '' }
}

/**
 * 拉取登录图形验证码，并同步图片地址、验证码 key 与输入框状态。
 */
const fetchSigninCaptcha = async () => {
  if (!showSigninCaptcha.value || isCaptchaLoading.value) {
    return
  }

  isCaptchaLoading.value = true

  try {
    const response = await Api.auth.getCaptchaImage()
    console.log('/sy/captcha/image response:', response)
    const captchaResult = response.result
    const fallbackCaptcha = resolveCaptchaPayload(response)
    const imageUrl =
      normalizeCaptchaImageUrl(captchaResult?.imageBase64 || '') || fallbackCaptcha.imageUrl
    const key = captchaResult?.captchaKey || fallbackCaptcha.key
    captchaImageUrl.value = imageUrl
    formData.value.signin.captchaKey = key
    formData.value.signin.captchaCode = ''
  } catch (error) {
    console.error(error)
    captchaImageUrl.value = ''
    formData.value.signin.captchaKey = ''
  } finally {
    isCaptchaLoading.value = false
  }
}

/**
 * 提交登录，根据当前登录方式和校验方式组装密码、短信验证码和图形验证码参数。
 */
const handleLogin = async () => {
  syncSigninAccount()

  const account = getActiveSigninAccount()

  if (activeLoginMethod.value === 'username' && !isValidSigninUsername(account)) {
    return
  }

  if (activeLoginMethod.value === 'phone' && !validatePhoneNumber(account)) {
    return
  }

  try {
    const loginData = {
      memberId: account,
      telephone: account,
      memberPwd: showSigninPassword.value
        ? StringExtension.md5(formData.value.signin.password)
        : '',
      areaCode: defaultAreaCode,
      channelId: '1',
      requestMethod: activeLoginMethod.value === 'username' ? '0' : '1',
      ...(showSigninSmsCode.value
        ? {
            validateCode: formData.value.signin.smsCode
          }
        : {}),
      ...(showSigninCaptcha.value
        ? {
            captchaCode: formData.value.signin.captchaCode,
            captchaKey: formData.value.signin.captchaKey
          }
        : {})
    }

    const response = await Api.auth.login(loginData)
    if (response.code == 'C2') {
      if (formData.value.signin.rememberMe) {
        setRememberedStorageValue(REMEMBERED_ACCOUNT_STORAGE_KEY, account)
        setRememberedStorageValue(REMEMBERED_PASSWORD_STORAGE_KEY, formData.value.signin.password)
      } else {
        setRememberedStorageValue(REMEMBERED_ACCOUNT_STORAGE_KEY, account)
        localStorage.removeItem(REMEMBERED_PASSWORD_STORAGE_KEY)
      }

      try {
        await userStore.refreshCurrentUserData(account)
      } catch (error) {
        console.error(error)
      }

      emit('login-success')
      return
    }

    if (showSigninCaptcha.value) {
      await fetchSigninCaptcha()
    }
  } catch (error) {
    console.error(error)

    if (showSigninCaptcha.value) {
      await fetchSigninCaptcha()
    }
  }
}

/**
 * 提交注册表单。
 */
const handleRegister = async () => {
  if (!validatePhoneNumber(formData.value.signup.account)) {
    return
  }

  if (!validatePasswordRule(formData.value.signup.password)) {
    return
  }

  if (
    !validateConfirmPassword(formData.value.signup.password, formData.value.signup.confirmPassword)
  ) {
    return
  }

  try {
    const languageCode = getLanguageCode()
    const currency = getCurrentCurrency()
    const nickName = generateRegisterMemberName()
    const invitationCode = getInvitationCode()

    const registerData = {
      memberId: `${formData.value.signup.account}`,
      channelId: '1',
      languageCode: languageCode,
      requestMethod: 1,
      currency: currency.toUpperCase(),
      smsCode: formData.value.signup.code,
      memberPwd: StringExtension.md5(formData.value.signup.password),
      areaCode: defaultAreaCode,
      telephone: formData.value.signup.account,
      nickName,
      ...(invitationCode ? { invitationCode } : {})
    }

    const response = await Api.auth.register(registerData)
    if (response.code == 'C2') {
      clearInvitationCode()

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

/**
 * 获取当前场景需要发送短信验证码的手机号。
 */
const getSmsTargetPhone = () => {
  if (
    activeTab.value === 'signin' &&
    activeLoginMethod.value === 'phone' &&
    showSigninSmsCode.value
  ) {
    return formData.value.signin.phoneAccount
  }

  return formData.value.signup.account
}

/**
 * 发送短信验证码，登录手机号验证码和注册验证码共用同一个发送入口。
 */
const handleSendCode = async () => {
  if (countdown.value > 0) {
    return
  }

  try {
    const telephone = getSmsTargetPhone()
    if (!telephone) {
      globalShowToast(t('common.pleaseEnterThePhoneNumber'))
      return
    }

    if (!validatePhoneNumber(telephone)) {
      return
    }

    const response = await Api.auth.sendSms({
      telephone: telephone,
      areaCode: defaultAreaCode
    })

    if (response?.code === 'C2') {
      startCountdown()
    }
  } catch (error) {
    console.error(error)
  }
}

const handleSocialLogin = (provider: string) => {
  console.log('social login:', provider)
}

const openResetPassword = () => {
  emit('open-reset-password')
}

/**
 * 重置登录/注册表单；如果当前登录卡片需要图形验证码，则同步刷新验证码。
 */
const resetForm = () => {
  const savedCredentials = getSavedSigninCredentials()

  formData.value.signin.account = savedCredentials.account
  formData.value.signin.usernameAccount = formatSigninUsername(savedCredentials.account)
  formData.value.signin.phoneAccount = savedCredentials.account
  formData.value.signin.password = savedCredentials.password
  formData.value.signin.smsCode = ''
  formData.value.signin.captchaCode = ''
  formData.value.signin.captchaKey = ''
  formData.value.signin.rememberMe = Boolean(savedCredentials.password)

  formData.value.signup.account = ''
  formData.value.signup.code = ''
  formData.value.signup.password = ''
  formData.value.signup.confirmPassword = ''

  showPassword.value.signin = false
  showPassword.value.signup = false
  showPassword.value.confirmPassword = false
  showConfirmPassword.value = false

  syncCountdown()
  activeTab.value = props.defaultTab

  if (showSigninCaptcha.value) {
    void fetchSigninCaptcha()
  }
}

watch(
  loginMethodTabs,
  tabs => {
    if (!tabs.some(tab => tab.key === activeLoginMethod.value)) {
      activeLoginMethod.value = (tabs[0]?.key || 'username') as SigninMethod
    }
    syncSigninAccount()
  },
  { immediate: true }
)

watch(
  showSigninCaptcha,
  enabled => {
    if (enabled) {
      void fetchSigninCaptcha()
      return
    }

    captchaImageUrl.value = ''
    formData.value.signin.captchaCode = ''
    formData.value.signin.captchaKey = ''
  },
  { immediate: true }
)

defineExpose({
  formData,
  activeTab,
  activeLoginMethod,
  loginMethodTabs,
  showPassword,
  showConfirmPassword,
  checkboxAnimating,
  countdown,
  isSigninValid,
  isSignupValid,
  showSigninPassword,
  showSigninSmsCode,
  showSigninCaptcha,
  captchaImageUrl,
  isCaptchaLoading,
  setActiveTab,
  setActiveLoginMethod,
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
  handleSigninUsernameInput,
  handleSigninPhoneInput,
  handleSigninPasswordInput,
  handleSigninSmsCodeInput,
  handleSigninCaptchaInput,
  fetchSigninCaptcha,
  handleSignupAccountInput,
  handleSignupCodeInput,
  handleSignupPasswordInput,
  handleSignupConfirmPasswordInput
})
</script>
