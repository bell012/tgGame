<template>
  <SportsNavigation
    v-if="!isMobile"
    standalone
    :selected-sport-id="selectedSportId"
    @change="onSportNavigationChange"
  />
  <div
    class="min-h-[200px] w-full min-w-0 bg-bg-1 font-inter text-text-1"
    :class="isMobile ? '' : 'px-5 pb-6'"
    :style="isMobile ? { paddingTop: `${layoutStore.TOPNAV_HEIGHT}px` } : undefined"
  >
    <template v-if="isMobile">
      <MatchHeader @back="onBack" />
      <SportsScoreDetails class="mt-4 pl-3.5 pb-6" :market-lines="scoreDetailsMarketLines" />
    </template>
    <template v-else>
      <EventDetailsTabs
        v-model="activeMatchId"
        class="mt-4"
        :items="eventDetailTabItems"
        @change="onTabChange"
      />
      <div class="mt-4 flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <MatchDetails :event="selectedEvent" :sport-id="selectedSportId" />
          <SportsScoreDetails class="mt-4" :market-lines="scoreDetailsMarketLines" />
        </div>
        <MatchMediaPanel :live-stream-url="liveStreamUrl" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import EventDetailsTabs from './components/event-detailsd-tabs/index.vue'
import { mapEventDetailTabItems } from './components/event-detailsd-tabs/map-items'
import MatchDetails from './components/match-details/index.vue'
import MatchHeader from './components/match-header/index.vue'
import MatchMediaPanel from './components/match-media-panel/index.vue'
import SportsNavigation from '../components/sports-navigation/index.vue'
import { sportItems } from '../components/sports-navigation/sport-items'
import SportsScoreDetails from './components/sports-score-details/index.vue'
import { useEventDetailsSports } from './use-event-details-sports'

const router = useRouter()
const isMobile = useIsMobile()
const layoutStore = useLayoutStore()
const activeMatchId = ref('')
const selectedSportId = ref(sportItems[0]?.sportId ?? 1)
const selectedSportKey = ref(sportItems[0]?.key ?? 'football')

const eventDetailsSports = useEventDetailsSports(selectedSportId)
const eventDetailTabItems = computed(() => mapEventDetailTabItems(eventDetailsSports.groups.value))
const selectedEvent = computed(() =>
  eventDetailTabItems.value.find(item => item.id === activeMatchId.value)
)

const liveStreamUrl = computed(
  () => selectedEvent.value?.liveStreamUrl ?? eventDetailTabItems.value[0]?.liveStreamUrl ?? ''
)

const scoreDetailsMarketLines = computed(
  () => selectedEvent.value?.marketLines ?? eventDetailTabItems.value[0]?.marketLines ?? []
)

onUnmounted(() => {
  eventDetailsSports.cancel()
})

const onTabChange = (id: string) => {
  activeMatchId.value = id
}

const onSportNavigationChange = (index: number, key: string) => {
  const sport = sportItems[index]
  if (!sport) {
    return
  }
  selectedSportId.value = sport.sportId
  selectedSportKey.value = key
}

const onBack = () => {
  router.back()
}
</script>
