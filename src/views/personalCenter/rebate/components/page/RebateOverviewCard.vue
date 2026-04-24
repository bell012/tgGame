<template>
  <section class="rounded-[14px] bg-bg-2" :class="isMobile ? 'px-3.5 py-3.5' : 'px-6 py-5'">
    <div class="flex items-center gap-2.5" :class="isMobile ? '' : 'justify-between'">
      <div class="flex items-center gap-2.5">
        <div class="rebate-coin shrink-0">
          <span>$</span>
        </div>
        <p
          :class="
            isMobile ? 'text-base font-[500] text-text-1' : 'text-[16px] font-[500] text-text-1'
          "
        >
          今日有效投注:
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

    <div
      class="grid grid-cols-2"
      :class="isMobile ? 'mt-5' : 'mt-4 border-t border-opacity-10 pt-4'"
    >
      <button
        type="button"
        class="border-r border-opacity-10 px-2 text-center"
        @click="$emit('eligible-turnover-click')"
      >
        <p
          class="font-[700] leading-none text-text-1"
          :class="isMobile ? 'text-[16px]' : 'text-[26px]'"
        >
          {{ eligibleTurnoverText }}
        </p>
        <div class="mt-1.5 inline-flex items-center gap-1 text-text-2">
          <span :class="isMobile ? 'text-[12px] leading-none' : 'text-sm'">可计洗码流水</span>
          <InfoIcon class="h-3.5 w-3.5 opacity-80" />
        </div>
      </button>

      <div class="px-2 text-center">
        <p
          class="font-[700] leading-none text-theme-primary"
          :class="isMobile ? 'text-[16px]' : 'text-[26px]'"
        >
          {{ claimableAmountText }}
        </p>
        <p class="mt-1.5 text-text-2" :class="isMobile ? 'text-[12px]' : 'text-sm'">可领取金额</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import InfoIcon from '@/static/svg/info.svg?component'

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
.rebate-coin {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 30% 30%,
    #ffd78e 0%,
    #ffb845 36%,
    #ff9a2e 68%,
    #ef7d12 100%
  );
  box-shadow:
    inset 0 0 0 2px rgba(255, 232, 178, 0.45),
    0 3px 8px rgba(0, 0, 0, 0.22);

  span {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    color: #ff7f2a;
    background: rgba(255, 245, 199, 0.92);
    box-shadow: inset 0 0 0 1px rgba(255, 172, 75, 0.5);
  }
}

@media (max-width: 767px) {
  .rebate-coin {
    width: 46px;
    height: 46px;

    span {
      width: 30px;
      height: 30px;
      font-size: 19px;
    }
  }
}
</style>
