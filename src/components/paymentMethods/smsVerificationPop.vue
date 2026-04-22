<template>
  <PopShell v-model="visible" @close="handleClose">
    <div
      class="relative mx-auto w-[300px] rounded-xl bg-bg-1 px-5 pb-6 pt-5 font-['Inter'] sm:w-[464px] sm:rounded-[24px] sm:bg-bg-1 sm:p-8"
    >
      <div class="flex items-center justify-between gap-4">
        <h2
          class="text-base sm:text-xl font-bold leading-normal capitalize text-text-1 font-['Inter']"
        >
          {{ t('withdraw.sms_verification') }}
        </h2>
        <button
          type="button"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-opacity-10 text-text-1"
          @click="handleClose"
        >
          <CloseIcon class="size-4" />
        </button>
      </div>

      <div class="mt-8 text-center sm:mt-12">
        <p
          class="mt-2.5 sm:mt-4 text-sm text-text-1 text-center font-['Inter'] sm:text-xl sm:font-normal sm:leading-normal"
        >
          {{ t('payment_methods.sms_content_text') }}
        </p>
      </div>

      <p
        class="text-center text-sm leading-normal text-text-2 sm:text-lg sm:leading-7 mt-5 sm:mt-8"
      >
        {{ t('withdraw.sms_sent_to') }}
        <br />
        <span class="font-bold text-text-1">{{ maskedPhone }}</span>
      </p>

      <button type="button" class="w-full mt-5 sm:mt-8" @click="focusInput">
        <div class="grid grid-cols-6 gap-2">
          <div
            v-for="index in 6"
            :key="index"
            class="flex h-9 items-center justify-center rounded-lg sm:rounded-xl border border-opacity-15 bg-opacity-6 text-2xl font-bold text-text-1 sm:h-[60px]"
            :class="codeValue.length === index - 1 ? 'border-theme-primary' : ''"
          >
            <span>{{ codeValue[index - 1] || '' }}</span>
          </div>
        </div>
      </button>

      <button
        type="button"
        class="mt-5 w-full text-center text-sm font-bold text-text-2 sm:mt-8 sm:text-[13px]"
        :class="canResend ? 'text-theme-primary' : ''"
        :disabled="!canResend"
        @click="handleResend"
      >
        {{
          canResend
            ? t('withdraw.resend_code')
            : t('withdraw.resend_in_seconds', { seconds: countdown })
        }}
      </button>

      <button
        type="button"
        class="mt-8 hidden h-12 w-full items-center justify-center rounded-lg btn-primary text-base font-bold text-common-900 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
        :disabled="loading || codeValue.length !== 6"
        @click="handleConfirmClick"
      >
        {{ resolvedConfirmText }}
      </button>

      <input
        ref="inputRef"
        v-model="codeValue"
        type="tel"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="6"
        autocomplete="one-time-code"
        class="sr-only"
      />
    </div>
  </PopShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import PopShell from './popShell.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

interface Props {
  modelValue: boolean
  phoneNumber?: string
  sending?: boolean
  loading?: boolean
  countdownTrigger?: number
}

const RESEND_SECONDS = 60

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  confirm: [code: string]
  resend: []
}>()

const { t } = useI18n()
const isMobile = useIsMobile()
const inputRef = ref<HTMLInputElement | null>(null)
const codeValue = ref('')
const countdown = ref(RESEND_SECONDS)
let countdownTimer: number | null = null

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const canResend = computed(() => countdown.value <= 0)
const maskedPhone = computed(() => String(props.phoneNumber || '').trim())
const resolvedConfirmText = computed(() => t('common.confirm'))

const stopCountdown = () => {
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const startCountdown = () => {
  stopCountdown()
  countdown.value = RESEND_SECONDS

  countdownTimer = window.setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0
      stopCountdown()
      return
    }

    countdown.value -= 1
  }, 1000)
}

const focusInput = async () => {
  await nextTick()
  inputRef.value?.focus()
}

const resetState = () => {
  codeValue.value = ''
  stopCountdown()
}

const handleClose = () => {
  resetState()
  emit('update:modelValue', false)
  emit('close')
}

const handleResend = () => {
  if (!canResend.value || props.sending) {
    return
  }

  emit('resend')
  void focusInput()
}

const handleConfirmClick = () => {
  if (codeValue.value.length !== 6) {
    return
  }

  if (props.loading) {
    return
  }

  emit('confirm', codeValue.value)
  codeValue.value = ''
}

watch(
  () => props.modelValue,
  value => {
    if (!value) {
      resetState()
      return
    }

    void focusInput()
  }
)

watch(
  () => props.countdownTrigger,
  value => {
    if (!props.modelValue || !value) {
      return
    }

    startCountdown()
  }
)

watch(codeValue, value => {
  const normalized = value.replace(/\D/g, '').slice(0, 6)

  if (normalized !== value) {
    codeValue.value = normalized
    return
  }

  if (normalized.length === 6) {
    if (!isMobile.value) {
      return
    }

    if (props.loading) {
      return
    }

    emit('confirm', normalized)
    codeValue.value = ''
  }
})

onUnmounted(() => {
  stopCountdown()
})
</script>
