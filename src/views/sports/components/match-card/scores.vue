<template>
  <div
    v-if="layout === 'pc' || match.cornerScore || scores.length || totalScore"
    class="flex min-h-[15px] min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-[15px] tabular-nums"
  >
    <span
      v-if="match.cornerScore"
      class="inline-flex shrink-0 items-center gap-1"
      :aria-label="t('sports.matchCard.corners', { score: match.cornerScore })"
    >
      <CornerIcon class="h-4 w-4" aria-hidden="true" />
      {{ match.cornerScore }}
    </span>
    <span
      v-for="item in scores"
      :key="item.key"
      class="inline-flex shrink-0 items-center gap-1"
      :class="item.active ? 'text-theme-primary' : 'text-text-1'"
      :aria-label="
        item.label
          ? t(`sports.matchCard.periods.${item.label === 'HT' ? 'firstHalf' : 'secondHalf'}`) +
            ' ' +
            item.score
          : t('sports.matchCard.periodScore', { number: Number(item.key) + 1, score: item.score })
      "
    >
      <span v-if="item.label" class="text-text-2">{{ item.label }}</span>
      <span>{{ item.score }}</span>
    </span>
    <span v-if="totalScore" class="ml-auto inline-flex shrink-0 items-center gap-3 text-text-1">
      <span :class="footballSummary && 'text-text-2'">{{ totalLabel }}</span>
      <span class="text-theme-primary" :class="footballSummary && 'font-bold'">{{
        totalScore
      }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CornerIcon from '@/static/svg/sports/corner-kick.svg?component'
import type { SportsMatch } from '../../shared/types'

const props = withDefaults(
  defineProps<{ match: SportsMatch; showPeriods?: boolean; layout?: 'pc' | 'h5' }>(),
  { showPeriods: true, layout: 'h5' }
)
const { t } = useI18n()
const footballSummary = computed(() => props.layout === 'pc' && props.match.sportId === 1)
const scores = computed(() =>
  props.showPeriods && !footballSummary.value ? (props.match.relatedScores ?? []) : []
)
const totalLabel = computed(() => {
  const period = props.match.phase.split(' ', 1)[0]
  return footballSummary.value && period && period !== '!LIVE'
    ? period
    : t('sports.matchCard.totalScore')
})
const totalScore = computed(() =>
  (props.match.sportId !== 1 || footballSummary.value) &&
  /^\d+$/.test(props.match.HomeScore) &&
  /^\d+$/.test(props.match.AwayScore)
    ? `${props.match.HomeScore}-${props.match.AwayScore}`
    : ''
)
</script>
