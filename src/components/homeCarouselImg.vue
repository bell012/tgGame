<template>
  <div>
    <div v-if="loading" class="w-full">
      <div class="w-full overflow-hidden rounded-xl bg-bg-2" :class="bannerAspectClass">
        <div class="size-full animate-pulse bg-bg-2"></div>
      </div>
      <div class="mt-2 flex items-center justify-center gap-1.5">
        <div class="h-[5px] w-10 rounded-full bg-bg-2 animate-pulse"></div>
        <div class="size-[5px] rounded-full bg-bg-2 animate-pulse"></div>
        <div class="size-[5px] rounded-full bg-bg-2 animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="visibleSlides.length" class="w-full flex flex-col bg-bg-1">
      <div
        class="relative w-full min-h-0 overflow-visible"
        @mousedown="handleSwipeMouseDown"
        @click.capture="handleSwipeClickCapture"
      >
        <Swipe
          ref="swipeRef"
          class="min-h-0 w-full"
          :autoplay="visibleSlides.length > 1 ? AUTO_PLAY_INTERVAL_MS : 0"
          :show-indicators="false"
          touchable
          lazy-render
          @change="handleChange"
        >
          <SwipeItem v-for="(item, index) in visibleSlides" :key="index">
            <div class="w-full h-full overflow-hidden rounded-xl">
              <img
                :src="getSlideImage(item)"
                :alt="`slide-${index + 1}`"
                class="w-full select-none object-cover"
                draggable="false"
                @click="handleCarouselClick(item)"
                @dragstart.prevent
              />
            </div>
          </SwipeItem>
        </Swipe>
        <template v-if="visibleSlides.length > 1">
          <button
            type="button"
            class="absolute left-1.5 top-1/2 z-10 hidden -translate-x-full -translate-y-1/2 items-center justify-center p-1 text-icon-1 transition-opacity hover:opacity-70 lg:flex"
            aria-label="上一张"
            @click.stop="swipePrev"
          >
            <ArrowLeft2Icon class="size-4 [&_path]:fill-current" />
          </button>
          <button
            type="button"
            class="absolute right-1.5 top-1/2 z-10 hidden translate-x-full -translate-y-1/2 items-center justify-center p-1 text-icon-1 transition-opacity hover:opacity-70 lg:flex"
            aria-label="下一张"
            @click.stop="swipeNext"
          >
            <ArrowRightIcon class="size-4 [&_path]:fill-current" />
          </button>
        </template>
      </div>
      <!-- 左右按钮 + 滑动条 -->
      <div
        v-if="visibleSlides.length > 1"
        class="mt-2 flex flex-shrink-0 items-center justify-center px-4"
      >
        <div class="flex w-[25%] min-w-0 items-center justify-between gap-2">
          <div class="flex min-w-0 flex-1 items-center justify-center gap-1.5">
            <button
              v-for="(_, index) in visibleSlides"
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
import { useUserStore } from '@/stores/user'
import { navigateTo, navigateToName } from '@/utils/router'
import { storeToRefs } from 'pinia'
import type { SwipeInstance } from 'vant'
import { Swipe, SwipeItem } from 'vant'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const authModalStore = useAuthModalStore()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

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
const MOUSE_SWIPE_DISTANCE = 50
const MOUSE_DRAG_DISTANCE = 8
/** H5：1041:450；PC：1340:280 */
const bannerAspectClass = 'aspect-[1041/450] lg:aspect-[1340/280]'
let mouseStartX = 0
let mouseStartY = 0
let isMouseDragging = false
let shouldSuppressClick = false
const slides = computed(() => {
  return [...props.list].sort((a, b) => (a.sortNum ?? 0) - (b.sortNum ?? 0))
})
const visibleSlides = computed(() => {
  const isLoggedIn = Boolean(userInfo.value?.tradeToken)
  return isLoggedIn ? slides.value : slides.value.slice(0, 1)
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

const removeMouseSwipeListeners = () => {
  window.removeEventListener('mousemove', handleSwipeMouseMove)
  window.removeEventListener('mouseup', handleSwipeMouseUp)
}

const handleSwipeMouseDown = (event: MouseEvent) => {
  if (visibleSlides.value.length <= 1 || event.button !== 0) {
    return
  }

  const target = event.target
  if (target instanceof HTMLElement && target.closest('button')) {
    return
  }

  mouseStartX = event.clientX
  mouseStartY = event.clientY
  isMouseDragging = false
  shouldSuppressClick = false

  window.addEventListener('mousemove', handleSwipeMouseMove)
  window.addEventListener('mouseup', handleSwipeMouseUp, { once: true })
}

const handleSwipeMouseMove = (event: MouseEvent) => {
  const deltaX = event.clientX - mouseStartX
  const deltaY = event.clientY - mouseStartY
  const isHorizontalDrag = Math.abs(deltaX) > Math.abs(deltaY)

  if (isHorizontalDrag && Math.abs(deltaX) > MOUSE_DRAG_DISTANCE) {
    isMouseDragging = true
    event.preventDefault()
  }
}

const suppressNextClick = () => {
  shouldSuppressClick = true
  window.setTimeout(() => {
    shouldSuppressClick = false
  }, 0)
}

const handleSwipeMouseUp = (event: MouseEvent) => {
  removeMouseSwipeListeners()

  const deltaX = event.clientX - mouseStartX
  const deltaY = event.clientY - mouseStartY
  const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)

  if (!isHorizontalSwipe || Math.abs(deltaX) < MOUSE_SWIPE_DISTANCE) {
    if (isMouseDragging) {
      suppressNextClick()
    }
    return
  }

  suppressNextClick()
  if (deltaX > 0) {
    swipePrev()
    return
  }

  swipeNext()
}

const handleSwipeClickCapture = (event: MouseEvent) => {
  if (!shouldSuppressClick) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  shouldSuppressClick = false
}

watch(
  visibleSlides,
  nextSlides => {
    if (currentIndex.value >= nextSlides.length) {
      currentIndex.value = 0
    }
    progressKey.value += 1
  },
  { immediate: true }
)

onBeforeUnmount(removeMouseSwipeListeners)
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
