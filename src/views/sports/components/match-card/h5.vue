<template>
  <article
    class="min-w-0 rounded-lg bg-bg-2 px-2.5 py-3 text-text-1"
    :data-sports-match="match.id"
    :data-live="match.live"
    data-testid="sports-h5-match-card"
  >
    <div class="grid min-w-0 grid-cols-[minmax(0,430fr)_minmax(0,522fr)] gap-2.5">
      <div class="flex min-w-0 flex-col">
        <div class="flex h-[15px] min-w-0 items-center gap-2 text-[11px] leading-[15px]">
          <button
            type="button"
            class="-mx-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-icon-1 focus-visible:outline focus-visible:outline-theme-primary disabled:cursor-wait disabled:opacity-50"
            :aria-label="favorite ? 'Remove match from favorites' : 'Add match to favorites'"
            :aria-pressed="favorite"
            :aria-busy="favoritePending"
            :disabled="favoritePending"
            data-testid="sports-h5-favorite"
            @click="emit('favorite')"
          >
            <StarIcon
              class="h-3 w-3 overflow-visible"
              :class="
                favorite
                  ? '[&_path]:fill-current'
                  : '[&_path]:fill-none [&_path]:stroke-current [&_path]:stroke-[4]'
              "
              aria-hidden="true"
            />
          </button>
          <span class="min-w-0 truncate" :title="timeLabel">
            {{ timeLabel }}
          </span>
          <button
            v-if="match.hasVideo"
            type="button"
            class="flex h-[15px] w-5 shrink-0 items-center justify-center rounded bg-theme-primary text-text-4"
            aria-label="Watch live video"
            @click="emit('media', 'video')"
          >
            <VideoIcon class="h-2 w-[7px]" aria-hidden="true" />
          </button>
          <button
            v-if="match.hasAnimation"
            type="button"
            class="flex h-[15px] w-5 shrink-0 items-center justify-center rounded bg-theme-primary text-text-4"
            aria-label="Watch match animation"
            @click="emit('media', 'animation')"
          >
            <AnimationIcon class="h-2.5 w-[15px]" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-3 grid min-h-[119px] flex-1 grid-rows-2 gap-1">
          <div v-for="team in teams" :key="team.side" class="flex min-w-0 items-center gap-2">
            <span
              v-if="match.live && team.score !== ''"
              class="shrink-0 text-sm font-bold leading-[17px] text-theme-primary tabular-nums"
            >
              {{ team.score }}
            </span>
            <p class="min-w-0 break-words text-[13px] font-bold leading-4">
              {{ team.name }}
              <span
                v-if="match.live && (team.redCards != null || team.yellowCards != null)"
                class="inline-flex items-center gap-[3px] align-baseline text-[10px] font-bold leading-3"
              >
                <span
                  v-if="team.redCards != null"
                  class="min-w-3 rounded-sm bg-secondary-2 px-px text-center text-common-100"
                  :aria-label="`${team.redCards} red cards`"
                  >{{ team.redCards }}</span
                >
                <span
                  v-if="team.yellowCards != null"
                  class="min-w-3 rounded-sm bg-secondary-7 px-px text-center text-common-100"
                  :aria-label="`${team.yellowCards} yellow cards`"
                  >{{ team.yellowCards }}</span
                >
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="min-w-0" data-testid="sports-h5-match-odds">
        <MatchOdds
          v-if="MarketLines.length"
          :MarketLines="MarketLines"
          :selected-wager-selection-id="selectedWagerSelectionId"
          @select="emit('select', $event)"
        />
      </div>
    </div>

    <div
      v-if="match.live && (match.cornerScore || match.halfTimeScore)"
      class="mt-2.5 flex min-h-[15px] items-center gap-3.5 text-xs leading-[15px]"
    >
      <span
        v-if="match.cornerScore"
        class="flex items-center gap-1.5"
        :aria-label="`Corners ${match.cornerScore}`"
      >
        <CornerIcon class="h-3.5 w-3.5" aria-hidden="true" />
        {{ match.cornerScore }}
      </span>
      <span v-if="match.halfTimeScore" :aria-label="`Half-time ${match.halfTimeScore}`">
        HT {{ match.halfTimeScore }}
      </span>
    </div>
    <div
      v-else-if="match.live && (periodScores.length || match.totalScore)"
      class="mt-2.5 flex min-h-[15px] flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs leading-[15px]"
    >
      <ol
        v-if="periodScores.length"
        class="flex min-w-0 flex-wrap items-center gap-x-[7px] gap-y-1"
        aria-label="Period scores"
      >
        <li
          v-for="(score, index) in periodScores"
          :key="`${match.id}-period-${index + 1}`"
          class="flex items-center gap-[7px]"
          :class="index === periodScores.length - 1 ? 'text-theme-primary' : 'text-text-1'"
          :aria-label="`Period ${index + 1}: ${score}`"
        >
          <span v-if="index > 0" class="h-2.5 w-px bg-opacity-10" aria-hidden="true" />
          {{ score }}
        </li>
      </ol>
      <p v-if="match.totalScore" class="ml-auto flex shrink-0 items-center gap-[7px]">
        Total score
        <span class="border-l border-opacity-15 pl-[7px] text-theme-primary">{{
          match.totalScore
        }}</span>
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StarIcon from '@/static/svg/game/detail/star1.svg?component'
import VideoIcon from '@/static/svg/sports/match-video.svg?component'
import AnimationIcon from '@/static/svg/sports/match-animation.svg?component'
import CornerIcon from '@/static/svg/sports/corner-kick.svg?component'
import MatchOdds from '../match-odds/index.vue'
import type { OddsSelectPayload, SportMarketLine } from '../match-odds/types'
import type { SportsMatch } from '../../shared/types'

const props = defineProps<{
  match: SportsMatch
  timeLabel: string
  MarketLines: SportMarketLine[]
  selectedWagerSelectionId?: number
  favorite: boolean
  favoritePending?: boolean
}>()

const emit = defineEmits<{
  select: [payload: OddsSelectPayload]
  favorite: []
  media: [kind: 'video' | 'animation']
}>()

const teams = computed(() => [
  { ...props.match.home, side: 'home', score: props.match.homeScore },
  { ...props.match.away, side: 'away', score: props.match.awayScore }
])
const periodScores = computed(() => props.match.periodScores ?? [])
</script>
