<template>
  <!-- 规则页根容器 -->
  <div>
    <!-- H5 规则页容器 -->
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <!-- H5 头部导航栏，直接复用公共 H5Header -->
      <H5Header :title="t('referral.rulesPage.title')" />

      <!-- H5 页面滚动内容区域 -->
      <div class="flex-1 overflow-y-auto">
        <!-- H5 规则页内容 -->
        <ReferralRulesPageContent
          mode="mobile"
          :guide-title="t('referral.rulesPage.guideTitle')"
          :guide-image="guideImage"
          :how-to-earn-title="t('referral.rulesPage.howToEarnTitle')"
          :referral-rules-title="t('referral.rulesPage.referralRulesTitle')"
          :invite-text="t('referral.invitePoster.inviteNow')"
          :table-columns="tableColumns"
          :earn-steps="earnSteps"
          :referral-rules="referralRules"
          @play-guide="handlePlayGuide"
          @invite="handleInvite"
        />
      </div>
    </div>

    <!-- PC 规则页容器 -->
    <div v-else-if="isReady" class="min-h-screen bg-bg-1">
      <!-- PC 规则页布局 -->
      <PcLayout
        :page-title="t('referral.rulesPage.title')"
        :guide-title="t('referral.rulesPage.guideTitle')"
        :guide-image="guideImage"
        :how-to-earn-title="t('referral.rulesPage.howToEarnTitle')"
        :referral-rules-title="t('referral.rulesPage.referralRulesTitle')"
        :invite-text="t('referral.invitePoster.inviteNow')"
        :table-columns="tableColumns"
        :earn-steps="earnSteps"
        :referral-rules="referralRules"
        @play-guide="handlePlayGuide"
        @invite="handleInvite"
      />
    </div>

    <!-- PC Guide 视频弹窗 -->
    <ReferralGuideVideoPopup v-model="showGuideVideoPopup" />

    <!-- 邀请海报弹窗 -->
    <InvitePosterPopup
      v-model="showInvitePosterPopup"
      :images="invitePosterImages"
      :invite-code="displayLinkCode"
      :share-link="referralShareLink"
      :save-text="t('referral.invitePoster.saveImage')"
      :copy-link-text="t('referral.invitePoster.copyLink')"
      :invite-text="t('referral.invitePoster.inviteNow')"
      :close-text="t('referral.closeDialog')"
      :image-alt="t('referral.invitePoster.posterAlt')"
      @save="handleSavePosterImage"
      @copy-link="handleCopyPosterLink"
      @invite="handleInviteNow"
    />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { QueryTaskRewardCommissionItem } from '@/api/interface/agent'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useUserStore } from '@/stores/user'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { copyTextWithFallback } from '@/utils/clipboard'
import { navigateTo } from '@/utils/router'
import { formatLinkCode, globalShowToast } from '@/utils/toast'

import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReferralGuideVideoPopup from '../components/ReferralGuideVideoPopup.vue'
import InvitePosterPopup from '../details/components/InvitePosterPopup.vue'
import {
  buildReferralShareMessage,
  fetchReferralBannerPayload,
  getDefaultReferralLink
} from '../shared'
import ReferralRulesPageContent from './components/ReferralRulesPageContent.vue'
import PcLayout from './pc-layout.vue'
import {
  createReferralRulesColumns,
  createReferralRulesRows,
  createReferralRulesSteps,
  getReferralRulesGuideImage
} from './shared'

const { t, locale } = useI18n()
const userStore = useUserStore()
const isMobile = useIsMobile()
const isReady = ref(false)
const guideImage = getReferralRulesGuideImage()
const showGuideVideoPopup = ref(false)
const showInvitePosterPopup = ref(false)
const invitePosterImages = ref<string[]>([])
const referralLink = getDefaultReferralLink()
const commissionList = ref<QueryTaskRewardCommissionItem[]>([])
const currentAgentChannelId = computed(() => (isMobile.value ? '4' : '3'))
const displayLinkCode = computed(() => formatLinkCode(userStore.userInfo?.linkCode) || '-')
const referralShareLink = computed(
  () => `${referralLink.replace(/\/+$/, '')}/?id=${displayLinkCode.value}`
)

/**
 * 生成规则表头数据。
 */
const tableColumns = computed(() => createReferralRulesColumns(t))

/**
 * 生成收益步骤数据。
 */
const earnSteps = computed(() => createReferralRulesSteps(t))

/**
 * 生成佣金规则表格数据。
 */
const referralRules = computed(() => createReferralRulesRows(commissionList.value))

/**
 * 处理页面初始化完成状态，避免首屏端态抖动。
 */
onMounted(() => {
  isReady.value = true
  void fetchReferralRulesConfig()
})

watch(
  () => [currentAgentChannelId.value, locale.value] as const,
  () => {
    void fetchInvitePosterImages()
  },
  {
    immediate: true
  }
)

/**
 * 获取规则页佣金等级配置。
 */
async function fetchReferralRulesConfig() {
  try {
    const response = ensureApiBusinessSuccess(
      await Api.agent.queryTaskRewardConfig({
        channelId: currentAgentChannelId.value
      })
    )

    commissionList.value = response.result?.config?.commissionList ?? []
  } catch (error) {
    console.error('[referral rules] fetch task reward config failed:', error)
    commissionList.value = []
  }
}

/**
 * 获取邀请海报图片。
 */
async function fetchInvitePosterImages() {
  try {
    const payload = await fetchReferralBannerPayload(currentAgentChannelId.value)
    invitePosterImages.value = payload.posterImages
  } catch (error) {
    console.error('[referral rules] fetch invite poster images failed:', error)
    invitePosterImages.value = []
  }
}

/**
 * 处理播放 Guide 视频。
 */
const handlePlayGuide = () => {
  if (isMobile.value) {
    navigateTo('/referral/guide')
    return
  }

  showGuideVideoPopup.value = true
}

/**
 * 处理点击邀请按钮。
 */
const handleInvite = () => {
  if (!invitePosterImages.value.length) {
    globalShowToast({
      message: t('referral.comingSoon'),
      type: 'fail'
    })
    return
  }

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
  const copied = await copyTextWithFallback(referralShareLink.value)

  globalShowToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}

/**
 * 处理立即分享邀请。
 */
const handleInviteNow = async () => {
  const shareLink = referralShareLink.value
  const shareContent = buildReferralShareMessage(
    t('referral.messagePopup.presets.exclusiveRewards'),
    shareLink
  )

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
      console.error('[referral rules] navigator share failed:', error)
    }
  }

  const copied = await copyTextWithFallback(shareContent)

  globalShowToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}
</script>
