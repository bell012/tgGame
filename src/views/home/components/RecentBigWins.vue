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
      class="marquee my-0 touch-pan-y select-none sm:rounded-xl sm:bg-layer3"
      @scroll.passive="onMarqueeScroll"
      @pointerdown="onMarqueePointerDown"
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
              class="text-xxs whitespace-nowrap text-nowrap text-center font-extrabold text-brand text-theme-primary"
            >
              {{ formatRecentBigWinAmount(item.number) }} {{ item.currency }}
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
import { useIsMobile } from '@/composables/useMediaQuery'
import { getCurrentCurrency } from '@/utils/locale'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface RecentBigWin {
  src: string
  name: string
  number: string
  currency: string
}

const currentCurrency = computed(() => getCurrentCurrency())
const isMobile = useIsMobile()
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

/** 大额展示：≥1000 转为千分位 + 两位小数 + K，如 1,497.00K；否则两位小数 + 千分位 */
const formatRecentBigWinAmount = (raw: string) => {
  const cleaned = String(raw).replace(/,/g, '').trim()
  const n = Number(cleaned)
  if (!Number.isFinite(n)) {
    return raw || '0.00'
  }
  const opts: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
  if (Math.abs(n) >= 1000) {
    return `${(n / 1000).toLocaleString('en-US', opts)}K`
  }
  return n.toLocaleString('en-US', opts)
}

const getRecentBigWinsData = async () => {
  loading.value = true
  try {
    const res = await Api.home.getRecentBigWins({ currency: currentCurrency.value, type: 1 })
    list.value =
      res.result?.map((item: any) => ({
        src: toGameImageUrl(item.coverImg),
        name: item.nickName,
        number: String(item.winAmount ?? ''),
        currency: String(item.currency ?? '')
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

let marqueeRafId = 0
let marqueeLastTs = 0
let marqueeProgramScroll = false
let marqueeUserScrollUntil = 0
let marqueeLoopRunning = false
let marqueeProgramScrollResetTimer = 0
let marqueeLastProgrammaticScrollMs = 0
let marqueeResizeObserver: ResizeObserver | null = null
let marqueeMobileResumeTimer = 0

/**
 * 清理 H5 点击/触摸后的自动恢复定时器
 */
const clearMarqueeMobileResumeTimer = () => {
  if (!marqueeMobileResumeTimer) {
    return
  }

  window.clearTimeout(marqueeMobileResumeTimer)
  marqueeMobileResumeTimer = 0
}

/**
 * H5 点击或触摸后，2 秒后强制清理暂停状态并恢复跑马灯滚动。
 */
const scheduleMarqueeMobileResume = () => {
  clearMarqueeMobileResumeTimer()

  if (!isMobile.value) {
    return
  }

  marqueeMobileResumeTimer = window.setTimeout(() => {
    marqueePointerActive.value = false
    marqueeHoverPaused.value = false
    marqueeUserScrollUntil = 0
    marqueeProgramScroll = false
    marqueeLastTs = 0
    marqueeMobileResumeTimer = 0

    if (!marqueeLoopRunning) {
      startMarqueeRaf()
    }
  }, MARQUEE_IDLE_RESUME_MS)
}

/**
 * 停止自动滚动循环，并清理与滚动状态相关的定时器。
 */
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
  clearMarqueeMobileResumeTimer()
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

/**
 * 记录用户开始与跑马灯交互；H5 下额外启动 2 秒自动恢复。
 */
const beginMarqueeInteraction = () => {
  marqueePointerActive.value = true
  scheduleMarqueeMobileResume()
}

/**
 * 结束用户交互并进入 2 秒空闲暂停期，之后恢复自动滚动。
 */
const endMarqueeInteraction = () => {
  marqueePointerActive.value = false
  bumpMarqueeUserIdlePause()
  scheduleMarqueeMobileResume()
}

/**
 * 用户手动滚动时，更新空闲恢复时间；H5 下同时强制恢复。
 */
const onMarqueeScroll = () => {
  if (marqueeProgramScroll) return
  if (performance.now() - marqueeLastProgrammaticScrollMs < 120) return
  if (!marqueePointerActive.value) return
  bumpMarqueeUserIdlePause()
  scheduleMarqueeMobileResume()
}

/**
 * PC 使用 pointer 事件处理拖拽；H5 走 touch 事件。
 */
const onMarqueePointerDown = () => {
  if (isMobile.value) {
    return
  }

  beginMarqueeInteraction()
}

/**
 * PC 结束 pointer 交互后进入空闲恢复；H5 下忽略 pointerup（由 touch 处理）。
 */
const onMarqueePointerUp = () => {
  if (isMobile.value) {
    return
  }

  endMarqueeInteraction()
}

const onMarqueePointerCancel = onMarqueePointerUp

/**
 * H5 触摸开始时进入暂停态，并启动 2 秒自动恢复计时。
 */
const onMarqueeTouchStart = () => {
  beginMarqueeInteraction()
}

/**
 * H5 触摸结束后进入空闲恢复阶段。
 */
const onMarqueeTouchEnd = () => {
  endMarqueeInteraction()
}

/**
 * 重置跑马灯交互状态，处理触摸/指针事件异常中断的情况。
 */
const resetMarqueeInteraction = () => {
  if (!marqueePointerActive.value) return
  endMarqueeInteraction()
}

/**
 * H5 单击后即使没有后续操作，在 2 秒后自动恢复滚动。
 */
const onMarqueeClickCapture = () => {
  if (isMobile.value) {
    scheduleMarqueeMobileResume()
  }
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
  margin-left: -1rem;
  margin-right: -1rem;
  overflow-x: hidden;
  overflow-y: hidden;
  touch-action: pan-y;
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

@media (min-width: 640px) {
  .marquee {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }

  .marquee-track {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}
</style>
