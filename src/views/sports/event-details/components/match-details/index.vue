<template>
  <section
    class="w-full min-w-0 font-inter text-text-1 h-[183px] rounded-xl bg-bg-5 p-4"
    data-testid="match-details-header"
  >
    <div class="flex min-w-0 items-center justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-2 text-xs leading-4 text-text-2">
        <img
          class="h-4 w-4 shrink-0 object-contain"
          :src="sportIcon"
          alt=""
          draggable="false"
          aria-hidden="true"
        />
        <div class="flex min-w-0 items-center gap-1">
          <span v-if="region" class="shrink-0">{{ region }}</span>
          <span v-if="region" class="shrink-0 text-text-3" aria-hidden="true">&gt;</span>
          <span class="truncate" :title="league">{{ league }}</span>
        </div>
      </div>

      <button
        type="button"
        class="flex h-4 w-4 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
        :class="favorite ? 'text-theme-primary' : 'text-icon-2'"
        :aria-label="favorite ? 'Remove match from favorites' : 'Add match to favorites'"
        :aria-pressed="favorite"
        @click="toggleFavorite"
      >
        <span class="text-base leading-none" aria-hidden="true">★</span>
      </button>
    </div>

    <div
      class="mt-4 grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3"
    >
      <div class="flex min-w-0 flex-col items-center gap-2">
        <img class="h-10 object-contain" :src="homeLogo" :alt="homeTeam.name" draggable="false" />
        <p class="w-full truncate text-center text-sm font-bold leading-5 text-text-1">
          {{ homeTeam.name }}
        </p>
        <div
          class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-normal leading-4 text-text-1"
        >
          <span class="inline-flex items-center gap-1 tabular-nums">
            <img
              class="h-3 w-3 shrink-0"
              :src="redIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            {{ homeTeam.stats.redCards }}
          </span>
          <span class="inline-flex items-center gap-1 tabular-nums">
            <img
              class="h-3 w-3 shrink-0"
              :src="yellowIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            {{ homeTeam.stats.yellowCards }}
          </span>
          <span class="inline-flex items-center gap-1 tabular-nums">
            <img
              class="h-3 w-3 shrink-0"
              :src="whiteIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            {{ homeTeam.stats.corners }}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-center justify-start gap-2 self-start px-1">
        <div v-if="isLive" class="flex items-center justify-center gap-1.5">
          <img
            class="h-4 w-4 shrink-0 object-contain"
            :src="liveIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <img
            class="h-4 w-4 shrink-0 object-contain"
            :src="playIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <span class="text-xs font-normal leading-4 text-theme-primary">{{ statusText }}</span>
        </div>
        <p v-else class="text-xs font-normal leading-4 text-text-2">{{ statusText }}</p>

        <div class="flex items-center gap-2 text-[16px] font-bold leading-none text-text-1">
          <span
            class="flex items-center justify-center rounded-lg border border-input-2 bg-input-1 w-[26px] h-[35px] tabular-nums"
          >
            {{ homeScore }}
          </span>
          <span class="text-text-2">:</span>
          <span
            class="flex items-center justify-center rounded-lg border border-input-2 bg-input-1 w-[26px] h-[35px] tabular-nums"
          >
            {{ awayScore }}
          </span>
        </div>
      </div>

      <div class="flex min-w-0 flex-col items-center gap-2">
        <img class="h-10 object-contain" :src="awayLogo" :alt="awayTeam.name" draggable="false" />
        <p class="w-full truncate text-center text-sm font-bold leading-5 text-text-1">
          {{ awayTeam.name }}
        </p>
        <div
          class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-normal leading-4 text-text-1"
        >
          <span class="inline-flex items-center gap-1 tabular-nums">
            <img
              class="h-3 w-3 shrink-0"
              :src="redIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            {{ awayTeam.stats.redCards }}
          </span>
          <span class="inline-flex items-center gap-1 tabular-nums">
            <img
              class="h-3 w-3 shrink-0"
              :src="yellowIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            {{ awayTeam.stats.yellowCards }}
          </span>
          <span class="inline-flex items-center gap-1 tabular-nums">
            <img
              class="h-3 w-3 shrink-0"
              :src="whiteIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            {{ awayTeam.stats.corners }}
          </span>
        </div>
      </div>
    </div>
    <p v-if="periodScoreLabel" class="text-[11px] font-normal leading-none text-text-2 text-center">
      {{ periodScoreLabel }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import sportIcon from './icon/basketball.svg?url'
import liveIcon from './icon/live.svg?url'
import playIcon from './icon/play.svg?url'
import redIcon from './icon/red.svg?url'
import yellowIcon from './icon/yellow.svg?url'
import whiteIcon from './icon/white.svg?url'
import defaultHomeLogo from './icon/team1.svg?url'
import defaultAwayLogo from './icon/team2.svg?url'
import { MATCH_DETAILS_MOCK } from './mock-data'

const favorite = ref(false)

const region = MATCH_DETAILS_MOCK.region
const league = MATCH_DETAILS_MOCK.league
const isLive = MATCH_DETAILS_MOCK.isLive
const homeTeam = MATCH_DETAILS_MOCK.homeTeam
const awayTeam = MATCH_DETAILS_MOCK.awayTeam
const homeScore = MATCH_DETAILS_MOCK.homeScore
const awayScore = MATCH_DETAILS_MOCK.awayScore
const statusText = MATCH_DETAILS_MOCK.statusText
const periodScoreLabel = MATCH_DETAILS_MOCK.periodScoreLabel

const toggleFavorite = () => {
  favorite.value = !favorite.value
}

const homeLogo = computed(() => homeTeam.logo || defaultHomeLogo)
const awayLogo = computed(() => awayTeam.logo || defaultAwayLogo)
</script>
