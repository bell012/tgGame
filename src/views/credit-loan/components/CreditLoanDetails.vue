<template>
  <div>
    <div class="rounded-xl bg-bg-2 px-3.5 py-4 sm:px-6 sm:py-10">
      <ol class="flex flex-col gap-4 sm:gap-9">
        <li
          v-for="(rule, index) in props.rules"
          :key="index"
          class="flex items-start gap-2 sm:gap-3"
        >
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

    <div v-if="bottomLogoUrl && !isLogoBroken" class="mt-10 mb-14 flex justify-center">
      <img
        :src="bottomLogoUrl"
        alt=""
        class="w-[150px] max-w-full object-contain"
        @error="isLogoBroken = true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { resolveGameImageUrl } from '@/utils/image'
import type { CreditLoanRuleItem } from '../mock'

const props = withDefaults(
  defineProps<{
    rules: CreditLoanRuleItem[]
    /** 借呗配置 bottomLogo，支持完整地址或相对路径 */
    bottomLogo?: string
  }>(),
  {
    bottomLogo: ''
  }
)

const isLogoBroken = ref(false)
const bottomLogoUrl = computed(() => resolveGameImageUrl(props.bottomLogo))

watch(bottomLogoUrl, () => {
  isLogoBroken.value = false
})
</script>
