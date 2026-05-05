<template>
  <ReferralLayout current-tab="rules" :page-title="props.pageTitle">
    <!-- PC 规则页主体内容 -->
    <ReferralRulesPageContent
      mode="pc"
      :guide-title="props.guideTitle"
      :guide-image="props.guideImage"
      :how-to-earn-title="props.howToEarnTitle"
      :referral-rules-title="props.referralRulesTitle"
      :invite-text="props.inviteText"
      :table-columns="props.tableColumns"
      :earn-steps="props.earnSteps"
      :referral-rules="props.referralRules"
      @play-guide="$emit('play-guide')"
      @invite="$emit('invite')"
    />
  </ReferralLayout>
</template>

<script setup lang="ts">
import ReferralLayout from '../ReferralLayout.vue'
import ReferralRulesPageContent from './components/ReferralRulesPageContent.vue'
import type { ReferralRulesRow, ReferralRulesStep } from './shared'

interface Props {
  pageTitle: string
  guideTitle: string
  guideImage: string
  howToEarnTitle: string
  referralRulesTitle: string
  inviteText: string
  tableColumns: string[]
  earnSteps: ReferralRulesStep[]
  referralRules: ReferralRulesRow[]
}

const props = defineProps<Props>()

defineEmits<{
  'play-guide': []
  invite: []
}>()
</script>
