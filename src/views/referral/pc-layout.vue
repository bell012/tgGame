<template>
  <ReferralLayout current-tab="referral" :page-title="t('referral.title')">
    <!-- PC 推荐页内容 -->
    <ReferralPageContent
      mode="pc"
      :quick-actions="props.quickActions"
      :marquee-messages="props.marqueeMessages"
      :social-channels="props.socialChannels"
      :social-channels-loading="props.socialChannelsLoading"
      :banner-loading="props.bannerLoading"
      :banner-slides="props.bannerSlides"
      :commission-coin-image="props.commissionCoinImage"
      :estimated-commission-label="props.estimatedCommissionLabel"
      :estimated-commission-amount="props.estimatedCommissionAmount"
      :claim-text="props.claimText"
      :how-to-share-text="props.howToShareText"
      :referral-message-text="props.referralMessageText"
      :invite-reward-prefix="props.inviteRewardPrefix"
      :invite-reward-count="props.inviteRewardCount"
      :invite-reward-suffix="props.inviteRewardSuffix"
      :invite-reward-amount="props.inviteRewardAmount"
      :task-details-text="props.taskDetailsText"
      :commission-boost-loading="props.commissionBoostLoading"
      :show-commission-boost="props.showCommissionBoost"
      :active-commission-boost-period-tab="props.activeCommissionBoostPeriodTab"
      :commission-boost-estimated-commission="props.commissionBoostEstimatedCommission"
      :commission-boost-friends-delta="props.commissionBoostFriendsDelta"
      :commission-boost-current-level-rate="props.commissionBoostCurrentLevelRate"
      :commission-boost-active-friends="props.commissionBoostActiveFriends"
      :commission-boost-progress-percent="props.commissionBoostProgressPercent"
      :commission-boost-levels="props.commissionBoostLevels"
      :current-period-text="props.currentPeriodText"
      :previous-period-text="props.previousPeriodText"
      :friends-text="props.friendsText"
      :current-level-text="props.currentLevelText"
      :active-friends-text="props.activeFriendsText"
      :data-updates-every-hour-text="props.dataUpdatesEveryHourText"
      :rules-text="props.rulesText"
      @quick-action="$emit('quick-action', $event)"
      @share-channel="$emit('share-channel', $event)"
      @share-guide="$emit('share-guide')"
      @copy-message="$emit('copy-message')"
      @claim="$emit('claim')"
      @task-details="$emit('task-details')"
      @banner-click="$emit('banner-click', $event)"
      @change-commission-boost-period-tab="$emit('change-commission-boost-period-tab', $event)"
      @open-rules="$emit('open-rules')"
    />
  </ReferralLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ReferralLayout from './ReferralLayout.vue'
import ReferralPageContent from './components/ReferralPageContent.vue'
import type {
  ReferralBannerSlide,
  ReferralCommissionBoostLevelView,
  ReferralCommissionBoostPeriodTabKey,
  ReferralQuickAction,
  ReferralQuickActionId,
  ReferralSocialChannel
} from './shared'

interface Props {
  quickActions: ReferralQuickAction[]
  marqueeMessages: string[]
  socialChannels: ReferralSocialChannel[]
  socialChannelsLoading: boolean
  bannerLoading: boolean
  bannerSlides: ReferralBannerSlide[]
  commissionCoinImage: string
  estimatedCommissionLabel: string
  estimatedCommissionAmount: string
  claimText: string
  howToShareText: string
  referralMessageText: string
  inviteRewardPrefix: string
  inviteRewardCount: string
  inviteRewardSuffix: string
  inviteRewardAmount: string
  taskDetailsText: string
  commissionBoostLoading: boolean
  showCommissionBoost: boolean
  activeCommissionBoostPeriodTab: ReferralCommissionBoostPeriodTabKey
  commissionBoostEstimatedCommission: string
  commissionBoostFriendsDelta: string
  commissionBoostCurrentLevelRate: string
  commissionBoostActiveFriends: string
  commissionBoostProgressPercent: number
  commissionBoostLevels: ReferralCommissionBoostLevelView[]
  currentPeriodText: string
  previousPeriodText: string
  friendsText: string
  currentLevelText: string
  activeFriendsText: string
  dataUpdatesEveryHourText: string
  rulesText: string
}

const props = defineProps<Props>()

defineEmits<{
  'quick-action': [value: ReferralQuickActionId]
  'share-channel': [value: ReferralSocialChannel]
  'share-guide': []
  'copy-message': []
  claim: []
  'task-details': []
  'banner-click': [value: ReferralBannerSlide]
  'change-commission-boost-period-tab': [value: ReferralCommissionBoostPeriodTabKey]
  'open-rules': []
}>()

const { t } = useI18n()
</script>
