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
          <gameRemoteImg
            class="h-full w-full"
            :img="getSlideImage(slide)"
            :alt="slide.slideshowName"
          />
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
        class="relative overflow-hidden transition-all duration-300"
        :class="
          currentIndex === index
            ? 'h-1.5 w-12 rounded-full bg-opacity-10'
            : 'size-1.5 rounded-full bg-opacity-10'
        "
        :aria-label="slide.slideshowName || `slide-${index + 1}`"
        @click="goTo(index)"
      >
        <span
          v-if="currentIndex === index"
          :key="`${index}-${progressKey}`"
          class="slideshow-indicator-progress absolute inset-y-0 left-0 rounded-full bg-theme-primary"
          :style="progressStyle"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Swipe, SwipeItem } from 'vant'
import type { SwipeInstance } from 'vant'
import type { QuerySlideshowItem } from '@/api/interface/home.interface'
import { navigateTo, navigateToName } from '@/utils/router'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'

const AUTO_PLAY_INTERVAL = 3000

const props = defineProps<{
  list: QuerySlideshowItem[]
}>()

const currentIndex = ref(0)
const progressKey = ref(0)
const swipeRef = ref<SwipeInstance>()

const slides = computed(() => {
  return [...props.list].sort((a, b) => (a.sortNum ?? 0) - (b.sortNum ?? 0))
})

const progressStyle = computed(() => ({
  animationDuration: `${AUTO_PLAY_INTERVAL}ms`
}))

const getSlideImage = (slide: QuerySlideshowItem) => {
  const src = slide.url ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${slide.url}` : ''

  return {
    maintain: false,
    src
  }
}

const handleChange = (index: number) => {
  currentIndex.value = index
  progressKey.value += 1
}

const goTo = (index: number) => {
  currentIndex.value = index
  progressKey.value += 1
  swipeRef.value?.swipeTo(index)
}

const handleUrlJump = (slide: QuerySlideshowItem) => {
  const linkUrl = String(slide.linkUrl ?? '').trim()

  if (!linkUrl) {
    return
  }

  if (slide.linkType === 2) {
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
    return
  }

  navigateTo(linkUrl)
}

const handleInternalJump = (slide: QuerySlideshowItem) => {
  const linkId = String(slide.linkId ?? '').trim()

  switch (slide.linkType) {
    case 1:
      // TODO: 活动详情页路由未明确，先保留占位，避免点击无反馈。
      if (linkId) {
        navigateTo(`/menu?activityId=${linkId}`)
        return
      }

      navigateTo('/menu')
      return
    case 2:
      navigateTo('/deposit')
      return
    case 3:
      // TODO: 分享转盘页路由未明确，当前先跳邀请好友页占位。
      navigateTo('/menu/referral')
      return
    default:
      return
  }
}

const handleGameJump = (slide: QuerySlideshowItem) => {
  const linkId = String(slide.linkId ?? '').trim()

  if (!linkId) {
    return
  }

  if (slide.platformType === 2) {
    navigateToName('brandGameList', {
      params: { brandCode: linkId }
    })
    return
  }

  // TODO: 自定义类型游戏当前按 game list tab 占位，后续可按真实业务再细化。
  navigateToName('gameList', {
    params: { tabKey: linkId }
  })
}

const handleSlideClick = (slide: QuerySlideshowItem) => {
  if (slide.enable !== 1) {
    return
  }

  switch (slide.jumpType) {
    case 1:
      handleUrlJump(slide)
      return
    case 2:
      handleInternalJump(slide)
      return
    case 3:
      handleGameJump(slide)
      return
    default:
      return
  }
}

watch(
  slides,
  nextSlides => {
    if (currentIndex.value >= nextSlides.length) {
      currentIndex.value = 0
    }

    progressKey.value += 1
  },
  { immediate: true }
)
</script>

<style scoped>
.slideshow-indicator-progress {
  width: 100%;
  transform-origin: left center;
  animation-name: slideshow-indicator-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes slideshow-indicator-fill {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}
</style>
