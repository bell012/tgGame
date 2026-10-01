<template>
  <LoginRegisterFormCore
    ref="loginFormRef"
    :default-tab="defaultTab"
    :login-setting="loginSetting"
    @register-success="handleRegisterSuccess"
    @login-success="handleLoginSuccess"
    @open-reset-password="emit('open-reset-password')"
  >
    <template
      #default="{
        activeTab,
        activeLoginMethod,
        loginMethodTabs,
        signinAreaCode,
        showPassword,
        formData,
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
        setSigninAreaCode,
        togglePassword,
        handleCheckboxClick,
        handleLogin,
        handleRegister,
        handleSendCode,
        openResetPassword,
        handleSigninUsernameInput,
        handleSigninPhoneInput,
        handleSigninPasswordInput,
        handleSigninSmsCodeInput,
        handleSigninCaptchaInput,
        refreshSigninCaptcha,
        handleSignupAccountInput,
        handleSignupCodeInput,
        handleSignupPasswordInput,
        handleSignupConfirmPasswordInput
      }"
    >
      <div class="w-full h-full flex flex-col">
        <div v-if="activeTab === 'signin'" class="flex gap-8 mb-6">
          <button
            v-for="method in loginMethodTabs"
            :key="method.key"
            class="relative min-w-16 pb-3 text-lg font-[700] font-inter transition-all duration-200 tab-button-new"
            :class="activeLoginMethod === method.key ? 'text-text-1' : 'text-text-2'"
            @click="handleSigninMethodClick(method.key, setActiveLoginMethod)"
          >
            <span>{{ method.label }}</span>
            <div
              v-if="activeLoginMethod === method.key"
              class="absolute bottom-0 left-0 right-0 h-[4px] bg-theme-primary rounded-[10px]"
            ></div>
          </button>
        </div>

        <div v-else class="flex gap-[48px] mb-8">
          <button
            class="relative min-w-20 pb-3 text-2xl font-[700] font-inter text-text-1 tab-button-new"
            @click="setActiveTab('signup')"
          >
            <span>{{ t('home.sign_Up') }}</span>
            <div
              class="absolute bottom-0 left-0 right-0 h-[4px] bg-theme-primary rounded-[10px]"
            ></div>
          </button>
        </div>

        <div class="flex-1 flex flex-col relative">
          <template v-if="activeTab === 'signin'">
            <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.account') }}</div>
            <div class="mb-6">
              <div ref="signinAreaCodeAnchorRef" class="relative">
                <KeyIcon
                  v-if="activeLoginMethod === 'username'"
                  class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                />
                <div
                  v-if="activeLoginMethod === 'phone'"
                  class="absolute left-4 top-[21px] z-10 -translate-y-1/2"
                >
                  <button
                    type="button"
                    class="flex items-center gap-1 text-[var(--color-theme-level-1)] text-base font-[700]"
                    @click.stop="toggleSigninAreaCodeDropdown"
                  >
                    <span>{{ getSelectedPhoneAreaCode(signinAreaCode).display }}</span>
                    <XiaIcon
                      class="w-3 h-3 transition-transform duration-200"
                      :class="isSigninAreaCodeDropdownOpen ? 'rotate-180' : ''"
                    />
                  </button>
                </div>
                <input
                  :value="
                    activeLoginMethod === 'username'
                      ? formData.signin.usernameAccount
                      : formData.signin.phoneAccount
                  "
                  type="text"
                  :inputmode="activeLoginMethod === 'phone' ? 'numeric' : 'text'"
                  :placeholder="
                    activeLoginMethod === 'username'
                      ? t('common.enter_username')
                      : t('common.enter_account')
                  "
                  class="auth-input-placeholder w-full h-[42px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                  :class="activeLoginMethod === 'phone' ? 'pl-[78px]' : 'pl-[44px]'"
                  @input="
                    activeLoginMethod === 'username'
                      ? handleSigninUsernameInput($event)
                      : handleSigninPhoneInput($event)
                  "
                />
              </div>
            </div>

            <template v-if="showSigninPassword">
              <div class="text-sm font-[700] text-text-1 mb-2">
                {{ t('common.password') }}
              </div>
              <div class="mb-6">
                <div class="relative">
                  <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                  <input
                    :value="formData.signin.password"
                    :type="showPassword.signin ? 'text' : 'password'"
                    :placeholder="t('common.enter_password')"
                    class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-11 bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                    :class="showPassword.signin ? '' : 'auth-password-mask'"
                    @input="handleSigninPasswordInput"
                  />
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                    @click="togglePassword('signin')"
                  >
                    <EyeIcon v-if="showPassword.signin" class="w-5 h-5 text-text-2" />
                    <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                  </button>
                </div>
              </div>
            </template>

            <template v-if="showSigninSmsCode">
              <div class="text-sm font-[700] text-text-1 mb-2">
                {{ t('common.verification') }}
              </div>
              <div class="mb-6">
                <div class="relative">
                  <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                  <input
                    :value="formData.signin.smsCode"
                    type="text"
                    inputmode="numeric"
                    :placeholder="t('common.enter_verification')"
                    class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-[92px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                    @input="handleSigninSmsCodeInput"
                  />
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 h-7 min-w-[70px] px-2 text-xs font-[500] rounded-lg transition-opacity"
                    :class="
                      countdown > 0
                        ? 'bg-opacity-6 text-text-2 cursor-not-allowed'
                        : 'bg-secondary-3 text-theme-primary'
                    "
                    :disabled="countdown > 0"
                    @click="handleSendCode"
                  >
                    {{ countdown > 0 ? `${countdown}s` : t('common.get_code') }}
                  </button>
                </div>
              </div>
            </template>

            <template v-if="showSigninCaptcha">
              <div class="text-sm font-[700] text-text-1 mb-2">
                {{ t('common.captcha') }}
              </div>
              <div class="mb-4">
                <div class="relative">
                  <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                  <input
                    :value="formData.signin.captchaCode"
                    type="text"
                    :placeholder="t('common.enter_captcha')"
                    class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-[108px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                    @input="handleSigninCaptchaInput"
                  />
                  <button
                    type="button"
                    class="absolute right-1 top-1/2 -translate-y-1/2 w-[96px] h-[34px] rounded-md overflow-hidden bg-bg-2 border border-input-2 flex items-center justify-center text-xs text-text-2"
                    @click="refreshSigninCaptcha"
                  >
                    <img
                      v-if="captchaImageUrl"
                      :src="captchaImageUrl"
                      alt=""
                      class="w-full h-full object-cover"
                    />
                    <span v-else>{{
                      isCaptchaLoading ? t('common.loading') : t('common.captcha')
                    }}</span>
                  </button>
                </div>
              </div>
            </template>

            <div v-if="showSigninPassword" class="flex items-center justify-between">
              <label
                class="flex items-center cursor-pointer"
                @click="handleCheckboxClick('rememberMe')"
              >
                <div
                  class="w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center"
                  :class="
                    formData.signin.rememberMe
                      ? 'bg-theme-primary border-theme-primary'
                      : 'bg-transparent border-text-3'
                  "
                >
                  <CheckIcon
                    v-if="formData.signin.rememberMe"
                    class="w-4 h-4"
                    :class="checkboxAnimating.rememberMe ? 'animate-bounce-forward' : ''"
                  />
                </div>
                <span class="ml-2 text-sm font-[400] text-text-2">{{
                  t('common.remember_me')
                }}</span>
              </label>
              <a href="#" class="text-text-2 text-sm font-[400]" @click.prevent="openResetPassword"
                >{{ t('common.forget_password') }}?</a
              >
            </div>

            <button
              class="btn-primary w-full h-[40px] mt-8 rounded-lg text-sm font-[700] text-text-4 transition-all"
              :class="{ 'opacity-60 cursor-not-allowed': !isSigninValid }"
              :disabled="!isSigninValid"
              @click="handleLogin"
            >
              {{ t('home.sign_In') }}
            </button>

            <div class="text-center text-sm font-[700] text-text-2 mt-6">
              {{ t('common.no_account') }}
              <button
                type="button"
                class="text-theme-primary"
                @click="handleAuthTabSwitch('signup', setActiveTab)"
              >
                {{ t('common.sign_up_now') }}
              </button>
            </div>

            <div
              class="text-center text-sm font-[700] text-theme-primary mt-6 cursor-pointer"
              @click="handleGuestContinue"
            >
              {{ t('common.continue') }}
            </div>
          </template>

          <template v-else-if="activeTab === 'signup'">
            <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.account') }}</div>
            <div class="mb-6">
              <div class="relative">
                <span
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-level-1)] text-base font-[500]"
                >
                  {{ defaultAreaCodeDisplay }}
                </span>
                <input
                  :value="formData.signup.account"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('common.enter_account')"
                  class="auth-input-placeholder w-full h-[42px] pl-[52px] pr-[3px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                  @input="handleSignupAccountInput"
                />
              </div>
            </div>

            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('common.verification') }}
            </div>
            <div class="mb-6">
              <div class="relative">
                <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  :value="formData.signup.code"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('common.enter_verification')"
                  class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-[92px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                  @input="handleSignupCodeInput"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 h-7 min-w-[70px] px-2 text-xs font-[500] rounded-lg transition-opacity"
                  :class="
                    countdown > 0
                      ? 'bg-opacity-6 text-text-2 cursor-not-allowed'
                      : 'bg-secondary-3 text-theme-primary'
                  "
                  :disabled="countdown > 0"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : t('common.get_code') }}
                </button>
              </div>
            </div>

            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('common.password') }}
            </div>
            <div class="mb-6">
              <div class="relative">
                <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  :value="formData.signup.password"
                  :type="showPassword.signup ? 'text' : 'password'"
                  :placeholder="t('common.enter_password')"
                  class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-11 bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                  :class="showPassword.signup ? '' : 'auth-password-mask'"
                  @input="handleSignupPasswordInput"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  @click="togglePassword('signup')"
                >
                  <EyeIcon v-if="showPassword.signup" class="w-5 h-5 text-text-2" />
                  <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                </button>
              </div>
            </div>

            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('common.confirm_password') }}
            </div>
            <div class="mb-8">
              <div class="relative">
                <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  :value="formData.signup.confirmPassword"
                  :type="showPassword.confirmPassword ? 'text' : 'password'"
                  :placeholder="t('common.enter_confirm_password')"
                  class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-11 bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                  :class="showPassword.confirmPassword ? '' : 'auth-password-mask'"
                  @input="handleSignupConfirmPasswordInput"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  @click="togglePassword('confirmPassword')"
                >
                  <EyeIcon v-if="showPassword.confirmPassword" class="w-5 h-5 text-text-2" />
                  <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                </button>
              </div>
            </div>

            <button
              class="btn-primary w-full h-[40px] rounded-lg text-sm font-[700] text-text-4 transition-all"
              :class="{ 'opacity-60 cursor-not-allowed': !isSignupValid }"
              :disabled="!isSignupValid"
              @click="handleRegister"
            >
              {{ t('home.sign_Up') }}
            </button>

            <div class="text-center text-sm font-[700] text-text-2 mt-6">
              {{ t('common.have_account') }}
              <button
                type="button"
                class="text-theme-primary"
                @click="handleAuthTabSwitch('signin', setActiveTab)"
              >
                {{ t('common.log_in_now') }}
              </button>
            </div>

            <div
              class="text-center text-sm font-[700] text-theme-primary mt-6 cursor-pointer"
              @click="handleGuestContinue"
            >
              {{ t('common.continue') }}
            </div>
          </template>
        </div>
        <!-- 手机区号弹窗 -->
        <Teleport to="body">
          <Transition name="fade-accordion">
            <div
              v-if="activeLoginMethod === 'phone' && isSigninAreaCodeDropdownOpen"
              ref="signinAreaCodePopupRef"
              class="fixed z-[10020] flex h-[320px] flex-col overflow-hidden rounded-lg bg-bg-5 p-3"
              :style="signinAreaCodePopupStyle"
            >
              <div class="relative mb-[8px] shrink-0">
                <SearchIcon class="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-icon-3" />
                <input
                  v-model="signinAreaCodeSearchKeyword"
                  type="text"
                  placeholder="Search Country"
                  class="auth-input-placeholder h-10 w-full rounded-[12px] border border-opacity-10 bg-opacity-6 pl-11 pr-3 text-sm font-[400] text-text-1 outline-none transition-colors focus:border-theme-primary placeholder:text-text-3"
                  @click.stop
                />
              </div>
              <div class="min-h-0 flex-1 space-y-2 overflow-y-auto">
                <button
                  v-for="option in filteredPhoneAreaCodeOptions"
                  :key="option.code"
                  type="button"
                  class="flex h-10 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm font-[400] text-text-1 transition-colors"
                  :class="
                    option.code === signinAreaCode ? 'bg-bg-3 font-[700]' : 'hover:bg-opacity-6'
                  "
                  @click.stop="handleSigninAreaCodeSelect(option.code, setSigninAreaCode)"
                >
                  <span>{{ option.country }} ({{ option.display }})</span>
                  <SelectedIcon
                    v-if="option.code === signinAreaCode"
                    class="h-4 w-4 text-theme-primary"
                  />
                </button>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
    </template>
  </LoginRegisterFormCore>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { LoginSetResult } from '@/api/interface/login_register'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import CheckIcon from '@/static/svg/login/check.svg?skipsvgo'
import KeyIcon from '@/static/svg/login/key.svg?skipsvgo'
import XiaIcon from '@/static/svg/login/xia.svg?skipsvgo'
import SearchIcon from '@/static/svg/login/sousuo.svg?skipsvgo'
import SelectedIcon from '@/static/svg/login/selected.svg?skipsvgo'
import { getDefaultAreaCodeDisplay } from '@/utils/locale'
import { getPhoneAreaCodeOption, getPhoneAreaCodeOptions } from '@/utils/phone-input'
import LoginRegisterFormCore from './LoginRegisterFormCore.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()

interface Props {
  defaultTab?: 'signin' | 'signup'
  loginSetting?: LoginSetResult | null
  cardSwitch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin',
  loginSetting: null,
  cardSwitch: false
})

const emit = defineEmits<{
  close: []
  'open-reset-password': []
  'switch-tab': [tab: 'signin' | 'signup']
}>()

const loginFormRef = ref<InstanceType<typeof LoginRegisterFormCore> | null>(null)
const isSigninAreaCodeDropdownOpen = ref(false)
const signinAreaCodeAnchorRef = ref<HTMLElement | null>(null)
const signinAreaCodePopupRef = ref<HTMLElement | null>(null)
const signinAreaCodePopupStyle = ref<Record<string, string>>({})
const signinAreaCodeSearchKeyword = ref('')
const phoneAreaCodeOptions = getPhoneAreaCodeOptions()
const SIGNIN_AREA_CODE_POPUP_HEIGHT = 320
const SIGNIN_AREA_CODE_POPUP_GAP = 4
const SIGNIN_AREA_CODE_POPUP_VIEWPORT_PADDING = 12

const filteredPhoneAreaCodeOptions = computed(() => {
  const keyword = signinAreaCodeSearchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return phoneAreaCodeOptions
  }

  return phoneAreaCodeOptions.filter(option => option.searchText.includes(keyword))
})

/**
 * 获取当前选中的手机号区号配置。
 */
const getSelectedPhoneAreaCode = (areaCode?: string) => {
  return getPhoneAreaCodeOption(areaCode)
}

/**
 * 展开或收起登录手机号区号下拉框。
 */
const toggleSigninAreaCodeDropdown = () => {
  isSigninAreaCodeDropdownOpen.value = !isSigninAreaCodeDropdownOpen.value
}

/**
 * 关闭登录手机号区号下拉框。
 */
const closeSigninAreaCodeDropdown = () => {
  isSigninAreaCodeDropdownOpen.value = false
}

/**
 * 根据输入框位置计算手机号区号下拉框位置和动画高度。
 */
const updateSigninAreaCodePopupPosition = () => {
  const anchor = signinAreaCodeAnchorRef.value

  if (!anchor) {
    return
  }

  const rect = anchor.getBoundingClientRect()
  const preferredTop = rect.bottom + SIGNIN_AREA_CODE_POPUP_GAP
  const fallbackTop = rect.top - SIGNIN_AREA_CODE_POPUP_GAP - SIGNIN_AREA_CODE_POPUP_HEIGHT
  const popupTop =
    preferredTop + SIGNIN_AREA_CODE_POPUP_HEIGHT + SIGNIN_AREA_CODE_POPUP_VIEWPORT_PADDING >
    window.innerHeight
      ? Math.max(SIGNIN_AREA_CODE_POPUP_VIEWPORT_PADDING, fallbackTop)
      : preferredTop

  signinAreaCodePopupStyle.value = {
    top: `${popupTop}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${SIGNIN_AREA_CODE_POPUP_HEIGHT}px`,
    '--fade-accordion-max-height': `${SIGNIN_AREA_CODE_POPUP_HEIGHT}px`
  }
}

/**
 * 窗口尺寸或滚动变化时刷新手机号区号下拉框位置。
 */
const handleSigninAreaCodeWindowChange = () => {
  if (!isSigninAreaCodeDropdownOpen.value) {
    return
  }

  updateSigninAreaCodePopupPosition()
}

/**
 * 点击下拉框外部时关闭手机号区号下拉框。
 */
const handleSigninAreaCodeOutsidePointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null

  if (!target) {
    return
  }

  if (
    signinAreaCodeAnchorRef.value?.contains(target) ||
    signinAreaCodePopupRef.value?.contains(target)
  ) {
    return
  }

  closeSigninAreaCodeDropdown()
}

/**
 * 绑定手机号区号下拉框打开期间需要的全局监听。
 */
const attachSigninAreaCodePopupListeners = () => {
  window.addEventListener('resize', handleSigninAreaCodeWindowChange)
  window.addEventListener('scroll', handleSigninAreaCodeWindowChange, true)
  document.addEventListener('pointerdown', handleSigninAreaCodeOutsidePointerDown, true)
}

/**
 * 移除手机号区号下拉框的全局监听。
 */
const detachSigninAreaCodePopupListeners = () => {
  window.removeEventListener('resize', handleSigninAreaCodeWindowChange)
  window.removeEventListener('scroll', handleSigninAreaCodeWindowChange, true)
  document.removeEventListener('pointerdown', handleSigninAreaCodeOutsidePointerDown, true)
}

/**
 * 选择登录手机号区号，并收起下拉框。
 */
const handleSigninAreaCodeSelect = (
  areaCode: string,
  setSigninAreaCode: (areaCode: string) => void
) => {
  setSigninAreaCode(areaCode)
  signinAreaCodeSearchKeyword.value = ''
  closeSigninAreaCodeDropdown()
}

/**
 * 切换登录方式，并收起手机号区号下拉框。
 */
const handleSigninMethodClick = (
  method: string,
  setActiveLoginMethod: (method: string) => void
) => {
  setActiveLoginMethod(method)
  signinAreaCodeSearchKeyword.value = ''
  closeSigninAreaCodeDropdown()
}

watch(isSigninAreaCodeDropdownOpen, async isOpen => {
  if (!isOpen) {
    detachSigninAreaCodePopupListeners()
    return
  }

  await nextTick()
  updateSigninAreaCodePopupPosition()
  attachSigninAreaCodePopupListeners()
})

watch(
  () => props.defaultTab,
  () => {
    closeSigninAreaCodeDropdown()
    loginFormRef.value?.resetForm()
  }
)

/**
 * 注册成功后关闭登录注册弹窗。
 */
const handleRegisterSuccess = () => {
  emit('close')
}

/**
 * 登录成功后关闭弹窗并刷新页面状态。
 */
const handleLoginSuccess = () => {
  emit('close')
  window.location.reload()
}

/**
 * 游客继续访问时关闭登录注册弹窗。
 */
const handleGuestContinue = () => {
  emit('close')
}

/**
 * 处理登录/注册入口切换；卡片模式下交给外层弹窗播放滑入动画。
 */
const handleAuthTabSwitch = (
  tab: 'signin' | 'signup',
  setActiveTab: (tab: 'signin' | 'signup') => void
) => {
  if (props.cardSwitch) {
    emit('switch-tab', tab)
    return
  }

  setActiveTab(tab)
}

/**
 * 重置桌面端登录注册表单，并关闭手机号区号下拉框。
 */
const resetForm = () => {
  closeSigninAreaCodeDropdown()
  loginFormRef.value?.resetForm()
}

onBeforeUnmount(() => {
  detachSigninAreaCodePopupListeners()
})

defineExpose({
  resetForm
})
</script>

<style scoped lang="scss">
.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}

@keyframes bounceForward {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.animate-bounce-forward {
  animation: bounceForward 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
