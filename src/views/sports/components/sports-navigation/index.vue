<template>
  <div
    class="sports-navigation w-full"
    :class="isMobile ? 'min-h-full bg-bg-1 pl-[14px]' : 'px-[24px] pt-4'"
    :style="pageStyle"
  >
    <SportsNavigationH5
      v-if="isMobile"
      :selected-sport-id="resolvedSelectedSportId"
      :counts="resolvedCounts"
      @change="handleSportChange"
    />
    <SportsNavigationPc
      v-else
      :selected-sport-id="resolvedSelectedSportId"
      :counts="resolvedCounts"
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

const props = withDefaults(
  defineProps<{
    /** 独立模式：不读写全局 sportsStore，由父级通过 selectedSportId / @change 自行管理。 */
    standalone?: boolean
    selectedSportId?: number
    counts?: Partial<Record<string, number>>
  }>(),
  {
    standalone: false
  }
)

const emit = defineEmits<{
  change: [index: number, key: string]
}>()

const isMobile = useIsMobile()
const layoutStore = useLayoutStore()
const sportsStore = useSportsStore()
const { sportCounts, selectedSportId: storeSelectedSportId } = storeToRefs(sportsStore)

const sportTodayCounts = computed(() => buildSportTodayCountMap(sportCounts.value))

const resolvedSelectedSportId = computed(() =>
  props.standalone
    ? (props.selectedSportId ?? sportItems[0]?.sportId ?? 1)
    : storeSelectedSportId.value
)

const resolvedCounts = computed(() =>
  props.standalone ? (props.counts ?? {}) : sportTodayCounts.value
)

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
  if (!props.standalone && sport) {
    sportsStore.selectedSportId = sport.sportId
  }
  emit('change', index, key)
}
</script>
