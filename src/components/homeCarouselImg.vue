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
            :src="getSlideImage(item)"
            :alt="`slide-${index + 1}`"
            class="max-h-full w-full max-w-[100vw] object-contain"
            @click="handleCarouselClick(item)"
          />
        </div>
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
import { computed, ref } from 'vue'
import ScrollBar from '@/static/svg/scroll-bar.svg?component'
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
  list: any[]
}

const props = defineProps<Props>()

const list = props.list
const carouselRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const slides = computed(() => {
  return [...props.list].sort((a, b) => (a.sortNum ?? 0) - (b.sortNum ?? 0))
})
const getSlideImage = (slide: any): string => {
  return slide?.url ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${slide.url}` : ''
}
const handleCarouselClick = (slide: QuerySlideshowItem) => {
  console.log('handleCarouselClick', slide)
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
