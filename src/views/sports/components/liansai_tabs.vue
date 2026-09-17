<!-- 联赛tabs -->
<template>
  <!-- pc -->
  <section v-if="!isMobile" class="relative flex h-[40px] w-full items-center overflow-visible">
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
      class="scrollbar-none flex min-w-0 flex-1 touch-pan-x items-center gap-[8px] overflow-x-auto overflow-y-hidden scroll-smooth py-0 pl-[8px]"
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
        class="inline-flex h-10 flex-none items-center justify-center rounded-[32px] border-0 px-[12px] py-[12px] text-[14px] transition-colors text-text-2"
        :class="getLeagueButtonClass(item)"
      >
        <img
          v-if="item.icon"
          class="mr-[4px] h-4 w-4 flex-none object-contain"
          :src="item.icon"
          alt=""
          draggable="false"
        />
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
      <img
        class="h-3 w-3 object-contain transition-transform"
        :class="{ 'rotate-180': isLeaguePopupOpen }"
        :src="triangleIcon"
        alt=""
        draggable="false"
      />
    </button>

    <!-- pc 赛事弹窗 -->
    <div
      v-if="isLeaguePopupOpen"
      class="absolute right-0 top-[48px] z-30 max-h-[360px] w-[368px] overflow-y-auto rounded-[12px] bg-bg-5 px-[24px] py-[16px] shadow-[0_6px_30px_rgba(0,0,0,0.4)] [scrollbar-color:var(--color-icon-level-3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[6px] [&::-webkit-scrollbar-thumb]:bg-icon-3"
    >
      <button
        v-for="item in leaguePopupList"
        :key="item.key"
        type="button"
        class="flex py-[12px] w-full items-center border-0 bg-transparent text-left"
        @click="onLeaguePopupItemClick(item.key)"
      >
        <img class="h-6 w-6 flex-none object-contain" :src="leagueIcon" alt="" draggable="false" />
        <span class="mx-3 truncate text-[14px] font-bold text-text-1">
          {{ item.label }}
        </span>
        <span
          class="inline-flex px-[4px] py-[2px] flex-none items-center justify-center rounded-[12px] bg-bg-3 text-[11px] font-bold text-text-1"
        >
          {{ item.count }}
        </span>
        <img
          class="ml-auto h-3 w-3 flex-none object-contain"
          :src="triangleIcon"
          alt=""
          draggable="false"
        />
      </button>
    </div>
  </section>

  <!-- H5 -->
  <section v-else class="flex h-[52px] w-full bg-bg-1">H5 联赛tabs</section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import leagueIcon from '@/static/svg/sports/liansai_tabs/icon1.svg?url'
import triangleIcon from '@/static/svg/sports/liansai_tabs/sanjiao.svg?url'

type LeagueTabItem = {
  key: string
  label: string
  icon?: string
}

type LeaguePopupItem = {
  key: string
  label: string
  count: number
}

const filterTabs: LeagueTabItem[] = [
  { key: 'league', label: '联赛' },
  { key: 'time', label: '时间' }
]

const leagueTabs: LeagueTabItem[] = [
  { key: 'all', label: '所有联赛' },
  { key: 'uefa-champions-league', label: '欧洲冠军联赛', icon: leagueIcon },
  { key: 'uefa-europa-league', label: '欧洲联赛', icon: leagueIcon },
  { key: 'copa-libertadores', label: '南美解放者杯', icon: leagueIcon },
  { key: 'premier-league', label: '英国超级联赛', icon: leagueIcon },
  { key: 'serie-a', label: '意大利甲级联赛', icon: leagueIcon },
  { key: 'la-liga', label: '西班牙甲级联赛', icon: leagueIcon },
  { key: 'bundesliga', label: '德国甲级联赛', icon: leagueIcon },
  { key: 'ligue-1', label: '法国甲级联赛', icon: leagueIcon },
  { key: 'ligue-2', label: '法国乙级联赛', icon: leagueIcon },
  { key: 'french-cup', label: '法国杯级联赛', icon: leagueIcon }
]

const leaguePopupList: LeaguePopupItem[] = [
  { key: 'international', label: '国际', count: 112 },
  { key: 'england', label: '英国', count: 112 },
  { key: 'italy', label: '意大利', count: 112 },
  { key: 'spain', label: '西班牙', count: 112 },
  { key: 'germany', label: '德国', count: 112 },
  { key: 'france', label: '法国', count: 112 },
  { key: 'netherlands', label: '荷兰', count: 112 },
  { key: 'portugal', label: '葡萄牙', count: 112 }
]

const activeFilterKey = ref('league')
const activeLeagueKey = ref('all')
const scrollRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isMobile = useIsMobile()
const isLeaguePopupOpen = ref(false)

let dragStartX = 0
let dragStartScrollLeft = 0
let pendingLeagueKey = ''

const dragThreshold = 6

// 根据当前选中项返回“联赛/时间”分段按钮样式。
const getFilterButtonClass = (key: string) =>
  activeFilterKey.value === key ? 'bg-bg-3 text-text-1' : 'bg-transparent text-text-2'

// 根据当前选中项返回联赛按钮样式，所有联赛项共用同一套选中态。
const getLeagueButtonClass = (item: LeagueTabItem) => {
  if (activeLeagueKey.value === item.key) {
    return 'bg-theme-primary text-text-4 font-[700]'
  }

  return 'bg-bg-2 text-text-2 lg:hover:bg-bg-3'
}

// 点击“联赛/时间”时切换分段选中态
const onFilterTabClick = (key: string) => {
  activeFilterKey.value = key
}

// 点击联赛 tab 时切换选中项。
const onLeagueTabClick = (key: string) => {
  activeLeagueKey.value = key
}

// 点击更多按钮切换联赛弹窗，同时驱动按钮里的三角图标旋转方向。
const toggleLeaguePopup = () => {
  isLeaguePopupOpen.value = !isLeaguePopupOpen.value
}

// 点击弹窗中的国家/地区项，先用假 key 记录选中项，并关闭弹窗。
const onLeaguePopupItemClick = (key: string) => {
  activeLeagueKey.value = key
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
