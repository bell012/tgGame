<template>
  <div class="modules mb-4" v-for="(item, index) in modules" :key="index">
    <div class="mt-2 flex items-center sm:mt-6 h-8">
      <h2 class="flex items-center text-base font-extrabold text-primary">{{ item.name }}</h2>
      <button
        class="button ml-auto flex items-center gap-1 rounded-lg font-extrabold h-8 bg-[var(--color-opacity-10)] px-2 inactive"
        link=""
      >
        {{ t('locales.casino.all') }}
      </button>
      <div class="hidden sm:flex ml-2 gap-x-1">
        <button
          type="button"
          class="button ml-auto flex items-center gap-1 rounded-lg font-extrabold h-8 bg-[var(--color-opacity-10)] px-2 inactive"
          :disabled="!canScrollLeft[index]"
          @click="scrollLeft(index)"
        >
          <div
            class="icon size-4"
            :class="canScrollLeft[index] ? 'fill-text-1' : 'fill-[var(--color-icon-level-3)]'"
          >
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
        </button>
        <button
          type="button"
          class="button ml-auto flex items-center gap-1 rounded-lg font-extrabold h-8 bg-[var(--color-opacity-10)] px-2 inactive"
          :disabled="!canScrollRight[index]"
          @click="scrollRight(index)"
        >
          <div
            class="icon size-4 rotate-180"
            :class="canScrollRight[index] ? 'fill-text-1' : 'fill-[var(--color-icon-level-3)]'"
          >
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
        </button>
      </div>
    </div>
    <div class="w-full overflow-x-auto">
      <div
        :ref="el => setScrollRef(el as HTMLElement | null, index)"
        class="grid grid-flow-col gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pt-3 auto-cols-[30.25%] sm:auto-cols-[11.82%]"
      >
        <div v-for="(game, i) in getDisplayList(item.items)" :key="i">
          <a
            href="javascript:void(0);"
            class="game-item group relative flex size-full flex-col items-center overflow-hidden rounded-lg transition-all hover:-translate-y-2 inactive"
            link=""
          >
            <img class="w-full" alt="Crash" :src="getGameImg(game)" />
            <div
              class="absolute bottom-1 right-1 flex h-5 items-center rounded-md bg-[var(--color-mask-20)] px-1.5"
            >
              <div class="icon size-4 fill-text-1">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M26.1137 20.6693C26.6674 23.8341 24.4618 26.132 21.3885 26.6484C18.4196 27.1469 13.5818 27.1469 10.6138 26.6484C7.5397 26.132 5.3341 23.8349 5.88853 20.6702C6.35798 17.9846 8.63481 16.3107 11.4143 16.4548C13.4451 16.56 14.6923 16.8239 16.1371 16.8239C17.5981 16.8239 18.5718 16.5592 20.588 16.4548C23.3674 16.3091 25.6443 17.9838 26.1137 20.6693ZM16.1007 4.66211C19.021 4.66211 21.3885 7.02959 21.3885 9.9499C21.3885 12.8702 19.021 15.2377 16.1007 15.2377C13.1804 15.2377 10.8121 12.8694 10.8121 9.9499C10.8121 7.0304 13.1796 4.66211 16.1007 4.66211Z"
                  ></path>
                </svg>
              </div>
              <span class="text-xs font-semibold text-text-1">2191</span>
            </div>
            <div
              class="flex items-center justify-center absolute left-0 top-0 h-full w-full cursor-pointer bg-[#00000099] opacity-0 group-hover:opacity-100"
            >
              <div
                class="flex items-center justify-center absolute left-0 top-0 h-[40%] w-full px-2 text-center font-extrabold leading-4 text-text-1"
              >
                {{ game }}
              </div>
              <div
                class="flex items-center justify-center h-9 w-9 rounded-full bg-[#fff3] transition-all duration-300 group-hover:scale-150"
              >
                <div class="icon size-full fill-white">
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M24.9106 13.9439L13.964 6.44441C13.5849 6.18474 13.1412 6.03268 12.681 6.0047C12.2209 5.97673 11.7617 6.07391 11.3534 6.28572C10.945 6.49753 10.603 6.81589 10.3645 7.2063C10.1259 7.59671 9.99987 8.04429 10 8.50052V23.4995C9.99987 23.9557 10.1259 24.4033 10.3645 24.7937C10.603 25.1841 10.945 25.5025 11.3534 25.7143C11.7617 25.9261 12.2209 26.0233 12.681 25.9953C13.1412 25.9673 13.5849 25.8153 13.964 25.5556L24.9106 18.0561C25.2467 17.8261 25.5214 17.5189 25.7111 17.1608C25.9009 16.8027 26 16.4044 26 16C26 15.5956 25.9009 15.1973 25.7111 14.8392C25.5214 14.4811 25.2467 14.1739 24.9106 13.9439Z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
        <div>
          <a
            href="javascript:void(0);"
            class="game-item group relative flex size-full flex-col items-center overflow-hidden rounded-lg transition-all hover:-translate-y-2 inactive"
            link=""
          >
            <img class="w-full" alt="all" src="@/static/img/test/game_all.webp" />
            <span
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-extrabold text-text-1 text-[12px] sm:text-[14px]"
            >
              View All
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-2 flex items-center sm:mt-6 h-8">
    <h2 class="flex items-center text-base font-extrabold text-primary">
      {{ t('locales.casino.latest_bet') }}
    </h2>
    <span class="ml-auto"></span>
  </div>
  <div
    class="flex w-full sm:max-w-[347px] sm:ml-auto rounded bg-[var(--color-opacity-6)] text-text-2 mt-2 sm:!-mt-9"
  >
    <button
      :class="{ 'bg-[var(--color-opacity-10)] text-text-1': latestBetIndex === 0 }"
      class="flex-1 h-10 shrink-0 rounded-lg font-bold text-sm flex items-center justify-center"
      @click.stop="latestBetIndex = 0"
    >
      {{ t('locales.casino.latest_bet') }}
    </button>
    <button
      :class="{ 'bg-[var(--color-opacity-10)] text-text-1': latestBetIndex === 1 }"
      class="flex-1 h-10 shrink-0 rounded-lg font-bold text-sm flex items-center justify-center"
      @click.stop="latestBetIndex = 1"
    >
      {{ t('locales.casino.high_roller') }}
    </button>
  </div>
  <div class="my-3 h-[430px]">
    <liveBet />
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import game1 from '@/static/img/test/game1.png'
import game2 from '@/static/img/test/game2.png'
import game3 from '@/static/img/test/game3.png'
import game4 from '@/static/img/test/game4.png'
import game5 from '@/static/img/test/game5.png'
import game6 from '@/static/img/test/game6.png'
import liveBet from './liveBet.vue'

interface OptionItem {
  id: number | string
  style: number | string
  name: string
  icon: string
  items: Array<string>
}

const { t } = useI18n()
const isMobile = useIsMobile()
const modules = defineModel<OptionItem[]>('modules')
const latestBetIndex = ref(0)
const scrollRefs = ref<HTMLElement[]>([])
const canScrollLeft = ref<boolean[]>([])
const canScrollRight = ref<boolean[]>([])

const setScrollRef = (el: HTMLElement | null, index: number) => {
  if (!el) return
  scrollRefs.value[index] = el

  nextTick(() => {
    updateScrollState(index)
    el.addEventListener('scroll', () => updateScrollState(index))
  })
}

const updateScrollState = (index: number) => {
  const el = scrollRefs.value[index]
  if (!el) return

  const max = el.scrollWidth - el.clientWidth

  canScrollLeft.value[index] = el.scrollLeft > 1
  canScrollRight.value[index] = el.scrollLeft < max - 1
}

const scrollLeft = (index: number) => {
  const el = scrollRefs.value[index]
  if (!el) return

  const target = el.scrollLeft - el.clientWidth

  el.scrollTo({
    left: Math.max(target, 0),
    behavior: 'smooth'
  })
}

const scrollRight = (index: number) => {
  const el = scrollRefs.value[index]
  if (!el) return

  const maxScrollLeft = el.scrollWidth - el.clientWidth
  const target = el.scrollLeft + el.clientWidth

  el.scrollTo({
    left: Math.min(target, maxScrollLeft),
    behavior: 'smooth'
  })
}

const getDisplayList = (list: string[]) => {
  return isMobile.value ? list.slice(0, 11) : list.slice(0, 15)
}

const getGameImg = (item: string) => {
  switch (item) {
    case 'game1':
      return game1
    case 'game2':
      return game2
    case 'game3':
      return game3
    case 'game4':
      return game4
    case 'game5':
      return game5
    case 'game6':
      return game6
    default:
      return game6
  }
}
</script>
<style scoped lang="scss"></style>
