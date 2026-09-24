<template>
  <SportsScoreDetailsH5 v-if="isMobile" :market-lines="marketLines" />
  <SportsScoreDetailsPc v-else :market-lines="marketLines" />
</template>

<script setup lang="ts">
import type { SportMarketLine } from '@/api/interface/sport'
import { useIsMobile } from '@/composables/useMediaQuery'
import SportsScoreDetailsH5 from './h5.vue'
import SportsScoreDetailsPc from './pc.vue'

defineProps<{
  marketLines?: SportMarketLine[]
}>()

const isMobile = useIsMobile()
</script>
