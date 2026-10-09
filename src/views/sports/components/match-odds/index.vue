<template>
  <!-- 没有可展示盘口时仅补锁盘占位，不创建可投注的盘口或选项数据。 -->
  <div
    v-if="!visibleMarketLines.length"
    class="flex"
    :class="
      isMobile && picker !== 'liveStrip'
        ? 'flex-col gap-1 pt-[27px]'
        : picker === 'liveStrip'
          ? isMobile
            ? 'gap-1'
            : 'gap-2'
          : 'gap-2 pt-6'
    "
  >
    <button
      v-for="slot in 2"
      :key="slot"
      type="button"
      disabled
      :aria-label="t('sports.betMarketClosed')"
      class="flex min-w-0 items-center justify-center bg-bg-3"
      :class="
        isMobile
          ? picker === 'liveStrip'
            ? 'h-9 flex-1 rounded-lg'
            : 'h-[58px] w-full rounded-[5px]'
          : 'h-11 flex-1 rounded-lg'
      "
    >
      <img :src="lockIcon" class="size-[18px] object-contain" alt="" draggable="false" />
    </button>
  </div>
  <H5MatchOdds
    v-else-if="isMobile"
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
import { useI18n } from 'vue-i18n'
import lockIcon from '../../event-details/components/sports-score-details/img/bold.svg?url'
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
const { t } = useI18n()
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
