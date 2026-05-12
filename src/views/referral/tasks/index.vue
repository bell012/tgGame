<template>
  <div>
    <!-- H5 任务页容器 -->
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <!-- H5 任务页头部 -->
      <H5Header
        :title="t('referral.taskPage.title')"
        :show-sort="true"
        :right-icon="CustomerServiceIcon"
        @sort="handleCustomerServiceClick"
      />

      <!-- H5 任务页滚动区域 -->
      <div class="flex-1 overflow-y-auto">
        <!-- H5 任务页内容 -->
        <ReferralTaskPageContent
          mode="mobile"
          :reset-hint-prefix="resetHintSegments.prefix"
          :reset-hint-countdown="resetHintSegments.countdown"
          :reset-hint-suffix="resetHintSegments.suffix"
          :rewards-to-claim-label="t('referral.taskPage.rewardsToClaim')"
          :rewards-to-claim-amount="rewardsToClaimAmount"
          :coin-image="coinImage"
          :claim-text="t('referral.claim')"
          :tabs="taskTabs"
          :active-tab="activeTab"
          :current-progress-value="currentProgressValue"
          :current-progress-unit="t('referral.taskPage.friendsUnit')"
          :current-progress-label="t('referral.taskPage.currentProgress')"
          :max-reward-value="maxRewardValue"
          :max-reward-label="maxRewardLabel"
          :reward-table-columns="rewardTableColumns"
          :reward-rows="rewardRows"
          :reward-table-loading="rewardTableLoading"
          :valid-invite-title="t('referral.taskPage.validInviteTitle')"
          :valid-invite-description="validInviteDescriptionText"
          :task-rules-title="t('referral.taskPage.taskRulesTitle')"
          :task-rules-image="taskRulesImage"
          :bottom-action-text="t('referral.invitePoster.inviteNow')"
          @claim="handleClaimClick"
          @open-progress-reminder="handleOpenProgressReminder"
          @open-rules="handleOpenRules"
          @tab-click="handleTabClick"
        />
      </div>
    </div>

    <!-- PC 任务页容器 -->
    <div v-else-if="isReady" class="min-h-screen bg-bg-1">
      <!-- PC 任务页布局 -->
      <PcLayout
        :page-title="t('referral.taskPage.title')"
        :reset-hint-prefix="resetHintSegments.prefix"
        :reset-hint-countdown="resetHintSegments.countdown"
        :reset-hint-suffix="resetHintSegments.suffix"
        :rewards-to-claim-label="t('referral.taskPage.rewardsToClaim')"
        :rewards-to-claim-amount="rewardsToClaimAmount"
        :coin-image="coinImage"
        :claim-text="t('referral.claim')"
        :tabs="taskTabs"
        :active-tab="activeTab"
        :current-progress-value="currentProgressValue"
        :current-progress-unit="t('referral.taskPage.friendsUnit')"
        :current-progress-label="t('referral.taskPage.currentProgress')"
        :max-reward-value="maxRewardValue"
        :max-reward-label="maxRewardLabel"
        :reward-table-columns="rewardTableColumns"
        :reward-rows="rewardRows"
        :reward-table-loading="rewardTableLoading"
        :valid-invite-title="t('referral.taskPage.validInviteTitle')"
        :valid-invite-description="validInviteDescriptionText"
        :task-rules-title="t('referral.taskPage.taskRulesTitle')"
        :task-rules-image="taskRulesImage"
        :bottom-action-text="t('referral.invitePoster.inviteNow')"
        @claim="handleClaimClick"
        @open-progress-reminder="handleOpenProgressReminder"
        @open-rules="handleOpenRules"
        @tab-click="handleTabClick"
      />
    </div>

    <!-- 任务页佣金领取确认弹窗 -->
    <ClaimSuccessPopup
      v-model:visible="showClaimConfirmPopup"
      :amount="rewardsToClaimAmount"
      @confirm="handleConfirmClaimClick"
    />

    <!-- 任务页进度提醒弹窗 -->
    <ReferralTaskProgressReminderPopup
      v-model="showProgressReminderPopup"
      :mode="isMobile ? 'mobile' : 'pc'"
      :title="t('referral.taskPage.progressReminder.title')"
      :description="t('referral.taskPage.progressReminder.description')"
      :primary-button-text="t('referral.taskPage.progressReminder.primaryButton')"
      :secondary-button-text="t('referral.taskPage.progressReminder.secondaryButton')"
      @primary="handleProgressReminderPrimaryClick"
      @secondary="handleOpenRules"
    />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  QueryReferralSettlementRuleResult,
  QueryTaskRewardConfigResult
} from '@/api/interface/agent'
import ClaimSuccessPopup from '@/components/common/ClaimSuccessPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { ApiBusinessError, ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { formatBalance } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReferralTaskPageContent from './components/ReferralTaskPageContent.vue'
import ReferralTaskProgressReminderPopup from './components/ReferralTaskProgressReminderPopup.vue'
import PcLayout from './pc-layout.vue'
import {
  buildReferralTaskRewardTable,
  createReferralTaskMaxRewardLabel,
  createReferralTaskResetHintSegments,
  createReferralTaskTabs,
  createReferralTaskValidInviteDescription,
  getReferralTaskCoinImage,
  getReferralTaskRulesPlaceholderImage,
  type ReferralTaskRewardConfig,
  type ReferralTaskTabKey
} from './shared'

const { t, locale } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)
const activeTab = ref<ReferralTaskTabKey>('invite-register')
const rewardTableLoading = ref(false)
const taskRewardResult = ref<QueryTaskRewardConfigResult | null>(null)
const taskRewardConfig = ref<ReferralTaskRewardConfig | null>(null)
const referralSettlementRule = ref<QueryReferralSettlementRuleResult | null>(null)
const rewardsToClaimAmount = ref('0.00')
const currentProgressValue = '0'
const maxRewardValue = '8990'
const coinImage = getReferralTaskCoinImage()
const taskRulesImage = getReferralTaskRulesPlaceholderImage()
const showClaimConfirmPopup = ref(false)
const showProgressReminderPopup = ref(false)
const claimingCommission = ref(false)

const currentAgentChannelId = computed(() => (isMobile.value ? '4' : '3'))
const taskTabs = computed(() => createReferralTaskTabs(t))
const rewardTable = computed(() =>
  buildReferralTaskRewardTable(taskRewardConfig.value, activeTab.value, t)
)
const rewardTableColumns = computed(() => rewardTable.value.columns)
const rewardRows = computed(() => rewardTable.value.rows)
const resetHintSegments = computed(() =>
  createReferralTaskResetHintSegments(t, String(locale.value), referralSettlementRule.value)
)
const validInviteDescriptionText = computed(() =>
  createReferralTaskValidInviteDescription(t, referralSettlementRule.value)
)
const maxRewardLabel = computed(() =>
  createReferralTaskMaxRewardLabel(t, referralSettlementRule.value)
)

watch(
  () => currentAgentChannelId.value,
  () => {
    void fetchTaskPageData()
  },
  {
    immediate: true
  }
)

/**
 * 处理页面初始化完成状态，避免首屏端态抖动。
 */
onMounted(() => {
  isReady.value = true
})

/**
 * 获取任务页数据。
 */
async function fetchTaskPageData() {
  rewardTableLoading.value = true
  rewardsToClaimAmount.value = '0.00'

  try {
    const [taskRewardResponse, settlementRuleResponse, estimatedCommissionResponse] =
      await Promise.all([
        Api.agent.queryTaskRewardConfig({
          channelId: currentAgentChannelId.value
        }),
        Api.agent.queryReferralSettlementRule({
          channelId: currentAgentChannelId.value
        }),
        Api.agent.queryEstimatedCommission({
          channelId: currentAgentChannelId.value
        })
      ])

    const taskRewardBusinessResponse = ensureApiBusinessSuccess(taskRewardResponse)
    const settlementRuleBusinessResponse = ensureApiBusinessSuccess(settlementRuleResponse)
    const estimatedCommissionBusinessResponse = ensureApiBusinessSuccess(
      estimatedCommissionResponse
    )

    taskRewardResult.value = taskRewardBusinessResponse.result ?? null
    taskRewardConfig.value = taskRewardBusinessResponse.result?.config ?? null
    referralSettlementRule.value = settlementRuleBusinessResponse.result ?? null
    rewardsToClaimAmount.value = formatBalance(
      Number(estimatedCommissionBusinessResponse.result ?? 0),
      2
    )
  } catch (error) {
    console.error('[referral-task] fetch task page data failed:', error)
    taskRewardResult.value = null
    taskRewardConfig.value = null
    referralSettlementRule.value = null
    rewardsToClaimAmount.value = '0.00'
  } finally {
    rewardTableLoading.value = false
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
 * 处理任务标签点击。
 */
const handleTabClick = (tabKey: ReferralTaskTabKey) => {
  if (tabKey === activeTab.value) {
    return
  }

  activeTab.value = tabKey
}

/**
 * 处理打开规则页。
 */
const handleOpenRules = () => {
  navigateTo('/referral/rules')
}

/**
 * 打开任务页进度提醒弹窗。
 */
const handleOpenProgressReminder = () => {
  showProgressReminderPopup.value = true
}

/**
 * 处理任务页进度提醒主按钮点击。
 */
const handleProgressReminderPrimaryClick = () => {
  globalShowToast({
    message: t('sidebar_menu.customer_service'),
    type: 'success'
  })
}

/**
 * 处理领取按钮点击。
 */
const handleClaimClick = () => {
  if (claimingCommission.value) {
    return
  }

  if ((Number(rewardsToClaimAmount.value) || 0) <= 0) {
    globalShowToast({
      message: t('referral.noClaimableCommission'),
      type: 'fail'
    })
    return
  }

  showClaimConfirmPopup.value = true
}

/**
 * 处理领取确认点击。
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
    await fetchTaskPageData()
  } catch (error) {
    console.error('[referral-task] claim commission failed:', error)

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
</script>
