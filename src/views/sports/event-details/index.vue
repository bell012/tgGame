<template>
  <div
    class="min-h-[200px] w-full min-w-0 bg-bg-1 font-inter text-text-1"
    :class="isMobile ? '' : 'px-5 py-6'"
    :style="isMobile ? { paddingTop: `${layoutStore.TOPNAV_HEIGHT}px` } : undefined"
  >
    <template v-if="isMobile">
      <MatchHeader @back="onBack" />
      <SportsScoreDetails class="mt-4 px-5 pb-6" />
    </template>
    <template v-else>
      <EventDetailsTabs v-model="activeMatchId" @change="onTabChange" />
      <div class="mt-4 flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <MatchDetails />
          <SportsScoreDetails class="mt-4" />
        </div>
        <MatchMediaPanel />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import EventDetailsTabs from './components/event-detailsd-tabs/index.vue'
import MatchDetails from './components/match-details/index.vue'
import MatchHeader from './components/match-header/index.vue'
import MatchMediaPanel from './components/match-media-panel/index.vue'
import SportsScoreDetails from './components/sports-score-details/index.vue'

const router = useRouter()
const isMobile = useIsMobile()
const layoutStore = useLayoutStore()
const activeMatchId = ref('west-ham-everton')

const onTabChange = (id: string) => {
  activeMatchId.value = id
}

const onBack = () => {
  router.back()
}
</script>
