<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-[10020] flex items-center justify-center bg-mask-60-1"
  >
    <SmsCodeHelpPopup v-model="showSmsCodeHelpPopup" desktop />

    <section class="w-full max-w-[465px] rounded-[24px] bg-bg-1 p-8" @click.stop>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-[700] text-text-1">{{ pageTitle }}</h2>

        <button
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-[4px] bg-opacity-10"
          @click="handleClose"
        >
          <CloseIcon class="h-2.5 w-2.5 text-text-1" />
        </button>
      </div>

      <!-- 第一步 -->
      <template v-if="currentStep === 'verification'">
        <div class="mt-12 flex flex-col items-center">
          <SetIcon class="h-[30px] w-[30px] text-text-2" />
          <h3 class="mt-[9px] text-center text-xl font-[700] text-text-1">
            {{ t('common.mobileVerification') }}
          </h3>
          <p class="mt-[24px] text-center text-xl font-[400] text-text-2">
            {{ t('common.verificationCodeSentTo') }}
          </p>
          <p class="text-center text-xl font-[700] text-text-1">{{ phoneNumberDisplay }}</p>
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

      <!-- 第二步 -->
      <template v-else>
        <div class="mt-12 space-y-8">
          <div>
            <p class="mb-2 text-sm font-[400] text-text-1">
              {{ t('common.transactionPassword') }}
            </p>

            <button type="button" class="w-full" @click="focusTransactionPasswordInput">
              <div class="grid grid-cols-6 gap-2">
                <div
                  v-for="index in 6"
                  :key="`transaction-${index}`"
                  class="flex h-[60px] w-[60px] items-center justify-center rounded-[12px] border border-opacity-15 bg-opacity-5 text-2xl font-[700] text-text-1"
                  :class="
                    transactionPassword.length === index - 1
                      ? 'border-theme-primary bg-opacity-5'
                      : 'border-transparent bg-opacity-5'
                  "
                >
                  <span>{{ transactionPassword[index - 1] || '' }}</span>
                </div>
              </div>
            </button>

            <input
              ref="transactionPasswordInputRef"
              :value="transactionPassword"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              class="sr-only"
              @input="handleTransactionPasswordChange"
            />
          </div>

          <div>
            <p class="mb-2 text-sm font-[400] text-text-1">
              {{ t('common.confirmTransactionPassword') }}
            </p>

            <button type="button" class="w-full" @click="focusConfirmTransactionPasswordInput">
              <div class="grid grid-cols-6 gap-2">
                <div
                  v-for="index in 6"
                  :key="`confirm-transaction-${index}`"
                  class="flex h-[60px] w-[60px] items-center justify-center rounded-[12px] border border-opacity-15 bg-opacity-5 text-2xl font-[700] text-text-1"
                  :class="
                    confirmTransactionPassword.length === index - 1
                      ? 'border-theme-primary bg-opacity-5'
                      : 'border-transparent bg-opacity-5'
                  "
                >
                  <span>{{ confirmTransactionPassword[index - 1] || '' }}</span>
                </div>
              </div>
            </button>

            <input
              ref="confirmTransactionPasswordInputRef"
              :value="confirmTransactionPassword"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              class="sr-only"
              @input="handleConfirmTransactionPasswordChange"
            />
          </div>
        </div>

        <button
          type="button"
          class="relative mt-[32px] flex h-[48px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
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
import SetIcon from '@/static/svg/set.svg?component'
import { navigateToName } from '@/utils/router'
import { useTransactionPassword } from './shared'

interface Props {
  modelValue?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isVisible = computed(() => props.modelValue ?? true)

const {
  t,
  pageTitle,
  currentStep,
  verificationCode,
  transactionPassword,
  confirmTransactionPassword,
  isSendingCode,
  isConfirmingCode,
  isUpdatingPassword,
  showSmsCodeHelpPopup,
  verificationInputRef,
  transactionPasswordInputRef,
  confirmTransactionPasswordInputRef,
  isResendCountdownRunning,
  phoneNumberDisplay,
  resendActionText,
  resendActionClass,
  isConfirmButtonDisabled,
  isUpdatePasswordButtonDisabled,
  focusVerificationInput,
  focusTransactionPasswordInput,
  focusConfirmTransactionPasswordInput,
  openSmsCodeHelpPopup,
  resetTransactionPasswordState,
  handleVerificationCodeChange,
  handleTransactionPasswordChange,
  handleConfirmTransactionPasswordChange,
  handleSendOrResendCode,
  handleConfirmStep,
  handleUpdatePassword
} = useTransactionPassword()

/**
 * 关闭 PC 交易密码弹窗。
 */
const handleClose = () => {
  resetTransactionPasswordState()

  if (props.modelValue !== undefined) {
    emit('update:modelValue', false)
    return
  }

  void navigateToName('security', { replace: true })
}
</script>

<style scoped lang="scss"></style>
