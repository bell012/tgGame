<template>
  <section
    class="flex flex-col"
    :class="props.isMobile ? 'gap-[10px]' : 'w-full max-w-[1032px] gap-[24px]'"
  >
    <section v-if="props.isMobile" class="overflow-hidden rounded-[10px] bg-bg-2">
      <div class="relative flex h-[40px] items-center justify-between px-[14px]">
        <!-- 按钮块 -->
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

          <div class="flex h-[19.33px] w-[95px] items-center justify-end">
            <span class="w-[79px] text-right text-[16px] font-[700] leading-[19.33px] text-text-1">
              {{ formattedTotalCommission }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="flex w-full flex-col gap-[12px]">
      <div class="flex h-[48px] items-center">
        <CustomSelect
          class="w-[336px]"
          :model-value="props.activeDateValue"
          :options="pcSelectDateOptions"
          @update:model-value="$emit('change-date', $event as ReferralDetailsDateFilterValue)"
        />
      </div>

      <section class="flex h-[70px] items-center rounded-[12px] bg-bg-2 px-[24px]">
        <div class="flex w-full items-start justify-between py-[24px]">
          <span class="text-[14px] font-[400] leading-[20px] text-text-2">
            {{ props.totalCommissionLabel }}
          </span>

          <div class="flex h-[22px] items-center gap-[8px]">
            <span class="text-[18px] font-[700] leading-[22px] text-text-1">
              {{ formattedTotalCommission }}
            </span>
          </div>
        </div>
      </section>
    </section>

    <section
      v-if="props.claimHistoryRows.length > 0"
      class="overflow-hidden rounded-[10px] bg-bg-2"
    >
      <div class="grid h-[35px] grid-cols-[1fr_auto] items-center gap-[12px] px-[14px]">
        <div
          class="flex items-center justify-start px-[16px] text-center text-[12px] font-[400] leading-[15px] text-text-2"
        >
          {{ props.timeLabel }}
        </div>

        <div
          class="flex items-center justify-center pr-[16px] text-[14px] font-[400] leading-[20px] text-text-2"
        >
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
          <div
            class="flex items-center justify-start px-[16px] text-center text-[13px] font-[400] leading-[20px] text-text-1"
          >
            {{ row.time }}
          </div>

          <div
            class="flex items-center justify-center pr-[16px] text-[14px] font-[400] leading-[20px] text-text-1"
          >
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
import CustomSelect from '@/components/common/CustomSelect.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { getFormattedBalance } from '@/utils/locale'
import { computed } from 'vue'
import type {
  ReferralDetailsClaimHistoryRow,
  ReferralDetailsDateFilterValue,
  ReferralDetailsDateOption
} from '../shared'

interface Props {
  isMobile: boolean
  dateLabel: string
  activeDateValue: ReferralDetailsDateFilterValue
  dateOptions: ReferralDetailsDateOption[]
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
  'change-date': [value: ReferralDetailsDateFilterValue]
}>()

const formattedTotalCommission = computed(() =>
  getFormattedBalance(Number(props.totalCommission ?? 0), props.currencyCode, 2)
)
const pcSelectDateOptions = computed(() =>
  props.dateOptions.map(item => ({
    label: item.label,
    value: item.value
  }))
)
</script>
