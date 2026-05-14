<template>
  <section>
    <div class="mt-2 flex h-8 items-center sm:mt-6">
      <h2 class="flex items-center text-base font-extrabold">
        <div class="relative mr-2 h-2 w-2">
          <div class="absolute left-0 top-0 z-10 h-full w-full rounded-full bg-success"></div>
          <div
            class="absolute left-0 top-0 h-full w-full rounded-full bg-success animate-ping"
          ></div>
        </div>
        <div class="text-theme-primary">{{ $t('home.RecentBigWins') }}</div>
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
      class="marquee my-0 select-none sm:rounded-xl sm:bg-layer3"
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
      <div
        ref="marqueeInnerRef"
        class="marquee-track recent-big-win flex flex-nowrap items-center gap-3 sm:gap-3.5"
      >
        <button
          v-for="(item, idx) in duplicatedList"
          :key="`win-${idx}`"
          type="button"
          class="marquee-item inactive flex h-28 w-14 flex-none cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-xs text-inherit hover:opacity-80 sm:h-[106px] sm:w-13"
          @click.stop="onRecentBigWinItemClick(idx)"
        >
          <div class="relative mb-1 w-full rounded-lg pt-[133%]">
            <img
              :src="item.src"
              class="absolute left-0 top-0 w-full rounded-lg"
              :alt="item.nickName"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
          </div>
          <div class="w-[100%]">
            <div class="flex items-center justify-center font-bold text-secondary">
              <img class="size-[0.875rem]" :src="item.icon" alt="" />
              <span class="ellipsis -ml-0.5 text-xxs">{{ item.nickName }}</span>
            </div>
            <div
              class="text-xxs whitespace-nowrap text-nowrap text-center font-bold text-brand text-theme-primary"
            >
              {{ formatRecentBigWinAmount(item.winAmount) }} {{ item.currency }}
            </div>
          </div>
        </button>
      </div>
    </div>
    <RewardDetailsModal v-model="showRewardDetailsModal" :reward="rewardDetailsPayload" />
  </section>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { RecentBigWinsItem } from '@/api/interface/home.interface'
import placeholderImg from '@/static/img/home/errImg1.png'
import vip0Icon from '@/static/img/vip/vip0.png'
import vip1Vip2Icon from '@/static/img/vip/vip1-vip2.png'
import vip3Vip4Icon from '@/static/img/vip/vip3-vip4.png'
import vip5Vip6Icon from '@/static/img/vip/vip5-vip6.png'
import vip7Vip8Icon from '@/static/img/vip/vip7-vip8.png'
import vip9Vip10Icon from '@/static/img/vip/vip9-vip10.png'
import { useIsMobile } from '@/composables/useMediaQuery'
import { getCurrentCurrency } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { useAuthModalStore } from '@/stores/authModal'
import { useUserStore } from '@/stores/user'
import { deriveBetAmountFromWinAndMultiplier } from '@/stores/deriveBetAmount'
import RewardDetailsModal from '@/views/home/rewardDetails/RewardDetailsModal.vue'
import type { RewardDetailsRawItem } from '@/views/home/rewardDetails/types'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

type RecentBigWin = RewardDetailsRawItem

const showRewardDetailsModal = ref(false)
const rewardDetailsPayload = ref<RewardDetailsRawItem | null>(null)

watch(showRewardDetailsModal, open => {
  if (!open) {
    rewardDetailsPayload.value = null
  }
})

const currentCurrency = computed(() => getCurrentCurrency())
const isMobile = useIsMobile()
const userStore = useUserStore()
const authModalStore = useAuthModalStore()

const isLoggedIn = () => {
  const { userInfo, acctInfo } = userStore.syncStoredUserData()
  return Boolean(userInfo?.tradeToken || acctInfo?.memberId)
}
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

const getVipIconByVipId = (vipId: unknown) => {
  const id = Number(vipId)
  if (!Number.isFinite(id) || id == 0) {
    return vip0Icon
  }
  if (id <= 2) {
    return vip1Vip2Icon
  }
  if (id <= 4) {
    return vip3Vip4Icon
  }
  if (id <= 6) {
    return vip5Vip6Icon
  }
  if (id <= 8) {
    return vip7Vip8Icon
  }
  return vip9Vip10Icon
}

/** 大额展示：≥1000 转为千分位 + 两位小数 + K，如 1,497.00K；否则两位小数 + 千分位 */
const formatRecentBigWinAmount = (raw: string | number | undefined) => {
  const cleaned = String(raw ?? '')
    .replace(/,/g, '')
    .trim()
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

const onRecentBigWinItemClick = (duplicatedIndex: number) => {
  const len = list.value.length
  if (len === 0) {
    return
  }
  if (!isLoggedIn()) {
    authModalStore.openLoginModal()
    return
  }
  const item = list.value[duplicatedIndex % len]
  if (isMobile.value) {
    void navigateTo('/reward-details', {
      state: { rewardDetailsRaw: JSON.stringify(item) }
    })
    return
  }
  rewardDetailsPayload.value = item
  showRewardDetailsModal.value = true
}

const getRecentBigWinsData = async () => {
  loading.value = true
  try {
    const res = await Api.home.getRecentBigWins({ currency: currentCurrency.value, type: 1 })
    list.value =
      res.result?.map((item: RecentBigWinsItem) => {
        const derivedBet = deriveBetAmountFromWinAndMultiplier(item.winAmount, item.multiple)
        return {
          ...item,
          src: toGameImageUrl(String(item.coverImg ?? '')),
          icon: getVipIconByVipId(item.vipId),
          avatar: toGameImageUrl(String(item.avatar ?? '')),
          betAmount: derivedBet ?? item.betAmount ?? item.gameAmount
        }
      }) || []
  } catch (error) {
    list.value = []
    console.error('getRecentBigWins failed', error)
  } finally {
    loading.value = false
    void nextTick(() => startMarqueeRaf())
  }
}

const marqueeRef = ref<HTMLElement | null>(null)
const marqueeInnerRef = ref<HTMLElement | null>(null)
const marqueeSegmentPx = ref(0)
const marqueeCanAutoScroll = ref(false)
const marqueeHoverPaused = ref(false)
const marqueePointerActive = ref(false)
/** 系统开启「减少动态效果」 matchMedia */
const marqueeReducedMotionActive = ref(
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
)
const AUTO_MARQUEE_SEGMENT_SEC = 20
const MARQUEE_IDLE_RESUME_MS = 2000

let marqueeRafId = 0
let marqueeLastTs = 0
let marqueeUserScrollUntil = 0
let marqueeLoopRunning = false

let marqueeScrollRemainder = 0
let marqueeResizeObserver: ResizeObserver | null = null
let marqueeResizeDebounceTimer = 0
let marqueeMobileResumeTimer = 0
let marqueeVisibilityHandler: (() => void) | null = null
let marqueeReducedMotionMql: MediaQueryList | null = null
let marqueeReducedMotionHandler: (() => void) | null = null

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
  clearMarqueeMobileResumeTimer()
  marqueeLastTs = 0
}

/**
 * 在轨道尺寸变化后更新缓存（一次布局读取），供 RAF 循环使用。
 */
const measureMarqueeSegment = () => {
  const outer = marqueeRef.value
  const inner = marqueeInnerRef.value
  if (!outer || !inner || list.value.length === 0) {
    marqueeSegmentPx.value = 0
    marqueeCanAutoScroll.value = false
    return
  }

  const innerWidth = inner.scrollWidth
  const segment = innerWidth / MARQUEE_REPEAT
  marqueeSegmentPx.value = segment
  marqueeCanAutoScroll.value = segment >= 8 && innerWidth > outer.clientWidth + 2
}

const stepMarquee = (ts: number) => {
  if (!marqueeLoopRunning) return
  marqueeRafId = requestAnimationFrame(stepMarquee)
  const el = marqueeRef.value
  if (!el) return

  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    marqueeLastTs = ts
    return
  }

  if (marqueeReducedMotionActive.value) {
    marqueeLastTs = ts
    return
  }

  if (
    marqueePointerActive.value ||
    marqueeHoverPaused.value ||
    Date.now() < marqueeUserScrollUntil
  ) {
    marqueeLastTs = ts
    return
  }

  const segment = marqueeSegmentPx.value
  if (!marqueeCanAutoScroll.value || segment < 8) {
    marqueeLastTs = ts
    return
  }

  if (!marqueeLastTs) marqueeLastTs = ts
  const dt = Math.min(0.1, (ts - marqueeLastTs) / 1000)
  marqueeLastTs = ts
  const speedPxPerSec = segment / AUTO_MARQUEE_SEGMENT_SEC

  let deltaPx = speedPxPerSec * dt + marqueeScrollRemainder
  const stepInt = Math.trunc(deltaPx)
  marqueeScrollRemainder = deltaPx - stepInt

  if (stepInt !== 0) {
    el.scrollLeft += stepInt
    let sl = el.scrollLeft
    let wrapGuard = 0
    while (sl >= segment - 0.5 && wrapGuard < 8) {
      el.scrollLeft = sl - segment
      sl = el.scrollLeft
      wrapGuard += 1
    }
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
      if (marqueeReducedMotionActive.value) {
        return
      }
      measureMarqueeSegment()
      marqueeScrollRemainder = 0
      if (!marqueeCanAutoScroll.value) {
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
  marqueeScrollRemainder = 0
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
    void nextTick(() => {
      measureMarqueeSegment()
      startMarqueeRaf()
    })
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

/**
 * loading 结束后才有跑马 DOM；须在轨道挂载后再监听宽度变化。
 */
const attachMarqueeResizeObserver = () => {
  const inner = marqueeInnerRef.value
  if (!inner || typeof ResizeObserver === 'undefined') {
    return
  }

  marqueeResizeObserver?.disconnect()
  marqueeResizeObserver = new ResizeObserver(() => {
    if (marqueeResizeDebounceTimer) {
      window.clearTimeout(marqueeResizeDebounceTimer)
    }
    marqueeResizeDebounceTimer = window.setTimeout(() => {
      marqueeResizeDebounceTimer = 0
      measureMarqueeSegment()
      startMarqueeRaf()
    }, 120)
  })
  marqueeResizeObserver.observe(inner)
}

watch(
  () => loading.value,
  isLoading => {
    if (isLoading) {
      return
    }
    void nextTick(() => attachMarqueeResizeObserver())
  },
  { flush: 'post' }
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

  marqueeVisibilityHandler = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      stopMarqueeRaf()
    } else {
      startMarqueeRaf()
    }
  }
  document.addEventListener('visibilitychange', marqueeVisibilityHandler)

  marqueeReducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  marqueeReducedMotionHandler = () => {
    marqueeReducedMotionActive.value = Boolean(marqueeReducedMotionMql?.matches)
    if (marqueeReducedMotionActive.value) {
      stopMarqueeRaf()
    } else {
      startMarqueeRaf()
    }
  }
  marqueeReducedMotionMql.addEventListener('change', marqueeReducedMotionHandler)

  void nextTick(() => attachMarqueeResizeObserver())
})

onUnmounted(() => {
  window.removeEventListener('pointerup', resetMarqueeInteraction, true)
  window.removeEventListener('pointercancel', resetMarqueeInteraction, true)
  window.removeEventListener('touchend', resetMarqueeInteraction, true)
  window.removeEventListener('touchcancel', resetMarqueeInteraction, true)
  window.removeEventListener('blur', resetMarqueeInteraction)
  if (marqueeVisibilityHandler) {
    document.removeEventListener('visibilitychange', marqueeVisibilityHandler)
    marqueeVisibilityHandler = null
  }
  if (marqueeReducedMotionMql && marqueeReducedMotionHandler) {
    marqueeReducedMotionMql.removeEventListener('change', marqueeReducedMotionHandler)
  }
  marqueeReducedMotionMql = null
  marqueeReducedMotionHandler = null
  if (marqueeResizeDebounceTimer) {
    window.clearTimeout(marqueeResizeDebounceTimer)
    marqueeResizeDebounceTimer = 0
  }
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
  overflow-x: auto;
  overflow-y: hidden;
  touch-action: pan-x pan-y;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  contain: content;
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
  transform: translateZ(0);
  backface-visibility: hidden;
}

.marquee-track .marquee-item {
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
