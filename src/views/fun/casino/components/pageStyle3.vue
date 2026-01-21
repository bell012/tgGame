<template>
  <div class="w-full">
    <div
      class="grid w-full [gap:var(--grid-gap)] grid-cols-3 sm:grid-cols-8"
      style="--grid-gap: 11px"
    >
      <div
        v-for="(item, index) in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]"
        :key="index"
      >
        <a
          href="javascript:void(0);"
          class="game-item group relative flex size-full flex-col items-center overflow-hidden rounded-lg transition-transform duration-200 ease-out sm:hover:-translate-y-2 active:translate-y-0 inactive"
          link=""
        >
          <img class="w-full" alt="Crash" :src="getGameImg(item)" />
          <div
            class="absolute bottom-1 right-1 flex h-5 items-center rounded-md bg-[var(--color-mask-20)] px-1.5"
          >
            <div class="icon size-4 fill-text-4 dark:fill-text-1">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M26.1137 20.6693C26.6674 23.8341 24.4618 26.132 21.3885 26.6484C18.4196 27.1469 13.5818 27.1469 10.6138 26.6484C7.5397 26.132 5.3341 23.8349 5.88853 20.6702C6.35798 17.9846 8.63481 16.3107 11.4143 16.4548C13.4451 16.56 14.6923 16.8239 16.1371 16.8239C17.5981 16.8239 18.5718 16.5592 20.588 16.4548C23.3674 16.3091 25.6443 17.9838 26.1137 20.6693ZM16.1007 4.66211C19.021 4.66211 21.3885 7.02959 21.3885 9.9499C21.3885 12.8702 19.021 15.2377 16.1007 15.2377C13.1804 15.2377 10.8121 12.8694 10.8121 9.9499C10.8121 7.0304 13.1796 4.66211 16.1007 4.66211Z"
                ></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-text-4 dark:text-text-1">2191</span>
          </div>
          <div
            class="flex items-center justify-center absolute left-0 top-0 h-full w-full cursor-pointer bg-[#00000099] opacity-0 sm:group-hover:opacity-100"
          >
            <div
              class="flex items-center justify-center absolute left-0 top-0 h-[40%] w-full px-2 text-center font-extrabold leading-4 text-text-4 dark:text-text-1"
            >
              {{ item }}
            </div>
            <div
              class="flex items-center justify-center h-9 w-9 rounded-full bg-[#fff3] transition-all duration-300 sm:group-hover:scale-150"
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
    </div>

    <div class="mt-4 flex items-center justify-center">
      <button
        type="button"
        class="px-[9px] h-[35px] rounded-tl-lg rounded-bl-lg text-xs flex items-center justify-center bg-[var(--color-background-level-2)]"
        :class="canPrev ? 'text-text-1 ' : 'text-text-2 opacity-50'"
        :disabled="!canPrev"
        @click="goPrev"
      >
        <LeftArrow class="w-2 h-2" />
      </button>

      <div class="mx-[2px] px-2.5 py-1 flex items-center bg-[var(--color-background-level-2)]">
        <!-- 当前页码-->
        <div
          class="rounded-md flex items-center justify-center bg-[var(--color-background-level-3)] font-bold text-[12px] text-text-1 leading-[12px] px-[7px] py-[7px]"
        >
          {{ page < 10 ? '0' + page : page }}
        </div>

        <!-- of -->
        <span class="mx-[2px] text-[12px] text-text-2 lowercase">of</span>

        <!-- 总页码 -->
        <span
          class="rounded-md flex items-center justify-center font-bold text-[12px] text-text-1 leading-[12px] px-[7px] py-[7px]"
          >{{ totalPages }}</span
        >
      </div>

      <button
        type="button"
        class="px-[9px] h-[35px] rounded-tr-lg rounded-br-lg text-xs bg-[var(--color-background-level-2)] flex items-center justify-center"
        :class="canNext ? 'text-text-1 ' : 'text-text-2 opacity-50'"
        :disabled="!canNext"
        @click="goNext"
      >
        <RightArrow class="w-2 h-2" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'
import game1 from '@/static/img/test/game1.png'
import game2 from '@/static/img/test/game2.png'
import game3 from '@/static/img/test/game3.png'
import game4 from '@/static/img/test/game4.png'
import game5 from '@/static/img/test/game5.png'
import game6 from '@/static/img/test/game6.png'

const page = ref(1)
const totalPages = ref(3)
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)

const getGameImg = (item: number | string) => {
  switch (item) {
    case 1:
      return game1
    case 2:
      return game2
    case 3:
      return game3
    case 4:
      return game4
    case 5:
      return game5
    case 6:
      return game6
    default:
      return getGameImg(Math.floor(Math.random() * 6))
  }
}

const goPrev = () => {
  page.value = Math.min(Math.max(1, page.value - 1), Math.max(1, totalPages.value))
  console.log('点击上一页')
}
const goNext = () => {
  page.value = Math.min(Math.max(1, page.value + 1), Math.max(1, totalPages.value))
  console.log('点击下一页')
}
</script>
<style scoped lang="scss"></style>
