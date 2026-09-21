<template>
  <div
    class="sports-navigation w-full"
    :class="isMobile ? 'min-h-full bg-bg-1 pl-[14px]' : 'px-[24px] pt-4'"
    :style="pageStyle"
  >
    <SportsNavigationH5
      v-if="isMobile"
      :selected-sport-id="selectedSportId"
      :counts="sportTodayCounts"
      @change="handleSportChange"
    />
    <SportsNavigationPc
      v-else
      :selected-sport-id="selectedSportId"
      :counts="sportTodayCounts"
      @change="handleSportChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import { useSportsStore } from '@/stores/sports'

import SportsNavigationH5 from './h5.vue'
import SportsNavigationPc from './pc.vue'
import { buildSportTodayCountMap, sportItems } from './sport-items'

const emit = defineEmits<{
  change: [index: number, key: string]
}>()

const isMobile = useIsMobile()
const layoutStore = useLayoutStore()
const sportsStore = useSportsStore()
const { sportCounts, selectedSportId } = storeToRefs(sportsStore)

const sportTodayCounts = computed(() => buildSportTodayCountMap(sportCounts.value))

const pageStyle = computed(() => {
  if (!isMobile.value) {
    return undefined
  }

  return {
    paddingTop: `${layoutStore.TOPNAV_HEIGHT + 10}px`,
    paddingBottom: `12px`
  }
})

function handleSportChange(index: number, key: string) {
  const sport = sportItems[index]
  if (sport) {
    sportsStore.selectedSportId = sport.sportId
  }
  emit('change', index, key)
}
</script>
