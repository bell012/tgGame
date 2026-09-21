<!-- pc联赛tabs -->
<template>
  <section class="relative flex h-[40px] w-full items-center overflow-visible">
    <div class="flex h-10 flex-none items-center rounded-[18px] bg-bg-9">
      <button
        v-for="item in filterTabs"
        :key="item.key"
        type="button"
        class="inline-flex h-10 flex-none items-center justify-center rounded-[18px] border-0 px-[20px] text-[16px] font-bold transition-colors"
        :class="getFilterButtonClass(item.key)"
        @click="onFilterTabClick(item.key)"
      >
        <span class="block max-w-[150px] overflow-hidden text-ellipsis">
          {{ item.label }}
        </span>
      </button>
    </div>

    <div
      ref="scrollRef"
      class="scrollbar-none ml-[8px] flex min-w-0 flex-1 touch-pan-x items-center gap-[8px] overflow-x-auto overflow-y-hidden scroll-smooth py-0"
      :class="isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'"
      @pointerdown="onDragStart"
      @pointermove="onDragMove"
      @pointerup="onDragEnd"
      @pointercancel="onDragEnd"
      @selectstart.prevent
    >
      <button
        v-for="item in leagueTabs"
        :key="item.key"
        type="button"
        :data-league-key="item.key"
        class="inline-flex h-10 flex-none items-center justify-center rounded-[32px] border-0 px-[12px] py-[12px] text-[14px] text-text-2 transition-colors"
        :class="getLeagueButtonClass(item)"
      >
        <span class="block overflow-hidden text-ellipsis">
          {{ item.label }}
        </span>
      </button>
    </div>

    <button
      type="button"
      class="ml-[8px] inline-flex h-10 w-10 flex-[0_0_42px] items-center justify-center rounded-lg border-0 bg-bg-2 transition-colors lg:hover:bg-bg-3"
      @click="toggleLeaguePopup"
    >
      <triangleIcon class="h-3 w-3 text-icon-2" />
    </button>

    <!-- pc全部联赛弹窗 -->
    <div
      v-if="isLeaguePopupOpen"
      class="absolute right-0 top-[48px] z-30 max-h-[360px] w-[368px] overflow-y-auto rounded-[12px] bg-bg-5 px-[24px] py-[16px] shadow-[0_6px_30px_rgba(0,0,0,0.4)] [scrollbar-color:var(--color-icon-level-3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[6px] [&::-webkit-scrollbar-thumb]:bg-icon-3"
    >
      <button
        v-for="item in leaguePopupList"
        :key="item.key"
        type="button"
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
        <!-- <triangleIcon class="ml-3 h-3 w-3 text-icon-2" /> -->
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import triangleIcon from '@/static/svg/sports/liansai_tabs/sanjiao.svg?component'
import { useLiansaiTabs } from './index'
import type {
  LeagueSelectionPayload,
  LeagueTabItem,
  LiansaiFilterKey,
  LiansaiFilterPayload
} from './index'

const emit = defineEmits<{
  'filter-change': [payload: LiansaiFilterPayload]
  'league-change': [payload: LeagueSelectionPayload]
}>()

const {
  filterTabs,
  leagueTabs,
  activeFilterKey,
  activeLeagueKey,
  selectFilterKey,
  selectLeagueKey
} = useLiansaiTabs()
// PC 更多弹窗展示和横向 tab 一致的所有联赛项。
const leaguePopupList = computed(() => leagueTabs.value)
const scrollRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isLeaguePopupOpen = ref(false)

let dragStartX = 0
let dragStartScrollLeft = 0
let pendingLeagueKey = ''

const dragThreshold = 6

// 根据当前选中项返回“联赛/时间”分段按钮样式。
const getFilterButtonClass = (key: LiansaiFilterKey) =>
  activeFilterKey.value === key ? 'bg-bg-3 text-text-1' : 'bg-transparent text-text-2'

// 根据当前选中项返回联赛按钮样式，所有联赛项共用同一套选中态。
const getLeagueButtonClass = (item: LeagueTabItem) => {
  if (activeLeagueKey.value === item.key) {
    return 'bg-theme-primary text-text-4 font-[700]'
  }

  return 'bg-bg-2 text-text-2 lg:hover:bg-bg-3'
}

// 点击“联赛/时间”时切换分段选中态  emit已经暴露出去，别的组件可以接受当前选中哪个值
const onFilterTabClick = (key: LiansaiFilterKey) => {
  emit('filter-change', selectFilterKey(key))
}

// 点击联赛 tab 时切换选中项。emit已经暴露出去，别的组件可以接受当前选中哪个值
const onLeagueTabClick = (key: string) => {
  emit('league-change', selectLeagueKey(key))
}

// 点击更多按钮切换联赛弹窗，同时驱动按钮里的三角图标旋转方向。
const toggleLeaguePopup = () => {
  isLeaguePopupOpen.value = !isLeaguePopupOpen.value
}

// 点击弹窗中的全部联赛项。  emit已经暴露出去，别的组件可以接受当前选中哪个值
const onLeaguePopupItemClick = (key: string) => {
  emit('league-change', selectLeagueKey(key))
  isLeaguePopupOpen.value = false
}

// 记录鼠标按下时的位置和滚动距离，后续用于计算横向拖动偏移。
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
  pendingLeagueKey =
    (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-league-key]')?.dataset
      .leagueKey ?? ''
  element.setPointerCapture?.(event.pointerId)
}

// 鼠标按住移动时同步更新横向滚动；超过阈值后标记为拖拽行为。
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

// 结束拖拽并释放 pointer capture；位移小于阈值时按点击处理，否则只保留滑动。
const onDragEnd = (event: PointerEvent) => {
  const element = scrollRef.value
  if (element?.hasPointerCapture?.(event.pointerId)) {
    element.releasePointerCapture(event.pointerId)
  }

  const distance = event.clientX - dragStartX
  if (Math.abs(distance) <= dragThreshold && pendingLeagueKey) {
    onLeagueTabClick(pendingLeagueKey)
  }

  isDragging.value = false
  pendingLeagueKey = ''
}
</script>
