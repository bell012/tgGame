<template>
  <H5MatchOdds
    v-if="isMobile"
    :MarketLines="visibleMarketLines"
    :selected-wager-selection-id="selectedWagerSelectionId"
    @select="onSelect"
  />
  <PcMatchOdds
    v-else
    :MarketLines="visibleMarketLines"
    :selected-wager-selection-id="selectedWagerSelectionId"
    :expanded="expanded"
    :show-expand="showExpand"
    @update:expanded="onExpanded"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { computed } from 'vue'
import { pickHomepageMarketLines, pickOverUnderOrFirstMarketLine } from './display'
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
const visibleMarketLines = computed(() =>
  props.picker === 'liveStrip'
    ? pickOverUnderOrFirstMarketLine(props.MarketLines)
    : pickHomepageMarketLines(props.MarketLines)
)

const onExpanded = (value: boolean) => {
  emit('update:expanded', value)
}

const onSelect = (payload: OddsSelectPayload) => {
  emit('select', payload)
}
</script>
