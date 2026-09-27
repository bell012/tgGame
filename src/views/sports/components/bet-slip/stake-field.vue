<template>
  <div class="min-w-0">
    <button
      type="button"
      class="flex h-[38px] w-full min-w-0 scroll-my-2 items-center gap-1.5 rounded-lg border border-solid bg-input-3 px-2 text-left focus-visible:outline focus-visible:outline-2"
      :class="
        props.error
          ? 'border-secondary-2 focus-visible:outline-secondary-2'
          : props.active
            ? 'border-theme-primary focus-visible:outline-theme-primary'
            : 'border-opacity-10 focus-visible:outline-theme-primary'
      "
      :aria-label="`${props.label}: ${props.value || t('sports.betSlip.empty')}`"
      :aria-invalid="Boolean(props.error)"
      :data-stake-active="props.active"
      :disabled="props.disabled"
      @click="emit('focus')"
    >
      <span class="shrink-0 text-[15px] font-bold text-text-1">{{ props.currencySymbol }}</span>
      <span
        v-if="props.value"
        class="min-w-0 truncate text-[15px] font-bold tabular-nums text-text-1"
        >{{ props.value }}</span
      >
      <span v-else class="min-w-0 truncate text-xs text-text-3">{{ props.placeholder }}</span>
      <span v-if="props.active" class="h-4 w-px shrink-0 bg-theme-primary" aria-hidden="true" />
    </button>
    <p
      v-if="props.error && !props.hideError"
      class="pt-[6.667px] text-[11px] leading-[13.333px] text-secondary-2"
      role="alert"
    >
      {{ props.error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{
  value: string
  currencySymbol: string
  label: string
  placeholder?: string
  active: boolean
  error: string
  hideError?: boolean
  disabled: boolean
}>()
const emit = defineEmits<{ focus: [] }>()
</script>
