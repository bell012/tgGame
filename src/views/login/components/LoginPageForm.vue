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
        activeSignupMethod,
        loginMethodTabs,
        signupMethodTabs,
        signinAreaCode,
        signupAreaCode,
        showPassword,
        formData,
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
        handleCheckboxClick,
        handleLogin,
        handleRegister,
        handleSendCode,
        openResetPassword,
        handleSigninUsernameInput,
        handleSigninUsernameCompositionStart,
        handleSigninUsernameCompositionEnd,
        handleSigninPhoneInput,
        handleSigninPasswordInput,
        handleSigninSmsCodeInput,
        handleSigninCaptchaInput,
        refreshSigninCaptcha,
        handleSignupUsernameInput,
        handleSignupUsernameCompositionStart,
        handleSignupUsernameCompositionEnd,
        handleSignupPhoneInput,
        handleSignupCodeInput,
        handleSignupCaptchaInput,
        refreshSignupCaptcha,
        handleSignupPasswordInput,
        handleSignupConfirmPasswordInput,
        handleSignupInvitationCodeInput
      }"
    >
      <div class="flex w-full flex-col">
        <div ref="methodTabsRef" class="auth-method-tabs auth-method-tabs-desktop mb-6 flex gap-6">
          <button
            v-for="method in activeTab === 'signin' ? loginMethodTabs : signupMethodTabs"
            :key="method.key"
            :data-method="method.key"
            class="tab-button-new relative min-w-16 px-1 pb-3 font-inter text-lg font-[700] transition-colors duration-200"
            :class="
              (activeTab === 'signin' ? activeLoginMethod : activeSignupMethod) === method.key
                ? 'is-active text-text-1'
                : 'text-text-2'
            "
            @click="
              activeTab === 'signin'
                ? handleSigninMethodClick(method.key, setActiveLoginMethod)
                : handleSignupMethodClick(method.key, setActiveSignupMethod)
            "
          >
            <span>{{ method.label }}</span>
          </button>
          <div
            v-if="(activeTab === 'signin' ? loginMethodTabs : signupMethodTabs).length"
            ref="methodIndicatorRef"
            class="auth-method-indicator auth-method-indicator-desktop"
          ></div>
        </div>

        <!-- 登录 -->
        <template v-if="activeTab === 'signin'">
          <div class="flex flex-col gap-4">
            <div>
              <div class="mb-2 text-sm font-[700] text-text-1">{{ t('common.account') }}</div>
              <div ref="signinAreaCodeAnchorRef" class="relative">
                <KeyIcon
                  v-if="activeLoginMethod === 'username'"
                  class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
                />
                <div
                  v-if="activeLoginMethod === 'phone'"
                  class="absolute left-4 top-1/2 z-10 -translate-y-1/2"
                >
                  <button
                    type="button"
                    class="flex items-center gap-1 text-base font-[700] text-theme-primary"
                    @click.stop="toggleSigninAreaCodeDropdown"
                  >
                    <span>{{ getSelectedPhoneAreaCode(signinAreaCode).display }}</span>
                    <XiaIcon
                      class="h-3 w-3 transition-transform duration-200"
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
                  :class="[inputClass, activeLoginMethod === 'phone' ? 'pl-[82px]' : 'pl-12']"
                  @compositionstart="
                    activeLoginMethod === 'username'
                      ? handleSigninUsernameCompositionStart($event)
                      : undefined
                  "
                  @compositionend="
                    activeLoginMethod === 'username'
                      ? handleSigninUsernameCompositionEnd($event)
                      : undefined
                  "
                  @input="
                    activeLoginMethod === 'username'
                      ? handleSigninUsernameInput($event)
                      : handleSigninPhoneInput($event)
                  "
                />
              </div>
            </div>

            <div v-if="showSigninPassword">
              <div class="mb-2 text-sm font-[700] text-text-1">{{ t('common.password') }}</div>
              <div class="relative">
                <PasswordIcon class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                <input
                  :key="`signin-password-${activeLoginMethod}`"
                  :value="formData.signin.password"
                  :type="showPassword.signin ? 'text' : 'password'"
                  :placeholder="t('common.enter_password')"
                  :class="[
                    inputClass,
                    'pl-12 pr-12',
                    showPassword.signin ? '' : 'auth-password-mask'
                  ]"
                  @input="handleSigninPasswordInput"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center"
                  @click="togglePassword('signin')"
                >
                  <EyeIcon v-if="showPassword.signin" class="h-5 w-5 text-text-2" />
                  <EyeOffIcon v-else class="h-5 w-5 text-text-2" />
                </button>
              </div>
            </div>

            <div v-if="showSigninSmsCode">
              <div class="mb-2 text-sm font-[700] text-text-1">
                {{ t('common.verification') }}
              </div>
              <div class="relative">
                <SafeIcon class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                <input
                  :value="formData.signin.smsCode"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('common.enter_verification')"
                  :class="[inputClass, 'pl-12 pr-[96px]']"
                  @input="handleSigninSmsCodeInput"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 h-7 min-w-[70px] -translate-y-1/2 rounded-lg px-2 text-xs font-[500] transition-opacity"
                  :class="
                    countdown > 0
                      ? 'cursor-not-allowed bg-opacity-6 text-text-2'
                      : 'bg-secondary-3 text-theme-primary'
                  "
                  :disabled="countdown > 0"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : t('common.get_code') }}
                </button>
              </div>
            </div>

            <div v-if="showSigninCaptcha">
              <div class="mb-2 text-sm font-[700] text-text-1">{{ t('common.captcha') }}</div>
              <div class="relative">
                <SafeIcon class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                <input
                  :value="formData.signin.captchaCode"
                  type="text"
                  :placeholder="t('common.enter_captcha')"
                  :class="[inputClass, 'pl-12 pr-[132px]']"
                  @input="handleSigninCaptchaInput"
                />
                <button type="button" :class="captchaButtonClass" @click="refreshSigninCaptcha">
                  <img
                    v-if="captchaImageUrl"
                    :src="captchaImageUrl"
                    alt=""
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{
                    isCaptchaLoading ? t('common.loading') : t('common.captcha')
                  }}</span>
                </button>
              </div>
            </div>

            <div v-if="showSigninPassword" class="flex items-center justify-between">
              <label
                class="flex cursor-pointer items-center"
                @click="handleCheckboxClick('rememberMe')"
              >
                <div
                  class="flex h-5 w-5 items-center justify-center rounded-[6px] border-[1.43px] transition-all duration-200"
                  :class="
                    formData.signin.rememberMe
                      ? 'border-theme-primary bg-theme-primary'
                      : 'border-icon-3 bg-transparent'
                  "
                >
                  <CheckIcon
                    v-if="formData.signin.rememberMe"
                    class="h-5 w-5 text-icon-3"
                    :class="checkboxAnimating.rememberMe ? 'animate-bounce-forward' : ''"
                  />
                </div>
                <span class="ml-2 text-sm font-[400] text-text-2">{{
                  t('common.remember_me')
                }}</span>
              </label>
              <a href="#" class="text-sm font-[400] text-text-2" @click.prevent="openResetPassword"
                >{{ t('common.forget_password') }}?</a
              >
            </div>
          </div>

          <button
            class="btn-primary mt-9 h-10 w-full rounded-lg text-sm font-[700] text-text-4 transition-all"
            :class="{ 'cursor-not-allowed opacity-60': !isSigninValid }"
            :disabled="!isSigninValid"
            @click="handleLogin"
          >
            {{ t('home.sign_In') }}
          </button>

          <div class="mt-6 text-center text-sm font-[700] text-text-2">
            {{ t('common.no_account') }}
            <button
              type="button"
              class="text-theme-primary"
              @click="handleAuthTabSwitch('signup', setActiveTab)"
            >
              {{ t('common.sign_up_now') }}
            </button>
          </div>
        </template>

        <!-- 注册 -->
        <template v-else-if="activeTab === 'signup'">
          <div class="flex flex-col gap-4">
            <div ref="signupAreaCodeAnchorRef" class="relative">
              <KeyIcon
                v-if="activeSignupMethod === 'username'"
                class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
              />
              <div
                v-if="activeSignupMethod === 'phone'"
                class="absolute left-4 top-1/2 z-10 -translate-y-1/2"
              >
                <button
                  type="button"
                  class="flex items-center gap-1 text-base font-[700] text-theme-primary"
                  @click.stop="toggleSignupAreaCodeDropdown"
                >
                  <span>{{ getSelectedPhoneAreaCode(signupAreaCode).display }}</span>
                  <XiaIcon
                    class="h-3 w-3 transition-transform duration-200"
                    :class="isSignupAreaCodeDropdownOpen ? 'rotate-180' : ''"
                  />
                </button>
              </div>
              <input
                :value="
                  activeSignupMethod === 'username'
                    ? formData.signup.usernameAccount
                    : formData.signup.phoneAccount
                "
                type="text"
                :inputmode="activeSignupMethod === 'phone' ? 'numeric' : 'text'"
                :placeholder="
                  activeSignupMethod === 'username'
                    ? t('common.enter_username')
                    : t('common.enter_account')
                "
                :class="[inputClass, activeSignupMethod === 'phone' ? 'pl-[82px]' : 'pl-12']"
                @compositionstart="
                  activeSignupMethod === 'username'
                    ? handleSignupUsernameCompositionStart($event)
                    : undefined
                "
                @compositionend="
                  activeSignupMethod === 'username'
                    ? handleSignupUsernameCompositionEnd($event)
                    : undefined
                "
                @input="
                  activeSignupMethod === 'username'
                    ? handleSignupUsernameInput($event)
                    : handleSignupPhoneInput($event)
                "
              />
            </div>

            <template v-if="showSignupPassword">
              <div class="relative">
                <PasswordIcon class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                <input
                  :value="formData.signup.password"
                  :type="showPassword.signup ? 'text' : 'password'"
                  :placeholder="t('common.enter_password')"
                  :class="[
                    inputClass,
                    'pl-12 pr-12',
                    showPassword.signup ? '' : 'auth-password-mask'
                  ]"
                  @input="handleSignupPasswordInput"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center"
                  @click="togglePassword('signup')"
                >
                  <EyeIcon v-if="showPassword.signup" class="h-5 w-5 text-text-2" />
                  <EyeOffIcon v-else class="h-5 w-5 text-text-2" />
                </button>
              </div>

              <div class="relative">
                <PasswordIcon class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                <input
                  :value="formData.signup.confirmPassword"
                  :type="showPassword.confirmPassword ? 'text' : 'password'"
                  :placeholder="t('common.enter_confirm_password')"
                  :class="[
                    inputClass,
                    'pl-12 pr-12',
                    showPassword.confirmPassword ? '' : 'auth-password-mask'
                  ]"
                  @input="handleSignupConfirmPasswordInput"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center"
                  @click="togglePassword('confirmPassword')"
                >
                  <EyeIcon v-if="showPassword.confirmPassword" class="h-5 w-5 text-text-2" />
                  <EyeOffIcon v-else class="h-5 w-5 text-text-2" />
                </button>
              </div>
            </template>

            <div v-if="showSignupSmsCode" class="relative">
              <SafeIcon class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <input
                :value="formData.signup.code"
                type="text"
                inputmode="numeric"
                :placeholder="t('common.enter_verification')"
                :class="[inputClass, 'pl-12 pr-[96px]']"
                @input="handleSignupCodeInput"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 h-7 min-w-[70px] -translate-y-1/2 rounded-lg px-2 text-xs font-[500] transition-opacity"
                :class="
                  countdown > 0
                    ? 'cursor-not-allowed bg-opacity-6 text-text-2'
                    : 'bg-secondary-3 text-theme-primary'
                "
                :disabled="countdown > 0"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : t('common.get_code') }}
              </button>
            </div>

            <div v-if="showSignupCaptcha" class="relative">
              <SafeIcon class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <input
                :value="formData.signup.captchaCode"
                type="text"
                :placeholder="t('common.enter_captcha')"
                :class="[inputClass, 'pl-12 pr-[132px]']"
                @input="handleSignupCaptchaInput"
              />
              <button type="button" :class="captchaButtonClass" @click="refreshSignupCaptcha">
                <img
                  v-if="captchaImageUrl"
                  :src="captchaImageUrl"
                  alt=""
                  class="h-full w-full object-cover"
                />
                <span v-else>{{
                  isCaptchaLoading ? t('common.loading') : t('common.captcha')
                }}</span>
              </button>
            </div>

            <div v-if="showSignupInvitationCode" class="relative">
              <InviteIcon class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <input
                :value="formData.signup.invitationCode"
                type="text"
                inputmode="numeric"
                :placeholder="t('common.enter_invitation_code')"
                :class="[inputClass, 'pl-12']"
                @input="handleSignupInvitationCodeInput"
              />
            </div>

            <div
              class="flex cursor-pointer items-start gap-3"
              @click="handleCheckboxClick('agreementAccepted')"
            >
              <div
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.43px] transition-all duration-200"
                :class="
                  formData.signup.agreementAccepted
                    ? 'border-theme-primary bg-theme-primary'
                    : 'border-icon-3 bg-transparent'
                "
              >
                <CheckIcon
                  v-if="formData.signup.agreementAccepted"
                  class="h-5 w-5 text-icon-3"
                  :class="checkboxAnimating.agreementAccepted ? 'animate-bounce-forward' : ''"
                />
              </div>
              <p class="min-w-0 flex-1 text-sm font-[400] leading-5 text-text-2">
                {{ t('loginRegister.agreementPrefix') }}
                <button type="button" class="text-theme-primary" @click.stop="openPolicySheet">
                  {{ t('loginRegister.userAgreement') }}
                </button>
                {{ t('loginRegister.agreementMiddle') }}
                <button type="button" class="text-theme-primary" @click.stop="openPolicySheet">
                  {{ t('loginRegister.privacyPolicy') }}
                </button>
                .
              </p>
            </div>
          </div>

          <button
            class="btn-primary mt-6 h-10 w-full rounded-lg text-sm font-[700] text-text-4 transition-all"
            :class="{ 'cursor-not-allowed opacity-60': !isSignupValid }"
            :disabled="!isSignupValid"
            @click="handleRegister"
          >
            {{ t('home.sign_Up') }}
          </button>

          <div class="mt-6 text-center text-sm font-[700] text-text-2">
            {{ t('common.have_account') }}
            <button
              type="button"
              class="text-theme-primary"
              @click="handleAuthTabSwitch('signin', setActiveTab)"
            >
              {{ t('common.log_in_now') }}
            </button>
          </div>
        </template>

        <button
          type="button"
          class="mt-4 text-center text-sm font-[700] text-theme-primary"
          @click="handleGuestContinue"
        >
          {{ t('common.continue') }}
        </button>

        <PhoneAreaCodePopup
          v-if="activeTab === 'signin' && activeLoginMethod === 'phone'"
          v-model="isSigninAreaCodeDropdownOpen"
          :anchor-el="signinAreaCodeAnchorRef"
          :selected-code="signinAreaCode"
          @select="areaCode => handleSigninAreaCodeSelect(areaCode, setSigninAreaCode)"
        />
        <PhoneAreaCodePopup
          v-if="activeTab === 'signup' && activeSignupMethod === 'phone'"
          v-model="isSignupAreaCodeDropdownOpen"
          :anchor-el="signupAreaCodeAnchorRef"
          :selected-code="signupAreaCode"
          @select="areaCode => handleSignupAreaCodeSelect(areaCode, setSignupAreaCode)"
        />
      </div>
    </template>
  </LoginRegisterFormCore>
  <LoginPolicySheet v-model:visible="showPolicySheet" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUpdated, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { LoginSetResult } from '@/api/interface/login_register'
import LoginPolicySheet from '@/components/login_register/LoginPolicySheet.vue'
import LoginRegisterFormCore from '@/components/login_register/LoginRegisterFormCore.vue'
import PhoneAreaCodePopup from '@/components/login_register/PhoneAreaCodePopup.vue'
import CheckIcon from '@/static/svg/login/check.svg?skipsvgo'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import KeyIcon from '@/static/svg/login/key.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import XiaIcon from '@/static/svg/login/xia.svg?skipsvgo'
import InviteIcon from '@/static/svg/login/yaoqing.svg?skipsvgo'
import { getPhoneAreaCodeOption } from '@/utils/phone-input'

type AuthTab = 'signin' | 'signup'

interface Props {
  defaultTab?: AuthTab
  loginSetting?: LoginSetResult | null
  redirect: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin',
  loginSetting: null
})

const emit = defineEmits<{
  'open-reset-password': []
  'switch-tab': [tab: AuthTab]
}>()

const { t, locale } = useI18n()
const router = useRouter()

const inputClass =
  'auth-input-placeholder h-[50px] w-full rounded-lg border border-input-2 bg-input-3 text-sm font-[700] text-text-1 placeholder:text-sm placeholder:font-[400] placeholder:text-text-3 focus:border-theme-primary focus:outline-none'
const captchaButtonClass =
  'absolute right-[5px] top-1/2 flex h-10 w-[119px] -translate-y-1/2 items-center justify-center overflow-hidden rounded-lg bg-bg-2 text-xs text-text-2'

const loginFormRef = ref<InstanceType<typeof LoginRegisterFormCore> | null>(null)
const methodTabsRef = ref<HTMLElement | null>(null)
const methodIndicatorRef = ref<HTMLElement | null>(null)
const isSigninAreaCodeDropdownOpen = ref(false)
const isSignupAreaCodeDropdownOpen = ref(false)
const signinAreaCodeAnchorRef = ref<HTMLElement | null>(null)
const signupAreaCodeAnchorRef = ref<HTMLElement | null>(null)
const showPolicySheet = ref(false)

const updateMethodIndicatorPosition = () => {
  const tabs = methodTabsRef.value
  const indicator = methodIndicatorRef.value
  const activeButton = tabs?.querySelector<HTMLElement>('.tab-button-new.is-active')
  if (!tabs || !indicator || !activeButton) return

  const centerOffset =
    activeButton.offsetLeft + activeButton.offsetWidth / 2 - indicator.offsetWidth / 2
  indicator.style.transform = `translateX(${centerOffset}px)`
}

onMounted(updateMethodIndicatorPosition)
onUpdated(updateMethodIndicatorPosition)
watch(locale, () => nextTick(updateMethodIndicatorPosition))

const getSelectedPhoneAreaCode = (areaCode?: string) => getPhoneAreaCodeOption(areaCode)

const toggleSigninAreaCodeDropdown = () => {
  isSigninAreaCodeDropdownOpen.value = !isSigninAreaCodeDropdownOpen.value
}

const toggleSignupAreaCodeDropdown = () => {
  isSignupAreaCodeDropdownOpen.value = !isSignupAreaCodeDropdownOpen.value
}

const closeAreaCodeDropdowns = () => {
  isSigninAreaCodeDropdownOpen.value = false
  isSignupAreaCodeDropdownOpen.value = false
}

const handleSigninAreaCodeSelect = (
  areaCode: string,
  setSigninAreaCode: (areaCode: string) => void
) => {
  setSigninAreaCode(areaCode)
  closeAreaCodeDropdowns()
}

const handleSignupAreaCodeSelect = (
  areaCode: string,
  setSignupAreaCode: (areaCode: string) => void
) => {
  setSignupAreaCode(areaCode)
  closeAreaCodeDropdowns()
}

const handleSigninMethodClick = (
  method: string,
  setActiveLoginMethod: (method: string) => void
) => {
  setActiveLoginMethod(method)
  closeAreaCodeDropdowns()
  nextTick(updateMethodIndicatorPosition)
}

const handleSignupMethodClick = (
  method: string,
  setActiveSignupMethod: (method: string) => void
) => {
  setActiveSignupMethod(method)
  closeAreaCodeDropdowns()
  nextTick(updateMethodIndicatorPosition)
}

watch(
  () => props.defaultTab,
  () => {
    closeAreaCodeDropdowns()
    loginFormRef.value?.resetForm()
  },
  { flush: 'post' }
)

/** 登录成功后整页跳回来源页，让各模块按登录态重新初始化。 */
const handleLoginSuccess = () => {
  window.location.replace(router.resolve(props.redirect).href)
}

const handleRegisterSuccess = () => {
  void router.replace(props.redirect)
}

const handleGuestContinue = () => {
  void router.replace(props.redirect)
}

const openPolicySheet = () => {
  showPolicySheet.value = true
}

const handleAuthTabSwitch = (tab: AuthTab, setActiveTab: (tab: AuthTab) => void) => {
  setActiveTab(tab)
  emit('switch-tab', tab)
}
</script>

<style scoped>
.tab-button-new:active {
  transform: scale(0.98);
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
