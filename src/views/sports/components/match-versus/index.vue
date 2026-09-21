<template>
  <div
    class="grid w-full items-end"
    :class="
      isMobile
        ? 'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-px gap-y-2'
        : 'grid-cols-[128px_minmax(0,1fr)_128px] gap-y-4'
    "
  >
    <SmartImage
      :src="homeSrc"
      :alt="homeAltText"
      :class="[
        'col-start-1 row-start-1 object-contain',
        isMobile ? 'mx-auto h-[29px] w-[29px]' : 'h-9 w-9'
      ]"
    />

    <div
      class="col-start-2 row-start-1 flex items-center justify-center font-bold"
      :class="isMobile ? 'gap-2 text-[24px] leading-none text-theme-primary' : 'gap-2'"
    >
      <span :class="scoreValueClass">{{ homeScoreText }}</span>
      <span v-if="isMobile">:</span>
      <span :class="scoreValueClass">{{ awayScoreText }}</span>
    </div>

    <SmartImage
      :src="awaySrc"
      :alt="awayAltText"
      :class="[
        'col-start-3 row-start-1 object-contain',
        isMobile ? 'mx-auto h-[29px] w-[29px]' : 'ml-auto h-9 w-9'
      ]"
    />

    <p
      class="col-start-1 row-start-2 min-w-0 break-words text-center text-text-1 line-clamp-2"
      :class="
        isMobile
          ? 'text-[12px] font-normal leading-[12px]'
          : 'text-left text-[16px] font-normal leading-5'
      "
    >
      {{ HomeTeam }}
    </p>

    <p
      v-if="isMobile && centerCaption"
      class="col-start-2 row-start-2 text-center text-[11px] font-normal leading-none text-text-2"
    >
      {{ centerCaption }}
    </p>

    <p
      class="col-start-3 row-start-2 min-w-0 break-words text-text-1 line-clamp-2"
      :class="
        isMobile
          ? 'text-center text-[12px] font-normal leading-[12px]'
          : 'text-right text-[16px] font-bold leading-5'
      "
    >
      {{ AwayTeam }}
    </p>
  </div>
</template>

<script setup lang="ts">
import SmartImage from '@/components/common/SmartImage.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { computed } from 'vue'

interface Props {
  homeSrc: string
  awaySrc: string
  HomeTeam: string
  AwayTeam: string
  HomeScore?: string | number
  AwayScore?: string | number
  HomeTeamId?: number
  AwayTeamId?: number
  homeAlt?: string
  awayAlt?: string
  centerCaption?: string
}

const props = withDefaults(defineProps<Props>(), {
  HomeScore: '',
  AwayScore: '',
  homeAlt: '',
  awayAlt: '',
  centerCaption: ''
})

const isMobile = useIsMobile()

const displayScore = (value: string | number | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'string' && value.trim()) return value.trim()
  return '—'
}

const scoreValueClass = computed(() =>
  isMobile.value
    ? ''
    : 'flex items-center justify-center rounded-[8px] bg-opacity-15 px-4 py-3 text-[16px] font-bold leading-none text-text-1'
)

const homeScoreText = computed(() => displayScore(props.HomeScore))
const awayScoreText = computed(() => displayScore(props.AwayScore))
const homeAltText = computed(() => props.homeAlt || props.HomeTeam)
const awayAltText = computed(() => props.awayAlt || props.AwayTeam)
</script>
