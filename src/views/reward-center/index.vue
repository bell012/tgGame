<template>
  <div>
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <H5Header
        :title="t('rewardCenter.title')"
        :show-sort="true"
        :right-icon="CustomerServiceIcon"
        @sort="handleCustomerServiceClick"
      />

      <div class="flex items-center justify-between gap-2 px-[14px] py-3.5">
        <div class="flex min-w-0 flex-1 gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab"
            type="button"
            :class="getRewardCenterMobileTabClass(activeTab === tab)"
            @click="switchTab(tab)"
          >
            <span :class="getRewardCenterMobileTabTextClass(activeTab === tab)">
              {{ tabLabel(tab) }}
            </span>
          </button>
        </div>

        <button
          v-if="activeTab === 'claimed'"
          type="button"
          class="flex h-[31px] max-w-[119px] shrink-0 items-center gap-2 rounded-[18px] bg-bg-2 px-2.5 text-xs font-medium text-text-2"
          @click="handleOpenFilter"
        >
          <span class="min-w-0 truncate">{{ claimedFilterLabel }}</span>
          <ArrowDownIcon class="h-3.5 w-3.5 shrink-0 text-text-2" />
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-[14px] pb-4">
        <RewardCenterTabContent
          :active-tab="activeTab"
          :is-mobile="true"
          @claim-success="handleClaimSuccess"
        />
      </div>

      <FilterPopup
        v-model:visible="showFilterPopup"
        v-model="filterValues"
        :filter-groups="filterGroups"
        @apply="handleFilterApply"
      />
    </div>

    <RewardCenterLayout v-else-if="isReady" :active-tab="activeTab" @change-tab="switchTab">
      <RewardCenterTabContent
        :active-tab="activeTab"
        :is-mobile="false"
        @claim-success="handleClaimSuccess"
      />
    </RewardCenterLayout>

    <ClaimSuccessPopup
      v-model:visible="showClaimSuccess"
      :amount="claimSuccessAmount"
      :title="t('rewardCenter.claimSuccessTitle')"
      :desc="t('rewardCenter.claimSuccessDesc')"
      :button-text="t('rewardCenter.ok')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import ClaimSuccessPopup from '@/components/common/ClaimSuccessPopup.vue'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useIsMobile } from '@/composables/useMediaQuery'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { useRewardCenterStore } from '@/stores/rewardCenter'
import { globalShowToast } from '@/utils/toast'
import RewardCenterLayout from './layout.vue'
import RewardCenterTabContent from './components/RewardCenterTabContent.vue'
import {
  createDefaultRewardCenterFilterValues,
  createRewardCenterTimeOptions,
  getRewardCenterMobileTabClass,
  getRewardCenterMobileTabTextClass,
  getRewardCenterTimeLabel,
  normalizeRewardCenterFilterValues,
  REWARD_CENTER_TABS,
  type RewardCenterTab
} from './shared'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'

const { t } = useI18n()
const route = useRoute()
const isMobile = useIsMobile()
const isReady = ref(false)
const rewardCenterStore = useRewardCenterStore()

const tabs = REWARD_CENTER_TABS
const activeTab = ref<RewardCenterTab>('pending')
const showFilterPopup = ref(false)
const showClaimSuccess = ref(false)
const claimSuccessAmount = ref('0.00')

const filterValues = ref<Record<string, string | string[]>>({
  ...createDefaultRewardCenterFilterValues()
})

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'time',
    title: t('betHistory.filterGroups.date'),
    options: createRewardCenterTimeOptions(t),
    columns: 2
  }
])

usePageScrollLock(() => isMobile.value)

const tabLabel = (tab: RewardCenterTab) =>
  tab === 'pending' ? t('rewardCenter.tabs.pending') : t('rewardCenter.tabs.claimed')

const claimedFilterLabel = computed(() =>
  getRewardCenterTimeLabel(t, rewardCenterStore.claimedFilterValues.time)
)

const resolveTabFromRoute = () => {
  const tab = String(route.query.tab || '')
  if (tab === 'claimed') {
    return 'claimed'
  }
  return 'pending'
}

const switchTab = async (tab: RewardCenterTab) => {
  if (activeTab.value === tab) {
    return
  }

  activeTab.value = tab
  await rewardCenterStore.loadTabData(tab)
}

const handleOpenFilter = () => {
  filterValues.value = {
    ...createDefaultRewardCenterFilterValues(),
    ...rewardCenterStore.claimedFilterValues
  }
  showFilterPopup.value = true
}

const handleFilterApply = async (values: Record<string, string | string[]>) => {
  const normalized = normalizeRewardCenterFilterValues(values)
  filterValues.value = { ...normalized }

  await rewardCenterStore.setClaimedFilterValues(normalized)
}

const handleCustomerServiceClick = () => {
  globalShowToast({
    message: t('sidebar_menu.customer_service'),
    type: 'success'
  })
}

const handleClaimSuccess = (amount: string) => {
  claimSuccessAmount.value = amount
  showClaimSuccess.value = true
}

onMounted(async () => {
  activeTab.value = resolveTabFromRoute()
  isReady.value = true
  await rewardCenterStore.loadTabData(activeTab.value)
})

watch(
  () => route.query.tab,
  () => {
    const nextTab = resolveTabFromRoute()
    if (nextTab !== activeTab.value) {
      void switchTab(nextTab)
    }
  }
)
</script>
