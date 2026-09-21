<template>
  <article
    class="relative h-[218px] min-w-0"
    :data-sports-match="match.id"
    :data-expanded="expanded"
  >
    <div
      class="min-w-0 rounded-xl bg-bg-5 p-3"
      :class="expanded ? 'absolute inset-x-0 top-0 z-20 shadow-xl' : 'h-full'"
    >
      <div class="flex h-6 items-center gap-2 text-xs text-text-2">
        <component v-if="sportIcon" :is="sportIcon" class="h-6 w-6 shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 items-center gap-1">
          <template v-if="match.country">
            <span class="shrink-0" :title="match.country">{{ match.country }}</span>
            <ArrowRightIcon class="h-1.5 w-1.5 shrink-0" aria-hidden="true" />
          </template>
          <span class="truncate" :title="match.league">{{ match.league }}</span>
        </div>
        <button
          v-if="match.hasVideo"
          type="button"
          class="flex h-5 w-7 shrink-0 items-center justify-center rounded-[6px] bg-theme-primary text-text-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-1"
          aria-label="Watch live video"
          @click="emit('media', 'video')"
        >
          <VideoIcon class="h-3 w-2.5" aria-hidden="true" />
        </button>
        <button
          v-if="match.hasAnimation"
          type="button"
          class="flex h-5 w-7 shrink-0 items-center justify-center rounded-[6px] bg-theme-primary text-text-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-1"
          aria-label="Watch match animation"
          @click="emit('media', 'animation')"
        >
          <AnimationIcon class="h-3.5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
          :class="favorite ? 'text-theme-primary' : 'text-icon-2'"
          :aria-label="favorite ? 'Remove match from favorites' : 'Add match to favorites'"
          :aria-pressed="favorite"
          @click="emit('favorite')"
        >
          <StarIcon class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div class="mt-2 flex h-4 min-w-0 items-center gap-6 text-xs leading-4">
        <span class="truncate text-text-2">{{ match.live ? match.phase : match.kickoff }}</span>
        <span
          v-if="match.live && match.cornerScore"
          class="flex shrink-0 items-center gap-1"
          :aria-label="`Corners ${match.cornerScore}`"
        >
          <CornerIcon class="h-4 w-4" aria-hidden="true" />
          {{ match.cornerScore }}
        </span>
        <span
          v-if="match.live && match.halfTimeScore"
          class="shrink-0"
          :aria-label="`Half-time ${match.halfTimeScore}`"
        >
          HT {{ match.halfTimeScore }}
        </span>
      </div>
      <div class="mt-3 space-y-2">
        <div v-for="team in teams" :key="team.side" class="flex h-6 min-w-0 items-center gap-3">
          <SmartImage :src="team.badge" alt="" class="h-6 w-6 shrink-0 object-contain" />
          <span class="truncate text-sm font-bold" :title="team.name">{{ team.name }}</span>
          <span
            v-if="match.live && (team.redCards != null || team.yellowCards != null)"
            class="flex shrink-0 items-center gap-1 text-xs font-bold leading-4"
          >
            <span
              v-if="team.redCards != null"
              class="min-w-4 rounded bg-secondary-2 px-0.5 text-center text-common-100"
              :aria-label="`${team.redCards} red cards`"
              >{{ team.redCards }}</span
            >
            <span
              v-if="team.yellowCards != null"
              class="min-w-4 rounded bg-secondary-7 px-0.5 text-center text-common-100"
              :aria-label="`${team.yellowCards} yellow cards`"
              >{{ team.yellowCards }}</span
            >
          </span>
          <span
            v-if="match.live && team.score !== ''"
            class="ml-auto shrink-0 text-sm font-bold text-theme-primary tabular-nums"
          >
            {{ team.score }}
          </span>
        </div>
      </div>

      <!-- 只衔接公开事件，不另造展开按钮或重复渲染盘口。 -->
      <div class="mt-2 min-w-0" data-testid="sports-card-odds">
        <MatchOdds
          v-if="markets.length"
          :markets="markets"
          :expanded="expanded"
          @update:expanded="emit('update:expanded', $event)"
          @select="emit('select', $event)"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SmartImage from '@/components/common/SmartImage.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import StarIcon from '@/static/svg/game/detail/star1.svg?component'
import VideoIcon from '@/static/svg/sports/match-video.svg?component'
import AnimationIcon from '@/static/svg/sports/match-animation.svg?component'
import CornerIcon from '@/static/svg/sports/corner-kick.svg?component'
import MatchOdds from '../match-odds/index.vue'
import type { OddsMarket, OddsSelectPayload } from '../match-odds/types'
import type { SportsMatch } from '../../index'
import { sportItems } from '../sports-navigation/sport-items'

const props = defineProps<{
  match: SportsMatch
  markets: OddsMarket[]
  expanded: boolean
  favorite: boolean
}>()

const sportIcon = computed(
  () => sportItems.find(item => item.sportId === props.match.sportId)?.icon
)
const teams = computed(() => [
  { ...props.match.home, side: 'home', score: props.match.homeScore },
  { ...props.match.away, side: 'away', score: props.match.awayScore }
])

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  select: [payload: OddsSelectPayload]
  favorite: []
  media: [kind: 'video' | 'animation']
}>()
</script>
