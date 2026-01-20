<template>
  <RegisterFormCore
    v-slot="{
      showPassword,
      showPromoCode,
      formData,
      checkboxAnimating,
      togglePassword,
      togglePromoCode,
      handleCheckboxClick,
      handleRegister,
      switchToLogin
    }"
    @switch-to-login="emit('switch-to-login')"
  >
    <teleport to="body">
      <transition name="drawer-mask">
        <div
          v-if="visible"
          class="fixed inset-0 bg-black/60 z-[10000] overflow-hidden"
          @click="handleClose"
        >
          <transition name="drawer-slide">
            <div
              v-if="showDrawer"
              class="absolute right-0 top-0 h-full w-full bg-bg-1 overflow-y-auto shadow-2xl"
              @click.stop
            >
              <div class="w-full relative h-60 box-content headBg">
                <div class="w-full z-10 p-4">
                  <div class="flex items-center justify-between">
                    <img
                      src="/src/static/img/home/logo.png"
                      alt="BC.GAME Logo"
                      class="w-auto h-8"
                    />
                    <button
                      class="w-[30px] h-[30px] bg-bg-3 rounded-lg flex items-center justify-center"
                      @click="handleClose"
                    >
                      <CloseIcon class="w-3.5 h-3.5 fill-none" />
                    </button>
                  </div>
                  <div class="flex flex-col justify-start space-y-4 p-1 mt-4">
                    <div class="flex-col">
                      <h2 class="flex items-center text-xs">
                        <GiftIcon class="w-3.5 h-3.5 fill-none" />
                        <div class="ml-1.5 text-text-1">470%</div>
                      </h2>
                      <p class="text-text-2 mt-0.5 text-[9px]">首存奖金</p>
                    </div>
                    <div class="flex-col">
                      <h2 class="flex items-center text-xs">
                        <TurntableIcon class="w-3.5 h-3.5 fill-none" />
                        <div class="ml-1.5 text-text-1">5 BTC</div>
                      </h2>
                      <p class="text-text-2 mt-0.5 text-[9px]">每日免费幸运转轮</p>
                    </div>
                    <div class="flex-col">
                      <h2 class="flex items-center text-xs">
                        <FreePerksIcon class="w-3.5 h-3.5 fill-none" />
                        <div class="ml-1.5 text-text-1">免费福利</div>
                      </h2>
                      <p class="text-text-2 mt-0.5 text-[9px]">每日免费福利与安全</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 注册表单内容 -->
              <div class="px-4 pb-8">
                <h2 class="text-lg font-bold text-text-1 mb-4">注册</h2>

                <!-- 电子邮件/电话号码 -->
                <div class="mb-4">
                  <input
                    v-model="formData.username"
                    type="text"
                    placeholder="电子邮件 / 电话号码"
                    class="w-full h-[44px] px-3 bg-bg-6 border border-border-1 rounded-lg text-text-1 text-sm focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                  />
                </div>

                <!-- 使用名称 -->
                <div class="mb-4">
                  <div class="relative">
                    <input
                      v-model="formData.displayName"
                      type="text"
                      placeholder="使用名称"
                      class="w-full h-[44px] px-3 pr-12 bg-bg-6 border border-border-1 rounded-lg text-text-1 text-sm focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                    />
                    <button
                      class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                    >
                      <RenovateIcon class="w-6 h-6 fill-none" />
                    </button>
                  </div>
                </div>

                <!-- 密码 -->
                <div class="mb-4">
                  <div class="relative">
                    <input
                      v-model="formData.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="密码"
                      class="w-full h-[44px] px-3 pr-12 bg-bg-6 border border-border-1 rounded-lg text-text-1 text-sm focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                      @click="togglePassword"
                    >
                      <EyeIcon v-if="!showPassword" class="w-6 h-6 fill-none" />
                      <EyeOffIcon v-else class="w-6 h-6 fill-none" />
                    </button>
                  </div>
                </div>

                <!-- 输入推荐/促销代码 -->
                <div class="mb-3">
                  <div class="flex items-center cursor-pointer" @click="togglePromoCode">
                    <span class="text-sm text-text-2">输入推荐/促销代码</span>
                    <div
                      class="ml-1 transition-transform duration-300"
                      :class="{ 'rotate-180': showPromoCode }"
                    >
                      <ChevronIcon class="w-4 h-4 fill-none" />
                    </div>
                  </div>
                </div>

                <transition name="expand">
                  <div v-if="showPromoCode" class="mb-4">
                    <input
                      v-model="formData.promoCode"
                      type="text"
                      placeholder="输入推荐/促销代码"
                      class="w-full h-[44px] px-3 bg-bg-6 border border-border-1 rounded-lg text-text-1 text-sm focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                    />
                  </div>
                </transition>

                <!-- 同意条款 -->
                <div class="mb-3">
                  <label
                    class="flex items-start cursor-pointer"
                    @click="handleCheckboxClick('agreeTerms')"
                  >
                    <span
                      class="flex-shrink-0 w-[18px] h-[18px] rounded flex items-center justify-center mr-3 mt-0.5"
                      :class="formData.agreeTerms ? '' : 'border-2 border-text-3'"
                    >
                      <CheckIcon
                        v-if="formData.agreeTerms"
                        class="w-[18px] h-[18px]"
                        :class="checkboxAnimating.agreeTerms ? 'animate-bounce-forward' : ''"
                      />
                    </span>
                    <p class="text-sm text-text-2 flex flex-wrap">
                      我同意
                      <span class="text-sm text-text-1 cursor-pointer mx-1" @click.stop
                        >「使用者协议」</span
                      >
                      并确认我已年满 18 岁
                    </p>
                  </label>
                </div>

                <!-- 接收营销信息 -->
                <div class="mb-6">
                  <label
                    class="flex items-start cursor-pointer"
                    @click="handleCheckboxClick('receiveMarketing')"
                  >
                    <span
                      class="flex-shrink-0 w-[18px] h-[18px] rounded flex items-center justify-center mr-3 mt-0.5"
                      :class="formData.receiveMarketing ? '' : 'border-2 border-text-3'"
                    >
                      <CheckIcon
                        v-if="formData.receiveMarketing"
                        class="w-[18px] h-[18px]"
                        :class="checkboxAnimating.receiveMarketing ? 'animate-bounce-forward' : ''"
                      />
                    </span>
                    <span class="text-sm text-text-2"> 我同意接收 BC.GAME的行销促销活动。 </span>
                  </label>
                </div>

                <!-- 注册按钮 -->
                <button
                  class="btn-primary w-full h-[44px] rounded-lg text-sm text-text-4 font-bold"
                  @click="handleRegister"
                >
                  注册
                </button>

                <!-- 已有账号 -->
                <div class="mt-6 mb-7 flex items-center justify-stretch">
                  <span class="text-sm text-text-1">已经有一个帐户?</span>
                  <button class="text-sm text-theme-primary font-bold ml-2" @click="switchToLogin">
                    登入
                  </button>
                </div>

                <!-- 第三方登录 -->
                <SocialLogin :show-key-login="false" />
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>
  </RegisterFormCore>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
import RenovateIcon from '@/static/svg/login/renovate.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import CheckIcon from '@/static/svg/login/check.svg?component'
import ChevronIcon from '@/static/svg/login/chevron.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?component'
import TurntableIcon from '@/static/svg/login/turntable.svg?component'
import FreePerksIcon from '@/static/svg/login/free_perks.svg?component'
import SocialLogin from './SocialLogin.vue'
import RegisterFormCore from './RegisterFormCore.vue'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'switch-to-login': []
}>()

const showDrawer = ref(false)

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      await nextTick()
      setTimeout(() => {
        showDrawer.value = true
      }, 50)
    } else {
      showDrawer.value = false
    }
  },
  { immediate: true }
)

const handleClose = () => {
  showDrawer.value = false
  setTimeout(() => {
    emit('update:visible', false)
  }, 350)
}
</script>

<style scoped lang="scss">
.headBg {
  background: url('/src/static/img/home/login_h5.webp') no-repeat center;
  background-size: cover;
}

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

.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

.drawer-mask-enter-to,
.drawer-mask-leave-from {
  opacity: 1;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0);
}
</style>
