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
        <star :count="5" class="flex justify-center mt-[4px]"></star>
      </div>
      <div
        class="flex-1 flex flex-col justify-center items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[12px]"
      >
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">
          {{ ratingCount }} Ratings
        </div>
        <div class="flex justify-center items-center mt-[4px]">
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
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

    <div
      class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[12px] px-[12px]"
    >
      <div class="flex justify-between">
        <div class="flex text-[12px] items-center gap-[8px]">
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <div class="text-[var(--color-text-level-2)]">Bcangcut</div>
          <div class="text-[var(--color-text-level-3)]">245d</div>
        </div>
        <div class="flex items-center gap-[10px]">
          <div>
            <img alt="" :src="CommentIcon" class="size-[16px] cursor-pointer" />
          </div>
          <div class="relative">
            <img alt="" :src="ZanIcon" class="size-[16px]" />
            <div
              class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
            >
              8
            </div>
          </div>
          <div>
            <img alt="" :src="UnzanIcon" class="size-[16px]" />
          </div>
        </div>
      </div>
      <div class="text-[var(--color-text-level-2)] text-[12px] mt-[10px]">
        Well, I played it and actually won. Lucky me.
      </div>
    </div>
    <div
      class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[12px] px-[12px]"
    >
      <div class="flex justify-between">
        <div class="flex text-[12px] items-center gap-[8px]">
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <div class="text-[var(--color-text-level-2)]">Bcangcut</div>
          <div class="text-[var(--color-text-level-3)]">245d</div>
        </div>
        <div class="flex items-center gap-[10px]">
          <div>
            <img alt="" :src="CommentIcon" class="size-[16px] cursor-pointer" />
          </div>
          <div class="relative">
            <img alt="" :src="ZanIcon" class="size-[16px]" />
            <div
              class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
            >
              8
            </div>
          </div>
          <div>
            <img alt="" :src="UnzanIcon" class="size-[16px]" />
          </div>
        </div>
      </div>
      <div class="text-[var(--color-text-level-2)] text-[12px] mt-[10px]">
        Well, I played it and actually won. Lucky me.
      </div>
    </div>
    <div
      class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[12px] px-[12px]"
    >
      <div class="flex justify-between">
        <div class="flex text-[12px] items-center gap-[8px]">
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <div class="text-[var(--color-text-level-2)]">Bcangcut</div>
          <div class="text-[var(--color-text-level-3)]">245d</div>
        </div>
        <div class="flex items-center gap-[10px]">
          <div>
            <img alt="" :src="CommentIcon" class="size-[16px] cursor-pointer" />
          </div>
          <div class="relative">
            <img alt="" :src="ZanIcon" class="size-[16px]" />
            <div
              class="absolute text-[12px] text-[var(--color-text-level-4)] bg-[var(--color-theme-level-1)] top-[-120%] left-[50%] py-[0px] px-[10px] rounded-md"
            >
              8
            </div>
          </div>
          <div>
            <img alt="" :src="UnzanIcon" class="size-[16px]" />
          </div>
        </div>
      </div>
      <div class="text-[var(--color-text-level-2)] text-[12px] mt-[10px]">
        Well, I played it and actually won. Lucky me.
      </div>
    </div>
    <CommentPopup v-model="isCommentPopupOpen" @submit="submitComment" />
  </div>
</template>
<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, type ComputedRef } from 'vue'
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

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const ratingCount = computed(() => {
  const parsed = Number(currentGameDetail.value?.initScoreNum)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 11
  }
  return Math.trunc(parsed)
})

const scoreValue = computed(() => {
  const parsed = Number(currentGameDetail.value?.initScoreStar)
  if (parsed === 1) return 4.0
  if (parsed === 2) return 4.5
  if (parsed === 3) return 5.0
  return 3.0
})

const scoreText = computed(() => scoreValue.value.toFixed(1))
const activeStarCount = computed(() => Math.max(0, Math.min(5, Math.round(scoreValue.value))))
/**
 * 
 /gc/queryGameDetails?rowId={rowId}  游戏详情 Get请求
  初始评分数量
  final int? initScoreNum;
  /// 初始评分星级 1:4星 2:4.5星 3:5星
  final int? initScoreStar;
  /// 在线人数最大值
  final int? onlineNumMax;
  /// 在线人数最小值
  final int? onlineNumMin;
  -------
  /// 获取评论的主题
  @POST('/comment/sub/getCommentSubject') // gameId 和 memberRowId
  /// 游戏ID
  final int gameId;
  /// 会员ID
  final String? memberRowId;
  ---------
  /// 获取评论列表
  @POST('/comment/sub/getCommentsList')
/// 评论主表 ID
  final String? subjectId;
  /// 页码
  final int? current;
  /// 每页数量
  final int? pageSize;
  /// 会员 ID
  final int? memberRowId;
  -----
  /// 评论根节点 0.根评论. 楼层
  // final String? root;
  //展开评论的时候 root传null parent 传父元素的id
  /// 父级别 ID，
  // final String? parent;
 */
const sortMenuRef = ref<HTMLElement | null>(null)
const isSortPopupOpen = ref(false)
const activeSort = ref('newest')
const isCommentPopupOpen = ref(false)
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'comments', label: 'Top Comments' },
  { value: 'likes', label: 'Top Likes' }
]

const toggleSortPopup = () => {
  isSortPopupOpen.value = !isSortPopupOpen.value
}

const selectSort = (value: string) => {
  activeSort.value = value
  isSortPopupOpen.value = false
}

const openCommentPopup = () => {
  isCommentPopupOpen.value = true
}

const submitComment = (content: string) => {
  console.log(content)
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
