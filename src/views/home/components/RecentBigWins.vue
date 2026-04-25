<template>
  <section>
    <div class="mt-2 flex h-8 items-center sm:mt-6">
      <h2 class="flex items-center text-base font-extrabold text-primary">
        <div class="relative mr-2 h-2 w-2">
          <div class="absolute left-0 top-0 z-10 h-full w-full rounded-full bg-success"></div>
          <div
            class="absolute left-0 top-0 h-full w-full rounded-full bg-success animate-ping"
          ></div>
        </div>
        <div>{{ $t('home.RecentBigWins') }}</div>
      </h2>
    </div>

    <div
      v-if="loading"
      class="mx-[-1rem] my-0 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:rounded-xl sm:bg-layer3 sm:px-3"
    >
      <div
        v-for="index in skeletonCount"
        :key="index"
        class="flex h-28 w-14 flex-none flex-col items-center sm:h-[106px] sm:w-13"
      >
        <div class="mb-1 w-full rounded-lg bg-bg-2 pt-[133%] animate-pulse"></div>
        <div class="w-[118%] space-y-1">
          <div class="mx-auto h-3 w-10 rounded bg-bg-2 animate-pulse"></div>
          <div class="mx-auto h-3 w-12 rounded bg-bg-2 animate-pulse"></div>
        </div>
      </div>
    </div>

    <div
      v-else
      ref="marqueeRef"
      class="marquee mx-[-1rem] my-0 max-w-full touch-pan-x select-none px-4 sm:mx-0 sm:rounded-xl sm:bg-layer3 sm:px-3 sm:cursor-grab sm:active:cursor-grabbing"
      @scroll.passive="onMarqueeScroll"
      @pointerdown="onMarqueePointerDown"
      @pointermove="onMarqueePointerMove"
      @pointerup="onMarqueePointerUp"
      @pointercancel="onMarqueePointerCancel"
      @touchstart.passive="onMarqueeTouchStart"
      @touchend.passive="onMarqueeTouchEnd"
      @touchcancel.passive="onMarqueeTouchEnd"
      @mouseenter="marqueeHoverPaused = true"
      @mouseleave="marqueeHoverPaused = false"
      @click.capture="onMarqueeClickCapture"
    >
      <div class="marquee-track recent-big-win flex flex-nowrap items-center gap-3 sm:gap-3.5">
        <a
          v-for="(item, idx) in duplicatedList"
          :key="`win-${idx}`"
          class="inactive flex h-28 w-14 flex-none flex-col items-center text-xs hover:opacity-80 sm:h-[106px] sm:w-13"
        >
          <div class="relative mb-1 w-full rounded-lg pt-[133%]">
            <img :src="item.src" class="absolute left-0 top-0 w-full rounded-lg" :alt="item.name" />
          </div>
          <div class="w-[118%]">
            <div class="flex items-center justify-center font-extrabold text-secondary">
              <img class="size-[0.875rem]" :src="icon" alt="" />
              <span class="ellipsis -ml-0.5 text-xxs">{{ item.name }}</span>
            </div>
            <div
              class="text-xxs whitespace-nowrap text-nowrap text-center font-extrabold text-brand"
            >
              {{ item.number }}
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Api from '@/api'
import icon from '../img/Image4.svg?url'
import placeholderImg from '@/static/img/home/errImg1.png'
import { getCurrentCurrency } from '@/utils/locale'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface RecentBigWin {
  src: string
  name: string
  number: string
}

const currentCurrency = computed(() => getCurrentCurrency())
const loading = ref(true)
const list = ref<RecentBigWin[]>([])
const skeletonCount = 12
const MARQUEE_REPEAT = 4
const duplicatedList = computed(() =>
  Array.from({ length: MARQUEE_REPEAT }, () => list.value).flat()
)

const toGameImageUrl = (value: string) => {
  if (!value) {
    return placeholderImg
  }
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

const getRecentBigWinsData = async () => {
  loading.value = true
  try {
    const res = await Api.home.getRecentBigWins({ currency: currentCurrency.value, type: 1 })
    list.value =
      res.result?.map((item: any) => ({
        src: toGameImageUrl(item.coverImg),
        name: item.nickName,
        number: item.winAmount
      })) || []
  } catch (error) {
    list.value = []
    console.error('getRecentBigWins failed', error)
  } finally {
    loading.value = false
    void nextTick(() => startMarqueeRaf())
  }
}

const marqueeRef = ref<HTMLElement | null>(null)
const marqueeHoverPaused = ref(false)
const marqueePointerActive = ref(false)
const AUTO_MARQUEE_SEGMENT_SEC = 20
const MARQUEE_IDLE_RESUME_MS = 2000
const MARQUEE_DRAG_THRESHOLD = 8

let marqueeRafId = 0
let marqueeLastTs = 0
let marqueeProgramScroll = false
let marqueeUserScrollUntil = 0
let marqueeLoopRunning = false
let marqueeProgramScrollResetTimer = 0
let marqueeLastProgrammaticScrollMs = 0
let marqueeResizeObserver: ResizeObserver | null = null
let marqueeSuppressClick = false

const marqueeDrag = {
  active: false,
  pointerId: -1,
  startX: 0,
  startScroll: 0,
  moved: false
}

const stopMarqueeRaf = () => {
  marqueeLoopRunning = false
  if (marqueeRafId) {
    cancelAnimationFrame(marqueeRafId)
    marqueeRafId = 0
  }
  if (marqueeProgramScrollResetTimer) {
    window.clearTimeout(marqueeProgramScrollResetTimer)
    marqueeProgramScrollResetTimer = 0
  }
  marqueeProgramScroll = false
  marqueeLastTs = 0
}

const stepMarquee = (ts: number) => {
  if (!marqueeLoopRunning) return
  marqueeRafId = requestAnimationFrame(stepMarquee)
  const el = marqueeRef.value
  if (!el) return

  if (
    marqueePointerActive.value ||
    marqueeHoverPaused.value ||
    Date.now() < marqueeUserScrollUntil
  ) {
    marqueeLastTs = ts
    return
  }

  const segment = el.scrollWidth / MARQUEE_REPEAT
  if (segment < 8 || el.scrollWidth <= el.clientWidth + 2) {
    marqueeLastTs = ts
    return
  }

  if (!marqueeLastTs) marqueeLastTs = ts
  const dt = Math.min(0.08, (ts - marqueeLastTs) / 1000)
  marqueeLastTs = ts
  const speedPxPerSec = segment / AUTO_MARQUEE_SEGMENT_SEC

  marqueeProgramScroll = true
  if (marqueeProgramScrollResetTimer) {
    window.clearTimeout(marqueeProgramScrollResetTimer)
  }
  marqueeProgramScrollResetTimer = window.setTimeout(() => {
    marqueeProgramScroll = false
  }, 120)
  marqueeLastProgrammaticScrollMs = performance.now()
  el.scrollLeft += speedPxPerSec * dt
  if (el.scrollLeft >= segment) {
    el.scrollLeft -= segment
    marqueeLastProgrammaticScrollMs = performance.now()
  }
}

const startMarqueeRaf = () => {
  stopMarqueeRaf()
  void nextTick(() => {
    requestAnimationFrame(() => {
      const el = marqueeRef.value
      if (!el || list.value.length === 0 || loading.value) {
        return
      }
      marqueeLoopRunning = true
      marqueeLastTs = 0
      marqueeRafId = requestAnimationFrame(stepMarquee)
    })
  })
}

const bumpMarqueeUserIdlePause = () => {
  marqueeUserScrollUntil = Date.now() + MARQUEE_IDLE_RESUME_MS
}

const beginMarqueeInteraction = () => {
  marqueePointerActive.value = true
}

const endMarqueeInteraction = () => {
  marqueePointerActive.value = false
  bumpMarqueeUserIdlePause()
}

const onMarqueeScroll = () => {
  if (marqueeProgramScroll) return
  if (performance.now() - marqueeLastProgrammaticScrollMs < 120) return
  if (!marqueePointerActive.value) return
  bumpMarqueeUserIdlePause()
}

const onMarqueePointerDown = (e: PointerEvent) => {
  marqueeSuppressClick = false
  beginMarqueeInteraction()
  if (e.pointerType === 'mouse' && e.button === 0) {
    const el = marqueeRef.value
    if (!el) return

    marqueeDrag.active = true
    marqueeDrag.moved = false
    marqueeDrag.pointerId = e.pointerId
    marqueeDrag.startX = e.clientX
    marqueeDrag.startScroll = el.scrollLeft

    el.setPointerCapture(e.pointerId)
  }
}

const onMarqueePointerMove = (e: PointerEvent) => {
  if (!marqueeDrag.active || e.pointerId !== marqueeDrag.pointerId) return
  const el = marqueeRef.value
  if (!el) return
  const dx = e.clientX - marqueeDrag.startX
  if (Math.abs(dx) > MARQUEE_DRAG_THRESHOLD) {
    marqueeDrag.moved = true
  }
  marqueeLastProgrammaticScrollMs = performance.now()
  el.scrollLeft = marqueeDrag.startScroll - dx
}

const onMarqueePointerUp = (e: PointerEvent) => {
  if (marqueeDrag.active && e.pointerId === marqueeDrag.pointerId) {
    try {
      marqueeRef.value?.releasePointerCapture(e.pointerId)
    } catch {
      console.error('releasePointerCapture failed')
    }
    if (marqueeDrag.moved) {
      marqueeSuppressClick = true
    }
    marqueeDrag.active = false
    marqueeDrag.pointerId = -1
  }
  endMarqueeInteraction()
}

const onMarqueePointerCancel = onMarqueePointerUp

const onMarqueeTouchStart = () => {
  marqueeSuppressClick = false
  beginMarqueeInteraction()
}

const onMarqueeTouchEnd = () => {
  endMarqueeInteraction()
}

const resetMarqueeInteraction = () => {
  if (!marqueePointerActive.value && !marqueeDrag.active) return
  endMarqueeInteraction()
  marqueeDrag.active = false
  marqueeDrag.pointerId = -1
}

const onMarqueeClickCapture = (e: MouseEvent) => {
  if (!marqueeSuppressClick) return
  e.preventDefault()
  e.stopPropagation()
  marqueeSuppressClick = false
}

watch(
  () => duplicatedList.value.length,
  () => {
    startMarqueeRaf()
  },
  { flush: 'post', immediate: true }
)

watch(
  () => currentCurrency.value,
  () => {
    void getRecentBigWinsData()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('pointerup', resetMarqueeInteraction, true)
  window.addEventListener('pointercancel', resetMarqueeInteraction, true)
  window.addEventListener('touchend', resetMarqueeInteraction, { capture: true, passive: true })
  window.addEventListener('touchcancel', resetMarqueeInteraction, {
    capture: true,
    passive: true
  })
  window.addEventListener('blur', resetMarqueeInteraction)

  void nextTick(() => {
    const el = marqueeRef.value
    if (!el || typeof ResizeObserver === 'undefined') return
    marqueeResizeObserver = new ResizeObserver(() => {
      startMarqueeRaf()
    })
    marqueeResizeObserver.observe(el)
  })
})

onUnmounted(() => {
  window.removeEventListener('pointerup', resetMarqueeInteraction, true)
  window.removeEventListener('pointercancel', resetMarqueeInteraction, true)
  window.removeEventListener('touchend', resetMarqueeInteraction, true)
  window.removeEventListener('touchcancel', resetMarqueeInteraction, true)
  window.removeEventListener('blur', resetMarqueeInteraction)
  marqueeResizeObserver?.disconnect()
  marqueeResizeObserver = null
  stopMarqueeRaf()
})
</script>

<style scoped lang="scss">
.bg-success {
  background-color: #24ee89;
}

.text-secondary {
  color: #b3bec1;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-xxs {
  font-size: 0.75rem;
  line-height: 1rem;
  transform: scale(0.833);
}

.marquee {
  width: calc(100% + 2rem);
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 12px,
    #000 calc(100% - 12px),
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 12px,
    #000 calc(100% - 12px),
    transparent 100%
  );
}

.marquee::-webkit-scrollbar {
  display: none;
}

.marquee-track {
  margin: 10px 0;
  width: max-content;
  gap: 0.875rem;
  padding: 0 1rem;
}

.marquee-track a {
  flex: none;
}
</style>
