<template>
  <ReferralLayout current-tab="details" :page-title="props.pageTitle">
    <!-- PC 推荐详情页主体内容 -->
    <ReferralDetailsPageContent
      :is-mobile="props.isMobile"
      :active-tab="props.activeTab"
      :date-label="props.dateLabel"
      :filter-text="props.filterText"
      :deposit-label="props.depositLabel"
      :valid-bets-label="props.validBetsLabel"
      :total-commission-label="props.totalCommissionLabel"
      :claim-history-time-label="props.claimHistoryTimeLabel"
      :claim-history-rewards-label="props.claimHistoryRewardsLabel"
      :top-up-title="props.topUpTitle"
      :detail-text="props.detailText"
      :empty-action-text="props.emptyActionText"
      :empty-text="props.emptyText"
      :empty-alt="props.emptyAlt"
      :avatar-alt="props.avatarAlt"
      :empty-dark-image="props.emptyDarkImage"
      :empty-light-image="props.emptyLightImage"
      :tabs="props.tabs"
      :summary-list="props.summaryList"
      :friends-list="props.friendsList"
      :stats-chart-cards="props.statsChartCards"
      :top-up-summary-list="props.topUpSummaryList"
      :top-up-table-rows="props.topUpTableRows"
      :claim-history-total-commission="props.claimHistoryTotalCommission"
      :claim-history-currency-code="props.claimHistoryCurrencyCode"
      :claim-history-rows="props.claimHistoryRows"
      @change-tab="$emit('change-tab', $event)"
      @open-date-picker="$emit('open-date-picker')"
      @open-filter="$emit('open-filter')"
      @go-friend-detail="$emit('go-friend-detail', $event)"
      @show-poster="$emit('show-poster')"
    />
  </ReferralLayout>
</template>

<script setup lang="ts">
import ReferralLayout from '../ReferralLayout.vue'
import ReferralDetailsPageContent from './components/ReferralDetailsPageContent.vue'
import type {
  ReferralDetailsClaimHistoryRow,
  ReferralDetailsStatsChartCard,
  ReferralDetailsFriendItem,
  ReferralDetailsSummaryItem,
  ReferralDetailsTabItem,
  ReferralDetailsTabValue,
  ReferralDetailsTopUpSummaryItem,
  ReferralDetailsTopUpTableRow
} from './shared'

interface Props {
  pageTitle: string
  isMobile: boolean
  activeTab: ReferralDetailsTabValue
  dateLabel: string
  filterText: string
  depositLabel: string
  validBetsLabel: string
  totalCommissionLabel: string
  claimHistoryTimeLabel: string
  claimHistoryRewardsLabel: string
  topUpTitle: string
  detailText: string
  emptyActionText: string
  emptyText: string
  emptyAlt: string
  avatarAlt: string
  emptyDarkImage: string
  emptyLightImage: string
  tabs: ReferralDetailsTabItem[]
  summaryList: ReferralDetailsSummaryItem[]
  friendsList: ReferralDetailsFriendItem[]
  statsChartCards: ReferralDetailsStatsChartCard[]
  topUpSummaryList: ReferralDetailsTopUpSummaryItem[]
  topUpTableRows: ReferralDetailsTopUpTableRow[]
  claimHistoryTotalCommission: string
  claimHistoryCurrencyCode: string
  claimHistoryRows: ReferralDetailsClaimHistoryRow[]
}

const props = defineProps<Props>()

defineEmits<{
  'change-tab': [value: ReferralDetailsTabValue]
  'open-date-picker': []
  'open-filter': []
  'go-friend-detail': [value: ReferralDetailsFriendItem]
  'show-poster': []
}>()
</script>
