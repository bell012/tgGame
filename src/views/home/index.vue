<template>
  <div :class="['home max-w-[1248px] mx-auto py-4', { 'px-4': !isMobile }]">
    <img src="./headBack.png" />
    <!-- {{ $t('locales.home.home') }} -->
    <div class="flex items-center sm:mt-6 h-8">
      <h2 class="flex items-center text-base font-extrabold text-primary">
        <div class="relative mx-4 mr-2 h-2 w-2">
          <div class="absolute left-0 top-0 h-full w-full rounded-full bg-success z-10"></div>
          <div
            class="absolute left-0 top-0 h-full w-full rounded-full bg-success animate-ping"
          ></div>
        </div>
        <div>近期大胜</div>
        <div class="ml-2 gap-2 lg:!flex pcState">
          <div
            @click="carousel(0)"
            class="button button-m center h-auto flex-1 whitespace-nowrap rounded-none border-b-2 p-1 text-xs"
            :class="
              carouselVal == 0
                ? 'border-b-brand font-semibold text-primary'
                : 'border-b-transparent font-normal text-secondary'
            "
          >
            全部
          </div>
          <div
            @click="carousel(1)"
            class="button button-m center h-auto flex-1 whitespace-nowrap rounded-none border-b-2 p-1 text-xs"
            :class="
              carouselVal == 1
                ? 'border-b-brand font-semibold text-primary'
                : 'border-b-transparent font-normal text-secondary'
            "
          >
            BC 原创
          </div>
          <div
            @click="carousel(2)"
            class="button button-m center h-auto flex-1 whitespace-nowrap rounded-none border-b-2 p-1 text-xs"
            :class="
              carouselVal == 2
                ? 'border-b-brand font-semibold text-primary'
                : 'border-b-transparent font-normal text-secondary'
            "
          >
            老虎机
          </div>
          <div
            @click="carousel(3)"
            class="button button-m center h-auto flex-1 whitespace-nowrap rounded-none border-b-2 p-1 text-xs"
            :class="
              carouselVal == 3
                ? 'border-b-brand font-semibold text-primary'
                : 'border-b-transparent font-normal text-secondary'
            "
          >
            真人娱乐城
          </div>
        </div>
      </h2>
    </div>
    <div class="marquee overflow-hidden px-4 sm:rounded-xl sm:bg-layer3 sm:px-3">
      <div class="marquee-track recent-big-win inline-flex items-center gap-3 sm:gap-3.5">
        <a
          class="sm:w-13 flex h-28 w-14 flex-none flex-col items-center text-xs hover:opacity-80 sm:h-[106px] inactive"
          v-for="(item, idx) in duplicatedList"
          :key="idx"
        >
          <div class="relative mb-1 w-full rounded-lg pt-[133%]">
            <img src="./img/gameImg.png" class="absolute left-0 top-0 w-full rounded-lg" />
          </div>
          <div class="w-[118%]">
            <div class="flex items-center justify-center font-extrabold text-secondary">
              <img class="size-[0.875rem]" :src="icon" /><span class="ellipsis -ml-0.5 text-xxs"
                >BETPORTALL</span
              >
            </div>
            <div
              class="whitespace-nowrap text-nowrap text-center font-extrabold text-brand text-xxs"
            >
              {{ item }}
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
              class="button button-m center relative h-32 flex-1 overflow-hidden rounded-xl bg-layer4 p-1.5 font-extrabold sm:h-[176px] sm:p-5 col-span-2 col-start-1"
              type="button"
              style="background-image: linear-gradient(to left, rgb(44, 80, 64), transparent 75%)"
            >
              <img class="absolute right-5 top-0 h-[100%]" src="./img/casino.png" />
              <div class="relative z-10 flex h-full flex-auto flex-col">
                <div class="flex items-center">
                  <div class="color_icon_img casino" style="transform: scale(1)"></div>
                  <img :src="icon5" alt="" />
                  <h2 class="ml-0.5 text-sm sm:text-[22px]">娱乐城</h2>
                </div>
                <div
                  class="pcState mb-1.5 mt-auto max-w-60 text-left font-semibold text-primary block"
                >
                  尽情体验BC原创游戏、真人娱乐城和老虎机游戏。
                </div>
              </div>
            </button>
            <button
              class="button button-m center relative h-32 flex-1 overflow-hidden rounded-xl bg-layer4 p-1.5 font-extrabold sm:h-[176px] sm:p-5 col-span-2 col-start-1"
              type="button"
              style="
                background: linear-gradient(270deg, #582e59 0%, rgba(88, 46, 89, 0) 75%), #323738;
              "
            >
              <img class="absolute right-5 top-0 h-[100%]" src="./img/sports.png" />
              <div class="relative z-10 flex h-full flex-auto flex-col">
                <div class="flex items-center">
                  <div class="color_icon_img sports" style="transform: scale(1)"></div>
                  <img :src="icon6" alt="" />
                  <span class="ml-0.5 text-sm sm:text-[22px]">体育</span>
                </div>
                <div
                  class="pcState mb-1.5 mt-auto max-w-60 text-left font-semibold text-primary block"
                >
                  快来下注！足球、板球、NFL、电竞等 80 多种体育项目等你挑战！
                </div>
              </div>
            </button>
          </div>

          <div class="flex flex-4 flex-wrap gap-2 lg:!gap-3">
            <button
              v-for="value in listImg"
              class="button button-m center relative h-24 flex-1 overflow-hidden rounded-xl bg-layer4 p-2 font-extrabold sm:h-[120px]"
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
                class="absolute left-[50%] top-0 h-full -translate-x-[10%] gameTypeImg"
                :src="value.img"
              />
              <div class="pcState absolute left-2 top-2 items-center flex">
                <div class="color_icon_img bcpoker" style="transform: scale(0.8)">
                  <img :src="value.icon" alt="" />
                </div>
                <h2 class="ml-1 text-lg font-extrabold">{{ value.name }}</h2>
              </div>
              <div class="absolute bottom-2 left-0 block w-full text-center h5State">
                <span class="text-sm font-extrabold">{{ value.name }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div>
      <GameList />
      <EventList />
      <GameList />
    </div>
    <div class="mt-4 rounded-xl bg-[var(--color-background-level-2)] sm:mt-7">
      <div class="flex items-center justify-center gap-2 pb-4 pt-3 lg:!hidden">
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

      <div class="relative h-24 rounded-xl bg-[#171a1ab3] lg:px-8">
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
          <div class="flex items-center justify-center hidden lg:!flex">
            <img class="-ml-1 w-6" :src="BTC" /><img class="-ml-1 w-6" :src="ETH" />
            <img class="-ml-1 w-6" :src="BNB" /><img class="-ml-1 w-6" :src="XRP" />
            <img class="-ml-1 w-6" :src="USDT" /><img class="-ml-1 w-6" :src="USDC" />
            <img class="-ml-1 w-6" :src="SOL" /><img class="-ml-1 w-6" :src="ADA" />
            <img class="-ml-1 w-6" :src="DOGE" /><img class="-ml-1 w-6" :src="MATIC" />
            <img class="-ml-1 w-6" :src="TRX" />
          </div>
          <div class="flex items-center justify-center mx-auto gap-6">
            <img class="w-14" :src="MAYA" />
            <img class="w-20" :src="GCASH" />
            <img class="w-14" :src="VISA" />
            <img class="w-13" :src="GROU" />
            <img class="w-23" :src="SHOPEE" />
          </div>
          <div class="flex items-center justify-center mt-4 gap-11 lg:!mt-0">
            <div class="text-lg font-extrabold sm:text-2xl">
              <span class="text-brand">300%</span> 充值奖金
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <NewEvent />

  <CommonFooter />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import GameList from './components/gameList.vue'
import EventList from './components/eventList.vue'
import NewEvent from './components/newEvent.vue'
import icon from './img/Image4.svg?url'
import icon1 from './img/Image.svg?url'
import icon2 from './img/Image1.svg?url'
import icon3 from './img/Image2.svg?url'
import icon4 from './img/Image3.svg?url'
import icon5 from './img/Image5.svg?url'
import icon6 from './img/Image6.svg?url'

import BTC from '@/static/svg/coin/BTC.black.svg?url'
import ETH from '@/static/svg/coin/ETH.black.svg?url'
import BNB from '@/static/svg/coin/BNB.black.svg?url'
import XRP from '@/static/svg/coin/XRP.black.svg?url'
import USDT from '@/static/svg/coin/USDT.black.svg?url'
import USDC from '@/static/svg/coin/USDC.black.svg?url'
import SOL from '@/static/svg/coin/SOL.black.svg?url'
import ADA from '@/static/svg/coin/ADA.black.svg?url'
import DOGE from '@/static/svg/coin/DOGE.black.svg?url'
import MATIC from '@/static/svg/coin/MATIC.black.svg?url'
import TRX from '@/static/svg/coin/TRX.black.svg?url'
import MAYA from '@/static/svg/coin/maya.svg?url'
import GCASH from '@/static/svg/coin/gcash.svg?url'
import VISA from '@/static/svg/coin/visa.svg?url'
import GROU from '@/static/svg/coin/GrouPay.svg?url'
import SHOPEE from '@/static/svg/coin/shopeePay.svg?url'
import dotC8z5Aoh from '@/static/svg/coin/dot-C8z5Aoh_.svg?url'

import poker from './img/poker.png?url'
import racing from './img/racing.png?url'
import lottery from './img/lottery.png?url'
import updown from './img/updown.png?url'
import bingo from './img/bingo.png?url'

const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 640px)').matches
})
console.log(isMobile.value, 'isMobile')
const listImg = [
  {
    name: '扑克',
    img: poker,
    icon: icon
  },
  {
    name: '赛马',
    img: racing,
    icon: icon1
  },
  {
    name: '彩票',
    img: lottery,
    icon: icon2
  },
  {
    name: '期权',
    img: updown,
    icon: icon3
  },
  {
    name: '宾果',
    img: bingo,
    icon: icon4
  }
]
const carouselVal = ref(0)
const carousel = (val: any) => {
  carouselVal.value = val
  console.log(carouselVal.value)
}

const list = ref([1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6])
const duplicatedList = computed(() => [...list.value, ...list.value])
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
  overflow: hidden;
  width: 100%;
  background-color: #292d2e;
}
.text-brand {
  color: #24ee89;
}
.marquee-track {
  margin: 10px 0;
  background-color: #292d2e;
  display: inline-flex;
  gap: 0.875rem;
  /* 控制速度 */
  animation: marquee 20s linear infinite;
  will-change: transform;
}
.marquee-track:hover {
  animation-play-state: paused;
}
.marquee-track a {
  flex: none;
}
.bg-layer4 {
  background-color: var(--color-background-level-2);
}
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
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
    left: 11% !important;
    height: 70% !important;
  }
}
</style>
