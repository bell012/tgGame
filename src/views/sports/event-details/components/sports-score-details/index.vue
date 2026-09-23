<template>
  <SportsScoreDetailsH5 v-if="isMobile" />
  <SportsScoreDetailsPc v-else />
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import SportsScoreDetailsH5 from './h5.vue'
import SportsScoreDetailsPc from './pc.vue'

const isMobile = useIsMobile()
</script>
