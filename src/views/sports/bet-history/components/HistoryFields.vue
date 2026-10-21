<template>
  <dl
    :class="
      pc
        ? 'space-y-2.5 text-xs leading-[15px] text-text-2'
        : 'space-y-5 rounded-lg bg-bg-4 p-3.5 text-sm leading-[17px]'
    "
  >
    <div v-for="row in rows" :key="row.key" class="flex items-start justify-between gap-3">
      <dt class="shrink-0" :class="pc ? '' : 'text-text-3'">{{ row.label }}</dt>
      <dd class="min-w-0 break-words text-right" :class="pc ? '' : 'text-text-1'">
        <span>{{ row.value }}</span>
        <span
          v-if="pc && row.key === 'result' && item.settled"
          :class="item.pcResultClass"
          class="ml-1"
          >({{ item.resultLabel }})</span
        >
        <button
          v-if="!pc && row.key === 'order'"
          type="button"
          class="ml-1 inline-flex align-middle"
          :aria-label="t('sportsHistory.copyOrder')"
          @click="copyOrder"
        >
          <CopyIcon class="h-4 w-4 text-icon-2" />
        </button>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CopyIcon from '@/static/svg/copy.svg?component'
import { globalShowToast } from '@/utils/toast'
import type { HistoryWagerView } from '../shared'

const props = defineProps<{ item: HistoryWagerView; pc?: boolean; showOdds?: boolean }>()
const { t } = useI18n()
const rows = computed(() => [
  { key: 'currency', label: t('betDetails.currency'), value: props.item.currency },
  { key: 'stake', label: t('betHistory.betAmount'), value: props.item.betAmount },
  { key: 'result', label: t('betDetails.winLoss'), value: props.item.resultAmount },
  ...(props.showOdds
    ? [{ key: 'odds', label: t('sportsHistory.totalOdds'), value: props.item.totalOdds }]
    : []),
  { key: 'order', label: t('betDetails.orderNo'), value: props.item.orderNo },
  { key: 'date', label: t('betDetails.createdAt'), value: props.item.createdAt }
])

// 仅在剪贴板写入成功后反馈成功，不将缺失的 Clipboard API 当作已复制。
const copyOrder = async () => {
  try {
    await navigator.clipboard.writeText(props.item.orderNo)
    globalShowToast(t('betDetails.copy'))
  } catch {
    globalShowToast({ type: 'fail', message: t('sportsHistory.copyFailed') })
  }
}
</script>
