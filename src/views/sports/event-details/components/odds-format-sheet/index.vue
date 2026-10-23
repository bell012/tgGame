<template>
  <PopShell
    :model-value="modelValue"
    transition-type="bottom-sheet"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <section
      class="w-screen rounded-t-[24px] bg-bg-2 px-[13px] pb-[calc(env(safe-area-inset-bottom)+40px)] pt-5 font-inter text-text-1"
      role="dialog"
      aria-modal="true"
      :aria-label="t('sports.eventDetails.oddsFormatLabel')"
    >
      <h2 class="text-center text-base font-bold leading-5">
        {{ t('sports.eventDetails.oddsFormatLabel') }}
      </h2>
      <div
        class="mt-6 flex flex-col gap-2"
        role="listbox"
        :aria-label="t('sports.eventDetails.oddsFormatOptionsAria')"
      >
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          role="option"
          :aria-selected="selected === option.value"
          class="flex h-[38px] w-full items-center justify-between rounded-lg px-[13px] text-left text-sm font-bold"
          :class="selected === option.value ? 'bg-bg-3' : 'bg-transparent'"
          @click="select(option.value)"
        >
          <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
          <span
            v-if="selected === option.value"
            class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-theme-primary"
            aria-hidden="true"
          >
            <span class="h-[7px] w-[7px] rounded-full bg-bg-2"></span>
          </span>
          <span
            v-else
            class="h-[18px] w-[18px] shrink-0 rounded-full border border-icon-3"
            aria-hidden="true"
          ></span>
        </button>
      </div>
    </section>
  </PopShell>
</template>

<script setup lang="ts" generic="T extends number">
import { useI18n } from 'vue-i18n'
import PopShell from '@/components/withdraw/popShell.vue'

defineProps<{
  modelValue: boolean
  selected: T
  options: readonly { value: T; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [value: T]
}>()

const { t } = useI18n()

const select = (value: T) => {
  emit('select', value)
  emit('update:modelValue', false)
}
</script>
