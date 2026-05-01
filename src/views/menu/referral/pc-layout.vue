<template>
  <!-- PC 推荐页容器 -->
  <section
    class="mx-auto w-full max-w-[1120px] px-6 py-6"
    style="font-family: Inter, avertastd, sans-serif"
  >
    <!-- PC 推荐页头部 -->
    <div class="mb-5 flex items-center justify-between rounded-[16px] bg-bg-2 px-5 py-4">
      <!-- PC 推荐页标题 -->
      <h1 class="text-[24px] font-[700] leading-[29px] text-text-1">{{ t('referral.title') }}</h1>

      <!-- PC 客服按钮 -->
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-[12px] bg-opacity-5"
        @click="$emit('customer-service')"
      >
        <CustomerServiceIcon class="h-5 w-5 text-text-1" />
      </button>
    </div>

    <!-- PC 推荐页内容 -->
    <ReferralPageContent
      mode="pc"
      :quick-actions="props.quickActions"
      :marquee-messages="props.marqueeMessages"
      :social-channels="props.socialChannels"
      :banner-image="props.bannerImage"
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
  </section>
</template>

<script setup lang="ts">
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { useI18n } from 'vue-i18n'
import ReferralPageContent from './components/ReferralPageContent.vue'
import type {
  ReferralQuickAction,
  ReferralQuickActionId,
  ReferralSocialChannel,
  ReferralSocialChannelId
} from './shared'

interface Props {
  quickActions: ReferralQuickAction[]
  marqueeMessages: string[]
  socialChannels: ReferralSocialChannel[]
  bannerImage: string
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
  'customer-service': []
  'quick-action': [value: ReferralQuickActionId]
  'share-channel': [value: ReferralSocialChannelId]
  'share-guide': []
  'copy-message': []
  claim: []
  'task-details': []
}>()

const { t } = useI18n()
</script>
