<template>
  <article
    v-if="props.variant === 'popup'"
    class="flex h-[65px] items-center gap-2 rounded-lg bg-opacity-30 px-2"
  >
    <img :src="popupCardImage" alt="" class="h-[49px] w-[45px] shrink-0 object-contain" />

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-[700] leading-tight text-text-1">
        {{ props.item.activityName }}
      </p>
      <p class="mt-0.5 truncate text-xs font-medium leading-tight text-text-2">
        {{ props.item.upToAmountText }}
      </p>
    </div>

    <button
      type="button"
      class="btn-primary flex h-[35px] min-w-[70px] shrink-0 items-center justify-center rounded-lg px-2 text-sm font-[700] disabled:opacity-40"
      :disabled="props.claimDisabled || props.claimed"
      @click="$emit('claim')"
    >
      {{ props.claimLabel }}
    </button>
  </article>

  <article v-else-if="props.variant === 'page'" class="overflow-hidden rounded-[10px] bg-bg-2">
    <div
      class="flex items-center justify-between gap-3 border-b border-opacity-5 px-[14px] py-[10px]"
    >
      <div class="min-w-0">
        <p class="truncate text-base font-[700] leading-tight text-text-1">
          {{ props.item.amountText }}
        </p>
        <p class="mt-0.5 truncate text-[13px] font-normal leading-tight text-text-2">
          {{ props.item.activityName }}
        </p>
      </div>

      <button
        v-if="props.showClaim"
        type="button"
        class="flex h-[35px] min-w-[94px] shrink-0 items-center justify-center rounded-[10px] bg-theme-primary px-3 text-sm font-[700] text-text-4 disabled:opacity-40"
        :disabled="props.claimDisabled || props.claimed"
        @click="$emit('claim')"
      >
        {{ props.claimLabel }}
      </button>
    </div>

    <div class="px-[14px] py-[10px] text-xs font-normal text-text-2">
      {{ props.item.timeText }}
    </div>
  </article>

  <article
    v-else-if="props.variant === 'desktop-popup'"
    class="flex items-center justify-between gap-3 rounded-lg bg-bg-3 px-3 pb-3 pt-4"
  >
    <div class="min-w-0 flex-1">
      <p class="truncate text-base font-[700] leading-tight text-text-1">
        {{ props.item.activityName }}
      </p>
      <p class="mt-2 truncate text-sm font-normal leading-tight text-text-2">
        {{ props.item.upToAmountText }}
      </p>
    </div>

    <button
      type="button"
      class="btn-primary flex h-10 w-20 shrink-0 items-center justify-center rounded-lg text-sm font-[700] disabled:opacity-40"
      :disabled="props.claimDisabled || props.claimed"
      @click="$emit('claim')"
    >
      {{ props.claimLabel }}
    </button>
  </article>

  <article v-else class="overflow-hidden rounded-2xl bg-bg-2">
    <div
      class="flex items-center justify-between gap-3 border-b border-opacity-5"
      :class="props.compact ? 'px-3.5 py-3' : 'px-7 py-4'"
    >
      <div class="min-w-0">
        <p class="text-xl font-[700] text-text-1">{{ props.item.amountText }}</p>
        <p class="text-base text-text-2" :class="props.compact ? 'mt-1' : 'mt-4'">
          {{ props.item.activityName }}
        </p>
      </div>

      <button
        v-if="props.showClaim"
        type="button"
        class="flex h-10 shrink-0 items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4 disabled:opacity-40"
        :class="props.compact ? 'min-w-[88px] px-3' : 'min-w-[200px] px-5'"
        :disabled="props.claimDisabled || props.claimed"
        @click="$emit('claim')"
      >
        {{ props.claimLabel }}
      </button>
    </div>

    <div
      v-if="!props.hideTime"
      class="py-[15px] text-base text-text-2"
      :class="props.compact ? 'px-3.5' : 'px-7'"
    >
      {{ props.item.timeText }}
    </div>
  </article>
</template>

<script setup lang="ts">
import popupCardImage from '@/static/img/reward-center/popup-promo-card.webp'
import type { RewardCenterListItem } from '../shared'

const props = withDefaults(
  defineProps<{
    item: RewardCenterListItem
    claimLabel: string
    claimDisabled?: boolean
    claimed?: boolean
    compact?: boolean
    hideTime?: boolean
    showClaim?: boolean
    variant?: 'default' | 'popup' | 'page' | 'desktop-popup'
  }>(),
  {
    claimDisabled: false,
    claimed: false,
    compact: false,
    hideTime: false,
    showClaim: true,
    variant: 'default'
  }
)

defineEmits<{
  claim: []
}>()
</script>
