<template>
  <div class="px-5 py-4" :class="props.compact ? 'py-3.5' : 'rounded-2xl bg-bg-2'">
    <div class="flex items-center justify-between gap-3">
      <p class="min-w-0 text-sm font-[700] text-text-1">
        <span>{{ props.label }}</span>
        <span class="ml-1 text-xl font-[700]">{{ props.amountText }}</span>
      </p>

      <button
        v-if="props.showClaim"
        type="button"
        class="flex h-10 shrink-0 items-center justify-center rounded-lg bg-theme-primary px-5 text-sm font-[700] text-text-4 disabled:opacity-40"
        :class="props.compact ? 'min-w-[88px]' : 'min-w-[200px]'"
        :disabled="props.claimDisabled || props.claimLoading"
        @click="$emit('claim')"
      >
        {{ props.claimLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    amountText: string
    claimLabel?: string
    claimDisabled?: boolean
    claimLoading?: boolean
    showClaim?: boolean
    compact?: boolean
  }>(),
  {
    claimLabel: '',
    claimDisabled: false,
    claimLoading: false,
    showClaim: true,
    compact: false
  }
)

defineEmits<{
  claim: []
}>()
</script>
