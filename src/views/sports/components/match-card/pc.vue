<template>
  <article
    class="relative min-w-0 cursor-pointer"
    :class="[
      showPeriodScores ? 'min-h-[237px]' : 'min-h-[211px]',
      expanded && (showPeriodScores ? 'h-[244px]' : 'h-[218px]')
    ]"
    :data-sports-match="match.id"
    :data-expanded="expanded"
    data-testid="sports-pc-match-card"
    @click="goToEventDetails"
  >
    <!-- 展开后仍保留卡片原高度，避免后面的卡片移位。 -->
    <div
      class="min-w-0 rounded-xl bg-bg-5 p-3"
      :class="[
        showPeriodScores ? 'min-h-[237px]' : 'min-h-[211px]',
        expanded ? 'absolute inset-x-0 top-0 z-20 shadow-xl' : 'h-full'
      ]"
    >
      <div class="flex h-6 items-center gap-2 text-xs text-text-2">
        <component
          v-if="sportIcon"
          :is="sportIcon"
          class="h-6 w-6 shrink-0 text-icon-2 [&_path]:fill-current"
          aria-hidden="true"
        />
        <div class="flex min-w-0 flex-1 items-center gap-1">
          <template v-if="match.country">
            <span class="max-w-[35%] truncate" :title="match.country">{{ match.country }}</span>
            <ArrowRightIcon
              class="h-1.5 w-1.5 shrink-0 text-icon-2 [&_path]:fill-current"
              aria-hidden="true"
            />
          </template>
          <span class="min-w-0 flex-1 truncate" :title="match.league">{{ match.league }}</span>
        </div>
        <button
          v-if="match.hasVideo"
          type="button"
          class="flex h-5 w-7 shrink-0 items-center justify-center rounded-[6px] bg-theme-primary text-text-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-1"
          aria-label="Watch live video"
          @click.stop="emit('media', 'video')"
        >
          <VideoIcon class="h-3 w-2.5" aria-hidden="true" />
        </button>
        <button
          v-if="match.hasAnimation"
          type="button"
          class="flex h-5 w-7 shrink-0 items-center justify-center rounded-[6px] bg-theme-primary text-text-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-1"
          aria-label="Watch match animation"
          @click.stop="emit('media', 'animation')"
        >
          <AnimationIcon class="h-3.5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary disabled:cursor-wait disabled:opacity-50"
          :class="favorite ? 'text-theme-primary' : 'text-icon-2'"
          :aria-label="favorite ? 'Remove match from favorites' : 'Add match to favorites'"
          :aria-pressed="favorite"
          :aria-busy="favoritePending"
          :disabled="favoritePending"
          @click.stop="emit('favorite')"
        >
          <StarIcon class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div class="mt-2 flex h-4 min-w-0 items-center gap-3 text-xs leading-4">
        <span class="min-w-0 flex-1 truncate text-text-2">
          {{ timeLabel }}
        </span>
        <div
          v-if="match.live && (match.cornerScore || match.halfTimeScore)"
          class="ml-auto flex shrink-0 items-center gap-3"
        >
          <span
            v-if="match.cornerScore"
            class="flex items-center gap-1"
            :aria-label="`Corners ${match.cornerScore}`"
          >
            <CornerIcon class="h-4 w-4" aria-hidden="true" />
            {{ match.cornerScore }}
          </span>
          <span v-if="match.halfTimeScore" :aria-label="`Half-time ${match.halfTimeScore}`">
            HT {{ match.halfTimeScore }}
          </span>
        </div>
      </div>
      <div
        v-if="showPeriodScores"
        class="mt-2.5 flex h-4 min-w-0 items-center gap-3 text-xs leading-4"
      >
        <ol
          v-if="periodScores.length"
          class="flex min-w-0 items-center gap-2"
          aria-label="Period scores"
        >
          <li
            v-for="(score, index) in periodScores"
            :key="`${match.id}-period-${index + 1}`"
            class="min-w-0 truncate"
            :class="index === periodScores.length - 1 ? 'text-theme-primary' : 'text-text-1'"
            :aria-label="`Period ${index + 1}: ${score}`"
            :title="score"
          >
            {{ score }}
          </li>
        </ol>
        <p v-if="match.totalScore" class="ml-auto flex shrink-0 items-center gap-2 text-text-2">
          Total score
          <span class="border-l border-opacity-15 pl-2 text-theme-primary">{{
            match.totalScore
          }}</span>
        </p>
      </div>
      <div class="mt-3 space-y-2">
        <div v-for="team in teams" :key="team.side" class="flex h-6 min-w-0 items-center gap-3">
          <SmartImage :src="team.badge" alt="" class="h-6 w-6 shrink-0 object-contain" />
          <span class="min-w-0 truncate text-sm font-bold" :title="team.name">{{ team.name }}</span>
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

      <div class="mt-2 min-w-0" data-testid="sports-card-odds" @click.stop>
        <MatchOdds
          v-if="MarketLines.length"
          :MarketLines="MarketLines"
          :selected-wager-selection-id="selectedWagerSelectionId"
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
import { navigateTo } from '@/utils/router'
import { persistEventDetailsMatch } from '../../shared/event-details-navigation'
import MatchOdds from '../match-odds/index.vue'
import type { OddsSelectPayload, SportMarketLine } from '../match-odds/types'
import type { SportsMatch } from '../../shared/types'
import { sportItems } from '../sports-navigation/sport-items'

const props = defineProps<{
  match: SportsMatch
  timeLabel: string
  MarketLines: SportMarketLine[]
  selectedWagerSelectionId?: number
  expanded: boolean
  favorite: boolean
  favoritePending?: boolean
}>()

const sportIcon = computed(
  () => sportItems.find(item => item.sportId === props.match.sportId)?.icon
)
const teams = computed(() => [
  { ...props.match.home, side: 'home', score: props.match.homeScore },
  { ...props.match.away, side: 'away', score: props.match.awayScore }
])
const periodScores = computed(() => props.match.periodScores ?? [])
const showPeriodScores = computed(
  () => props.match.live && (periodScores.value.length > 0 || !!props.match.totalScore)
)

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  select: [payload: OddsSelectPayload]
  favorite: []
  media: [kind: 'video' | 'animation']
}>()

const goToEventDetails = () => {
  persistEventDetailsMatch(props.match)
  navigateTo('/sports/event-details', {
    query: {
      sportId: props.match.sportId,
      eventId: props.match.EventId
    }
  })
}
</script>
