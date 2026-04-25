<!-- 规则组件 -->
<template>
  <section class="space-y-2.5 sm:bg-bg-2 sm:p-[24px] sm:rounded-[10px]">
    <div class="rounded-[10px] bg-bg-2 p-3.5 pb-[0px] sm:p-0 sm:pb-0">
      <h3 class="text-sm font-[700] text-text-1 sm:text-base">
        {{ $t('vipPage.retention.title') }}
      </h3>

      <div class="mt-3.5 sm:mt-[8px] sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
        <article
          v-for="card in retentionCards"
          :key="card.key"
          class="py-3.5 flex items-center justify-between sm:h-[80px] sm:p-6 sm:bg-opacity-5 sm:rounded-[16px]"
        >
          <div class="flex items-center gap-2.5 sm:gap-[16px]">
            <img
              :src="card.icon"
              alt=""
              aria-hidden="true"
              class="h-[25px] w-[25px] sm:h-8 sm:w-8"
            />
            <p class="text-sm font-[400] text-text-1 sm:text-base sm:font-[700]">
              {{ card.label }}
            </p>
          </div>
          <p class="flex items-center text-base font-[700] text-text-1 sm:text-2xl">
            {{ card.amount }}
          </p>
        </article>
      </div>
    </div>

    <div class="rounded-[10px] bg-bg-2 p-3.5 pt-[0px] sm:mt-[8px] sm:p-0">
      <article v-for="rule in rules" :key="rule.key" class="pt-[14px] sm:first:pt-0">
        <h3 class="text-sm font-[400] text-text-1 sm:text-base sm:font-[700]">{{ rule.title }}</h3>
        <p class="mt-[7px] text-xs text-text-2 sm:mt-2 sm:text-sm">{{ rule.description }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { VipRetentionCard } from './shared'

defineProps<{
  retentionCards: VipRetentionCard[]
  rules: Array<{ key: string; title: string; description: string }>
}>()
</script>
