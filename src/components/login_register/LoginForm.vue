<template>
  <div class="w-full h-full flex flex-col">
    <h2 class="text-[18px] font-[800] text-text-1 mb-4">登入</h2>

    <div class="flex bg-bg-2 rounded-lg mb-2">
      <button
        class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-all duration-300"
        :class="activeTab === 'password' ? 'bg-bg-3 border border-primary text-text-1' : 'text-text-2'"
        @click="activeTab = 'password'"
      >
        <LockIcon class="w-4 h-4 fill-none" />
        密码
      </button>
      <button
        class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-all duration-300"
        :class="activeTab === 'otp' ? 'bg-bg-3 border border-primary text-text-1' : 'text-text-2'"
        @click="activeTab = 'otp'"
      >
        <KeyIcon class="w-4 h-4 fill-none" />
        一次性验证码
      </button>
    </div>

    <div class="flex items-center justify-end gap-2 text-[14px] mt-1 font-[800] text-text-2  cursor-pointer">
      <span>下载App，开启更多精彩</span>
      <ExternalIcon class="w-5 h-5 fill-none" />
    </div>

    <div class="flex-1 flex flex-col relative">
      <template v-if="activeTab === 'password'">
        <!-- 用户名/邮箱/电话 -->
        <div class="mt-4">
          <input
            v-model="formData.username"
            type="text"
            placeholder="电子邮件 / 电话号码 / 用户名"
            class="w-full h-[40px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
          />
        </div>

        <!-- 密码 -->
        <div class="mt-4">
          <div class="relative">
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="密码"
              class="w-full h-[40px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
              @click="showPassword = !showPassword"
            >
              <EyeIcon v-if="!showPassword" class="w-6 h-6 fill-text-1 fill-none" />
              <EyeOffIcon v-else class="w-6 h-6 fill-text-1 fill-none" />
            </button>
          </div>
        </div>

        <!-- 忘记密码 -->
        <div class="text-right mt-4">
          <a href="#" class="text-text-2 text-[14px] font-[800] hover:text-text-2 transition-colors">忘记密码?</a>
        </div>

        <!-- 登入按钮 -->
        <button class="btn-primary w-full h-[40px] mt-6 rounded-lg text-[14px] text-text-4">
          登入
        </button>
      </template>

      <template v-else-if="activeTab === 'otp'">
        <!-- 电子邮件/电话号码 -->
        <div class="mt-4">
          <input
            v-model="formData.otpContact"
            type="text"
            placeholder="电子邮件 / 电话号码"
            class="w-full h-[40px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
          />
        </div>

        <div class="mt-4 text-center text-[14px] font-[800] text-text-2">
          我们将向您的邮箱发送一个一次性验证码
        </div>

        <button class="btn-primary w-full h-[40px] mt-6 rounded-lg text-[14px] text-text-4">
          传送一次性验证码
        </button>
      </template>

      <div class="text-left mt-6">
        <span class="text-[14px] text-text-1">您是 BC.GAME的新用户？</span>
        <button 
          class="text-theme-primary text-[14px] ml-2 font-[800]"
          @click="emit('switch-to-register')"
        >
          建立账号
        </button>
      </div>

      <!-- 第三方登录图标 -->
      <SocialLogin class="absolute bottom-0 right-0 w-full"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LockIcon from '@/static/svg/login/lock.svg?component'
import KeyIcon from '@/static/svg/login/key.svg?component'
import ExternalIcon from '@/static/svg/login/external.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SocialLogin from './SocialLogin.vue'

const emit = defineEmits<{
  'switch-to-register': []
}>()

const activeTab = ref<'password' | 'otp'>('password')
const showPassword = ref(false)

const formData = ref({
  username: '',
  password: '',
  otpContact: ''
})
</script>

<style scoped lang="scss">
</style>

