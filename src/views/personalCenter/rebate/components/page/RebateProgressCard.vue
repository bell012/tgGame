<template>
  <section
    class="mt-3 rounded-[14px] bg-bg-2"
    :class="isMobile ? 'rebate-progress-mobile px-3.5 py-3.5' : 'px-4 py-4'"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-text-2" :class="isMobile ? 'text-[12px]' : 'text-sm'">
          {{ t('rebatePage.progress.currentRebate') }}
        </p>
        <p
          class="mt-1 font-[700] leading-none text-text-1"
          :class="isMobile ? 'text-[14px]' : 'text-[14px]'"
        >
          {{ currentRebateText }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-text-2" :class="isMobile ? 'text-[12px]' : 'text-sm'">
          {{ t('rebatePage.progress.nextRebate') }}
        </p>
        <p
          class="mt-1 font-[700] leading-none text-text-1"
          :class="isMobile ? 'text-[14px]' : 'text-[14px]'"
        >
          {{ nextRebateText }}
        </p>
      </div>
    </div>

    <div class="relative mt-3 h-[10px] rounded-full bg-mask-20">
      <div
        class="h-full rounded-full bg-theme-primary transition-all duration-300"
        :style="{ width: `${progressPercent}%` }"
      ></div>
      <span
        class="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-theme-primary px-2 py-[1px] font-[700] leading-none text-text-4"
        :class="isMobile ? 'text-[10px]' : 'text-xs'"
      >
        {{ progressPercentText }}
      </span>
    </div>

    <p class="mt-2 text-text-2" :class="isMobile ? 'text-[12px]' : 'text-sm'">
      {{ t('rebatePage.progress.currentValidBets') }}:
      <span class="text-theme-primary">{{ currentValidBetsPlainText }}</span
      >/<span class="text-text-1">{{ targetValidBetsText }}</span>
    </p>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  currentRebateText: string
  currentValidBetsPlainText: string
  isMobile: boolean
  nextRebateText: string
  progressPercent: number
  progressPercentText: string
  targetValidBetsText: string
}>()
</script>

<style scoped lang="scss">
.rebate-progress-mobile {
  border: 1px solid var(--color-opacity-5);
}
</style>
