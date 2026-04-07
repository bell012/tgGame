<template>
  <section class="min-h-[calc(100vh-110px)]">
    <SmsCodeHelpPopup v-model="showSmsCodeHelpPopup" />

    <template v-if="currentStep === 'verification'">
      <div class="flex flex-col items-center">
        <SetIcon class="h-[30px] w-[30px] text-text-2" />
        <h2 class="mt-2.5 text-center text-base font-[700] text-text-1">
          {{ t('common.mobileVerification') }}
        </h2>
        <p class="mt-2.5 text-center text-xs font-[400] text-text-2">
          {{ t('common.verificationCodeSentTo') }}
        </p>
        <p class="mt-2.5 text-center text-sm font-[700] text-text-1">
          {{ phoneNumberDisplay }}
        </p>
      </div>

      <div class="mt-5">
        <p class="text-sm font-[400] text-text-1">
          {{ t('common.verification') }}
        </p>

        <button type="button" class="mt-2 w-full" @click="focusVerificationInput">
          <div class="grid grid-cols-6 gap-auto">
            <div
              v-for="index in 6"
              :key="index"
              class="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-opacity-15 bg-opacity-5 text-lg font-[700] text-text-1"
              :class="
                verificationCode.length === index - 1
                  ? 'border-theme-primary bg-opacity-5'
                  : 'border-transparent bg-opacity-5'
              "
            >
              <span>{{ verificationCode[index - 1] || '' }}</span>
            </div>
          </div>
        </button>

        <input
          ref="verificationInputRef"
          :value="verificationCode"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          autocomplete="one-time-code"
          class="sr-only"
          @input="handleVerificationCodeChange"
        />
      </div>

      <button
        type="button"
        class="mt-5 w-full text-center text-sm font-[700]"
        :class="resendActionClass"
        :disabled="isSendingCode || isResendCountdownRunning"
        @click="handleSendOrResendCode"
      >
        {{ resendActionText }}
      </button>

      <button
        type="button"
        class="relative mt-[30px] flex h-[40px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
        :class="isConfirmButtonDisabled ? 'bg-theme-2' : 'bg-theme-primary'"
        :disabled="isConfirmButtonDisabled"
        @click="handleConfirmStep"
      >
        <span class="relative z-[1] flex items-center justify-center">
          <ButtonLoadingSpinner
            v-if="isConfirmingCode"
            :size="16"
            :border-width="2"
            :color="'text-text-4'"
          />
          <span v-else>{{ t('common.confirm') }}</span>
        </span>
      </button>

      <p
        class="mt-5 cursor-pointer text-center text-sm font-[400] text-text-1"
        @click="openSmsCodeHelpPopup"
      >
        {{ t('common.didntReceiveCode') }}
      </p>
    </template>

    <!-- 新密码和确认密码 -->
    <template v-else>
      <div class="space-y-5">
        <div>
          <p class="mb-2 text-sm font-[400] text-text-1">
            {{ t('common.newPassword') }}
          </p>

          <div class="relative">
            <input
              :value="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              :placeholder="t('common.enterNewPassword')"
              class="h-[48px] w-full rounded-[10px] border border-input-2 bg-input-1 px-3.5 text-base font-[700] text-text-1 focus:outline-none focus:border-theme-primary placeholder:text-text-3"
              @input="handleNewPasswordChange"
            />

            <button
              type="button"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
              @click="toggleNewPassword"
            >
              <EyeIcon v-if="!showNewPassword" class="h-4 w-4 text-text-2" />
              <EyeOffIcon v-else class="h-4 w-4 text-text-2" />
            </button>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-[400] text-text-1">
            {{ t('common.confirm_password') }}
          </p>

          <div class="relative">
            <input
              :value="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="t('common.reEnterNewPassword')"
              class="h-[48px] w-full rounded-[10px] border border-input-2 bg-input-1 px-3.5 text-base font-[700] text-text-1 focus:outline-none focus:border-theme-primary placeholder:text-text-3"
              @input="handleConfirmPasswordChange"
            />

            <button
              type="button"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
              @click="toggleConfirmPassword"
            >
              <EyeIcon v-if="!showConfirmPassword" class="h-4 w-4 text-text-2" />
              <EyeOffIcon v-else class="h-4 w-4 text-text-2" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="relative mt-[30px] flex h-[40px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
        :class="isUpdatePasswordButtonDisabled ? 'bg-theme-2' : 'bg-theme-primary'"
        :disabled="isUpdatePasswordButtonDisabled"
        @click="handleUpdatePassword"
      >
        <span class="relative z-[1] flex items-center justify-center">
          <ButtonLoadingSpinner
            v-if="isUpdatingPassword"
            :size="16"
            :border-width="2"
            :color="'text-text-4'"
          />
          <span v-else>{{ t('common.updatePassword') }}</span>
        </span>
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import Api from '@/api'
import ButtonLoadingSpinner from '@/components/common/ButtonLoadingSpinner.vue'
import SmsCodeHelpPopup from '@/components/common/SmsCodeHelpPopup.vue'
import { usePersistentCountdown } from '@/composables/usePersistentCountdown'
import { useUserStore } from '@/stores/user'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SetIcon from '@/static/svg/set.svg?component'
import { StringExtension } from '@/utils/string-extension'
import { getDefaultAreaCode, getDefaultAreaCodeDisplay } from '@/utils/locale'
import {
  handlePasswordInput,
  handleVerificationCodeInput,
  isValidPassword
} from '@/utils/phone-input'

const SMS_COUNTDOWN_STORAGE_KEY = 'change-login-password-sms-countdown'

const { t } = useI18n()
const userStore = useUserStore()
const { userInfo, acctInfo } = storeToRefs(userStore)
const defaultAreaCode = getDefaultAreaCode()
const defaultAreaCodeDisplay = getDefaultAreaCodeDisplay()

const currentStep = ref<'verification' | 'password'>('verification')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isSendingCode = ref(false)
const isConfirmingCode = ref(false)
const isUpdatingPassword = ref(false)
const hasRequestedSmsCode = ref(false)
const showSmsCodeHelpPopup = ref(false)
const verificationInputRef = ref<HTMLInputElement | null>(null)

const {
  remainingSeconds,
  isRunning: isResendCountdownRunning,
  startCountdown,
  syncCountdown
} = usePersistentCountdown({
  storageKey: SMS_COUNTDOWN_STORAGE_KEY,
  durationSeconds: 60
})

const resolvedTelephone = computed(() => String(userInfo.value?.telephone ?? '').trim())

const phoneNumberDisplay = computed(() => {
  if (!resolvedTelephone.value) {
    return `${defaultAreaCodeDisplay} --`
  }

  return `${defaultAreaCodeDisplay} ${resolvedTelephone.value}`
})

const resendActionText = computed(() => {
  if (isResendCountdownRunning.value) {
    return t('common.resendInSeconds', { seconds: remainingSeconds.value })
  }

  return hasRequestedSmsCode.value ? t('common.resendCode') : t('common.sendCode')
})

const resendActionClass = computed(() => {
  return isSendingCode.value || isResendCountdownRunning.value
    ? 'text-text-2'
    : 'text-theme-primary'
})

const isConfirmButtonDisabled = computed(() => {
  return verificationCode.value.length !== 6 || isConfirmingCode.value
})

const isUpdatePasswordButtonDisabled = computed(() => {
  return (
    !isValidPassword(newPassword.value) ||
    !confirmPassword.value ||
    newPassword.value !== confirmPassword.value ||
    isUpdatingPassword.value
  )
})

/**
 * 聚焦验证码输入框。
 */
const focusVerificationInput = async () => {
  await nextTick()
  verificationInputRef.value?.focus()
}

/**
 * 初始化页面用户信息与短信倒计时状态。
 */
const initializePage = async () => {
  userStore.syncStoredUserData()

  const currentMemberId = userInfo.value?.memberId || acctInfo.value?.memberId

  if (currentMemberId) {
    await userStore.refreshUserInfo(currentMemberId)
  } else {
    await userStore.refreshCurrentUserData()
  }

  syncCountdown()
  hasRequestedSmsCode.value = remainingSeconds.value > 0
}

/**
 * 打开短信验证码帮助弹窗。
 */
const openSmsCodeHelpPopup = () => {
  showSmsCodeHelpPopup.value = true
}

/**
 * 处理验证码输入。
 */
const handleVerificationCodeChange = (event: Event) => {
  handleVerificationCodeInput(event, value => {
    verificationCode.value = value
  })
}

/**
 * 处理新密码输入。
 */
const handleNewPasswordChange = (event: Event) => {
  handlePasswordInput(event, value => {
    newPassword.value = value
  })
}

/**
 * 处理确认密码输入。
 */
const handleConfirmPasswordChange = (event: Event) => {
  handlePasswordInput(event, value => {
    confirmPassword.value = value
  })
}

/**
 * 切换新密码显隐状态。
 */
const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value
}

/**
 * 切换确认密码显隐状态。
 */
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

/**
 * 重置修改登录密码页面本地表单状态。
 */
const resetChangeLoginPasswordState = () => {
  currentStep.value = 'verification'
  verificationCode.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showNewPassword.value = false
  showConfirmPassword.value = false
  showSmsCodeHelpPopup.value = false
}

/**
 * 发送或重新发送短信验证码。
 */
const handleSendOrResendCode = async () => {
  if (isSendingCode.value || isResendCountdownRunning.value) {
    return
  }

  if (!resolvedTelephone.value) {
    showToast({
      message: t('common.phoneNumberUnavailable'),
      duration: 2000,
      wordBreak: 'break-word',
      zIndex: 10001
    })
    return
  }

  try {
    isSendingCode.value = true

    const response = await Api.auth.sendSms({
      telephone: resolvedTelephone.value,
      areaCode: defaultAreaCode
    })

    if (response?.code === 'C2') {
      hasRequestedSmsCode.value = true
      startCountdown()
      await focusVerificationInput()
    }

    if (response?.message) {
      showToast({
        message: response.message,
        duration: 2000,
        wordBreak: 'break-word',
        zIndex: 10001
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSendingCode.value = false
  }
}

/**
 * 处理验证码确认步骤切换。
 */
const handleConfirmStep = async () => {
  if (isConfirmButtonDisabled.value) {
    return
  }

  try {
    isConfirmingCode.value = true

    const response = await Api.auth.checkSms({
      telephone: resolvedTelephone.value,
      areaCode: defaultAreaCode,
      smsCode: verificationCode.value
    })

    if (response?.code === 'C2') {
      currentStep.value = 'password'
      return
    }

    if (response.message) {
      showToast({
        message: response.message,
        duration: 2000,
        wordBreak: 'break-word',
        zIndex: 10001
      })
    }

    verificationCode.value = ''
    await focusVerificationInput()
  } finally {
    isConfirmingCode.value = false
  }
}

/**
 * 提交新的登录密码。
 */
const handleUpdatePassword = async () => {
  if (isUpdatePasswordButtonDisabled.value) {
    return
  }

  try {
    isUpdatingPassword.value = true

    const response = await Api.user.modifyMemberInfo({
      memberPwd: StringExtension.md5(newPassword.value)
    })

    if (response?.code === 'C2') {
      resetChangeLoginPasswordState()
      await userStore.handleAuthExpired()
      return
    }

    if (response.message) {
      showToast({
        message: response.message,
        duration: 2000,
        wordBreak: 'break-word',
        zIndex: 10001
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    isUpdatingPassword.value = false
  }
}

onMounted(() => {
  void initializePage()
})
</script>

<style scoped lang="scss"></style>
