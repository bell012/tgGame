<template>
  <div>
    <div v-if="slides.length" class="w-full max-h-[90vh] flex flex-col bg-bg-1 rounded-t-xl overflow-hidden">
      <Swipe
        ref="swipeRef"
        class="mt-2.5 mb-2.5 flex-1 min-h-0"
        :autoplay="slides.length > 1 ? AUTO_PLAY_INTERVAL_MS : 0"
        :show-indicators="false"
        :touchable="slides.length > 1"
        lazy-render
        @change="handleChange"
      >
        <SwipeItem v-for="(item, index) in slides" :key="index">
          <img
            :src="getSlideImage(item)"
            :alt="`slide-${index + 1}`"
            class="max-h-full w-full max-w-[100vw] object-contain"
            @click="handleCarouselClick(item)"
          />
        </SwipeItem>
      </Swipe>
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
import { computed, ref, watch } from 'vue'
import { Swipe, SwipeItem } from 'vant'
import type { SwipeInstance } from 'vant'
import { navigateTo, navigateToName } from '@/utils/router'
import type { QuerySlideshowItem } from '@/api/interface/home.interface'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
const authModalStore = useAuthModalStore()
const { userInfo } = storeToRefs(userStore)
const isLogin = computed(() => Boolean(userInfo.value?.tradeToken))
interface Props {
  list: QuerySlideshowItem[]
}

const props = defineProps<Props>()

const currentIndex = ref(0)
const progressKey = ref(0)
const swipeRef = ref<SwipeInstance>()
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
const handleUrlJump = (slide: QuerySlideshowItem) => {
  const linkUrl = String(slide.linkUrl ?? '').trim()
  
  if (!linkUrl && !isLogin.value) {
    // 打开登录页面
    authModalStore.openLoginModal()
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
const handleChange = (index: number) => {
  currentIndex.value = index
  progressKey.value += 1
}

const goTo = (index: number) => {
  currentIndex.value = index
  progressKey.value += 1
  swipeRef.value?.swipeTo(index)
}

const AUTO_PLAY_INTERVAL_MS = 10000

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
