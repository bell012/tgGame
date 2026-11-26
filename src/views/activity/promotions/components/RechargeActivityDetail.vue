<template>
  <div class="flex flex-col" :class="isDesktop ? 'gap-4' : 'gap-3'">
    <section class="rounded-[20px] bg-bg-2" :class="isDesktop ? 'px-5 py-4' : 'px-3.5 py-3.5'">
      <div :class="isDesktop ? 'flex items-center gap-4' : 'flex flex-col gap-3'">
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <svg class="h-7 w-7 shrink-0" viewBox="0 0 28 28" aria-hidden="true">
            <circle cx="14" cy="14" r="12" fill="#F5C542" />
            <circle cx="14" cy="14" r="8" fill="none" stroke="#FFF4C2" stroke-width="1.5" />
          </svg>
          <span class="text-sm text-text-1">{{
            $t('activityPromotions.detail.pendingReward')
          }}</span>
          <span class="text-[28px] font-[700] leading-none text-theme-primary">
            {{ pendingAmountText }}
          </span>
          <span v-if="summary.currency" class="text-sm font-[700] text-theme-primary">
            ({{ summary.currency }})
          </span>
        </div>
        <p v-if="kind === 'singleDeposit'" class="shrink-0 text-sm text-text-2">
          {{
            $t('activityPromotions.detail.currentRound', {
              current: summary.currentRound,
              total: summary.totalRounds
            })
          }}
        </p>
        <button
          type="button"
          class="h-12 shrink-0 rounded-lg px-8 text-base font-[700] text-text-4 disabled:cursor-not-allowed"
          :class="[
            isDesktop ? 'min-w-[168px]' : 'w-full',
            canClaim ? 'bg-theme-primary' : 'bg-theme-2'
          ]"
          :disabled="!canClaim"
        >
          {{ $t('activityPromotions.detail.claimNow') }}
        </button>
      </div>

      <div v-if="kind === 'cumulativeDeposit'" class="mt-3 grid grid-cols-2 gap-3">
        <div class="flex items-center justify-between rounded-lg bg-bg-3 px-4 py-3 text-sm">
          <span class="text-text-2">{{ $t('activityPromotions.detail.unclaimedCount') }}</span>
          <span class="font-[700] text-text-1">{{ summary.unclaimedCount }}</span>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-bg-3 px-4 py-3 text-sm">
          <span class="text-text-2">{{ $t('activityPromotions.detail.depositedAmount') }}</span>
          <span class="font-[700] text-text-1">{{ depositedAmountText }}</span>
        </div>
      </div>
    </section>

    <section class="rounded-[20px] bg-bg-2 p-6">
      <h3 class="mb-6 text-sm font-[700] text-text-1">
        {{ $t(`activityPromotions.detail.section.${kind}`) }}
      </h3>
      <div class="overflow-x-auto overflow-y-hidden rounded-xl">
        <table class="w-full min-w-[520px] border-collapse text-center text-sm">
          <thead>
            <tr class="bg-theme-3 text-text-1">
              <th class="border border-white/10 px-3 py-3 font-[500]">
                {{ $t('activityPromotions.detail.depositAmount') }}
              </th>
              <th class="border border-white/10 px-3 py-3 font-[500]">
                {{ $t('activityPromotions.detail.rewardAmount') }}
              </th>
              <th class="border border-white/10 px-3 py-3 font-[500]">
                {{ $t('activityPromotions.detail.status') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tier, index) in summary.tiers" :key="`${tier.deposit}-${index}`">
              <td class="border border-white/10 px-3 py-3 text-text-1">
                {{ formatTierAmount(tier.deposit) }}
              </td>
              <td class="border border-white/10 px-3 py-3 font-[700] text-theme-primary">
                {{ formatTierAmount(tier.reward) }}
                <span v-if="summary.currency">({{ summary.currency }})</span>
              </td>
              <td class="border border-white/10 px-3 py-3 text-text-1">
                <svg class="mx-auto h-4 w-4" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M3 8.2 6.4 11.5 13 4.8"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                  />
                </svg>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul class="mt-6 space-y-2 text-xs leading-5 text-text-2">
        <li v-for="(rule, index) in rules" :key="index">• {{ rule }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatBalance } from '@/utils/locale'
import type { PromotionRewardSummary, RechargePromotionDetailKind } from '../detail-presentation'

const props = defineProps<{
  kind: RechargePromotionDetailKind
  summary: PromotionRewardSummary
  isDesktop: boolean
}>()

const { tm } = useI18n()

const rules = computed(() => {
  const message = tm(`activityPromotions.detail.rules.${props.kind}`)
  return Array.isArray(message) ? message.map(item => String(item)) : []
})

const pendingAmountText = computed(() => formatBalance(props.summary.pendingAmount))
const depositedAmountText = computed(() => formatBalance(props.summary.depositedAmount))
const canClaim = computed(() => props.summary.pendingAmount > 0)

const formatTierAmount = (value: number) => {
  return Number.isInteger(value) ? String(value) : formatBalance(value)
}
</script>
