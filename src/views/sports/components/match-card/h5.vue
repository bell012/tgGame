<template>
  <article
    class="min-w-0 cursor-pointer rounded-lg bg-bg-2 px-2.5 py-3 text-text-1"
    :data-sports-match="match.id"
    :data-live="match.live"
    data-testid="sports-h5-match-card"
    @click="goToEventDetails(match)"
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
            <Loading
              v-if="favoritePending"
              type="spinner"
              size="12px"
              color="currentColor"
              aria-hidden="true"
            />
            <StarIcon
              v-else
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
          <span
            v-if="match.hasVideo"
            class="flex h-[15px] w-5 shrink-0 items-center justify-center rounded bg-theme-primary text-text-4"
            aria-hidden="true"
          >
            <VideoIcon class="h-2 w-[7px]" />
          </span>
          <span
            v-if="match.hasAnimation"
            class="flex h-[15px] w-5 shrink-0 items-center justify-center rounded bg-theme-primary text-text-4"
            aria-hidden="true"
          >
            <AnimationIcon class="h-2.5 w-[15px]" />
          </span>
        </div>

        <div class="mt-3 grid min-h-[119px] flex-1 grid-rows-2 gap-1">
          <div v-for="team in teams" :key="team.side" class="flex min-w-0 items-center gap-2">
            <span
              v-if="totalScore"
              class="shrink-0 text-sm font-bold leading-[17px] text-theme-primary tabular-nums"
            >
              {{ team.score }}
            </span>
            <p class="flex min-w-0 items-center gap-[3px] text-[13px] font-bold leading-4">
              <span class="min-w-0 break-words">{{ team.name }}</span>
              <span
                v-if="match.live && (team.redCards != null || team.yellowCards != null)"
                class="flex shrink-0 items-center gap-[3px] text-[10px] font-bold leading-3"
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

    <MatchScores :match="match" class="mt-2.5" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading } from 'vant'
import StarIcon from '@/static/svg/game/detail/star1.svg?component'
import VideoIcon from '@/static/svg/sports/match-video.svg?component'
import AnimationIcon from '@/static/svg/sports/match-animation.svg?component'
import { goToEventDetails } from '../../shared/event-details-navigation'
import MatchOdds from '../match-odds/index.vue'
import MatchTime from './time.vue'
import MatchScores from './scores.vue'
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
</script>
