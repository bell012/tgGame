<template>
  <div class="flex min-h-0 flex-1 flex-col bg-bg-5">
    <RedPacketSubHeader :title="t('redPacketPanel.myRedemptions')" @back="emit('back')" />

    <div class="relative flex shrink-0 flex-col gap-[16px] px-[16px] pt-[16px]">
      <div class="flex items-center gap-[8px]">
        <span class="text-[14px] font-[700] leading-[17px] text-text-1">
          {{ t('redPacketPanel.totalRedeemed') }}
        </span>
        <span class="text-[16px] font-[700] leading-[19px] text-theme-primary">
          {{ totalMoney.toFixed(2) }}
        </span>
      </div>

      <div class="flex items-center gap-[16px]">
        <button
          v-for="dropdown in dropdowns"
          :key="dropdown.key"
          type="button"
          class="flex h-[38px] min-w-0 flex-1 items-center justify-between gap-[8px] rounded-[8px] border border-opacity-10 bg-mask-20 px-[12px]"
          @click="toggleDropdown(dropdown.key)"
        >
          <span class="truncate text-[14px] leading-[20px] text-text-1">{{ dropdown.label }}</span>
          <DropdownArrow
            class="size-[24px] shrink-0 transition-transform"
            :class="openDropdown === dropdown.key ? 'rotate-180' : ''"
          />
        </button>
      </div>

      <template v-if="activeDropdown">
        <div class="fixed inset-0 z-10" @click="openDropdown = null" />
        <ul
          class="absolute top-[calc(100%+9px)] z-20 flex w-[240px] flex-col rounded-[8px] border border-opacity-5 bg-bg-5 p-[12px]"
          :class="activeDropdown.key === 'type' ? 'left-[16px]' : 'right-[16px]'"
        >
          <li v-for="option in activeDropdown.options" :key="option.value">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-[8px] p-[12px] text-[14px] leading-[20px] text-text-1"
              :class="option.selected ? 'bg-bg-3 font-[700]' : ''"
              @click="activeDropdown.select(option.value)"
            >
              <span>{{ option.label }}</span>
              <CheckOnIcon v-if="option.selected" class="size-[16px]" />
              <CheckOffIcon v-else class="size-[16px]" />
            </button>
          </li>
        </ul>
      </template>
    </div>

    <div
      ref="listRef"
      class="red-packet-scroll flex min-h-0 flex-1 flex-col gap-[8px] overflow-y-auto p-[16px]"
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

      <p
        v-if="!loading && !list.length"
        class="py-[20px] text-center text-[14px] leading-[20px] text-text-3"
      >
        <template v-if="error">
          {{ t('redPacketPanel.loadFailed') }}
          <button type="button" class="ml-[4px] text-secondary-9" @click="retry">
            {{ t('redPacketPanel.retry') }}
          </button>
        </template>
        <template v-else>{{ t('redPacketPanel.noRecords') }}</template>
      </p>

      <div ref="sentinelRef" class="h-px shrink-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RedEnvelopeItem, RedEnvelopeType } from '@/api/interface/red-envelope'
import CheckOffIcon from '@/static/svg/red-packet/check-off.svg?component'
import CheckOnIcon from '@/static/svg/red-packet/check-on.svg?component'
import DropdownArrow from '@/static/svg/red-packet/dropdown-arrow.svg?component'
import {
  MEMBER_RECORD_PERIODS,
  RED_ENVELOPE_TYPES,
  useMemberRecords,
  type MemberRecordPeriod
} from '../useMemberRecords'
import { formatFullDateTime } from '../useNow'
import RedPacketSubHeader from './RedPacketSubHeader.vue'

type DropdownKey = 'type' | 'period'

const emit = defineEmits<{ back: [] }>()

const { t } = useI18n()

const listRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const selectedType = ref<RedEnvelopeType | null>(null)
const selectedPeriod = ref<MemberRecordPeriod>('all')
const openDropdown = ref<DropdownKey | null>(null)

const { list, totalMoney, loading, error, retry } = useMemberRecords({
  filters: () => ({
    redEnvelopeType: selectedType.value ?? undefined,
    period: selectedPeriod.value
  }),
  sentinel: sentinelRef,
  root: listRef
})

const typeLabel = (type: RedEnvelopeType | null) =>
  type === null ? t('redPacketPanel.allType') : t(`redPacketPanel.type.${type}`)

const getTypeLabel = (record: RedEnvelopeItem) =>
  RED_ENVELOPE_TYPES.includes(record.redEnvelopeType)
    ? typeLabel(record.redEnvelopeType)
    : (record.redEnvelopeName ?? '')

const dropdowns = computed(() => [
  { key: 'type' as const, label: typeLabel(selectedType.value) },
  {
    key: 'period' as const,
    label:
      selectedPeriod.value === 'all'
        ? t('redPacketPanel.allTime')
        : t(`redPacketPanel.period.${selectedPeriod.value}`)
  }
])

interface DropdownPanel {
  key: DropdownKey
  options: { value: string; label: string; selected: boolean }[]
  select: (value: string) => void
}

const activeDropdown = computed<DropdownPanel | null>(() => {
  if (openDropdown.value === 'type') {
    return {
      key: 'type',
      options: [null, ...RED_ENVELOPE_TYPES].map(type => ({
        value: String(type ?? ''),
        label: typeLabel(type),
        selected: selectedType.value === type
      })),
      select: value => {
        selectedType.value = value ? (Number(value) as RedEnvelopeType) : null
        openDropdown.value = null
      }
    }
  }
  if (openDropdown.value === 'period') {
    return {
      key: 'period',
      options: MEMBER_RECORD_PERIODS.map(period => ({
        value: period,
        label: t(`redPacketPanel.period.${period}`),
        selected: selectedPeriod.value === period
      })),
      select: value => {
        selectedPeriod.value = value as MemberRecordPeriod
        openDropdown.value = null
      }
    }
  }
  return null
})

const toggleDropdown = (key: DropdownKey) => {
  openDropdown.value = openDropdown.value === key ? null : key
}
</script>

<style scoped>
.red-packet-scroll::-webkit-scrollbar {
  width: 6px;
}

.red-packet-scroll::-webkit-scrollbar-thumb {
  border-radius: 12px;
  background: var(--color-opacity-5);
}
</style>
