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
          :reset-hint="t('referral.taskPage.resetHint')"
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
          :max-reward-label="t('referral.taskPage.maxRewardThisWeek')"
          :reward-table-columns="rewardTableColumns"
          :reward-rows="rewardRows"
          :reward-table-loading="rewardTableLoading"
          :valid-invite-title="t('referral.taskPage.validInviteTitle')"
          :valid-invite-description="t('referral.taskPage.validInviteDescription')"
          :task-rules-title="t('referral.taskPage.taskRulesTitle')"
          :task-rules-image="taskRulesImage"
          @claim="handleClaimClick"
          @tab-click="handleTabClick"
        />
      </div>
    </div>

    <!-- PC 任务页容器 -->
    <div v-else-if="isReady" class="min-h-screen bg-bg-1">
      <!-- PC 任务页布局 -->
      <PcLayout
        :page-title="t('referral.taskPage.title')"
        :reset-hint="t('referral.taskPage.resetHint')"
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
        :max-reward-label="t('referral.taskPage.maxRewardThisWeek')"
        :reward-table-columns="rewardTableColumns"
        :reward-rows="rewardRows"
        :reward-table-loading="rewardTableLoading"
        :valid-invite-title="t('referral.taskPage.validInviteTitle')"
        :valid-invite-description="t('referral.taskPage.validInviteDescription')"
        :task-rules-title="t('referral.taskPage.taskRulesTitle')"
        :task-rules-image="taskRulesImage"
        @customer-service="handleCustomerServiceClick"
        @claim="handleClaimClick"
        @tab-click="handleTabClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import H5Header from '@/components/common/H5Header.vue'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { useIsMobile } from '@/composables/useMediaQuery'
import PcLayout from './pc-layout.vue'
import ReferralTaskPageContent from './components/ReferralTaskPageContent.vue'
import {
  buildReferralTaskRewardTable,
  createReferralTaskTabs,
  getReferralTaskCoinImage,
  getReferralTaskRulesPlaceholderImage,
  type ReferralTaskRewardConfig,
  type ReferralTaskTabKey
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)
const activeTab = ref<ReferralTaskTabKey>('invite-register')
const rewardTableLoading = ref(false)
const taskRewardConfig = ref<ReferralTaskRewardConfig | null>(null)
const rewardsToClaimAmount = '0.00'
const currentProgressValue = '0'
const maxRewardValue = '8990'
const coinImage = getReferralTaskCoinImage()
const taskRulesImage = getReferralTaskRulesPlaceholderImage()

const currentAgentChannelId = computed(() => (isMobile.value ? '4' : '3'))
const taskTabs = computed(() => createReferralTaskTabs(t))
const rewardTable = computed(() =>
  buildReferralTaskRewardTable(taskRewardConfig.value, activeTab.value, t)
)
const rewardTableColumns = computed(() => rewardTable.value.columns)
const rewardRows = computed(() => rewardTable.value.rows)

watch(
  () => currentAgentChannelId.value,
  () => {
    fetchTaskRewardConfig()
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
 * 获取任务奖励配置。
 */
async function fetchTaskRewardConfig() {
  rewardTableLoading.value = true

  try {
    const response = await Api.agent.queryTaskRewardConfig({
      channelId: currentAgentChannelId.value
    })

    taskRewardConfig.value = response?.result?.config ?? null
  } catch (error) {
    console.error('[referral-task] fetch task reward config failed:', error)
    taskRewardConfig.value = null
  } finally {
    rewardTableLoading.value = false
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
 * 处理任务标签点击。
 */
const handleTabClick = (tabKey: ReferralTaskTabKey) => {
  if (tabKey === activeTab.value) {
    return
  }

  activeTab.value = tabKey
}

/**
 * 处理领取按钮点击。
 */
const handleClaimClick = () => {
  showToast({
    message: t('referral.noClaimableCommission'),
    type: 'fail'
  })
}
</script>
