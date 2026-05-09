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
          :banner-loading="bannerLoading"
          :banner-slides="bannerSlides"
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
          @banner-click="handleBannerClick"
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
        :banner-loading="bannerLoading"
        :banner-slides="bannerSlides"
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
        @banner-click="handleBannerClick"
      />
    </div>

    <!-- 推荐文案弹窗 -->
    <ReferralMessagePopup
      v-model="showReferralMessagePopup"
      :mode="isMobile ? 'mobile' : 'pc'"
      :title="t('referral.messagePopup.title')"
      :description="t('referral.messagePopup.description')"
      :copy-text="t('personalCenter.editProfile.save')"
      :presets="referralMessagePresets"
      :initial-message="activeReferralMessage"
      @copy="handleConfirmReferralMessageCopy"
    />

    <!-- 邀请海报弹窗 -->
    <InvitePosterPopup
      v-model="showInvitePosterPopup"
      :images="posterImages"
      :invite-code="displayLinkCode"
      :share-link="resolveChannelReferralLink()"
      :save-text="t('referral.invitePoster.saveImage')"
      :copy-link-text="t('referral.invitePoster.copyLink')"
      :invite-text="t('referral.invitePoster.inviteNow')"
      close-text="close"
      :image-alt="t('referral.invitePoster.posterAlt')"
      @save="handleSavePosterImage"
      @copy-link="handleCopyPosterLink"
      @invite="handleInvitePoster"
    />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { useAuthModalStore } from '@/stores/authModal'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { ApiBusinessError, ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { copyTextWithFallback } from '@/utils/clipboard'
import { executeConfiguredJump } from '@/utils/contentJump'
import { formatBalance } from '@/utils/locale'
import { getLanguageCode } from '@/utils/request'
import { navigateTo } from '@/utils/router'
import { formatLinkCode, globalShowToast } from '@/utils/toast'
import { showToast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReferralMessagePopup from './components/ReferralMessagePopup.vue'
import ReferralPageContent from './components/ReferralPageContent.vue'
import InvitePosterPopup from './details/components/InvitePosterPopup.vue'
import PcLayout from './pc-layout.vue'
import {
  buildReferralBannerRequestKey,
  buildReferralBannerSlidesFromApi,
  buildReferralPosterImagesFromApi,
  buildReferralShareMessage,
  buildReferralSocialChannelsFromApi,
  createReferralMarqueeMessages,
  createReferralMessagePresets,
  createReferralQuickActions,
  getCachedReferralBannerPayload,
  getDefaultReferralLink,
  getReferralCommissionCoinImage,
  resolveReferralBannerPayload,
  type ReferralBannerSlide,
  type ReferralQuickActionId,
  type ReferralSocialChannel
} from './shared'

const { t, locale } = useI18n()
const authModalStore = useAuthModalStore()
const gameStore = useGameStore()
const userStore = useUserStore()
const isMobile = useIsMobile()
const isReady = ref(false)
const estimatedCommissionAmount = ref('0.00')
const inviteRewardCount = '1'
const inviteRewardAmount = '36'
const referralLink = getDefaultReferralLink()
const socialChannelsLoading = ref(true)
const apiSocialChannels = ref<ReferralSocialChannel[]>([])
const bannerLoading = ref(true)
const bannerSlides = ref<ReferralBannerSlide[]>([])
const posterImages = ref<string[]>([])
const showReferralMessagePopup = ref(false)
const showInvitePosterPopup = ref(false)
const claimingCommission = ref(false)
const currentShareChannel = ref<ReferralSocialChannel | null>(null)
const customReferralMessage = ref('')
let referralBannerRequestToken = 0

const quickActions = computed(() => createReferralQuickActions(t))
const referralMessagePresets = computed(() => createReferralMessagePresets(t))
const defaultReferralMessage = computed(() => referralMessagePresets.value[0] || '')
const activeReferralMessage = computed(
  () => customReferralMessage.value || defaultReferralMessage.value
)
const marqueeMessages = computed(() => createReferralMarqueeMessages(t))
const socialChannels = computed(() => apiSocialChannels.value)
const commissionCoinImage = getReferralCommissionCoinImage()
const currentAgentChannelId = computed(() => (isMobile.value ? '4' : '3'))
const displayLinkCode = computed(() => formatLinkCode(userStore.userInfo?.rowId) || '-')

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
    void fetchEstimatedCommission()
  },
  {
    immediate: true
  }
)

watch(
  () => [currentAgentChannelId.value, locale.value] as const,
  () => {
    void fetchReferralBanner()
  },
  {
    immediate: true
  }
)

/**
 * 获取预估佣金卡片数据。
 */
async function fetchEstimatedCommission() {
  estimatedCommissionAmount.value = '0.00'

  try {
    const response = ensureApiBusinessSuccess(
      await Api.agent.queryEstimatedCommission({
        channelId: currentAgentChannelId.value
      })
    )

    estimatedCommissionAmount.value = formatBalance(Number(response.result ?? 0), 2)
  } catch (error) {
    console.error('[referral] fetch estimated commission failed:', error)
  }
}

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
    navigateTo('/referral/tasks')
    return
  }

  if (actionId === 'details') {
    navigateTo('/referral/details')
    return
  }

  if (actionId === 'rules') {
    navigateTo('/referral/rules')
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
 * 处理打开推荐文案弹窗。
 */
const handleCopyReferralMessage = () => {
  showReferralMessagePopup.value = true
}

/**
 * 处理确认复制推荐文案。
 */
const handleConfirmReferralMessageCopy = async (message: string) => {
  customReferralMessage.value = String(message ?? '').trim()
  const copied = await copyTextWithFallback(
    buildReferralShareMessage(activeReferralMessage.value, referralLink)
  )

  showToast({
    message: copied ? t('referral.h5.copyMessageSuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })

  if (copied) {
    showReferralMessagePopup.value = false
  }
}

/**
 * 获取当前分享渠道的邀请链接。
 */
const resolveChannelReferralLink = () => {
  const shareDomainUrl = String(currentShareChannel.value?.shareDomainUrl ?? '').trim()

  if (!shareDomainUrl) {
    return ''
  }

  return `${shareDomainUrl.replace(/\/+$/, '')}/?id=${displayLinkCode.value}`
}

/**
 * 获取当前分享渠道的完整分享文案。
 */
const resolveChannelReferralContent = () =>
  buildReferralShareMessage(activeReferralMessage.value, resolveChannelReferralLink())

/**
 * 处理佣金领取按钮点击。
 */
const handleClaimClick = async () => {
  if (claimingCommission.value) {
    return
  }

  if ((Number(estimatedCommissionAmount.value) || 0) <= 0) {
    showToast({
      message: t('referral.noClaimableCommission'),
      type: 'fail'
    })
    return
  }

  claimingCommission.value = true

  try {
    ensureApiBusinessSuccess(
      await Api.agent.claimCommission({
        channelId: currentAgentChannelId.value
      })
    )

    showToast({
      message: t('personalCenter.rebate.toast.claimSuccess'),
      type: 'success'
    })
    await fetchEstimatedCommission()
  } catch (error) {
    console.error('[referral] claim commission failed:', error)

    if (error instanceof ApiBusinessError) {
      return
    }

    showToast({
      message: t('personalCenter.rebate.toast.claimFailed'),
      type: 'fail'
    })
  } finally {
    claimingCommission.value = false
  }
}

/**
 * 处理任务详情按钮点击。
 */
const handleTaskDetailsClick = () => {
  navigateTo('/referral/tasks')
}

/**
 * 处理推荐页横幅点击跳转。
 */
const handleBannerClick = async (slide: ReferralBannerSlide) => {
  if (
    !(await executeConfiguredJump(slide, {
      openLoginModal: () => authModalStore.openLoginModal(),
      loadGameData: () => gameStore.ensureGameData()
    }))
  ) {
    console.warn('referral banner jump skipped', slide)
  }
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
    const response = ensureApiBusinessSuccess(
      await Api.agent.queryShareChannels(
        {
          openStatus: 1
        },
        {
          channelId: currentAgentChannelId.value
        }
      )
    )

    apiSocialChannels.value = buildReferralSocialChannelsFromApi(response.result)
  } catch (error) {
    console.error(error)
  } finally {
    socialChannelsLoading.value = false
  }
}

/**
 * 处理推荐页活动横幅数据。
 */
async function fetchReferralBanner() {
  const requestToken = ++referralBannerRequestToken
  const languageCode = getLanguageCode()
  const requestKey = buildReferralBannerRequestKey(currentAgentChannelId.value, languageCode)
  const cachedPayload = getCachedReferralBannerPayload(requestKey)

  if (cachedPayload) {
    bannerLoading.value = false
    bannerSlides.value = cachedPayload.bannerSlides
    posterImages.value = cachedPayload.posterImages
    return
  }

  bannerLoading.value = true
  bannerSlides.value = []
  posterImages.value = []

  try {
    const payload = await resolveReferralBannerPayload(requestKey, async () => {
      const response = await Api.home.getQuerySlideshow({
        languageCode,
        channelId: currentAgentChannelId.value,
        page: {
          current: 1,
          size: 100
        }
      })

      const records = Array.isArray(response?.result?.records) ? response.result.records : []

      return {
        bannerSlides: buildReferralBannerSlidesFromApi(records),
        posterImages: buildReferralPosterImagesFromApi(records)
      }
    })

    if (requestToken !== referralBannerRequestToken) {
      return
    }

    bannerSlides.value = payload.bannerSlides
    posterImages.value = payload.posterImages
  } catch (error) {
    if (requestToken !== referralBannerRequestToken) {
      return
    }

    console.error('[referral] fetch banner failed:', error)
    bannerSlides.value = []
    posterImages.value = []
  } finally {
    if (requestToken === referralBannerRequestToken) {
      bannerLoading.value = false
    }
  }
}

/**
 * 处理社交渠道分享点击。
 */
const handleShareChannel = (channel: ReferralSocialChannel) => {
  if (!resolveShareTargetUrl(channel)) {
    showToast({
      message: t('referral.comingSoon'),
      type: 'fail'
    })
    return
  }

  if (!posterImages.value.length) {
    showToast({
      message: t('referral.comingSoon'),
      type: 'fail'
    })
    return
  }

  currentShareChannel.value = channel
  showInvitePosterPopup.value = true
}

/**
 * 处理保存海报图片。
 */
const handleSavePosterImage = () => {
  globalShowToast({
    message: t('referral.invitePoster.saveHint'),
    type: 'success'
  })
}

/**
 * 处理复制海报邀请链接。
 */
const handleCopyPosterLink = async () => {
  const copied = await copyTextWithFallback(resolveChannelReferralContent())

  globalShowToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}

/**
 * 处理调用默认分享。
 */
const handleInvitePoster = async () => {
  const shareContent = resolveChannelReferralContent()
  const shareLink = resolveChannelReferralLink()

  if (!shareContent || !shareLink) {
    globalShowToast({
      message: t('referral.copyFailed'),
      type: 'fail'
    })
    return
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: typeof document !== 'undefined' ? document.title : t('referral.title'),
        text: shareContent,
        url: shareLink
      })
      return
    } catch (error) {
      console.error('[referral] navigator share failed:', error)
    }
  }

  const copied = await copyTextWithFallback(shareContent)

  globalShowToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}
</script>
