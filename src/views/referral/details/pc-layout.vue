<template>
  <ReferralLayout current-tab="details" :page-title="props.pageTitle">
    <!-- PC 推荐详情页主体内容 -->
    <ReferralDetailsPageContent
      :active-tab="props.activeTab"
      :date-label="props.dateLabel"
      :filter-text="props.filterText"
      :deposit-label="props.depositLabel"
      :valid-bets-label="props.validBetsLabel"
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
  ReferralDetailsFriendItem,
  ReferralDetailsSummaryItem,
  ReferralDetailsTabItem,
  ReferralDetailsTabValue
} from './shared'

interface Props {
  pageTitle: string
  activeTab: ReferralDetailsTabValue
  dateLabel: string
  filterText: string
  depositLabel: string
  validBetsLabel: string
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
