<template>
  <div class="w-full h-full flex flex-col">
    <h2 class="text-[18px] font-[800] text-text-1 mb-4">注册</h2>

    <div class="flex-1 flex flex-col relative">
      <!-- 用户名/邮箱/电话 -->
      <div class="mt-4">
        <input
          v-model="formData.username"
          type="text"
          placeholder="电子邮件 / 电话号码"
          class="w-full h-[40px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
        />
      </div>

      <!-- 使用名称 -->
      <div class="mt-4">
        <div class="relative">
          <input
            v-model="formData.displayName"
            type="text"
            placeholder="使用名称"
            class="w-full h-[40px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
          />
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
          >
            <RenovateIcon class="w-6 h-6 fill-text-1 fill-none" />
          </button>
        </div>
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
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center"
            @click="showPassword = !showPassword"
          >
            <EyeIcon v-if="!showPassword" class="w-6 h-6 fill-text-1 fill-none" />
            <EyeOffIcon v-else class="w-6 h-6 fill-text-1 fill-none" />
          </button>
        </div>
      </div>

      <!-- 输入推荐/促销代码 -->
      <div class="mt-3 h-6">
        <div
          class="flex items-center justify-stretch cursor-pointer text-text-1 text-[14px] font-[600]"
          @click="togglePromoCode"
        >
          <span class="mr-1 text-[14px] text-text-2">输入推荐/促销代码</span>
          <div class="transition-transform duration-300" :class="{ 'rotate-180': showPromoCode }">
            <ChevronIcon class="w-4 h-4 fill-none" />
          </div>
        </div>
      </div>

      <transition name="expand">
        <div v-if="showPromoCode" class="mt-3">
          <input
            v-model="formData.promoCode"
            type="text"
            placeholder="输入推荐/促销代码"
            class="w-full h-[40px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
          />
        </div>
      </transition>

      <!-- 同意条款 -->
      <div class="mt-1">
        <label
          class="flex items-center cursor-pointer"
          @click="handleCheckboxClick('agreeTerms')"
        >
          <span
            class="flex-shrink-0 w-[15px] h-[15px] rounded flex items-center justify-center mr-3"
            :class="formData.agreeTerms ? '' : 'border-2 border-text-3'"
          >
            <CheckIcon
              v-if="formData.agreeTerms"
              class="w-[15px] h-[15px]"
              :class="checkboxAnimating.agreeTerms ? 'animate-bounce-forward' : ''"
            />
          </span>
          <p class="text-[14px] text-text-2 flex">
            我同意
            <span class="text-[14px] text-text-1 cursor-pointer" @click.stop>「使用者协议」</span>
            并确认我已年满 18 岁
          </p>
        </label>
      </div>

      <!-- 接收营销信息 -->
      <div>
        <label
          class="flex items-center cursor-pointer"
          @click="handleCheckboxClick('receiveMarketing')"
        >
          <span
            class="flex-shrink-0 w-[15px] h-[15px] rounded flex items-center justify-center mr-3"
            :class="formData.receiveMarketing ? '' : 'border-2 border-text-3'"
          >
            <CheckIcon
              v-if="formData.receiveMarketing"
              class="w-[15px] h-[15px]"
              :class="checkboxAnimating.receiveMarketing ? 'animate-bounce-forward' : ''"
            />
          </span>
          <span class="text-[14px] text-text-2">
            我同意接收 TG.GAME的行销促销活动。
          </span>
        </label>
      </div>

      <button class="btn-primary w-full h-[40px] mt-6 rounded-lg text-[14px] text-text-4">
        注册
      </button>

      <div class="mt-6 flex h-6 items-center">
        <span class="test-[14px] text-text-1">已经是一个用户了?</span>
        <button class="test-[14px] text-theme-primary cursor-pointer font-[800] ml-2" @click="emit('switch-to-login')">
          登入
        </button>
      </div>

      <!-- 第三方登录图标 -->
      <SocialLogin :show-key-login="false" class="absolute bottom-0 right-0 w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RenovateIcon from '@/static/svg/login/renovate.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import CheckIcon from '@/static/svg/login/check.svg?component'
import ChevronIcon from '@/static/svg/login/chevron.svg?component'
import SocialLogin from './SocialLogin.vue'

const emit = defineEmits<{
  'switch-to-login': []
}>()

const showPassword = ref(false)
const showPromoCode = ref(false)

const formData = ref({
  username: '',
  displayName: '',
  password: '',
  promoCode: '',
  agreeTerms: false,
  receiveMarketing: false
})

// 切换促销代码输入框显示/隐藏
const togglePromoCode = () => {
  showPromoCode.value = !showPromoCode.value
}

// 复选框动画状态
const checkboxAnimating = ref({
  agreeTerms: false,
  receiveMarketing: false
})

// 复选框点击
const handleCheckboxClick = (field: 'agreeTerms' | 'receiveMarketing') => {
  const willBeChecked = !formData.value[field]

  if (willBeChecked) {
    checkboxAnimating.value[field] = true
    formData.value[field] = true

    setTimeout(() => {
      checkboxAnimating.value[field] = false
    }, 300)
  } else {
    checkboxAnimating.value[field] = true
    setTimeout(() => {
      formData.value[field] = false
      checkboxAnimating.value[field] = false
    }, 150) 
  }
}
</script>

<style scoped lang="scss">
// 复选框动画
@keyframes bounceForward {
  0% {
    transform: scale(1);
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

// 展开/收起动画
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 100px;
  opacity: 1;
}
</style>
