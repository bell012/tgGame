<template>
  <div class="gameList">
    <div class="mt-2 flex items-center sm:mt-6 h-8">
      <h2 class="flex items-center text-base font-extrabold text-primary">BC 原创</h2>
      <a
        href="/gamelist/brand"
        class="button ml-auto flex items-center gap-1 rounded-lg font-extrabold h-8 bg-black_alpha5 px-2 dark:bg-layer5 inactive"
        link=""
        >全部</a
      >
      <div v-if="!isMobile" class="ml-2 flex gap-x-1">
        <!-- 手机模式隐藏左右按钮 -->
        <button
          @click="scrollPrev"
          class="button button-second button-m size-8 bg-layer5 !p-0"
          type="button"
        >
          <div class="icon size-4">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div></button
        ><button
          @click="scrollNext"
          class="button button-second button-m size-8 bg-layer5 !p-0"
          type="button"
        >
          <div class="icon size-4 rotate-180">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
        </button>
      </div>
    </div>
    <div
      class="grid smooth-scroll smooth-list snap-x relative snap-mandatory grid-flow-col overflow-x-scroll overflow-y-hidden scroll-smooth hide-scroll gap-2 pt-3 mx-0 grid-col-3"
      ref="listWrap"
      style="--grid-gap: 0.5rem; --grid-padding: 0px; --aspect-ratio: 0.75"
    >
      <div v-for="value in source">
        <a
          href=""
          class="game-item group relative flex size-full flex-col items-center overflow-hidden rounded-lg transition-all hover:-translate-y-2 inactive"
          link=""
          ><img class="w-full" alt="Crash" style="width: 200px" src="./img/coverImg.png" />
          <div
            class="absolute bottom-1 right-1 flex h-5 items-center rounded-md bg-black_alpha20 px-1.5"
          >
            <div class="icon size-4">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M26.1137 20.6693C26.6674 23.8341 24.4618 26.132 21.3885 26.6484C18.4196 27.1469 13.5818 27.1469 10.6138 26.6484C7.5397 26.132 5.3341 23.8349 5.88853 20.6702C6.35798 17.9846 8.63481 16.3107 11.4143 16.4548C13.4451 16.56 14.6923 16.8239 16.1371 16.8239C17.5981 16.8239 18.5718 16.5592 20.588 16.4548C23.3674 16.3091 25.6443 17.9838 26.1137 20.6693ZM16.1007 4.66211C19.021 4.66211 21.3885 7.02959 21.3885 9.9499C21.3885 12.8702 19.021 15.2377 16.1007 15.2377C13.1804 15.2377 10.8121 12.8694 10.8121 9.9499C10.8121 7.0304 13.1796 4.66211 16.1007 4.66211Z"
                ></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-alw_white">2126</span>
          </div>
          <div
            class="center absolute left-0 top-0 h-full w-full cursor-pointer bg-[#00000099] opacity-0 group-hover:opacity-100"
          >
            <div
              class="center absolute left-0 top-0 flex h-[40%] w-full px-2 text-center font-extrabold leading-4 text-[white]"
            >
              Crash
            </div>
            <div
              class="center flex h-9 w-9 rounded-full bg-white_alpha20 transition-all duration-300 group-hover:scale-150"
            >
              <div class="icon size-full">
                <peopleNumber />
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import peopleNumber from './img/peopleNumber.svg?component'
const source = ref<Array<number>>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
const listWrap = ref<HTMLElement | null>(null)
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 640px)').matches
})

function getScrollUnit(el: HTMLElement) {
  const visible = el.clientWidth
  return Math.round(visible)
}

function scrollNext() {
  const el = listWrap.value
  if (!el) return
  const unit = getScrollUnit(el)
  el.scrollBy({ left: unit, behavior: 'smooth' })
}

function scrollPrev() {
  const el = listWrap.value
  if (!el) return
  const unit = getScrollUnit(el)
  el.scrollBy({ left: -unit, behavior: 'smooth' })
}
</script>

<style scoped lang="scss">
.gameList {
  .icon {
    fill: currentColor;
  }
  a:hover {
    color: inherit;
  }
}

.grid-col-3 {
  --grid-column: 4;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - (var(--grid-column) - 1) * var(--grid-gap)) / var(--grid-column));
  gap: var(--grid-gap);
  padding-left: var(--grid-padding);
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
}

@media (min-width: 1280px) {
  .grid-col-3 {
    --grid-column: 8;
  }
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .grid-col-3 {
    --grid-column: 7;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .grid-col-3 {
    --grid-column: 5;
  }
}
@media (min-width: 640px) and (max-width: 767px) {
  .grid-col-3 {
    --grid-column: 4;
  }
}

/* 手机端禁用 hover/动画效果 */
@media (max-width: 639px) {
  .gameList .game-item,
  .gameList .game-item * {
    transition: none !important;
    animation: none !important;
    will-change: auto !important;
  }

  /* 禁止 hover 导致的位移/缩放/遮罩显现 */
  .gameList .game-item:hover {
    transform: none !important;
  }
  .gameList .game-item:hover .center {
    opacity: 0 !important;
    transform: none !important;
  }
  .gameList .game-item .center {
    transition: none !important;
    opacity: 0 !important;
  }

  /* 保证缩略图始终显示且不被变换 */
  .gameList .game-item img {
    opacity: 1 !important;
    transform: none !important;
  }

  /* 关闭平滑滚动（手机滑动使用原生体验） */
  .grid-col-3 {
    scroll-behavior: auto !important;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
