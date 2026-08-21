<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <template v-if="isInitialLoading">
      <div class="py-8 text-center text-xs text-text-2">
        {{ t('common.loading') }}
      </div>
    </template>

    <template v-else-if="showPromoCard">
      <RewardClaimPromoCard
        class="shrink-0"
        :variant="mobile ? 'mobile' : 'desktop'"
        @deposit="$emit('deposit')"
      />
    </template>

    <template v-else>
      <RewardClaimSummaryCard
        class="shrink-0"
        :class="mobile ? 'mb-2.5' : 'mb-4'"
        :amount-text="pendingTotalText"
        :variant="mobile ? 'popup' : 'desktop-popup'"
        :claim-disabled="claimAllDisabled"
        :claim-loading="claiming"
        @claim="$emit('claim-all')"
      />

      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div v-if="pendingItems.length > 0" class="flex flex-col gap-2">
          <RewardRecordCard
            v-for="item in pendingItems"
            :key="item.id"
            :item="item"
            :claim-label="t('rewardCenter.claim')"
            :claim-disabled="claiming || !isPendingRewardClaimable(item.raw)"
            :variant="mobile ? 'popup' : 'desktop-popup'"
            compact
            hide-time
            @claim="$emit('claim-item', item.id)"
          />
        </div>
      </div>
    </template>

    <button
      type="button"
      class="flex shrink-0 items-center justify-center text-sm font-[700] text-text-1"
      :class="
        mobile
          ? 'mt-2.5 h-[34px] w-full gap-1.5 rounded-lg border border-opacity-30 bg-opacity-30'
          : 'mx-auto mt-4 h-4 gap-2 text-[13px] font-extrabold leading-none'
      "
      @click="$emit('enter-center')"
    >
      <span>{{ t('rewardCenter.popup.enterCenter') }}</span>
      <ChevronRightSmallIcon v-if="!mobile" class="h-2 w-1 shrink-0 text-icon-2" />
      <ArrowRightIcon v-else class="h-3 w-3 shrink-0 text-text-2" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import ChevronRightSmallIcon from '@/static/svg/deposit/chevron-right-small.svg?component'
import { isPendingRewardClaimable, type RewardCenterListItem } from '../shared'
import RewardClaimPromoCard from './RewardClaimPromoCard.vue'
import RewardClaimSummaryCard from './RewardClaimSummaryCard.vue'
import RewardRecordCard from './RewardRecordCard.vue'

const props = withDefaults(
  defineProps<{
    pendingItems: RewardCenterListItem[]
    pendingTotalText: string
    pendingLoading: boolean
    claimAllDisabled: boolean
    claiming: boolean
    mobile?: boolean
  }>(),
  {
    mobile: false
  }
)

defineEmits<{
  'claim-all': []
  'claim-item': [rowId: string]
  'enter-center': []
  deposit: []
}>()

const { t } = useI18n()

/** 无缓存首次打开：只显示 loading，不闪空汇总 */
const isInitialLoading = computed(() => props.pendingLoading && props.pendingItems.length === 0)
const showPromoCard = computed(() => !props.pendingLoading && props.pendingItems.length === 0)
</script>
