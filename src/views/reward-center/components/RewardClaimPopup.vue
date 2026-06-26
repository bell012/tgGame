<template>
  <transition name="dropdown-fade">
    <div
      v-show="props.visible"
      ref="panelRef"
      class="reward-claim-panel z-[60] flex max-h-[50vh] min-h-0 flex-col overflow-hidden"
      :class="panelClass"
    >
      <RewardClaimPopupContent
        :pending-items="pendingItems"
        :pending-total-text="pendingTotalText"
        :pending-loading="rewardCenterStore.pendingLoading"
        :claim-all-disabled="rewardCenterStore.isClaimAllDisabled"
        :claiming="rewardCenterStore.claiming"
        :mobile="props.inline"
        @claim-all="claimAll"
        @claim-item="claimItem"
        @enter-center="handleEnterRewardCenter"
        @deposit="handleDeposit"
      />
    </div>
  </transition>

  <ClaimSuccessPopup
    v-model:visible="showClaimSuccess"
    :amount="claimSuccessAmount"
    :title="t('rewardCenter.claimSuccessTitle')"
    :desc="t('rewardCenter.claimSuccessDesc')"
    :button-text="t('rewardCenter.ok')"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ClaimSuccessPopup from '@/components/common/ClaimSuccessPopup.vue'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useRewardCenterClaim } from '@/composables/useRewardCenterClaim'
import { useRewardCenterStore } from '@/stores/rewardCenter'
import { formatRewardCenterTotal } from '@/views/reward-center/shared'
import { navigateTo } from '@/utils/router'
import RewardClaimPopupContent from './RewardClaimPopupContent.vue'

const props = withDefaults(
  defineProps<{
    visible: boolean
    inline?: boolean
  }>(),
  {
    inline: false
  }
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  deposit: []
}>()

const { t } = useI18n()
const rewardCenterStore = useRewardCenterStore()

const panelRef = ref<HTMLElement | null>(null)
const showClaimSuccess = ref(false)
const claimSuccessAmount = ref('0.00')

const pendingItems = computed(() => rewardCenterStore.getPendingListItems(t))
const pendingTotalText = computed(() =>
  formatRewardCenterTotal(rewardCenterStore.pendingTotalAmount)
)

const panelClass = computed(() =>
  props.inline
    ? 'absolute inset-x-0 top-full mx-auto w-[92.5%] rounded-xl bg-mask-60-1 p-[10px] backdrop-blur-[15px]'
    : 'absolute right-0 top-[calc(100%+8px)] w-[480px] rounded-lg bg-bg-5 px-5 py-4 shadow-[0_18px_44px_rgba(0,0,0,0.4)]'
)

const close = () => emit('update:visible', false)

usePageScrollLock(() => props.inline && props.visible)

watch(
  () => props.visible,
  visible => {
    if (!visible) {
      return
    }

    void rewardCenterStore.fetchPendingRewards()
  }
)

defineExpose({
  getPanelEl: () => panelRef.value
})

const openClaimSuccess = (amountText: string) => {
  claimSuccessAmount.value = amountText
  showClaimSuccess.value = true
}

const { claimItem, claimAll } = useRewardCenterClaim({
  onSuccess: openClaimSuccess
})

const handleEnterRewardCenter = () => {
  close()
  navigateTo('/reward-center')
}

const handleDeposit = () => {
  close()
  emit('deposit')
}
</script>

<style scoped lang="scss">
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
