<template>
  <div class="mt-[12px]">
    <div
      class="flex flex-col lg:flex-row bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] p-[12px]"
    >
      <div class="lg:flex-1 flex justify-start items-center gap-[20px]">
        <div class="text-[26px] font-bold w-[100px] text-right">{{ scoreText }}</div>
        <div>
          <star :count="5" :active-count="activeStarCount" />
          <div class="text-[13px] text-[var(--color-text-level-2)] hidden lg:block">
            {{ t('gameDetail.outOfFive') }}
          </div>
        </div>
      </div>
      <div class="lg:flex-1 flex flex-col mt-[12px] gap-[10px]">
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="5" class="w-[100px]" />
          <progress-bar :percent="ratingProgressPercents[0]" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="4" class="w-[100px]" />
          <progress-bar :percent="ratingProgressPercents[1]" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="3" class="w-[100px]" />
          <progress-bar :percent="ratingProgressPercents[2]" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="2" class="w-[100px]" />
          <progress-bar :percent="ratingProgressPercents[3]" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="1" class="w-[100px]" />
          <progress-bar :percent="ratingProgressPercents[4]" />
        </div>
      </div>
    </div>
    <div class="flex gap-[20px]">
      <div
        class="flex-1 flex flex-col justify-center items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[12px]"
      >
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">
          {{ t('gameDetail.rateThisGame') }}
        </div>
        <star
          :count="5"
          :active-count="userRating"
          :clickable="true"
          class="flex justify-center mt-[4px]"
          @change="handleRateChange"
        />
      </div>
      <div
        class="flex-1 flex flex-col justify-center items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[12px]"
      >
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">
          {{ t('gameDetail.ratings', { count: ratingCount }) }}
        </div>
        <div class="flex justify-center items-center mt-[4px]">
          <SmartImage
            v-for="avatarIndex in avatarCount"
            :key="avatarIndex"
            alt=""
            :src="PersonIcon"
            class="size-[26px] rounded-[26px]"
          />
        </div>
      </div>
    </div>
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
    <div class="flex items-center gap-[10px] mt-[10px]">
      <SmartImage alt="" :src="PersonIcon" class="size-[44px] rounded-[44px]" />
      <div
        class="flex-1 flex h-[50px] justify-between items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[4px] px-[12px] cursor-pointer"
        @click="openCommentPopup"
      >
        <div class="text-[12px] text-[var(--color-text-level-2)]">
          {{ t('gameDetail.leaveYourComment') }}
        </div>
        <SmartImage alt="" :src="EmoIcon" class="size-[18px]" />
      </div>
    </div>

    <div
      v-if="isCommentLoading && !sortedCommentList.length"
      class="flex items-center justify-center gap-[8px] bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[18px] px-[12px]"
    >
      <div
        class="size-[16px] rounded-full border-[2px] border-[var(--color-text-level-3)] border-t-transparent animate-spin"
      ></div>
      <div class="text-[12px] text-[var(--color-text-level-3)]">
        {{ t('gameDetail.loadingComments') }}
      </div>
    </div>
    <div
      v-else-if="isCommentLoading"
      class="flex items-center justify-center gap-[8px] bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[10px] px-[12px]"
    >
      <div
        class="size-[14px] rounded-full border-[2px] border-[var(--color-text-level-3)] border-t-transparent animate-spin"
      ></div>
      <div class="text-[12px] text-[var(--color-text-level-3)]">
        {{ t('gameDetail.refreshingComments') }}
      </div>
    </div>

    <template v-if="sortedCommentList.length">
      <div
        v-for="comment in sortedCommentList"
        :key="comment.id"
        class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[12px] px-[12px]"
      >
        <div class="flex justify-between">
          <div class="flex text-[12px] items-center gap-[8px]">
            <SmartImage alt="" :src="comment.avatarUrl" class="size-[26px] rounded-[26px]" />
            <div class="text-[var(--color-text-level-2)]">{{ comment.memberName }}</div>
            <div class="text-[var(--color-text-level-3)]">{{ comment.timeText }}</div>
          </div>
          <div class="flex items-center gap-[10px]">
            <div>
              <SmartImage
                alt=""
                :src="CommentIcon"
                class="size-[16px] cursor-pointer"
                @click="openReplyCommentPopup(comment)"
              />
            </div>
            <div class="relative">
              <SmartImage
                alt=""
                :src="ZanIcon"
                class="size-[16px] cursor-pointer transition duration-200"
                :class="{ 'comment-like-icon-active': comment.isLiked }"
                @click="toggleLike(comment)"
              />
              <div
                v-if="comment.likeCount > 0"
                class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
              >
                {{ comment.likeCount }}
              </div>
            </div>
            <div class="relative">
              <SmartImage
                alt=""
                :src="UnzanIcon"
                class="size-[16px] cursor-pointer transition duration-200"
                :class="{ 'comment-like-icon-active': comment.isDisliked }"
                @click="toggleDislike(comment)"
              />
              <div
                v-if="comment.dislikeCount > 0"
                class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
              >
                {{ comment.dislikeCount }}
              </div>
            </div>
          </div>
        </div>
        <div class="text-[var(--color-text-level-2)] text-[12px] mt-[10px]">
          {{ comment.content }}
        </div>
        <transition name="child-comments-collapse">
          <div
            v-if="comment.children.length > 0 && comment.isChildrenExpanded"
            class="mt-[10px] ml-[20px]"
          >
            <div
              v-for="child in comment.children"
              :key="child.id"
              class="border-t border-[var(--color-opacity-10)] pt-[12px] pb-[8px]"
            >
              <div class="flex justify-between">
                <div class="flex text-[12px] items-center gap-[8px]">
                  <SmartImage alt="" :src="child.avatarUrl" class="size-[26px] rounded-[26px]" />
                  <div class="text-[var(--color-text-level-2)]">{{ child.memberName }}</div>
                  <div class="text-[var(--color-text-level-3)]">{{ child.timeText }}</div>
                </div>
                <div class="flex items-center gap-[10px]">
                  <div class="relative">
                    <SmartImage
                      alt=""
                      :src="ZanIcon"
                      class="size-[16px] cursor-pointer transition duration-200"
                      :class="{ 'comment-like-icon-active': child.isLiked }"
                      @click="toggleLike(child)"
                    />
                    <div
                      v-if="child.likeCount > 0"
                      class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
                    >
                      {{ child.likeCount }}
                    </div>
                  </div>
                  <div class="relative">
                    <SmartImage
                      alt=""
                      :src="UnzanIcon"
                      class="size-[16px] cursor-pointer transition duration-200"
                      :class="{ 'comment-like-icon-active': child.isDisliked }"
                      @click="toggleDislike(child)"
                    />
                    <div
                      v-if="child.dislikeCount > 0"
                      class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
                    >
                      {{ child.dislikeCount }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-[var(--color-text-level-2)] text-[12px] mt-[10px]">
                {{ child.content }}
              </div>
            </div>
          </div>
        </transition>
        <div v-if="comment.children.length > 0" class="mt-[4px] flex items-center justify-start">
          <button
            type="button"
            class="inline-flex items-center gap-[8px] text-[var(--color-theme-level-1)] text-[13px] leading-[20px] font-semibold transition-opacity duration-200 hover:opacity-80"
            @click="toggleChildrenVisible(comment)"
          >
            {{ comment.isChildrenExpanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}
            <SmartImage
              alt=""
              :src="comment.isChildrenExpanded ? ExpandUpDoubleIcon : ExpandDownDoubleIcon"
              class="w-[9px] h-[8px] opacity-85"
            />
          </button>
        </div>
      </div>
    </template>
    <div
      v-else-if="!isCommentLoading"
      class="flex items-center justify-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[18px] px-[12px] text-[12px] text-[var(--color-text-level-3)]"
    >
      {{ t('gameDetail.noCommentsYet') }}
    </div>
    <CommentPopup
      v-model="isCommentPopupOpen"
      :placeholder="commentInputPlaceholder"
      @submit="submitComment"
    />
  </div>
</template>
<script setup lang="ts">
import Api from '@/api'
import type { GameCommentListItem } from '@/api/interface/game'
import { useGameRating } from '@/composables/useGameRating'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?url'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?url'
import CommentIcon from '@/static/svg/game/detail/comment/comment.svg?url'
import EmoIcon from '@/static/svg/game/detail/comment/emo.svg?url'
import PersonIcon from '@/static/svg/game/detail/comment/person.webp?url'
import UnzanIcon from '@/static/svg/game/detail/comment/unzan.svg?url'
import ZanIcon from '@/static/svg/game/detail/comment/zan.svg?url'
import { useThemeStore } from '@/stores/theme'
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
import ProgressBar from './progress.vue'
import Star from './star.vue'
import SmartImage from '@/components/common/SmartImage.vue'

type CurrentGameDetail = {
  initScoreNum?: number | string
  initScoreStar?: number | string
  onlineNumMax?: number | string
  onlineNumMin?: number | string
} | null
type LocalAcctInfo = {
  memberId?: string | number
  memberRowId?: string | number
} | null

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const route = useRoute()
const gameImageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')
const { t } = useI18n()
const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.theme === 'light')

const { requireLogin } = useRequireLoginAction()
const { rating: userRating, setRating } = useGameRating()

const baseRatingCount = computed(() => {
  const parsed = Number(currentGameDetail.value?.initScoreNum)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0
  }
  return Math.trunc(parsed)
})

const ratingCount = computed(() => {
  return baseRatingCount.value + (userRating.value > 0 ? 1 : 0)
})

const avatarCount = computed(() => Math.min(8, Math.max(0, ratingCount.value)))

const scoreValue = computed(() => {
  const rawScore = Number(currentGameDetail.value?.initScoreStar)

  if (!Number.isFinite(rawScore)) {
    return 4.0
  }

  // 兼容后端枚举值：1/2/3 -> 4.0/4.5/5.0
  if (rawScore === 1) return 4.0
  if (rawScore === 2) return 4.5
  if (rawScore === 3) return 5.0

  // 兼容后端直接返回评分值：4.0/4.5/5.0
  if (rawScore >= 4 && rawScore <= 5) {
    return rawScore
  }

  return 4.0
})

const scoreText = computed(() => scoreValue.value.toFixed(1))

const activeStarCount = computed(() => Math.max(0, Math.min(5, Math.round(scoreValue.value))))

const handleRateChange = (value: number) => {
  if (!requireLogin()) {
    return
  }
  setRating(value)
}

type ScoreTemplateKey = 'five' | 'fourHalf' | 'four'

const RATING_DISTRIBUTION_BASE: Record<ScoreTemplateKey, [number, number, number, number, number]> =
  {
    // 5.0: P5 > P4 > P3 > 2P2 > 4P1
    // 对应顺序为 [P5, P4, P3, P2, P1]
    five: [0.46, 0.25, 0.16, 0.07, 0.03],
    // 4.5: P5 >= P4 >= P3 > 2P2 > 3P1
    fourHalf: [0.37, 0.33, 0.19, 0.07, 0.04],
    // 4.0: P4 > P5 > P3 > 2P2 > 3P1
    four: [0.27, 0.4, 0.2, 0.08, 0.05]
  }

const RANDOM_FLOAT_RATIO = 0.1

const normalizeDistribution = (values: number[]) => {
  const total = values.reduce((sum, current) => sum + Math.max(0, current), 0)

  if (total <= 0) {
    return [0, 0, 0, 0, 0]
  }

  return values.map(value => Math.max(0, value) / total)
}

const getScoreTemplateKey = (score: number): ScoreTemplateKey => {
  if (score >= 4.75) return 'five'
  if (score >= 4.25) return 'fourHalf'
  return 'four'
}

const buildDistributionWithRandomFactor = (
  baseDistribution: [number, number, number, number, number]
) => {
  const withFactor = baseDistribution.map((value, index) => {
    void index
    // 每条进度条在基准上做 ±10% 浮动
    const randomFactor = (Math.random() * 2 - 1) * RANDOM_FLOAT_RATIO
    return Math.max(value * (1 + randomFactor), 0.0001)
  })

  // 归一化后保证 5 条占比和为 1（最终再映射到 200%）
  return normalizeDistribution(withFactor)
}

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

const normalizeQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

const getAcctInfoFromStorage = () => {
  if (typeof window === 'undefined') {
    return {
      memberId: '',
      memberRowId: ''
    }
  }
  const rawAcctInfo = window.localStorage.getItem('acctInfo')
  if (!rawAcctInfo) {
    return {
      memberId: '',
      memberRowId: ''
    }
  }

  try {
    const parsed = JSON.parse(rawAcctInfo) as LocalAcctInfo
    return {
      memberId: normalizeQueryValue(parsed?.memberId),
      memberRowId: normalizeQueryValue(parsed?.memberRowId)
    }
  } catch (error) {
    console.error('getAcctInfoFromStorage parse failed', error)
    return {
      memberId: '',
      memberRowId: ''
    }
  }
}

const currentGameId = computed(() => normalizeQueryValue(route.params.rowId))
const commentSubjectId = ref('')
const isCommentLoading = ref(false)
const COMMENT_LIKE_STORAGE_KEY = 'gameCommentLikeMap'

type CommentLikeCacheItem = {
  isLiked: boolean
  isDisliked: boolean
  likeCount: number
}

type CommentLikeCacheMap = Record<string, CommentLikeCacheItem>

const normalizeLikeCount = (value: unknown) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }
  return Math.trunc(parsed)
}

const normalizeIsLiked = (value: unknown) =>
  value === true || value === 1 || value === '1' || value === 'true'

const parseCommentLikeCacheItem = (value: unknown): CommentLikeCacheItem | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const parsedValue = value as Record<string, unknown>
  return {
    isLiked: normalizeIsLiked(parsedValue.isLiked ?? parsedValue.liked),
    isDisliked: normalizeIsLiked(parsedValue.isDisliked ?? parsedValue.disliked),
    likeCount: normalizeLikeCount(parsedValue.likeCount)
  }
}

const parseCommentLikeCacheMap = (rawValue: string | null): CommentLikeCacheMap => {
  const result: CommentLikeCacheMap = {}
  if (!rawValue) {
    return result
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return result
    }

    Object.entries(parsedValue as Record<string, unknown>).forEach(([key, value]) => {
      const normalizedKey = normalizeQueryValue(key)
      const normalizedValue = parseCommentLikeCacheItem(value)
      if (!normalizedKey || !normalizedValue) {
        return
      }
      result[normalizedKey] = normalizedValue
    })
  } catch (error) {
    console.error('parse comment like cache failed', error)
  }

  return result
}

const getCommentLikeCacheMap = () => {
  if (typeof window === 'undefined') {
    return {}
  }
  return parseCommentLikeCacheMap(window.localStorage.getItem(COMMENT_LIKE_STORAGE_KEY))
}

const saveCommentLikeCacheMap = (cacheMap: CommentLikeCacheMap) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(COMMENT_LIKE_STORAGE_KEY, JSON.stringify(cacheMap))
}

const createCommentLikeCacheKey = (subjectId: string, commentId: string) => {
  const normalizedCommentId = normalizeQueryValue(commentId)
  if (!normalizedCommentId) {
    return ''
  }

  const normalizedSubjectId = normalizeQueryValue(subjectId)
  return normalizedSubjectId ? `${normalizedSubjectId}_${normalizedCommentId}` : normalizedCommentId
}

const getCommentLikeCacheByKey = (cacheMap: CommentLikeCacheMap, key: string) => {
  const normalizedKey = normalizeQueryValue(key)
  if (!normalizedKey) {
    return null
  }
  return cacheMap[normalizedKey] ?? null
}

const setCommentLikeCacheByKey = (key: string, value: CommentLikeCacheItem) => {
  const normalizedKey = normalizeQueryValue(key)
  if (!normalizedKey) {
    return
  }

  const cacheMap = getCommentLikeCacheMap()
  cacheMap[normalizedKey] = {
    isLiked: Boolean(value.isLiked),
    isDisliked: Boolean(value.isDisliked),
    likeCount: normalizeLikeCount(value.likeCount)
  }
  saveCommentLikeCacheMap(cacheMap)
}

type ReviewCommentViewItem = {
  id: string
  memberName: string
  content: string
  timeText: string
  avatarUrl: string
  isLiked: boolean
  isDisliked: boolean
  likeStorageKey: string
  likeCount: number
  dislikeCount: number
  replyCount: number
  createTime: number
  isChildrenExpanded: boolean
  children: ReviewCommentViewItem[]
}

const commentList = ref<ReviewCommentViewItem[]>([])

const toSafeNumber = (value: unknown) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 0
  }
  return parsed
}

const formatElapsedTime = (timestamp: number) => {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return '--'
  }

  const diffMs = Date.now() - timestamp
  if (diffMs <= 0) {
    return '0m'
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 1)}m`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

const resolveCommentAvatar = (avatar: unknown) => {
  const avatarPath = normalizeQueryValue(avatar)
  if (!avatarPath) {
    return PersonIcon
  }
  if (/^(data:|blob:|https?:\/\/|\/)/i.test(avatarPath)) {
    return avatarPath
  }
  return gameImageBaseUrl ? `${gameImageBaseUrl}${avatarPath}` : avatarPath
}

const mapCommentItem = (
  item: GameCommentListItem,
  index: number,
  fallbackPrefix = 'comment',
  subjectId = '',
  likeCacheMap: CommentLikeCacheMap = {}
): ReviewCommentViewItem => {
  const createTime = toSafeNumber(item?.createTime)
  const memberName =
    normalizeQueryValue(item?.memberName ?? item?.memberId) || t('gameDetail.anonymous')
  const id = normalizeQueryValue(item?.id ?? item?.rowId) || `${fallbackPrefix}-${index}`
  const likeStorageKey = createCommentLikeCacheKey(subjectId, id)
  const fallbackLikeCount = Math.max(0, Math.trunc(toSafeNumber(item?.likeCount)))
  const cachedLike = getCommentLikeCacheByKey(likeCacheMap, likeStorageKey)

  return {
    id,
    memberName,
    content: normalizeQueryValue(item?.content),
    timeText: formatElapsedTime(createTime),
    avatarUrl: resolveCommentAvatar(item?.memberAvatar),
    isLiked: Boolean(cachedLike?.isLiked),
    isDisliked: Boolean(cachedLike?.isDisliked),
    likeStorageKey,
    likeCount: cachedLike ? normalizeLikeCount(cachedLike.likeCount) : fallbackLikeCount,
    dislikeCount: Math.max(0, Math.trunc(toSafeNumber(item?.dislikeCount))),
    replyCount: Math.max(0, Math.trunc(toSafeNumber(item?.replyCount))),
    createTime,
    isChildrenExpanded: true,
    children: []
  }
}

const parseCommentRecords = (result: unknown): GameCommentListItem[] => {
  const records = (result as { records?: unknown } | undefined)?.records
  if (Array.isArray(result)) {
    return result as GameCommentListItem[]
  }
  if (Array.isArray(records)) {
    return records as GameCommentListItem[]
  }
  return []
}

const sortedCommentList = computed(() => {
  const source = [...commentList.value]

  if (activeSort.value === 'comments') {
    return source.sort((a, b) => b.children.length - a.children.length)
  }

  if (activeSort.value === 'likes') {
    return source.sort((a, b) => b.likeCount - a.likeCount)
  }

  return source.sort((a, b) => b.createTime - a.createTime)
})

const requestCommentsList = async (subjectId: string) => {
  if (!subjectId) {
    commentList.value = []
    return
  }

  const { memberRowId } = getAcctInfoFromStorage()
  const memberRowIdNumber = Number(memberRowId)
  const validMemberRowId = Number.isFinite(memberRowIdNumber) ? memberRowIdNumber : undefined

  isCommentLoading.value = true
  try {
    const commentLikeCacheMap = getCommentLikeCacheMap()
    const res = await Api.game.getCommentsList(
      {
        subjectId,
        current: 1,
        size: 100,
        root: '0',
        parent: '0',
        memberRowId: validMemberRowId
      },
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    const rootComments = parseCommentRecords(res?.result).map((item, index) =>
      mapCommentItem(item, index, 'root-comment', subjectId, commentLikeCacheMap)
    )
    commentList.value = rootComments

    await Promise.all(
      commentList.value.map(async item => {
        const parentId = normalizeQueryValue(item.id)
        if (!parentId) {
          item.children = []
          return
        }

        try {
          const childrenRes = await Api.game.getCommentsList(
            {
              subjectId,
              current: 1,
              size: 100,
              parent: parentId,
              root: null,
              memberRowId: validMemberRowId
            },
            {
              showSuccessToast: false,
              showErrorToast: true
            }
          )
          item.children = parseCommentRecords(childrenRes?.result).map((childItem, childIndex) =>
            mapCommentItem(
              childItem,
              childIndex,
              `${parentId}-child`,
              subjectId,
              commentLikeCacheMap
            )
          )
        } catch (error) {
          console.error('get child comments failed', error)
          item.children = []
        }
      })
    )
  } catch (error) {
    console.error('getCommentsList failed', error)
    commentList.value = []
  } finally {
    isCommentLoading.value = false
  }
}

const requestCommentSubject = async () => {
  const gameId = currentGameId.value
  if (!gameId) {
    commentSubjectId.value = ''
    commentList.value = []
    return
  }

  try {
    const { memberRowId } = getAcctInfoFromStorage()
    const res = await Api.game.getCommentSubject(
      {
        gameId,
        memberRowId: memberRowId || undefined
      },
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    const result = res?.result
    commentSubjectId.value = normalizeQueryValue(result?.subjectId ?? result?.id ?? result?.rowId)
    await requestCommentsList(commentSubjectId.value)
  } catch (error) {
    console.error('getCommentSubject failed', error)
    commentSubjectId.value = ''
    commentList.value = []
  }
}

const sortMenuRef = ref<HTMLElement | null>(null)
const isSortPopupOpen = ref(false)
const activeSort = ref('newest')
const isCommentPopupOpen = ref(false)
const replyTargetComment = ref<ReviewCommentViewItem | null>(null)
const sortOptions = computed(() => [
  { value: 'newest', label: t('gameDetail.sortNewestFirst') },
  { value: 'comments', label: t('gameDetail.sortTopComments') },
  { value: 'likes', label: t('gameDetail.sortTopLikes') }
])

const commentInputPlaceholder = computed(() => {
  const memberName = normalizeQueryValue(replyTargetComment.value?.memberName)
  if (!memberName) {
    return t('gameDetail.leaveYourComment')
  }
  return t('gameDetail.replyToUser', { name: memberName })
})

const selectSort = (value: string) => {
  activeSort.value = value
  isSortPopupOpen.value = false
}

const openCommentPopup = () => {
  if (!requireLogin()) {
    return
  }
  replyTargetComment.value = null
  isCommentPopupOpen.value = true
}

const openReplyCommentPopup = (comment: ReviewCommentViewItem) => {
  if (!requireLogin()) {
    return
  }
  replyTargetComment.value = comment
  isCommentPopupOpen.value = true
}

const toggleLike = (comment: ReviewCommentViewItem) => {
  const likeStorageKey = normalizeQueryValue(comment.likeStorageKey)
  if (!likeStorageKey) {
    return
  }

  const nextIsLiked = !comment.isLiked
  const nextLikeCount = nextIsLiked
    ? normalizeLikeCount(comment.likeCount + 1)
    : normalizeLikeCount(comment.likeCount - 1)

  comment.isLiked = nextIsLiked
  if (nextIsLiked) {
    comment.isDisliked = false
  }
  comment.likeCount = nextLikeCount
  setCommentLikeCacheByKey(likeStorageKey, {
    isLiked: nextIsLiked,
    isDisliked: comment.isDisliked,
    likeCount: nextLikeCount
  })
}

const toggleDislike = (comment: ReviewCommentViewItem) => {
  const likeStorageKey = normalizeQueryValue(comment.likeStorageKey)
  if (!likeStorageKey) {
    return
  }

  const nextIsDisliked = !comment.isDisliked
  const shouldDeductLike = nextIsDisliked && comment.isLiked
  const nextLikeCount = shouldDeductLike
    ? normalizeLikeCount(comment.likeCount - 1)
    : comment.likeCount

  if (shouldDeductLike) {
    comment.isLiked = false
    comment.likeCount = nextLikeCount
  }
  comment.isDisliked = nextIsDisliked

  setCommentLikeCacheByKey(likeStorageKey, {
    isLiked: comment.isLiked,
    isDisliked: nextIsDisliked,
    likeCount: normalizeLikeCount(comment.likeCount)
  })
}

const toggleChildrenVisible = (comment: ReviewCommentViewItem) => {
  if (!comment.children.length) {
    return
  }
  comment.isChildrenExpanded = !comment.isChildrenExpanded
}

const submitComment = async (content: string) => {
  if (!requireLogin()) {
    return
  }

  const commentContent = String(content ?? '').trim()
  if (!commentContent) {
    return
  }

  let subjectId = commentSubjectId.value
  if (!subjectId) {
    await requestCommentSubject()
    subjectId = commentSubjectId.value
  }
  if (!subjectId) {
    console.error('publishComment skipped: subjectId is empty')
    return
  }

  const { memberId, memberRowId } = getAcctInfoFromStorage()
  const memberRowIdNumber = Number(memberRowId)
  if (!memberId || !Number.isFinite(memberRowIdNumber)) {
    console.error('publishComment skipped: memberId/memberRowId is invalid')
    return
  }

  try {
    const replyParentId = normalizeQueryValue(replyTargetComment.value?.id)
    const isReplyComment = Boolean(replyParentId)
    await Api.game.publishComment(
      {
        subjectId,
        memberId,
        memberRowId: Math.trunc(memberRowIdNumber),
        content: commentContent,
        root: isReplyComment ? '1' : '0',
        parent: isReplyComment ? replyParentId : '0',
        replyIndex: ''
      },
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    await requestCommentsList(subjectId)
    replyTargetComment.value = null
  } catch (error) {
    console.error('publishComment failed', error)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (!sortMenuRef.value) return
  if (!sortMenuRef.value.contains(event.target as Node)) {
    isSortPopupOpen.value = false
  }
}

onMounted(() => {
  refreshProgressRandomSalt()
  document.addEventListener('click', handleClickOutside)
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

watch(isCommentPopupOpen, isOpen => {
  if (!isOpen) {
    replyTargetComment.value = null
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
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

.comment-like-icon-active {
  filter: brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(512%) hue-rotate(98deg)
    brightness(95%) contrast(95%);
}

.child-comments-collapse-enter-active,
.child-comments-collapse-leave-active {
  transition:
    max-height 0.28s ease,
    opacity 0.22s ease,
    transform 0.22s ease;
  overflow: hidden;
}

.child-comments-collapse-enter-from,
.child-comments-collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

.child-comments-collapse-enter-to,
.child-comments-collapse-leave-from {
  max-height: 1200px;
  opacity: 1;
  transform: translateY(0);
}
</style>
