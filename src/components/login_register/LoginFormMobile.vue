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
            class="fixed inset-0 bg-mask-60-1 z-[10000] overflow-hidden"
            @click="handleClose"
          >
            <transition name="drawer-slide">
              <div
                v-if="showDrawer"
                class="absolute right-0 top-0 h-full w-full overflow-y-auto shadow-2xl container_bg"
                @click.stop
              >
                <div class="w-full relative h-50 box-content">
                  <div class="w-full z-10 p-3.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <FoldIconH5
                          class="h-5 w-5 text-text-1 mr-[7px] cursor-pointer"
                          @click="handleNavigateToMenu"
                        />
                        <MainLogoIcon class="h-[49px] w-auto text-text-1" />
                      </div>
                      <button
                        class="w-7 h-7 bg-opacity-10 rounded-md flex items-center justify-center"
                        @click="handleClose"
                      >
                        <CloseIcon class="w-3 h-3 text-text-1" />
                      </button>
                    </div>
                    <div class="relative h-[140px] w-full overflow-hidden">
                      <div
                        v-if="showH5BackgroundSkeleton"
                        class="absolute inset-0 animate-pulse bg-bg-4 rounded-xl"
                      ></div>
                      <img
                        v-if="h5BackgroundImage"
                        :src="h5BackgroundImage"
                        alt=""
                        class="h-full w-full transition-opacity duration-300"
                        :class="showH5BackgroundSkeleton ? 'opacity-0' : 'opacity-100'"
                        @load="handleH5BackgroundLoad"
                        @error="handleH5BackgroundError"
                      />
                    </div>
                  </div>
                </div>

                <div class="px-3.5 pb-6">
                  <div class="flex gap-[80px] mb-3.5">
                    <button
                      class="relative min-w-20 pb-1.5 text-lg font-[700] font-inter transition-all duration-200 tab-button-new"
                      :class="activeTab === 'signin' ? 'text-text-1' : 'text-text-2'"
                      @click="setActiveTab('signin')"
                    >
                      <!-- 登录 -->
                      <span>{{ t('home.sign_In') }}</span>
                      <div
                        v-if="activeTab === 'signin'"
                        class="absolute bottom-0 left-0 right-0 h-[3px] bg-theme-primary rounded-[4px]"
                      ></div>
                    </button>
                    <button
                      class="relative min-w-20 pb-1.5 text-lg font-[700] font-inter transition-all duration-200 tab-button-new"
                      :class="activeTab === 'signup' ? 'text-text-1' : 'text-text-2'"
                      @click="setActiveTab('signup')"
                    >
                      <!-- 注册 -->
                      <span>{{ t('home.sign_Up') }}</span>
                      <div
                        v-if="activeTab === 'signup'"
                        class="absolute bottom-0 left-0 right-0 h-[3px] bg-theme-primary rounded-[4px]"
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
                          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-primary text-base font-[700]"
                        >
                          {{ defaultAreaCodeDisplay }}
                        </span>
                        <input
                          :value="formData.signin.account"
                          type="text"
                          inputmode="numeric"
                          :placeholder="t('common.enter_account')"
                          class="auth-input-placeholder w-full h-[47px] pl-[44px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
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
                        <PasswordIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" />
                        <!-- 请输入密码 -->
                        <input
                          :value="formData.signin.password"
                          :type="showPassword.signin ? 'text' : 'password'"
                          :placeholder="t('common.enter_password')"
                          class="auth-input-placeholder w-full h-[47px] pl-[36px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
                          :class="showPassword.signin ? '' : 'auth-password-mask'"
                          @input="handleSigninPasswordInput"
                        />
                        <button
                          type="button"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                          @click="togglePassword('signin')"
                        >
                          <EyeIcon v-if="showPassword.signin" class="w-4 h-4 text-text-2" />
                          <EyeOffIcon v-else class="w-4 h-4 text-text-2" />
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
                      class="btn-primary w-full h-[47px] rounded-lg text-base font-[700] text-text-4 transition-all"
                      :class="{ 'opacity-60 cursor-not-allowed': !isSigninValid }"
                      :disabled="!isSigninValid"
                      @click="handleLogin"
                    >
                      {{ t('home.sign_In') }}
                    </button>

                    <!-- 以访客身份 -->
                    <div
                      class="text-center text-sm font-[500] text-theme-primary mt-5 cursor-pointer"
                      @click="handleGuestContinue"
                    >
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
                          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-primary text-base font-[700]"
                        >
                          {{ defaultAreaCodeDisplay }}
                        </span>
                        <input
                          :value="formData.signup.account"
                          type="text"
                          inputmode="numeric"
                          :placeholder="t('common.enter_account')"
                          class="auth-input-placeholder w-full h-[47px] pl-[44px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
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
                        <SafeIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" />
                        <!-- 请输入验证码 -->
                        <input
                          :value="formData.signup.code"
                          type="text"
                          inputmode="numeric"
                          :placeholder="t('common.enter_verification')"
                          class="auth-input-placeholder w-full h-[47px] pl-[36px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
                          @input="handleSignupCodeInput"
                        />
                        <!-- 获取验证码 -->
                        <button
                          type="button"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 h-7 min-w-[70px] px-2 text-xs font-[500] rounded-lg transition-opacity"
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
                    <div class="text-sm font-[700] text-text-1 mb-1.5">
                      {{ t('common.password') }}
                    </div>
                    <div class="mb-3">
                      <div class="relative">
                        <PasswordIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" />
                        <!-- 请输入密码 -->
                        <input
                          :value="formData.signup.password"
                          :type="showPassword.signup ? 'text' : 'password'"
                          :placeholder="t('common.enter_password')"
                          class="auth-input-placeholder w-full h-[47px] pl-[36px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
                          :class="showPassword.signup ? '' : 'auth-password-mask'"
                          @input="handleSignupPasswordInput"
                        />
                        <button
                          type="button"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                          @click="togglePassword('signup')"
                        >
                          <EyeIcon v-if="showPassword.signup" class="w-4 h-4 text-text-2" />
                          <EyeOffIcon v-else class="w-4 h-4 text-text-2" />
                        </button>
                      </div>
                    </div>

                    <!-- 确认密码 -->
                    <div class="text-sm font-[700] text-text-1 mb-1.5">
                      {{ t('common.confirm_password') }}
                    </div>
                    <div class="mb-10">
                      <div class="relative">
                        <PasswordIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" />
                        <!-- 请输入确认密码 -->
                        <input
                          :value="formData.signup.confirmPassword"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          :placeholder="t('common.enter_confirm_password')"
                          class="auth-input-placeholder w-full h-[47px] pl-[36px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
                          :class="showConfirmPassword ? '' : 'auth-password-mask'"
                          @input="handleSignupConfirmPasswordInput"
                        />
                        <button
                          type="button"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                          @click="toggleConfirmPassword"
                        >
                          <EyeIcon v-if="showConfirmPassword" class="w-4 h-4 text-text-2" />
                          <EyeOffIcon v-else class="w-4 h-4 text-text-2" />
                        </button>
                      </div>
                    </div>

                    <!-- 注册按钮 -->
                    <button
                      class="btn-primary w-full h-[47px] rounded-lg text-base font-[700] text-text-4 transition-all"
                      :class="{ 'opacity-60 cursor-not-allowed': !isSignupValid }"
                      :disabled="!isSignupValid"
                      @click="handleRegister"
                    >
                      <!-- 注册 -->
                      {{ t('home.sign_Up') }}
                    </button>

                    <!-- 以访客身份 -->
                    <div
                      class="text-center text-sm font-[500] text-theme-primary mt-5 cursor-pointer"
                      @click="handleGuestContinue"
                    >
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
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import CheckIcon from '@/static/svg/login/check.svg?skipsvgo'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import { getDefaultAreaCodeDisplay } from '@/utils/locale'
import LoginRegisterFormCore from './LoginRegisterFormCore.vue'
import { useI18n } from 'vue-i18n'
import FoldIconH5 from '@/static/svg/foldH5.svg?component'
import { navigateTo } from '@/utils/router'

const { t } = useI18n()
const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()
interface Props {
  visible: boolean
  defaultTab?: 'signin' | 'signup'
  backgroundImageUrl?: string
  backgroundLoading?: boolean
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
const isH5BackgroundLoaded = ref(false)

// 登录/注册弹窗背景图
const h5BackgroundImage = computed(() => {
  return props.backgroundImageUrl
})

const showH5BackgroundSkeleton = computed(() => {
  return (
    (!h5BackgroundImage.value && !!props.backgroundLoading) ||
    (!!h5BackgroundImage.value && !isH5BackgroundLoaded.value)
  )
})

watch(
  () => h5BackgroundImage.value,
  () => {
    isH5BackgroundLoaded.value = false
  },
  { immediate: true }
)

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      isH5BackgroundLoaded.value = false
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

const handleH5BackgroundLoad = () => {
  isH5BackgroundLoaded.value = true
}

const handleH5BackgroundError = () => {
  isH5BackgroundLoaded.value = true
}

const handleClose = () => {
  showDrawer.value = false
  setTimeout(() => {
    loginFormRef.value?.resetForm()
    emit('update:visible', false)
  }, 350)
}

const handleNavigateToMenu = () => {
  showDrawer.value = false
  setTimeout(() => {
    loginFormRef.value?.resetForm()
    emit('update:visible', false)
    void navigateTo('/menu')
  }, 350)
}

/**
 * 以访客身份继续时关闭当前弹窗。
 */
const handleGuestContinue = () => {
  handleClose()
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

.container_bg {
  background:
    radial-gradient(
      102.8% 51.58% at 100% 0%,
      rgba(35, 238, 136, 0.06) 0%,
      rgba(35, 238, 136, 0) 100%
    ),
    var(--color-background-level-1, #242626);
}
</style>
