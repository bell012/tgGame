<template>
  <ReferralLayout current-tab="tasks" :page-title="props.pageTitle">
    <!-- PC 任务页内容 -->
    <ReferralTaskPageContent
      mode="pc"
      :reset-hint="props.resetHint"
      :rewards-to-claim-label="props.rewardsToClaimLabel"
      :rewards-to-claim-amount="props.rewardsToClaimAmount"
      :coin-image="props.coinImage"
      :claim-text="props.claimText"
      :tabs="props.tabs"
      :active-tab="props.activeTab"
      :current-progress-value="props.currentProgressValue"
      :current-progress-unit="props.currentProgressUnit"
      :current-progress-label="props.currentProgressLabel"
      :max-reward-value="props.maxRewardValue"
      :max-reward-label="props.maxRewardLabel"
      :reward-table-columns="props.rewardTableColumns"
      :reward-rows="props.rewardRows"
      :reward-table-loading="props.rewardTableLoading"
      :valid-invite-title="props.validInviteTitle"
      :valid-invite-description="props.validInviteDescription"
      :task-rules-title="props.taskRulesTitle"
      :task-rules-image="props.taskRulesImage"
      @claim="$emit('claim')"
      @tab-click="$emit('tab-click', $event)"
    />
  </ReferralLayout>
</template>

<script setup lang="ts">
import ReferralLayout from '../ReferralLayout.vue'
import ReferralTaskPageContent from './components/ReferralTaskPageContent.vue'
import type { ReferralTaskRewardRow, ReferralTaskTab, ReferralTaskTabKey } from './shared'

interface Props {
  pageTitle: string
  resetHint: string
  rewardsToClaimLabel: string
  rewardsToClaimAmount: string
  coinImage: string
  claimText: string
  tabs: ReferralTaskTab[]
  activeTab: ReferralTaskTabKey
  currentProgressValue: string
  currentProgressUnit: string
  currentProgressLabel: string
  maxRewardValue: string
  maxRewardLabel: string
  rewardTableColumns: string[]
  rewardRows: ReferralTaskRewardRow[]
  rewardTableLoading: boolean
  validInviteTitle: string
  validInviteDescription: string
  taskRulesTitle: string
  taskRulesImage: string
}

const props = defineProps<Props>()

defineEmits<{
  claim: []
  'tab-click': [value: ReferralTaskTabKey]
}>()
</script>
