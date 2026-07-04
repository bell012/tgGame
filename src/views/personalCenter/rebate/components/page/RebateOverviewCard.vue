<template>
  <section
    class="rounded-[14px] bg-bg-2"
    :class="isMobile ? 'rebate-overview-mobile px-3.5 py-3.5' : 'px-6 py-5'"
  >
    <div class="flex items-center gap-2.5" :class="isMobile ? '' : 'justify-between'">
      <div class="flex items-center gap-2.5">
        <img
          :src="rebateCoinIcon"
          alt=""
          aria-hidden="true"
          class="shrink-0 object-contain"
          :class="isMobile ? 'h-[46px] w-[46px]' : 'h-[52px] w-[52px]'"
        />
        <p
          :class="
            isMobile ? 'text-base font-[500] text-text-1' : 'text-[16px] font-[500] text-text-1'
          "
        >
          {{ t('rebatePage.overview.todayValidBets') }}:
          <span
            class="ml-1 font-[700] leading-none"
            :class="isMobile ? 'text-[18px]' : 'text-[24px]'"
          >
            {{ todayValidBetsText }}
          </span>
        </p>
      </div>

      <slot name="desktop-action"></slot>
    </div>

    <div class="rebate-overview-divider mt-4 grid grid-cols-2 border-t pt-4">
      <button
        type="button"
        class="rebate-overview-divider-cell rebate-overview-middle-divider px-2 text-center"
        @click="$emit('eligible-turnover-click')"
      >
        <p
          class="font-[700] leading-none text-text-1"
          :class="isMobile ? 'text-[16px]' : 'text-[26px]'"
        >
          {{ eligibleTurnoverText }}
        </p>
        <div class="mt-1.5 inline-flex items-center gap-1 text-text-2">
          <span :class="isMobile ? 'text-[12px] leading-none' : 'text-sm'">
            {{ t('rebatePage.overview.eligibleTurnover') }}
          </span>
          <ExplainIcon class="h-3.5 w-3.5 opacity-80" />
        </div>
      </button>

      <div class="px-2 text-center">
        <p
          class="font-[700] leading-none text-theme-primary"
          :class="isMobile ? 'text-[16px]' : 'text-[26px]'"
        >
          {{ claimableAmountText }}
        </p>
        <p class="mt-1.5 text-text-2" :class="isMobile ? 'text-[12px]' : 'text-sm'">
          {{ t('rebatePage.overview.claimableAmount') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import rebateCoinIcon from '@/static/svg/feedback/dl.svg?url'
import ExplainIcon from '@/static/svg/vip/explain.svg?component'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  claimableAmountText: string
  eligibleTurnoverText: string
  isMobile: boolean
  todayValidBetsText: string
}>()

defineEmits<{
  'eligible-turnover-click': []
}>()
</script>

<style scoped lang="scss">
.rebate-overview-mobile {
}

.rebate-overview-divider {
  border-color: var(--color-opacity-5);
}

.rebate-overview-divider-cell {
  border-color: var(--color-opacity-5);
}

.rebate-overview-middle-divider {
  position: relative;
}

.rebate-overview-middle-divider::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  width: 1px;
  height: 64px;
  transform: translateY(-50%);
  background: var(--color-opacity-5);
}

@media (max-width: 640px) {
  .rebate-overview-middle-divider::after {
    height: 52px;
  }
}
</style>
