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
          :invite-text="t('referral.cta')"
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
        :invite-text="t('referral.cta')"
        :table-columns="tableColumns"
        :earn-steps="earnSteps"
        :referral-rules="referralRules"
        @play-guide="handlePlayGuide"
        @invite="handleInvite"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateTo } from '@/utils/router'
import ReferralRulesPageContent from './components/ReferralRulesPageContent.vue'
import PcLayout from './pc-layout.vue'
import {
  createReferralRulesColumns,
  createReferralRulesRows,
  createReferralRulesSteps,
  getReferralRulesGuideImage
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)
const guideImage = getReferralRulesGuideImage()

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
const referralRules = computed(() => createReferralRulesRows(t))

/**
 * 处理页面初始化完成状态，避免首屏端态抖动。
 */
onMounted(() => {
  isReady.value = true
})

/**
 * 处理播放 Guide 视频。
 */
const handlePlayGuide = () => {
  showToast({
    message: t('referral.rulesPage.playGuideHint'),
    type: 'success'
  })
}

/**
 * 处理点击邀请按钮。
 */
const handleInvite = () => {
  navigateTo('/referral')
}
</script>
