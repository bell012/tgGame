<template>
  <article
    class="min-w-0 cursor-pointer rounded-lg bg-bg-2 px-2.5 py-3 text-text-1"
    :data-sports-match="match.id"
    :data-live="match.live"
    data-testid="sports-h5-match-card"
    @click="goToEventDetails"
  >
    <div class="grid min-w-0 grid-cols-[minmax(0,430fr)_minmax(0,522fr)] gap-2.5">
      <div class="flex min-w-0 flex-col">
        <div class="flex h-[15px] min-w-0 items-center gap-2 text-[11px] leading-[15px]">
          <button
            type="button"
            class="-mx-1 flex h-5 w-5 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-theme-primary disabled:cursor-wait disabled:opacity-50"
            :class="favorite ? 'text-theme-primary' : 'text-icon-1'"
            :aria-label="
              favorite ? t('sports.matchCard.removeFavorite') : t('sports.matchCard.addFavorite')
            "
            :aria-pressed="favorite"
            :aria-busy="favoritePending"
            :disabled="favoritePending"
            data-testid="sports-h5-favorite"
            @click.stop="emit('favorite')"
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
          <MatchTime :match="match" class="min-w-0 truncate" />
          <button
            v-if="match.hasVideo"
            type="button"
            class="flex h-[15px] w-5 shrink-0 items-center justify-center rounded bg-theme-primary text-text-4"
            :aria-label="t('sports.matchCard.watchLiveVideo')"
            @click.stop="emit('media', 'video')"
          >
            <VideoIcon class="h-2 w-[7px]" aria-hidden="true" />
          </button>
          <button
            v-if="match.hasAnimation"
            type="button"
            class="flex h-[15px] w-5 shrink-0 items-center justify-center rounded bg-theme-primary text-text-4"
            :aria-label="t('sports.matchCard.watchAnimation')"
            @click.stop="emit('media', 'animation')"
          >
            <AnimationIcon class="h-2.5 w-[15px]" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-3 grid min-h-[119px] flex-1 grid-rows-2 gap-1">
          <div v-for="team in teams" :key="team.side" class="flex min-w-0 items-center gap-2">
            <span
              v-if="totalScore"
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
                  :aria-label="t('sports.matchCard.redCards', { count: team.redCards })"
                  >{{ team.redCards }}</span
                >
                <span
                  v-if="team.yellowCards != null"
                  class="min-w-3 rounded-sm bg-secondary-7 px-px text-center text-common-100"
                  :aria-label="t('sports.matchCard.yellowCards', { count: team.yellowCards })"
                  >{{ team.yellowCards }}</span
                >
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="min-w-0" data-testid="sports-h5-match-odds" @click.stop>
        <MatchOdds
          v-if="MarketLines.length"
          :MarketLines="MarketLines"
          :selected-wager-selection-id="selectedWagerSelectionId"
          @select="emit('select', $event)"
        />
      </div>
    </div>

    <div
      v-if="match.cornerScore || totalScore"
      class="mt-2.5 flex min-h-[15px] items-center gap-3.5 text-xs leading-[15px]"
    >
      <span
        v-if="match.cornerScore"
        class="flex items-center gap-1.5"
        :aria-label="t('sports.matchCard.corners', { score: match.cornerScore })"
      >
        <CornerIcon class="h-3.5 w-3.5" aria-hidden="true" />
        {{ match.cornerScore }}
      </span>
      <span
        v-if="totalScore"
        class="flex items-center gap-1 text-text-2"
        :class="match.sportId === 1 ? '' : 'ml-auto'"
      >
        <span>{{ scoreLabel }}</span>
        <span
          class="tabular-nums"
          :class="match.sportId === 1 ? 'text-text-1' : 'text-theme-primary'"
          >{{ totalScore }}</span
        >
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import StarIcon from '@/static/svg/game/detail/star1.svg?component'
import VideoIcon from '@/static/svg/sports/match-video.svg?component'
import AnimationIcon from '@/static/svg/sports/match-animation.svg?component'
import CornerIcon from '@/static/svg/sports/corner-kick.svg?component'
import { navigateTo } from '@/utils/router'
import { persistEventDetailsMatch } from '../../shared/event-details-navigation'
import MatchOdds from '../match-odds/index.vue'
import MatchTime from './time.vue'
import type { OddsSelectPayload, SportMarketLine } from '../match-odds/types'
import type { SportsMatch } from '../../shared/types'

const props = defineProps<{
  match: SportsMatch
  MarketLines: SportMarketLine[]
  selectedWagerSelectionId?: number
  favorite: boolean
  favoritePending?: boolean
}>()
const { t } = useI18n()

const emit = defineEmits<{
  select: [payload: OddsSelectPayload]
  favorite: []
  media: [kind: 'video' | 'animation']
}>()

const teams = computed(() => [
  { ...props.match.home, side: 'home', score: props.match.homeScore },
  { ...props.match.away, side: 'away', score: props.match.awayScore }
])
const totalScore = computed(() =>
  /^\d+$/.test(props.match.HomeScore) && /^\d+$/.test(props.match.AwayScore)
    ? `${props.match.HomeScore}-${props.match.AwayScore}`
    : ''
)
const scoreLabel = computed(() => {
  const phase = props.match.phase.split(/\s+/, 1)[0]
  return props.match.sportId === 1 && phase ? phase : t('sports.matchCard.totalScore')
})

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
