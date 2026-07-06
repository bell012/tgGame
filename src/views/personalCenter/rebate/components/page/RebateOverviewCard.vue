<template>
  <section
    class="bg-bg-2"
    :class="
      isMobile ? 'rebate-overview-mobile rounded-[14px] px-3.5 py-3.5' : 'rounded-[16px] px-10 py-5'
    "
  >
    <div class="flex items-center" :class="isMobile ? 'gap-2.5' : 'justify-between gap-2.5'">
      <div class="flex items-center" :class="isMobile ? 'gap-2.5' : 'gap-[30px]'">
        <img
          :src="rebateCoinIcon"
          alt=""
          aria-hidden="true"
          class="shrink-0 object-contain"
          :class="isMobile ? 'h-[46px] w-[46px]' : 'h-[60px] w-[60px]'"
        />
        <p
          :class="
            isMobile
              ? 'text-base font-[500] text-text-1'
              : 'flex items-center gap-4 text-[16px] font-[700] text-text-1'
          "
        >
          <span :class="isMobile ? '' : 'leading-none'"
            >{{ t('rebatePage.overview.todayValidBets') }}:</span
          >
          <span
            class="font-[700] leading-none"
            :class="isMobile ? 'ml-1 text-[18px]' : 'text-[40px]'"
          >
            {{ todayValidBetsText }}
          </span>
        </p>
      </div>

      <slot name="desktop-action"></slot>
    </div>

    <div
      class="rebate-overview-divider grid grid-cols-2 border-t"
      :class="isMobile ? 'mt-4 pt-4' : 'mt-5 pt-5'"
    >
      <button
        type="button"
        class="rebate-overview-divider-cell rebate-overview-middle-divider px-2 text-center"
        @click="$emit('eligible-turnover-click')"
      >
        <p
          class="font-[700] leading-none text-text-1"
          :class="isMobile ? 'text-[16px]' : 'text-[20px]'"
        >
          {{ eligibleTurnoverText }}
        </p>
        <div
          class="inline-flex items-center gap-1 text-text-2"
          :class="isMobile ? 'mt-1.5' : 'mt-[15px]'"
        >
          <span :class="isMobile ? 'text-[12px] leading-none' : 'text-[16px] font-[700]'">
            {{ t('rebatePage.overview.eligibleTurnover') }}
          </span>
          <ExplainIcon class="h-3.5 w-3.5 opacity-80" />
        </div>
      </button>

      <div class="px-2 text-center">
        <p
          class="font-[700] leading-none text-theme-primary"
          :class="isMobile ? 'text-[16px]' : 'text-[20px]'"
        >
          {{ claimableAmountText }}
        </p>
        <p
          class="text-text-2"
          :class="isMobile ? 'mt-1.5 text-[12px]' : 'mt-[15px] text-sm font-[700]'"
        >
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
