<template>
  <!-- PC 签到页面内容 -->
  <CheckInPageContent
    mode="pc"
    :view-data="props.viewData"
    :loading="props.loading"
    :action-loading="props.actionLoading"
    @close="$emit('close')"
    @rules="$emit('rules')"
    @action="$emit('action')"
    @reward-click="$emit('reward-click', $event)"
    @hero-use-now="$emit('hero-use-now', $event)"
  />
</template>

<script setup lang="ts">
import CheckInPageContent from './components/CheckInPageContent.vue'
import type { CheckInHeroActionReward, CheckInRewardItem, CheckInViewData } from './shared'

interface Props {
  viewData: CheckInViewData
  loading?: boolean
  actionLoading?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  rules: []
  action: []
  'reward-click': [reward: CheckInRewardItem]
  'hero-use-now': [reward: CheckInHeroActionReward]
}>()
</script>
