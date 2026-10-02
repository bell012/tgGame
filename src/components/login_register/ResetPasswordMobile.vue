<template>
  <ResetPasswordFormCore ref="resetPasswordFormRef" @reset-success="handleResetPasswordSuccess">
    <template
      #default="{
        showPassword,
        showConfirmPassword,
        formData,
        resetAreaCode,
        isResetValid,
        countdown,
        setResetAreaCode,
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
            class="auth-mobile-overlay fixed inset-0 bg-mask-60-1 z-[10000] overflow-hidden"
            @click="handleClose"
          >
            <transition name="drawer-slide">
              <div
                v-if="showDrawer"
                class="auth-mobile-drawer absolute right-0 top-0 h-full w-full overflow-y-auto shadow-2xl container_bg"
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
                        <SmartImage
                          v-if="logoUrl"
                          :src="logoUrl"
                          alt=""
                          class="h-[49px] w-auto object-contain"
                        />
                        <MainLogoIcon v-else class="h-[49px] w-auto text-text-1" />
                      </div>
                      <button
                        class="w-7 h-7 bg-opacity-10 rounded-md flex items-center justify-center"
                        @click="handleClose"
                      >
                        <CloseIcon class="h-2.5 w-2.5 text-text-1" />
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
                    >
                      <!-- 重置密码 -->
                      <span>{{ t('common.reset_password') }}</span>
                      <div
                        class="absolute bottom-0 left-0 right-0 h-[3px] bg-theme-primary rounded-[4px]"
                      ></div>
                    </button>
                  </div>

                  <!-- 账号 -->
                  <div class="text-sm font-[700] text-text-1 mb-1.5">
                    {{ t('common.account') }}
                  </div>
                  <div class="mb-3">
                    <!-- 请输入账号 -->
                    <div ref="resetAreaCodeAnchorRef" class="relative">
                      <div class="absolute left-4 top-[23.5px] z-10 -translate-y-1/2">
                        <button
                          type="button"
                          class="flex items-center gap-1 text-[var(--color-theme-level-1)] text-base font-[700]"
                          @click.stop="toggleResetAreaCodeDropdown"
                        >
                          <span>{{ getSelectedPhoneAreaCode(resetAreaCode).display }}</span>
                          <XiaIcon
                            class="w-3 h-3 transition-transform duration-200"
                            :class="isResetAreaCodeDropdownOpen ? 'rotate-180' : ''"
                          />
                        </button>
                      </div>
                      <input
                        :value="formData.account"
                        type="text"
                        inputmode="numeric"
                        :placeholder="t('common.enter_account')"
                        class="auth-input-placeholder w-full h-[47px] pl-[78px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
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
                      <SafeIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" />
                      <!-- 请输入验证码 -->
                      <input
                        :value="formData.code"
                        type="text"
                        inputmode="numeric"
                        :placeholder="t('common.enter_verification')"
                        class="auth-input-placeholder w-full h-[47px] pl-[44px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
                        @input="handleCodeInput"
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
                        :value="formData.password"
                        :type="showPassword ? 'text' : 'password'"
                        :placeholder="t('common.enter_password')"
                        class="auth-input-placeholder w-full h-[47px] pl-[44px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
                        :class="showPassword ? '' : 'auth-password-mask'"
                        @input="handlePasswordInput"
                      />
                      <button
                        type="button"
                        class="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
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
                      <PasswordIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" />
                      <!-- 请输入确认密码 -->
                      <input
                        :value="formData.confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        :placeholder="t('common.enter_confirm_password')"
                        class="auth-input-placeholder w-full h-[47px] pl-[44px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-xs placeholder:font-[500]"
                        :class="showConfirmPassword ? '' : 'auth-password-mask'"
                        @input="handleConfirmPasswordInput"
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

                  <!-- 确认 -->
                  <button
                    class="btn-primary w-full h-[47px] rounded-lg text-base font-[700] text-text-4 transition-all"
                    :class="{ 'opacity-60 cursor-not-allowed': !isResetValid }"
                    :disabled="!isResetValid"
                    @click="handleResetPassword"
                  >
                    {{ t('common.confirm') }}
                  </button>
                  <Teleport to="body">
                    <transition name="area-code-mask">
                      <div
                        v-if="isResetAreaCodeDropdownOpen"
                        class="fixed inset-0 z-[10020] bg-mask-60-1"
                        @click="closeResetAreaCodeDropdown"
                      />
                    </transition>

                    <transition name="area-code-sheet">
                      <div
                        v-if="isResetAreaCodeDropdownOpen"
                        ref="resetAreaCodePopupRef"
                        class="fixed bottom-0 left-0 z-[10021] w-full"
                      >
                        <div
                          class="area-code-sheet-panel flex h-[60vh] flex-col rounded-t-xl bg-bg-5 p-3"
                        >
                          <div class="mb-2 text-center text-base font-[700] text-text-1">
                            {{ t('common.select_country') }}
                          </div>
                          <div class="relative mb-2 shrink-0">
                            <SearchIcon
                              class="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-icon-3"
                            />
                            <input
                              v-model="resetAreaCodeSearchKeyword"
                              type="text"
                              :placeholder="t('common.search_country')"
                              class="auth-input-placeholder h-10 w-full rounded-[12px] border border-opacity-10 bg-opacity-6 pl-11 pr-3 text-sm font-[400] text-text-1 outline-none transition-colors focus:border-theme-primary placeholder:text-text-3"
                              @click.stop
                            />
                          </div>
                          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto">
                            <button
                              v-for="option in filteredResetPhoneAreaCodeOptions"
                              :key="option.code"
                              type="button"
                              class="flex h-10 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm font-[400] text-text-1 transition-colors"
                              :class="
                                option.code === resetAreaCode
                                  ? 'bg-bg-3 font-[700]'
                                  : 'hover:bg-opacity-6'
                              "
                              @click.stop="handleResetAreaCodeSelect(option.code, setResetAreaCode)"
                            >
                              <span>{{ option.country }} ({{ option.display }})</span>
                              <SelectedIcon
                                v-if="option.code === resetAreaCode"
                                class="h-4 w-4 text-theme-primary"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </Teleport>
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
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import CloseIcon from '@/static/svg/close.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import XiaIcon from '@/static/svg/login/xia.svg?skipsvgo'
import SearchIcon from '@/static/svg/login/sousuo.svg?skipsvgo'
import SelectedIcon from '@/static/svg/login/selected.svg?skipsvgo'
import { getPhoneAreaCodeOption, getPhoneAreaCodeOptions } from '@/utils/phone-input'
import ResetPasswordFormCore from './ResetPasswordFormCore.vue'
import { useI18n } from 'vue-i18n'
import FoldIconH5 from '@/static/svg/foldH5.svg?component'
import { navigateTo } from '@/utils/router'

const { t } = useI18n()
interface Props {
  visible: boolean
  logoUrl?: string
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
const isResetAreaCodeDropdownOpen = ref(false)
const resetAreaCodeAnchorRef = ref<HTMLElement | null>(null)
const resetAreaCodePopupRef = ref<HTMLElement | null>(null)
const resetAreaCodeSearchKeyword = ref('')
const phoneAreaCodeOptions = getPhoneAreaCodeOptions()

const filteredResetPhoneAreaCodeOptions = computed(() => {
  const keyword = resetAreaCodeSearchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return phoneAreaCodeOptions
  }

  return phoneAreaCodeOptions.filter(option => option.searchText.includes(keyword))
})

usePageScrollLock(() => props.visible)

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

/**
 * 获取当前选中的手机号区号配置。
 */
const getSelectedPhoneAreaCode = (areaCode?: string) => {
  return getPhoneAreaCodeOption(areaCode)
}

/**
 * 展开或收起忘记密码手机号区号底部弹窗。
 */
const toggleResetAreaCodeDropdown = () => {
  isResetAreaCodeDropdownOpen.value = !isResetAreaCodeDropdownOpen.value
}

/**
 * 关闭忘记密码手机号区号底部弹窗。
 */
const closeResetAreaCodeDropdown = () => {
  isResetAreaCodeDropdownOpen.value = false
}

/**
 * 选择忘记密码手机号区号，并收起底部弹窗。
 */
const handleResetAreaCodeSelect = (
  areaCode: string,
  setResetAreaCode: (areaCode: string) => void
) => {
  setResetAreaCode(areaCode)
  resetAreaCodeSearchKeyword.value = ''
  closeResetAreaCodeDropdown()
}

/**
 * 关闭 H5 忘记密码页并重置表单状态。
 */
const handleClose = () => {
  showDrawer.value = false
  closeResetAreaCodeDropdown()
  setTimeout(() => {
    resetPasswordFormRef.value?.resetForm()
    emit('update:visible', false)
  }, 350)
}

/**
 * 关闭 H5 忘记密码页并跳转到菜单页。
 */
const handleNavigateToMenu = () => {
  showDrawer.value = false
  closeResetAreaCodeDropdown()
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
  closeResetAreaCodeDropdown()

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

.auth-mobile-overlay {
  height: 100vh;
  height: 100dvh;
  overscroll-behavior: none;
}

.auth-mobile-drawer {
  overscroll-behavior: contain;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.area-code-sheet-panel {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

.area-code-mask-enter-active,
.area-code-mask-leave-active {
  transition: opacity 0.25s ease;
}

.area-code-mask-enter-from,
.area-code-mask-leave-to {
  opacity: 0;
}

.area-code-mask-enter-to,
.area-code-mask-leave-from {
  opacity: 1;
}

.area-code-sheet-enter-active,
.area-code-sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.area-code-sheet-enter-from,
.area-code-sheet-leave-to {
  transform: translateY(100%);
}

.area-code-sheet-enter-to,
.area-code-sheet-leave-from {
  transform: translateY(0);
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
