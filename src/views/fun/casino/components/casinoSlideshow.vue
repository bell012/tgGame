<template>
  <div v-if="loading" class="mb-3">
    <div
      class="aspect-[343/140] w-full animate-pulse rounded-lg bg-bg-2 sm:aspect-[1248/280] sm:rounded-xl"
    />
    <div class="mt-2 flex items-center justify-center gap-2 px-3 sm:mt-3">
      <div class="h-1.5 w-10 animate-pulse rounded-full bg-bg-2 sm:h-2 sm:w-[72px]" />
      <div class="h-1.5 w-1.5 animate-pulse rounded-full bg-bg-2 sm:h-2 sm:w-10" />
      <div class="h-1.5 w-1.5 animate-pulse rounded-full bg-bg-2 sm:h-2 sm:w-10" />
    </div>
  </div>

  <div v-else-if="slides.length > 0" class="mb-3">
    <Swipe
      ref="swipeRef"
      class="overflow-hidden rounded-lg sm:rounded-xl bg-bg-1 w-full"
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

    <div v-if="slides.length > 1" class="mt-2 flex items-center justify-center gap-2 px-3 sm:mt-3">
      <button
        v-for="(slide, index) in slides"
        :key="slide.rowId"
        type="button"
        class="relative overflow-hidden transition-all duration-300"
        :class="
          currentIndex === index
            ? 'h-1.5 w-10 sm:h-2 sm:w-[72px] rounded-full bg-opacity-10'
            : 'h-1.5 w-1.5 sm:h-2 sm:w-10 rounded-full bg-opacity-10'
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
import { storeToRefs } from 'pinia'
import { Swipe, SwipeItem } from 'vant'
import type { SwipeInstance } from 'vant'
import type { QuerySlideshowItem } from '@/api/interface/home.interface'
import { navigateTo } from '@/utils/router'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import { useAuthModalStore } from '@/stores/authModal'
import { useGameStore } from '@/stores/game'
import { useThemeStore } from '@/stores/theme'

const AUTO_PLAY_INTERVAL = 3000

const props = withDefaults(
  defineProps<{
    list: QuerySlideshowItem[]
    loading?: boolean
  }>(),
  {
    loading: false
  }
)

const authModalStore = useAuthModalStore()
const gameStore = useGameStore()
const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
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
  const imagePath = theme.value === 'light' ? slide.skinUrl || slide.url : slide.url
  const src = imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''

  return {
    maintain: false,
    src,
    fit: 'contain' as const
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

/** jumpType=1 时：0 不跳转,1 内部跳转，2 外部跳转 */
const handleUrlJump = (slide: QuerySlideshowItem) => {
  const linkUrl = String(slide.linkUrl ?? '').trim()

  if (!linkUrl) {
    return
  }

  if (slide.linkType === 0) return

  if (slide.linkType === 2) {
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
    return
  }

  navigateTo(linkUrl)
}

/** jumpType=2 时：0 不跳转，1 活动ID，2 充值栏目，3 分享转盘，4 充值页面，5 积分转盘，6 邀请好友，7 登录注册页面 */
const handleInternalJump = (slide: QuerySlideshowItem) => {
  const linkId = String(slide.linkId ?? '').trim()

  switch (slide.linkType) {
    case 1:
      // 1 活动ID
      // TODO: 活动详情页路由未明确，先保留占位，避免点击无反馈。
      if (linkId) {
        navigateTo(`/menu?activityId=${linkId}`)
        return
      }

      navigateTo('/menu')
      return
    case 2:
      // 2 充值栏目
      navigateTo('/deposit')
      return
    case 3:
      // TODO: 分享转盘页路由未明确，当前先跳邀请好友页占位。
      navigateTo('/menu/referral')
      return
    case 4:
      // 4 充值页面
      navigateTo('/deposit')
      return
    case 5:
      // 5 积分转盘
      // TODO
      return
    case 6:
      // 6 邀请好友
      // TODO
      return
    case 7:
      // 7 登录注册页面
      authModalStore.openLoginModal()
      return
    default:
      // 0 不跳转
      return
  }
}

/** jumpType=3 时：0 不跳转，1 自定义类型游戏，2 厂商游戏，3 游戏类型 */
interface GameListForAppNode {
  gameTypeCode?: string
  platformCode?: string
  itemCode?: string
  rowId?: string | number
  subGame?: GameListForAppNode[]
  [key: string]: unknown
}

const normalizeGameLookupValue = (value: unknown) => String(value ?? '').trim()

const splitGameLookupValues = (value: unknown) =>
  normalizeGameLookupValue(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

const isGameLookupValueMatched = (sourceValue: unknown, targetValue: unknown) => {
  const normalizedTargetValue = normalizeGameLookupValue(targetValue)

  if (!normalizedTargetValue) {
    return false
  }

  return splitGameLookupValues(sourceValue).includes(normalizedTargetValue)
}

const flattenGameListForAppItems = (items: GameListForAppNode[]) => {
  const flattenedItems: GameListForAppNode[] = []

  const traverse = (item: GameListForAppNode) => {
    flattenedItems.push(item)

    const children = Array.isArray(item.subGame) ? item.subGame : []
    children.forEach(child => traverse(child))
  }

  items.forEach(traverse)

  return flattenedItems
}

const handleGameJump = async (slide: QuerySlideshowItem) => {
  // 兼容通知页同款 payload：pgType|platformCode|gameCode
  const [pgType, platformCode, gameCode] = String(slide.linkUrl ?? '')
    .trim()
    .split('|')
    .map(value => value.trim())

  if (pgType && !platformCode && !gameCode) {
    await navigateTo(`/casino/${pgType}`)
    return
  }

  if (pgType && platformCode && gameCode) {
    try {
      const gameList = (await gameStore.ensureGameData()) as unknown as GameListForAppNode[]
      const matchedGame = flattenGameListForAppItems(gameList).find(game => {
        return (
          isGameLookupValueMatched(game.gameTypeCode, pgType) &&
          isGameLookupValueMatched(game.platformCode, platformCode) &&
          isGameLookupValueMatched(game.itemCode, gameCode)
        )
      })

      const targetRowId = normalizeGameLookupValue(matchedGame?.rowId)
      if (!targetRowId) {
        console.warn('slideshow game jump target not found in queryGameListForApp', {
          pgType,
          platformCode,
          gameCode,
          slide
        })
        return
      }

      await navigateTo(`/game/${targetRowId}`)
      return
    } catch (error) {
      console.error('handleGameJump failed', error)
      return
    }
  }

  console.warn('slideshow game jump payload invalid', slide)
}

/** 轮播图跳转类型：1 url 跳转，2 跳转内部项面，3 跳转游戏 */
const handleSlideClick = async (slide: QuerySlideshowItem) => {
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
      await handleGameJump(slide)
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
