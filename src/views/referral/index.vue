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
          :commission-boost-loading="commissionBoostLoading"
          :show-commission-boost="shouldShowCommissionBoost"
          :active-commission-boost-period-tab="activeCommissionBoostPeriodTab"
          :commission-boost-estimated-commission="commissionBoostEstimatedCommissionAmount"
          :commission-boost-friends-delta="commissionBoostViewData.friendsDeltaText"
          :commission-boost-current-level-rate="commissionBoostViewData.currentLevelRateText"
          :commission-boost-active-friends="commissionBoostViewData.activeFriendsText"
          :commission-boost-progress-percent="commissionBoostViewData.progressPercent"
          :commission-boost-levels="commissionBoostViewData.levels"
          :current-period-text="commissionBoostPeriodMeta.currentLabel"
          :previous-period-text="commissionBoostPeriodMeta.previousLabel"
          :friends-text="t('referral.commissionBoost.friends')"
          :current-level-text="t('referral.commissionBoost.currentLevel')"
          :active-friends-text="t('referral.commissionBoost.activeFriends')"
          :data-updates-every-hour-text="t('referral.commissionBoost.dataUpdatesEveryHour')"
          :rules-text="t('referral.commissionBoost.rules')"
          @quick-action="handleQuickActionClick"
          @share-channel="handleShareChannel"
          @share-guide="handleShareGuideClick"
          @copy-message="handleCopyReferralMessage"
          @claim="handleClaimClick"
          @task-details="handleTaskDetailsClick"
          @banner-click="handleBannerClick"
          @change-commission-boost-period-tab="handleChangeCommissionBoostPeriodTab"
          @open-rules="handleOpenRules"
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
        :commission-boost-loading="commissionBoostLoading"
        :show-commission-boost="shouldShowCommissionBoost"
        :active-commission-boost-period-tab="activeCommissionBoostPeriodTab"
        :commission-boost-estimated-commission="commissionBoostEstimatedCommissionAmount"
        :commission-boost-friends-delta="commissionBoostViewData.friendsDeltaText"
        :commission-boost-current-level-rate="commissionBoostViewData.currentLevelRateText"
        :commission-boost-active-friends="commissionBoostViewData.activeFriendsText"
        :commission-boost-progress-percent="commissionBoostViewData.progressPercent"
        :commission-boost-levels="commissionBoostViewData.levels"
        :current-period-text="commissionBoostPeriodMeta.currentLabel"
        :previous-period-text="commissionBoostPeriodMeta.previousLabel"
        :friends-text="t('referral.commissionBoost.friends')"
        :current-level-text="t('referral.commissionBoost.currentLevel')"
        :active-friends-text="t('referral.commissionBoost.activeFriends')"
        :data-updates-every-hour-text="t('referral.commissionBoost.dataUpdatesEveryHour')"
        :rules-text="t('referral.commissionBoost.rules')"
        @quick-action="handleQuickActionClick"
        @share-channel="handleShareChannel"
        @share-guide="handleShareGuideClick"
        @copy-message="handleCopyReferralMessage"
        @claim="handleClaimClick"
        @task-details="handleTaskDetailsClick"
        @banner-click="handleBannerClick"
        @change-commission-boost-period-tab="handleChangeCommissionBoostPeriodTab"
        @open-rules="handleOpenRules"
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

    <!-- 佣金领取确认弹窗 -->
    <ClaimSuccessPopup
      v-model:visible="showClaimConfirmPopup"
      :amount="estimatedCommissionAmount"
      @confirm="handleConfirmClaimClick"
    />

    <!-- PC Guide 视频弹窗 -->
    <ReferralGuideVideoPopup v-model="showGuideVideoPopup" />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  QueryReferralSettlementRuleResult,
  QueryReferralShareConfigResult,
  QueryReferralTaskProgressResult,
  QueryTaskRewardConfigResult
} from '@/api/interface/agent'
import type { QueryNoticeMsgItem } from '@/api/interface/home.interface'
import ClaimSuccessPopup from '@/components/common/ClaimSuccessPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { useAuthModalStore } from '@/stores/authModal'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { ApiBusinessError, ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { copyTextWithFallback } from '@/utils/clipboard'
import { executeConfiguredJump } from '@/utils/contentJump'
import { formatBalance, getLanguageCode } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { formatLinkCode, globalShowToast } from '@/utils/toast'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReferralGuideVideoPopup from './components/ReferralGuideVideoPopup.vue'
import ReferralMessagePopup from './components/ReferralMessagePopup.vue'
import ReferralPageContent from './components/ReferralPageContent.vue'
import InvitePosterPopup from './details/components/InvitePosterPopup.vue'
import PcLayout from './pc-layout.vue'
import {
  buildReferralBannerRequestKey,
  buildReferralShareMessage,
  buildReferralSocialChannelsFromApi,
  buildReferralTaskPeriodRanges,
  createReferralCommissionBoostPeriodMeta,
  createReferralCommissionBoostViewData,
  createReferralMarqueeMessages,
  createReferralMessagePresets,
  createReferralQuickActions,
  fetchReferralBannerPayload,
  getCachedReferralBannerPayload,
  getDefaultReferralLink,
  getReferralCommissionCoinImage,
  getReferralInviteTaskReward,
  hasReferralTaskProgressData,
  type ReferralBannerSlide,
  type ReferralCommissionBoostPeriodTabKey,
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
const referralLink = getDefaultReferralLink()
const socialChannelsLoading = ref(true)
const apiSocialChannels = ref<ReferralSocialChannel[]>([])
const bannerLoading = ref(true)
const bannerSlides = ref<ReferralBannerSlide[]>([])
const posterImages = ref<string[]>([])
const showReferralMessagePopup = ref(false)
const showInvitePosterPopup = ref(false)
const showClaimConfirmPopup = ref(false)
const showGuideVideoPopup = ref(false)
const claimingCommission = ref(false)
const currentShareChannel = ref<ReferralSocialChannel | null>(null)
const customReferralMessage = ref('')
const taskRewardConfigResult = ref<QueryTaskRewardConfigResult | null>(null)
const referralSettlementRule = ref<QueryReferralSettlementRuleResult | null>(null)
const referralShareConfig = ref<QueryReferralShareConfigResult | null>(null)
const currentPeriodTaskProgress = ref<QueryReferralTaskProgressResult | null>(null)
const previousPeriodTaskProgress = ref<QueryReferralTaskProgressResult | null>(null)
const activeCommissionBoostPeriodTab = ref<ReferralCommissionBoostPeriodTabKey>('current')
const commissionBoostEstimatedCommissionAmount = ref('0.00')
const commissionBoostLoading = ref(true)
const marqueeNoticeRecords = ref<QueryNoticeMsgItem[]>([])
let referralBannerRequestToken = 0

const quickActions = computed(() => createReferralQuickActions(t))
const referralMessagePresets = computed(() => createReferralMessagePresets(t))
const defaultReferralMessage = computed(() => referralMessagePresets.value[0] || '')
const activeReferralMessage = computed(
  () => customReferralMessage.value || defaultReferralMessage.value
)
const marqueeMessages = computed(() => createReferralMarqueeMessages(marqueeNoticeRecords.value))
const socialChannels = computed(() => apiSocialChannels.value)
const commissionCoinImage = getReferralCommissionCoinImage()
const currentAgentChannelId = computed(() => (isMobile.value ? '4' : '3'))
const displayLinkCode = computed(() => formatLinkCode(userStore.userInfo?.rowId) || '-')
const inviteTaskReward = computed(() => getReferralInviteTaskReward(taskRewardConfigResult.value))
const inviteRewardCount = computed(() => inviteTaskReward.value.count)
const inviteRewardAmount = computed(() => inviteTaskReward.value.amount)
const commissionBoostPeriodMeta = computed(() =>
  createReferralCommissionBoostPeriodMeta(t, referralSettlementRule.value)
)
const shouldShowCommissionBoost = computed(
  () =>
    hasReferralTaskProgressData(currentPeriodTaskProgress.value) ||
    hasReferralTaskProgressData(previousPeriodTaskProgress.value)
)
const activeTaskProgress = computed(() =>
  activeCommissionBoostPeriodTab.value === 'current'
    ? currentPeriodTaskProgress.value
    : previousPeriodTaskProgress.value
)
const commissionBoostViewData = computed(() =>
  createReferralCommissionBoostViewData(
    t,
    taskRewardConfigResult.value?.config?.commissionList,
    activeTaskProgress.value
  )
)

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
    void fetchCommissionBoostEstimatedCommission()
    void fetchReferralTaskModuleData()
    void fetchReferralShareConfig()
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

watch(
  () => locale.value,
  () => {
    void fetchReferralMarqueeMessages()
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
 * 获取佣金加码统计区域的预估佣金。
 */
async function fetchCommissionBoostEstimatedCommission() {
  commissionBoostEstimatedCommissionAmount.value = '0.00'

  try {
    const response = ensureApiBusinessSuccess(
      await Api.agent.queryReferralCommissionBoostAmount({
        channelId: currentAgentChannelId.value
      })
    )

    commissionBoostEstimatedCommissionAmount.value = formatBalance(Number(response.result ?? 0), 2)
  } catch (error) {
    console.error('[referral] fetch commission boost estimated commission failed:', error)
  }
}

/**
 * 处理客服按钮点击。
 */
const handleCustomerServiceClick = () => {
  globalShowToast({
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

  if (actionId === 'guide') {
    if (isMobile.value) {
      navigateTo('/referral/guide')
      return
    }

    showGuideVideoPopup.value = true
    return
  }

  const actionMessageMap: Record<ReferralQuickActionId, string> = {
    tasks: t('referral.h5.quickActions.tasks'),
    details: t('referral.h5.quickActions.details'),
    rules: t('referral.h5.quickActions.rules'),
    guide: t('referral.h5.quickActions.guide')
  }

  globalShowToast({
    message: `${actionMessageMap[actionId]} ${t('referral.comingSoon')}`,
    type: 'success'
  })
}

/**
 * 处理分享说明按钮点击。
 */
const handleShareGuideClick = () => {
  if (isMobile.value) {
    navigateTo('/referral/guide')
    return
  }

  showGuideVideoPopup.value = true
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
  const copied = await copyTextWithFallback(resolveReferralShareContent())

  globalShowToast({
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
  const initUrl = String(referralShareConfig.value?.initUrl ?? '').trim() || referralLink

  if (!initUrl) {
    return ''
  }

  return `${initUrl.replace(/\/+$/, '')}/?id=${displayLinkCode.value}`
}

/**
 * 获取分享配置图片完整地址。
 */
// const resolveReferralShareImageUrl = () => toReferralAssetImageUrl(referralShareConfig.value?.pic)

/**
 * 获取完整分享文案。
 */
const resolveReferralShareContent = () =>
  buildReferralShareMessage(
    activeReferralMessage.value,
    resolveChannelReferralLink(),
    String(referralShareConfig.value?.shareName ?? '').trim(),
    String(referralShareConfig.value?.shareDesc ?? '').trim()
    // TODO：图片链接待定
    // resolveReferralShareImageUrl()
  )

/**
 * 打开当前选择的社交分享渠道。
 */
const openCurrentShareChannelTarget = () => {
  const shareTargetUrl = resolveShareTargetUrl(currentShareChannel.value)

  if (!shareTargetUrl || typeof window === 'undefined') {
    return false
  }

  window.open(shareTargetUrl, '_blank', 'noopener,noreferrer')
  return true
}

/**
 * 处理佣金领取按钮点击。
 */
const handleClaimClick = () => {
  if (claimingCommission.value) {
    return
  }

  if ((Number(estimatedCommissionAmount.value) || 0) <= 0) {
    globalShowToast({
      message: t('referral.noClaimableCommission'),
      type: 'fail'
    })
    return
  }

  showClaimConfirmPopup.value = true
}

/**
 * 处理佣金领取确认。
 */
const handleConfirmClaimClick = async () => {
  if (claimingCommission.value) {
    return
  }

  claimingCommission.value = true

  try {
    ensureApiBusinessSuccess(
      await Api.agent.claimCommission({
        channelId: currentAgentChannelId.value
      })
    )

    globalShowToast({
      message: t('personalCenter.rebate.toast.claimSuccess'),
      type: 'success'
    })
    await fetchEstimatedCommission()
  } catch (error) {
    console.error('[referral] claim commission failed:', error)

    if (error instanceof ApiBusinessError) {
      return
    }

    globalShowToast({
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
 * 处理切换佣金加码周期标签。
 */
const handleChangeCommissionBoostPeriodTab = (value: ReferralCommissionBoostPeriodTabKey) => {
  activeCommissionBoostPeriodTab.value = value
}

/**
 * 处理打开佣金规则页。
 */
const handleOpenRules = () => {
  navigateTo('/referral/rules')
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
const resolveShareTargetUrl = (channel?: ReferralSocialChannel | null) =>
  String(channel?.shareDomainUrl ?? '').trim()

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
 * 获取代理分享信息配置。
 */
async function fetchReferralShareConfig() {
  referralShareConfig.value = null

  try {
    const response = ensureApiBusinessSuccess(
      await Api.agent.queryReferralShareConfig({
        channelId: currentAgentChannelId.value
      })
    )

    referralShareConfig.value = response.result ?? null
  } catch (error) {
    console.error('[referral] fetch share config failed:', error)
    referralShareConfig.value = null
  }
}

/**
 * 处理获取首页任务配置与周期任务进度。
 */
async function fetchReferralTaskModuleData() {
  commissionBoostLoading.value = true
  activeCommissionBoostPeriodTab.value = 'current'

  try {
    const [taskConfigResponse, settlementRuleResponse] = await Promise.allSettled([
      Api.agent.queryTaskRewardConfig({
        channelId: currentAgentChannelId.value
      }),
      Api.agent.queryReferralSettlementRule({
        channelId: currentAgentChannelId.value
      })
    ])

    if (taskConfigResponse.status === 'fulfilled') {
      try {
        taskRewardConfigResult.value =
          ensureApiBusinessSuccess(taskConfigResponse.value).result ?? null
      } catch (error) {
        console.error('[referral] fetch task reward config failed:', error)
        taskRewardConfigResult.value = null
      }
    } else {
      console.error('[referral] fetch task reward config failed:', taskConfigResponse.reason)
      taskRewardConfigResult.value = null
    }

    if (settlementRuleResponse.status === 'fulfilled') {
      try {
        referralSettlementRule.value =
          ensureApiBusinessSuccess(settlementRuleResponse.value).result ?? null
      } catch (error) {
        console.error('[referral] fetch settlement rule failed:', error)
        referralSettlementRule.value = null
      }
    } else {
      console.error('[referral] fetch settlement rule failed:', settlementRuleResponse.reason)
      referralSettlementRule.value = null
    }

    const periodRanges = buildReferralTaskPeriodRanges(referralSettlementRule.value)
    const [currentPeriodProgressResponse, previousPeriodProgressResponse] =
      await Promise.allSettled([
        Api.agent.queryReferralTaskProgress(periodRanges.current, {
          channelId: currentAgentChannelId.value
        }),
        Api.agent.queryReferralTaskProgress(periodRanges.previous, {
          channelId: currentAgentChannelId.value
        })
      ])

    if (currentPeriodProgressResponse.status === 'fulfilled') {
      try {
        currentPeriodTaskProgress.value =
          ensureApiBusinessSuccess(currentPeriodProgressResponse.value).result ?? null
      } catch (error) {
        console.error('[referral] fetch current period task progress failed:', error)
        currentPeriodTaskProgress.value = null
      }
    } else {
      console.error(
        '[referral] fetch current period task progress failed:',
        currentPeriodProgressResponse.reason
      )
      currentPeriodTaskProgress.value = null
    }

    if (previousPeriodProgressResponse.status === 'fulfilled') {
      try {
        previousPeriodTaskProgress.value =
          ensureApiBusinessSuccess(previousPeriodProgressResponse.value).result ?? null
      } catch (error) {
        console.error('[referral] fetch previous period task progress failed:', error)
        previousPeriodTaskProgress.value = null
      }
    } else {
      console.error(
        '[referral] fetch previous period task progress failed:',
        previousPeriodProgressResponse.reason
      )
      previousPeriodTaskProgress.value = null
    }
  } finally {
    commissionBoostLoading.value = false
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
    const payload = await fetchReferralBannerPayload(currentAgentChannelId.value, languageCode)

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
 * 处理推荐页跑马灯公告数据。
 */
async function fetchReferralMarqueeMessages() {
  marqueeNoticeRecords.value = []

  try {
    const response = ensureApiBusinessSuccess(
      await Api.home.queryNoticeMsg({
        languageCode: getLanguageCode(),
        msgType: 2,
        channelId: 4,
        sysLevelId: '1',
        page: {
          current: 1,
          size: 30
        }
      })
    )

    marqueeNoticeRecords.value = Array.isArray(response.result?.records)
      ? response.result.records
      : []
  } catch (error) {
    console.error('[referral] fetch marquee messages failed:', error)
    marqueeNoticeRecords.value = []
  }
}

/**
 * 处理社交渠道分享点击。
 */
const handleShareChannel = (channel: ReferralSocialChannel) => {
  if (!resolveShareTargetUrl(channel)) {
    globalShowToast({
      message: t('referral.comingSoon'),
      type: 'fail'
    })
    return
  }

  if (!posterImages.value.length) {
    globalShowToast({
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
  const copied = await copyTextWithFallback(resolveReferralShareContent())

  globalShowToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}

/**
 * 处理调用默认分享。
 */
const handleInvitePoster = async () => {
  const shareContent = resolveReferralShareContent()
  const shareLink = resolveChannelReferralLink()

  if (!shareContent || !shareLink) {
    globalShowToast({
      message: t('referral.copyFailed'),
      type: 'fail'
    })
    return
  }

  const copied = await copyTextWithFallback(shareContent)

  globalShowToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })

  if (copied && !openCurrentShareChannelTarget()) {
    globalShowToast({
      message: t('referral.comingSoon'),
      type: 'fail'
    })
  }
}
</script>
