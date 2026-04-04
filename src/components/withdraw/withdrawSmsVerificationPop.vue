<template>
  <withdrawPopShell v-model="visible" @close="handleClose">
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
        <div
          class="text-[26px] font-extrabold leading-none text-center text-text-1 sm:text-[40px] sm:font-bold"
        >
          {{ formattedAmount }}
          <span class="text-sm text-text-1 sm:text-lg sm:font-bold">{{ currencyCode }}</span>
        </div>
        <p
          class="mt-2.5 sm:mt-4 text-sm text-text-1 text-center font-['Inter'] sm:text-xl sm:font-normal sm:leading-normal"
        >
          {{ t('withdraw.amount') }}
        </p>
      </div>

      <p
        class="mt-5 text-center text-sm leading-normal text-text-2 sm:mt-8 sm:text-lg sm:leading-7"
      >
        {{ t('withdraw.sms_sent_to') }}
        <br />
        <span class="font-bold text-text-1">{{ maskedPhone }}</span>
      </p>

      <button type="button" class="mt-5 w-full sm:mt-8" @click="focusInput">
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
        class="hidden sm:flex mt-8 h-12 w-full items-center justify-center rounded-lg btn-primary text-base font-bold text-common-900"
        @click="handleConfirmClick"
      >
        {{ t('withdraw.confirm_withdrawal') }}
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
  </withdrawPopShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import withdrawPopShell from './withdrawPopShell.vue'

interface Props {
  modelValue: boolean
  amount: number
  currencyCode: string
  phoneNumber?: string
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
const inputRef = ref<HTMLInputElement | null>(null)
const codeValue = ref('')
const countdown = ref(RESEND_SECONDS)
let countdownTimer: number | null = null

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const canResend = computed(() => countdown.value <= 0)
const formattedAmount = computed(() => Number(props.amount || 0).toFixed(0))
const currencyCode = computed(() => props.currencyCode || 'PHP')

const maskedPhone = computed(() => {
  const value = String(props.phoneNumber || '+63-999****9999').trim()

  if (value.length <= 4) {
    return value
  }

  return `${value.slice(0, 7)}****${value.slice(-4)}`
})

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
  if (!canResend.value) {
    return
  }

  emit('resend')
  startCountdown()
  void focusInput()
}

const handleConfirmClick = () => {
  if (codeValue.value.length !== 6) {
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

    startCountdown()
    void focusInput()
  }
)

watch(codeValue, value => {
  const normalized = value.replace(/\D/g, '').slice(0, 6)

  if (normalized !== value) {
    codeValue.value = normalized
    return
  }

  if (normalized.length === 6) {
    if (window.matchMedia('(min-width: 640px)').matches) {
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
