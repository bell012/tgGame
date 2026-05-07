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
      @quick-action="$emit('quick-action', $event)"
      @share-channel="$emit('share-channel', $event)"
      @share-guide="$emit('share-guide')"
      @copy-message="$emit('copy-message')"
      @claim="$emit('claim')"
      @task-details="$emit('task-details')"
    />
  </ReferralLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ReferralLayout from './ReferralLayout.vue'
import ReferralPageContent from './components/ReferralPageContent.vue'
import type {
  ReferralBannerSlide,
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
}

const props = defineProps<Props>()

defineEmits<{
  'quick-action': [value: ReferralQuickActionId]
  'share-channel': [value: ReferralSocialChannel]
  'share-guide': []
  'copy-message': []
  claim: []
  'task-details': []
}>()

const { t } = useI18n()
</script>
