<template>
  <ResetPasswordFormCore ref="resetPasswordFormRef" @reset-success="handleResetPasswordSuccess">
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
                  <div class="w-full z-10 p-4">
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
                    <div class="relative mt-4 h-[140px] w-full overflow-hidden rounded-xl bg-bg-2">
                      <div
                        v-if="showH5BackgroundSkeleton"
                        class="absolute inset-0 animate-pulse bg-bg-2"
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

                <div class="px-4 pb-6">
                  <div class="flex gap-6 mb-3.5 h-[32px]">
                    <button
                      class="relative pb-1.5 text-lg font-[800] transition-all duration-200 tab-button-new mr-20"
                    >
                      <!-- 重置密码 -->
                      <span>{{ t('common.reset_password') }}</span>
                      <div
                        class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
                      ></div>
                    </button>
                  </div>

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
                        :value="formData.account"
                        type="text"
                        inputmode="numeric"
                        :placeholder="t('common.enter_account')"
                        class="auth-input-placeholder w-full h-[47px] pl-12 pr-[3px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                        @input="handleAccountInput"
                      />
                    </div>
                  </div>

                  <!-- 验证码 -->
                  <div class="text-sm font-[700] text-text-1 mb-1.5">
                    {{ t('common.verification') }}
                  </div>
                  <div class="mb-3">
                    <div class="relative">
                      <SafeIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                      <!-- 请输入验证码 -->
                      <input
                        :value="formData.code"
                        type="text"
                        inputmode="numeric"
                        :placeholder="t('common.enter_verification')"
                        class="auth-input-placeholder w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                        @input="handleCodeInput"
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
                      <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                      <!-- 请输入密码 -->
                      <input
                        :value="formData.password"
                        :type="showPassword ? 'text' : 'password'"
                        :placeholder="t('common.enter_password')"
                        class="auth-input-placeholder w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                        :class="showPassword ? '' : 'auth-password-mask'"
                        @input="handlePasswordInput"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                        @click="togglePassword"
                      >
                        <EyeIcon v-if="showPassword" class="w-4 h-4 text-text-2" />
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
                      <PasswordIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                      <!-- 请输入确认密码 -->
                      <input
                        :value="formData.confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        :placeholder="t('common.enter_confirm_password')"
                        class="auth-input-placeholder w-full h-[47px] pl-10 pr-12 bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-xs focus:outline-none focus:border-theme-primary placeholder:text-text-3"
                        :class="showConfirmPassword ? '' : 'auth-password-mask'"
                        @input="handleConfirmPasswordInput"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                        @click="toggleConfirmPassword"
                      >
                        <EyeIcon v-if="showConfirmPassword" class="w-4 h-4 text-text-2" />
                        <EyeOffIcon v-else class="w-4 h-4 text-text-2" />
                      </button>
                    </div>
                  </div>

                  <!-- 确认 -->
                  <button
                    class="btn-primary w-full h-[47px] rounded-lg text-base text-text-4 transition-all"
                    :class="{ 'opacity-40 cursor-not-allowed': !isResetValid }"
                    :disabled="!isResetValid"
                    @click="handleResetPassword"
                  >
                    {{ t('common.confirm') }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </teleport>
    </template>
  </ResetPasswordFormCore>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import { getDefaultAreaCodeDisplay } from '@/utils/locale'
import ResetPasswordFormCore from './ResetPasswordFormCore.vue'
import { useI18n } from 'vue-i18n'
import FoldIconH5 from '@/static/svg/foldH5.svg?component'
import { navigateTo } from '@/utils/router'

const { t } = useI18n()
const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()
interface Props {
  visible: boolean
  backgroundImageUrl?: string
  backgroundLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'reset-success': []
}>()

const showDrawer = ref(false)
const resetPasswordFormRef = ref<InstanceType<typeof ResetPasswordFormCore> | null>(null)
const isH5BackgroundLoaded = ref(false)

// 登录/注册弹窗背景图
const h5BackgroundImage = computed(() => {
  return props.backgroundImageUrl
})

const showH5BackgroundSkeleton = computed(() => {
  return props.backgroundLoading || (!!h5BackgroundImage.value && !isH5BackgroundLoaded.value)
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
    resetPasswordFormRef.value?.resetForm()
    emit('update:visible', false)
  }, 350)
}

const handleNavigateToMenu = () => {
  showDrawer.value = false
  setTimeout(() => {
    resetPasswordFormRef.value?.resetForm()
    emit('update:visible', false)
    void navigateTo('/menu')
  }, 350)
}

/**
 * 重置密码成功后，先关闭当前重置密码，切回登录弹窗。
 */
const handleResetPasswordSuccess = () => {
  showDrawer.value = false

  setTimeout(() => {
    resetPasswordFormRef.value?.resetForm()
    emit('reset-success')
  }, 500)
}
</script>

<style scoped lang="scss">
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
