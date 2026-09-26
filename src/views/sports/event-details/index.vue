<template>
  <SportsNavigation
    v-if="!isMobile"
    standalone
    :selected-sport-id="selectedSportId"
    @change="onSportNavigationChange"
  />
  <div
    class="min-h-[200px] w-full min-w-0 bg-bg-1 font-inter text-text-1"
    :class="isMobile ? '' : 'px-5 pb-6'"
    :style="isMobile ? { paddingTop: `${layoutStore.TOPNAV_HEIGHT}px` } : undefined"
  >
    <template v-if="isMobile">
      <MatchHeader :model="matchHeaderModel" @back="onBack" />
      <SportsScoreDetails
        class="mt-4 pl-3.5 pb-24"
        :market-lines="scoreDetailsMarketLines"
        :selected-wager-selection-id="selectedWagerSelectionId"
        @pick="pickOdds"
      />
      <ShoppingCartFab
        :count="cartCount"
        :aria-label="t('sports.eventDetails.betSlipFab')"
        @click="openBetSlip"
      />
      <BetSlipH5 :page="betSlipPage" />
    </template>
    <template v-else>
      <EventDetailsTabs
        v-model="activeMatchId"
        class="mt-4"
        :items="eventDetailTabItems"
        :groups="eventDetailGroups"
        @change="onTabChange"
      />
      <div class="mt-4 flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <MatchDetails :event="selectedEvent" :sport-id="selectedSportId" />
          <SportsScoreDetails
            class="mt-4"
            :market-lines="scoreDetailsMarketLines"
            :odds-format="oddsFormat"
          />
        </div>
        <MatchMediaPanel />
      </div>
      <footer class="mt-10 flex flex-col items-center pb-2" data-testid="event-details-odds-footer">
        <div class="flex items-center gap-3">
          <span class="shrink-0 text-sm text-text-2">{{
            t('sports.eventDetails.oddsFormatLabel')
          }}</span>
          <div ref="oddsFormatRoot" class="relative inline-block min-w-[140px]">
            <button
              type="button"
              class="inline-flex h-9 w-full min-w-[140px] items-center justify-between gap-2 rounded-full border-0 bg-bg-5 pl-4 pr-3 text-sm text-text-1"
              :aria-expanded="isOddsFormatOpen"
              aria-haspopup="listbox"
              :aria-label="t('sports.eventDetails.oddsFormatLabel')"
              @click.stop="toggleOddsFormat"
            >
              <span>{{ selectedOddsFormatLabel }}</span>
              <ChevronIcon
                class="h-2 w-2 shrink-0 text-text-1 transition-transform"
                :class="{ 'rotate-180': isOddsFormatOpen }"
                aria-hidden="true"
              />
            </button>
            <div
              v-if="isOddsFormatOpen"
              class="absolute left-0 top-[calc(100%+8px)] z-30 max-h-[320px] w-full min-w-full overflow-y-auto rounded-xl bg-bg-5 px-4 py-3 shadow-[0_6px_30px_rgba(0,0,0,0.4)] [scrollbar-color:var(--color-icon-level-3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[6px] [&::-webkit-scrollbar-thumb]:bg-icon-3"
              role="listbox"
              :aria-label="t('sports.eventDetails.oddsFormatOptionsAria')"
            >
              <button
                v-for="option in oddsFormatOptions"
                :key="option.value"
                type="button"
                role="option"
                :aria-selected="oddsFormat === option.value"
                class="flex w-full border-0 bg-transparent py-2.5 text-left"
                @click="selectOddsFormat(option.value)"
              >
                <span
                  class="min-w-0 flex-1 truncate text-[12px] font-bold"
                  :class="oddsFormat === option.value ? 'text-theme-primary' : 'text-text-1'"
                >
                  {{ option.label }}
                </span>
              </button>
            </div>
          </div>
        </div>
        <p class="mt-6 max-w-[640px] text-center text-xs leading-relaxed text-text-3">
          {{ t('sports.eventDetails.oddsFormatDisclaimer') }}
        </p>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ChevronIcon from '@/static/svg/casino/dropdown_chevron.svg?component'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import EventDetailsTabs from './components/event-detailsd-tabs/index.vue'
import { mapEventDetailTabItems } from './components/event-detailsd-tabs/map-items'
import MatchDetails from './components/match-details/index.vue'
import MatchHeader from './components/match-header/index.vue'
import MatchMediaPanel from './components/match-media-panel/index.vue'
import SportsNavigation from '../components/sports-navigation/index.vue'
import { sportItems } from '../components/sports-navigation/sport-items'
import BetSlipH5 from '../components/bet-slip/h5.vue'
import ShoppingCartFab from './components/shopping-cart-fab/index.vue'
import SportsScoreDetails from './components/sports-score-details/index.vue'
import { useSportsStore } from '@/stores/sports'
import type { SportsMatch } from '../shared/types'
import { getTeamLogoUrl } from '../index'
import { mapEventDetailTabToMatchHeader, mapSportsMatchToMatchHeader } from './map-match-header'
import { eventToCompetitionGroup, sportsMatchToCompetitionGroups } from './map-seed-match'
import { useEventDetailsBetSlip } from './use-event-details-betslip'
import { useEventDetailsSports } from './use-event-details-sports'

const router = useRouter()
const route = useRoute()
const sportsStore = useSportsStore()
const { t } = useI18n()
const isMobile = useIsMobile()
const layoutStore = useLayoutStore()
const activeMatchId = ref('')
const targetEventId = ref('')
const selectedSportId = ref(sportItems[0]?.sportId ?? 1)
const selectedSportKey = ref(sportItems[0]?.key ?? 'football')

const readSportsMatchFromNavigation = (): SportsMatch | null => {
  const state = history.state as { sportsMatch?: SportsMatch }
  return state?.sportsMatch ?? null
}

const navigationMatch = readSportsMatchFromNavigation()

const applyRouteEventContext = () => {
  const sportId = Number(route.query.sportId)
  const eventId = route.query.eventId
  if (Number.isFinite(sportId) && sportId > 0) {
    selectedSportId.value = sportId
    const sport = sportItems.find(item => item.sportId === sportId)
    if (sport) {
      selectedSportKey.value = sport.key
    }
  }
  if (eventId != null && String(eventId).trim() !== '') {
    targetEventId.value = String(eventId)
  }
}

applyRouteEventContext()

const resolveInitialGroups = () => {
  const eventId = Number(targetEventId.value)
  if (
    navigationMatch &&
    (!targetEventId.value || String(navigationMatch.EventId) === targetEventId.value)
  ) {
    return sportsMatchToCompetitionGroups(navigationMatch)
  }
  if (Number.isFinite(eventId) && eventId > 0) {
    const cached = sportsStore.getRefreshEvent(selectedSportId.value, eventId)
    if (cached) {
      return [eventToCompetitionGroup(cached)]
    }
  }
  return []
}

const eventDetailsSports = useEventDetailsSports(selectedSportId, {
  targetEventId,
  initialGroups: resolveInitialGroups()
})
const eventDetailGroups = computed(() => eventDetailsSports.groups.value)
const eventDetailTabItems = computed(() => mapEventDetailTabItems(eventDetailGroups.value))

watch(
  eventDetailTabItems,
  items => {
    if (!items.length) {
      activeMatchId.value = ''
      return
    }
    const pendingEventId = targetEventId.value
    if (pendingEventId && items.some(item => item.id === pendingEventId)) {
      activeMatchId.value = pendingEventId
      return
    }
    if (!items.some(item => item.id === activeMatchId.value)) {
      activeMatchId.value = items[0]?.id ?? ''
    }
  },
  { immediate: true }
)

const {
  page: betSlipPage,
  cartCount,
  pickOdds,
  openBetSlip,
  getSelectedWagerSelectionId,
  currentMatchId
} = useEventDetailsBetSlip({
  groups: eventDetailsSports.groups,
  selectedSportId,
  activeMatchId
})

const selectedWagerSelectionId = computed(() =>
  currentMatchId.value ? getSelectedWagerSelectionId(currentMatchId.value) : undefined
)
const selectedEvent = computed(() =>
  eventDetailTabItems.value.find(item => item.id === activeMatchId.value)
)

const matchHeaderModel = computed(() => {
  if (selectedEvent.value) {
    return mapEventDetailTabToMatchHeader(selectedEvent.value, getTeamLogoUrl)
  }
  if (
    navigationMatch &&
    (!targetEventId.value || String(navigationMatch.EventId) === targetEventId.value)
  ) {
    return mapSportsMatchToMatchHeader(navigationMatch, getTeamLogoUrl)
  }
  return undefined
})

const scoreDetailsMarketLines = computed(
  () => selectedEvent.value?.marketLines ?? eventDetailTabItems.value[0]?.marketLines ?? []
)

type OddsFormatValue = 1 | 2 | 3 | 4 | 6

const ODDS_FORMAT_VALUES: readonly OddsFormatValue[] = [1, 2, 3, 4, 6]

const oddsFormatOptions = computed(() =>
  ODDS_FORMAT_VALUES.map(value => ({
    value,
    label: t(`sports.eventDetails.oddsFormatTypes.${value}`)
  }))
)

const oddsFormat = ref<OddsFormatValue>(1)
const isOddsFormatOpen = ref(false)
const oddsFormatRoot = ref<HTMLElement | null>(null)

const selectedOddsFormatLabel = computed(
  () => oddsFormatOptions.value.find(option => option.value === oddsFormat.value)?.label ?? ''
)

const toggleOddsFormat = () => {
  isOddsFormatOpen.value = !isOddsFormatOpen.value
}

const selectOddsFormat = (value: OddsFormatValue) => {
  oddsFormat.value = value
  isOddsFormatOpen.value = false
}

const onDocumentClick = (event: MouseEvent) => {
  if (!isOddsFormatOpen.value) {
    return
  }
  const root = oddsFormatRoot.value
  if (root && !root.contains(event.target as Node)) {
    isOddsFormatOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  eventDetailsSports.cancel()
})

const onTabChange = (id: string) => {
  activeMatchId.value = id
}

const onSportNavigationChange = (index: number, key: string) => {
  const sport = sportItems[index]
  if (!sport) {
    return
  }
  selectedSportId.value = sport.sportId
  selectedSportKey.value = key
}

const onBack = () => {
  router.back()
}
</script>
