<template>
  <div class="gameList">
    <div class="mt-2 flex items-center sm:mt-6 h-8">
      <h2 class="flex items-center text-base font-extrabold text-primary">
        {{ props.title }}
      </h2>
      <a
        href="javascript:void(0);"
        class="button ml-auto flex items-center bg-bg-3 gap-1 rounded-lg font-extrabold h-8 bg-black_alpha5 px-2 dark:bg-layer5"
        @click="handleAllClick(props.sysGameTypeCode)"
        >{{ $t('home.All') }}</a
      >
      <div v-if="!isMobile" class="ml-2 flex gap-x-1">
        <button
          @click="scrollPrev"
          :disabled="prevDisabled"
          :class="[
            'button button-icon button-second button-m size-8 !p-0 hover:opacity-80',
            prevDisabled
              ? 'bg-[var(--color-background-level-4)] cursor-not-allowed'
              : 'bg-[var(--color-button-secondary)]'
          ]"
          type="button"
        >
          <div class="icon size-4">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
        </button>
        <button
          @click="scrollNext"
          :disabled="nextDisabled"
          :class="[
            'button button-icon button-second button-m size-8 !p-0 hover:opacity-80',
            nextDisabled
              ? 'bg-[var(--color-background-level-4)] cursor-not-allowed'
              : 'bg-[var(--color-button-secondary)]'
          ]"
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
      class="grid snap-x relative snap-mandatory grid-flow-col overflow-x-scroll overflow-y-hidden scroll-smooth hide-scroll gap-2 pt-3 mx-0 grid-col-3"
      ref="listWrap"
      style="--grid-gap: 0.5rem; --grid-padding: 0px; --aspect-ratio: 0.75"
    >
      <div v-for="(value, index) in normalizedList" :key="value.img.src + '-' + index">
        <a
          href="javascript:void(0);"
          class="game-item group relative flex size-full flex-col items-center overflow-hidden rounded-lg transition-all hover:-translate-y-2 aspect-[3/4]"
          link=""
        >
          <div class="w-full h-full">
            <gameErrImg :img="value.img" />
          </div>
          <div
            class="absolute inset-x-0 bottom-6 flex w-full items-center justify-center px-2 text-center text-sm sm:text-base font-bold leading-4 text-common-100 sm:font-extrabold"
          >
            {{ value.itemName }}
          </div>
          <div
            class="absolute bottom-1 right-1 flex h-5 items-center rounded-md bg-black_alpha20 px-1.5"
          >
            <div class="icon size-4">
              <peopleNumber />
            </div>
            <span class="text-xs font-semibold text-alw_white">{{ value.number }}</span>
          </div>
          <div
            class="center absolute left-0 top-0 h-full w-full cursor-pointer bg-[#00000099] opacity-0 group-hover:opacity-100"
          >
            <div
              class="flex flex-col items-center justify-center gap-2 h-full w-full"
              @click="handleClick(value.rowId)"
            >
              <div
                class="flex justify-center items-center center absolute left-0 top-0 h-[40%] w-full px-2 text-center font-extrabold leading-4 text-[white]"
              >
                {{ value.itemName }}
              </div>
              <div
                class="flex h-9 w-9 rounded-full bg-[#fff3] transition-all duration-300 group-hover:scale-150"
              >
                <div class="icon size-full fill-alw_white">
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M24.9106 13.9439L13.964 6.44441C13.5849 6.18474 13.1412 6.03268 12.681 6.0047C12.2209 5.97673 11.7617 6.07391 11.3534 6.28572C10.945 6.49753 10.603 6.81589 10.3645 7.2063C10.1259 7.59671 9.99987 8.04429 10 8.50052V23.4995C9.99987 23.9557 10.1259 24.4033 10.3645 24.7937C10.603 25.1841 10.945 25.5025 11.3534 25.7143C11.7617 25.9261 12.2209 26.0233 12.681 25.9953C13.1412 25.9673 13.5849 25.8153 13.964 25.5556L24.9106 18.0561C25.2467 17.8261 25.5214 17.5189 25.7111 17.1608C25.9009 16.8027 26 16.4044 26 16C26 15.5956 25.9009 15.1973 25.7111 14.8392C25.5214 14.4811 25.2467 14.1739 24.9106 13.9439Z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import gameErrImg from '@/components/common/gameErrImg.vue'
import peopleNumber from './img/peopleNumber.svg?component'
import { StringExtension } from '@/utils/string-extension'
import { navigateToName } from '@/utils/router'
import { navigateTo } from '@/utils/router'
interface GameItem {
  img: {
    maintain: boolean
    src?: string
  }
  number: number
  rowId: number
  itemName: string
}

interface Props {
  title: string
  list: any[]
  sysGameTypeCode: string
}

const props = defineProps<Props>()
const listWrap = ref<HTMLElement | null>(null)
const isMobile = ref(false)

const normalizeGameItem = (item: any): GameItem => {
  const conUrl = item?.conUrl ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${item.conUrl}` : ''
  const number = StringExtension.getRandomInt(item.initScoreNum, item.initScoreStar)
  return {
    img: {
      maintain: false,
      src: String(conUrl)
    },
    number,
    rowId: item.rowId,
    itemName: String(item?.itemName ?? '')
  }
}

const normalizedList = computed(() => {
  return (props.list ?? []).map((item: any) => normalizeGameItem(item))
})
const handleClick = (rowId: number) => {
  navigateToName('gameDetail', { params: { rowId } })
}
const prevDisabled = ref(true)
const nextDisabled = ref(false)

const updateButtons = () => {
  const el = listWrap.value
  if (!el) return
  const left = el.scrollLeft
  const max = el.scrollWidth - el.clientWidth
  prevDisabled.value = left <= 1
  nextDisabled.value = left >= Math.max(0, max - 1)
}
const handleAllClick = (sysGameTypeCode: string) => {
  navigateTo(`/gamelist/${sysGameTypeCode}`)
}
onMounted(async () => {
  isMobile.value = window.matchMedia('(max-width: 640px)').matches
  await nextTick()
  updateButtons()
  const el = listWrap.value
  if (el) {
    el.addEventListener('scroll', updateButtons, { passive: true })
    window.addEventListener('resize', updateButtons)
  }
})

onBeforeUnmount(() => {
  const el = listWrap.value
  if (el) el.removeEventListener('scroll', updateButtons)
  window.removeEventListener('resize', updateButtons)
})

const getScrollUnit = (el: HTMLElement) => {
  return Math.round(el.clientWidth)
}

const scrollNext = () => {
  const el = listWrap.value
  if (!el || nextDisabled.value) return
  const unit = getScrollUnit(el)
  el.scrollBy({ left: unit, behavior: 'smooth' })
  setTimeout(updateButtons, 350)
}

const scrollPrev = () => {
  const el = listWrap.value
  if (!el || prevDisabled.value) return
  const unit = getScrollUnit(el)
  el.scrollBy({ left: -unit, behavior: 'smooth' })
  setTimeout(updateButtons, 350)
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
  .button-icon {
    display: flex;
    width: 32px;
    height: 32px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
  }
}

.grid-col-3 {
  --grid-column: 4;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - (var(--grid-column) - 1) * var(--grid-gap)) / var(--grid-column));
  gap: var(--grid-gap);
  padding-left: var(--grid-padding);
  -webkit-overflow-scrolling: touch;
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
@media (max-width: 767px) {
  .grid-col-3 {
    --grid-column: 3.15;
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
.button[disabled] {
  pointer-events: none;
  opacity: 0.6;
}
</style>
