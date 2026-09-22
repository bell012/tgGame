<template>
  <div class="min-h-[200px] w-full min-w-0 bg-bg-1 px-5 py-6 font-inter text-text-1">
    <EventDetailsTabs v-model="activeMatchId" @change="onTabChange" />
    <MatchDetails class="mt-4" />
    <SportsScoreDetails class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EventDetailsTabs from './components/event-detailsd-tabs/index.vue'
import MatchDetails from './components/match-details/index.vue'
import SportsScoreDetails from './components/sports-score-details/index.vue'

const activeMatchId = ref('west-ham-everton')

const onTabChange = (id: string) => {
  activeMatchId.value = id
}
</script>
