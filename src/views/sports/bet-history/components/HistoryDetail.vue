<template>
  <article class="rounded-lg bg-bg-2 p-3.5 text-text-1">
    <header class="flex items-center justify-between gap-3 border-b border-opacity-10 pb-3.5">
      <div class="flex min-w-0 items-center gap-2">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-3">
          <component
            :is="item.sportIcon"
            class="h-[30px] w-[30px] fill-current text-icon-2 [&_path]:fill-current"
          />
        </div>
        <h1 class="text-lg font-bold leading-[22px]">{{ t('betHistory.filterOptions.sports') }}</h1>
      </div>
      <span
        class="rounded-[14px] px-[15px] py-[5px] text-[13px] font-normal leading-[16px]"
        :class="item.detailStatusBadgeClass"
        >{{ item.settled ? item.resultLabel : item.statusLabel }}</span
      >
    </header>
    <p v-if="item.transactionLabel" class="mt-2 text-xs text-text-2">{{ item.transactionLabel }}</p>
    <button
      v-if="item.parlay"
      type="button"
      class="mt-3.5 flex w-full items-center gap-2 text-left"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="min-w-0 flex-1 break-words text-sm font-bold leading-[17px]"
        >{{ item.comboLabel }}
        <span
          class="ml-1 rounded bg-theme-primary px-1.5 py-0.5 text-[11px] font-normal leading-[13.333px] text-text-4"
          >{{ t('sportsHistory.comboBadge') }}</span
        ></span
      >
      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-opacity-10"
        ><CaretIcon
          class="h-4 w-4 text-icon-2 [&_path]:fill-current"
          :class="expanded ? 'rotate-180' : ''"
      /></span>
    </button>
    <div
      v-if="item.settled && item.parlay"
      class="mt-3.5 flex items-center justify-between gap-3 rounded-lg bg-bg-4 p-3.5"
      :class="item.amountClass"
    >
      <span class="text-sm font-normal leading-[17px]">{{ item.resultLabel }}</span
      ><strong class="text-base font-bold leading-5">{{ item.resultAmount }}</strong>
    </div>
    <div v-if="!item.parlay || expanded" class="mt-3.5 space-y-3.5">
      <template v-for="selection in item.selections" :key="selection.id">
        <template v-if="!item.parlay && item.settled">
          <h2 class="break-words text-sm font-bold leading-[17px]">{{ selection.matchName }}</h2>
          <p class="text-xs leading-[15px] text-text-2">{{ selection.leagueName }}</p>
          <div
            class="flex items-center justify-between gap-3 rounded-lg bg-bg-4 p-3.5"
            :class="item.amountClass"
          >
            <span class="text-sm font-normal leading-[17px]">{{ item.resultLabel }}</span
            ><strong class="text-base font-bold leading-5">{{ item.resultAmount }}</strong>
          </div>
        </template>
        <HistoryEvent
          :item="selection"
          :settled="item.settled"
          :show-time="item.parlay"
          :show-scores="item.parlay && item.settled"
          :hide-heading="!item.parlay && item.settled"
        />
      </template>
    </div>
    <HistoryFields class="mt-2.5" :item="item" :show-odds="item.parlay && expanded" />
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CaretIcon from '@/static/svg/arrow_down.svg?component'
import HistoryEvent from './HistoryEvent.vue'
import HistoryFields from './HistoryFields.vue'
import type { HistoryWagerView } from '../shared'

defineProps<{ item: HistoryWagerView }>()
const { t } = useI18n()
const expanded = ref(false)
</script>
