<template>
  <article
    class="relative min-h-[211px] min-w-0 cursor-pointer"
    :class="expanded && 'h-[218px]'"
    :data-sports-match="match.id"
    :data-expanded="expanded"
    data-testid="sports-pc-match-card"
    @click="goToEventDetails"
  >
    <!-- 展开后仍保留卡片原高度，避免后面的卡片移位。 -->
    <div
      class="min-h-[211px] min-w-0 rounded-xl bg-bg-5 p-3"
      :class="expanded ? 'absolute inset-x-0 top-0 z-20 shadow-xl' : 'h-full'"
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
          :aria-label="t('sports.matchCard.watchLiveVideo')"
          @click.stop="emit('media', 'video')"
        >
          <VideoIcon class="h-3 w-2.5" aria-hidden="true" />
        </button>
        <button
          v-if="match.hasAnimation"
          type="button"
          class="flex h-5 w-7 shrink-0 items-center justify-center rounded-[6px] bg-theme-primary text-text-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-1"
          :aria-label="t('sports.matchCard.watchAnimation')"
          @click.stop="emit('media', 'animation')"
        >
          <AnimationIcon class="h-3.5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary disabled:cursor-wait disabled:opacity-50"
          :class="favorite ? 'text-theme-primary' : 'text-icon-2'"
          :aria-label="
            favorite ? t('sports.matchCard.removeFavorite') : t('sports.matchCard.addFavorite')
          "
          :aria-pressed="favorite"
          :aria-busy="favoritePending"
          :disabled="favoritePending"
          @click.stop="emit('favorite')"
        >
          <StarIcon class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div class="mt-2 flex h-4 min-w-0 items-center gap-3 text-xs leading-4">
        <MatchTime :match="match" class="min-w-0 flex-1 truncate text-text-2" />
        <div
          v-if="match.cornerScore || totalScore"
          class="ml-auto flex shrink-0 items-center gap-3"
        >
          <span
            v-if="match.cornerScore"
            class="flex items-center gap-1"
            :aria-label="t('sports.matchCard.corners', { score: match.cornerScore })"
          >
            <CornerIcon class="h-4 w-4" aria-hidden="true" />
            {{ match.cornerScore }}
          </span>
          <span v-if="totalScore" class="flex items-center gap-1 text-text-2">
            <span>{{ scoreLabel }}</span>
            <span class="font-bold text-theme-primary tabular-nums">{{ totalScore }}</span>
          </span>
        </div>
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
              :aria-label="t('sports.matchCard.redCards', { count: team.redCards })"
              >{{ team.redCards }}</span
            >
            <span
              v-if="team.yellowCards != null"
              class="min-w-4 rounded bg-secondary-7 px-0.5 text-center text-common-100"
              :aria-label="t('sports.matchCard.yellowCards', { count: team.yellowCards })"
              >{{ team.yellowCards }}</span
            >
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
import { useI18n } from 'vue-i18n'
import SmartImage from '@/components/common/SmartImage.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
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
import { sportItems } from '../sports-navigation/sport-items'

const props = defineProps<{
  match: SportsMatch
  MarketLines: SportMarketLine[]
  selectedWagerSelectionId?: number
  expanded: boolean
  favorite: boolean
  favoritePending?: boolean
}>()
const { t } = useI18n()

const sportIcon = computed(
  () => sportItems.find(item => item.sportId === props.match.sportId)?.icon
)
const teams = computed(() => [
  { ...props.match.home, side: 'home' },
  { ...props.match.away, side: 'away' }
])
const totalScore = computed(() =>
  props.match.HomeScore !== '' && props.match.AwayScore !== ''
    ? `${props.match.HomeScore}-${props.match.AwayScore}`
    : ''
)
const phaseLabel = computed(() => props.match.phase.split(/\s+/, 1)[0] || '')
const scoreLabel = computed(() =>
  props.match.sportId === 1 && phaseLabel.value
    ? phaseLabel.value
    : t('sports.matchCard.totalScore')
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
