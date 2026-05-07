<template>
  <ReferralLayout current-tab="details" :page-title="props.pageTitle">
    <!-- PC 推荐详情页主体内容 -->
    <ReferralDetailsPageContent
      :is-mobile="props.isMobile"
      :active-tab="props.activeTab"
      :date-label="props.dateLabel"
      :active-date-value="props.activeDateValue"
      :date-options="props.dateOptions"
      :filter-text="props.filterText"
      :deposit-label="props.depositLabel"
      :valid-bets-label="props.validBetsLabel"
      :total-commission-label="props.totalCommissionLabel"
      :reward-history-time-label="props.rewardHistoryTimeLabel"
      :reward-history-commission-label="props.rewardHistoryCommissionLabel"
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
      :reward-history-total-commission="props.rewardHistoryTotalCommission"
      :reward-history-currency-code="props.rewardHistoryCurrencyCode"
      :reward-history-rows="props.rewardHistoryRows"
      :claim-history-total-commission="props.claimHistoryTotalCommission"
      :claim-history-currency-code="props.claimHistoryCurrencyCode"
      :claim-history-rows="props.claimHistoryRows"
      @change-tab="$emit('change-tab', $event)"
      @change-date="$emit('change-date', $event)"
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
  ReferralDetailsDateFilterValue,
  ReferralDetailsDateOption,
  ReferralDetailsRewardHistoryRow,
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
  activeDateValue: ReferralDetailsDateFilterValue
  dateOptions: ReferralDetailsDateOption[]
  filterText: string
  depositLabel: string
  validBetsLabel: string
  totalCommissionLabel: string
  rewardHistoryTimeLabel: string
  rewardHistoryCommissionLabel: string
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
  rewardHistoryTotalCommission: string
  rewardHistoryCurrencyCode: string
  rewardHistoryRows: ReferralDetailsRewardHistoryRow[]
  claimHistoryTotalCommission: string
  claimHistoryCurrencyCode: string
  claimHistoryRows: ReferralDetailsClaimHistoryRow[]
}

const props = defineProps<Props>()

defineEmits<{
  'change-tab': [value: ReferralDetailsTabValue]
  'change-date': [value: ReferralDetailsDateFilterValue]
  'open-date-picker': []
  'open-filter': []
  'go-friend-detail': [value: ReferralDetailsFriendItem]
  'show-poster': []
}>()
</script>
