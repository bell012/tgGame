<template>
  <section class="min-h-[calc(100vh-110px)]">
    <SmsCodeHelpPopup v-model="showSmsCodeHelpPopup" />

    <!-- 第一步 -->
    <template v-if="currentStep === 'currentVerification'">
      <div class="flex flex-col items-center mt-[30px]">
        <SetIcon class="h-[30px] w-[30px] text-text-2" />
        <h2 class="mt-2.5 text-center text-base font-[700] text-text-1">
          {{ t('common.mobileVerification') }}
        </h2>
        <p class="mt-2.5 text-center text-xs font-[400] text-text-2">
          {{ t('common.verificationCodeSentTo') }}
        </p>
        <p class="mt-2.5 text-center text-sm font-[700] text-text-1">
          {{ currentPhoneNumberDisplay }}
        </p>
      </div>

      <div class="mt-5">
        <p class="text-sm font-[400] text-text-1">{{ t('common.verification') }}</p>

        <button type="button" class="mt-2 w-full" @click="focusCurrentVerificationInput">
          <div class="grid grid-cols-6 gap-auto">
            <div
              v-for="index in 6"
              :key="index"
              class="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-opacity-15 bg-opacity-5 text-lg font-[700] text-text-1"
              :class="
                currentVerificationCode.length === index - 1
                  ? 'border-theme-primary bg-opacity-5'
                  : 'border-transparent bg-opacity-5'
              "
            >
              <span>{{ currentVerificationCode[index - 1] || '' }}</span>
            </div>
          </div>
        </button>

        <input
          ref="currentVerificationInputRef"
          :value="currentVerificationCode"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          autocomplete="one-time-code"
          class="sr-only"
          @input="handleCurrentVerificationCodeChange"
        />
      </div>

      <button
        type="button"
        class="mt-5 w-full text-center text-sm font-[700]"
        :class="currentResendActionClass"
        :disabled="isSendingCurrentCode || isCurrentResendCountdownRunning"
        @click="handleSendOrResendCurrentCode"
      >
        {{ currentResendActionText }}
      </button>

      <button
        type="button"
        class="relative mt-[30px] flex h-[40px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
        :class="isCurrentConfirmButtonDisabled ? 'bg-theme-2' : 'bg-theme-primary'"
        :disabled="isCurrentConfirmButtonDisabled"
        @click="handleConfirmCurrentStep"
      >
        <span class="relative z-[1] flex items-center justify-center">
          <ButtonLoadingSpinner
            v-if="isConfirmingCurrentCode"
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
    <template v-else-if="currentStep === 'newNumber'">
      <div class="mt-[20px]">
        <p class="mb-2 text-sm font-[400] text-text-1">{{ t('common.newMobileNumber') }}</p>

        <div
          class="flex h-[48px] items-center rounded-[10px] border border-input-2 bg-input-1 px-3.5"
        >
          <span class="mr-2 text-base font-[700] text-theme-primary">{{
            defaultAreaCodeDisplay
          }}</span>
          <input
            :value="newTelephone"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            :placeholder="t('common.enterNewMobileNumber')"
            class="h-full w-full bg-transparent text-base font-[700] text-text-1 outline-none placeholder:font-[400] placeholder:text-text-3"
            @input="handleNewTelephoneChange"
          />
        </div>
      </div>

      <div class="mt-5">
        <p class="text-sm font-[400] text-text-1">{{ t('common.verification') }}</p>

        <button type="button" class="mt-2 w-full" @click="focusNewVerificationInput">
          <div class="grid grid-cols-6 gap-auto">
            <div
              v-for="index in 6"
              :key="index"
              class="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-opacity-15 bg-opacity-5 text-lg font-[700] text-text-1"
              :class="
                newVerificationCode.length === index - 1
                  ? 'border-theme-primary bg-opacity-5'
                  : 'border-transparent bg-opacity-5'
              "
            >
              <span>{{ newVerificationCode[index - 1] || '' }}</span>
            </div>
          </div>
        </button>

        <input
          ref="newVerificationInputRef"
          :value="newVerificationCode"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          autocomplete="one-time-code"
          class="sr-only"
          @input="handleNewVerificationCodeChange"
        />
      </div>

      <button
        type="button"
        class="mt-5 w-full text-center text-sm font-[700]"
        :class="newResendActionClass"
        :disabled="isSendingNewCode || isNewResendCountdownRunning"
        @click="handleSendOrResendNewCode"
      >
        {{ newResendActionText }}
      </button>

      <button
        type="button"
        class="relative mt-[30px] flex h-[40px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
        :class="isNewConfirmButtonDisabled ? 'bg-theme-2' : 'bg-theme-primary'"
        :disabled="isNewConfirmButtonDisabled"
        @click="handleConfirmNewMobileNumber"
      >
        <span class="relative z-[1] flex items-center justify-center">
          <ButtonLoadingSpinner
            v-if="isConfirmingNewCode"
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

    <!-- 第三步 -->
    <template v-else>
      <div class="mt-[40px] flex flex-col justify-center items-center">
        <Mobile_success class="h-[60px] w-[60px]" />
        <p class="my-[20px] text-sm font-[700] text-text-1">{{ t('common.successfully') }}</p>
        <div
          class="flex h-[44px] w-full items-center justify-center rounded-[10px] border border-input-2 bg-input-1 px-3.5"
        >
          <span class="mr-2 text-lg font-[700] text-text-1">{{ defaultAreaCodeDisplay }}</span>
          <span class="text-lg font-[700] text-text-1">{{ updatedTelephone || '--' }}</span>
        </div>
      </div>

      <button
        type="button"
        class="relative mt-[30px] flex h-[40px] w-full items-center justify-center overflow-hidden rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
        @click="handleAcknowledgeSuccess"
      >
        <span>{{ t('common.ok') }}</span>
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
import ButtonLoadingSpinner from '@/components/common/ButtonLoadingSpinner.vue'
import SmsCodeHelpPopup from '@/components/common/SmsCodeHelpPopup.vue'
import SetIcon from '@/static/svg/set.svg?component'
import Mobile_success from '@/static/svg/mobile_success.svg?skipsvgo'
import { useChangeMobileNumber } from './shared'

const {
  t,
  currentStep,
  defaultAreaCodeDisplay,
  currentVerificationCode,
  newTelephone,
  newVerificationCode,
  updatedTelephone,
  isSendingCurrentCode,
  isConfirmingCurrentCode,
  isSendingNewCode,
  isConfirmingNewCode,
  showSmsCodeHelpPopup,
  currentVerificationInputRef,
  newVerificationInputRef,
  isCurrentResendCountdownRunning,
  isNewResendCountdownRunning,
  currentPhoneNumberDisplay,
  currentResendActionText,
  newResendActionText,
  currentResendActionClass,
  newResendActionClass,
  isCurrentConfirmButtonDisabled,
  isNewConfirmButtonDisabled,
  focusCurrentVerificationInput,
  focusNewVerificationInput,
  openSmsCodeHelpPopup,
  handleCurrentVerificationCodeChange,
  handleNewTelephoneChange,
  handleNewVerificationCodeChange,
  handleSendOrResendCurrentCode,
  handleConfirmCurrentStep,
  handleSendOrResendNewCode,
  handleConfirmNewMobileNumber,
  handleAcknowledgeSuccess
} = useChangeMobileNumber()
</script>

<style scoped lang="scss"></style>
