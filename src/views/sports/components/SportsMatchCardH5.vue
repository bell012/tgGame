<template>
  <article
    class="min-w-0 rounded-lg bg-bg-2 p-2.5 text-text-1"
    :data-sports-match="match.id"
    :data-live="match.live"
    data-testid="sports-h5-match-card"
  >
    <div class="grid min-w-0 grid-cols-[minmax(0,45fr)_minmax(0,55fr)] gap-2">
      <div class="flex min-w-0 flex-col">
        <div class="flex h-4 min-w-0 items-center gap-1.5 text-[10px] leading-4">
          <button
            type="button"
            class="flex h-5 w-4 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-theme-primary"
            :class="favorite ? 'text-theme-primary' : 'text-text-2'"
            :aria-label="favorite ? 'Remove match from favorites' : 'Add match to favorites'"
            :aria-pressed="favorite"
            data-testid="sports-h5-favorite"
            @click="emit('favorite')"
          >
            <StarIcon class="h-3 w-3 [&_path]:fill-current" aria-hidden="true" />
          </button>
          <span class="min-w-0 flex-1 truncate" :title="match.live ? match.phase : match.kickoff">
            {{ match.live ? match.phase : match.kickoff }}
          </span>
          <template v-if="match.live">
            <button
              v-if="match.sportKey === 'football'"
              type="button"
              class="flex h-[14px] w-5 shrink-0 items-center justify-center rounded bg-theme-primary text-text-4"
              aria-label="Watch live video"
              @click="emit('media', 'video')"
            >
              <VideoIcon class="h-2.5 w-2.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="flex h-[14px] w-5 shrink-0 items-center justify-center rounded bg-theme-primary text-text-4"
              aria-label="Watch match animation"
              @click="emit('media', 'animation')"
            >
              <AnimationIcon class="h-3 w-4" aria-hidden="true" />
            </button>
          </template>
        </div>

        <div class="mt-3 grid min-h-[114px] flex-1 grid-rows-2 gap-1">
          <div v-for="team in teams" :key="team.side" class="flex min-w-0 items-center gap-2">
            <span
              v-if="match.live"
              class="shrink-0 text-[13px] font-bold leading-4 text-theme-primary tabular-nums"
            >
              {{ team.score }}
            </span>
            <p class="min-w-0 break-words text-[13px] font-bold leading-4">
              {{ team.name }}
              <span
                v-if="match.sportKey === 'football' && match.live"
                class="inline-flex items-center gap-0.5 align-baseline text-[10px] leading-3"
              >
                <span
                  class="min-w-3 rounded-sm bg-secondary-2 px-px text-center text-common-100"
                  :aria-label="`${team.redCards} red cards`"
                  >{{ team.redCards }}</span
                >
                <span
                  class="min-w-3 rounded-sm bg-secondary-7 px-px text-center text-common-100"
                  :aria-label="`${team.yellowCards} yellow cards`"
                  >{{ team.yellowCards }}</span
                >
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- 盘口标题、赔率及选中效果统一使用公开组件，页面仅衔接选择事件。 -->
      <div class="min-w-0" data-testid="sports-h5-match-odds">
        <MatchOdds :markets="markets" @select="emit('select', $event)" />
      </div>
    </div>

    <div
      v-if="match.live && match.sportKey === 'football'"
      class="mt-3 flex min-h-4 items-center gap-4 text-[11px] leading-4"
    >
      <span class="flex items-center gap-1.5" :aria-label="`Corners ${match.cornerScore}`">
        <CornerIcon class="h-4 w-3" aria-hidden="true" />
        {{ match.cornerScore }}
      </span>
      <span :aria-label="`Half-time ${match.halfTimeScore}`">HT {{ match.halfTimeScore }}</span>
    </div>
    <div
      v-else-if="match.live && match.periodScores.length"
      class="mt-3 flex min-h-4 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[11px] leading-4"
    >
      <ol class="flex min-w-0 flex-wrap gap-x-2 gap-y-1" aria-label="Period scores">
        <li
          v-for="(score, index) in match.periodScores"
          :key="`${match.id}-period-${index + 1}`"
          :class="index === match.periodScores.length - 1 ? 'text-theme-primary' : 'text-text-1'"
          :aria-label="`Period ${index + 1}: ${score}`"
        >
          {{ score }}
        </li>
      </ol>
      <p class="ml-auto flex shrink-0 items-center gap-2">
        Total score
        <span class="border-l border-opacity-15 pl-2 text-theme-primary">{{
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
import MatchOdds from './match-odds/index.vue'
import type { OddsMarket, OddsSelectPayload } from './match-odds/types'
import type { H5SportsMatch } from '../h5-data'

const props = defineProps<{
  match: H5SportsMatch
  markets: OddsMarket[]
  favorite: boolean
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
</script>
