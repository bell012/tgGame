<template>
  <div class="home">
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
        <div class="ml-2 hidden gap-2 lg:!flex">
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
              <img class="absolute right-5 top-0 h-[120%]" src="./img/casino.png" />
              <div class="relative z-10 flex h-full flex-auto flex-col">
                <div class="flex items-center">
                  <div class="color_icon_img casino" style="transform: scale(1)"></div>
                  <h2 class="ml-0.5 text-sm sm:text-[22px]">娱乐城</h2>
                </div>
                <div class="mb-1.5 mt-auto max-w-60 text-left font-semibold text-primary block">
                  尽情体验BC原创游戏、真人娱乐城和老虎机游戏。
                </div>
              </div>
            </button>
            <button
              class="button button-m center relative h-32 flex-1 overflow-hidden rounded-xl bg-layer4 p-1.5 font-extrabold sm:h-[176px] sm:p-5 col-span-2 col-start-1"
              type="button"
              style="background-image: linear-gradient(to left, rgb(88, 46, 89), transparent 75%)"
            >
              <img class="absolute right-5 top-0 h-[120%]" src="./img/sports.png" />
              <div class="relative z-10 flex h-full flex-auto flex-col">
                <div class="flex items-center">
                  <div class="color_icon_img sports" style="transform: scale(1)"></div>
                  <span class="ml-0.5 text-sm sm:text-[22px]">体育</span>
                </div>
                <div class="mb-1.5 mt-auto max-w-60 text-left font-semibold text-primary block">
                  快来下注！足球、板球、NFL、电竞等 80 多种体育项目等你挑战！
                </div>
              </div>
            </button>
          </div>

          <div class="flex flex-4 flex-wrap gap-2 lg:!gap-3">
            <button
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
                class="absolute left-[50%] top-0 h-full -translate-x-[10%]"
                src="./img/poker.png"
              />
              <div class="absolute left-2 top-2 items-center flex">
                <div class="color_icon_img bcpoker" style="transform: scale(0.8)">
                  <img src="./img/image.png" alt="" />
                </div>
                <h2 class="ml-1 text-lg font-extrabold">扑克</h2>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import icon from './img/icon.svg?url'

// const listImg = [
//   {
//     name: 'BETPORTALL',
//     img: icon,
//     icon: icon
//   }
// ]
const carouselVal = ref(0)
const carousel = (val: any) => {
  carouselVal.value = val
  console.log(carouselVal.value)
}

const list = ref([1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6])
const duplicatedList = computed(() => [...list.value, ...list.value])
</script>

<style scoped lang="scss">
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
  background-color: #323738;
}
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
