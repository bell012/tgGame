<template>
  <div class="fixed inset-0 z-[9999] flex items-end justify-center bg-mask-60-1">
    <div class="w-full max-h-[90vh] flex flex-col bg-bg-1 rounded-t-xl overflow-hidden">
      <div class="bg-bg-2 relative flex flex-1 items-center justify-center pt-2.5 pb-2.5">
        <span class="text-text-1 font-semibold">{{ $t('home.ExclusivePromotions') }} </span>
        <button
          type="button"
          class="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center p-2 rounded-[6px] bg-black/10"
          aria-label="close"
        >
          <CloseIcon class="w-2.5 h-2.5 text-icon-1" @click="close" />
        </button>
      </div>

      <!-- 轮播图 -->
      <div
        ref="carouselRef"
        class="mt-2.5 mb-2.5 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth touch-pan-x flex-1 min-h-0"
        @scroll="onCarouselScroll"
      >
        <div
          v-for="(item, index) in list"
          :key="index"
          class="carousel-item flex min-w-full flex-shrink-0 snap-center snap-always items-center justify-center"
        >
          <img
            :src="item"
            :alt="`slide-${index + 1}`"
            class="max-h-full w-full max-w-[100vw] object-contain"
          />
        </div>
      </div>
      <button
        class="flex justify-center items-center w-[92%] h-[40px] buttonStyle m-auto mb-2.5 text-text-4 font-bold"
      >
        {{ $t('home.JoinNow') }}
      </button>

      <!-- 左右按钮 + 滑动条 -->
      <div
        v-if="list.length > 1"
        class="flex flex-shrink-0 items-center justify-center px-4 pb-2.5"
      >
        <div class="flex w-[25%] min-w-0 items-center justify-between gap-2">
          <button
            type="button"
            class="flex size-2 shrink-0 items-center justify-center rounded-full bg-transparent text-text-1 transition-opacity hover:opacity-80 disabled:opacity-40 [&_svg]:size-full [&_path]:fill-current"
            :disabled="currentIndex <= 0"
            aria-label="上一张"
            @click="prev"
          >
            <LeftIcon />
          </button>

          <div class="flex min-w-0 flex-1 items-center justify-center gap-1.5">
            <button
              v-for="(_, index) in list"
              :key="index"
              type="button"
              class="flex shrink-0 items-center justify-center transition-colors"
              :class="
                currentIndex === index
                  ? 'h-[5px] w-6'
                  : 'size-[5px] rounded-full bg-[var(--color-background-level-4)]'
              "
              :aria-label="`第 ${index + 1} 张`"
              @click="goTo(index)"
            >
              <ScrollBar
                v-if="currentIndex === index"
                class="h-[5px] w-6 shrink-0 [&_svg]:h-full [&_svg]:w-full [&_svg]:object-contain"
              />
            </button>
          </div>

          <button
            type="button"
            class="flex size-2 shrink-0 items-center justify-center rounded-full bg-transparent text-text-1 transition-opacity hover:opacity-80 disabled:opacity-40 [&_svg]:size-full [&_path]:fill-current"
            :disabled="currentIndex >= list.length - 1"
            aria-label="下一张"
            @click="next"
          >
            <RightIcon />
          </button>
        </div>
      </div>
      <!-- 底部多选框 -->
      <div class="bg-bg-2 pl-3.5 pt-2 pb-1">
        <label
          class="checkbox-wrap inline-flex cursor-pointer items-center gap-2"
          :class="{ 'checkbox-checked': checked }"
        >
          <span class="checkbox-box" />
          <input v-model="checked" type="checkbox" class="sr-only" aria-label="多选" />
          <span class="text-text-1 text-xs">{{ $t('home.DontDisplayThisForNext7Day') }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
import LeftIcon from '@/static/svg/left-icon.svg?component'
import RightIcon from '@/static/svg/right-icon.svg?component'
import ScrollBar from '@/static/svg/scroll-bar.svg?component'

import Image1 from '@/static/img/test/Image1.png'

const emit = defineEmits<{ close: [] }>()

const list = [Image1, Image1, Image1]
const carouselRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const checked = ref(false)

const close = () => {
  emit('close')
}

const onCarouselScroll = () => {
  const el = carouselRef.value
  if (!el) return
  const width = el.offsetWidth
  const index = Math.round(el.scrollLeft / width)
  currentIndex.value = Math.min(index, list.length - 1)
}

const goTo = (index: number) => {
  const el = carouselRef.value
  if (!el) return
  const width = el.offsetWidth
  el.scrollTo({ left: index * width, behavior: 'smooth' })
  currentIndex.value = index
}

const prev = () => {
  if (currentIndex.value <= 0) return
  goTo(currentIndex.value - 1)
}

const next = () => {
  if (currentIndex.value >= list.length - 1) return
  goTo(currentIndex.value + 1)
}
</script>
<style lang="scss" scoped>
.buttonStyle {
  border-radius: 8px;
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
  box-shadow:
    0 0 12px 0 rgba(35, 238, 136, 0.3),
    0 -2px 0 0 #1dca6a inset;
}
.checkbox-box {
  position: relative;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--color-icon-level-3, #7b7d7d);
  background: transparent;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}
.checkbox-wrap.checkbox-checked .checkbox-box {
  background: var(--color-theme-level-1, #2aee88);
  border-color: var(--color-theme-level-1, #2aee88);
}
.checkbox-wrap.checkbox-checked .checkbox-box::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
