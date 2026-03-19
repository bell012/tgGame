<template>
  <LoginRegisterFormCore :default-tab="defaultTab">
    <template
      #default="{
        activeTab,
        showPassword,
        formData,
        checkboxAnimating,
        setActiveTab,
        togglePassword,
        handleCheckboxClick,
        handleLogin,
        handleRegister,
        handleSendCode,
        openResetPassword,
        handleSigninAccountInput,
        handleSignupAccountInput
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
            <span>{{ t('locales.home.sign_In') }}</span>
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
            <span>{{ t('locales.home.sign_Up') }}</span>
            <div
              v-if="activeTab === 'signup'"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
            ></div>
          </button>
        </div>

        <div class="flex-1 flex flex-col relative">
          <template v-if="activeTab === 'signin'">
            <!-- 账号 -->
            <div class="text-sm font-[700] text-text-1 mb-2">{{ t('locales.common.account') }}</div>
            <div class="mb-6">
              <!-- 请输入账号 -->
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-theme-level-1)] text-xs font-[500]"
                >
                  +63
                </span>
                <input
                  :value="formData.signin.account"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('locales.common.enter_account')"
                  class="w-full h-[50px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  @input="handleSigninAccountInput"
                />
              </div>
            </div>

            <!-- 密码 -->
            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('locales.common.password') }}
            </div>
            <div class="mb-6">
              <div class="relative">
                <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
                <!-- 请输入密码 -->
                <input
                  v-model="formData.signin.password"
                  :type="showPassword.signin ? 'text' : 'password'"
                  :placeholder="t('locales.common.enter_password')"
                  class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  @click="togglePassword('signin')"
                >
                  <EyeIcon v-if="!showPassword.signin" class="w-5 h-5 fill-none" />
                  <EyeOffIcon v-else class="w-5 h-5 fill-none" />
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
                  t('locales.common.remember_me')
                }}</span>
              </label>
              <!-- 忘记密码 -->
              <a href="#" class="text-text-2 text-sm font-[400]" @click.prevent="openResetPassword"
                >{{ t('locales.common.forget_password') }}?</a
              >
            </div>

            <!-- 登录 -->
            <button
              class="btn-primary w-full h-[40px] mt-10 rounded-lg text-sm text-text-4"
              @click="handleLogin"
            >
              {{ t('locales.home.sign_In') }}
            </button>

            <!-- 以访客身份 -->
            <div class="text-center text-sm font-[700] text-theme-primary mt-6 cursor-pointer">
              {{ t('locales.common.continue') }}
            </div>
          </template>

          <template v-else-if="activeTab === 'signup'">
            <!-- 账号 -->
            <div class="text-sm font-[700] text-text-1 mb-2">{{ t('locales.common.account') }}</div>
            <div class="mb-6">
              <!-- 请输入账号 -->
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-theme-level-1)] text-xs font-[500]"
                >
                  +63
                </span>
                <input
                  :value="formData.signup.account"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('locales.common.enter_account')"
                  class="w-full h-[50px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  @input="handleSignupAccountInput"
                />
              </div>
            </div>

            <!-- 验证码 -->
            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('locales.common.verification') }}
            </div>
            <div class="mb-6">
              <div class="relative">
                <SafeIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
                <!-- 请输入验证码 -->
                <input
                  v-model="formData.signup.code"
                  type="text"
                  :placeholder="t('locales.common.enter_verification')"
                  class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                />
                <!-- 获取验证码 -->
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 bg-secondary-3 text-theme-primary text-xs font-[500] rounded-lg"
                  @click="handleSendCode"
                >
                  {{ t('locales.common.get_code') }}
                </button>
              </div>
            </div>

            <!-- 密码 -->
            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('locales.common.password') }}
            </div>
            <div class="mb-10">
              <div class="relative">
                <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
                <!-- 请输入密码 -->
                <input
                  v-model="formData.signup.password"
                  :type="showPassword.signup ? 'text' : 'password'"
                  :placeholder="t('locales.common.enter_password')"
                  class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  @click="togglePassword('signup')"
                >
                  <EyeIcon v-if="!showPassword.signup" class="w-5 h-5 fill-none" />
                  <EyeOffIcon v-else class="w-5 h-5 fill-none" />
                </button>
              </div>
            </div>

            <!-- 确认密码 -->
            <div class="text-sm font-[700] text-text-1 mb-2">
              {{ t('locales.common.confirm_password') }}
            </div>
            <div class="mb-6">
              <div class="relative">
                <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
                <!-- 请输入确认密码 -->
                <input
                  v-model="formData.signup.confirmPassword"
                  :type="showPassword.confirmPassword ? 'text' : 'password'"
                  :placeholder="t('locales.common.enter_confirm_password')"
                  class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  @click="togglePassword('confirmPassword')"
                >
                  <EyeIcon v-if="!showPassword.confirmPassword" class="w-5 h-5 fill-none" />
                  <EyeOffIcon v-else class="w-5 h-5 fill-none" />
                </button>
              </div>
            </div>

            <!-- 注册 -->
            <button
              class="btn-primary w-full h-[40px] rounded-lg text-sm text-text-4"
              @click="handleRegister"
            >
              {{ t('locales.home.sign_Up') }}
            </button>

            <!-- 以访客身份 -->
            <div class="text-center text-sm font-[700] text-theme-primary mt-6 cursor-pointer">
              {{ t('locales.common.continue') }}
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
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?component'
import PasswordIcon from '@/static/svg/login/password.svg?component'
import CheckIcon from '@/static/svg/login/check.svg?component'
import LoginRegisterFormCore from './LoginRegisterFormCore.vue'
import { useI18n } from 'vue-i18n'
// import SocialLogin from './SocialLogin.vue'

const { t } = useI18n()
interface Props {
  defaultTab?: 'signin' | 'signup'
}

withDefaults(defineProps<Props>(), {
  defaultTab: 'signin'
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
