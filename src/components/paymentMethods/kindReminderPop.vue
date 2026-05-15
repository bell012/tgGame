<template>
  <popShell v-model="visible" @close="handleClose">
    <div
      class="relative mx-auto w-[300px] rounded-xl bg-bg-1 p-5 font-['Inter'] sm:w-[464px] sm:rounded-[24px] sm:bg-bg-1 sm:p-8"
    >
      <div class="flex items-center justify-between gap-4">
        <h2
          class="text-base sm:text-xl font-bold leading-normal capitalize text-text-1 font-['Inter']"
        >
          {{ t('withdraw.kind_reminder_title') }}
        </h2>
        <button
          type="button"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-opacity-10 text-text-1"
          @click="handleClose"
        >
          <CloseIcon class="h-2.5 w-2.5" />
        </button>
      </div>
      <p
        class="mt-2.5 text-sm font-normal leading-normal text-text-2 font-['Inter'] sm:mt-6 sm:text-left"
      >
        {{ t('withdraw.kind_reminder_desc') }}
      </p>
      <div class="mt-[30px] flex flex-col gap-3 sm:mt-6 sm:flex-row sm:gap-6">
        <button
          type="button"
          class="order-2 sm:order-1 flex h-10 w-full items-center justify-center rounded-lg bg-bg-4 text-sm font-medium text-text-2 sm:h-12"
          @click="handleSkip"
        >
          {{ t('withdraw.do_not_set_yet') }}
        </button>
        <button
          type="button"
          class="order-1 sm:order-2 flex h-10 w-full items-center justify-center rounded-lg btn-primary text-sm font-bold text-text-4 sm:h-12"
          @click="handleGoToSettings"
        >
          {{ t('withdraw.go_to_settings') }}
        </button>
      </div>
    </div>
  </popShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import popShell from './popShell.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  settings: []
  skip: []
}>()

const { t } = useI18n()
const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleGoToSettings = () => {
  emit('settings')
  handleClose()
}

const handleSkip = () => {
  emit('skip')
  handleClose()
}
</script>
