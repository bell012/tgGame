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
      <transition name="sort-popup">
        <div
          v-if="isSortPopupOpen"
          class="sort-menu-popup absolute right-0 bottom-[calc(100%+10px)] z-20 w-[140px] rounded-[10px] p-[8px]"
          :class="{ 'sort-menu-popup-light': isLightTheme }"
        >
          <div
            v-for="item in sortOptions"
            :key="item.value"
            class="sort-menu-popup-item mb-[6px] flex h-[38px] cursor-pointer items-center justify-center rounded-[8px] text-[12px] font-semibold transition-colors duration-200 last:mb-0"
            :class="{
              'sort-menu-popup-item-active': activeSort === item.value,
              'sort-menu-popup-item-light': isLightTheme && activeSort !== item.value
            }"
            @click.stop="selectSort(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </transition>
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
import { useThemeStore } from '@/stores/theme'
import { resolveProfileAvatarUrl } from '@/utils/profile-customization'
import { storeToRefs } from 'pinia'
import {
  computed,
  inject,
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

const scoreValue = computed(() => {
  const rawScore = Number(currentGameDetail.value?.initScoreStar)

  if (!Number.isFinite(rawScore)) {
    return 4.0
  }

  return Math.max(0, Math.min(5, rawScore))
})

const scoreText = computed(() => scoreValue.value.toFixed(1))

const activeStarCount = computed(() => Math.max(0, Math.min(5, Math.round(scoreValue.value))))

const handleRateChange = (value: number) => {
  if (!requireLogin()) {
    return
  }
  setRating(value)
}

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
  document.removeEventListener('click', handleSortMenuOutsideClick)
})
</script>
<style scoped>
.sort-menu-popup {
  background: #1f2730;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.sort-menu-popup-light {
  background: #edf3fb;
  border: 1px solid #c7d4e6;
  box-shadow: 0 10px 24px rgba(108, 132, 160, 0.22);
}

.sort-menu-popup-item {
  color: #ffffff;
  background: #353d45;
}

.sort-menu-popup-item-light {
  color: #2a3543;
  background: #dbe5f2;
}

.sort-menu-popup-item-active {
  color: #ffffff;
  background: linear-gradient(90deg, #2c9a67 0%, #1d7b52 100%);
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
