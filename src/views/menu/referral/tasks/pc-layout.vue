<template>
  <!-- PC 任务页容器 -->
  <section
    class="mx-auto w-full max-w-[1120px] px-6 py-6"
    style="font-family: Inter, avertastd, sans-serif"
  >
    <!-- PC 任务页头部 -->
    <div class="mb-5 flex items-center justify-between rounded-[16px] bg-bg-2 px-5 py-4">
      <!-- PC 任务页标题 -->
      <h1 class="text-[24px] font-[700] leading-[29px] text-text-1">{{ props.pageTitle }}</h1>

      <!-- PC 客服按钮 -->
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-[12px] bg-opacity-5"
        @click="$emit('customer-service')"
      >
        <CustomerServiceIcon class="h-5 w-5 text-text-1" />
      </button>
    </div>

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
  </section>
</template>

<script setup lang="ts">
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
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
  'customer-service': []
  claim: []
  'tab-click': [value: ReferralTaskTabKey]
}>()
</script>
