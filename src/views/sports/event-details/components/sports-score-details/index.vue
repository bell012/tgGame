<template>
  <SportsScoreDetailsH5
    v-if="isMobile"
    :market-lines="marketLines"
    :selected-wager-selection-id="selectedWagerSelectionId"
    @pick="emit('pick', $event)"
  />
  <SportsScoreDetailsPc v-else :market-lines="marketLines" :odds-format="oddsFormat" />
</template>

<script setup lang="ts">
import type { SportMarketLine } from '@/api/interface/sport'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { OddsSelectPayload } from '@/views/sports/components/match-odds/types'
import SportsScoreDetailsH5 from './h5.vue'
import SportsScoreDetailsPc from './pc.vue'
import type { EventDetailsOddsFormat } from './map-market-lines'

withDefaults(
  defineProps<{
    marketLines?: SportMarketLine[]
    oddsFormat?: EventDetailsOddsFormat
    selectedWagerSelectionId?: number
  }>(),
  {
    oddsFormat: 1
  }
)

const emit = defineEmits<{ pick: [payload: OddsSelectPayload] }>()

const isMobile = useIsMobile()
</script>
