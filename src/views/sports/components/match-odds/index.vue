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
    @update:expanded="onExpanded"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { computed } from 'vue'
import { pickHomepageMarketLines } from './display'
import H5MatchOdds from './h5.vue'
import PcMatchOdds from './pc.vue'
import type { OddsSelectPayload, SportMarketLine } from './types'

const props = withDefaults(
  defineProps<{
    MarketLines: SportMarketLine[]
    selectedWagerSelectionId?: number | string
    expanded?: boolean
  }>(),
  {
    expanded: true
  }
)

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  select: [payload: OddsSelectPayload]
}>()

const isMobile = useIsMobile()
const expanded = computed(() => props.expanded)
const visibleMarketLines = computed(() => pickHomepageMarketLines(props.MarketLines))

const onExpanded = (value: boolean) => {
  emit('update:expanded', value)
}

const onSelect = (payload: OddsSelectPayload) => {
  emit('select', payload)
}
</script>
