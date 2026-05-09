<template>
  <div class="home mx-auto max-w-[1248px] py-2 sm:px-4 sm:py-4">
    <div style="height: 55px" class="sm:hidden"></div>

    <HomeCarouselImg
      v-if="isSlideshowLoading || querySlideshowList.length"
      :list="querySlideshowList"
      :loading="isSlideshowLoading"
    />
    <div class="px-3.5">
      <RecentBigWins />

      <div class="overflow-hidden px-4 sm:rounded-xl sm:bg-layer3 sm:px-3">
        <div class="-mx-4 bg-layer2">
          <div class="flex w-full flex-col items-stretch gap-2 sm:mt-4 lg:!gap-4">
            <div class="flex flex-3 gap-2 lg:!gap-4">
              <button
                class="button button-m center relative col-span-2 col-start-1 h-32 flex-1 overflow-hidden rounded-xl bg-game-casino p-[10px] font-extrabold sm:h-[176px] sm:p-5"
                type="button"
                @click="navigateTo('/casino')"
              >
                <img
                  class="absolute left-[31%] right-[1px] top-0 h-[100%] sm:left-auto"
                  src="./img/casino.png"
                  alt=""
                />
                <div class="relative z-10 flex h-full flex-auto flex-col">
                  <div class="flex items-center">
                    <div class="color_icon_img casino" style="transform: scale(1)"></div>
                    <img :src="icon5" alt="" class="w-[19px] sm:w-[32px]" />
                    <h2 class="ml-0.5 text-sm sm:text-[12px]">{{ $t('home.Casino') }}</h2>
                  </div>
                </div>
              </button>
              <button
                class="button button-m center relative col-start-1 h-32 flex-1 overflow-hidden rounded-xl bg-game-sports p-[10px] font-extrabold sm:h-[176px] sm:p-5"
                type="button"
              >
                <img
                  class="absolute left-[34%] right-[1px] top-0 h-[100%] sm:left-auto"
                  src="./img/sports.png"
                  alt=""
                />
                <div class="relative z-10 flex h-full flex-auto flex-col">
                  <div class="flex items-center">
                    <div class="color_icon_img sports" style="transform: scale(1)"></div>
                    <img :src="icon6" alt="" class="w-[19px] sm:w-[32px]" />
                    <span class="ml-0.5 text-sm sm:text-[12px]">{{ $t('home.Sports') }}</span>
                  </div>
                </div>
              </button>
            </div>

            <div
              class="flex flex-nowrap gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible lg:!gap-4"
            >
              <button
                v-for="value in listImg"
                :key="value.name"
                class="button button-m center relative h-20 w-[calc((100%-2.5rem)/5.1)] shrink-0 overflow-hidden rounded-xl bg-layer4 p-2 font-extrabold sm:h-[120px] lg:min-w-0 lg:w-auto lg:flex-1"
                type="button"
                @click="toCasino(value.sysGameTypeCode)"
                style="
                  background-image: linear-gradient(
                    to left,
                    rgba(39, 232, 187, 0.2),
                    transparent 75%
                  );
                "
              >
                <img
                  class="gameTypeImg absolute left-1/2 top-[10%] -translate-x-1/2 sm:left-[50%] sm:top-[16%] sm:h-[66%] sm:-translate-x-[10%]"
                  :src="value.img"
                  alt=""
                />
                <div class="pcState absolute left-2 top-2 flex flex-col">
                  <div class="color_icon_img bcpoker">
                    <img :src="value.icon" class="w-[32px] h-[32px]" alt="" />
                  </div>
                  <h2 class="ml-1 text-[13px] font-extrabold">{{ value.name }}</h2>
                </div>
                <div class="h5State absolute bottom-1 left-0 block w-full text-center">
                  <span class="text-[0.625rem] font-extrabold sm:text-sm">{{ value.name }}</span>
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
            :platformLogoSrc="firstGameSection.platformLogoSrc"
            :list="firstGameSection.list"
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
              :platformLogoSrc="value.platformLogoSrc"
              :list="value.list"
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
              <div class="text-lg font-extrabold sm:text-2xl">
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

  <H5HomePop v-if="shouldShowH5HomePop" class="sm:hidden" @close="closeH5HomePop" />
  <CommonFooter class="hidden sm:block" />
</template>

<script setup lang="ts">
import Api from '@/api'
import CommonFooter from '@/components/commonFooter.vue'
import H5HomePop from '@/components/H5HomePop.vue'
import HomeCarouselImg from '@/components/homeCarouselImg.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import router from '@/router'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { getStorageLanguageCode, stripLocalePrefix } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GameList from './components/gameList.vue'
import LazySection from './components/LazySection.vue'
import RecentBigWins from './components/RecentBigWins.vue'

import icon1 from './img/Image.svg?url'
import icon2 from './img/Image1.svg?url'
import icon3 from './img/Image2.svg?url'
import icon4 from './img/Image3.svg?url'
import icon5 from './img/Image5.svg?url'
import icon6 from './img/Image6.svg?url'
import icon7 from './img/Image7.svg?url'
import pokerIcon from './img/pokerIcon.svg?url'

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

import combination from '@/static/img/home/combination.png'
import contract from '@/static/img/home/contract.png'
import placeholderImg from '@/static/img/home/errImg1.png'
import fishing from '@/static/img/home/fishing.png'
import live from '@/static/img/home/live.png'
import slots from '@/static/img/home/slots.png'
import table from '@/static/img/home/table.png'

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
  platformLogoSrc: string
}

const userStore = useUserStore()
const gameStore = useGameStore()
const AsyncEventList = defineAsyncComponent(() => import('./components/eventList.vue'))
const AsyncNewEvent = defineAsyncComponent(() => import('./components/newEvent.vue'))
const { userInfo } = storeToRefs(userStore)
const isLogin = computed(() => Boolean(userInfo.value?.tradeToken))
const { t, locale } = useI18n()
const isMobile = useIsMobile()

const showH5HomePop = ref(true)
const isActiveHomeRoute = computed(() => stripLocalePrefix(router.currentRoute.value.path) === '/')
const shouldShowH5HomePop = computed(
  () => isMobile.value && isActiveHomeRoute.value && showH5HomePop.value
)
const gameData = ref<HomeGameSection[]>([])
const rawGameData = ref<RawGameDataItem[]>([])
const querySlideshowList = ref<any[]>([])
const isGameDataLoading = ref(false)
const isSlideshowLoading = ref(false)

const closeH5HomePop = () => {
  showH5HomePop.value = false
}

const listImg = computed(() => [
  {
    name: t('home.Poker'),
    img: contract,
    icon: pokerIcon,
    sysGameTypeCode: ''
  },
  {
    name: t('home.slots'),
    img: slots,
    icon: icon1,
    sysGameTypeCode: 'DZ'
  },
  {
    name: t('home.fishing'),
    img: fishing,
    icon: icon2,
    sysGameTypeCode: 'BY'
  },
  {
    name: t('home.live'),
    img: live,
    icon: icon3,
    sysGameTypeCode: 'live'
  },
  {
    name: t('home.lottery'),
    img: combination,
    icon: icon4,
    sysGameTypeCode: ''
  },
  {
    name: t('home.table'),
    img: table,
    icon: icon7,
    sysGameTypeCode: 'QP'
  }
])

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
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

const mapHomeGameSections = (source: RawGameDataItem[]): HomeGameSection[] => {
  return source.map(item => ({
    list: item?.subGame?.[0]?.subGame?.slice(0, 10) || [],
    sysGameTypeCode: item?.sysGameTypeCode || '',
    sysGameTypeName: item?.sysGameTypeName || '',
    platformLogoSrc: item?.subGame?.[0]?.icon4 || ''
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
const firstGameSection = computed<HomeGameSection | null>(() => gameData.value[0] ?? null)
const deferredGameSections = computed<HomeGameSection[]>(() => gameData.value.slice(1))

const fetchGameData = async () => {
  isGameDataLoading.value = true
  try {
    const rawResult = (await gameStore.ensureGameData()) as RawGameDataItem[]
    rawGameData.value = rawResult
    gameData.value = mapHomeGameSections(rawResult)
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
  await Promise.all([fetchGameData(), getQuerySlideshow()])
})
</script>

<style scoped lang="scss">
.home {
  background-color: var(--color-background-level-1);
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
