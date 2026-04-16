<template>
  <div class="home max-w-[1248px] mx-auto px-3.5 py-2 sm:px-4 sm:py-4">
    <div style="height: 65px" class="sm:hidden"></div>
    <HomeCarouselImg v-if="querySlideshowList.length" :list="querySlideshowList" />

    <div class="flex items-center mt-2 sm:mt-6 h-8">
      <h2 class="flex items-center text-base font-extrabold text-primary">
        <div class="relative mr-2 h-2 w-2">
          <div class="absolute left-0 top-0 h-full w-full rounded-full bg-success z-10"></div>
          <div
            class="absolute left-0 top-0 h-full w-full rounded-full bg-success animate-ping"
          ></div>
        </div>
        <!-- 近期大奖 -->
        <div>{{ $t('home.RecentBigWins') }}</div>
      </h2>
    </div>
    <div
      ref="marqueeRef"
      class="marquee px-4 sm:rounded-xl sm:bg-layer3 sm:px-3 mx-[-1rem] my-0 sm:mx-0 sm:my-0 touch-pan-x select-none sm:cursor-grab sm:active:cursor-grabbing"
      @scroll.passive="onMarqueeScroll"
      @pointerdown="onMarqueePointerDown"
      @pointermove="onMarqueePointerMove"
      @pointerup="onMarqueePointerUp"
      @pointercancel="onMarqueePointerCancel"
      @mouseenter="marqueeHoverPaused = true"
      @mouseleave="marqueeHoverPaused = false"
      @click.capture="onMarqueeClickCapture"
    >
      <div class="marquee-track recent-big-win flex flex-nowrap items-center gap-3 sm:gap-3.5">
        <a
          class="sm:w-13 flex h-28 w-14 flex-none flex-col items-center text-xs hover:opacity-80 sm:h-[106px] inactive"
          v-for="(item, idx) in duplicatedList"
          :key="`win-${idx}`"
        >
          <div class="relative mb-1 w-full rounded-lg pt-[133%]">
            <img :src="item.src" class="absolute left-0 top-0 w-full rounded-lg" />
          </div>
          <div class="w-[118%]">
            <div class="flex items-center justify-center font-extrabold text-secondary">
              <img class="size-[0.875rem]" :src="icon" /><span class="ellipsis -ml-0.5 text-xxs">{{
                item.name
              }}</span>
            </div>
            <div
              class="whitespace-nowrap text-nowrap text-center font-extrabold text-brand text-xxs"
            >
              {{ item.number }}
            </div>
          </div>
        </a>
      </div>
    </div>
    <div class="overflow-hidden px-4 sm:rounded-xl sm:bg-layer3 sm:px-3">
      <div class="-mx-4 bg-layer2">
        <div class="flex w-full flex-col items-stretch gap-2 sm:mt-6 lg:!gap-3">
          <div class="flex flex-3 gap-2 lg:!gap-3">
            <button
              class="button button-m center relative bg-game-casino h-32 flex-1 overflow-hidden rounded-xl p-[10px] font-extrabold sm:h-[176px] sm:p-5 col-span-2 col-start-1"
              type="button"
              @click="navigateTo('/casino')"
            >
              <img
                class="absolute right-[1px] top-0 h-[100%] left-[31%] sm:left-auto"
                src="./img/casino.png"
              />
              <div class="relative z-10 flex h-full flex-auto flex-col">
                <div class="flex items-center">
                  <div class="color_icon_img casino" style="transform: scale(1)"></div>
                  <img :src="icon5" alt="" class="w-[19px]" />
                  <h2 class="ml-0.5 text-sm sm:text-[12px]">{{ $t('home.Casino') }}</h2>
                </div>
              </div>
            </button>
            <button
              class="button button-m center relative bg-game-sports h-32 flex-1 overflow-hidden p-[10px] rounded-xl font-extrabold sm:h-[176px] sm:p-5 col-start-1"
              type="button"
            >
              <img
                class="absolute right-[1px] top-0 h-[100%] left-[34%] sm:left-auto"
                src="./img/sports.png"
              />
              <div class="relative z-10 flex h-full flex-auto flex-col">
                <div class="flex items-center">
                  <div class="color_icon_img sports" style="transform: scale(1)"></div>
                  <img :src="icon6" alt="" class="w-[19px]" />
                  <span class="ml-0.5 text-sm sm:text-[12px]">{{ $t('home.Sports') }}</span>
                </div>
              </div>
            </button>
          </div>

          <div class="flex flex-3 flex-wrap gap-2 lg:!gap-3">
            <button
              v-for="value in listImg"
              class="button button-m center relative h-20 flex-1 overflow-hidden rounded-xl bg-layer4 p-2 font-extrabold sm:h-[120px]"
              type="button"
              style="
                background-image: linear-gradient(
                  to left,
                  rgba(39, 232, 187, 0.2),
                  transparent 75%
                );
              "
            >
              <img
                class="absolute top-[10%] left-1/2 -translate-x-1/2 gameTypeImg sm:left-[50%] sm:top-[16%] sm:h-[66%] sm:-translate-x-[10%]"
                :src="value.img"
              />
              <div class="pcState absolute left-2 top-2 flex flex-col">
                <div class="color_icon_img bcpoker" style="transform: scale(0.8)">
                  <img :src="value.icon" alt="" />
                </div>
                <h2 class="ml-1 text-sm font-extrabold">{{ value.name }}</h2>
              </div>
              <div class="absolute bottom-1 left-0 block w-full text-center h5State">
                <span class="text-[0.625rem] sm:text-sm font-extrabold">{{ value.name }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div>
      <GameList
        :title="value.sysGameTypeName"
        :sysGameTypeCode="value.sysGameTypeCode"
        :list="value.list"
        v-for="value in gameData"
        :key="value.sysGameTypeName"
      />
      <EventList v-if="sportsEventList.length" :list="sportsEventList" />
      <!-- <GameList :title="$t(gamelist1.title)" :list="gamelist1.list" /> -->
    </div>
    <div class="mt-4 rounded-xl bg-[var(--color-background-level-2)] sm:mt-7">
      <div class="w-full flex items-center justify-between px-[22px] pb-4 pt-3 lg:!hidden">
        <img class="w-6" :src="BTC" /><img class="w-6" :src="ETH" /><img
          class="w-6"
          :src="BNB"
        /><img class="w-6" :src="XRP" /><img class="w-6" :src="USDT" /><img
          class="w-6"
          :src="USDC"
        /><img class="w-6" :src="SOL" /><img class="w-6" :src="ADA" /><img
          class="w-6"
          :src="DOGE"
        /><img class="w-6" :src="MATIC" /><img class="w-6" :src="TRX" />
      </div>

      <div class="relative h-20 rounded-xl bg-bg-2 lg:px-8">
        <div class="pointer-events-none absolute left-0 size-full overflow-hidden blur">
          <img class="absolute -top-3 left-4 scale-[2]" :src="dotC8z5Aoh" /><img
            class="absolute left-24 top-14 scale-150"
            :src="dotC8z5Aoh"
          /><img class="absolute -top-2 left-40 scale-[2]" :src="dotC8z5Aoh" /><img
            class="absolute -top-3 left-72 scale-[3]"
            :src="dotC8z5Aoh"
          /><img class="absolute left-80 top-15 scale-150" :src="dotC8z5Aoh" /><img
            class="absolute -bottom-3 right-4 scale-[2]"
            :src="dotC8z5Aoh"
          /><img class="absolute bottom-14 right-24 scale-150" :src="dotC8z5Aoh" /><img
            class="absolute -bottom-2 right-40 scale-[2]"
            :src="dotC8z5Aoh"
          /><img class="absolute -bottom-3 right-72 scale-[3]" :src="dotC8z5Aoh" /><img
            class="absolute bottom-15 right-80 scale-150"
            :src="dotC8z5Aoh"
          />
        </div>
        <div
          class="relative z-10 flex h-full flex-col items-center justify-center lg:!flex-row-reverse"
        >
          <div class="max-lg:hidden lg:flex lg:items-center lg:justify-center">
            <img class="-ml-1 w-6" :src="BTC" /><img class="-ml-1 w-6" :src="ETH" />
            <img class="-ml-1 w-6" :src="BNB" /><img class="-ml-1 w-6" :src="XRP" />
            <img class="-ml-1 w-6" :src="USDT" /><img class="-ml-1 w-6" :src="USDC" />
            <img class="-ml-1 w-6" :src="SOL" /><img class="-ml-1 w-6" :src="ADA" />
            <img class="-ml-1 w-6" :src="DOGE" /><img class="-ml-1 w-6" :src="MATIC" />
            <img class="-ml-1 w-6" :src="TRX" />
          </div>
          <div class="max-sm:hidden sm:flex sm:items-center sm:justify-center mx-auto gap-6">
            <img class="w-14" :src="MAYA" />
            <img class="w-20" :src="GCASH" />
            <img class="w-14" :src="VISA" />
            <img class="w-13" :src="GROU" />
            <img class="w-23" :src="SHOPEE" />
          </div>
          <div class="w-full flex items-center justify-between px-[10px] mt-2 sm:hidden">
            <img class="h-[13px]" :src="MAYA" />
            <img class="h-[13px]" :src="GCASH" />
            <img class="h-[13px]" :src="VISA" />
            <img class="h-[13px]" :src="GROU" />
            <img class="h-[13px]" :src="SHOPEE" />
          </div>
          <div class="flex items-center justify-center mt-4 gap-11 lg:!mt-0">
            <div class="text-lg font-extrabold sm:text-2xl">
              <span class="text-secondary-4">300%</span> {{ $t('home.DepositBonus') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <NewEvent class="mt-2" />
    <ActivityPop v-if="shouldShowActivityPop" class="sm:hidden" @close="closeActivityPop" />
  </div>

  <!-- 提示弹窗 -->
  <H5HomePop
    v-if="shouldShowH5HomePop && !isLogin"
    class="sm:hidden"
    @close="closeH5HomePop"
    @open-login="openRegisterModal"
  />
  <CommonFooter class="hidden sm:block" />
</template>

<script setup lang="ts">
import Api from '@/api'
import router from '@/router'
import H5HomePop from '@/components/H5HomePop.vue'
import HomeCarouselImg from '@/components/homeCarouselImg.vue'
import { useAuthModalStore } from '@/stores/authModal'
import { getStorageLanguageCode, stripLocalePrefix } from '@/utils/locale'
import { useIsMobile } from '@/composables/useMediaQuery'
import ActivityPop from '@/components/activityPop.vue'
import { navigateTo } from '@/utils/router'
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { getCurrentCurrency } from '@/utils/locale'
import EventList from './components/eventList.vue'
import GameList from './components/gameList.vue'
import NewEvent from './components/newEvent.vue'

import icon1 from './img/Image.svg?url'
import icon2 from './img/Image1.svg?url'
import icon3 from './img/Image2.svg?url'
import icon4 from './img/Image3.svg?url'
import icon from './img/Image4.svg?url'
import icon5 from './img/Image5.svg?url'
import icon6 from './img/Image6.svg?url'

import ADA from '@/static/svg/coin/ADA.black.svg?url'
import BNB from '@/static/svg/coin/BNB.black.svg?url'
import BTC from '@/static/svg/coin/BTC.black.svg?url'
import DOGE from '@/static/svg/coin/DOGE.black.svg?url'
import ETH from '@/static/svg/coin/ETH.black.svg?url'
import GROU from '@/static/svg/coin/GrouPay.svg?url'
import MATIC from '@/static/svg/coin/MATIC.black.svg?url'
import SOL from '@/static/svg/coin/SOL.black.svg?url'
import TRX from '@/static/svg/coin/TRX.black.svg?url'
import USDC from '@/static/svg/coin/USDC.black.svg?url'
import USDT from '@/static/svg/coin/USDT.black.svg?url'
import VISA from '@/static/svg/coin/VISA.svg?url'
import XRP from '@/static/svg/coin/XRP.black.svg?url'
import dotC8z5Aoh from '@/static/svg/coin/dot-C8z5Aoh_.svg?url'
import GCASH from '@/static/svg/coin/gcash.svg?url'
import MAYA from '@/static/svg/coin/maya.svg?url'
import SHOPEE from '@/static/svg/coin/shopeePay.svg?url'

import CommonFooter from '@/components/commonFooter.vue'
import combination from '@/static/img/home/combination.png'
import contract from '@/static/img/home/contract.png'
import fishing from '@/static/img/home/fishing.png'
import live from '@/static/img/home/live.png'
import slots from '@/static/img/home/slots.png'
import headBackH5Image from './headBack_h5.png'

import placeholderImg from '@/static/img/home/errImg1.png'
import backImg from '@/static/img/home/banner.jpg'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const isLogin = computed(() => Boolean(userInfo.value?.tradeToken))
const currentCurrency = computed(() => getCurrentCurrency())
const { t, locale } = useI18n()

interface EventListItem {
  image: string
  rowId: number
}

interface RawGameDataItem {
  [key: string]: any
}

interface HomeGameSection {
  sysGameTypeCode: string
  list: RawGameDataItem[]
  sysGameTypeName: string
}

const isMobile = useIsMobile()
const authModalStore = useAuthModalStore()
const showH5HomePop = ref(true)
const isActiveHomeRoute = computed(() => stripLocalePrefix(router.currentRoute.value.path) === '/')
const shouldShowH5HomePop = computed(() => isActiveHomeRoute.value && showH5HomePop.value)
const closeH5HomePop = () => {
  showH5HomePop.value = false
}
const openRegisterModal = () => {
  authModalStore.openRegisterModal()
}
const showActivityPop = ref(true)
const shouldShowActivityPop = computed(() => isActiveHomeRoute.value && showActivityPop.value)
const closeActivityPop = () => {
  showActivityPop.value = false
}

const listImg = computed(() => [
  {
    name: t('home.Poker'),
    img: contract,
    icon: icon
  },
  {
    name: t('home.slots'),
    img: slots,
    icon: icon1
  },
  {
    name: t('home.fishing'),
    img: fishing,
    icon: icon2
  },
  {
    name: t('home.live'),
    img: live,
    icon: icon3
  },
  {
    name: t('home.lottery'),
    img: combination,
    icon: icon4
  }
])

interface RecentBigWin {
  src: string
  name: string
  number: string
}

const list = ref<RecentBigWin[]>([])
const getRecentBigWinsData = async () => {
  try {
    const res = await Api.home.getRecentBigWins({ currency: currentCurrency.value, type: 1 })
    list.value =
      res.result?.map((item: any) => ({
        src: toGameImageUrl(item.coverImg),
        name: item.nickName,
        number: item.winAmount
      })) || []
  } catch (error) {
    console.error('getRecentBigWins failed', error)
  } finally {
    void nextTick(() => startMarqueeRaf())
  }
}

const MARQUEE_REPEAT = 4
const duplicatedList = computed(() =>
  Array.from({ length: MARQUEE_REPEAT }, () => list.value).flat()
)

/** 近期大奖：自动 scrollLeft*/
const marqueeRef = ref<HTMLElement | null>(null)
const marqueeHoverPaused = ref(false)
const marqueePointerActive = ref(false)
const AUTO_MARQUEE_SEGMENT_SEC = 20
let marqueeRafId = 0
let marqueeLastTs = 0
let marqueeProgramScroll = false
let marqueeUserScrollUntil = 0
/** 松手或用户滚动后：无操作满此时长再恢复自动滚 */
const MARQUEE_IDLE_RESUME_MS = 2000
let marqueeLoopRunning = false

let marqueeLastProgrammaticScrollMs = 0
let marqueeResizeObserver: ResizeObserver | null = null

const stopMarqueeRaf = () => {
  marqueeLoopRunning = false
  if (marqueeRafId) {
    cancelAnimationFrame(marqueeRafId)
    marqueeRafId = 0
  }
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
  marqueeLastProgrammaticScrollMs = performance.now()
  el.scrollLeft += speedPxPerSec * dt
  if (el.scrollLeft >= segment) {
    el.scrollLeft -= segment
    marqueeLastProgrammaticScrollMs = performance.now()
  }
  queueMicrotask(() => {
    marqueeProgramScroll = false
  })
}

const startMarqueeRaf = () => {
  stopMarqueeRaf()
  void nextTick(() => {
    requestAnimationFrame(() => {
      const el = marqueeRef.value
      if (!el || list.value.length === 0) {
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

const onMarqueeScroll = () => {
  if (marqueeProgramScroll) return
  if (performance.now() - marqueeLastProgrammaticScrollMs < 48) return
  bumpMarqueeUserIdlePause()
}

const marqueeDrag = {
  active: false,
  pointerId: -1,
  startX: 0,
  startScroll: 0,
  moved: false
}
const MARQUEE_DRAG_THRESHOLD = 8
let marqueeSuppressClick = false

const onMarqueePointerDown = (e: PointerEvent) => {
  marqueeSuppressClick = false
  marqueePointerActive.value = true
  if (e.pointerType !== 'mouse' || e.button !== 0) return
  const el = marqueeRef.value
  if (!el) return
  marqueeDrag.active = true
  marqueeDrag.moved = false
  marqueeDrag.pointerId = e.pointerId
  marqueeDrag.startX = e.clientX
  marqueeDrag.startScroll = el.scrollLeft
  el.setPointerCapture(e.pointerId)
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
  marqueePointerActive.value = false
  if (marqueeDrag.active && e.pointerId === marqueeDrag.pointerId) {
    const el = marqueeRef.value
    try {
      el?.releasePointerCapture(e.pointerId)
    } catch {
      console.error('releasePointerCapture failed')
    }
    if (marqueeDrag.moved) {
      marqueeSuppressClick = true
    }
    marqueeDrag.active = false
    marqueeDrag.pointerId = -1
  }
  // 松手后起算：后续无操作满 MARQUEE_IDLE_RESUME_MS 再恢复自动滚（惯性滚动仍会走 onMarqueeScroll 续期）
  bumpMarqueeUserIdlePause()
}

const onMarqueePointerCancel = onMarqueePointerUp

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

const gameData = ref<HomeGameSection[]>([])
const rawGameData = ref<RawGameDataItem[]>([])

const toGameImageUrl = (value: string) => {
  if (!value) {
    return placeholderImg
  }
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

const mapHomeGameSections = (source: RawGameDataItem[]): HomeGameSection[] => {
  return source.map(item => ({
    list: item?.subGame?.[0]?.subGame?.slice(0, 10) || [],
    sysGameTypeCode: item?.sysGameTypeCode || '',
    sysGameTypeName: item?.sysGameTypeName || ''
  }))
}

const sportsProviders = computed<RawGameDataItem[]>(() => {
  const sportsSection = rawGameData.value.find(
    (item: RawGameDataItem) => item?.sysGameTypeCode === 'TY'
  )

  return sportsSection?.subGame ?? []
})

const sportsEventList = computed<EventListItem[]>(() => {
  return sportsProviders.value.map(item => ({
    rowId: item.rowId,
    image: toGameImageUrl(item?.subGame?.[0]?.gameItemHotVo?.defaultImage ?? '')
  }))
})

const querySlideshowList = ref<any>([])
const getQuerySlideshow = async () => {
  try {
    const response = await Api.home.getQuerySlideshow({
      languageCode: getStorageLanguageCode(String(locale.value)),
      deploymentPath: 1,
      requireLogin: isLogin.value ? 1 : 0,  
      channelId: isMobile.value ? '4' : '3',
      page: {
        current: 1,
        size: 30
      }
    })
    console.log('getQuerySlideshow response', response)
    querySlideshowList.value = Array.isArray(response?.result?.records)
      ? response.result.records
      : []
  } catch (error) {
    console.error('getQuerySlideshow failed', error)
    querySlideshowList.value = []
  }
}

onMounted(async () => {
  try {
    const res = await Api.home.getGameData()
    const rawResult = Array.isArray(res.result) ? res.result : []
    console.log('rawResult', rawResult)
    rawGameData.value = rawResult
    gameData.value = mapHomeGameSections(rawResult)
    localStorage.setItem('gameData', JSON.stringify(rawResult))

    getRecentBigWinsData()
    getQuerySlideshow()
  } catch (error) {
    console.error('getGameData failed', error)
  }

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
  marqueeResizeObserver?.disconnect()
  marqueeResizeObserver = null
  stopMarqueeRaf()
})
</script>

<style scoped lang="scss">
.home {
  background-color: var(--color-background-level-1);
}
.bg-success {
  background-color: #24ee89;
}
.border-b-brand {
  border-bottom-color: #24ee89;
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
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* 两侧渐隐，突出横向自动滚动区域 */
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

.bg-layer4 {
  background-color: var(--color-background-level-2);
}

@media (min-width: 640px) {
  .sm\:h-\[120px\] {
    height: 120px;
  }
  .h5State {
    display: none;
  }
}
@media (max-width: 639px) {
  .pcState {
    display: none;
  }
  .gameTypeImg {
    width: 69%;
  }
}
</style>
