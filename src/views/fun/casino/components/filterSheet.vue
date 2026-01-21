<template>
  <div class="w-full flex gap-[11px]">
    <button
      class="flex-1 flex items-center justify-between px-2.5 py-[11px] bg-[var(--color-opacity-5)] rounded-lg border border-solid border-[var(--color-opacity-10)] sm:max-w-72"
    >
      <div class="flex items-center flex-1 text-xs">
        <span class="mr-2.5 text-text-2">{{ t('locales.casino.sort') }}:</span>
        <span class="text-text-1">{{ sortBy }}</span>
      </div>
      <span class="fill-text-1">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>
    <button
      class="flex-1 flex items-center justify-between px-2.5 py-[11px] bg-[var(--color-opacity-5)] rounded-lg border border-solid border-[var(--color-opacity-10)] sm:max-w-72"
    >
      <div class="flex items-center flex-1 text-xs">
        <span class="mr-2.5 text-text-2">{{ t('locales.casino.providers') }}:</span>
        <span class="text-text-1">{{ provider }}</span>
      </div>
      <span class="fill-text-1">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  sortOptions: {
    type: Array as () => { label: string; value: string }[],
    default: () => [
      { label: 'A-Z', value: 'az' },
      { label: 'Z-A', value: 'za' }
    ]
  },
  providerOptions: {
    type: Array as () => { label: string; value: string }[],
    default: () => [
      { label: 'All', value: 'all' },
      { label: 'Provider 1', value: 'p1' },
      { label: 'Provider 2', value: 'p2' }
    ]
  }
})

const emit = defineEmits<{
  (e: 'update:sort', value: string): void
  (e: 'update:provider', value: string): void
}>()

const sortBy = ref(props.sortOptions[0].value)
const provider = ref(props.providerOptions[0].value)

watch(sortBy, newVal => emit('update:sort', newVal))
watch(provider, newVal => emit('update:provider', newVal))
</script>
