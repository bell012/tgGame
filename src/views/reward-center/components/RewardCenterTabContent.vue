<template>
  <div class="flex flex-col gap-3">
    <CustomSelect
      v-if="props.activeTab === 'claimed' && !props.isMobile"
      class="w-[336px]"
      :model-value="rewardCenterStore.claimedFilterValues.time"
      :options="timeOptions"
      :placeholder="t('betHistory.filterGroups.date')"
      use-placeholder-when-all
      @update:model-value="handleDesktopTimeChange"
    />

    <RewardClaimSummaryCard
      v-if="props.isMobile && props.activeTab === 'pending'"
      :amount-text="pendingTotalText"
      variant="page"
      summary-kind="pending"
      :claim-disabled="rewardCenterStore.isClaimAllDisabled"
      :claim-loading="rewardCenterStore.claiming"
      @claim="claimAll"
    />

    <RewardClaimSummaryCard
      v-else-if="props.isMobile && props.activeTab === 'claimed'"
      :amount-text="claimedTotalText"
      variant="page"
      summary-kind="claimed"
    />

    <RewardSummaryBar
      v-else-if="props.activeTab === 'pending'"
      :label="t('rewardCenter.popup.pendingTotalLabel')"
      :amount-text="pendingTotalText"
      :claim-label="t('rewardCenter.claim')"
      :claim-disabled="rewardCenterStore.isClaimAllDisabled"
      :claim-loading="rewardCenterStore.claiming"
      :compact="props.isMobile"
      @claim="claimAll"
    />

    <RewardSummaryBar
      v-else
      :label="t('rewardCenter.summary.claimedTotal')"
      :amount-text="claimedTotalText"
      :show-claim="false"
      :compact="props.isMobile"
    />

    <div v-if="isLoading" class="py-12 text-center text-xs text-text-2">
      {{ t('common.loading') }}
    </div>

    <ThemedEmptyState
      v-else-if="listItems.length === 0"
      :dark-image="defaultImgDark"
      :light-image="defaultImgLight"
      :message="t('rewardCenter.empty')"
      container-class="mt-8 justify-center"
      image-class="mb-2.5 h-[200px] w-auto"
      text-class="text-text-1 text-sm font-[700]"
    />

    <div v-else :class="props.isMobile ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-4'">
      <RewardRecordCard
        v-for="item in listItems"
        :key="item.id"
        :item="item"
        :claim-label="t('rewardCenter.claim')"
        :claim-disabled="rewardCenterStore.claiming || props.activeTab === 'claimed'"
        :claimed="props.activeTab === 'claimed'"
        :show-claim="props.isMobile || props.activeTab === 'pending'"
        :variant="props.isMobile ? 'page' : 'default'"
        :compact="props.isMobile"
        @claim="claimItem(item.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomSelect from '@/components/common/CustomSelect.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useRewardCenterClaim } from '@/composables/useRewardCenterClaim'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import { useRewardCenterStore } from '@/stores/rewardCenter'
import {
  createRewardCenterTimeOptions,
  formatRewardCenterTotal,
  type RewardCenterTab
} from '../shared'
import RewardClaimSummaryCard from './RewardClaimSummaryCard.vue'
import RewardRecordCard from './RewardRecordCard.vue'
import RewardSummaryBar from './RewardSummaryBar.vue'

const props = defineProps<{
  activeTab: RewardCenterTab
  isMobile: boolean
}>()

const { t } = useI18n()
const rewardCenterStore = useRewardCenterStore()

const emit = defineEmits<{
  'claim-success': [amount: string]
}>()

const { claimItem, claimAll } = useRewardCenterClaim({
  onSuccess: amount => emit('claim-success', amount)
})

const timeOptions = computed(() => createRewardCenterTimeOptions(t))

const pendingTotalText = computed(() =>
  formatRewardCenterTotal(rewardCenterStore.pendingTotalAmount)
)
const claimedTotalText = computed(() =>
  formatRewardCenterTotal(rewardCenterStore.claimedTotalAmount)
)

const listItems = computed(() =>
  props.activeTab === 'pending'
    ? rewardCenterStore.getPendingListItems(t)
    : rewardCenterStore.getClaimedListItems(t)
)

const isLoading = computed(() =>
  props.activeTab === 'pending'
    ? rewardCenterStore.pendingLoading
    : rewardCenterStore.claimedLoading && listItems.value.length === 0
)

const handleDesktopTimeChange = async (value: string) => {
  await rewardCenterStore.setClaimedFilterValues({ time: value })
}
</script>
