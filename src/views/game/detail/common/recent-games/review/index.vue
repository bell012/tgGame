<template>
  <div class="mt-[12px]">
    <div
      class="flex flex-col lg:flex-row bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] p-[12px]"
    >
      <div class="lg:flex-1 flex justify-start items-center gap-[20px]">
        <div class="text-[26px] font-bold w-[100px] text-right">{{ scoreText }}</div>
        <div>
          <star :count="5" :active-count="activeStarCount" />
          <div class="text-[13px] text-[var(--color-text-level-2)] hidden lg:block">Out of 5</div>
        </div>
      </div>
      <div class="lg:flex-1 flex flex-col mt-[12px] gap-[10px]">
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="5" class="w-[100px]" />
          <progress-bar :percent="50" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="4" class="w-[100px]" />
          <progress-bar :percent="20" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="3" class="w-[100px]" />
          <progress-bar :percent="30" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="2" class="w-[100px]" />
          <progress-bar :percent="10" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="1" class="w-[100px]" />
          <progress-bar :percent="60" />
        </div>
      </div>
    </div>
    <div class="flex gap-[20px]">
      <div
        class="flex-1 flex flex-col justify-center items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[12px]"
      >
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">Rate this Game</div>
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
          {{ ratingCount }} Ratings
        </div>
        <div class="flex justify-center items-center mt-[4px]">
          <img
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
      <div class="text-[12px] text-[var(--color-text-level-2)]">Comments</div>
      <img alt="" :src="SanIcon" class="size-[18px] cursor-pointer" @click.stop="toggleSortPopup" />
      <transition name="sort-popup">
        <div
          v-if="isSortPopupOpen"
          class="absolute right-0 bottom-[calc(100%+10px)] z-20 w-[140px] rounded-[10px] bg-[#1F2730] p-[8px] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >
          <div
            v-for="item in sortOptions"
            :key="item.value"
            class="mb-[6px] flex h-[38px] cursor-pointer items-center justify-center rounded-[8px] text-[12px] font-semibold text-white transition-colors duration-200 last:mb-0"
            :class="
              activeSort === item.value
                ? 'bg-[linear-gradient(90deg,#2C9A67_0%,#1D7B52_100%)]'
                : 'bg-[#353D45]'
            "
            @click.stop="selectSort(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </transition>
    </div>
    <div class="flex items-center gap-[10px] mt-[10px]">
      <img alt="" :src="PersonIcon" class="size-[44px] rounded-[44px]" />
      <div
        class="flex-1 flex h-[50px] justify-between items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[4px] px-[12px] cursor-pointer"
        @click="openCommentPopup"
      >
        <div class="text-[12px] text-[var(--color-text-level-2)]">Leave your Comment</div>
        <img alt="" :src="EmoIcon" class="size-[18px]" />
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
            <img alt="" :src="comment.avatarUrl" class="size-[26px] rounded-[26px]" />
            <div class="text-[var(--color-text-level-2)]">{{ comment.memberName }}</div>
            <div class="text-[var(--color-text-level-3)]">{{ comment.timeText }}</div>
          </div>
          <div class="flex items-center gap-[10px]">
            <div class="relative">
              <img
                alt=""
                :src="CommentIcon"
                class="size-[16px] cursor-pointer"
                @click="openReplyCommentPopup(comment)"
              />
              <div
                v-if="comment.replyCount > 0"
                class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
              >
                {{ comment.replyCount }}
              </div>
            </div>
            <div class="relative">
              <img alt="" :src="ZanIcon" class="size-[16px]" />
              <div
                v-if="comment.likeCount > 0"
                class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
              >
                {{ comment.likeCount }}
              </div>
            </div>
            <div class="relative">
              <img alt="" :src="UnzanIcon" class="size-[16px]" />
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
        <div v-if="comment.children.length > 0" class="mt-[10px] ml-[20px]">
          <div
            v-for="child in comment.children"
            :key="child.id"
            class="border-t border-[var(--color-opacity-10)] pt-[12px] pb-[8px]"
          >
            <div class="flex justify-between">
              <div class="flex text-[12px] items-center gap-[8px]">
                <img alt="" :src="child.avatarUrl" class="size-[26px] rounded-[26px]" />
                <div class="text-[var(--color-text-level-2)]">{{ child.memberName }}</div>
                <div class="text-[var(--color-text-level-3)]">{{ child.timeText }}</div>
              </div>
              <div class="flex items-center gap-[10px]">
                <div class="relative">
                  <img alt="" :src="ZanIcon" class="size-[16px]" />
                  <div
                    v-if="child.likeCount > 0"
                    class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
                  >
                    {{ child.likeCount }}
                  </div>
                </div>
                <div class="relative">
                  <img alt="" :src="UnzanIcon" class="size-[16px]" />
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
      </div>
    </template>
    <div
      v-else-if="!isCommentLoading"
      class="flex items-center justify-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[18px] px-[12px] text-[12px] text-[var(--color-text-level-3)]"
    >
      No comments yet.
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
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { useGameRating } from '@/composables/useGameRating'
import Star from './star.vue'
import ProgressBar from './progress.vue'
import CommentPopup from './comment-popup.vue'
import PersonIcon from '@/static/svg/game/detail/comment/person.svg?url'
import SanIcon from '@/static/svg/game/detail/comment/san.svg?url'
import EmoIcon from '@/static/svg/game/detail/comment/emo.svg?url'
import CommentIcon from '@/static/svg/game/detail/comment/comment.svg?url'
import ZanIcon from '@/static/svg/game/detail/comment/zan.svg?url'
import UnzanIcon from '@/static/svg/game/detail/comment/unzan.svg?url'

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
  const parsed = Number(currentGameDetail.value?.initScoreStar)
  if (parsed === 1) return 4.0
  if (parsed === 2) return 4.5
  if (parsed === 3) return 5.0
  return 3.0
})

const scoreText = computed(() => scoreValue.value.toFixed(1))
const activeStarCount = computed(() => Math.max(0, Math.min(5, Math.round(scoreValue.value))))

const handleRateChange = (value: number) => {
  setRating(value)
}

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

type ReviewCommentViewItem = {
  id: string
  memberName: string
  content: string
  timeText: string
  avatarUrl: string
  likeCount: number
  dislikeCount: number
  replyCount: number
  createTime: number
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
  fallbackPrefix = 'comment'
): ReviewCommentViewItem => {
  const createTime = toSafeNumber(item?.createTime)
  const memberName = normalizeQueryValue(item?.memberName ?? item?.memberId) || 'Anonymous'

  return {
    id: normalizeQueryValue(item?.id ?? item?.rowId) || `${fallbackPrefix}-${index}`,
    memberName,
    content: normalizeQueryValue(item?.content),
    timeText: formatElapsedTime(createTime),
    avatarUrl: resolveCommentAvatar(item?.memberAvatar),
    likeCount: Math.max(0, Math.trunc(toSafeNumber(item?.likeCount))),
    dislikeCount: Math.max(0, Math.trunc(toSafeNumber(item?.dislikeCount))),
    replyCount: Math.max(0, Math.trunc(toSafeNumber(item?.replyCount))),
    createTime,
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
    return source.sort((a, b) => b.replyCount - a.replyCount || b.createTime - a.createTime)
  }

  if (activeSort.value === 'likes') {
    return source.sort((a, b) => b.likeCount - a.likeCount || b.createTime - a.createTime)
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
    const res = await Api.game.getCommentsList({
      subjectId,
      current: 1,
      size: 100,
      root: '0',
      parent: '0',
      memberRowId: validMemberRowId
    })
    const rootComments = parseCommentRecords(res?.result).map((item, index) =>
      mapCommentItem(item, index, 'root-comment')
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
          const childrenRes = await Api.game.getCommentsList({
            subjectId,
            current: 1,
            size: 100,
            parent: parentId,
            root: null,
            memberRowId: validMemberRowId
          })
          item.children = parseCommentRecords(childrenRes?.result).map((childItem, childIndex) =>
            mapCommentItem(childItem, childIndex, `${parentId}-child`)
          )
        } catch (error) {
          console.error('get child comments failed', error)
          item.children = []
        }
      })
    )
    console.log(commentList, 'commentList....')
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
    const res = await Api.game.getCommentSubject({
      gameId,
      memberRowId: memberRowId || undefined
    })
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
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'comments', label: 'Top Comments' },
  { value: 'likes', label: 'Top Likes' }
]

const commentInputPlaceholder = computed(() => {
  const memberName = normalizeQueryValue(replyTargetComment.value?.memberName)
  if (!memberName) {
    return 'Leave your Comment'
  }
  return `Reply to ${memberName}`
})

const toggleSortPopup = () => {
  isSortPopupOpen.value = !isSortPopupOpen.value
}

const selectSort = (value: string) => {
  activeSort.value = value
  isSortPopupOpen.value = false
}

const openCommentPopup = () => {
  replyTargetComment.value = null
  isCommentPopupOpen.value = true
}

const openReplyCommentPopup = (comment: ReviewCommentViewItem) => {
  replyTargetComment.value = comment
  isCommentPopupOpen.value = true
}

const submitComment = async (content: string) => {
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
    await Api.game.publishComment({
      subjectId,
      memberId,
      memberRowId: Math.trunc(memberRowIdNumber),
      content: commentContent,
      root: isReplyComment ? '1' : '0',
      parent: isReplyComment ? replyParentId : '0',
      replyIndex: ''
    })
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
  document.addEventListener('click', handleClickOutside)
})

watch(
  currentGameId,
  () => {
    void requestCommentSubject()
  },
  { immediate: true }
)

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
