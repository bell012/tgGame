<template>
  <div v-if="slides.length > 0" class="mb-3">
    <Swipe
      ref="swipeRef"
      class="overflow-hidden rounded-lg bg-bg-1 aspect-[1041/450] sm:aspect-[1340/280]"
      :autoplay="slides.length > 1 ? AUTO_PLAY_INTERVAL : 0"
      :show-indicators="false"
      :touchable="slides.length > 1"
      lazy-render
      @change="handleChange"
    >
      <SwipeItem v-for="slide in slides" :key="slide.rowId" class="h-full">
        <button
          type="button"
          class="block h-full w-full select-none bg-bg-1"
          draggable="false"
          @click="handleSlideClick(slide)"
          @dragstart.prevent
        >
          <gameErrImg class="h-full w-full" :img="getSlideImage(slide)" />
        </button>
      </SwipeItem>
    </Swipe>

    <div
      v-if="slides.length > 1"
      class="mt-2 flex items-center justify-center gap-2 px-3 sm:hidden"
    >
      <button
        v-for="(slide, index) in slides"
        :key="slide.rowId"
        type="button"
        class="transition-all duration-300"
        :class="
          currentIndex === index
            ? 'h-1.5 w-12 rounded-full bg-theme-primary'
            : 'size-1.5 rounded-full bg-opacity-10'
        "
        :aria-label="slide.slideshowName || `slide-${index + 1}`"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Swipe, SwipeItem } from 'vant'
import type { SwipeInstance } from 'vant'
import type { QuerySlideshowItem } from '@/api/interface/home.interface'
import { navigateTo } from '@/utils/router'
import gameErrImg from '@/components/common/gameErrImg.vue'

const AUTO_PLAY_INTERVAL = 3000

const props = defineProps<{
  list: QuerySlideshowItem[]
}>()

const currentIndex = ref(0)
const swipeRef = ref<SwipeInstance>()

const slides = computed(() => {
  return [...props.list].sort((a, b) => (a.sortNum ?? 0) - (b.sortNum ?? 0))
})

const getSlideImage = (slide: QuerySlideshowItem) => {
  const src = slide.url ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${slide.url}` : ''

  return {
    maintain: false,
    src
  }
}

const handleChange = (index: number) => {
  currentIndex.value = index
}

const goTo = (index: number) => {
  currentIndex.value = index
  swipeRef.value?.swipeTo(index)
}

const handleSlideClick = (slide: QuerySlideshowItem) => {
  if (slide.jumpType === 1 && slide.linkUrl) {
    if (slide.linkType === 2) {
      window.open(slide.linkUrl, '_blank', 'noopener,noreferrer')
      return
    }

    navigateTo(slide.linkUrl)
  }
}

watch(
  slides,
  nextSlides => {
    if (currentIndex.value >= nextSlides.length) {
      currentIndex.value = 0
    }
  },
  { immediate: true }
)
</script>
