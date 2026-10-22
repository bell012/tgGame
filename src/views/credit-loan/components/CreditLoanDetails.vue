<template>
  <div class="rounded-xl bg-bg-2 px-3.5 py-4 sm:px-6 sm:py-10">
    <ol class="flex flex-col gap-4 sm:gap-9">
      <li v-for="(rule, index) in props.rules" :key="index" class="flex items-start gap-2 sm:gap-3">
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-theme-primary text-xs font-[700] text-text-4"
        >
          {{ index + 1 }}
        </span>
        <p class="min-w-0 flex-1 text-xs leading-5 text-text-1 sm:text-sm">
          {{ rule.content }}
          <span v-if="rule.highlight" class="text-[#FFD59E]">{{ rule.highlight }}</span>
        </p>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { CreditLoanRuleItem } from '../mock'

const props = defineProps<{
  rules: CreditLoanRuleItem[]
}>()
</script>
