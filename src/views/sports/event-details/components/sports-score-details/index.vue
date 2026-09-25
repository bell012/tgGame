<template>
  <SportsScoreDetailsH5 v-if="isMobile" :market-lines="marketLines" />
  <SportsScoreDetailsPc v-else :market-lines="marketLines" :odds-format="oddsFormat" />
</template>

<script setup lang="ts">
import type { SportMarketLine } from '@/api/interface/sport'
import { useIsMobile } from '@/composables/useMediaQuery'
import SportsScoreDetailsH5 from './h5.vue'
import SportsScoreDetailsPc from './pc.vue'
import type { EventDetailsOddsFormat } from './map-market-lines'

withDefaults(
  defineProps<{
    marketLines?: SportMarketLine[]
    oddsFormat?: EventDetailsOddsFormat
  }>(),
  {
    oddsFormat: 1
  }
)

const isMobile = useIsMobile()
</script>
