<template>
  <LoginRegisterFormCore
    ref="loginFormRef"
    :default-tab="defaultTab"
    @register-success="handleRegisterSuccess"
    @login-success="handleLoginSuccess"
  >
    <template
      #default="{
        activeTab,
        showPassword,
        formData,
        checkboxAnimating,
        countdown,
        isSigninValid,
        isSignupValid,
        setActiveTab,
        togglePassword,
        handleCheckboxClick,
        handleLogin,
        handleRegister,
        handleSendCode,
        openResetPassword,
        handleSigninAccountInput,
        handleSignupAccountInput,
        handleSignupCodeInput,
        handleSigninPasswordInput,
        handleSignupPasswordInput,
        handleSignupConfirmPasswordInput
      }"
    >
      <div class="w-full h-full flex flex-col">
        <div class="flex gap-6 mb-10">
          <button
            class="relative w-20 pb-1.5 text-lg font-[800] transition-all duration-200 tab-button-new mr-10"
            :class="activeTab === 'signin' ? 'text-text-1' : 'text-text-2'"
            @click="setActiveTab('signin')"
          >
            <!-- 登录 -->
            <span>{{ t('home.sign_In') }}</span>
            <div
              v-if="activeTab === 'signin'"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
            ></div>
          </button>
          <button
            class="relative w-20 pb-1.5 text-lg font-[800] transition-all duration-200 tab-button-new"
            :class="activeTab === 'signup' ? 'text-text-1' : 'text-text-2'"
            @click="setActiveTab('signup')"
          >
            <!-- 注册 -->
            <span>{{ t('home.sign_Up') }}</span>
            <div
              v-if="activeTab === 'signup'"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
            ></div>
          </button>
        </div>

        <div class="flex-1 flex flex-col relative">
          <template v-if="activeTab === 'signin'">
            <!-- 账号 -->
            <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.account') }}</div>
            <div class="mb-6">
              <!-- 请输入账号 -->
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-theme-level-1)] text-xs font-[500]"
                >
                  {{ defaultAreaCodeDisplay }}
                </span>
                <input
                  :value="formData.signin.account"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('common.enter_account')"
                  class="w-full h-[50px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  @input="handleSigninAccountInput"
                />
              </div>
            </div>

            <!-- 密码 -->
            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('common.password') }}
            </div>
            <div class="mb-6">
              <div class="relative">
                <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                <!-- 请输入密码 -->
                <input
                  :value="formData.signin.password"
                  :type="showPassword.signin ? 'text' : 'password'"
                  :placeholder="t('common.enter_password')"
                  class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  @input="handleSigninPasswordInput"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  @click="togglePassword('signin')"
                >
                  <EyeIcon v-if="!showPassword.signin" class="w-5 h-5 text-text-2" />
                  <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                </button>
              </div>
            </div>

            <!-- 记住我 & 忘记密码 -->
            <div class="flex items-center justify-between">
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
                <!-- 记住我 -->
                <span class="ml-1 text-sm font-[400] text-text-2">{{
                  t('common.remember_me')
                }}</span>
              </label>
              <!-- 忘记密码 -->
              <a href="#" class="text-text-2 text-sm font-[400]" @click.prevent="openResetPassword"
                >{{ t('common.forget_password') }}?</a
              >
            </div>

            <!-- 登录 -->
            <button
              class="btn-primary w-full h-[40px] mt-10 rounded-lg text-sm text-text-4 transition-all"
              :class="{ 'opacity-40 cursor-not-allowed': !isSigninValid }"
              :disabled="!isSigninValid"
              @click="handleLogin"
            >
              {{ t('home.sign_In') }}
            </button>

            <!-- 以访客身份 -->
            <div
              class="text-center text-sm font-[700] text-theme-primary mt-6 cursor-pointer"
              @click="handleGuestContinue"
            >
              {{ t('common.continue') }}
            </div>
          </template>

          <template v-else-if="activeTab === 'signup'">
            <!-- 账号 -->
            <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.account') }}</div>
            <div class="mb-6">
              <!-- 请输入账号 -->
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-theme-level-1)] text-xs font-[500]"
                >
                  {{ defaultAreaCodeDisplay }}
                </span>
                <input
                  :value="formData.signup.account"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('common.enter_account')"
                  class="w-full h-[50px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  @input="handleSignupAccountInput"
                />
              </div>
            </div>

            <!-- 验证码 -->
            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('common.verification') }}
            </div>
            <div class="mb-6">
              <div class="relative">
                <SafeIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                <!-- 请输入验证码 -->
                <input
                  :value="formData.signup.code"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('common.enter_verification')"
                  class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  @input="handleSignupCodeInput"
                />
                <!-- 获取验证码 -->
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 bg-secondary-3 text-theme-primary text-xs font-[500] rounded-lg transition-opacity"
                  :class="{ 'opacity-50 cursor-not-allowed': countdown > 0 }"
                  :disabled="countdown > 0"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : t('common.get_code') }}
                </button>
              </div>
            </div>

            <!-- 密码 -->
            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('common.password') }}
            </div>
            <div class="mb-10">
              <div class="relative">
                <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                <!-- 请输入密码 -->
                <input
                  :value="formData.signup.password"
                  :type="showPassword.signup ? 'text' : 'password'"
                  :placeholder="t('common.enter_password')"
                  class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  @input="handleSignupPasswordInput"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  @click="togglePassword('signup')"
                >
                  <EyeIcon v-if="!showPassword.signup" class="w-5 h-5 text-text-2" />
                  <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                </button>
              </div>
            </div>

            <!-- 确认密码 -->
            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('common.confirm_password') }}
            </div>
            <div class="mb-6">
              <div class="relative">
                <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                <!-- 请输入确认密码 -->
                <input
                  :value="formData.signup.confirmPassword"
                  :type="showPassword.confirmPassword ? 'text' : 'password'"
                  :placeholder="t('common.enter_confirm_password')"
                  class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  @input="handleSignupConfirmPasswordInput"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  @click="togglePassword('confirmPassword')"
                >
                  <EyeIcon v-if="!showPassword.confirmPassword" class="w-5 h-5 text-text-2" />
                  <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                </button>
              </div>
            </div>

            <!-- 注册 -->
            <button
              class="btn-primary w-full h-[40px] rounded-lg text-sm text-text-4 transition-all"
              :class="{ 'opacity-40 cursor-not-allowed': !isSignupValid }"
              :disabled="!isSignupValid"
              @click="handleRegister"
            >
              {{ t('home.sign_Up') }}
            </button>

            <!-- 以访客身份 -->
            <div
              class="text-center text-sm font-[700] text-theme-primary mt-6 cursor-pointer"
              @click="handleGuestContinue"
            >
              {{ t('common.continue') }}
            </div>
          </template>

          <!-- 第三方登录图标 -->
          <!-- <SocialLogin class="absolute bottom-0 right-0 w-full" /> -->
        </div>
      </div>
    </template>
  </LoginRegisterFormCore>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import CheckIcon from '@/static/svg/login/check.svg?skipsvgo'
import { getDefaultAreaCodeDisplay } from '@/utils/locale'
import LoginRegisterFormCore from './LoginRegisterFormCore.vue'
import { useI18n } from 'vue-i18n'
// import SocialLogin from './SocialLogin.vue'

const { t } = useI18n()
const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()
interface Props {
  defaultTab?: 'signin' | 'signup'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin'
})

const emit = defineEmits<{
  close: []
}>()

const loginFormRef = ref<InstanceType<typeof LoginRegisterFormCore> | null>(null)

// 监听 defaultTab 变化，清空表单
watch(
  () => props.defaultTab,
  () => {
    loginFormRef.value?.resetForm()
  }
)

// 处理注册成功
const handleRegisterSuccess = () => {
  emit('close')
}

// 处理登录成功
const handleLoginSuccess = () => {
  emit('close')
  window.location.reload()
}

/**
 * 以访客身份继续时关闭当前弹窗。
 */
const handleGuestContinue = () => {
  emit('close')
}

const resetForm = () => {
  loginFormRef.value?.resetForm()
}

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
