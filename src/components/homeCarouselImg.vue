<template>
  <div>
    <div v-if="loading" class="mt-2.5 mb-2.5 w-full">
      <div class="w-full overflow-hidden rounded-xl bg-bg-2" :class="bannerAspectClass">
        <div class="size-full animate-pulse bg-bg-2"></div>
      </div>
      <div class="mt-2 flex items-center justify-center gap-1.5">
        <div class="h-[5px] w-10 rounded-full bg-bg-2 animate-pulse"></div>
        <div class="size-[5px] rounded-full bg-bg-2 animate-pulse"></div>
        <div class="size-[5px] rounded-full bg-bg-2 animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="slides.length" class="w-full flex flex-col bg-bg-1">
      <div class="relative mt-2.5 mb-2.5 w-full min-h-0 overflow-visible">
        <Swipe
          ref="swipeRef"
          class="min-h-0 w-full"
          :autoplay="slides.length > 1 ? AUTO_PLAY_INTERVAL_MS : 0"
          :show-indicators="false"
          :touchable="slides.length > 1"
          lazy-render
          @change="handleChange"
        >
          <SwipeItem v-for="(item, index) in slides" :key="index">
            <div class="w-full h-full overflow-hidden rounded-xl px-3">
              <img
                :src="getSlideImage(item)"
                :alt="`slide-${index + 1}`"
                class="w-full object-cover"
                @click="handleCarouselClick(item)"
              />
            </div>
          </SwipeItem>
        </Swipe>
        <template v-if="slides.length > 1">
          <button
            type="button"
            class="absolute left-3 top-1/2 z-10 hidden -translate-x-full -translate-y-1/2 items-center justify-center p-1 text-icon-1 transition-opacity hover:opacity-70 lg:flex"
            aria-label="上一张"
            @click.stop="swipePrev"
          >
            <ArrowLeft2Icon class="size-4 [&_path]:fill-current" />
          </button>
          <button
            type="button"
            class="absolute right-3 top-1/2 z-10 hidden translate-x-full -translate-y-1/2 items-center justify-center p-1 text-icon-1 transition-opacity hover:opacity-70 lg:flex"
            aria-label="下一张"
            @click.stop="swipeNext"
          >
            <ArrowRightIcon class="size-4 [&_path]:fill-current" />
          </button>
        </template>
      </div>
      <!-- 左右按钮 + 滑动条 -->
      <div v-if="slides.length > 1" class="flex flex-shrink-0 items-center justify-center px-4">
        <div class="flex w-[25%] min-w-0 items-center justify-between gap-2">
          <div class="flex min-w-0 flex-1 items-center justify-center gap-1.5">
            <button
              v-for="(_, index) in slides"
              :key="index"
              type="button"
              class="flex shrink-0 items-center justify-center transition-colors"
              :class="
                currentIndex === index
                  ? 'h-[5px] w-10 rounded-full overflow-hidden bg-[var(--color-background-level-4)]'
                  : 'size-[5px] rounded-full bg-[var(--color-background-level-4)]'
              "
              :aria-label="`第 ${index + 1} 张`"
              @click="goTo(index)"
            >
              <span
                v-if="currentIndex === index"
                class="slideshow-indicator-progress h-full w-full origin-left rounded-full bg-[var(--color-theme-level-1)]"
                :key="`${index}-${progressKey}`"
                :style="progressStyle"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { QuerySlideshowItem } from '@/api/interface/home.interface'
import ArrowLeft2Icon from '@/static/svg/arrow_left2.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import { useAuthModalStore } from '@/stores/authModal'
import { navigateTo, navigateToName } from '@/utils/router'
import type { SwipeInstance } from 'vant'
import { Swipe, SwipeItem } from 'vant'
import { computed, ref, watch } from 'vue'

const authModalStore = useAuthModalStore()

interface Props {
  list: QuerySlideshowItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const currentIndex = ref(0)
const progressKey = ref(0)
const swipeRef = ref<SwipeInstance>()
const AUTO_PLAY_INTERVAL_MS = 10000
/** H5：1041:450；PC：1340:280 */
const bannerAspectClass = 'aspect-[1041/450] lg:aspect-[1340/280]'
const slides = computed(() => {
  return [...props.list].sort((a, b) => (a.sortNum ?? 0) - (b.sortNum ?? 0))
})
const progressStyle = computed(() => ({
  animationDuration: `${AUTO_PLAY_INTERVAL_MS}ms`
}))
const getSlideImage = (slide: QuerySlideshowItem): string => {
  return slide?.url ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${slide.url}` : ''
}
const handleCarouselClick = (slide: QuerySlideshowItem) => {
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
// jumpType=1：linkType 0 不跳转，1 站内路由，2 外部网页
const handleUrlJump = (slide: QuerySlideshowItem) => {
  const linkUrl = String(slide.linkUrl ?? '').trim()
  if (!linkUrl) {
    return
  }
  const linkType = Number(slide.linkType ?? 0)
  if (linkType === 0) {
    return
  }
  if (linkType === 2) {
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
    return
  }
  navigateTo(linkUrl)
}

// 1活动，2充值栏目，3分享转盘，4充值页面，5积分转盘，6 邀请好友，7 登录注册页
const handleInternalJump = (slide: QuerySlideshowItem) => {
  switch (slide.linkType) {
    case 1:
      console.log('活动')
      return
    case 2:
      navigateTo('/deposit')
      return
    case 3:
      console.log('分享转盘')
      return
    case 4:
      navigateTo('/deposit')
      return
    case 5:
      console.log('积分转盘')
      return
    case 6:
      console.log('邀请好友')
      return
    case 7:
      authModalStore.openLoginModal()
      return
    default:
      return
  }
}

const handleGameJump = (slide: QuerySlideshowItem) => {
  const idFromLinkUrl = Number(slide.linkUrl)
  const gameRowId =
    Number.isFinite(idFromLinkUrl) && idFromLinkUrl > 0 ? idFromLinkUrl : slide.rowId
  if (!gameRowId) {
    return
  }
  navigateToName('gameDetail', { params: { rowId: gameRowId } })
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

const swipePrev = () => {
  swipeRef.value?.prev()
}

const swipeNext = () => {
  swipeRef.value?.next()
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
@keyframes slideshow-indicator-fill {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

.slideshow-indicator-progress {
  animation-name: slideshow-indicator-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>
