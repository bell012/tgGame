<template>
  <slot
    :active-tab="activeTab"
    :active-login-method="activeLoginMethod"
    :active-signup-method="activeSignupMethod"
    :login-method-tabs="loginMethodTabs"
    :signup-method-tabs="signupMethodTabs"
    :signin-area-code="formData.signin.areaCode"
    :signup-area-code="formData.signup.areaCode"
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
    :show-signup-password="showSignupPassword"
    :show-signup-sms-code="showSignupSmsCode"
    :show-signup-captcha="showSignupCaptcha"
    :show-signup-invitation-code="showSignupInvitationCode"
    :captcha-image-url="captchaImageUrl"
    :is-captcha-loading="isCaptchaLoading"
    :set-active-tab="setActiveTab"
    :set-active-login-method="setActiveLoginMethod"
    :set-active-signup-method="setActiveSignupMethod"
    :set-signin-area-code="setSigninAreaCode"
    :set-signup-area-code="setSignupAreaCode"
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
    :handle-signup-captcha-input="handleSignupCaptchaInput"
    :refresh-signup-captcha="fetchSignupCaptcha"
    :handle-signup-account-input="handleSignupAccountInput"
    :handle-signup-username-input="handleSignupUsernameInput"
    :handle-signup-phone-input="handleSignupPhoneInput"
    :handle-signup-code-input="handleSignupCodeInput"
    :handle-signup-password-input="handleSignupPasswordInput"
    :handle-signup-confirm-password-input="handleSignupConfirmPasswordInput"
    :handle-signup-invitation-code-input="handleSignupInvitationCodeInput"
  />
</template>

<script setup lang="ts">
import Api from '@/api'
import type { LoginForm, LoginSetResult, RegisterForm } from '@/api/interface/login_register'
import { usePersistentCountdown } from '@/composables/usePersistentCountdown'
import { useUserStore } from '@/stores/user'
import { AESUtils } from '@/utils/encrypt'
import { clearInvitationCode, getInvitationCode } from '@/utils/invitationAttribution'
import { generateRegisterMemberName, getCurrentCurrency, getLanguageCode } from '@/utils/locale'
import {
  DEFAULT_PHONE_AREA_CODE,
  formatLoosePhoneNumber,
  formatSigninUsername,
  handleInvitationCodeInput,
  handlePasswordInput,
  handleSigninUsernameInput as handleSigninUsernameInputValue,
  handleLoosePhoneInput,
  handleVerificationCodeInput,
  isValidInvitationCode,
  isValidPhoneNumberByAreaCode,
  isValidSigninUsername,
  isValidPassword
} from '@/utils/phone-input'
import { StringExtension } from '@/utils/string-extension'
import { globalShowToast } from '@/utils/toast.ts'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type AuthTab = 'signin' | 'signup'
type SigninMethod = 'username' | 'phone'
type SignupMethod = 'username' | 'phone'

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
const REGISTER_SMS_COUNTDOWN_STORAGE_KEY = 'register-sms-countdown'
const REMEMBERED_ACCOUNT_STORAGE_KEY = 'rememberedAccount'
const REMEMBERED_PASSWORD_STORAGE_KEY = 'rememberedPassword'
const REMEMBERED_SIGNIN_CREDENTIALS_STORAGE_KEY = 'rememberedSigninCredentials'
const REMEMBERED_CREDENTIALS_KEY_SEED = 'tgGame-remember-signin'

interface RememberedSigninCredentials {
  method: SigninMethod
  account: string
  areaCode: string
  password: string
}

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
const activeSignupMethod = ref<SignupMethod>('username')

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

/**
 * 生成记住登录信息使用的 AES key，按当前站点隔离本地缓存。
 */
const getRememberedCredentialsAESKey = () => {
  const host = typeof window !== 'undefined' ? window.location.host : 'tgGame'
  return StringExtension.tail16(`${host}-${REMEMBERED_CREDENTIALS_KEY_SEED}`)
}

/**
 * 加密本地保存的登录回显字段，失败时保留原值兼容旧数据。
 */
const encryptRememberedValue = (value: string) => {
  if (!value) return ''

  try {
    return AESUtils.encryptAES(value, getRememberedCredentialsAESKey())
  } catch (error) {
    console.error(error)
    return value
  }
}

/**
 * 解密本地保存的登录回显字段，无法解密时按旧版明文数据处理。
 */
const decryptRememberedValue = (value: string) => {
  if (!value) return ''

  try {
    const decryptedValue = AESUtils.decryptAES(value, getRememberedCredentialsAESKey())
    if (typeof decryptedValue === 'string') {
      return decryptedValue
    }

    if (decryptedValue && typeof decryptedValue === 'object') {
      return JSON.stringify(decryptedValue)
    }

    return String(decryptedValue ?? '')
  } catch {
    return value
  }
}

/**
 * 读取并解密指定 key 的本地记住登录信息。
 */
const getRememberedStorageValue = (key: string) => {
  try {
    const storedValue = localStorage.getItem(key) || ''
    return decryptRememberedValue(storedValue)
  } catch (error) {
    console.error(error)
    return ''
  }
}

/**
 * 加密写入指定 key 的本地记住登录信息，空值会直接移除缓存。
 */
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

/**
 * 兜底标准化本地保存的登录方式，避免旧数据或异常数据影响 tab 回显。
 */
const normalizeRememberedSigninMethod = (method: unknown): SigninMethod => {
  return method === 'phone' ? 'phone' : 'username'
}

/**
 * 从旧版只保存 account 的数据中尽量推断登录方式，用于兼容升级前的本地缓存。
 */
const inferSigninMethodByAccount = (account: string): SigninMethod => {
  return isValidPhoneNumberByAreaCode(account, DEFAULT_PHONE_AREA_CODE) ? 'phone' : 'username'
}

/**
 * 读取新版结构化记住登录信息，包含登录方式、区号、账号和密码。
 */
const getRememberedSigninCredentials = (): RememberedSigninCredentials | null => {
  const storedValue = getRememberedStorageValue(REMEMBERED_SIGNIN_CREDENTIALS_STORAGE_KEY)

  if (!storedValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown

    if (!parsedValue || typeof parsedValue !== 'object') {
      localStorage.removeItem(REMEMBERED_SIGNIN_CREDENTIALS_STORAGE_KEY)
      return null
    }

    const credentials = parsedValue as Partial<RememberedSigninCredentials>
    const account = String(credentials.account ?? '')
    const method = normalizeRememberedSigninMethod(credentials.method)

    return {
      method,
      account,
      areaCode: String(credentials.areaCode || DEFAULT_PHONE_AREA_CODE),
      password: String(credentials.password ?? '')
    }
  } catch {
    localStorage.removeItem(REMEMBERED_SIGNIN_CREDENTIALS_STORAGE_KEY)
    return null
  }
}

/**
 * 保存登录成功后的回显信息；勾选记住密码时保存密码，否则只保留登录方式、区号和账号。
 */
const setRememberedSigninCredentials = (credentials: RememberedSigninCredentials) => {
  const normalizedCredentials: RememberedSigninCredentials = {
    method: normalizeRememberedSigninMethod(credentials.method),
    account: credentials.account,
    areaCode: credentials.areaCode || DEFAULT_PHONE_AREA_CODE,
    password: credentials.password
  }

  setRememberedStorageValue(
    REMEMBERED_SIGNIN_CREDENTIALS_STORAGE_KEY,
    JSON.stringify(normalizedCredentials)
  )
  setRememberedStorageValue(REMEMBERED_ACCOUNT_STORAGE_KEY, normalizedCredentials.account)

  if (normalizedCredentials.password) {
    setRememberedStorageValue(REMEMBERED_PASSWORD_STORAGE_KEY, normalizedCredentials.password)
    return
  }

  localStorage.removeItem(REMEMBERED_PASSWORD_STORAGE_KEY)
}

/**
 * 清除本地记住登录信息，避免注册成功后继续回显上一次登录账号。
 */
const clearRememberedSigninCredentials = () => {
  localStorage.removeItem(REMEMBERED_SIGNIN_CREDENTIALS_STORAGE_KEY)
  localStorage.removeItem(REMEMBERED_ACCOUNT_STORAGE_KEY)
  localStorage.removeItem(REMEMBERED_PASSWORD_STORAGE_KEY)
}

/**
 * 根据登录接口返回的手机号信息判断本次实际是手机号登录还是用户名登录。
 */
const resolveSuccessfulSigninCredentials = (
  loginResult: unknown,
  fallbackAccount: string
): Pick<RememberedSigninCredentials, 'method' | 'account' | 'areaCode'> => {
  const result = loginResult && typeof loginResult === 'object' ? loginResult : {}
  const record = result as Record<string, unknown>
  const areaCode = String(record.areaCode ?? '').trim()
  const telephone = String(record.telephone ?? '').trim()

  if (areaCode && telephone) {
    return {
      method: 'phone',
      account: telephone,
      areaCode
    }
  }

  return {
    method: 'username',
    account: fallbackAccount,
    areaCode: formData.value.signin.areaCode || DEFAULT_PHONE_AREA_CODE
  }
}

/**
 * 将保存的登录信息回填到登录表单，并切换到对应用户名/手机号 tab。
 */
const applySavedSigninCredentials = (credentials: RememberedSigninCredentials) => {
  activeLoginMethod.value = credentials.method
  formData.value.signin.account = credentials.account
  formData.value.signin.usernameAccount =
    credentials.method === 'username' ? formatSigninUsername(credentials.account) : ''
  formData.value.signin.phoneAccount = credentials.method === 'phone' ? credentials.account : ''
  formData.value.signin.areaCode = credentials.areaCode || DEFAULT_PHONE_AREA_CODE
  formData.value.signin.password = credentials.password
  formData.value.signin.smsCode = ''
  formData.value.signin.captchaCode = ''
  formData.value.signin.captchaKey = ''
  formData.value.signin.rememberMe = Boolean(credentials.password)
}

/**
 * 清空注册表单并恢复邀请码默认值。
 */
const resetSignupForm = () => {
  formData.value.signup.account = ''
  formData.value.signup.usernameAccount = ''
  formData.value.signup.phoneAccount = ''
  formData.value.signup.areaCode = DEFAULT_PHONE_AREA_CODE
  formData.value.signup.code = ''
  formData.value.signup.password = ''
  formData.value.signup.confirmPassword = ''
  formData.value.signup.captchaCode = ''
  formData.value.signup.captchaKey = ''
  formData.value.signup.invitationCode = getInvitationCode()
}

/**
 * 生成登录表单默认回显信息，优先读取新版结构，兼容旧版 account/password。
 */
const getSavedSigninCredentials = (): RememberedSigninCredentials => {
  try {
    const savedCredentials = getRememberedSigninCredentials()
    if (savedCredentials) {
      return savedCredentials
    }

    const account = getRememberedStorageValue(REMEMBERED_ACCOUNT_STORAGE_KEY)

    return {
      method: account ? inferSigninMethodByAccount(account) : 'username',
      account,
      areaCode: DEFAULT_PHONE_AREA_CODE,
      password: getRememberedStorageValue(REMEMBERED_PASSWORD_STORAGE_KEY)
    }
  } catch (error) {
    console.error(error)
  }

  return {
    method: 'username',
    account: '',
    areaCode: DEFAULT_PHONE_AREA_CODE,
    password: ''
  }
}

const savedSigninCredentials = getSavedSigninCredentials()
const formData = ref({
  signin: {
    account: savedSigninCredentials.account,
    usernameAccount:
      savedSigninCredentials.method === 'username'
        ? formatSigninUsername(savedSigninCredentials.account)
        : '',
    phoneAccount: savedSigninCredentials.method === 'phone' ? savedSigninCredentials.account : '',
    areaCode: savedSigninCredentials.areaCode,
    password: savedSigninCredentials.password,
    smsCode: '',
    captchaCode: '',
    captchaKey: '',
    rememberMe: Boolean(savedSigninCredentials.password)
  },
  signup: {
    account: '',
    usernameAccount: '',
    phoneAccount: '',
    areaCode: DEFAULT_PHONE_AREA_CODE,
    code: '',
    password: '',
    confirmPassword: '',
    captchaCode: '',
    captchaKey: '',
    invitationCode: getInvitationCode()
  }
})

activeLoginMethod.value = savedSigninCredentials.method

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
 * 根据注册配置决定用户名注册和手机注册入口是否展示。
 */
const signupMethodTabs = computed(() => {
  const tabs: Array<{ key: SignupMethod; label: string }> = []
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
  return activeTab.value === 'signin' && Number(props.loginSetting?.imageCaptchaEnabled) === 1
})

/**
 * 获取当前注册方式对应的后台配置。
 */
const activeSignupAccountSetting = computed(() => {
  if (activeSignupMethod.value === 'username') {
    return props.loginSetting?.normalAccount
  }

  return props.loginSetting?.mobileAccount
})

/**
 * 获取当前注册方式的校验方式，用户名默认密码，手机默认验证码和密码。
 */
const activeSignupVerifyMethod = computed(() => {
  return Number(
    activeSignupAccountSetting.value?.verifyMethod ?? (activeSignupMethod.value === 'phone' ? 2 : 1)
  )
})

/**
 * 当前注册方式是否需要输入密码。
 */
const showSignupPassword = computed(() => {
  return [1, 2].includes(activeSignupVerifyMethod.value)
})

/**
 * 当前注册方式是否需要输入短信验证码。
 */
const showSignupSmsCode = computed(() => {
  return activeSignupMethod.value === 'phone' && [0, 2].includes(activeSignupVerifyMethod.value)
})

/**
 * 当前注册方式是否需要图形验证码。
 */
const showSignupCaptcha = computed(() => {
  return activeTab.value === 'signup' && Number(props.loginSetting?.imageCaptchaEnabled) === 1
})

/**
 * 根据后台邀请码字段配置决定注册邀请码是否展示。
 */
const showSignupInvitationCode = computed(() => {
  const invitationCodeSetting = props.loginSetting?.invitationCode
  return invitationCodeSetting?.enable === true || Number(invitationCodeSetting?.enable) === 1
})

const captchaImageUrl = ref('')
const isCaptchaLoading = ref(false)
const captchaRequestToken = ref(0)

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
 * 获取当前注册方式下实际提交的会员账号。
 */
const getActiveSignupAccount = () => {
  if (activeSignupMethod.value === 'username') {
    return formData.value.signup.usernameAccount
  }

  return formData.value.signup.phoneAccount
}

/**
 * 同步当前注册账号到通用 account 字段。
 */
const syncSignupAccount = () => {
  formData.value.signup.account = getActiveSignupAccount()
}

/**
 * 判断当前登录表单是否满足提交条件。
 */
const isSigninValid = computed(() => {
  const account = getActiveSigninAccount()
  const isAccountValid =
    activeLoginMethod.value === 'username'
      ? isValidSigninUsername(account)
      : isValidPhoneNumberByAreaCode(account, formData.value.signin.areaCode)
  const hasPassword = !showSigninPassword.value || formData.value.signin.password.length > 0
  const hasSmsCode = !showSigninSmsCode.value || formData.value.signin.smsCode.length > 0
  const hasBaseFields = isAccountValid && hasPassword && hasSmsCode

  if (!showSigninCaptcha.value) {
    return hasBaseFields
  }

  return (
    hasBaseFields &&
    formData.value.signin.captchaCode.length > 0 &&
    formData.value.signin.captchaKey.length > 0
  )
})

const isSignupValid = computed(() => {
  const account = getActiveSignupAccount()
  const isAccountValid =
    activeSignupMethod.value === 'username'
      ? isValidSigninUsername(account)
      : isValidPhoneNumberByAreaCode(account, formData.value.signup.areaCode)
  const hasSmsCode = !showSignupSmsCode.value || formData.value.signup.code.length > 0
  const hasPassword = !showSignupPassword.value || formData.value.signup.password.length > 0
  const hasConfirmPassword =
    !showSignupPassword.value || formData.value.signup.confirmPassword.length > 0
  const invitationCode = formData.value.signup.invitationCode
  const isInvitationCodeValid =
    !showSignupInvitationCode.value ||
    (!props.loginSetting?.invitationCode?.required && !invitationCode) ||
    isValidInvitationCode(invitationCode)
  const hasCaptcha =
    !showSignupCaptcha.value ||
    (formData.value.signup.captchaCode.length > 0 && formData.value.signup.captchaKey.length > 0)

  return (
    isAccountValid &&
    hasSmsCode &&
    hasPassword &&
    hasConfirmPassword &&
    isInvitationCodeValid &&
    hasCaptcha
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
    applySavedSigninCredentials(getSavedSigninCredentials())
  } else {
    resetSignupForm()
  }
}

/**
 * 根据切换后的登录方式恢复或清空密码，避免手机号和用户名 tab 共用密码回显。
 */
const syncSigninPasswordByLoginMethod = (method: SigninMethod) => {
  const savedCredentials = getSavedSigninCredentials()
  const password = savedCredentials.method === method ? savedCredentials.password : ''

  formData.value.signin.password = password
  formData.value.signin.rememberMe = Boolean(password)
}

/**
 * 切换当前登录方式，并同步账号、密码、验证码等登录表单状态。
 */
const setActiveLoginMethod = (method: string) => {
  if (!loginMethodTabs.value.some(tab => tab.key === method)) {
    return
  }

  const nextMethod = method as SigninMethod
  activeLoginMethod.value = nextMethod
  formData.value.signin.smsCode = ''
  formData.value.signin.captchaCode = ''
  formData.value.signin.captchaKey = ''
  syncSigninPasswordByLoginMethod(nextMethod)
  syncSigninAccount()

  if (showSigninCaptcha.value) {
    void fetchSigninCaptcha()
  }
}

/**
 * 设置登录手机号区号。
 */
const setSigninAreaCode = (areaCode: string) => {
  const nextAreaCode = areaCode || DEFAULT_PHONE_AREA_CODE
  formData.value.signin.areaCode = nextAreaCode
  formData.value.signin.phoneAccount = formatLoosePhoneNumber(
    formData.value.signin.phoneAccount,
    nextAreaCode
  )
  syncSigninAccount()
}

/**
 * 切换当前注册方式，并同步要提交的会员账号字段。
 */
const setActiveSignupMethod = (method: string) => {
  if (!signupMethodTabs.value.some(tab => tab.key === method)) {
    return
  }

  activeSignupMethod.value = method as SignupMethod
  formData.value.signup.code = ''
  formData.value.signup.captchaCode = ''
  formData.value.signup.captchaKey = ''
  syncSignupAccount()

  if (showSignupCaptcha.value) {
    void fetchSignupCaptcha()
  }
}

/**
 * 设置注册手机号区号。
 */
const setSignupAreaCode = (areaCode: string) => {
  const nextAreaCode = areaCode || DEFAULT_PHONE_AREA_CODE
  formData.value.signup.areaCode = nextAreaCode
  formData.value.signup.phoneAccount = formatLoosePhoneNumber(
    formData.value.signup.phoneAccount,
    nextAreaCode
  )
  syncSignupAccount()
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
  handleLoosePhoneInput(
    event,
    (value: string) => {
      formData.value.signin.phoneAccount = value
      formData.value.signin.account = value
    },
    formData.value.signin.areaCode
  )
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

/**
 * 处理注册图形验证码输入。
 */
const handleSignupCaptchaInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\s/g, '').slice(0, 8)
  formData.value.signup.captchaCode = value
  input.value = value
}

/**
 * 处理旧注册账号输入，保留给移动端兼容入口。
 */
const handleSignupAccountInput = (event: Event) => {
  handleLoosePhoneInput(event, (value: string) => {
    formData.value.signup.account = value
    formData.value.signup.phoneAccount = value
  })
}

/**
 * 处理用户名注册的用户名输入。
 */
const handleSignupUsernameInput = (event: Event) => {
  handleSigninUsernameInputValue(event, (value: string) => {
    formData.value.signup.usernameAccount = value
    formData.value.signup.account = value
  })
}

/**
 * 处理手机注册的手机号输入。
 */
const handleSignupPhoneInput = (event: Event) => {
  handleLoosePhoneInput(
    event,
    (value: string) => {
      formData.value.signup.phoneAccount = value
      formData.value.signup.account = value
    },
    formData.value.signup.areaCode
  )
}

/**
 * 处理注册短信验证码输入。
 */
const handleSignupCodeInput = (event: Event) => {
  handleVerificationCodeInput(event, (value: string) => {
    formData.value.signup.code = value
  })
}

/**
 * 处理注册密码输入。
 */
const handleSignupPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signup.password = value
  })
}

/**
 * 处理注册确认密码输入。
 */
const handleSignupConfirmPasswordInput = (event: Event) => {
  handlePasswordInput(event, value => {
    formData.value.signup.confirmPassword = value
  })
}

/**
 * 处理注册邀请码输入。
 */
const handleSignupInvitationCodeInput = (event: Event) => {
  handleInvitationCodeInput(event, value => {
    formData.value.signup.invitationCode = value
  })
}

/**
 * 按区号校验手机号格式。
 */
const validatePhoneNumber = (value: string, areaCode = DEFAULT_PHONE_AREA_CODE) => {
  if (!isValidPhoneNumberByAreaCode(value, areaCode)) {
    globalShowToast(t('common.pleaseEnterCorrectPhone'))
    return false
  }

  return true
}

/**
 * 校验用户名是否满足注册/登录规则。
 */
const validateUsername = (value: string) => {
  if (!isValidSigninUsername(value)) {
    globalShowToast(t('common.usernameRuleInvalid'))
    return false
  }

  return true
}

/**
 * 校验邀请码为空或 6 位数字。
 */
const validateInvitationCode = (value: string) => {
  if (!showSignupInvitationCode.value) {
    return true
  }

  if (!value && !props.loginSetting?.invitationCode?.required) {
    return true
  }

  if (!isValidInvitationCode(value)) {
    globalShowToast(t('common.invitationCodeRuleInvalid'))
    return false
  }

  return true
}

/**
 * 校验登录密码是否满足规则。
 */
const validatePasswordRule = (value: string) => {
  if (!isValidPassword(value)) {
    globalShowToast(t('common.passwordRuleInvalid'))
    return false
  }

  return true
}

/**
 * 校验两次输入的登录密码是否一致。
 */
const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) {
    globalShowToast(t('common.passwordMismatch'))
    return false
  }

  return true
}

/**
 * 从接口对象中安全读取字符串字段。
 */
const readObjectValue = (value: unknown, key: string) => {
  if (!value || typeof value !== 'object' || !(key in value)) {
    return ''
  }

  const record = value as Record<string, unknown>
  return typeof record[key] === 'string' ? record[key] : ''
}

/**
 * 统一处理图形验证码图片地址，兼容 base64、绝对地址和相对地址。
 */
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

/**
 * 从不同响应结构中解析图形验证码图片和 key。
 */
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
 * 清空指定表单的图形验证码图片、key 和输入值。
 */
const clearCaptchaState = (target: AuthTab) => {
  captchaImageUrl.value = ''
  formData.value[target].captchaCode = ''
  formData.value[target].captchaKey = ''
}

/**
 * 拉取指定场景图形验证码，并同步图片地址、验证码 key 与输入框状态。
 */
const fetchCaptcha = async (target: AuthTab) => {
  const shouldShowCaptcha = target === 'signin' ? showSigninCaptcha.value : showSignupCaptcha.value

  if (!shouldShowCaptcha) {
    return
  }

  const requestToken = captchaRequestToken.value + 1
  captchaRequestToken.value = requestToken
  isCaptchaLoading.value = true

  try {
    const response = await Api.auth.getCaptchaImage()
    console.log('/sy/captcha/image response:', response)
    const captchaResult = response.result
    const fallbackCaptcha = resolveCaptchaPayload(response)
    const imageUrl =
      normalizeCaptchaImageUrl(captchaResult?.imageBase64 || '') || fallbackCaptcha.imageUrl
    const key = captchaResult?.captchaKey || fallbackCaptcha.key

    if (requestToken !== captchaRequestToken.value || activeTab.value !== target) {
      return
    }

    captchaImageUrl.value = imageUrl
    formData.value[target].captchaKey = key
    formData.value[target].captchaCode = ''
  } catch (error) {
    console.error(error)
    if (requestToken === captchaRequestToken.value && activeTab.value === target) {
      clearCaptchaState(target)
    }
  } finally {
    if (requestToken === captchaRequestToken.value) {
      isCaptchaLoading.value = false
    }
  }
}

/**
 * 拉取登录图形验证码。
 */
const fetchSigninCaptcha = async () => {
  await fetchCaptcha('signin')
}

/**
 * 拉取注册图形验证码。
 */
const fetchSignupCaptcha = async () => {
  await fetchCaptcha('signup')
}

/**
 * 按当前激活页签拉取图形验证码。
 */
const fetchActiveCaptcha = async () => {
  if (activeTab.value === 'signup') {
    await fetchSignupCaptcha()
    return
  }

  await fetchSigninCaptcha()
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

  if (
    activeLoginMethod.value === 'phone' &&
    !validatePhoneNumber(account, formData.value.signin.areaCode)
  ) {
    return
  }

  try {
    const loginData: LoginForm = {
      memberId: account,
      ...(activeLoginMethod.value === 'phone' ? { telephone: account } : {}),
      memberPwd: showSigninPassword.value
        ? StringExtension.md5(formData.value.signin.password)
        : '',
      areaCode: formData.value.signin.areaCode,
      channelId: '1',
      requestMethod: activeLoginMethod.value === 'username' ? '0' : '1'
    }

    if (activeLoginMethod.value === 'phone' && showSigninSmsCode.value) {
      loginData.smsCode = formData.value.signin.smsCode
    }

    if (showSigninCaptcha.value) {
      loginData.captchaCode = formData.value.signin.captchaCode
      loginData.captchaKey = formData.value.signin.captchaKey
    }

    const response = await Api.auth.login(loginData)
    if (response.code == 'C2') {
      const successfulCredentials = resolveSuccessfulSigninCredentials(response.result, account)
      setRememberedSigninCredentials({
        ...successfulCredentials,
        password: formData.value.signin.rememberMe ? formData.value.signin.password : ''
      })
      applySavedSigninCredentials(getSavedSigninCredentials())

      try {
        await userStore.refreshCurrentUserData(
          String(response.result?.memberId || successfulCredentials.account || account)
        )
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
  syncSignupAccount()

  const account = getActiveSignupAccount()

  if (activeSignupMethod.value === 'username' && !validateUsername(account)) {
    return
  }

  if (
    activeSignupMethod.value === 'phone' &&
    !validatePhoneNumber(account, formData.value.signup.areaCode)
  ) {
    return
  }

  if (showSignupPassword.value && !validatePasswordRule(formData.value.signup.password)) {
    return
  }

  if (
    showSignupPassword.value &&
    !validateConfirmPassword(formData.value.signup.password, formData.value.signup.confirmPassword)
  ) {
    return
  }

  if (!validateInvitationCode(formData.value.signup.invitationCode)) {
    return
  }

  try {
    const languageCode = getLanguageCode()
    const currency = getCurrentCurrency()
    const nickName = generateRegisterMemberName()
    const invitationCode = formData.value.signup.invitationCode || getInvitationCode()

    const registerData: RegisterForm = {
      memberId: `${account}`,
      channelId: '1',
      languageCode: languageCode,
      requestMethod: activeSignupMethod.value === 'username' ? 1 : 2,
      currency: currency.toUpperCase(),
      nickName,
      ...(showSignupPassword.value
        ? { memberPwd: StringExtension.md5(formData.value.signup.password) }
        : {}),
      ...(invitationCode ? { invitationCode } : {}),
      ...(showSignupCaptcha.value
        ? {
            captchaCode: formData.value.signup.captchaCode,
            captchaKey: formData.value.signup.captchaKey
          }
        : {})
    }

    if (activeSignupMethod.value === 'phone') {
      registerData.smsCode = formData.value.signup.code
      registerData.areaCode = formData.value.signup.areaCode
      registerData.telephone = account
    }

    const response = await Api.auth.register(registerData)
    if (response.code == 'C2') {
      clearInvitationCode()
      clearRememberedSigninCredentials()
      applySavedSigninCredentials(getSavedSigninCredentials())

      try {
        await userStore.refreshCurrentUserData(account)
      } catch (error) {
        console.error(error)
      }
      emit('register-success')
      return
    }

    if (showSignupCaptcha.value) {
      await fetchSignupCaptcha()
    }
  } catch (error) {
    console.error(error)

    if (showSignupCaptcha.value) {
      await fetchSignupCaptcha()
    }
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

  if (
    activeTab.value === 'signup' &&
    activeSignupMethod.value === 'phone' &&
    showSignupSmsCode.value
  ) {
    return formData.value.signup.phoneAccount
  }

  return ''
}

/**
 * 获取当前场景发送短信验证码使用的区号。
 */
const getSmsTargetAreaCode = () => {
  if (
    activeTab.value === 'signin' &&
    activeLoginMethod.value === 'phone' &&
    showSigninSmsCode.value
  ) {
    return formData.value.signin.areaCode
  }

  if (
    activeTab.value === 'signup' &&
    activeSignupMethod.value === 'phone' &&
    showSignupSmsCode.value
  ) {
    return formData.value.signup.areaCode
  }

  return DEFAULT_PHONE_AREA_CODE
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

    if (!validatePhoneNumber(telephone, getSmsTargetAreaCode())) {
      return
    }

    const response = await Api.auth.sendSms({
      telephone: telephone,
      areaCode: getSmsTargetAreaCode()
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
 * 重置登录/注册表单；如果当前卡片需要图形验证码，则同步刷新验证码。
 */
const resetForm = () => {
  applySavedSigninCredentials(getSavedSigninCredentials())
  resetSignupForm()

  showPassword.value.signin = false
  showPassword.value.signup = false
  showPassword.value.confirmPassword = false
  showConfirmPassword.value = false

  syncCountdown()
  activeTab.value = props.defaultTab

  if (showSigninCaptcha.value || showSignupCaptcha.value) {
    void fetchActiveCaptcha()
  }
}

watch(
  loginMethodTabs,
  tabs => {
    if (!tabs.some(tab => tab.key === activeLoginMethod.value)) {
      activeLoginMethod.value = (tabs[0]?.key || 'username') as SigninMethod
    }
    syncSigninPasswordByLoginMethod(activeLoginMethod.value)
    syncSigninAccount()
  },
  { immediate: true }
)

/**
 * 监听登录方式变化，兜底同步密码回显，避免用户名和手机号共用同一个密码输入状态。
 */
watch(activeLoginMethod, method => {
  syncSigninPasswordByLoginMethod(method)
})

watch(
  signupMethodTabs,
  tabs => {
    if (!tabs.some(tab => tab.key === activeSignupMethod.value)) {
      activeSignupMethod.value = (tabs[0]?.key || 'username') as SignupMethod
    }
    syncSignupAccount()
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

watch(
  showSignupCaptcha,
  enabled => {
    if (enabled) {
      void fetchSignupCaptcha()
      return
    }

    captchaImageUrl.value = ''
    formData.value.signup.captchaCode = ''
    formData.value.signup.captchaKey = ''
  },
  { immediate: true }
)

defineExpose({
  formData,
  activeTab,
  activeLoginMethod,
  activeSignupMethod,
  loginMethodTabs,
  signupMethodTabs,
  showPassword,
  showConfirmPassword,
  checkboxAnimating,
  countdown,
  isSigninValid,
  isSignupValid,
  showSigninPassword,
  showSigninSmsCode,
  showSigninCaptcha,
  showSignupPassword,
  showSignupSmsCode,
  showSignupCaptcha,
  showSignupInvitationCode,
  captchaImageUrl,
  isCaptchaLoading,
  setActiveTab,
  setActiveLoginMethod,
  setActiveSignupMethod,
  setSigninAreaCode,
  setSignupAreaCode,
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
  handleSignupCaptchaInput,
  fetchSignupCaptcha,
  handleSignupAccountInput,
  handleSignupUsernameInput,
  handleSignupPhoneInput,
  handleSignupCodeInput,
  handleSignupPasswordInput,
  handleSignupConfirmPasswordInput,
  handleSignupInvitationCodeInput
})
</script>
