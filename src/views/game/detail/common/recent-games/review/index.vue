<template>
  <div class="mt-[12px]">
    <ReviewScorePanel
      :score-text="scoreText"
      :active-star-count="activeStarCount"
      :rating-progress-percents="ratingProgressPercents"
      :user-rating="userRating"
      :display-rating-avatar-urls="displayRatingAvatarUrls"
      :out-of-five-text="t('gameDetail.outOfFive')"
      :rate-this-game-text="t('gameDetail.rateThisGame')"
      :ratings-text="t('gameDetail.ratings', { count: displayRatingCount })"
      @rate-change="handleRateChange"
    />
    <div ref="sortMenuRef" class="relative flex justify-between items-center mt-[20px]">
      <div class="text-[12px] text-[var(--color-text-level-2)]">{{ t('gameDetail.comments') }}</div>
      <button
        ref="sortMenuTriggerRef"
        type="button"
        class="sort-menu-trigger flex items-center justify-center transition-colors duration-200"
        :class="{ 'sort-menu-trigger-light': isLightTheme }"
        @click.stop="toggleSortPopup"
      >
        <SanIcon class="sort-menu-trigger-icon size-[18px]" />
      </button>
      <Teleport to="body">
        <transition name="sort-popup">
          <div
            v-if="isSortPopupOpen"
            ref="sortMenuPopupRef"
            class="sort-menu-popup fixed z-[1200] w-[140px] rounded-[10px] p-[6px]"
            :class="{ 'sort-menu-popup-light': isLightTheme }"
            :style="sortMenuPopupStyle"
          >
            <div
              v-for="item in sortOptions"
              :key="item.value"
              class="sort-menu-popup-item flex h-[30px] cursor-pointer items-center justify-center rounded-[5px] text-[12px] font-medium transition-colors duration-200"
              :class="{ 'sort-menu-popup-item-active': activeSort === item.value }"
              @click.stop="selectSort(item.value)"
            >
              {{ item.label }}
            </div>
          </div>
        </transition>
      </Teleport>
    </div>
    <ReviewCommentEntry
      :avatar-url="currentUserAvatarUrl"
      :show-avatar="isLoggedIn"
      :placeholder-text="t('gameDetail.leaveYourComment')"
      @open="openCommentPopup"
    />

    <ReviewCommentFeed
      :sorted-comment-list="sortedCommentList"
      :is-comment-loading="isCommentLoading"
      :loading-comments-text="t('gameDetail.loadingComments')"
      :refreshing-comments-text="t('gameDetail.refreshingComments')"
      :no-comments-text="t('gameDetail.noCommentsYet')"
      :collapse-text="t('gameDetail.collapse')"
      :expand-text="t('gameDetail.expand')"
      @reply-click="openReplyCommentPopup"
      @toggle-like="toggleLike"
      @toggle-dislike="toggleDislike"
      @toggle-children="toggleChildrenVisible"
      @avatar-error="handleCommentAvatarError"
    />
    <CommentPopup
      v-model="isCommentPopupOpen"
      :placeholder="commentInputPlaceholder"
      @submit="submitComment"
    />
  </div>
</template>
<script setup lang="ts">
import { useGameRating } from '@/composables/useGameRating'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useUserStore } from '@/stores/user'
import RatingAvatarP1 from '@/static/svg/game/detail/comment/p1.svg?url'
import RatingAvatarP2 from '@/static/svg/game/detail/comment/p2.webp?url'
import RatingAvatarP3 from '@/static/svg/game/detail/comment/p3.svg?url'
import RatingAvatarP4 from '@/static/svg/game/detail/comment/p4.svg?url'
import RatingAvatarP5 from '@/static/svg/game/detail/comment/p5.svg?url'
import SanIcon from '@/static/svg/game/detail/comment/san.svg?component'
import { useThemeStore } from '@/stores/theme'
import { resolveProfileAvatarUrl } from '@/utils/profile-customization'
import { storeToRefs } from 'pinia'
import {
  computed,
  inject,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComputedRef
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import CommentPopup from './comment-popup.vue'
import ReviewCommentEntry from './review-comment-entry.vue'
import ReviewCommentFeed from './review-comment-feed.vue'
import ReviewScorePanel from './review-score-panel.vue'
import {
  RATING_DISTRIBUTION_BASE,
  buildDistributionWithRandomFactor,
  buildRatingPreviewAvatarUrls,
  getScoreTemplateKey,
  normalizePositiveInt,
  normalizeQueryValue
} from './review-utils'
import { useReviewComments } from './use-review-comments'

type CurrentGameDetail = {
  initScoreNum?: number | string
  initScoreStar?: number | string
  onlineNumMax?: number | string
  onlineNumMin?: number | string
} | null

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const route = useRoute()
const currentGameId = computed(() => normalizeQueryValue(route.params.rowId))
const gameImageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')
const { t } = useI18n()
const themeStore = useThemeStore()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const isLightTheme = computed(() => themeStore.theme === 'light')
const isLoggedIn = computed(() => Boolean(userInfo.value?.tradeToken))
const currentUserAvatarUrl = computed(() => {
  if (!isLoggedIn.value) {
    return RatingAvatarP1
  }

  return resolveProfileAvatarUrl(userInfo.value?.headPortrait)
})

const { requireLogin } = useRequireLoginAction()
const { rating: userRating, setRating } = useGameRating()
const DEFAULT_COMMENT_AVATAR_URL = RatingAvatarP1
const {
  ratingCountFromSubject,
  loadedCommentCount,
  isCommentLoading,
  sortedCommentList,
  sortMenuRef,
  sortMenuPopupRef,
  isSortPopupOpen,
  activeSort,
  sortOptions,
  isCommentPopupOpen,
  commentInputPlaceholder,
  selectSort,
  openCommentPopup,
  openReplyCommentPopup,
  toggleLike,
  toggleDislike,
  toggleChildrenVisible,
  submitComment,
  handleCommentAvatarError,
  requestCommentSubject,
  handleSortMenuOutsideClick
} = useReviewComments({
  currentGameId,
  gameImageBaseUrl,
  defaultCommentAvatarUrl: DEFAULT_COMMENT_AVATAR_URL,
  requireLogin,
  t
})

// ===== 评分概览（评分数、评分头像、评分星级）=====
const baseRatingCount = computed(() => {
  // 评论主体接口有评分人数时优先使用，避免和详情接口字段语义冲突
  if (ratingCountFromSubject.value > 0) {
    return ratingCountFromSubject.value
  }

  if (loadedCommentCount.value > 0) {
    return loadedCommentCount.value
  }

  return normalizePositiveInt(currentGameDetail.value?.initScoreNum)
})

const MAX_RATING_AVATAR_COUNT = 5
const FALLBACK_RATING_AVATAR_URLS = [
  RatingAvatarP1,
  RatingAvatarP2,
  RatingAvatarP3,
  RatingAvatarP4,
  RatingAvatarP5
]

const hasUserRating = computed(() => isLoggedIn.value && Number(userRating.value) > 0)

const ratingPreviewCount = computed(() => {
  return Math.min(
    MAX_RATING_AVATAR_COUNT,
    Math.max(0, baseRatingCount.value + (hasUserRating.value ? 1 : 0))
  )
})

const displayRatingAvatarUrls = computed(() => {
  return buildRatingPreviewAvatarUrls({
    count: ratingPreviewCount.value,
    fallbackAvatarUrls: FALLBACK_RATING_AVATAR_URLS,
    hasUserRating: hasUserRating.value,
    userAvatarUrl: currentUserAvatarUrl.value
  })
})

const displayRatingCount = computed(() => displayRatingAvatarUrls.value.length)
const SCORE_TYPE_TO_VALUE: Record<number, number> = {
  1: 4.0,
  2: 4.5,
  3: 5.0
}

const scoreValue = computed(() => {
  const scoreType = Number(currentGameDetail.value?.initScoreStar)

  if (!Number.isFinite(scoreType)) {
    return 4.0
  }

  return SCORE_TYPE_TO_VALUE[scoreType] ?? 4.0
})

const scoreText = computed(() => scoreValue.value.toFixed(1))

const activeStarCount = computed(() => scoreValue.value)

const handleRateChange = (value: number) => {
  if (!requireLogin()) {
    return
  }
  setRating(value)
}

const sortMenuTriggerRef = ref<HTMLElement | null>(null)
const sortMenuPopupStyle = ref<Record<string, string>>({})
let sortMenuPositionRaf = 0

const updateSortMenuPopupPosition = () => {
  const trigger = sortMenuTriggerRef.value
  if (!trigger) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const popupWidth = 140
  const gap = 10

  sortMenuPopupStyle.value = {
    top: `${rect.top - gap}px`,
    left: `${rect.right - popupWidth}px`,
    transform: 'translateY(-100%)'
  }
}

const handleSortMenuPositionUpdate = () => {
  if (!isSortPopupOpen.value) {
    return
  }

  if (sortMenuPositionRaf) {
    cancelAnimationFrame(sortMenuPositionRaf)
  }

  sortMenuPositionRaf = requestAnimationFrame(() => {
    updateSortMenuPopupPosition()
  })
}

const bindSortMenuPositionListeners = () => {
  window.addEventListener('scroll', handleSortMenuPositionUpdate, true)
  window.addEventListener('resize', handleSortMenuPositionUpdate)
}

const unbindSortMenuPositionListeners = () => {
  window.removeEventListener('scroll', handleSortMenuPositionUpdate, true)
  window.removeEventListener('resize', handleSortMenuPositionUpdate)

  if (sortMenuPositionRaf) {
    cancelAnimationFrame(sortMenuPositionRaf)
    sortMenuPositionRaf = 0
  }
}

const toggleSortPopup = () => {
  isSortPopupOpen.value = !isSortPopupOpen.value
}

watch(isSortPopupOpen, open => {
  if (open) {
    void nextTick(() => {
      updateSortMenuPopupPosition()
      bindSortMenuPositionListeners()
    })
    return
  }

  unbindSortMenuPositionListeners()
})

// ===== 评分分布条（右侧 5 条进度）=====
const progressRandomSalt = ref(`${Date.now()}-${Math.random()}`)

const refreshProgressRandomSalt = () => {
  progressRandomSalt.value = `${Date.now()}-${Math.random()}`
}

const ratingProgressPercents = computed(() => {
  // 依赖此值来控制“每次触发刷新都重新随机”
  void progressRandomSalt.value

  const key = getScoreTemplateKey(scoreValue.value)
  const baseDistribution = RATING_DISTRIBUTION_BASE[key]
  const normalizedDistribution = buildDistributionWithRandomFactor(baseDistribution)

  // 5 条进度条总长度 = 2 条完整进度条长度（总和 200%）
  return normalizedDistribution.map(value => Number((value * 200).toFixed(2)))
})

// ===== 生命周期与监听 =====
onMounted(() => {
  refreshProgressRandomSalt()
  document.addEventListener('click', handleSortMenuOutsideClick)
})

onActivated(() => {
  refreshProgressRandomSalt()
})

watch(
  currentGameId,
  () => {
    refreshProgressRandomSalt()
    void requestCommentSubject()
  },
  { immediate: true }
)

watch(scoreValue, () => {
  refreshProgressRandomSalt()
})

onBeforeUnmount(() => {
  unbindSortMenuPositionListeners()
  document.removeEventListener('click', handleSortMenuOutsideClick)
})
</script>
<style scoped>
.sort-menu-popup {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: var(--color-background-level-2);
  box-shadow: 0 7px 31px rgba(0, 0, 0, 0.5);
}

.sort-menu-popup::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 8px solid var(--color-background-level-2);
}

.sort-menu-trigger {
  background: transparent;
  border: none;
  padding: 0;
}

.sort-menu-trigger-light {
  background: transparent;
}

.sort-menu-trigger-icon {
  color: var(--color-icon-level-2);
}

.sort-menu-trigger-icon :deep(path) {
  fill: currentColor;
}

.sort-menu-popup-light {
  background: #ffffff;
  box-shadow: 0 0 49px rgba(172, 172, 172, 0.53);
}

.sort-menu-popup-light::after {
  border-top-color: #ffffff;
}

.sort-menu-popup-item {
  color: var(--color-text-level-1);
  background: var(--color-opacity-5);
}

.sort-menu-popup-item-active {
  color: var(--color-text-level-1);
  background:
    linear-gradient(90deg, rgba(0, 255, 96, 0.3) 0%, rgba(0, 255, 96, 0) 70%),
    var(--color-opacity-5);
}

.sort-popup-enter-active,
.sort-popup-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.sort-popup-enter-from,
.sort-popup-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
