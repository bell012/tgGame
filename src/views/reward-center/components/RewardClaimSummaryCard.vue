<template>
  <div v-if="props.variant === 'desktop-popup'" class="flex items-center justify-between gap-3">
    <div class="min-w-0 flex-1">
      <p class="truncate text-base font-normal leading-tight text-text-1">
        {{ t('rewardCenter.popup.claimableTotalLabel') }}
      </p>
      <p class="mt-2 truncate text-xl font-[700] leading-tight text-theme-primary">
        {{ props.amountText }}
      </p>
    </div>

    <button
      type="button"
      class="btn-primary flex h-10 w-20 shrink-0 items-center justify-center rounded-lg text-sm font-[700] disabled:opacity-40"
      :disabled="props.claimDisabled || props.claimLoading"
      @click="$emit('claim')"
    >
      {{ t('rewardCenter.claimAll') }}
    </button>
  </div>

  <div v-else class="flex items-center gap-2.5" :class="rootClass">
    <img v-if="showCoinImage" :src="summaryCoinImage" alt="" :class="coinClass" />

    <div v-if="isClaimedPageSummary" class="flex min-w-0 flex-1 items-baseline gap-1">
      <span class="shrink-0 text-xs font-normal leading-tight text-text-1">
        {{ t('rewardCenter.summary.claimedTotal') }}
      </span>
      <span class="truncate text-base font-[700] leading-tight text-text-1">
        {{ props.amountText }}
      </span>
    </div>

    <div v-else class="min-w-0 flex-1">
      <p :class="titleClass">
        {{ t('rewardCenter.popup.summaryTitle') }}
      </p>
      <p :class="amountClass">
        {{ props.amountText }}
      </p>
    </div>

    <button
      v-if="showClaimButton && props.variant === 'page'"
      type="button"
      class="flex h-[35px] min-w-[94px] shrink-0 items-center justify-center rounded-[10px] bg-theme-primary px-3 text-sm font-[700] text-text-4 disabled:opacity-40"
      :disabled="props.claimDisabled || props.claimLoading"
      @click="$emit('claim')"
    >
      {{ t('rewardCenter.claimAll') }}
    </button>

    <button
      v-else-if="showClaimButton"
      type="button"
      class="btn-primary flex shrink-0 items-center justify-center rounded-lg text-sm font-[700] disabled:opacity-40"
      :class="buttonClass"
      :disabled="props.claimDisabled || props.claimLoading"
      @click="$emit('claim')"
    >
      {{ t('rewardCenter.claimAll') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import summaryCoinImage from '@/static/img/reward-center/popup-summary-coin.webp'

const props = withDefaults(
  defineProps<{
    amountText: string
    claimDisabled?: boolean
    claimLoading?: boolean
    variant?: 'popup' | 'page' | 'desktop-popup'
    summaryKind?: 'pending' | 'claimed'
  }>(),
  {
    claimDisabled: false,
    claimLoading: false,
    variant: 'popup',
    summaryKind: 'pending'
  }
)

defineEmits<{
  claim: []
}>()

const { t } = useI18n()

const isClaimedPageSummary = computed(
  () => props.variant === 'page' && props.summaryKind === 'claimed'
)

const showCoinImage = computed(() => props.variant === 'page' || props.variant === 'popup')

const showClaimButton = computed(
  () => props.summaryKind === 'pending' && props.variant !== 'desktop-popup'
)

const rootClass = computed(() =>
  props.variant === 'page' ? 'rounded-[10px] bg-bg-2 p-[14px]' : 'h-[65px]'
)

const coinClass = computed(() =>
  props.variant === 'page'
    ? 'h-10 w-10 shrink-0 object-contain'
    : 'h-[49px] w-[45px] shrink-0 object-contain'
)

const titleClass = computed(() =>
  props.variant === 'page'
    ? 'truncate text-xs font-normal leading-tight text-text-1'
    : 'truncate text-sm font-[700] leading-tight text-text-1'
)

const amountClass = computed(() =>
  props.variant === 'page'
    ? 'mt-0.5 truncate text-base font-[700] leading-tight text-text-1'
    : 'mt-0.5 truncate text-xs font-medium leading-tight text-text-2'
)

const buttonClass = computed(() => 'h-[35px] min-w-[88px] px-2')
</script>
