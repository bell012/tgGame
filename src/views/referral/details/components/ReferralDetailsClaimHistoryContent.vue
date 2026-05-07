<template>
  <section class="flex flex-col gap-[10px]">
    <section class="overflow-hidden rounded-[10px] bg-bg-2">
      <div class="relative flex h-[40px] items-center justify-between px-[14px]">
        <button
          type="button"
          class="flex items-center gap-[7px]"
          @click="$emit('open-date-picker')"
        >
          <span class="text-[16px] font-[700] leading-[19px] text-text-1">
            {{ props.dateLabel }}
          </span>

          <span
            class="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] bg-opacity-10"
          >
            <ArrowDownIcon class="h-[10px] w-[10px] text-text-2" />
          </span>
        </button>

        <span
          class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
        ></span>
      </div>

      <!-- 统计数据区域 -->
      <div class="px-[14px] py-[14px]">
        <div class="flex h-[19.33px] items-center justify-between">
          <div class="w-[102.33px] text-[12px] font-[500] leading-[18px] text-text-2">
            {{ props.totalCommissionLabel }}
          </div>

          <div class="flex h-[19.33px] w-[95px] items-center justify-end gap-[2px]">
            <img
              :src="currencyIcon"
              :alt="props.currencyCode"
              class="h-[14px] w-[14px] rounded-full object-cover"
            />
            <span class="w-[79px] text-right text-[16px] font-[700] leading-[19.33px] text-text-1">
              {{ props.totalCommission }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="props.claimHistoryRows.length > 0"
      class="overflow-hidden rounded-[10px] bg-bg-2"
    >
      <div class="grid h-[35px] grid-cols-[1fr_auto] items-center gap-[12px] px-[14px]">
        <div class="text-center text-[12px] font-[400] leading-[15px] text-text-2">
          {{ props.timeLabel }}
        </div>
        <div class="min-w-[74px] text-center text-[12px] font-[400] leading-[15px] text-text-2">
          {{ props.rewardsLabel }}
        </div>
      </div>

      <div>
        <div
          v-for="(row, index) in props.claimHistoryRows"
          :key="row.id"
          class="grid min-h-[48px] grid-cols-[1fr_auto] items-center gap-[12px] px-[14px] py-[10px]"
          :class="index % 2 === 0 ? 'bg-bg-3' : 'bg-transparent'"
        >
          <div class="text-center text-[13px] font-[400] leading-[16px] text-text-1">
            {{ row.time }}
          </div>

          <div class="min-w-[74px] text-center text-[13px] font-[400] leading-[16px] text-text-1">
            {{ row.reward }}
          </div>
        </div>
      </div>
    </section>

    <section v-else class="flex flex-col items-center pt-[84px]">
      <ThemedEmptyState
        :dark-image="props.emptyDarkImage"
        :light-image="props.emptyLightImage"
        :image-alt="props.emptyAlt"
        :message="props.emptyText"
        container-class="mt-0"
        image-class="h-[200px] w-[220px] object-contain"
        text-class="mt-[10px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { computed } from 'vue'
import type { ReferralDetailsClaimHistoryRow } from '../shared'

interface Props {
  dateLabel: string
  totalCommissionLabel: string
  totalCommission: string
  timeLabel: string
  rewardsLabel: string
  currencyCode: string
  claimHistoryRows: ReferralDetailsClaimHistoryRow[]
  emptyText: string
  emptyAlt: string
  emptyDarkImage: string
  emptyLightImage: string
}

const props = defineProps<Props>()

defineEmits<{
  'open-date-picker': []
}>()

const currencyIcon = computed(() => getCurrencyIconByCode(props.currencyCode))
</script>
