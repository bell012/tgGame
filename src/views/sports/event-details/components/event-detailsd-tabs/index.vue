<template>
  <section
    class="relative flex min-w-0 items-center gap-2"
    aria-label="Related matches"
    data-testid="event-details-tabs"
  >
    <button
      type="button"
      class="inline-flex h-[76px] w-[28px] flex-none flex-col items-center justify-center rounded-lg border-0 bg-bg-2 transition-colors lg:hover:bg-bg-3"
      :aria-expanded="isPopupOpen"
      aria-haspopup="listbox"
      aria-label="Show all related matches"
      @click="togglePopup"
    >
      <img
        class="h-3 w-3 object-contain transition-transform"
        :class="{ 'rotate-180': isPopupOpen }"
        :src="triangleIcon"
        alt=""
        draggable="false"
      />
    </button>

    <div
      ref="scrollRef"
      class="scrollbar-none flex min-w-0 flex-1 touch-pan-x items-stretch gap-2 overflow-x-auto overflow-y-hidden scroll-smooth py-0"
      :class="isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'"
      role="tablist"
      aria-label="Match tabs"
      @pointerdown="onDragStart"
      @pointermove="onDragMove"
      @pointerup="onDragEnd"
      @pointercancel="onDragEnd"
      @selectstart.prevent
    >
      <button
        v-for="item in visibleMatchItems"
        :key="item.id"
        type="button"
        role="tab"
        :data-event-tab="item.id"
        :aria-selected="activeId === item.id"
        class="inline-flex h-[76px] w-[152px] flex-none flex-col rounded-lg border-0 p-2 text-left transition-colors"
        :class="getTabClass(item.id)"
        @click="selectTab(item.id)"
      >
        <div class="flex h-4 min-w-0 items-center gap-0.5">
          <img
            class="h-4 w-4 shrink-0 object-contain"
            :src="activeId === item.id ? logoRedIcon : logoWhiteIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <img
            class="mx-[5px] h-4 w-4 shrink-0 object-contain"
            :src="activeId === item.id ? playRedIcon : playWhiteIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <span
            class="min-w-0 flex-1 truncate text-[10px] font-normal leading-4"
            :class="getStatusClass(item)"
          >
            {{ formatStatus(item) }}
          </span>
        </div>

        <div class="mt-2 space-y-1">
          <div
            v-for="team in [item.home, item.away]"
            :key="team.name"
            class="flex min-w-0 items-center gap-1.5 leading-4"
          >
            <span
              class="w-4 shrink-0 text-center text-[12px] tabular-nums"
              :class="getScoreClass(item.id)"
            >
              {{ formatScore(team.score) }}
            </span>
            <span class="min-w-0 truncate text-[12px] font-bold" :class="getTeamNameClass(item.id)">
              {{ team.name }}
            </span>
          </div>
        </div>
      </button>
    </div>

    <div
      v-if="isPopupOpen"
      class="absolute left-0 top-[calc(100%+8px)] z-30 flex max-h-[360px] w-[368px] flex-col overflow-hidden rounded-[12px] bg-bg-5 px-[24px] py-[16px] shadow-[0_6px_30px_rgba(0,0,0,0.4)]"
      role="listbox"
      aria-label="All leagues"
    >
      <label
        class="mb-[12px] flex h-[40px] flex-none items-center rounded-[32px] bg-bg-2 px-[16px] transition-colors"
      >
        <SearchIcon class="h-5 w-5 text-icon-3" />
        <input
          v-model="popupSearchKeyword"
          class="ml-[4px] min-w-0 flex-1 border-0 bg-transparent text-[14px] font-[400] text-text-1 outline-none placeholder:text-text-3"
          type="text"
          :placeholder="t('sports.leagueTabs.searchLeagueOrTeam')"
        />
      </label>

      <div
        class="min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--color-icon-level-3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[6px] [&::-webkit-scrollbar-thumb]:bg-icon-3"
      >
        <button
          v-for="item in leaguePopupList"
          :key="`popup-${item.key}`"
          type="button"
          role="option"
          :aria-selected="activeLeagueKey === item.key"
          class="flex w-full items-center border-0 bg-transparent py-[12px] text-left"
          @click="onLeaguePopupItemClick(item.key)"
        >
          <span class="mr-3 min-w-0 flex-1 truncate text-[14px] font-bold text-text-1">
            {{ item.label }}
          </span>
          <span
            class="inline-flex flex-none items-center justify-center rounded-[12px] bg-bg-3 px-[4px] py-[2px] text-[11px] font-bold text-text-1"
          >
            {{ item.count }}
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SportCompetitionGroup } from '@/api/interface/sport'
import SearchIcon from '@/static/svg/sports/liansai_tabs/search.svg?component'
import triangleIcon from '@/static/svg/sports/liansai_tabs/sanjiao.svg?url'
import { ALL_LEAGUES_KEY, buildLeagueTabs } from '@/views/sports/components/liansai_tabs/index'
import logoWhiteIcon from './icon/logo-white.svg?url'
import logoRedIcon from './icon/logo-red.svg?url'
import playWhiteIcon from './icon/play-white.svg?url'
import playRedIcon from './icon/play-red.svg?url'
import type { EventDetailTabItem } from './types'

export type { EventDetailTabItem } from './types'

const props = withDefaults(
  defineProps<{
    items?: EventDetailTabItem[]
    groups?: SportCompetitionGroup[]
    modelValue?: string
  }>(),
  {
    items: () => [],
    groups: () => [],
    modelValue: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [id: string]
  change: [id: string]
}>()

const { t } = useI18n()

const activeId = ref(props.modelValue || props.items[0]?.id || '')
const scrollRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isPopupOpen = ref(false)
const popupSearchKeyword = ref('')
const activeLeagueKey = ref(ALL_LEAGUES_KEY)

const leagueTabs = computed(() => buildLeagueTabs(props.groups, t))

const leaguePopupList = computed(() => {
  const keyword = popupSearchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return leagueTabs.value
  }
  return leagueTabs.value.filter(item => item.label.toLowerCase().includes(keyword))
})

const visibleMatchItems = computed(() => {
  if (activeLeagueKey.value === ALL_LEAGUES_KEY) {
    return props.items
  }
  const leagueId = Number(activeLeagueKey.value)
  if (!Number.isFinite(leagueId)) {
    return props.items
  }
  return props.items.filter(item => item.competitionId === leagueId)
})

let dragStartX = 0
let dragStartScrollLeft = 0
let pendingTabId = ''

const dragThreshold = 6

watch(
  () => props.modelValue,
  value => {
    if (value && value !== activeId.value) {
      activeId.value = value
    }
  }
)

watch(
  () => props.items,
  items => {
    if (!items.length) {
      activeId.value = ''
      return
    }
    if (!visibleMatchItems.value.some(item => item.id === activeId.value)) {
      const next = visibleMatchItems.value[0] ?? items[0]
      if (next) {
        selectTab(next.id)
      }
    }
  },
  { immediate: true }
)

watch(visibleMatchItems, matches => {
  if (!matches.length) {
    return
  }
  if (!matches.some(item => item.id === activeId.value)) {
    selectTab(matches[0].id)
  }
})

const formatStatus = (item: EventDetailTabItem) => item.rbTime || '—'

const formatScore = (score: number | null) => (score === null ? '-' : String(score))

const getTabClass = (id: string) =>
  activeId.value === id ? 'bg-bg-2 ring-1 ring-inset ring-opacity-10' : 'bg-bg-5 lg:hover:bg-bg-3'

const getStatusClass = (item: EventDetailTabItem) => {
  if (activeId.value === item.id) {
    return 'font-normal text-theme-primary'
  }
  return 'text-text-2'
}

const getScoreClass = (id: string) => (activeId.value === id ? 'text-text-1' : ' text-text-2')

const getTeamNameClass = (id: string) => (activeId.value === id ? 'text-text-1' : 'text-text-2')

const selectTab = (id: string) => {
  activeId.value = id
  emit('update:modelValue', id)
  emit('change', id)
}

const togglePopup = () => {
  isPopupOpen.value = !isPopupOpen.value
  if (!isPopupOpen.value) {
    popupSearchKeyword.value = ''
  }
}

const onLeaguePopupItemClick = (key: string) => {
  activeLeagueKey.value = key
  isPopupOpen.value = false
  popupSearchKeyword.value = ''
  const next = visibleMatchItems.value[0]
  if (next) {
    selectTab(next.id)
    scrollActiveTabIntoView(next.id)
  }
}

const scrollActiveTabIntoView = (id: string) => {
  const root = scrollRef.value
  if (!root) {
    return
  }
  const tab = root.querySelector<HTMLElement>(`[data-event-tab="${id}"]`)
  tab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}

const onDragStart = (event: PointerEvent) => {
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return
  }

  const element = scrollRef.value
  if (!element) {
    return
  }

  isDragging.value = true
  dragStartX = event.clientX
  dragStartScrollLeft = element.scrollLeft
  pendingTabId =
    (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-event-tab]')?.dataset
      .eventTab ?? ''
  element.setPointerCapture?.(event.pointerId)
}

const onDragMove = (event: PointerEvent) => {
  const element = scrollRef.value
  if (!isDragging.value || !element) {
    return
  }

  const distance = event.clientX - dragStartX
  if (Math.abs(distance) > dragThreshold) {
    event.preventDefault()
  }

  element.scrollLeft = dragStartScrollLeft - distance
}

const onDragEnd = (event: PointerEvent) => {
  const element = scrollRef.value
  if (element?.hasPointerCapture?.(event.pointerId)) {
    element.releasePointerCapture(event.pointerId)
  }

  const distance = event.clientX - dragStartX
  if (Math.abs(distance) <= dragThreshold && pendingTabId) {
    selectTab(pendingTabId)
  }

  isDragging.value = false
  pendingTabId = ''
}
</script>
