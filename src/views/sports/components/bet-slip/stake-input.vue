<template>
  <div class="min-w-0">
    <div
      class="flex h-[42px] min-w-0 items-center gap-[3px] rounded-lg bg-input-3 p-1.5 text-sm"
      :class="
        props.error
          ? 'ring-1 ring-secondary-2'
          : 'focus-within:ring-1 focus-within:ring-theme-primary'
      "
    >
      <span
        class="shrink-0 font-bold"
        :class="props.value ? 'text-text-1' : 'text-text-3'"
        aria-hidden="true"
      >
        {{ props.currencySymbol }}
      </span>
      <input
        type="text"
        inputmode="decimal"
        autocomplete="off"
        maxlength="12"
        class="w-0 min-w-0 flex-1 bg-transparent font-semibold text-text-1 outline-none placeholder:font-normal placeholder:text-text-3"
        :value="props.value"
        :aria-label="props.label"
        :aria-invalid="Boolean(props.error)"
        :aria-describedby="props.error ? errorId : undefined"
        :disabled="props.disabled"
        :placeholder="props.placeholder ?? 'Enter Amount'"
        @input="handleInput"
        @focus="emit('focus')"
      />
      <button
        type="button"
        class="ml-1.5 h-[30px] w-[61px] shrink-0 rounded-md bg-bg-5 text-xs font-bold text-text-1 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
        :disabled="props.disabled"
        @click="emit('max')"
      >
        Max
      </button>
    </div>
    <p
      v-if="props.error"
      :id="errorId"
      class="mt-2 text-xs leading-[15px] text-secondary-2"
      role="alert"
    >
      {{ props.error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { nextTick, useId } from 'vue'

const props = defineProps<{
  value: string
  currencySymbol: string
  label: string
  placeholder?: string
  error?: string
  disabled?: boolean
}>()
const errorId = useId()

const emit = defineEmits<{
  update: [value: string]
  focus: []
  max: []
}>()

async function handleInput(event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  emit('update', input.value)
  await nextTick()
  // 同步父级校验后的值，清掉未被接受的输入。
  if (input.value !== props.value) input.value = props.value
}
</script>
