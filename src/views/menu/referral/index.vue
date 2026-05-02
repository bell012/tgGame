<template>
  <div>
    <!-- H5 推荐页容器 -->
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <!-- H5 推荐页头部 -->
      <H5Header
        :title="t('referral.title')"
        :show-sort="true"
        :right-icon="CustomerServiceIcon"
        @sort="handleCustomerServiceClick"
      />

      <!-- H5 推荐页滚动区域 -->
      <div class="flex-1 overflow-y-auto">
        <!-- H5 推荐页内容 -->
        <ReferralPageContent
          mode="mobile"
          :quick-actions="quickActions"
          :marquee-messages="marqueeMessages"
          :social-channels="socialChannels"
          :social-channels-loading="socialChannelsLoading"
          :banner-image="bannerImage"
          :commission-coin-image="commissionCoinImage"
          :estimated-commission-label="t('referral.estimatedCommission')"
          :estimated-commission-amount="estimatedCommissionAmount"
          :claim-text="t('referral.claim')"
          :how-to-share-text="t('referral.h5.howToShare')"
          :referral-message-text="t('referral.h5.referralMessage')"
          :invite-reward-prefix="t('referral.h5.inviteRewardPrefix')"
          :invite-reward-count="inviteRewardCount"
          :invite-reward-suffix="t('referral.h5.inviteRewardSuffix')"
          :invite-reward-amount="inviteRewardAmount"
          :task-details-text="t('referral.h5.taskDetails')"
          @quick-action="handleQuickActionClick"
          @share-channel="handleShareChannel"
          @share-guide="handleShareGuideClick"
          @copy-message="handleCopyReferralMessage"
          @claim="handleClaimClick"
          @task-details="handleTaskDetailsClick"
        />
      </div>
    </div>

    <!-- PC 推荐页容器 -->
    <div v-else-if="isReady" class="min-h-screen bg-bg-1">
      <!-- PC 推荐页布局 -->
      <PcLayout
        :quick-actions="quickActions"
        :marquee-messages="marqueeMessages"
        :social-channels="socialChannels"
        :social-channels-loading="socialChannelsLoading"
        :banner-image="bannerImage"
        :commission-coin-image="commissionCoinImage"
        :estimated-commission-label="t('referral.estimatedCommission')"
        :estimated-commission-amount="estimatedCommissionAmount"
        :claim-text="t('referral.claim')"
        :how-to-share-text="t('referral.h5.howToShare')"
        :referral-message-text="t('referral.h5.referralMessage')"
        :invite-reward-prefix="t('referral.h5.inviteRewardPrefix')"
        :invite-reward-count="inviteRewardCount"
        :invite-reward-suffix="t('referral.h5.inviteRewardSuffix')"
        :invite-reward-amount="inviteRewardAmount"
        :task-details-text="t('referral.h5.taskDetails')"
        @customer-service="handleCustomerServiceClick"
        @quick-action="handleQuickActionClick"
        @share-channel="handleShareChannel"
        @share-guide="handleShareGuideClick"
        @copy-message="handleCopyReferralMessage"
        @claim="handleClaimClick"
        @task-details="handleTaskDetailsClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Api from '@/api'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { copyTextWithFallback } from '@/utils/clipboard'
import { navigateTo } from '@/utils/router'
import { useIsMobile } from '@/composables/useMediaQuery'
import PcLayout from './pc-layout.vue'
import ReferralPageContent from './components/ReferralPageContent.vue'
import {
  buildReferralShareMessage,
  buildReferralSocialChannelsFromApi,
  createReferralMarqueeMessages,
  createReferralQuickActions,
  getDefaultReferralLink,
  getReferralBannerImage,
  getReferralCommissionCoinImage,
  type ReferralQuickActionId,
  type ReferralSocialChannel
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)
const estimatedCommissionAmount = '9999.99'
const inviteRewardCount = '1'
const inviteRewardAmount = '36'
const referralLink = getDefaultReferralLink()
const socialChannelsLoading = ref(true)
const apiSocialChannels = ref<ReferralSocialChannel[]>([])

const quickActions = computed(() => createReferralQuickActions(t))
const marqueeMessages = computed(() => createReferralMarqueeMessages(t))
const socialChannels = computed(() => apiSocialChannels.value)
const bannerImage = getReferralBannerImage()
const commissionCoinImage = getReferralCommissionCoinImage()
const currentAgentChannelId = computed(() => (isMobile.value ? '4' : '3'))

/**
 * 处理页面初始化完成状态，避免首屏端态抖动。
 */
onMounted(() => {
  isReady.value = true
})

watch(
  () => currentAgentChannelId.value,
  () => {
    void fetchSocialChannels()
  },
  {
    immediate: true
  }
)

/**
 * 处理客服按钮点击。
 */
const handleCustomerServiceClick = () => {
  showToast({
    message: t('sidebar_menu.customer_service'),
    type: 'success'
  })
}

/**
 * 处理顶部快捷入口点击。
 */
const handleQuickActionClick = (actionId: ReferralQuickActionId) => {
  if (actionId === 'tasks') {
    navigateTo('/menu/referral/tasks')
    return
  }

  if (actionId === 'details') {
    navigateTo('/menu/referral/details')
    return
  }

  if (actionId === 'rules') {
    navigateTo('/menu/referral/rules')
    return
  }

  const actionMessageMap: Record<ReferralQuickActionId, string> = {
    tasks: t('referral.h5.quickActions.tasks'),
    details: t('referral.h5.quickActions.details'),
    rules: t('referral.h5.quickActions.rules'),
    guide: t('referral.h5.quickActions.guide')
  }

  showToast({
    message: `${actionMessageMap[actionId]} ${t('referral.comingSoon')}`,
    type: 'success'
  })
}

/**
 * 处理分享说明按钮点击。
 */
const handleShareGuideClick = () => {
  showToast({
    message: t('referral.h5.shareGuideHint'),
    type: 'success'
  })
}

/**
 * 处理推荐文案复制。
 */
const handleCopyReferralMessage = async () => {
  const copied = await copyTextWithFallback(buildReferralShareMessage(t, referralLink))

  showToast({
    message: copied ? t('referral.h5.copyMessageSuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}

/**
 * 处理佣金领取按钮点击。
 */
const handleClaimClick = () => {
  showToast({
    message: t('referral.noClaimableCommission'),
    type: 'fail'
  })
}

/**
 * 处理任务详情按钮点击。
 */
const handleTaskDetailsClick = () => {
  navigateTo('/menu/referral/tasks')
}

/**
 * 获取当前分享渠道使用的目标链接。
 */
const resolveShareTargetUrl = (channel: ReferralSocialChannel) =>
  String(channel.shareDomainUrl ?? '').trim()

/**
 * 处理获取社交分享渠道配置。
 */
async function fetchSocialChannels() {
  socialChannelsLoading.value = true
  apiSocialChannels.value = []

  try {
    const response = await Api.agent.queryShareChannels(
      {
        openStatus: 1
      },
      {
        channelId: currentAgentChannelId.value
      }
    )

    if (response?.code !== 'C2') {
      return
    }

    apiSocialChannels.value = buildReferralSocialChannelsFromApi(response.result)
  } catch (error) {
    console.error(error)
  } finally {
    socialChannelsLoading.value = false
  }
}

/**
 * 处理社交渠道分享点击。
 */
const handleShareChannel = (channel: ReferralSocialChannel) => {
  const shareUrl = resolveShareTargetUrl(channel)

  if (!shareUrl) {
    showToast({
      message: t('referral.comingSoon'),
      type: 'fail'
    })
    return
  }

  window.open(shareUrl, '_blank', 'noopener,noreferrer')
}
</script>
