<template>
  <PopShell v-model="visible" @close="handleClose">
    <div
      class="relative mx-auto w-[300px] rounded-xl bg-bg-1 px-5 pb-6 pt-5 font-['Inter'] sm:w-[464px] sm:rounded-[24px] sm:bg-bg-1 sm:p-8"
    >
      <div class="flex items-center justify-between gap-4">
        <h2
          class="text-base sm:text-xl font-bold leading-normal capitalize text-text-1 font-['Inter']"
        >
          {{ t('withdraw.payment_password') }}
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
          {{ t('payment_methods.busiPwd_content_text') }}
        </p>
      </div>

      <button type="button" class="w-full mt-5 sm:mt-8" @click="focusInput">
        <div class="grid grid-cols-6 gap-2">
          <div
            v-for="index in 6"
            :key="index"
            class="flex h-9 items-center justify-center rounded-lg sm:rounded-xl border border-opacity-15 bg-opacity-6 text-2xl font-bold text-text-1 sm:h-[60px]"
            :class="passwordValue.length === index - 1 ? 'border-theme-primary' : ''"
          >
            <span v-if="passwordValue.length >= index" class="size-3 rounded-full bg-text-1" />
          </div>
        </div>
      </button>

      <button
        type="button"
        class="mt-8 hidden h-12 w-full items-center justify-center rounded-lg btn-primary text-base font-bold text-common-900 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
        :disabled="loading || passwordValue.length !== 6"
        @click="handleConfirmClick"
      >
        {{ resolvedConfirmText }}
      </button>

      <input
        ref="inputRef"
        v-model="passwordValue"
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
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import PopShell from './popShell.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

interface Props {
  modelValue: boolean
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  confirm: [password: string]
}>()

const { t } = useI18n()
const isMobile = useIsMobile()
const inputRef = ref<HTMLInputElement | null>(null)
const passwordValue = ref('')
const resolvedConfirmText = computed(() => t('common.confirm'))

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const focusInput = async () => {
  await nextTick()
  inputRef.value?.focus()
}

const resetState = () => {
  passwordValue.value = ''
}

const handleClose = () => {
  resetState()
  emit('update:modelValue', false)
  emit('close')
}

const handleConfirmClick = () => {
  if (passwordValue.value.length !== 6) {
    return
  }

  if (props.loading) {
    return
  }

  emit('confirm', passwordValue.value)
  resetState()
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

watch(passwordValue, value => {
  const normalized = value.replace(/\D/g, '').slice(0, 6)

  if (normalized !== value) {
    passwordValue.value = normalized
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
    resetState()
  }
})
</script>
