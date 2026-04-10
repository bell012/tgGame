<template>
  <withdrawPopShell
    v-model="visible"
    :transition-type="isMobile ? 'bottom-sheet' : 'modal'"
    @close="handleClose"
  >
    <div
      class="relative mx-auto flex w-full flex-col rounded-t-[12px] bg-bg-1 px-4 pb-5 pt-4 font-['Inter'] sm:w-[464px] sm:rounded-[24px] sm:p-8"
    >
      <div class="flex items-center justify-between">
        <h2 class="mx-auto sm:mx-0 text-xl font-bold leading-normal text-text-1">
          {{ title }}
        </h2>
        <button
          type="button"
          class="absolute right-4 top-4 hidden h-6 w-6 items-center justify-center rounded-md bg-opacity-10 text-text-1 sm:flex"
          @click="handleClose"
        >
          <CloseIcon class="size-4" />
        </button>
      </div>

      <div class="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
        <div v-if="topInfo" class="rounded-lg bg-bg-2 p-4">
          <div class="flex items-center justify-between">
            <p class="text-sm sm:text-base leading-normal text-text-1">{{ topInfo.label }}</p>
            <div class="flex items-center">
              <div v-if="topInfo.icon" class="mr-2 h-4 w-4 shrink-0 overflow-hidden rounded-full">
                <gameErrImg
                  :img="{ src: topInfo.icon, maintain: false, fit: 'contain' }"
                  class="h-full w-full"
                />
              </div>
              <span class="text-sm sm:text-base font-bold leading-normal text-text-1">{{
                topInfo.value
              }}</span>
            </div>
          </div>
        </div>

        <slot name="extra-content" />

        <div class="mt-2.5 rounded-lg bg-bg-2 p-4">
          <template v-for="(field, index) in fields" :key="field.key">
            <p
              class="text-xs sm:text-sm leading-normal text-text-1"
              :class="index > 0 ? 'mt-4' : ''"
            >
              {{ field.label }}
            </p>
            <div
              class="mt-2.5 rounded-xl border bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0 p-[14px]"
            >
              <input
                :value="modelValue[field.key] ?? ''"
                type="text"
                :placeholder="field.placeholder"
                class="w-full bg-transparent text-sm sm:text-base font-medium text-text-1 outline-none placeholder:text-text-3 placeholder:text-xs sm:placeholder:text-sm"
                @input="handleInput(field.key, $event)"
              />
            </div>
          </template>
        </div>

        <p v-if="notice" class="mt-2.5 text-sm leading-normal text-text-3">
          {{ notice }}
        </p>
      </div>

      <button
        type="button"
        class="mt-6 flex h-10 sm:h-12 min-h-10 w-full shrink-0 items-center justify-center rounded-lg text-sm sm:text-base font-bold text-text-4"
        :class="canConfirm ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed'"
        :disabled="!canConfirm"
        @click="emit('confirm')"
      >
        {{ t('common.confirm') }}
      </button>
    </div>
  </withdrawPopShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import gameErrImg from '@/components/common/gameErrImg.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import withdrawPopShell from './withdrawPopShell.vue'

export interface WithdrawFormField {
  key: string
  label: string
  placeholder: string
}

export interface WithdrawFormTopInfo {
  label: string
  value: string
  icon?: string
}

interface Props {
  modelValue: boolean
  title: string
  fields: WithdrawFormField[]
  formValue: Record<string, string>
  topInfo?: WithdrawFormTopInfo
  notice?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:formValue': [value: Record<string, string>]
  close: []
  confirm: []
}>()

const { t } = useI18n()
const isMobile = useIsMobile()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const modelValue = computed(() => props.formValue)
const canConfirm = computed(() =>
  props.fields.every(field => Boolean((props.formValue[field.key] ?? '').trim()))
)

const handleInput = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement

  emit('update:formValue', {
    ...props.formValue,
    [key]: target.value
  })
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
