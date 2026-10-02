<template>
  <ResetPasswordFormCore @reset-success="emit('reset-success')">
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
      <div class="w-full h-full flex flex-col">
        <div class="flex gap-[48px] mb-[24px]">
          <button
            class="relative min-w-20 pb-3 text-2xl font-[700] font-inter transition-all duration-200 tab-button-new"
          >
            <!-- 重置密码 -->
            <span>{{ t('common.reset_password') }}</span>
            <div
              class="absolute bottom-0 left-0 right-0 h-[4px] bg-theme-primary rounded-[10px]"
            ></div>
          </button>
        </div>

        <div class="flex-1 flex flex-col relative">
          <!-- 账号 -->
          <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.account') }}</div>
          <div class="mb-[12px]">
            <!-- 请输入账号 -->
            <div ref="resetAreaCodeAnchorRef" class="relative">
              <div class="absolute left-4 top-[25px] z-10 -translate-y-1/2">
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
                class="auth-input-placeholder w-full h-[50px] pl-[78px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                @input="handleAccountInput"
              />
            </div>
          </div>

          <!-- 验证码 -->
          <div class="text-sm font-[700] text-text-1 mb-2">
            {{ t('common.verification') }}
          </div>
          <div class="mb-[12px]">
            <div class="relative">
              <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <!-- 请输入验证码 -->
              <input
                :value="formData.code"
                type="text"
                inputmode="numeric"
                :placeholder="t('common.enter_verification')"
                class="auth-input-placeholder w-full h-[50px] pl-[44px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                @input="handleCodeInput"
              />
              <!-- 获取验证码 -->
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 h-7 min-w-[70px] px-2 text-sm font-[500] rounded-lg transition-opacity"
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
          <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.password') }}</div>
          <div class="mb-[12px]">
            <div class="relative">
              <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <!-- 请输入密码 -->
              <input
                :value="formData.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('common.enter_password')"
                class="auth-input-placeholder w-full h-[50px] pl-[44px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                :class="showPassword ? '' : 'auth-password-mask'"
                @input="handlePasswordInput"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                @click="togglePassword"
              >
                <EyeIcon v-if="showPassword" class="w-5 h-5 text-text-2" />
                <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
              </button>
            </div>
          </div>

          <!-- 确认密码 -->
          <div class="text-sm font-[700] text-text-1 mb-2">
            {{ t('common.confirm_password') }}
          </div>
          <div class="mb-[24px]">
            <div class="relative">
              <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <!-- 请输入确认密码 -->
              <input
                :value="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                :placeholder="t('common.enter_confirm_password')"
                class="auth-input-placeholder w-full h-[50px] pl-[44px] bg-input-3 border border-input-2 rounded-[10px] text-text-1 text-base font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                :class="showConfirmPassword ? '' : 'auth-password-mask'"
                @input="handleConfirmPasswordInput"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                @click="toggleConfirmPassword"
              >
                <EyeIcon v-if="showConfirmPassword" class="w-5 h-5 text-text-2" />
                <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
              </button>
            </div>
          </div>

          <!-- 确认 -->
          <button
            class="btn-primary w-full h-[40px] rounded-lg text-sm font-[700] text-text-4 transition-all"
            :class="{ 'opacity-60 cursor-not-allowed': !isResetValid }"
            :disabled="!isResetValid"
            @click="handleResetPassword"
          >
            {{ t('common.confirm') }}
          </button>

          <!-- 第三方登录图标 -->
          <!-- <SocialLogin class="absolute bottom-0 right-0 w-full" /> -->
        </div>
        <Teleport to="body">
          <Transition name="fade-accordion">
            <div
              v-if="isResetAreaCodeDropdownOpen"
              ref="resetAreaCodePopupRef"
              class="fixed z-[10020] flex h-[320px] flex-col overflow-hidden rounded-lg bg-bg-5 p-3"
              :style="resetAreaCodePopupStyle"
            >
              <div class="relative mb-[8px] shrink-0">
                <SearchIcon class="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-icon-3" />
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
                    option.code === resetAreaCode ? 'bg-bg-3 font-[700]' : 'hover:bg-opacity-6'
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
          </Transition>
        </Teleport>
      </div>
    </template>
  </ResetPasswordFormCore>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import XiaIcon from '@/static/svg/login/xia.svg?skipsvgo'
import SearchIcon from '@/static/svg/login/sousuo.svg?skipsvgo'
import SelectedIcon from '@/static/svg/login/selected.svg?skipsvgo'
import { getPhoneAreaCodeOption, getPhoneAreaCodeOptions } from '@/utils/phone-input'
import ResetPasswordFormCore from './ResetPasswordFormCore.vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  'reset-success': []
}>()

const { t } = useI18n()
const isResetAreaCodeDropdownOpen = ref(false)
const resetAreaCodeAnchorRef = ref<HTMLElement | null>(null)
const resetAreaCodePopupRef = ref<HTMLElement | null>(null)
const resetAreaCodePopupStyle = ref<Record<string, string>>({})
const resetAreaCodeSearchKeyword = ref('')
const phoneAreaCodeOptions = getPhoneAreaCodeOptions()
const RESET_AREA_CODE_POPUP_HEIGHT = 320
const RESET_AREA_CODE_POPUP_GAP = 4
const RESET_AREA_CODE_POPUP_VIEWPORT_PADDING = 12

const filteredResetPhoneAreaCodeOptions = computed(() => {
  const keyword = resetAreaCodeSearchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return phoneAreaCodeOptions
  }

  return phoneAreaCodeOptions.filter(option => option.searchText.includes(keyword))
})

/**
 * 获取当前选中的手机号区号配置。
 */
const getSelectedPhoneAreaCode = (areaCode?: string) => {
  return getPhoneAreaCodeOption(areaCode)
}

/**
 * 展开或收起忘记密码手机号区号下拉框。
 */
const toggleResetAreaCodeDropdown = () => {
  isResetAreaCodeDropdownOpen.value = !isResetAreaCodeDropdownOpen.value
}

/**
 * 关闭忘记密码手机号区号下拉框。
 */
const closeResetAreaCodeDropdown = () => {
  isResetAreaCodeDropdownOpen.value = false
}

/**
 * 根据输入框位置计算忘记密码手机号区号下拉框位置和动画高度。
 */
const updateResetAreaCodePopupPosition = () => {
  const anchor = resetAreaCodeAnchorRef.value

  if (!anchor) {
    return
  }

  const rect = anchor.getBoundingClientRect()
  const preferredTop = rect.bottom + RESET_AREA_CODE_POPUP_GAP
  const fallbackTop = rect.top - RESET_AREA_CODE_POPUP_GAP - RESET_AREA_CODE_POPUP_HEIGHT
  const popupTop =
    preferredTop + RESET_AREA_CODE_POPUP_HEIGHT + RESET_AREA_CODE_POPUP_VIEWPORT_PADDING >
    window.innerHeight
      ? Math.max(RESET_AREA_CODE_POPUP_VIEWPORT_PADDING, fallbackTop)
      : preferredTop

  resetAreaCodePopupStyle.value = {
    top: `${popupTop}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${RESET_AREA_CODE_POPUP_HEIGHT}px`,
    '--fade-accordion-max-height': `${RESET_AREA_CODE_POPUP_HEIGHT}px`
  }
}

/**
 * 窗口尺寸或滚动变化时刷新忘记密码手机号区号下拉框位置。
 */
const handleResetAreaCodeWindowChange = () => {
  if (!isResetAreaCodeDropdownOpen.value) {
    return
  }

  updateResetAreaCodePopupPosition()
}

/**
 * 点击下拉框外部时关闭忘记密码手机号区号下拉框。
 */
const handleResetAreaCodeOutsidePointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null

  if (!target) {
    return
  }

  if (
    resetAreaCodeAnchorRef.value?.contains(target) ||
    resetAreaCodePopupRef.value?.contains(target)
  ) {
    return
  }

  closeResetAreaCodeDropdown()
}

/**
 * 绑定忘记密码手机号区号下拉框打开期间需要的全局监听。
 */
const attachResetAreaCodePopupListeners = () => {
  window.addEventListener('resize', handleResetAreaCodeWindowChange)
  window.addEventListener('scroll', handleResetAreaCodeWindowChange, true)
  document.addEventListener('pointerdown', handleResetAreaCodeOutsidePointerDown, true)
}

/**
 * 移除忘记密码手机号区号下拉框的全局监听。
 */
const detachResetAreaCodePopupListeners = () => {
  window.removeEventListener('resize', handleResetAreaCodeWindowChange)
  window.removeEventListener('scroll', handleResetAreaCodeWindowChange, true)
  document.removeEventListener('pointerdown', handleResetAreaCodeOutsidePointerDown, true)
}

/**
 * 选择忘记密码手机号区号，并收起下拉框。
 */
const handleResetAreaCodeSelect = (
  areaCode: string,
  setResetAreaCode: (areaCode: string) => void
) => {
  setResetAreaCode(areaCode)
  resetAreaCodeSearchKeyword.value = ''
  closeResetAreaCodeDropdown()
}

watch(isResetAreaCodeDropdownOpen, async isOpen => {
  if (!isOpen) {
    detachResetAreaCodePopupListeners()
    return
  }

  await nextTick()
  updateResetAreaCodePopupPosition()
  attachResetAreaCodePopupListeners()
})

onBeforeUnmount(() => {
  detachResetAreaCodePopupListeners()
})
</script>

<style scoped lang="scss">
.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}
</style>
