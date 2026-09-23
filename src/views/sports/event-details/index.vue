<template>
  <div
    class="min-h-[200px] w-full min-w-0 bg-bg-1 px-[14px] pb-[13px] font-inter text-text-1 lg:px-5 lg:py-6"
    :style="pageStyle"
  >
    <template v-if="!isMobile">
      <EventDetailsTabs v-model="activeMatchId" @change="onTabChange" />
      <MatchDetails class="mt-4" />
    </template>
    <SportsScoreDetails :class="isMobile ? '' : 'mt-4'" />
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import { computed, ref } from 'vue'
import EventDetailsTabs from './components/event-detailsd-tabs/index.vue'
import MatchDetails from './components/match-details/index.vue'
import SportsScoreDetails from './components/sports-score-details/index.vue'

const isMobile = useIsMobile()
const layoutStore = useLayoutStore()

const pageStyle = computed(() => {
  if (!isMobile.value) {
    return undefined
  }

  return {
    paddingTop: `${layoutStore.TOPNAV_HEIGHT + 13}px`
  }
})

const activeMatchId = ref('west-ham-everton')

const onTabChange = (id: string) => {
  activeMatchId.value = id
}
</script>
