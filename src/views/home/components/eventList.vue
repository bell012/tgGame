<template>
  <div v-if="loading || cards.length" class="eventList">
    <div class="mt-2 flex h-8 items-center sm:mt-6">
      <template v-if="loading && !cards.length">
        <div class="h-5 w-24 rounded bg-bg-2 animate-pulse"></div>
        <div class="ml-auto h-8 w-14 rounded-lg bg-bg-2 animate-pulse"></div>
        <div v-if="!isMobile" class="ml-2 flex gap-x-1">
          <div class="size-8 rounded-lg bg-bg-2 animate-pulse"></div>
          <div class="size-8 rounded-lg bg-bg-2 animate-pulse"></div>
        </div>
      </template>

      <template v-else>
        <h2 class="flex items-center text-base font-extrabold text-primary">
          {{ $t('home.LiveSports') }}
        </h2>
        <button
          type="button"
          class="button ml-auto flex h-8 items-center gap-1 rounded-lg bg-black_alpha5 px-2 font-extrabold dark:bg-[var(--color-background-level-3)]"
          @click="goSports"
        >
          {{ $t('home.All') }}
        </button>
        <div v-if="!isMobile" class="ml-2 flex gap-x-1">
          <button
            type="button"
            :disabled="prevDisabled"
            :class="[
              'button button-icon button-second button-m size-8 !p-0 hover:opacity-80',
              prevDisabled
                ? 'bg-[var(--color-background-level-4)] cursor-not-allowed'
                : 'bg-[var(--color-button-secondary)]'
            ]"
            @click="scrollPrev"
          >
            <div class="icon size-4">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
                ></path>
              </svg>
            </div>
          </button>
          <button
            type="button"
            :disabled="nextDisabled"
            :class="[
              'button button-icon button-second button-m size-8 !p-0 hover:opacity-80',
              nextDisabled
                ? 'bg-[var(--color-background-level-4)] cursor-not-allowed'
                : 'bg-[var(--color-button-secondary)]'
            ]"
            @click="scrollNext"
          >
            <div class="icon size-4 rotate-180">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
                ></path>
              </svg>
            </div>
          </button>
        </div>
      </template>
    </div>

    <div
      v-if="loading && !cards.length"
      class="grid-col-1 mx-0 mt-3 grid grid-flow-col gap-2 overflow-hidden"
    >
      <div v-for="index in skeletonCount" :key="index" class="col-item">
        <div class="h-[174px] rounded-xl bg-bg-2 animate-pulse sm:h-[200px]"></div>
      </div>
    </div>

    <div
      v-else
      ref="listWrap"
      class="grid-col-1 hide-scroll relative mx-0 mt-3 grid snap-x snap-mandatory grid-flow-col gap-2 overflow-x-scroll overflow-y-hidden scroll-smooth"
    >
      <div v-for="card in cards" :key="card.id" class="col-item">
        <button type="button" class="match-card" @click="goSports">
          <div class="flex items-center gap-2">
            <p class="min-w-0 flex-1 truncate text-left text-sm font-extrabold" :title="card.title">
              {{ card.title }}
            </p>
            <span
              v-if="card.live"
              class="inline-flex h-6 shrink-0 items-center gap-1 rounded-md bg-secondary-4 px-2 text-xs font-extrabold text-text-4"
            >
              <PlayIcon class="size-3 fill-current" aria-hidden="true" />
              {{ $t('home.Live') }}
            </span>
          </div>

          <div class="flex min-h-0 flex-1 items-center">
            <div class="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
              <div class="flex min-w-0 flex-col items-center gap-2">
                <TeamLogo
                  :src="card.homeLogo"
                  :sport-id="card.sportId"
                  alt=""
                  class="size-[36px] sm:size-[24px]"
                />
                <span
                  class="line-clamp-2 w-full text-center text-sm font-bold"
                  :title="card.homeName"
                >
                  {{ card.homeName }}
                </span>
              </div>
              <div class="flex min-w-[72px] flex-col items-center px-1 pt-1.5">
                <span class="text-center text-[18px] font-extrabold leading-none sm:text-[24px]">
                  {{ card.score }}
                </span>
                <span
                  class="mt-[10px] block min-h-[13px] text-center text-[13px] leading-none text-text-2 sm:mt-[17px] sm:min-h-[14px] sm:text-[14px]"
                >
                  {{ card.period }}
                </span>
              </div>
              <div class="flex min-w-0 flex-col items-center gap-2">
                <TeamLogo
                  :src="card.awayLogo"
                  :sport-id="card.sportId"
                  alt=""
                  class="size-[36px] sm:size-[24px]"
                />
                <span
                  class="line-clamp-2 w-full text-center text-sm font-bold"
                  :title="card.awayName"
                >
                  {{ card.awayName }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 items-stretch gap-1">
            <span
              v-for="(odd, index) in oddsSlots(card.odds)"
              :key="odd?.key ?? index"
              class="flex h-9 min-w-0 flex-1 items-center justify-between gap-1 rounded-lg px-2 text-xs"
              :class="odd ? 'bg-secondary-1' : ''"
            >
              <template v-if="odd">
                <span class="truncate font-semibold text-text-1">{{ odd.label }}</span>
                <span v-if="odd.value" class="shrink-0 font-extrabold text-secondary-2">
                  {{ odd.value }}
                </span>
              </template>
            </span>
            <span
              class="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-text-1"
              :class="card.extraCount > 0 ? 'bg-bg-3' : ''"
            >
              <template v-if="card.extraCount > 0">+{{ card.extraCount }}</template>
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  SportEvent,
  SportHotEvent,
  SportMarketLine,
  SportWagerSelection,
  SportsLanguageCode,
  SportsOddsType
} from '@/api/interface/sport'
import TeamLogo from '@/views/sports/components/team-logo/index.vue'
import { findSportItemBySportId } from '@/views/sports/components/sports-navigation/sport-items'
import { getGamePlayingName } from '@/views/sports/shared/match'
import { formatOdds, resolveSelectionOdds } from '@/views/sports/shared/odds'
import PlayIcon from '@/static/svg/casino/play_fill.svg?component'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useLocaleStore } from '@/stores/locale'
import { isApiBusinessSuccess } from '@/utils/apiBusiness'
import { formatSportsKickoff } from '@/utils/date'
import { navigateTo } from '@/utils/router'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const HOME_SPORT_ID = 1
const HOME_MARKET = 2
const EUROPEAN_ODDS: SportsOddsType = 3
const DETAIL_BATCH_SIZE = 5
const MONEYLINE_BET_TYPE = 3
const ODDS_SLOT_COUNT = 3
const skeletonCount = 3

const languageKeys: Partial<Record<string, SportsLanguageCode>> = {
  eng: 'ENG',
  zh: 'CHS',
  vn: 'VN',
  hi: 'HI',
  pt_BR: 'PT'
}

interface CardOdds {
  key: string
  label: string
  value: string
}

interface LiveSportsCard {
  id: number
  sportId: number
  title: string
  live: boolean
  homeName: string
  awayName: string
  homeLogo: string
  awayLogo: string
  score: string
  scoreLarge: boolean
  period: string
  odds: CardOdds[]
  extraCount: number
}

const oddsSlots = (odds: CardOdds[]) =>
  Array.from({ length: ODDS_SLOT_COUNT }, (_, index) => odds[index] ?? null)

const { t, locale } = useI18n()
const localeStore = useLocaleStore()
const siteConfigStore = useSiteConfigStore()

const records = ref<SportHotEvent[]>([])
const details = ref(new Map<number, SportEvent>())
const loading = ref(true)
const listWrap = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const prevDisabled = ref(true)
const nextDisabled = ref(false)

let requestId = 0
let activeController: AbortController | undefined

const getLanguage = (): SportsLanguageCode => languageKeys[localeStore.currentLanguage] ?? 'CHS'

const getTeamLogoUrl = (id: number) => {
  if (!Number.isFinite(id) || id <= 0) return ''
  const baseUrl = siteConfigStore.getConfigString('IM.sport_team_logo').replace(/\/+$/, '')
  return baseUrl ? `${baseUrl}/${encodeURIComponent(String(id))}.png` : ''
}

const isHotEvent = (value: SportHotEvent) => {
  const teams = value?.eventList
  return (
    !!value &&
    Number.isSafeInteger(value.eventId) &&
    value.eventId > 0 &&
    Number.isSafeInteger(value.sportId) &&
    value.sportId > 0 &&
    typeof teams?.homeTeam === 'string' &&
    typeof teams?.awayTeam === 'string'
  )
}

const readScore = (value: unknown) => {
  const text =
    typeof value === 'string'
      ? value.trim()
      : typeof value === 'number' && Number.isFinite(value)
        ? String(value)
        : ''
  return /^\d+$/.test(text) ? text : ''
}

const teamName = (detailName: unknown, fallback: string) => {
  const text = typeof detailName === 'string' ? detailName.trim() : ''
  return text || fallback
}

const formatCardOdds = (odds: number | null) => {
  const text = formatOdds(odds)
  if (!text) return ''
  const numeric = Number(text)
  if (!Number.isFinite(numeric)) return text
  return numeric.toFixed(2).replace(/0$/, '')
}

const pickMoneyLine = (event: SportEvent): SportMarketLine | undefined => {
  const lines = (event.MarketLines ?? []).filter(
    line => line.BetTypeId === MONEYLINE_BET_TYPE && Array.isArray(line.WagerSelections)
  )
  return lines.find(line => line.PeriodId === 1) ?? lines[0]
}

const selectionById = (line: SportMarketLine, selectionId: number) =>
  line.WagerSelections.find(item => item.SelectionId === selectionId)

const oddsValue = (selection: SportWagerSelection | undefined) => {
  if (!selection) return ''
  return formatCardOdds(resolveSelectionOdds(selection, EUROPEAN_ODDS))
}

const extraMarketCount = (event: SportEvent) => {
  if (Number.isSafeInteger(event.TotalMarketLineCount) && event.TotalMarketLineCount > 1) {
    return event.TotalMarketLineCount - 1
  }
  const count = Array.isArray(event.MarketLines) ? event.MarketLines.length : 0
  return count > 1 ? count - 1 : 0
}

const toCard = (record: SportHotEvent, event: SportEvent | undefined): LiveSportsCard => {
  const sportName = t(
    findSportItemBySportId(record.sportId)?.i18nKey ?? 'sidebar_menu.sports.children.soccer'
  )
  const competitionName = record.competitionName?.trim() ?? ''
  const live = event?.Market === 3
  const homeScore = readScore(event?.HomeScore)
  const awayScore = readScore(event?.AwayScore)
  const hasScore = live && !!homeScore && !!awayScore
  const kickoff = formatSportsKickoff(event?.EventDate ?? record.eventDate)
  const line = event ? pickMoneyLine(event) : undefined
  const odds = line
    ? [
        { key: 'home', selectionId: 5, label: '1' },
        { key: 'draw', selectionId: 7, label: t('sportsHistory.draw') },
        { key: 'away', selectionId: 6, label: '2' }
      ].flatMap(item => {
        const value = oddsValue(selectionById(line, item.selectionId))
        return value ? [{ key: item.key, label: item.label, value }] : []
      })
    : []

  return {
    id: record.eventId,
    sportId: record.sportId,
    title: competitionName ? `${sportName} · ${competitionName}` : sportName,
    live,
    homeName: teamName(event?.HomeTeam, record.eventList.homeTeam),
    awayName: teamName(event?.AwayTeam, record.eventList.awayTeam),
    homeLogo: getTeamLogoUrl(event?.HomeTeamId || record.eventList.homeTeamId),
    awayLogo: getTeamLogoUrl(event?.AwayTeamId || record.eventList.awayTeamId),
    score: hasScore ? `${homeScore} : ${awayScore}` : kickoff === '--' ? '' : kickoff,
    scoreLarge: hasScore,
    period: live ? getGamePlayingName(record.sportId, event?.RBTime) : '',
    odds,
    extraCount: event && odds.length ? extraMarketCount(event) : 0
  }
}

const cards = computed(() =>
  records.value.map(record => toCard(record, details.value.get(record.eventId)))
)

const goSports = () => {
  void navigateTo('/sports')
}

const loadDetails = async (list: SportHotEvent[], signal: AbortSignal, id: number) => {
  const baseUrl = siteConfigStore.getConfigString('IM.im_app_url').replace(/\/+$/, '')
  if (!baseUrl) {
    details.value = new Map()
    return
  }
  const groups = new Map<number, number[]>()
  for (const item of list) {
    const ids = groups.get(item.sportId) ?? []
    if (!ids.includes(item.eventId)) ids.push(item.eventId)
    groups.set(item.sportId, ids)
  }
  const next = new Map<number, SportEvent>()
  for (const [sportId, ids] of groups) {
    for (let offset = 0; offset < ids.length; offset += DETAIL_BATCH_SIZE) {
      if (signal.aborted || id !== requestId) return
      const batch = ids.slice(offset, offset + DETAIL_BATCH_SIZE)
      try {
        const response = await Api.sport.getSelectedEventInfo(
          baseUrl,
          {
            SportId: sportId,
            EventIds: batch,
            OddsType: EUROPEAN_ODDS,
            IsCombo: false,
            IncludeGroupEvents: false,
            LanguageCode: getLanguage(),
            PeriodIds: [1]
          },
          { signal }
        )
        if (id !== requestId) return
        if ((response.stc === 100 || response.stc === '100') && Array.isArray(response.e)) {
          for (const event of response.e) {
            if (event && batch.includes(event.EventId)) next.set(event.EventId, event)
          }
        }
      } catch {
        if (signal.aborted || id !== requestId) return
      }
    }
  }
  if (id === requestId) details.value = next
}

const loadEvents = async () => {
  const id = ++requestId
  activeController?.abort()
  const controller = new AbortController()
  activeController = controller
  if (!records.value.length) loading.value = true
  try {
    const response = await Api.sport.getCompetitionList(
      { param: { sportId: HOME_SPORT_ID, market: HOME_MARKET } },
      { signal: controller.signal }
    )
    if (id !== requestId) return
    if (!isApiBusinessSuccess(response) || !Array.isArray(response.result)) {
      records.value = []
      details.value = new Map()
      return
    }
    const next = response.result.filter(isHotEvent)
    records.value = next
    if (!next.length) {
      details.value = new Map()
      return
    }
    await loadDetails(next, controller.signal, id)
  } catch {
    if (id !== requestId) return
    if (!controller.signal.aborted) {
      records.value = []
      details.value = new Map()
    }
  } finally {
    if (id === requestId) loading.value = false
  }
}

const updateButtons = () => {
  const el = listWrap.value
  if (!el) return
  const left = el.scrollLeft
  const max = el.scrollWidth - el.clientWidth
  prevDisabled.value = left <= 1
  nextDisabled.value = left >= Math.max(0, max - 1)
}

const getScrollUnit = (el: HTMLElement) => Math.round(el.clientWidth)

const scrollNext = () => {
  const el = listWrap.value
  if (!el || nextDisabled.value) return
  el.scrollBy({ left: getScrollUnit(el), behavior: 'smooth' })
  setTimeout(updateButtons, 350)
}

const scrollPrev = () => {
  const el = listWrap.value
  if (!el || prevDisabled.value) return
  el.scrollBy({ left: -getScrollUnit(el), behavior: 'smooth' })
  setTimeout(updateButtons, 350)
}

onMounted(async () => {
  isMobile.value = window.matchMedia('(max-width: 640px)').matches
  await nextTick()
  updateButtons()
  window.addEventListener('resize', updateButtons)
})

onBeforeUnmount(() => {
  requestId += 1
  activeController?.abort()
  listWrap.value?.removeEventListener('scroll', updateButtons)
  window.removeEventListener('resize', updateButtons)
})

watch(
  [locale, () => siteConfigStore.getConfigString('IM.im_app_url')],
  () => {
    void loadEvents()
  },
  { immediate: true }
)

watch(
  () => cards.value.length,
  async () => {
    await nextTick()
    updateButtons()
    const el = listWrap.value
    if (el && !el.dataset.scrollBound) {
      el.dataset.scrollBound = '1'
      el.addEventListener('scroll', updateButtons, { passive: true })
    }
  }
)
</script>

<style scoped lang="scss">
.eventList {
  .icon {
    fill: currentColor;
  }
  .button-icon {
    display: flex;
    width: 32px;
    height: 32px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
  }
}

.match-card {
  display: flex;
  width: 100%;
  height: 174px;
  box-sizing: border-box;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  background: var(--color-background-level-2);
  padding: 12px;
  color: var(--color-text-level-1);
  text-align: left;
}

@media (min-width: 640px) {
  .match-card {
    height: 200px;
  }
}

.grid-col-1 {
  --grid-gap: 0.75rem;
  --grid-column: 3;
  grid-auto-flow: column;
  gap: var(--grid-gap);
  grid-auto-columns: calc((100% - (var(--grid-column) - 1) * var(--grid-gap)) / var(--grid-column));
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  box-sizing: border-box;
  > .col-item {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
  }
}

@media (min-width: 640px) {
  .grid-col-1 {
    --grid-column: 3;
    --grid-gap: 1rem;
  }
}
@media (max-width: 639px) {
  .grid-col-1 {
    --grid-column: 1.05;
    --grid-gap: 0.5rem !important;
    grid-auto-columns: calc(
      (100% - (var(--grid-column) - 1) * var(--grid-gap)) / var(--grid-column)
    );
  }
}

.button[disabled] {
  pointer-events: none;
  opacity: 0.6;
}
</style>
