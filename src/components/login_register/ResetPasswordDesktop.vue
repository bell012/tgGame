<template>
  <ResetPasswordFormCore @reset-success="emit('reset-success')">
    <template
      #default="{
        showPassword,
        showConfirmPassword,
        formData,
        isResetValid,
        countdown,
        togglePassword,
        toggleConfirmPassword,
        handleSendCode,
        handleResetPassword,
        handleAccountInput,
        handleCodeInput,
        handlePasswordInput,
        handleConfirmPasswordInput
      }"
    >
      <div class="w-full h-full flex flex-col">
        <div class="flex gap-6 mb-10">
          <button
            class="relative pb-3 text-lg font-[800] transition-all duration-200 tab-button-new mr-20"
          >
            <!-- 重置密码 -->
            <span>{{ t('common.reset_password') }}</span>
            <div
              class="absolute bottom-0 left-0 right-0 h-[4px] bg-theme-primary rounded-[10px]"
            ></div>
          </button>
        </div>

        <div class="flex-1 flex flex-col relative">
          <!-- 账号 -->
          <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.account') }}</div>
          <div class="mb-6">
            <!-- 请输入账号 -->
            <div class="relative">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-level-1)] text-base font-[500]"
              >
                {{ defaultAreaCodeDisplay }}
              </span>
              <input
                :value="formData.account"
                type="text"
                inputmode="numeric"
                :placeholder="t('common.enter_account')"
                class="auth-input-placeholder w-full h-[50px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-sm focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                @input="handleAccountInput"
              />
            </div>
          </div>

          <!-- 验证码 -->
          <div class="text-sm font-[700] text-text-1 mb-2">
            {{ t('common.verification') }}
          </div>
          <div class="mb-6">
            <div class="relative">
              <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <!-- 请输入验证码 -->
              <input
                :value="formData.code"
                type="text"
                inputmode="numeric"
                :placeholder="t('common.enter_verification')"
                class="auth-input-placeholder w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-sm focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                @input="handleCodeInput"
              />
              <!-- 获取验证码 -->
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 h-7 min-w-[70px] px-2 text-sm font-[500] rounded-lg transition-opacity"
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

          <!-- 密码 -->
          <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.password') }}</div>
          <div class="mb-6">
            <div class="relative">
              <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <!-- 请输入密码 -->
              <input
                :value="formData.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('common.enter_password')"
                class="auth-input-placeholder w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-sm focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                :class="showPassword ? '' : 'auth-password-mask'"
                @input="handlePasswordInput"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                @click="togglePassword"
              >
                <EyeIcon v-if="showPassword" class="w-5 h-5 text-text-2" />
                <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
              </button>
            </div>
          </div>

          <!-- 确认密码 -->
          <div class="text-sm font-[700] text-text-1 mb-2">
            {{ t('common.confirm_password') }}
          </div>
          <div class="mb-10">
            <div class="relative">
              <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <!-- 请输入确认密码 -->
              <input
                :value="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                :placeholder="t('common.enter_confirm_password')"
                class="auth-input-placeholder w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-sm focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                :class="showConfirmPassword ? '' : 'auth-password-mask'"
                @input="handleConfirmPasswordInput"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                @click="toggleConfirmPassword"
              >
                <EyeIcon v-if="showConfirmPassword" class="w-5 h-5 text-text-2" />
                <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
              </button>
            </div>
          </div>

          <!-- 确认 -->
          <button
            class="btn-primary w-full h-[40px] rounded-lg text-sm text-text-4 transition-all"
            :class="{ 'opacity-40 cursor-not-allowed': !isResetValid }"
            :disabled="!isResetValid"
            @click="handleResetPassword"
          >
            {{ t('common.confirm') }}
          </button>

          <!-- 第三方登录图标 -->
          <!-- <SocialLogin class="absolute bottom-0 right-0 w-full" /> -->
        </div>
      </div>
    </template>
  </ResetPasswordFormCore>
</template>

<script setup lang="ts">
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import { getDefaultAreaCodeDisplay } from '@/utils/locale'
import ResetPasswordFormCore from './ResetPasswordFormCore.vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  'reset-success': []
}>()

const { t } = useI18n()
const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()
</script>

<style scoped lang="scss">
.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}
</style>
