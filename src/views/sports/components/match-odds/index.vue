<template>
  <H5MatchOdds v-if="isMobile" :markets="markets" @select="onSelect" />
  <PcMatchOdds
    v-else
    :markets="markets"
    :expanded="expanded"
    @update:expanded="onExpanded"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { computed } from 'vue'
import H5MatchOdds from './h5.vue'
import PcMatchOdds from './pc.vue'
import type { OddsMarket, OddsSelectPayload } from './types'

const props = withDefaults(
  defineProps<{
    markets: OddsMarket[]
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

const onExpanded = (value: boolean) => {
  emit('update:expanded', value)
}

const onSelect = (payload: OddsSelectPayload) => {
  emit('select', payload)
}
</script>
