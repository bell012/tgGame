<template>
  <div
    class="flex h-[42px] min-w-0 items-center gap-[3px] rounded-lg bg-input-3 p-1.5 text-sm focus-within:ring-1 focus-within:ring-theme-primary"
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
      placeholder="Enter Amount"
      @input="handleInput"
      @focus="emit('focus')"
    />
    <button
      type="button"
      class="ml-1.5 h-[30px] w-[61px] shrink-0 rounded-md bg-bg-5 text-xs font-bold text-text-1 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
      @click="emit('max')"
    >
      Max
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

const props = defineProps<{
  value: string
  currencySymbol: string
  label: string
}>()

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
  // 金额校验交给页面逻辑，并将规范化结果同步到原生输入框。
  if (input.value !== props.value) input.value = props.value
}
</script>
