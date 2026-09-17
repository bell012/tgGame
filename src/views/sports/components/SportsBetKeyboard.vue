<template>
  <div class="h-[205px] rounded-xl bg-bg-2 p-1" data-testid="sports-bet-keyboard">
    <div class="flex h-[33.333px] gap-1 overflow-x-auto overscroll-x-contain">
      <button
        v-for="(amount, index) in props.amounts"
        :key="index"
        type="button"
        class="h-full min-w-0 shrink-0 basis-[calc((100%_-_20px)/6)] truncate rounded-lg border border-solid border-transparent bg-bg-3 px-0.5 text-[15px] tabular-nums text-theme-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
        :aria-label="`Set stake to ${amount}`"
        :aria-pressed="props.value === amount"
        :disabled="props.disabled"
        @click="emit('amount', index)"
      >
        {{ amount || '0' }}
      </button>
      <button
        type="button"
        class="h-full min-w-0 shrink-0 basis-[calc((100%_-_20px)/6)] rounded-lg border border-solid border-transparent bg-bg-3 px-2 text-[15px] text-theme-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
        :disabled="props.disabled"
        @click="emit('edit')"
      >
        Edit
      </button>
    </div>
    <div class="mt-[5px] grid grid-cols-4 grid-rows-4 gap-1">
      <button
        v-for="key in numberKeys"
        :key="key.label"
        type="button"
        class="h-[36.667px] min-w-0 rounded-lg border border-solid border-transparent bg-bg-3 text-lg font-semibold text-text-1 active:bg-bg-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
        :style="{ gridRow: key.row, gridColumn: key.column }"
        :disabled="props.disabled"
        :aria-label="key.label === '.' ? 'Decimal point' : key.label"
        @click="emit('key', key.label)"
      >
        {{ key.label }}
      </button>
      <button
        type="button"
        class="col-start-4 row-start-1 rounded-lg border border-solid border-transparent bg-bg-3 text-base font-semibold text-text-1 disabled:opacity-40"
        :disabled="props.disabled"
        @click="emit('max')"
      >
        Max
      </button>
      <button
        type="button"
        class="col-start-4 row-span-2 row-start-2 flex items-center justify-center rounded-lg border border-solid border-transparent bg-bg-3 text-text-1"
        aria-label="Delete last digit"
        :disabled="props.disabled"
        @click="emit('key', 'delete')"
      >
        <svg viewBox="0 0 28 24" class="h-6 w-7" fill="none" aria-hidden="true">
          <path
            d="M10 3H23C24.1 3 25 3.9 25 5V19C25 20.1 24.1 21 23 21H10L3 12L10 3Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path d="M12 8L20 16M20 8L12 16" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
      <button
        type="button"
        class="col-start-4 row-start-4 flex items-center justify-center rounded-lg border border-solid border-transparent bg-bg-3 text-text-1"
        aria-label="Hide keyboard"
        :disabled="props.disabled"
        @click="emit('hide')"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" aria-hidden="true">
          <rect
            x="3"
            y="3"
            width="18"
            height="14"
            rx="3"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <path
            d="M7 7H8M11.5 7H12.5M16 7H17M7 10H8M11.5 10H12.5M16 10H17M8 13H16M9 20L12 22L15 20"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  amounts: string[]
  value: string
  disabled: boolean
}>()
const emit = defineEmits<{
  key: [key: string]
  amount: [index: number]
  max: []
  hide: []
  edit: []
}>()
const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'].map(
  (label, index) => ({
    label,
    row: Math.floor(index / 3) + 1,
    column: (index % 3) + 1
  })
)
</script>
