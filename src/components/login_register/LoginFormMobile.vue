<template>
  <LoginRegisterFormCore
    ref="loginFormRef"
    :default-tab="defaultTab"
    @register-success="handleRegisterSuccess"
    @login-success="handleLoginSuccess"
    @open-reset-password="emit('open-reset-password')"
  >
    <template
      #default="{
        activeTab,
        showPassword,
        showConfirmPassword,
        formData,
        checkboxAnimating,
        countdown,
        isSigninValid,
        isSignupValid,
        setActiveTab,
        togglePassword,
        toggleConfirmPassword,
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
                <div class="w-full relative h-50 box-content">
                  <div class="w-full z-10 p-4">
                    <div class="flex items-center justify-between">
                      <SmartImage :src="loginLogoImage" alt="BC.GAME Logo" class="w-auto h-12" />
                      <button
                        class="w-7 h-7 bg-opacity-10 rounded-md flex items-center justify-center"
                        @click="handleClose"
                      >
                        <CloseIcon class="w-3 h-3 fill-none" />
                      </button>
                    </div>
                    <div
                      class="flex flex-col justify-start space-y-4 h-[140px] mt-4"
                      :style="{
                        backgroundImage: loginHeadBackground,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat'
                      }"
                    >
                      <div class="flex-col">
                        <h2 class="flex items-center text-xs">
                          <GiftIcon class="w-3.5 h-3.5 fill-none" />
                          <div class="ml-1.5 text-text-1">470%</div>
                        </h2>
                        <!-- 首存奖金 -->
                        <p class="text-text-2 mt-0.5 text-[9px]">
                          {{ t('common.welcome_deposit_bonus') }}
                        </p>
                      </div>
                      <div class="flex-col">
                        <h2 class="flex items-center text-xs">
                          <TurntableIcon class="w-3.5 h-3.5 fill-none" />
                          <div class="ml-1.5 text-text-1">5 BTC%</div>
                        </h2>
                        <!-- 每日免费幸运旋转 -->
                        <p class="text-text-2 mt-0.5 text-[9px]">
                          {{ t('common.free_daily_lucky_spin') }}
                        </p>
                      </div>
                      <div class="flex-col">
                        <h2 class="flex items-center text-xs">
                          <FreePerksIcon class="w-3.5 h-3.5 fill-none" />
                          <!-- 免费福利 -->
                          <div class="ml-1.5 text-text-1">{{ t('common.free_perks') }}</div>
                        </h2>
                        <!-- 每日免费奖励与奖金 -->
                        <p class="text-text-2 mt-0.5 text-[9px]">
                          {{ t('common.daily_free_rewards_bonuses') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="px-4 pb-6">
                  <div class="flex gap-6 mb-3.5 h-[32px]">
                    <button
                      class="relative w-20 pb-1.5 text-lg font-[800] transition-all duration-200 tab-button-new mr-20"
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

                  <!-- <div
                class="flex items-center justify-end gap-2 text-[14px] mb-4 font-[800] text-text-2 cursor-pointer"
              >
                <span>下载App，开启更多精彩</span>
                <ExternalIcon class="w-5 h-5 fill-none" />
              </div> -->

                  <template v-if="activeTab === 'signin'">
                    <!-- 账号 -->
                    <div class="text-sm font-[700] text-text-1 mb-1.5">
                      {{ t('common.account') }}
                    </div>
                    <div class="mb-3">
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
                          class="w-full h-[47px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                          @input="handleSigninAccountInput"
                        />
                      </div>
                    </div>

                    <!-- 密码 -->
                    <div class="text-sm font-[700] text-text-1 mb-1.5">
                      {{ t('common.password') }}
                    </div>
                    <div class="mb-3">
                      <div class="relative">
                        <PasswordIcon
                          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none"
                        />
                        <!-- 请输入密码 -->
                        <input
                          :value="formData.signin.password"
                          :type="showPassword.signin ? 'text' : 'password'"
                          :placeholder="t('common.enter_password')"
                          class="w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                          @input="handleSigninPasswordInput"
                        />
                        <button
                          type="button"
                          class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                          @click="togglePassword('signin')"
                        >
                          <EyeIcon v-if="!showPassword.signin" class="w-4 h-4 fill-none" />
                          <EyeOffIcon v-else class="w-4 h-4 fill-none" />
                        </button>
                      </div>
                    </div>

                    <!-- 记住我 & 忘记密码 -->
                    <div class="flex items-center justify-between mb-10">
                      <label
                        class="flex items-center cursor-pointer"
                        @click="handleCheckboxClick('rememberMe')"
                      >
                        <div
                          class="w-[14px] h-[14px] rounded border transition-all duration-200 flex items-center justify-center"
                          :class="
                            formData.signin.rememberMe
                              ? 'bg-theme-primary border-theme-primary'
                              : 'bg-transparent border-text-3'
                          "
                        >
                          <CheckIcon
                            v-if="formData.signin.rememberMe"
                            class="w-[14px] h-[14px]"
                            :class="checkboxAnimating.rememberMe ? 'animate-bounce-forward' : ''"
                          />
                        </div>
                        <!-- 记住我 -->
                        <span class="ml-1.5 text-xs text-text-2 font-[500]">{{
                          t('common.remember_me')
                        }}</span>
                      </label>
                      <!-- 忘记密码 -->
                      <a
                        href="#"
                        class="text-xs text-text-2 font-[500]"
                        @click.prevent="openResetPassword"
                        >{{ t('common.forget_password') }}?</a
                      >
                    </div>

                    <!-- 登录 -->
                    <button
                      class="btn-primary w-full h-[47px] rounded-lg text-base text-text-4 transition-all"
                      :class="{ 'opacity-40 cursor-not-allowed': !isSigninValid }"
                      :disabled="!isSigninValid"
                      @click="handleLogin"
                    >
                      {{ t('home.sign_In') }}
                    </button>

                    <!-- 以访客身份 -->
                    <div class="text-center text-sm font-[500] text-theme-primary mt-5">
                      {{ t('common.continue') }}
                    </div>
                  </template>

                  <template v-else-if="activeTab === 'signup'">
                    <!-- 账号 -->
                    <div class="text-sm font-[700] text-text-1 mb-1.5">
                      {{ t('common.account') }}
                    </div>
                    <div class="mb-3">
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
                          class="w-full h-[47px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                          @input="handleSignupAccountInput"
                        />
                      </div>
                    </div>

                    <!-- 验证码 -->
                    <div class="text-sm font-[700] text-text-1 mb-1.5">
                      {{ t('common.verification') }}
                    </div>
                    <div class="mb-3">
                      <div class="relative">
                        <SafeIcon
                          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none"
                        />
                        <!-- 请输入验证码 -->
                        <input
                          :value="formData.signup.code"
                          type="text"
                          inputmode="numeric"
                          :placeholder="t('common.enter_verification')"
                          class="w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
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
                    <div class="text-sm font-[700] text-text-1 mb-1.5">
                      {{ t('common.password') }}
                    </div>
                    <div class="mb-3">
                      <div class="relative">
                        <PasswordIcon
                          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none"
                        />
                        <!-- 请输入密码 -->
                        <input
                          :value="formData.signup.password"
                          :type="showPassword.signup ? 'text' : 'password'"
                          :placeholder="t('common.enter_password')"
                          class="w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                          @input="handleSignupPasswordInput"
                        />
                        <button
                          type="button"
                          class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                          @click="togglePassword('signup')"
                        >
                          <EyeIcon v-if="!showPassword.signup" class="w-4 h-4 fill-none" />
                          <EyeOffIcon v-else class="w-4 h-4 fill-none" />
                        </button>
                      </div>
                    </div>

                    <!-- 确认密码 -->
                    <div class="text-sm font-[700] text-text-1 mb-1.5">
                      {{ t('common.confirm_password') }}
                    </div>
                    <div class="mb-10">
                      <div class="relative">
                        <PasswordIcon
                          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-none"
                        />
                        <!-- 请输入确认密码 -->
                        <input
                          :value="formData.signup.confirmPassword"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          :placeholder="t('common.enter_confirm_password')"
                          class="w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                          @input="handleSignupConfirmPasswordInput"
                        />
                        <button
                          type="button"
                          class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                          @click="toggleConfirmPassword"
                        >
                          <EyeIcon v-if="!showConfirmPassword" class="w-4 h-4 fill-none" />
                          <EyeOffIcon v-else class="w-4 h-4 fill-none" />
                        </button>
                      </div>
                    </div>

                    <!-- 注册按钮 -->
                    <button
                      class="btn-primary w-full h-[47px] rounded-lg text-base text-text-4 transition-all"
                      :class="{ 'opacity-40 cursor-not-allowed': !isSignupValid }"
                      :disabled="!isSignupValid"
                      @click="handleRegister"
                    >
                      <!-- 注册 -->
                      {{ t('home.sign_Up') }}
                    </button>

                    <!-- 以访客身份 -->
                    <div class="text-center text-sm font-[500] text-theme-primary mt-5">
                      {{ t('common.continue') }}
                    </div>
                  </template>

                  <!-- 第三方登录 -->
                  <!-- <div class="mt-6">
                <SocialLogin :show-key-login="true" />
              </div> -->
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </teleport>
    </template>
  </LoginRegisterFormCore>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
// import ExternalIcon from '@/static/svg/login/external.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?component'
import TurntableIcon from '@/static/svg/login/turntable.svg?component'
import FreePerksIcon from '@/static/svg/login/free_perks.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?component'
import PasswordIcon from '@/static/svg/login/password.svg?component'
import CheckIcon from '@/static/svg/login/check.svg?component'
import loginHeadDarkImage from '@/static/img/home/login_h5_h.png'
import loginHeadLightImage from '@/static/img/home/login_h5_b.png'
import loginLogoImage from '@/static/img/home/logo.png'
import { useThemeStore } from '@/stores/theme'
import { resolveBackgroundImage } from '@/utils/image'
import { getDefaultAreaCodeDisplay } from '@/utils/locale'
import LoginRegisterFormCore from './LoginRegisterFormCore.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const themeStore = useThemeStore()
const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()
interface Props {
  visible: boolean
  defaultTab?: 'signin' | 'signup'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin'
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'open-reset-password': []
}>()

const showDrawer = ref(false)
const loginFormRef = ref<InstanceType<typeof LoginRegisterFormCore> | null>(null)
const loginHeadBackground = computed(() => {
  const backgroundImage = themeStore.theme === 'light' ? loginHeadLightImage : loginHeadDarkImage

  return `${resolveBackgroundImage(backgroundImage)}`
})

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      loginFormRef.value?.resetForm()
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
    loginFormRef.value?.resetForm()
    emit('update:visible', false)
  }, 350)
}

// 处理注册成功
const handleRegisterSuccess = () => {
  handleClose()
}

// 处理登录成功
const handleLoginSuccess = () => {
  handleClose()
  window.location.reload()
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
