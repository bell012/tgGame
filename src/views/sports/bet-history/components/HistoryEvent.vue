<template>
  <section :class="pc ? 'relative rounded-[10px] bg-bg-3 p-2.5' : ''">
    <div v-if="!hideHeading" class="flex items-start justify-between gap-3">
      <h3 class="min-w-0 break-words text-sm font-bold leading-[17px] text-text-1">
        {{ item.matchName }}
      </h3>
      <div v-if="pc && !cashOut" class="flex h-[17px] shrink-0 items-start">
        <span class="font-pingfang text-sm font-normal leading-5" :class="item.statusClass">{{
          item.statusLabel
        }}</span>
      </div>
    </div>
    <p
      v-if="!hideHeading"
      class="break-words text-xs leading-[15px] text-text-2"
      :class="pc ? 'mt-1.5' : 'mt-2'"
    >
      {{ item.leagueName }}
    </p>
    <p v-if="showTime" class="mt-1.5 text-xs leading-[15px] text-text-2">{{ item.eventTime }}</p>
    <div :class="pc ? 'mt-3' : 'mt-3.5 rounded-lg bg-bg-4 p-3.5'">
      <p
        class="flex flex-wrap items-center gap-1.5 text-text-2"
        :class="pc ? 'text-xs leading-[15px]' : 'text-sm leading-[17px]'"
      >
        {{ item.marketName }}
        <span
          v-if="item.live"
          class="rounded bg-theme-3 px-1.5 font-normal text-theme-primary"
          :class="pc ? 'text-xs leading-[15px]' : 'text-[11px] leading-[13.333px]'"
          >{{ t('sportsHistory.live') }}</span
        >
      </p>
      <p
        class="break-words text-sm font-normal text-text-1"
        :class="pc ? 'mt-1.5 font-pingfang leading-5' : 'mt-2 leading-[17px]'"
      >
        {{ item.selectionName }} <span v-if="item.handicapText">{{ item.handicapText }}</span>
        <span class="ml-1">{{ item.oddsText }}</span>
      </p>
      <p
        v-if="!pc && (!settled || showScores)"
        class="mt-3.5 text-sm leading-[17px]"
        :class="item.statusClass"
      >
        {{ item.statusLabel }}
      </p>
      <div
        v-if="!pc && showScores"
        class="mt-3.5 space-y-3.5 border-t border-opacity-10 pt-3.5 text-xs leading-[15px] text-text-2"
      >
        <div class="flex items-start justify-between gap-3">
          <span class="shrink-0">{{ t('sportsHistory.eventTime') }}</span>
          <span class="min-w-0 break-words text-right text-text-1">{{ item.eventTime }}</span>
        </div>
        <div class="flex items-start justify-between gap-3">
          <span class="shrink-0">{{ t('sportsHistory.result') }}</span>
          <div class="flex min-w-0 flex-wrap justify-end gap-x-2 text-right text-text-1">
            <span>{{ t('sportsHistory.halfTime') }}: {{ item.halfScore }}</span
            ><span>{{ t('sportsHistory.fullTime') }}: {{ item.fullScore }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { HistorySelectionView } from '../shared'

defineProps<{
  item: HistorySelectionView
  pc?: boolean
  cashOut?: boolean
  settled?: boolean
  showTime?: boolean
  showScores?: boolean
  hideHeading?: boolean
}>()
const { t } = useI18n()
</script>
