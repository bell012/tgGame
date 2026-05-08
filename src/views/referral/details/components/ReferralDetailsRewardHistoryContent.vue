<template>
  <section
    class="flex flex-col"
    :class="props.isMobile ? 'gap-[10px]' : 'w-full max-w-[1032px] gap-[24px]'"
  >
    <template v-if="props.isMobile">
      <section class="overflow-hidden rounded-[10px] bg-bg-2">
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
              <span
                class="w-[79px] text-right text-[16px] font-[700] leading-[19.33px] text-text-1"
              >
                {{ props.totalCommission }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="props.rewardHistoryRows.length > 0"
        class="overflow-hidden rounded-[10px] bg-bg-2"
      >
        <div class="grid h-[35px] grid-cols-[1fr_auto] items-center gap-[12px] px-[14px]">
          <div class="text-center text-[12px] font-[400] leading-[15px] text-text-2">
            {{ props.timeLabel }}
          </div>

          <div class="min-w-[74px] text-center text-[12px] font-[400] leading-[15px] text-text-2">
            {{ props.commissionLabel }}
          </div>
        </div>

        <div>
          <div
            v-for="(row, index) in props.rewardHistoryRows"
            :key="row.id"
            class="grid min-h-[48px] grid-cols-[1fr_auto] items-center gap-[12px] px-[14px] py-[10px]"
            :class="index % 2 === 0 ? 'bg-bg-3' : 'bg-transparent'"
          >
            <div class="text-center text-[13px] font-[400] leading-[16px] text-text-1">
              {{ row.time }}
            </div>

            <div class="min-w-[74px] text-center text-[13px] font-[400] leading-[16px] text-text-1">
              {{ row.commission }}
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
    </template>

    <template v-else>
      <section class="flex flex-col gap-[12px]">
        <CustomSelect
          class="w-[336px]"
          :model-value="props.activeDateValue"
          :options="pcSelectDateOptions"
          @update:model-value="$emit('change-date', $event as ReferralDetailsDateFilterValue)"
        />

        <section class="flex h-[70px] items-center rounded-[12px] bg-bg-2 px-[24px]">
          <div class="flex w-full items-center justify-between py-[24px]">
            <span class="text-[14px] font-[400] leading-[20px] text-text-2">
              {{ props.totalCommissionLabel }}
            </span>

            <div class="flex items-center gap-[8px]">
              <img
                :src="currencyIcon"
                :alt="props.currencyCode"
                class="h-[20px] w-[20px] rounded-full object-cover"
              />
              <span class="text-[18px] font-[700] leading-[22px] text-white">
                {{ props.totalCommission }}
              </span>
            </div>
          </div>
        </section>
      </section>

      <section
        v-if="props.rewardHistoryRows.length > 0"
        class="overflow-hidden rounded-[16px] bg-[#282C2D]"
      >
        <div class="grid h-[48px] grid-cols-2 items-center">
          <div
            class="flex items-center justify-center px-[24px] text-[14px] font-[400] leading-[20px] text-text-2"
          >
            {{ props.timeLabel }}
          </div>

          <div
            class="flex items-center justify-center px-[24px] text-[14px] font-[400] leading-[20px] text-text-2"
          >
            {{ props.commissionLabel }}
          </div>
        </div>

        <div>
          <div
            v-for="(row, index) in props.rewardHistoryRows"
            :key="row.id"
            class="grid min-h-[48px] grid-cols-2 items-center"
            :class="index % 2 === 0 ? 'h-[50px] bg-white/[0.06]' : 'h-[48px] bg-transparent'"
          >
            <div
              class="flex items-center justify-center px-[24px] text-[14px] font-[400] leading-[20px] text-white"
            >
              {{ row.time }}
            </div>

            <div
              class="flex items-center justify-center px-[24px] text-[14px] font-[400] leading-[20px] text-white"
            >
              {{ row.commission }}
            </div>
          </div>
        </div>
      </section>

      <section
        v-else
        class="flex min-h-[420px] flex-col items-center justify-center rounded-[16px] bg-[#282C2D]"
      >
        <ThemedEmptyState
          :dark-image="props.emptyDarkImage"
          :light-image="props.emptyLightImage"
          :image-alt="props.emptyAlt"
          :message="props.emptyText"
          container-class="mt-0"
          image-class="h-[200px] w-[220px] object-contain"
          text-class="mt-[12px] text-center text-[14px] font-[500] leading-[20px] text-text-1"
        />
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import CustomSelect from '@/components/common/CustomSelect.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { computed } from 'vue'
import type {
  ReferralDetailsDateFilterValue,
  ReferralDetailsDateOption,
  ReferralDetailsRewardHistoryRow
} from '../shared'

interface Props {
  isMobile: boolean
  dateLabel: string
  activeDateValue: ReferralDetailsDateFilterValue
  dateOptions: ReferralDetailsDateOption[]
  totalCommissionLabel: string
  totalCommission: string
  timeLabel: string
  commissionLabel: string
  currencyCode: string
  rewardHistoryRows: ReferralDetailsRewardHistoryRow[]
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

const currencyIcon = computed(() => getCurrencyIconByCode(props.currencyCode))
const pcSelectDateOptions = computed(() =>
  props.dateOptions.map(item => ({
    label: item.label,
    value: item.value
  }))
)
</script>
