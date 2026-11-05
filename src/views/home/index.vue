<template>
  <div class="home mx-auto max-w-[1248px] py-2 sm:py-4" data-tab-transition="slide">
    <div style="height: 55px" class="mb-2.5 sm:hidden"></div>

    <HomeCarouselImg
      v-if="isSlideshowLoading || querySlideshowList.length"
      :list="querySlideshowList"
      :loading="isSlideshowLoading"
      class="mb-2.5"
    />
    <div class="px-3.5 pb-[90px] sm:pb-[0px]">
      <!--Favorites Games -->
      <GameList
        v-if="isLogin && (isHomeCollectionsLoading || favoriteHomeGames.length)"
        :title="t('home.favorites_games')"
        sysGameTypeCode="favorites"
        :list="favoriteHomeGames"
        :loading="isHomeCollectionsLoading"
      />
      <RecentBigWins />

      <div class="overflow-hidden px-4 sm:rounded-xl sm:bg-layer3 sm:px-3">
        <div class="-mx-4 bg-layer2">
          <div class="flex w-full flex-col items-stretch gap-2 sm:mt-4 lg:!gap-4">
            <div class="flex gap-2 lg:!gap-4">
              <button
                v-for="card in featureCards"
                :key="card.path"
                class="home-category-card relative aspect-[507/333] flex-1 overflow-hidden rounded-xl bg-cover bg-center text-white sm:aspect-auto sm:h-[176px] sm:bg-right"
                :style="getCardBgStyle(card)"
                type="button"
                @click="navigateTo(card.path)"
              >
                <div
                  class="absolute left-3 top-3 flex flex-col sm:inset-y-0 sm:left-0 sm:top-0 sm:w-[61%] sm:items-center sm:justify-center sm:px-4 sm:text-center"
                >
                  <div class="flex items-center gap-1.5 sm:gap-2">
                    <img :src="card.icon" alt="" class="home-card-icon w-[19px] sm:w-7" />
                    <h2 class="text-sm font-extrabold uppercase sm:text-xl">
                      {{ card.name }}
                    </h2>
                  </div>
                  <p
                    class="mt-2 hidden max-w-[240px] text-sm leading-[18px] text-white/90 sm:block"
                  >
                    {{ card.desc }}
                  </p>
                </div>
              </button>
            </div>

            <div
              class="flex flex-nowrap gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible lg:!gap-4"
            >
              <button
                v-for="value in listImg"
                :key="value.sysGameTypeCode"
                class="home-category-card relative aspect-[189/246] w-[calc((100%-2rem)/5)] shrink-0 overflow-hidden rounded-xl bg-cover bg-center text-white sm:aspect-auto sm:h-[120px] sm:w-[calc((100%-2.5rem)/5.1)] sm:bg-right lg:min-w-0 lg:w-auto lg:flex-1"
                :style="getCardBgStyle(value)"
                type="button"
                @click="toCasino(value.sysGameTypeCode)"
              >
                <div
                  class="absolute inset-y-0 left-0 hidden w-[58%] flex-col items-center justify-center gap-1.5 sm:flex"
                >
                  <img :src="value.icon" alt="" class="home-card-icon w-7" />
                  <h2 class="text-base font-extrabold uppercase">{{ value.name }}</h2>
                </div>
                <div class="absolute bottom-2 left-0 w-full px-0.5 text-center sm:hidden">
                  <span class="block truncate text-[0.625rem] font-extrabold uppercase">
                    {{ value.h5Name }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <template v-if="isGameDataLoading">
          <GameList
            v-for="index in homeGameSkeletonCount"
            :key="`game-skeleton-${index}`"
            loading
          />
        </template>
        <template v-else>
          <GameList
            v-if="firstGameSection"
            :title="firstGameSection.sysGameTypeName"
            :sysGameTypeCode="firstGameSection.sysGameTypeCode"
            :list="firstGameSection.list"
            :brand-items="firstGameSection.brandItems"
          />
          <LazySection
            v-for="value in deferredGameSections"
            :key="value.sysGameTypeCode || value.sysGameTypeName"
          >
            <template #placeholder>
              <GameList loading />
            </template>
            <GameList
              :title="value.sysGameTypeName"
              :sysGameTypeCode="value.sysGameTypeCode"
              :list="value.list"
              :brand-items="value.brandItems"
            />
          </LazySection>
        </template>
        <LazySection v-if="isGameDataLoading || sportsEventList.length">
          <template #placeholder>
            <div class="mt-2">
              <div class="mt-2 flex h-8 items-center sm:mt-6">
                <div class="h-5 w-24 rounded bg-bg-2 animate-pulse"></div>
                <div class="ml-auto h-8 w-14 rounded-lg bg-bg-2 animate-pulse"></div>
              </div>
              <div class="mt-3 grid grid-flow-col gap-2 overflow-hidden">
                <div
                  v-for="index in 3"
                  :key="`event-skeleton-${index}`"
                  class="rounded-[12px] bg-[var(--color-background-level-2)] p-1"
                >
                  <div class="aspect-[2.12] rounded-xl bg-bg-2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </template>
          <Suspense>
            <template #default>
              <AsyncEventList :list="sportsEventList" :loading="isGameDataLoading" />
            </template>
            <template #fallback>
              <div class="mt-2">
                <div class="mt-2 flex h-8 items-center sm:mt-6">
                  <div class="h-5 w-24 rounded bg-bg-2 animate-pulse"></div>
                  <div class="ml-auto h-8 w-14 rounded-lg bg-bg-2 animate-pulse"></div>
                </div>
                <div class="mt-3 grid grid-flow-col gap-2 overflow-hidden">
                  <div
                    v-for="index in 3"
                    :key="`event-fallback-${index}`"
                    class="rounded-[12px] bg-[var(--color-background-level-2)] p-1"
                  >
                    <div class="aspect-[2.12] rounded-xl bg-bg-2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </template>
          </Suspense>
        </LazySection>
      </div>

      <div class="mt-4 rounded-xl bg-[var(--color-background-level-2)] sm:mt-7">
        <div class="w-full items-center justify-between px-[22px] pb-4 pt-3 lg:!hidden flex">
          <img class="w-6" :src="BTC" alt="" />
          <img class="w-6" :src="ETH" alt="" />
          <img class="w-6" :src="BNB" alt="" />
          <img class="w-6" :src="XRP" alt="" />
          <img class="w-6" :src="USDT" alt="" />
          <img class="w-6" :src="USDC" alt="" />
          <img class="w-6" :src="SOL" alt="" />
          <img class="w-6" :src="ADA" alt="" />
          <img class="w-6" :src="DOGE" alt="" />
          <img class="w-6" :src="MATIC" alt="" />
          <img class="w-6" :src="TRX" alt="" />
        </div>

        <div class="relative h-20 rounded-xl bg-bg-2 lg:px-8">
          <div class="pointer-events-none absolute left-0 size-full overflow-hidden blur">
            <img class="absolute -top-3 left-4 scale-[2]" :src="dotC8z5Aoh" alt="" />
            <img class="absolute left-24 top-14 scale-150" :src="dotC8z5Aoh" alt="" />
            <img class="absolute -top-2 left-40 scale-[2]" :src="dotC8z5Aoh" alt="" />
            <img class="absolute -top-3 left-72 scale-[3]" :src="dotC8z5Aoh" alt="" />
            <img class="absolute left-80 top-15 scale-150" :src="dotC8z5Aoh" alt="" />
            <img class="absolute -bottom-3 right-4 scale-[2]" :src="dotC8z5Aoh" alt="" />
            <img class="absolute bottom-14 right-24 scale-150" :src="dotC8z5Aoh" alt="" />
            <img class="absolute -bottom-2 right-40 scale-[2]" :src="dotC8z5Aoh" alt="" />
            <img class="absolute -bottom-3 right-72 scale-[3]" :src="dotC8z5Aoh" alt="" />
            <img class="absolute bottom-15 right-80 scale-150" :src="dotC8z5Aoh" alt="" />
          </div>
          <div
            class="relative z-10 flex h-full flex-col items-center justify-center lg:!flex-row-reverse"
          >
            <div class="max-lg:hidden lg:flex lg:items-center lg:justify-center">
              <img class="-ml-1 w-6" :src="BTC" alt="" />
              <img class="-ml-1 w-6" :src="ETH" alt="" />
              <img class="-ml-1 w-6" :src="BNB" alt="" />
              <img class="-ml-1 w-6" :src="XRP" alt="" />
              <img class="-ml-1 w-6" :src="USDT" alt="" />
              <img class="-ml-1 w-6" :src="USDC" alt="" />
              <img class="-ml-1 w-6" :src="SOL" alt="" />
              <img class="-ml-1 w-6" :src="ADA" alt="" />
              <img class="-ml-1 w-6" :src="DOGE" alt="" />
              <img class="-ml-1 w-6" :src="MATIC" alt="" />
              <img class="-ml-1 w-6" :src="TRX" alt="" />
            </div>
            <div class="mx-auto hidden items-center justify-center gap-6 max-sm:hidden sm:flex">
              <img class="w-14" :src="MAYA" alt="" />
              <img class="w-20" :src="GCASH" alt="" />
              <img class="w-14" :src="VISA" alt="" />
              <img class="w-13" :src="GROU" alt="" />
              <img class="w-23" :src="SHOPEE" alt="" />
            </div>
            <div class="mt-2 flex w-full items-center justify-between px-[10px] sm:hidden">
              <img class="h-[13px]" :src="MAYA" alt="" />
              <img class="h-[13px]" :src="GCASH" alt="" />
              <img class="h-[13px]" :src="VISA" alt="" />
              <img class="h-[13px]" :src="GROU" alt="" />
              <img class="h-[13px]" :src="SHOPEE" alt="" />
            </div>
            <div class="mt-4 flex items-center justify-center gap-11 lg:!mt-0">
              <div class="text-lg font-semibold sm:text-2xl">
                <span class="text-secondary-4">300%</span> {{ $t('home.DepositBonus') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LazySection class="mt-2">
        <template #placeholder>
          <div class="mt-2 rounded-xl bg-[var(--color-background-level-2)] p-3 sm:p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="h-5 w-32 rounded bg-bg-2 animate-pulse"></div>
              <div class="flex gap-2">
                <div class="h-8 w-20 rounded-lg bg-bg-2 animate-pulse"></div>
                <div class="h-8 w-20 rounded-lg bg-bg-2 animate-pulse"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div
                v-for="index in 6"
                :key="`latest-skeleton-${index}`"
                class="h-10 rounded-lg bg-bg-2 animate-pulse"
              ></div>
            </div>
          </div>
        </template>
        <Suspense>
          <template #default>
            <AsyncNewEvent class="mt-2" />
          </template>
          <template #fallback>
            <div class="mt-2 rounded-xl bg-[var(--color-background-level-2)] p-3 sm:p-4">
              <div class="mb-3 flex items-center justify-between">
                <div class="h-5 w-32 rounded bg-bg-2 animate-pulse"></div>
                <div class="flex gap-2">
                  <div class="h-8 w-20 rounded-lg bg-bg-2 animate-pulse"></div>
                  <div class="h-8 w-20 rounded-lg bg-bg-2 animate-pulse"></div>
                </div>
              </div>
              <div class="space-y-2">
                <div
                  v-for="index in 6"
                  :key="`latest-fallback-${index}`"
                  class="h-10 rounded-lg bg-bg-2 animate-pulse"
                ></div>
              </div>
            </div>
          </template>
        </Suspense>
      </LazySection>
    </div>
  </div>

  <H5HomePop v-if="shouldShowH5HomePop" :key="homePopupScope" @close="closeH5HomePop" />
  <CommonFooter class="hidden sm:block" />
</template>

<script setup lang="ts">
import Api from '@/api'
import CommonFooter from '@/components/commonFooter.vue'
import H5HomePop from '@/components/H5HomePop.vue'
import HomeCarouselImg from '@/components/homeCarouselImg.vue'
import type { GameBrandItem, GameDataItem } from '@/api/interface/game'
import type { CasinoLobbyButtonItem } from '@/composables/useCasinoTabButtons'
import type { QuerySlideshowItem } from '@/api/interface/home.interface'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useCasinoTabsStore } from '@/stores/casinoTabs'
import { useGameStore, type HomeCollectionDisplayItem } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { resolveGameImageUrl } from '@/utils/image'
import { getStorageLanguageCode } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { maybeAutoOpenTicketActivity } from '@/utils/autoOpenTicketActivity'
import { homePopVisitState } from '@/utils/homePopVisit'
import { getPopupContext } from '@/utils/popupContext'
import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import GameList from './components/gameList.vue'
import LazySection from './components/LazySection.vue'
import RecentBigWins from './components/RecentBigWins.vue'

import slotsIcon from './img/Image.svg?url'
import fishingIcon from './img/Image1.svg?url'
import liveIcon from './img/Image2.svg?url'
import lotteryIcon from './img/Image3.svg?url'
import casinoIcon from './img/Image5.svg?url'
import sportsIcon from './img/Image6.svg?url'
import contractIcon from './img/pokerIcon.svg?url'

import ADA from '@/static/svg/coin/ADA.black.svg?url'
import BNB from '@/static/svg/coin/BNB.black.svg?url'
import BTC from '@/static/svg/coin/BTC.black.svg?url'
import DOGE from '@/static/svg/coin/DOGE.black.svg?url'
import dotC8z5Aoh from '@/static/svg/coin/dot-C8z5Aoh_.svg?url'
import ETH from '@/static/svg/coin/ETH.black.svg?url'
import GCASH from '@/static/svg/coin/gcash.svg?url'
import GROU from '@/static/svg/coin/GrouPay.svg?url'
import MATIC from '@/static/svg/coin/MATIC.black.svg?url'
import MAYA from '@/static/svg/coin/maya.svg?url'
import SHOPEE from '@/static/svg/coin/shopeePay.svg?url'
import SOL from '@/static/svg/coin/SOL.black.svg?url'
import TRX from '@/static/svg/coin/TRX.black.svg?url'
import USDC from '@/static/svg/coin/USDC.black.svg?url'
import USDT from '@/static/svg/coin/USDT.black.svg?url'
import VISA from '@/static/svg/coin/VISA.svg?url'
import XRP from '@/static/svg/coin/XRP.black.svg?url'

import placeholderImg from '@/static/img/home/errImg1.png'
import casinoCardImg from '@/static/img/home/CASINO.png'
import sportsCardImg from '@/static/img/home/SPORTS.png'
import slotsCardImg from '@/static/img/home/SLOTS.png'
import contractCardImg from '@/static/img/home/CONTRACT.png'
import fishingCardImg from '@/static/img/home/FISHING.png'
import liveCardImg from '@/static/img/home/LIVE CASINO.png'
import lotteryCardImg from '@/static/img/home/LOTTERY.png'
import casinoCardH5Img from '@/static/img/home/h5/CASINO.png'
import sportsCardH5Img from '@/static/img/home/h5/SPORTS.png'
import slotsCardH5Img from '@/static/img/home/h5/SLOTS.png'
import contractCardH5Img from '@/static/img/home/h5/Contract.png'
// h5 目录下 FISHING / LIVE / Lottery 三张图的文件名与内容错位，按图片内容引用
import fishingCardH5Img from '@/static/img/home/h5/Lottery.png'
import liveCardH5Img from '@/static/img/home/h5/FISHING.png'
import lotteryCardH5Img from '@/static/img/home/h5/LIVE.png'

interface EventListItem {
  image: string
  rowId: number
}

interface HomeGameSection {
  sysGameTypeCode: string
  list: GameDataItem[]
  sysGameTypeName: string
  brandItems?: GameBrandItem[]
}

const userStore = useUserStore()
const gameStore = useGameStore()
const casinoTabsStore = useCasinoTabsStore()
const AsyncEventList = defineAsyncComponent(() => import('./components/eventList.vue'))
const AsyncNewEvent = defineAsyncComponent(() => import('./components/newEvent.vue'))
const { userInfo, acctInfo } = storeToRefs(userStore)
const isLogin = computed(() => Boolean(userInfo.value?.tradeToken))
const { homeCollectionsData, isHomeCollectionsLoading } = storeToRefs(gameStore)
const { t, locale } = useI18n()
const isMobile = useIsMobile()

const showH5HomePop = ref(true)
const homePopupScope = computed(() => JSON.stringify(getPopupContext()))
const shouldShowH5HomePop = computed(
  () => isMobile.value && homePopVisitState.isHome && showH5HomePop.value
)
const gameData = ref<HomeGameSection[]>([])
const rawGameData = ref<GameDataItem[]>([])
const querySlideshowList = ref<QuerySlideshowItem[]>([])
const isGameDataLoading = ref(false)
const isSlideshowLoading = ref(false)

const closeH5HomePop = () => {
  showH5HomePop.value = false
}

const featureCards = computed(() => [
  {
    name: t('home.Casino'),
    desc: t('home.labelLabel'),
    img: casinoCardImg,
    h5Img: casinoCardH5Img,
    icon: casinoIcon,
    path: '/casino'
  },
  {
    name: t('home.Sports'),
    desc: t('home.SportsLabel'),
    img: sportsCardImg,
    h5Img: sportsCardH5Img,
    icon: sportsIcon,
    path: '/sports'
  }
])

const listImg = computed(() => [
  {
    name: t('home.slots'),
    h5Name: t('home.slots'),
    img: slotsCardImg,
    h5Img: slotsCardH5Img,
    icon: slotsIcon,
    sysGameTypeCode: 'DZ'
  },
  {
    name: t('home.contract'),
    h5Name: t('home.contract'),
    img: contractCardImg,
    h5Img: contractCardH5Img,
    icon: contractIcon,
    sysGameTypeCode: 'QP'
  },
  {
    name: t('home.fishing'),
    h5Name: t('home.fishing'),
    img: fishingCardImg,
    h5Img: fishingCardH5Img,
    icon: fishingIcon,
    sysGameTypeCode: 'BY'
  },
  {
    name: t('home.LiveCasino'),
    h5Name: t('home.live'),
    img: liveCardImg,
    h5Img: liveCardH5Img,
    icon: liveIcon,
    sysGameTypeCode: 'live'
  },
  {
    name: t('home.lottery'),
    h5Name: t('home.lottery'),
    img: lotteryCardImg,
    h5Img: lotteryCardH5Img,
    icon: lotteryIcon,
    sysGameTypeCode: 'CP'
  }
])

const getCardBgStyle = (card: { img: string; h5Img: string }) => ({
  '--home-card-bg-h5': `url('${card.h5Img}')`,
  '--home-card-bg-pc': `url('${card.img}')`
})

const homeGameSkeletonCount = computed(() => (isMobile.value ? 2 : 3))

const toCasino = (sysGameTypeCode: string) => {
  if (!sysGameTypeCode) {
    return
  }
  navigateTo(`/casino/${sysGameTypeCode}`)
}

const toGameImageUrl = (value: string) => {
  if (!value) {
    return placeholderImg
  }
  return resolveGameImageUrl(value)
}

const HOME_LOBBY_EXCLUDED_CODES = new Set(['', 'hot_games', 'providers'])

const isHomeCollectionDisplayItem = (
  item: GameDataItem | HomeCollectionDisplayItem
): item is HomeCollectionDisplayItem => {
  return typeof item === 'object' && item !== null && 'source' in item && 'game' in item
}

/** 与娱乐城大厅 `loadCasinoLobbyButtons` 同源；首页不展示 hot_games、providers */
const mapLobbyButtonsToHomeSections = (buttons: CasinoLobbyButtonItem[]): HomeGameSection[] => {
  return buttons
    .filter(btn => {
      const code = String(btn.sysGameTypeCode ?? '').trim()
      return !HOME_LOBBY_EXCLUDED_CODES.has(code)
    })
    .map(btn => ({
      sysGameTypeCode: String(btn.sysGameTypeCode ?? '').trim(),
      sysGameTypeName: String(btn.sysGameTypeName ?? '').trim(),
      list: (btn.items ?? [])
        .map((item): GameDataItem => (isHomeCollectionDisplayItem(item) ? item.game : item))
        .slice(0, 10)
    }))
    .filter(section => section.list.length > 0)
}

const sportsProviders = computed<GameDataItem[]>(() => {
  const sportsSection = rawGameData.value.find(
    (item: GameDataItem) => item?.sysGameTypeCode === 'TY'
  )

  return sportsSection?.subGame ?? []
})

const sportsEventList = computed<EventListItem[]>(() => {
  return sportsProviders.value.map(item => ({
    rowId: item.rowId,
    image: toGameImageUrl(item?.subGame?.[0]?.gameItemHotVo?.defaultImage ?? '')
  }))
})
const firstGameSection = computed<HomeGameSection | null>(() => gameData.value[0] ?? null)
const deferredGameSections = computed<HomeGameSection[]>(() => gameData.value.slice(1))
const favoriteHomeGames = computed(() => {
  return homeCollectionsData.value.filter(item => Number(item.game?.rowId) > 0)
})

const fetchHomeFavoritesModule = async () => {
  if (!isLogin.value) {
    return
  }

  const memberRowId = Number(acctInfo.value?.memberRowId)
  if (!Number.isFinite(memberRowId) || memberRowId <= 0) {
    return
  }

  await gameStore.fetchHomeCollectionsData(memberRowId)
}

const fetchGameData = async () => {
  isGameDataLoading.value = true
  try {
    const [rawResult] = await Promise.all([
      gameStore.ensureGameData(),
      casinoTabsStore.loadCasinoLobbyButtons()
    ])
    rawGameData.value = rawResult as GameDataItem[]
    gameData.value = mapLobbyButtonsToHomeSections(casinoTabsStore.lobbyButtons)
  } catch (error) {
    console.error('getGameData failed', error)
  } finally {
    isGameDataLoading.value = false
  }
}

const getQuerySlideshow = async () => {
  isSlideshowLoading.value = true
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
    const records = Array.isArray(response?.result?.records) ? response.result.records : []
    querySlideshowList.value = records
  } catch (error) {
    console.error('getQuerySlideshow failed', error)
    querySlideshowList.value = []
  } finally {
    isSlideshowLoading.value = false
  }
}

onMounted(async () => {
  await Promise.allSettled([fetchGameData(), getQuerySlideshow(), fetchHomeFavoritesModule()])
})

watch(
  () => isLogin.value,
  isNowLogin => {
    if (!isNowLogin) {
      return
    }
    void fetchHomeFavoritesModule()
  }
)

watch(
  homePopupScope,
  () => {
    if (!homePopVisitState.isHome) return
    homePopVisitState.hasShown = false
    showH5HomePop.value = true
    void maybeAutoOpenTicketActivity()
  },
  // 统一由账号/首页访问变化创建新弹窗，避免缓存激活钩子再次启用已关闭的旧实例。
  { immediate: true, flush: 'pre' }
)
</script>

<style scoped lang="scss">
.home {
  background-color: var(--color-background-level-1);
}

/* 断点与模板中的 sm: 保持一致，H5 与 PC 使用不同比例的卡片图 */
.home-category-card {
  background-image: var(--home-card-bg-h5);

  @media (min-width: 640px) {
    background-image: var(--home-card-bg-pc);
  }
}

/* 图标源文件为灰/绿配色，卡片上统一显示为白色 */
.home-card-icon {
  filter: brightness(0) invert(1);
}
</style>
