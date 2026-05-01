<template>
  <!-- PC 规则页外层容器 -->
  <section
    class="mx-auto w-full max-w-[1120px] px-6 py-6"
    style="font-family: Inter, avertastd, sans-serif"
  >
    <!-- PC 规则页卡片容器 -->
    <div class="mx-auto max-w-[420px] overflow-hidden rounded-[20px] bg-bg-1">
      <!-- PC 页面标题区域 -->
      <div class="px-[14px] pb-[12px] pt-[20px]">
        <h1 class="text-center text-[24px] font-[700] leading-[29px] text-text-1">
          {{ props.pageTitle }}
        </h1>
      </div>

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
    </div>
  </section>
</template>

<script setup lang="ts">
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
