<template>
  <section class="min-h-[calc(100vh-110px)]">
    <SmsCodeHelpPopup v-model="showSmsCodeHelpPopup" />

    <!-- 第一步 -->
    <template v-if="currentStep === 'verification'">
      <div class="flex flex-col items-center mt-[30px]">
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
        <p class="text-sm font-[400] text-text-1">{{ t('common.verification') }}</p>

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

    <!-- 第二步 -->
    <template v-else>
      <div class="space-y-5 mt-[20px]">
        <div>
          <p class="mb-2 text-sm font-[400] text-text-1">{{ t('common.transactionPassword') }}</p>

          <button type="button" class="w-full" @click="focusTransactionPasswordInput">
            <div class="grid grid-cols-6 gap-auto">
              <div
                v-for="index in 6"
                :key="`transaction-${index}`"
                class="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-opacity-15 bg-opacity-5 text-lg font-[700] text-text-1"
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
            <div class="grid grid-cols-6 gap-auto">
              <div
                v-for="index in 6"
                :key="`confirm-transaction-${index}`"
                class="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-opacity-15 bg-opacity-5 text-lg font-[700] text-text-1"
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
import ButtonLoadingSpinner from '@/components/common/ButtonLoadingSpinner.vue'
import SmsCodeHelpPopup from '@/components/common/SmsCodeHelpPopup.vue'
import SetIcon from '@/static/svg/set.svg?component'
import { useTransactionPassword } from './shared'

const {
  t,
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
  handleVerificationCodeChange,
  handleTransactionPasswordChange,
  handleConfirmTransactionPasswordChange,
  handleSendOrResendCode,
  handleConfirmStep,
  handleUpdatePassword
} = useTransactionPassword()
</script>

<style scoped lang="scss"></style>
