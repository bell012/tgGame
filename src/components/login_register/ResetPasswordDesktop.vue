<template>
  <ResetPasswordFormCore>
    <template
      #default="{
        showPassword,
        showConfirmPassword,
        formData,
        togglePassword,
        toggleConfirmPassword,
        handleSendCode,
        handleResetPassword
      }"
    >
      <div class="w-full h-full flex flex-col">
        <div class="flex gap-6 mb-10">
          <button
            class="relative w-20 pb-1.5 text-lg font-[800] transition-all duration-200 tab-button-new mr-20"
          >
            <span>忘记密码</span>
            <div
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
            ></div>
          </button>
        </div>

        <div class="flex-1 flex flex-col relative">
          <div class="text-sm font-[700] text-text-1 mb-2">账号</div>
          <div class="mb-6">
            <input
              v-model="formData.account"
              type="text"
              placeholder="Account"
              class="w-full h-[50px] pl-2 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
            />
          </div>

          <div class="text-sm font-[700] text-text-1 mb-2">验证码</div>
          <div class="mb-6">
            <div class="relative">
              <SafeIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
              <input
                v-model="formData.code"
                type="text"
                placeholder="验证码"
                class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 bg-secondary-3 text-theme-primary text-xs font-[500] rounded-lg"
                @click="handleSendCode"
              >
                Get Code
              </button>
            </div>
          </div>

          <div class="text-sm font-[700] text-text-1 mb-2">密码</div>
          <div class="mb-6">
            <div class="relative">
              <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                @click="togglePassword"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5 fill-none" />
                <EyeOffIcon v-else class="w-5 h-5 fill-none" />
              </button>
            </div>
          </div>

          <div class="text-sm font-[700] text-text-1 mb-2">确认密码</div>
          <div class="mb-10">
            <div class="relative">
              <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
              <input
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="确认密码"
                class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                @click="toggleConfirmPassword"
              >
                <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5 fill-none" />
                <EyeOffIcon v-else class="w-5 h-5 fill-none" />
              </button>
            </div>
          </div>

          <button
            class="btn-primary w-full h-[40px] rounded-lg text-sm text-text-4"
            @click="handleResetPassword"
          >
            确认
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
import SafeIcon from '@/static/svg/login/safe.svg?component'
import PasswordIcon from '@/static/svg/login/password.svg?component'
import ResetPasswordFormCore from './ResetPasswordFormCore.vue'
// import SocialLogin from './SocialLogin.vue'
</script>

<style scoped lang="scss">
.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}
</style>
