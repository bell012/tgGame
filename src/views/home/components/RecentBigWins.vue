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
        <div class="text-text-1">{{ $t('home.RecentBigWins') }}</div>
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
      @mouseenter="marqueeHoverPaused = true"
      @mouseleave="marqueeHoverPaused = false"
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
          <div class="relative mb-1 w-full overflow-hidden rounded-lg pt-[133%]">
            <img
              :src="item.src"
              class="absolute left-0 top-0 h-full w-full rounded-lg object-cover"
              :alt="item.nickName"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
            <div
              class="absolute inset-x-0 bottom-1 flex w-full min-w-0 flex-col items-center justify-center px-1 text-center font-impact-infoma-ultra"
            >
              <span
                class="recent-big-win-name w-full min-w-0 break-words text-common-100"
                :style="getGameNameStyle(item.gameName)"
              >
                {{ item.gameName }}
              </span>
              <div v-if="getPlatformLogo(item)" class="mt-0.5 w-[9px] bg-transparent">
                <gameRemoteImg
                  :img="{ maintain: false, src: getPlatformLogo(item), fit: 'contain' }"
                  :alt="String(item.gameName ?? '')"
                  class="h-full w-full bg-transparent"
                />
              </div>
            </div>
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
import { useGameStore } from '@/stores/game'
import { deriveBetAmountFromWinAndMultiplier } from '@/stores/deriveBetAmount'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
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
const gameStore = useGameStore()

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

const platformLogoByGameId = ref<Record<string, string>>({})

const getPlatformLogo = (item: RecentBigWin) =>
  platformLogoByGameId.value[String(item.gameId ?? '').trim()] ?? ''

/** 大奖数据只带 gameId，需按游戏节点回查 platformCode 才能拿到厂商 logo */
const resolvePlatformLogos = async (items: RecentBigWin[]) => {
  const gameIds = [...new Set(items.map(item => String(item.gameId ?? '').trim()).filter(Boolean))]
  if (gameIds.length === 0) {
    platformLogoByGameId.value = {}
    return
  }

  const records = await gameStore.queryGameData()
  const platformCodeByGameId = new Map(
    records.map(
      record =>
        [String(record.rowId ?? '').trim(), String(record.platformCode ?? '').trim()] as const
    )
  )

  const logoEntries = await Promise.all(
    gameIds.map(async gameId => {
      const platformCode = platformCodeByGameId.get(gameId)
      const logo = platformCode ? await gameStore.getPlatformLogoByPlatformCode(platformCode) : ''
      return [gameId, logo] as const
    })
  )

  platformLogoByGameId.value = Object.fromEntries(logoEntries.filter(([, logo]) => Boolean(logo)))
}

/** 游戏名最多占用的行数，超出即省略 */
const NAME_MAX_LINES = 2

interface NameFontPreset {
  maxSize: number
  minSize: number
  maxLineHeight: number
  minLineHeight: number
  weight: number
}

/** 中英文各自的字号区间：优先用最大字号，放不下逐级缩到最小字号；H5 与 PC 分别取值 */
const NAME_FONT_PRESETS: Record<'mobile' | 'desktop', Record<'cjk' | 'latin', NameFontPreset>> = {
  mobile: {
    cjk: { maxSize: 9, minSize: 7, maxLineHeight: 10, minLineHeight: 10, weight: 900 },
    latin: { maxSize: 11, minSize: 7, maxLineHeight: 11, minLineHeight: 8, weight: 400 }
  },
  desktop: {
    cjk: { maxSize: 10, minSize: 8, maxLineHeight: 11, minLineHeight: 11, weight: 900 },
    latin: { maxSize: 12, minSize: 8, maxLineHeight: 12, minLineHeight: 9, weight: 400 }
  }
}

interface NameFontStyle {
  fontSize: string
  lineHeight: string
  fontWeight: string
  [cssVariable: `--${string}`]: string
}

const CJK_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/

const resolveNameFontPreset = (name: string): NameFontPreset => {
  const presets = NAME_FONT_PRESETS[isMobile.value ? 'mobile' : 'desktop']
  return CJK_PATTERN.test(name) ? presets.cjk : presets.latin
}

/** 行高在字号区间内线性过渡，端点严格取设计给定值 */
const resolveNameLineHeight = (preset: NameFontPreset, fontSize: number) => {
  if (preset.maxSize === preset.minSize) {
    return preset.maxLineHeight
  }
  const ratio = (fontSize - preset.minSize) / (preset.maxSize - preset.minSize)
  return preset.minLineHeight + (preset.maxLineHeight - preset.minLineHeight) * ratio
}

const toNameFontStyle = (preset: NameFontPreset, fontSize: number): NameFontStyle => ({
  fontSize: `${fontSize}px`,
  lineHeight: `${resolveNameLineHeight(preset, fontSize)}px`,
  fontWeight: String(preset.weight),
  '--name-max-lines': String(NAME_MAX_LINES)
})

const nameFontStyleByName = ref<Record<string, NameFontStyle>>({})

const getGameNameStyle = (rawName: unknown): NameFontStyle => {
  const name = String(rawName ?? '').trim()
  const preset = resolveNameFontPreset(name)
  return nameFontStyleByName.value[name] ?? toNameFontStyle(preset, preset.maxSize)
}

let nameMeasurerEl: HTMLElement | null = null

/** 离屏节点，用真实渲染宽度与字体试排，避免逐个卡片反复读写布局 */
const ensureNameMeasurer = () => {
  if (nameMeasurerEl) {
    return nameMeasurerEl
  }
  const el = document.createElement('span')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText =
    'position:fixed;left:-9999px;top:0;display:block;visibility:hidden;pointer-events:none;text-align:center;overflow-wrap:break-word;'
  document.body.appendChild(el)
  nameMeasurerEl = el
  return el
}

const computeNameFontStyles = () => {
  const sample = marqueeInnerRef.value?.querySelector<HTMLElement>('.recent-big-win-name')
  const availableWidth = sample?.clientWidth ?? 0
  if (!sample || availableWidth <= 0) {
    return
  }

  const names = [
    ...new Set(list.value.map(item => String(item.gameName ?? '').trim()).filter(Boolean))
  ]
  if (names.length === 0) {
    nameFontStyleByName.value = {}
    return
  }

  const sampleStyle = window.getComputedStyle(sample)
  const measurer = ensureNameMeasurer()
  measurer.style.width = `${availableWidth}px`
  measurer.style.fontFamily = sampleStyle.fontFamily
  measurer.style.letterSpacing = sampleStyle.letterSpacing
  measurer.style.wordBreak = sampleStyle.wordBreak

  const nextStyles: Record<string, NameFontStyle> = {}

  names.forEach(name => {
    const preset = resolveNameFontPreset(name)
    measurer.textContent = name

    let fitted = toNameFontStyle(preset, preset.minSize)
    for (let fontSize = preset.maxSize; fontSize >= preset.minSize; fontSize -= 1) {
      const candidate = toNameFontStyle(preset, fontSize)
      measurer.style.fontSize = candidate.fontSize
      measurer.style.lineHeight = candidate.lineHeight
      measurer.style.fontWeight = candidate.fontWeight

      const maxHeight = resolveNameLineHeight(preset, fontSize) * NAME_MAX_LINES
      if (measurer.scrollHeight <= maxHeight + 1) {
        fitted = candidate
        break
      }
    }

    nextStyles[name] = fitted
  })

  nameFontStyleByName.value = nextStyles
}

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
/** 系统开启「减少动态效果」 matchMedia */
const marqueeReducedMotionActive = ref(
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
)
const AUTO_MARQUEE_SEGMENT_SEC = 20

let marqueeRafId = 0
let marqueeLastTs = 0
let marqueeLoopRunning = false

let marqueeScrollRemainder = 0
let marqueeResizeObserver: ResizeObserver | null = null
let marqueeResizeDebounceTimer = 0
let marqueeVisibilityHandler: (() => void) | null = null
let marqueeReducedMotionMql: MediaQueryList | null = null
let marqueeReducedMotionHandler: (() => void) | null = null

/**
 * 停止自动滚动循环。
 */
const stopMarqueeRaf = () => {
  marqueeLoopRunning = false
  if (marqueeRafId) {
    cancelAnimationFrame(marqueeRafId)
    marqueeRafId = 0
  }
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

  if (marqueeHoverPaused.value) {
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

watch(
  () => duplicatedList.value,
  () => {
    void nextTick(() => {
      computeNameFontStyles()
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

/** H5 与 PC 字号区间不同，断点切换后需重新试排 */
watch(
  () => isMobile.value,
  () => {
    void nextTick(() => computeNameFontStyles())
  }
)

watch(
  () => list.value,
  items => {
    if (items.length === 0) {
      return
    }
    void resolvePlatformLogos(items).catch(error => {
      console.error('resolve recent big wins platform logo failed', error)
    })
  }
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
      computeNameFontStyles()
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

  // Impact / Infoma Ultra 加载完成前后字形宽度不同，需按最终字体重排
  void document.fonts?.ready.then(() => computeNameFontStyles())

  void nextTick(() => attachMarqueeResizeObserver())
})

onUnmounted(() => {
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
  nameMeasurerEl?.remove()
  nameMeasurerEl = null
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

.recent-big-win-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--name-max-lines, 2);
  line-clamp: var(--name-max-lines, 2);
  overflow: hidden;
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
