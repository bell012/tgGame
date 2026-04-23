<template>
  <div>
    <section v-if="isMobile" class="fixed inset-0 overflow-y-auto bg-bg-1">
      <H5Header
        title="洗码"
        :show-sort="true"
        :right-icon="supportHeaderIcon"
        @sort="handleSupportClick"
      />

      <main class="px-3.5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3.5">
        <RebateOverviewCard
          :claimable-amount-text="claimableAmountText"
          :eligible-turnover-text="eligibleTurnoverText"
          :is-mobile="true"
          :today-valid-bets-text="todayValidBetsText"
          @eligible-turnover-click="openEligibleTurnoverPopup"
        />

        <button
          type="button"
          class="mt-3 h-[45px] w-full rounded-[10px] bg-theme-primary text-[16px] font-[700] text-text-4"
          @click="handleClaimRebate"
        >
          Claim
        </button>

        <RebateActionTabs
          :active-tab="activeTab"
          :is-mobile="true"
          @open-records="handleOpenRebateRecords"
          @open-rules="openRebateRulesPopup"
        />

        <RebateCategoryTabs
          :active-category="activeCategory"
          :categories="categoryOptions"
          :is-mobile="true"
          @update:active-category="activeCategory = $event"
        />

        <RebateProgressCard
          :current-rebate-text="currentRebateText"
          :current-valid-bets-plain-text="currentValidBetsPlainText"
          :is-mobile="true"
          :next-rebate-text="nextRebateText"
          :progress-percent="progressPercent"
          :progress-percent-text="progressPercentText"
          :target-valid-bets-text="targetValidBetsText"
        />

        <RebateRateTable :is-mobile="true" :rows="rebateRows" />
      </main>
    </section>

    <div v-else class="mx-auto max-w-[1336px] px-3.5 pb-6 pt-5">
      <h2 class="text-[30px] font-[700] text-text-1">洗码</h2>

      <RebateOverviewCard
        :claimable-amount-text="claimableAmountText"
        :eligible-turnover-text="eligibleTurnoverText"
        :is-mobile="false"
        :today-valid-bets-text="todayValidBetsText"
        @eligible-turnover-click="openEligibleTurnoverPopup"
      >
        <template #desktop-action>
          <button
            type="button"
            class="h-[45px] min-w-[220px] rounded-[8px] bg-theme-primary px-5 text-sm font-[700] text-text-4"
            @click="handleClaimRebate"
          >
            Claim
          </button>
        </template>
      </RebateOverviewCard>

      <RebateActionTabs
        :active-tab="activeTab"
        :is-mobile="false"
        @open-records="handleOpenRebateRecords"
        @open-rules="openRebateRulesPopup"
      />

      <RebateCategoryTabs
        :active-category="activeCategory"
        :categories="categoryOptions"
        :is-mobile="false"
        @update:active-category="activeCategory = $event"
      />

      <RebateProgressCard
        :current-rebate-text="currentRebateText"
        :current-valid-bets-plain-text="currentValidBetsPlainText"
        :is-mobile="false"
        :next-rebate-text="nextRebateText"
        :progress-percent="progressPercent"
        :progress-percent-text="progressPercentText"
        :target-valid-bets-text="targetValidBetsText"
      />

      <RebateRateTable :is-mobile="false" :rows="rebateRows" />
    </div>

    <ClaimSuccessPopup
      v-model:visible="showClaimSuccessPopup"
      :amount="claimableAmountText"
      @confirm="handleClaimSuccessConfirm"
    />

    <RebateRecordsModal v-model="showRebateRecordsPopup" />

    <EligibleTurnoverPopup
      v-model="showEligibleTurnoverPopup"
      :eligible-turnover-text="eligibleTurnoverText"
      :is-mobile="isMobile"
      :pending-rebate-turnover-text="pendingRebateTurnoverText"
      :promo-bonus-turnover-deduction-text="promoBonusTurnoverDeductionText"
    />

    <RebateRulesPopup
      v-model="showRebateRulesPopup"
      :is-mobile="isMobile"
      :sections="rebateRuleSections"
    />
  </div>
</template>

<script setup lang="ts">
import ClaimSuccessPopup from '@/components/common/ClaimSuccessPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import { rebateRuleSections } from './constants'
import EligibleTurnoverPopup from './components/dialogs/EligibleTurnoverPopup.vue'
import RebateRecordsModal from './components/dialogs/RebateRecordsModal.vue'
import RebateRulesPopup from './components/dialogs/RebateRulesPopup.vue'
import RebateActionTabs from './components/page/RebateActionTabs.vue'
import RebateCategoryTabs from './components/page/RebateCategoryTabs.vue'
import RebateOverviewCard from './components/page/RebateOverviewCard.vue'
import RebateProgressCard from './components/page/RebateProgressCard.vue'
import RebateRateTable from './components/page/RebateRateTable.vue'
import { useRebatePage } from './useRebatePage'

const {
  activeCategory,
  activeTab,
  categoryOptions,
  claimableAmountText,
  currentRebateText,
  currentValidBetsPlainText,
  eligibleTurnoverText,
  handleClaimRebate,
  handleClaimSuccessConfirm,
  handleOpenRebateRecords,
  handleSupportClick,
  isMobile,
  nextRebateText,
  openEligibleTurnoverPopup,
  openRebateRulesPopup,
  pendingRebateTurnoverText,
  progressPercent,
  progressPercentText,
  promoBonusTurnoverDeductionText,
  rebateRows,
  showClaimSuccessPopup,
  showEligibleTurnoverPopup,
  showRebateRecordsPopup,
  showRebateRulesPopup,
  supportHeaderIcon,
  targetValidBetsText,
  todayValidBetsText
} = useRebatePage()
</script>

<style scoped lang="scss"></style>
