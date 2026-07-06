<template>
  <section
    class="bg-bg-2"
    :class="
      isMobile
        ? 'rebate-progress-mobile mt-3 rounded-[14px] px-3.5 py-3.5'
        : 'mt-4 rounded-[16px] px-10 py-5'
    "
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-text-2" :class="isMobile ? 'text-[12px]' : 'text-sm font-[700]'">
          {{ t('rebatePage.progress.currentRebate') }}
        </p>
        <p
          class="font-[700] leading-none text-text-1"
          :class="isMobile ? 'mt-1 text-[14px]' : 'mt-3 text-[14px]'"
        >
          {{ currentRebateText }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-text-2" :class="isMobile ? 'text-[12px]' : 'text-sm font-[700]'">
          {{ t('rebatePage.progress.nextRebate') }}
        </p>
        <p
          class="font-[700] leading-none text-text-1"
          :class="isMobile ? 'mt-1 text-[14px]' : 'mt-3 text-[14px]'"
        >
          {{ nextRebateText }}
        </p>
      </div>
    </div>

    <div
      class="rebate-progress-track"
      :class="isMobile ? 'rebate-progress-track-mobile' : 'rebate-progress-track-pc'"
      :style="{
        '--progress-percent-number': progressPercent,
        '--progress-pill-width': isMobile ? '34px' : '62px'
      }"
    >
      <div class="rebate-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      <span class="rebate-progress-percent-pill" :class="isMobile ? 'text-[10px]' : 'text-[18px]'">
        {{ progressPercentText }}
      </span>
    </div>

    <p class="text-text-2" :class="isMobile ? 'mt-2 text-[12px]' : 'mt-3 text-sm'">
      {{ t('rebatePage.progress.currentValidBets') }}:
      <span class="text-theme-primary" :class="isMobile ? '' : 'font-[700]'">{{
        currentValidBetsPlainText
      }}</span
      >/<span class="text-text-1" :class="isMobile ? '' : 'font-[700]'">{{
        targetValidBetsText
      }}</span>
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

.rebate-progress-track {
  position: relative;
  border-radius: 9999px;
  background: var(--color-theme-level-3);
}

.rebate-progress-track-mobile {
  margin-top: 10px;
  height: 10px;
}

.rebate-progress-track-pc {
  margin-top: 12px;
  height: 20px;

  .rebate-progress-percent-pill {
    height: 24px;
  }
}

.rebate-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--color-theme-level-2);
  transition: width 0.3s ease;
}

.rebate-progress-percent-pill {
  position: absolute;
  left: calc(
    (100% - var(--progress-pill-width, 44px)) * (var(--progress-percent-number) / 100) +
      (var(--progress-pill-width, 44px) / 2)
  );
  top: 50%;
  z-index: 1;
  display: inline-flex;
  width: var(--progress-pill-width, 44px);
  height: 16px;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: var(--color-theme-level-1);
  color: #111a1d;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

@media (min-width: 641px) {
  .rebate-progress-percent-pill {
    height: 24px;
  }
}
</style>
