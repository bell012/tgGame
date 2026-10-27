<template>
  <div class="flex min-h-[556px] flex-col rounded-xl bg-bg-2 p-[18px]">
    <div class="flex items-center gap-2">
      <button
        v-for="option in props.typeOptions"
        :key="option.value"
        type="button"
        class="h-8 min-w-[64px] rounded-full px-5 text-xs"
        :class="
          option.value === props.activeType
            ? 'bg-theme-primary font-[700] text-text-4'
            : 'font-[400] text-text-2'
        "
        @click="emit('change-type', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div
      class="mt-3 grid h-9 grid-cols-3 items-center rounded-lg bg-bg-3 px-[18px] text-xs font-[700] text-text-1"
    >
      <span>{{ t('creditLoan.records.type') }}</span>
      <span class="text-center">{{ t('creditLoan.records.time') }}</span>
      <span class="text-center">{{ t('creditLoan.records.amount') }}</span>
    </div>

    <div v-if="props.loading && props.records.length === 0" class="mt-2 flex flex-col gap-2">
      <div v-for="index in 6" :key="index" class="h-11 rounded-lg bg-bg-3 animate-pulse" />
    </div>

    <div
      v-else-if="props.records.length > 0"
      class="flex flex-col"
      :class="{ 'opacity-60': props.loading }"
    >
      <div
        v-for="record in props.records"
        :key="record.id"
        class="grid h-12 grid-cols-3 items-center px-[18px] text-xs"
      >
        <span class="truncate text-text-1">{{ record.typeLabel }}</span>
        <span class="text-center text-text-2">{{ record.timeText }}</span>
        <span class="text-center font-[700] text-text-1">{{ record.amountText }}</span>
      </div>
    </div>

    <div v-else class="flex flex-1 items-center justify-center">
      <ThemedEmptyState
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        :message="t('common.noData')"
        container-class="mt-0"
        image-class="w-[160px] h-[160px] object-contain"
        text-class="mt-2 text-xs font-[700] text-center text-text-1"
      />
    </div>

    <DesktopPagination
      class="mt-auto pt-4"
      :current-page="props.page"
      :total-pages="props.totalPages"
      @change="emit('change-page', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import type { LoanRecordFilter } from '../mock'
import type { LoanRecordDisplayItem, LoanRecordTypeOption } from './types'

const props = defineProps<{
  activeType: LoanRecordFilter
  typeOptions: LoanRecordTypeOption[]
  records: LoanRecordDisplayItem[]
  loading: boolean
  page: number
  totalPages: number
}>()

const emit = defineEmits<{
  'change-type': [value: LoanRecordFilter]
  'change-page': [value: number]
}>()

const { t } = useI18n()
</script>
