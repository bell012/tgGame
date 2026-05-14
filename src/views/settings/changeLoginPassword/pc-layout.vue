<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-[10020] flex items-center justify-center bg-mask-60-1"
  >
    <SmsCodeHelpPopup v-model="showSmsCodeHelpPopup" desktop />

    <section class="w-full max-w-[465px] rounded-[24px] bg-bg-1 p-8" @click.stop>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-[700] text-text-1">
          {{ t('common.changeLoginPassword') }}
        </h2>

        <button
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-[4px] bg-opacity-10"
          @click="handleClose"
        >
          <CloseIcon class="h-2.5 w-2.5 text-text-1" />
        </button>
      </div>

      <template v-if="currentStep === 'verification'">
        <div class="mt-12 flex flex-col items-center">
          <SetIcon class="h-[30px] w-[30px] text-text-2" />
          <h3 class="mt-[9px] text-center text-xl font-[700] text-text-1">
            {{ t('common.mobileVerification') }}
          </h3>
          <p class="mt-[24px] text-center text-xl font-[400] text-text-2">
            {{ t('common.verificationCodeSentTo') }}
          </p>
          <p class="text-center text-xl font-[700] text-text-1">
            {{ phoneNumberDisplay }}
          </p>
        </div>

        <div class="mt-8">
          <p class="text-sm font-[400] text-text-1">{{ t('common.verification') }}</p>

          <button type="button" class="mt-2 w-full" @click="focusVerificationInput">
            <div class="grid grid-cols-6 gap-2">
              <div
                v-for="index in 6"
                :key="index"
                class="flex h-[60px] w-[60px] items-center justify-center rounded-[12px] border border-opacity-15 bg-opacity-5 text-2xl font-[700] text-text-1"
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
          class="mt-8 w-full text-center text-sm font-[700]"
          :class="resendActionClass"
          :disabled="isSendingCode || isResendCountdownRunning"
          @click="handleSendOrResendCode"
        >
          {{ resendActionText }}
        </button>

        <button
          type="button"
          class="relative mt-[32px] flex h-[49px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
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
          class="mt-6 cursor-pointer text-center text-sm font-[400] text-text-1"
          @click="openSmsCodeHelpPopup"
        >
          {{ t('common.didntReceiveCode') }}
        </p>
      </template>

      <!-- 新密码和确认密码 -->
      <template v-else>
        <div class="mt-8 space-y-6">
          <div>
            <p class="mb-2 text-base font-[400] text-text-1">{{ t('common.newPassword') }}</p>
            <div class="relative">
              <input
                :value="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                :placeholder="t('common.enterNewPassword')"
                class="h-[48px] w-full rounded-[10px] border border-input-2 bg-input-1 px-3.5 text-base font-[700] text-text-1 focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:font-[400]"
                @input="handleNewPasswordChange"
              />
              <button
                type="button"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                @click="toggleNewPassword"
              >
                <EyeIcon v-if="showNewPassword" class="h-6 w-6 text-text-2" />
                <EyeOffIcon v-else class="h-6 w-6 text-text-2" />
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-[400] text-text-1">{{ t('common.confirm_password') }}</p>
            <div class="relative">
              <input
                :value="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                :placeholder="t('common.reEnterNewPassword')"
                class="h-[48px] w-full rounded-[10px] border border-input-2 bg-input-1 px-3.5 text-base font-[700] text-text-1 focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:font-[400]"
                @input="handleConfirmPasswordChange"
              />
              <button
                type="button"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                @click="toggleConfirmPassword"
              >
                <EyeIcon v-if="showConfirmPassword" class="h-6 w-6 text-text-2" />
                <EyeOffIcon v-else class="h-6 w-6 text-text-2" />
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="relative mt-[24px] flex h-[48px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ButtonLoadingSpinner from '@/components/common/ButtonLoadingSpinner.vue'
import SmsCodeHelpPopup from '@/components/common/SmsCodeHelpPopup.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SetIcon from '@/static/svg/set.svg?component'
import { navigateToName } from '@/utils/router'
import { useChangeLoginPassword } from './shared'

interface Props {
  modelValue?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isVisible = computed(() => {
  return props.modelValue ?? true
})

const {
  t,
  currentStep,
  verificationCode,
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  isSendingCode,
  isConfirmingCode,
  isUpdatingPassword,
  showSmsCodeHelpPopup,
  verificationInputRef,
  isResendCountdownRunning,
  phoneNumberDisplay,
  resendActionText,
  resendActionClass,
  isConfirmButtonDisabled,
  isUpdatePasswordButtonDisabled,
  focusVerificationInput,
  openSmsCodeHelpPopup,
  resetChangeLoginPasswordState,
  handleVerificationCodeChange,
  handleNewPasswordChange,
  handleConfirmPasswordChange,
  toggleNewPassword,
  toggleConfirmPassword,
  handleSendOrResendCode,
  handleConfirmStep,
  handleUpdatePassword
} = useChangeLoginPassword()

/**
 * 关闭 PC 修改登录密码弹窗。
 */
const handleClose = () => {
  resetChangeLoginPasswordState()

  if (props.modelValue !== undefined) {
    emit('update:modelValue', false)
    return
  }

  void navigateToName('security', { replace: true })
}
</script>

<style scoped lang="scss"></style>
