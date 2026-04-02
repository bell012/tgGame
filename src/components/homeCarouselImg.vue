<template>
  <div>
    <div class="w-full max-h-[90vh] flex flex-col bg-bg-1 rounded-t-xl overflow-hidden">
      <!-- 轮播图 -->
      <div
        ref="carouselRef"
        class="mt-2.5 mb-2.5 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth touch-pan-x flex-1 min-h-0"
        @scroll="onCarouselScroll"
      >
        <div
          v-for="(item, index) in list"
          :key="index"
          class="carousel-item flex w-full flex-shrink-0 snap-center snap-always items-center justify-center"
        >
          <img
            :src="item.url"
            :alt="`slide-${index + 1}`"
            class="max-h-full w-full max-w-[100vw] object-contain"
          />
        </div>
      </div>
      <!-- 左右按钮 + 滑动条 -->
      <div v-if="list.length > 1" class="flex flex-shrink-0 items-center justify-center px-4">
        <div class="flex w-[25%] min-w-0 items-center justify-between gap-2">
          <div class="flex min-w-0 flex-1 items-center justify-center gap-1.5">
            <button
              v-for="(_, index) in list"
              :key="index"
              type="button"
              class="flex shrink-0 items-center justify-center transition-colors"
              :class="
                currentIndex === index
                  ? 'h-[5px] w-10'
                  : 'size-[5px] rounded-full bg-[var(--color-background-level-4)]'
              "
              :aria-label="`第 ${index + 1} 张`"
              @click="goTo(index)"
            >
              <ScrollBar
                v-if="currentIndex === index"
                class="h-[5px] w-10 shrink-0 [&_svg]:h-full [&_svg]:w-full [&_svg]:object-contain"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import ScrollBar from '@/static/svg/scroll-bar.svg?component'
interface Props {
  list: any[]
}

const props = defineProps<Props>()

const list = props.list
const carouselRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)

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
