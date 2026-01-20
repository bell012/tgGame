<template>
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
            <LoginFormCore
              v-slot="{
                activeTab,
                showPassword,
                formData,
                setActiveTab,
                togglePassword,
                handleLogin,
                handleSendOtp,
                switchToRegister
              }"
              @switch-to-register="emit('switch-to-register')"
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
                        <div class="ml-1.5 text-text-1">5 BTC%</div>
                      </h2>
                      <p class="text-text-2 mt-0.5 text-[9px]">每日免费幸运旋转</p>
                    </div>
                    <div class="flex-col">
                      <h2 class="flex items-center text-xs">
                        <FreePerksIcon class="w-3.5 h-3.5 fill-none" />
                        <div class="ml-1.5 text-text-1">免费福利</div>
                      </h2>
                      <p class="text-text-2 mt-0.5 text-[9px]">每日免费奖励与奖金</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 内容区域 -->
              <div class="px-4 pb-6">
                <h2 class="text-[20px] font-[800] text-text-1 mb-4">登入</h2>

                <!-- 标签切换 -->
                <div class="flex bg-bg-2 rounded-lg mb-3">
                  <button
                    class="relative flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 overflow-hidden tab-button"
                    :class="
                      activeTab === 'password'
                        ? 'bg-bg-3 border border-primary text-text-1'
                        : 'text-text-2'
                    "
                    @click="setActiveTab('password')"
                  >
                    <LockIcon class="w-4 h-4 fill-none relative z-10" />
                    <span class="relative z-10">密码</span>
                  </button>
                  <button
                    class="relative flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 overflow-hidden tab-button"
                    :class="
                      activeTab === 'otp'
                        ? 'bg-bg-3 border border-primary text-text-1'
                        : 'text-text-2'
                    "
                    @click="setActiveTab('otp')"
                  >
                    <KeyIcon class="w-4 h-4 fill-none relative z-10" />
                    <span class="relative z-10">一次性验证码</span>
                  </button>
                </div>

                <div
                  class="flex items-center justify-end gap-2 text-[14px] mb-4 font-[800] text-text-2 cursor-pointer"
                >
                  <span>下载App，开启更多精彩</span>
                  <ExternalIcon class="w-5 h-5 fill-none" />
                </div>

                <!-- 密码登录表单 -->
                <template v-if="activeTab === 'password'">
                  <!-- 用户名/邮箱/电话 -->
                  <div class="mb-4">
                    <input
                      v-model="formData.username"
                      type="text"
                      placeholder="电子邮件 / 电话号码 / 用户名"
                      class="w-full h-[44px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
                    />
                  </div>

                  <!-- 密码 -->
                  <div class="mb-4">
                    <div class="relative">
                      <input
                        v-model="formData.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="密码"
                        class="w-full h-[44px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
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

                  <!-- 忘记密码 -->
                  <div class="text-right mb-6">
                    <a
                      href="#"
                      class="text-text-2 text-[14px] font-[800] hover:text-text-2 transition-colors"
                      >忘记密码?</a
                    >
                  </div>

                  <!-- 登入按钮 -->
                  <button
                    class="btn-primary w-full h-[44px] rounded-lg text-[14px] text-text-4"
                    @click="handleLogin"
                  >
                    登入
                  </button>
                </template>

                <template v-else-if="activeTab === 'otp'">
                  <!-- 电子邮件/电话号码 -->
                  <div class="mb-4">
                    <input
                      v-model="formData.otpContact"
                      type="text"
                      placeholder="电子邮件 / 电话号码"
                      class="w-full h-[44px] pl-2 pr-[3px] bg-bg-6 border border-border-1 rounded-lg text-text-1 text-[14px] focus:outline-none focus:border-[#2AE58A] placeholder:text-text-3"
                    />
                  </div>

                  <div class="mb-6 text-center text-[14px] font-[800] text-text-2">
                    我们将向您的邮箱发送一个一次性验证码
                  </div>

                  <button
                    class="btn-primary w-full h-[44px] rounded-lg text-[14px] text-text-4"
                    @click="handleSendOtp"
                  >
                    传送一次性验证码
                  </button>
                </template>

                <!-- 注册提示 -->
                <div class="text-left mt-6 mb-6">
                  <span class="text-[14px] text-text-1">您是 BC.GAME的新用户？</span>
                  <button
                    class="text-theme-primary text-[14px] ml-2 font-[800]"
                    @click="switchToRegister"
                  >
                    建立账号
                  </button>
                </div>

                <!-- 第三方登录 -->
                <SocialLogin :show-key-login="true" />
              </div>
            </LoginFormCore>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
import LockIcon from '@/static/svg/login/lock.svg?component'
import KeyIcon from '@/static/svg/login/key.svg?component'
import ExternalIcon from '@/static/svg/login/external.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?component'
import TurntableIcon from '@/static/svg/login/turntable.svg?component'
import FreePerksIcon from '@/static/svg/login/free_perks.svg?component'
import SocialLogin from './SocialLogin.vue'
import LoginFormCore from './LoginFormCore.vue'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'switch-to-register': []
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
.tab-button {
  position: relative;
  overflow: hidden;

  &:active {
    animation: nod 0.2s ease-out;
  }
}

@keyframes nod {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0);
  }
}

// 遮罩层淡入淡出动画
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

// 抽屉滑动动画 - 从右往左滑入，从左往右滑出
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
