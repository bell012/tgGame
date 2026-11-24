<template>
  <div class="relative flex min-h-0 flex-1 flex-col bg-bg-5">
    <RedPacketSubHeader :title="t('redPacketPanel.myRedemptions')" @back="emit('back')">
      <template #right>
        <button
          type="button"
          aria-label="filter"
          class="flex size-[30px] items-center justify-center rounded-[8px] bg-opacity-5"
          @click="showFilter = true"
        >
          <SiftIcon class="size-[14px] text-text-1" />
        </button>
      </template>
    </RedPacketSubHeader>

    <div class="relative flex shrink-0 px-[16px] pt-[16px]">
      <div class="flex items-center gap-[8px]">
        <span class="text-[14px] font-[700] leading-[17px] text-text-1">
          {{ t('redPacketPanel.totalRedeemed') }}
        </span>
        <span class="text-[16px] font-[700] leading-[19px] text-theme-primary">
          {{ totalMoney.toFixed(2) }}
        </span>
      </div>
    </div>

    <div
      ref="listRef"
      class="red-packet-scrollbar flex min-h-0 flex-1 flex-col gap-[8px] overflow-y-auto p-[16px]"
    >
      <div
        v-for="record in list"
        :key="record.orderNo ?? record.redEnvelopeId"
        class="flex items-center justify-between gap-[8px] rounded-[10px] bg-bg-2 p-[16px]"
      >
        <div class="flex min-w-0 flex-col gap-[4px]">
          <span class="truncate text-[14px] font-[700] leading-[17px] text-text-1">
            {{ getTypeLabel(record) }}
          </span>
          <span class="text-[12px] leading-[15px] text-text-3">
            {{ t('redPacketPanel.claimTime', { time: formatFullDateTime(record.updateTime) }) }}
          </span>
        </div>
        <span class="shrink-0 text-[14px] font-[700] leading-[17px] text-text-1">
          +{{ record.amount ?? 0 }}
        </span>
      </div>

      <RedPacketListStatus
        v-if="!loading && !list.length"
        class="py-[20px]"
        :error="!!error"
        :empty-text="t('redPacketPanel.noRecords')"
        @retry="retry"
      />

      <div ref="sentinelRef" class="h-px shrink-0" />
    </div>

    <FilterPopup
      v-model:visible="showFilter"
      v-model="filterValues"
      :contained="props.displayMode === 'pc'"
      :filter-groups="filterGroups"
      @apply="handleFilterApply"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RedEnvelopeItem, RedEnvelopeType } from '@/api/interface/red-envelope'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import SiftIcon from '@/static/svg/sift.svg?component'
import { getStorageLanguageCode } from '@/utils/locale'
import { formatFullDateTime, resolveRedPacketName } from '../format'
import { type RedPacketDisplayMode } from '../useRedPacketList'
import {
  MEMBER_RECORD_PERIODS,
  RED_ENVELOPE_TYPES,
  useMemberRecords,
  type MemberRecordPeriod
} from '../useMemberRecords'
import RedPacketListStatus from './RedPacketListStatus.vue'
import RedPacketSubHeader from './RedPacketSubHeader.vue'

const props = withDefaults(defineProps<{ displayMode?: RedPacketDisplayMode }>(), {
  displayMode: 'h5'
})

const emit = defineEmits<{ back: [] }>()

const { t, locale } = useI18n()

const listRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const selectedType = ref<RedEnvelopeType>(1)
const selectedPeriod = ref<MemberRecordPeriod>('all')
const showFilter = ref(false)

const filterValues = ref<Record<string, string>>({
  period: 'all',
  type: '1'
})

const { list, totalMoney, loading, error, retry } = useMemberRecords({
  filters: () => ({
    redEnvelopeType: selectedType.value,
    period: selectedPeriod.value
  }),
  sentinel: sentinelRef,
  root: listRef
})

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'period',
    title: t('redPacketPanel.filterDate'),
    columns: 3,
    options: MEMBER_RECORD_PERIODS.map(period => ({
      value: period,
      label: t(`redPacketPanel.period.${period}`)
    }))
  },
  {
    key: 'type',
    title: t('redPacketPanel.filterType'),
    columns: 2,
    options: RED_ENVELOPE_TYPES.map(type => ({
      value: String(type),
      label: t(`redPacketPanel.type.${type}`)
    }))
  }
])

const languageCode = computed(() => getStorageLanguageCode(String(locale.value)))

const getTypeLabel = (record: RedEnvelopeItem) =>
  resolveRedPacketName(record, languageCode.value, t)

const handleFilterApply = (values: Record<string, string | string[]>) => {
  const period = values.period
  const type = values.type
  if (typeof period === 'string') {
    selectedPeriod.value = period as MemberRecordPeriod
  }
  if (typeof type === 'string') {
    selectedType.value = Number(type) as RedEnvelopeType
  }
  filterValues.value = {
    period: typeof period === 'string' ? period : filterValues.value.period,
    type: typeof type === 'string' ? type : filterValues.value.type
  }
}
</script>
