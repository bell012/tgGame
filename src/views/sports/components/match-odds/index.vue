<template>
  <H5MatchOdds
    v-if="isMobile"
    :MarketLines="visibleMarketLines"
    :selected-wager-selection-id="selectedWagerSelectionId"
    :layout="picker === 'liveStrip' ? 'strip' : 'list'"
    :HomeTeam="HomeTeam"
    :AwayTeam="AwayTeam"
    @select="onSelect"
  />
  <PcMatchOdds
    v-else
    :MarketLines="visibleMarketLines"
    :selected-wager-selection-id="selectedWagerSelectionId"
    :expanded="expanded"
    :show-expand="showExpand"
    :show-title="picker !== 'liveStrip'"
    @update:expanded="onExpanded"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { computed } from 'vue'
import {
  pickH5ListMarketLines,
  pickHomepageMarketLines,
  pickOverUnderOrFirstMarketLine
} from './display'
import H5MatchOdds from './h5.vue'
import PcMatchOdds from './pc.vue'
import type { OddsSelectPayload, SportMarketLine } from './types'

const props = withDefaults(
  defineProps<{
    MarketLines: SportMarketLine[]
    selectedWagerSelectionId?: number | string
    expanded?: boolean
    picker?: 'homepage' | 'liveStrip'
    showExpand?: boolean
    HomeTeam?: string
    AwayTeam?: string
  }>(),
  {
    expanded: true,
    picker: 'homepage',
    showExpand: true
  }
)

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  select: [payload: OddsSelectPayload]
}>()

const isMobile = useIsMobile()
const expanded = computed(() => props.expanded)
const visibleMarketLines = computed(() => {
  if (props.picker === 'liveStrip') return pickOverUnderOrFirstMarketLine(props.MarketLines)
  if (isMobile.value) return pickH5ListMarketLines(props.MarketLines)
  return pickHomepageMarketLines(props.MarketLines)
})

const onExpanded = (value: boolean) => {
  emit('update:expanded', value)
}

const onSelect = (payload: OddsSelectPayload) => {
  emit('select', payload)
}
</script>
