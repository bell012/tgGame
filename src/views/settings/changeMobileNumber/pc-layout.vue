<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-[10020] flex items-center justify-center bg-mask-60-1"
  >
    <SmsCodeHelpPopup v-model="showSmsCodeHelpPopup" desktop />

    <section class="w-full max-w-[465px] rounded-[24px] bg-bg-1 p-8" @click.stop>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-[700] text-text-1">{{ t('common.changeMobileNumber') }}</h2>

        <button
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-[4px] bg-opacity-10"
          @click="handleClose"
        >
          <CloseIcon class="h-2.5 w-2.5 text-text-1" />
        </button>
      </div>

      <!-- 第一步 -->
      <template v-if="currentStep === 'currentVerification'">
        <div class="mt-12 flex flex-col items-center">
          <SetIcon class="h-[30px] w-[30px] text-text-2" />
          <h3 class="mt-[9px] text-center text-xl font-[700] text-text-1">
            {{ t('common.mobileVerification') }}
          </h3>
          <p class="mt-[24px] text-center text-xl font-[400] text-text-2">
            {{ t('common.verificationCodeSentTo') }}
          </p>
          <p class="text-center text-xl font-[700] text-text-1">{{ currentPhoneNumberDisplay }}</p>
        </div>

        <div class="mt-8">
          <p class="text-sm font-[400] text-text-1">{{ t('common.verification') }}</p>

          <button type="button" class="mt-2 w-full" @click="focusCurrentVerificationInput">
            <div class="grid grid-cols-6 gap-2">
              <div
                v-for="index in 6"
                :key="index"
                class="flex h-[60px] w-[60px] items-center justify-center rounded-[12px] border border-opacity-15 bg-opacity-5 text-2xl font-[700] text-text-1"
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
          class="mt-8 w-full text-center text-sm font-[700]"
          :class="currentResendActionClass"
          :disabled="isSendingCurrentCode || isCurrentResendCountdownRunning"
          @click="handleSendOrResendCurrentCode"
        >
          {{ currentResendActionText }}
        </button>

        <button
          type="button"
          class="relative mt-[32px] flex h-[49px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
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
          class="mt-6 cursor-pointer text-center text-sm font-[400] text-text-1"
          @click="openSmsCodeHelpPopup"
        >
          {{ t('common.didntReceiveCode') }}
        </p>
      </template>

      <!-- 第二步 -->
      <template v-else-if="currentStep === 'newNumber'">
        <div class="mt-8">
          <p class="mb-2 text-base font-[400] text-text-1">{{ t('common.newMobileNumber') }}</p>
          <div
            class="flex h-[48px] items-center rounded-[8px] border border-input-2 bg-input-3 px-3.5"
          >
            <span class="mr-2 text-xl font-[700] text-theme-primary">{{
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

        <div class="mt-8">
          <p class="text-sm font-[400] text-text-1">{{ t('common.verification') }}</p>

          <button type="button" class="mt-2 w-full" @click="focusNewVerificationInput">
            <div class="grid grid-cols-6 gap-2">
              <div
                v-for="index in 6"
                :key="index"
                class="flex h-[60px] w-[60px] items-center justify-center rounded-[12px] border border-opacity-15 bg-opacity-5 text-2xl font-[700] text-text-1"
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
          class="mt-8 w-full text-center text-sm font-[700]"
          :class="newResendActionClass"
          :disabled="isSendingNewCode || isNewResendCountdownRunning"
          @click="handleSendOrResendNewCode"
        >
          {{ newResendActionText }}
        </button>

        <button
          type="button"
          class="relative mt-[24px] flex h-[48px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-[700] text-text-4 disabled:cursor-not-allowed"
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
          class="mt-6 cursor-pointer text-center text-sm font-[400] text-text-1"
          @click="openSmsCodeHelpPopup"
        >
          {{ t('common.didntReceiveCode') }}
        </p>
      </template>

      <!-- 第三个 -->
      <template v-else>
        <div class="mt-[40px] flex flex-col justify-center items-center">
          <Mobile_success class="h-[81px] w-[81px]" />
          <p class="my-[20px] text-base font-[700] text-text-1">{{ t('common.successfully') }}</p>
          <div
            class="flex h-[48px] w-full items-center justify-center rounded-[8px] border border-input-2 bg-input-3 px-3.5"
          >
            <span class="mr-2 text-base font-[700] text-text-1">{{ defaultAreaCodeDisplay }}</span>
            <span class="text-base font-[700] text-text-1">{{ updatedTelephone || '--' }}</span>
          </div>
        </div>

        <button
          type="button"
          class="relative mt-[24px] flex h-[48px] w-full items-center justify-center overflow-hidden rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
          @click="handleAcknowledgeSuccess"
        >
          <span>{{ t('common.ok') }}</span>
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
import Mobile_success from '@/static/svg/mobile_success.svg?skipsvgo'
import { navigateToName } from '@/utils/router'
import { useChangeMobileNumber } from './shared'

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
  resetChangeMobileNumberState,
  handleCurrentVerificationCodeChange,
  handleNewTelephoneChange,
  handleNewVerificationCodeChange,
  handleSendOrResendCurrentCode,
  handleConfirmCurrentStep,
  handleSendOrResendNewCode,
  handleConfirmNewMobileNumber,
  handleAcknowledgeSuccess
} = useChangeMobileNumber()

/**
 * 关闭 PC 修改手机号弹窗。
 */
const handleClose = () => {
  resetChangeMobileNumberState()

  if (props.modelValue !== undefined) {
    emit('update:modelValue', false)
    return
  }

  void navigateToName('security', { replace: true })
}
</script>

<style scoped lang="scss"></style>
