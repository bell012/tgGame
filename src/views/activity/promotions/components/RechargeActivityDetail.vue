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

    <section :class="isDesktop ? 'rounded-[20px] bg-bg-2 p-6' : ''">
      <h3
        class="font-[700] text-text-1"
        :class="isDesktop ? 'mb-6 text-sm' : 'mb-3 text-[15px] leading-snug'"
      >
        {{ $t(`activityPromotions.detail.section.${kind}`) }}
      </h3>

      <div v-if="!isDesktop" class="overflow-hidden rounded-[14px] bg-bg-4">
        <div
          class="grid h-11 grid-cols-3 border-b border-opacity-10 bg-theme-3 text-[11px] font-[400] text-text-1"
        >
          <div class="flex items-center justify-center border-r border-opacity-10">
            {{ $t('activityPromotions.detail.depositAmount') }}
          </div>
          <div class="flex items-center justify-center border-r border-opacity-10">
            {{ $t('activityPromotions.detail.rewardAmount') }}
          </div>
          <div class="flex items-center justify-center">
            {{ $t('activityPromotions.detail.status') }}
          </div>
        </div>
        <div
          v-for="(tier, index) in summary.tiers"
          :key="`${tier.deposit}-${index}`"
          class="grid h-12 grid-cols-3 border-b border-opacity-10 text-[12px] font-[700] text-text-1 last:border-b-0"
        >
          <div class="flex items-center justify-center border-r border-opacity-10">
            {{ formatTierAmount(tier.deposit) }}
          </div>
          <div class="flex items-center justify-center gap-1 border-r border-opacity-10">
            <span>{{ formatTierAmount(tier.reward) }}</span>
            <span v-if="summary.currency" class="text-[10px] font-[400]">{{
              summary.currency
            }}</span>
          </div>
          <div class="flex items-center justify-center">
            <img :src="tierCheckIcon(index)" alt="" class="h-5 w-5 object-contain" />
          </div>
        </div>
      </div>

      <div v-else class="overflow-x-auto overflow-y-hidden rounded-xl">
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
                <img :src="tierCheckIcon(index)" alt="" class="mx-auto h-4 w-4 object-contain" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul class="space-y-2 text-xs leading-5 text-text-2" :class="isDesktop ? 'mt-6' : 'mt-4'">
        <li v-for="(rule, index) in rules" :key="index">• {{ rule }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import checkDoneIcon from '@/static/svg/promotions/check1.png'
import checkIcon from '@/static/svg/promotions/check.svg?url'
import { formatBalance } from '@/utils/locale'
import type { PromotionRewardSummary, RechargePromotionDetailKind } from '../detail-presentation'

const props = defineProps<{
  kind: RechargePromotionDetailKind
  summary: PromotionRewardSummary
  isDesktop: boolean
}>()

const { tm } = useI18n()
const readMessage: (key: string) => unknown = tm

const rules = computed(() => {
  const message = readMessage(`activityPromotions.detail.rules.${props.kind}`)
  return Array.isArray(message) ? message.map((item: unknown) => String(item)) : []
})

const pendingAmountText = computed(() => formatBalance(props.summary.pendingAmount))
const depositedAmountText = computed(() => formatBalance(props.summary.depositedAmount))
const canClaim = computed(() => props.summary.pendingAmount > 0)

const formatTierAmount = (value: number) => {
  return Number.isInteger(value) ? String(value) : formatBalance(value)
}

const isTierCompleted = (index: number) => {
  const tier = props.summary.tiers[index]
  if (!tier) {
    return false
  }
  if (typeof tier.completed === 'boolean') {
    return tier.completed
  }

  const amount = props.summary.depositedAmount
  if (!(amount > 0) || amount < tier.deposit) {
    return false
  }
  if (props.kind === 'cumulativeDeposit') {
    return true
  }

  const nextTier = props.summary.tiers[index + 1]
  return !nextTier || amount < nextTier.deposit
}

const tierCheckIcon = (index: number) => (isTierCompleted(index) ? checkDoneIcon : checkIcon)
</script>
