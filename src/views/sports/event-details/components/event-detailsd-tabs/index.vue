<template>
  <section
    class="relative flex min-w-0 items-stretch gap-2"
    aria-label="Related matches"
    data-testid="event-details-tabs"
  >
    <button
      type="button"
      class="inline-flex w-[28px] flex-none flex-col items-center justify-center self-stretch rounded-lg border-0 bg-bg-2 transition-colors lg:hover:bg-bg-3"
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
        v-for="item in items"
        :key="item.id"
        type="button"
        role="tab"
        :data-event-tab="item.id"
        :aria-selected="activeId === item.id"
        class="inline-flex w-[152px] flex-none flex-col rounded-lg border-0 p-2 text-left transition-colors"
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
      class="absolute left-0 top-[calc(100%+8px)] z-30 max-h-[320px] w-[280px] overflow-y-auto rounded-xl bg-bg-5 px-4 py-3 shadow-[0_6px_30px_rgba(0,0,0,0.4)] [scrollbar-color:var(--color-icon-level-3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[6px] [&::-webkit-scrollbar-thumb]:bg-icon-3"
      role="listbox"
      aria-label="All related matches"
    >
      <button
        v-for="item in items"
        :key="`popup-${item.id}`"
        type="button"
        role="option"
        :aria-selected="activeId === item.id"
        class="flex w-full border-0 bg-transparent py-2.5 text-left"
        @click="onPopupItemClick(item.id)"
      >
        <span class="min-w-0 flex-1 truncate text-[12px] font-bold text-text-1">
          {{ item.home.name }} vs {{ item.away.name }}
        </span>
        <span class="ml-2 shrink-0 text-[11px] text-text-2">{{ formatStatus(item) }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import triangleIcon from '@/static/svg/sports/liansai_tabs/sanjiao.svg?url'
import logoWhiteIcon from './icon/logo-white.svg?url'
import logoRedIcon from './icon/logo-red.svg?url'
import playWhiteIcon from './icon/play-white.svg?url'
import playRedIcon from './icon/play-red.svg?url'
import type { EventDetailTabItem } from './types'

export type { EventDetailTabItem } from './types'

const props = withDefaults(
  defineProps<{
    items?: EventDetailTabItem[]
    modelValue?: string
  }>(),
  {
    items: () => [],
    modelValue: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [id: string]
  change: [id: string]
}>()

const activeId = ref(props.modelValue || props.items[0]?.id || '')
const scrollRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isPopupOpen = ref(false)

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
    if (!items.some(item => item.id === activeId.value)) {
      selectTab(items[0].id)
    }
  },
  { immediate: true }
)

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
}

const onPopupItemClick = (id: string) => {
  selectTab(id)
  isPopupOpen.value = false
  scrollActiveTabIntoView(id)
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
