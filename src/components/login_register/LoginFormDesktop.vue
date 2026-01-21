<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex gap-6 mb-10">
      <button
        class="relative w-20 pb-1.5 text-lg font-[800] transition-all duration-200 tab-button-new mr-10"
        :class="activeTab === 'signin' ? 'text-text-1' : 'text-text-2'"
        @click="setActiveTab('signin')"
      >
        <span>登录</span>
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
        <span>注册</span>
        <div
          v-if="activeTab === 'signup'"
          class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
        ></div>
      </button>
    </div>

    <div class="flex-1 flex flex-col relative">
      <template v-if="activeTab === 'signin'">
        <div class="text-sm font-[700] text-text-1 mb-2">账号</div>
        <div class="mb-6">
          <input
            v-model="formData.username"
            type="text"
            placeholder="Account"
            class="w-full h-[50px] pl-2 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
          />
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

        <!-- 记住我 & 忘记密码 -->
        <div class="flex items-center justify-between">
          <label
            class="flex items-center cursor-pointer"
            @click="handleCheckboxClick('rememberMe')"
          >
            <div
              class="w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center"
              :class="
                formData.rememberMe
                  ? 'bg-theme-primary border-theme-primary'
                  : 'bg-transparent border-text-3'
              "
            >
              <CheckIcon
                v-if="formData.rememberMe"
                class="w-4 h-4"
                :class="checkboxAnimating.rememberMe ? 'animate-bounce-forward' : ''"
              />
            </div>
            <span class="ml-1 text-sm font-[400] text-text-2">记住我</span>
          </label>
          <a
            href="#"
            class="text-text-2 text-sm font-[400]"
            @click.prevent="emit('open-reset-password')"
            >忘记密码?</a
          >
        </div>

        <button
          class="btn-primary w-full h-[40px] mt-10 rounded-lg text-sm text-text-4"
          @click="handleLogin"
        >
          登入
        </button>

        <div class="text-center text-sm font-[700] text-theme-primary mt-6">以访客身份</div>
      </template>

      <template v-else-if="activeTab === 'signup'">
        <div class="text-sm font-[700] text-text-1 mb-2">账号</div>
        <div class="mb-6">
          <input
            v-model="formData.registerUsername"
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
              v-model="formData.verificationCode"
              type="text"
              placeholder="code"
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
        <div class="mb-10">
          <div class="relative">
            <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
            <input
              v-model="formData.registerPassword"
              :type="showRegisterPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full h-[50px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
              @click="toggleRegisterPassword"
            >
              <EyeIcon v-if="!showRegisterPassword" class="w-5 h-5 fill-none" />
              <EyeOffIcon v-else class="w-5 h-5 fill-none" />
            </button>
          </div>
        </div>

        <div class="text-sm font-[700] text-text-1 mb-2">确认密码</div>
        <div class="mb-6">
          <div class="relative">
            <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none" />
            <input
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm Password"
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
          @click="handleRegister"
        >
          注册
        </button>

        <div class="text-center text-sm font-[700] text-theme-primary mt-6">以访客身份</div>
      </template>

      <!-- 第三方登录图标 -->
      <!-- <SocialLogin class="absolute bottom-0 right-0 w-full" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?component'
import PasswordIcon from '@/static/svg/login/password.svg?component'
import CheckIcon from '@/static/svg/login/check.svg?component'
// import SocialLogin from './SocialLogin.vue'

interface Props {
  defaultTab?: 'signin' | 'signup'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin'
})

const emit = defineEmits<{
  'open-reset-password': []
}>()

const activeTab = ref<'signin' | 'signup'>(props.defaultTab)

watch(
  () => props.defaultTab,
  newTab => {
    activeTab.value = newTab
  }
)
const showPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

const checkboxAnimating = ref({
  rememberMe: false
})

const formData = ref({
  username: '',
  password: '',
  rememberMe: false,
  registerUsername: '',
  verificationCode: '',
  registerPassword: '',
  confirmPassword: ''
})

const setActiveTab = (tab: 'signin' | 'signup') => {
  activeTab.value = tab
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleRegisterPassword = () => {
  showRegisterPassword.value = !showRegisterPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleCheckboxClick = (field: 'rememberMe') => {
  formData.value[field] = !formData.value[field]
  checkboxAnimating.value[field] = true
  setTimeout(() => {
    checkboxAnimating.value[field] = false
  }, 300)
}

const handleLogin = () => {
  console.log('登录', formData.value)
}

const handleRegister = () => {
  console.log('注册', formData.value)
}

const handleSendCode = () => {
  console.log('发送验证码')
}
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
