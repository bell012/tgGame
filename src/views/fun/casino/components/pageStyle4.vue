<template>
  <div class="w-full">
    <div
      class="grid w-full [gap:var(--grid-gap)] grid-cols-2 sm:grid-cols-7"
      style="--grid-gap: 11px"
    >
      <a
        v-for="(item, index) in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]"
        :key="index"
        href="javascript:void(0);"
        class="flex h-[60px] justify-center items-center shrink-0 rounded-lg bg-[var(--color-background-level-2)]"
      >
        <img
          :class="[item == 1 ? 'h-[43px]' : 'h-[22px]']"
          alt="Game Provider"
          :src="getGameImg(item)"
        />
      </a>
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
import tgImg from '@/static/img/test/tg.png'
import wlImg from '@/static/img/test/wl.png'
import pgImg from '@/static/img/test/pg.png'
import fgImg from '@/static/img/test/fg.png'
import jlImg from '@/static/img/test/jl.png'

const page = ref(1)
const totalPages = ref(3)
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)

const getGameImg = (item: number | string) => {
  switch (item) {
    case 1:
      return tgImg
    case 2:
      return wlImg
    case 3:
      return pgImg
    case 4:
      return fgImg
    case 5:
      return jlImg
    default:
      return getGameImg(Math.floor(Math.random() * 5))
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
