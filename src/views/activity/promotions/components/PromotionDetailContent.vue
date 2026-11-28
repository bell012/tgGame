<template>
  <div
    :class="
      isDesktop
        ? 'flex flex-col gap-4 p-4'
        : 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5'
    "
  >
    <PromotionDetailBanner
      v-if="detailKind"
      :background="banner"
      :icon="bannerIcon"
      :badge="bannerBadge"
      :title="bannerTitle"
      :subtitle="bannerSubtitle"
      :extra="bannerExtra"
      :is-desktop="isDesktop"
    />
    <section v-else-if="coverUrl">
      <img
        :src="coverUrl"
        :alt="pageTitle"
        class="aspect-[375/180] w-full object-cover"
        :class="isDesktop ? 'rounded-[20px]' : 'rounded-[16px]'"
      />
    </section>

    <RechargeActivityDetail
      v-if="rechargeKind"
      :kind="rechargeKind"
      :summary="rewardSummary"
      :is-desktop="isDesktop"
    />

    <template v-else-if="activity">
      <section
        class="flex items-center justify-center gap-3 text-theme-primary"
        :class="isDesktop ? 'px-2 pt-1' : 'pt-2'"
      >
        <div class="flex min-w-0 flex-1 justify-end">
          <SectionOrnament class="h-3 w-full max-w-[80px]" aria-hidden="true" />
        </div>
        <h2
          class="shrink-0 font-[700]"
          :class="isDesktop ? 'text-[31px] leading-[37px]' : 'text-lg leading-[22px]'"
        >
          {{ $t('activityPromotions.detailTitle') }}
        </h2>
        <div class="flex min-w-0 flex-1 justify-start">
          <SectionOrnament class="h-3 w-full max-w-[80px] scale-x-[-1]" aria-hidden="true" />
        </div>
      </section>

      <template v-if="isRewardMatrix">
        <section class="text-sm leading-relaxed text-text-1">
          <p class="font-[700]">{{ $t('activityPromotions.detail.matrix.greeting') }}</p>
          <p class="mt-2">{{ $t('activityPromotions.detail.matrix.lead') }}</p>
        </section>
        <div :class="isDesktop ? 'overflow-x-auto' : ''">
          <table
            class="promotion-reward-table"
            :class="{ 'promotion-reward-table-h5': !isDesktop }"
          >
            <thead>
              <tr>
                <th v-for="column in matrixColumns" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in rewardMatrixRows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <section>
        <div
          v-if="descriptionHtml"
          class="promotion-detail-html text-sm leading-relaxed text-text-1"
          v-html="descriptionHtml"
        />
        <p
          v-else-if="descriptionText"
          class="whitespace-pre-wrap text-sm leading-relaxed text-text-1"
        >
          {{ descriptionText }}
        </p>
      </section>
    </template>

    <section
      v-else
      class="text-center text-sm text-text-2"
      :class="isDesktop ? 'px-6 py-16' : 'py-10'"
    >
      {{ $t('activityPromotions.notFound') }}
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import type { ActivityListItem } from '@/api/interface/activity'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import CheckInIcon from '@/static/svg/promotions/check-in.svg?component'
import ElectronicIcon from '@/static/svg/promotions/electronic.svg?component'
import TopUpIcon from '@/static/svg/promotions/top-up.svg?component'
import SectionOrnament from '@/static/svg/activity/promotion-detail-section-ornament.svg?component'
import {
  getPromotionRewardSummary,
  isRechargePromotionDetail,
  PROMOTION_DETAIL_BANNERS,
  resolvePromotionDetailKind,
  type PromotionDetailKind
} from '../detail-presentation'
import { getActivityRuleDesc, getActivityTitle, toPromotionImageUrl } from '../shared'
import PromotionDetailBanner from './PromotionDetailBanner.vue'
import RechargeActivityDetail from './RechargeActivityDetail.vue'

const props = withDefaults(
  defineProps<{
    activity: ActivityListItem | null
    variant?: 'mobile' | 'desktop'
  }>(),
  {
    variant: 'mobile'
  }
)

const REWARD_MATRIX_ROWS = [
  [1, 3, 5, 8, 10, 12],
  [2, 5, 8, 10, 12, 15],
  [3, 8, 10, 12, 15, 18],
  [4, 10, 12, 15, 18, 25],
  [5, 12, 15, 18, 20, 30],
  [6, 15, 18, 20, 25, 35],
  [7, 30, 40, 60, 80, 120]
]

const { t, tm } = useI18n()
const readMessage: (key: string) => unknown = tm
const { currentCurrencyCode } = useDisplayCurrency()
const isDesktop = computed(() => props.variant === 'desktop')

const detailKind = computed(() => resolvePromotionDetailKind(props.activity))
const rechargeKind = computed(() =>
  isRechargePromotionDetail(detailKind.value) ? detailKind.value : null
)
const isRewardMatrix = computed(
  () => detailKind.value === 'checkIn' || detailKind.value === 'electronic'
)
const rewardMatrixRows = REWARD_MATRIX_ROWS
const matrixColumns = computed(() => {
  const columns = readMessage('activityPromotions.detail.matrix.columns')
  return Array.isArray(columns) ? columns.map((column: unknown) => String(column)) : []
})
const rewardSummary = computed(() =>
  getPromotionRewardSummary(props.activity, currentCurrencyCode.value)
)

const bannerIcons: Record<PromotionDetailKind, Component> = {
  firstDeposit: TopUpIcon,
  singleDeposit: TopUpIcon,
  cumulativeDeposit: TopUpIcon,
  checkIn: CheckInIcon,
  electronic: ElectronicIcon
}

const banner = computed(() => (detailKind.value ? PROMOTION_DETAIL_BANNERS[detailKind.value] : ''))
const bannerIcon = computed(() => (detailKind.value ? bannerIcons[detailKind.value] : TopUpIcon))
const bannerBadge = computed(() =>
  detailKind.value ? t(`activityPromotions.detail.badge.${detailKind.value}`) : ''
)
const bannerTitle = computed(() =>
  detailKind.value ? t(`activityPromotions.detail.title.${detailKind.value}`) : ''
)
const bannerSubtitle = computed(() =>
  detailKind.value ? t(`activityPromotions.detail.subtitle.${detailKind.value}`) : ''
)
const bannerExtra = computed(() =>
  detailKind.value === 'checkIn' ? t('activityPromotions.detail.longTerm') : ''
)

const coverUrl = computed(() => toPromotionImageUrl(props.activity?.preImage))

const pageTitle = computed(() => (props.activity ? getActivityTitle(props.activity) : ''))

const descriptionRaw = computed(() => {
  if (!props.activity) {
    return ''
  }
  return getActivityRuleDesc(props.activity, currentCurrencyCode.value) || ''
})

const isHtmlDescription = computed(() => {
  const text = descriptionRaw.value
  return text.includes('<') && text.includes('>')
})

const descriptionHtml = computed(() => (isHtmlDescription.value ? descriptionRaw.value : ''))
const descriptionText = computed(() => (isHtmlDescription.value ? '' : descriptionRaw.value))
</script>

<style scoped>
.promotion-detail-html :deep(img) {
  max-width: 100%;
  height: auto;
}

.promotion-detail-html :deep(p) {
  margin: 8px 0;
}

.promotion-reward-table,
.promotion-detail-html :deep(table) {
  width: 100%;
  margin: 16px 0;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 16px;
}

.promotion-reward-table th,
.promotion-reward-table td,
.promotion-detail-html :deep(th),
.promotion-detail-html :deep(td) {
  border-right: 1px solid var(--color-opacity-10);
  border-bottom: 1px solid var(--color-opacity-10);
  padding: 14px 8px;
  text-align: center;
}

.promotion-reward-table th:last-child,
.promotion-reward-table td:last-child,
.promotion-detail-html :deep(th:last-child),
.promotion-detail-html :deep(td:last-child) {
  border-right: none;
}

.promotion-reward-table tr:last-child td,
.promotion-detail-html :deep(tr:last-child td) {
  border-bottom: none;
}

.promotion-reward-table th,
.promotion-detail-html :deep(th) {
  height: 44px;
  padding: 10px 8px;
  background: var(--color-theme-level-3);
  color: var(--color-theme-level-1);
  font-weight: 700;
}

.promotion-reward-table td,
.promotion-detail-html :deep(td) {
  background: var(--color-background-level-4);
  color: var(--color-text-level-1);
}

.promotion-reward-table-h5 {
  margin: 0;
  border-radius: 14px;
  table-layout: fixed;
}

.promotion-reward-table-h5 th {
  height: 40px;
  padding: 8px 2px;
  background: var(--color-theme-level-3);
  color: var(--color-theme-level-1);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  border-right-color: var(--color-opacity-10);
  border-bottom-color: var(--color-opacity-10);
}

.promotion-reward-table-h5 td {
  padding: 12px 2px;
  color: var(--color-text-level-1);
  font-size: 11px;
  font-weight: 400;
  border-right-color: var(--color-opacity-10);
  border-bottom-color: var(--color-opacity-10);
}
</style>
