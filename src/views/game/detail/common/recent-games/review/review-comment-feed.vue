<template>
  <div>
    <div
      v-if="isCommentLoading && !sortedCommentList.length"
      class="review-comment-state flex h-[40px] items-center justify-center gap-[8px] rounded-[7px] mb-[10px] mt-[10px] px-[12px]"
    >
      <div
        class="size-[16px] rounded-full border-[2px] border-[var(--color-text-level-3)] border-t-transparent animate-spin"
      ></div>
      <div class="text-[12px] text-[var(--color-text-level-3)]">
        {{ loadingCommentsText }}
      </div>
    </div>

    <div
      v-else-if="isCommentLoading"
      class="review-comment-state flex h-[40px] items-center justify-center gap-[8px] rounded-[7px] mb-[10px] mt-[10px] px-[12px]"
    >
      <div
        class="size-[14px] rounded-full border-[2px] border-[var(--color-text-level-3)] border-t-transparent animate-spin"
      ></div>
      <div class="text-[12px] text-[var(--color-text-level-3)]">
        {{ refreshingCommentsText }}
      </div>
    </div>

    <template v-if="sortedCommentList.length">
      <div
        v-for="comment in sortedCommentList"
        :key="comment.id"
        class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[12px] px-[12px]"
      >
        <div class="review-comment-main-row flex h-[36px] items-center justify-between">
          <div class="flex items-center gap-[8px] text-[11px] font-[500]">
            <SmartImage
              alt=""
              :src="comment.avatarUrl"
              class="review-comment-avatar"
              @error="emit('avatar-error', comment)"
            />
            <div class="text-[var(--color-text-level-2)] review-comment-meta-name">
              {{ comment.memberName }}
            </div>
            <div class="text-[var(--color-text-level-3)] review-comment-meta-time">
              {{ comment.timeText }}
            </div>
          </div>
          <div class="review-comment-actions">
            <div>
              <CommentIcon
                class="review-comment-action-icon cursor-pointer"
                @click="emit('reply-click', comment)"
              />
            </div>
            <div class="relative">
              <ZanIcon
                class="review-comment-action-icon review-comment-like-icon cursor-pointer transition duration-200"
                :class="{ 'comment-like-icon-active': comment.isLiked }"
                @click="emit('toggle-like', comment)"
              />
              <div
                v-if="comment.likeCount > 0"
                class="review-comment-count-badge absolute top-[-68%] left-[100%]"
              >
                {{ comment.likeCount }}
              </div>
            </div>
            <div class="relative">
              <UnzanIcon
                class="review-comment-action-icon review-comment-like-icon cursor-pointer transition duration-200"
                :class="{ 'comment-like-icon-active': comment.isDisliked }"
                @click="emit('toggle-dislike', comment)"
              />
              <div
                v-if="comment.dislikeCount > 0"
                class="review-comment-count-badge absolute top-[-68%] left-[100%]"
              >
                {{ comment.dislikeCount }}
              </div>
            </div>
          </div>
        </div>
        <div
          class="review-comment-content text-[var(--color-text-level-2)] text-[11px] mt-[8px] leading-[16px]"
        >
          {{ comment.content }}
        </div>
        <transition name="child-comments-collapse">
          <div
            v-if="comment.children.length > 0 && comment.isChildrenExpanded"
            class="mt-[10px] pl-[20px] border-t border-[var(--color-opacity-10)]"
          >
            <div v-for="child in comment.children" :key="child.id" class="pt-[12px] pb-[8px]">
              <div class="review-comment-main-row flex h-[36px] items-center justify-between">
                <div class="flex items-center gap-[8px] text-[11px] font-[500]">
                  <SmartImage
                    alt=""
                    :src="child.avatarUrl"
                    class="review-comment-avatar"
                    @error="emit('avatar-error', child)"
                  />
                  <div class="text-[var(--color-text-level-2)] review-comment-meta-name">
                    {{ child.memberName }}
                  </div>
                  <div class="text-[var(--color-text-level-3)] review-comment-meta-time">
                    {{ child.timeText }}
                  </div>
                </div>
                <div class="review-comment-actions review-comment-actions-child">
                  <div class="relative">
                    <ZanIcon
                      class="review-comment-action-icon review-comment-like-icon cursor-pointer transition duration-200"
                      :class="{ 'comment-like-icon-active': child.isLiked }"
                      @click="emit('toggle-like', child)"
                    />
                    <div
                      v-if="child.likeCount > 0"
                      class="review-comment-count-badge absolute top-[-68%] left-[100%]"
                    >
                      {{ child.likeCount }}
                    </div>
                  </div>
                  <div class="relative">
                    <UnzanIcon
                      class="review-comment-action-icon review-comment-like-icon cursor-pointer transition duration-200"
                      :class="{ 'comment-like-icon-active': child.isDisliked }"
                      @click="emit('toggle-dislike', child)"
                    />
                    <div
                      v-if="child.dislikeCount > 0"
                      class="review-comment-count-badge absolute top-[-68%] left-[100%]"
                    >
                      {{ child.dislikeCount }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="review-comment-content text-[var(--color-text-level-2)] text-[11px] mt-[8px] leading-[16px]"
              >
                {{ child.content }}
              </div>
            </div>
          </div>
        </transition>
        <div v-if="comment.children.length > 0" class="mt-[4px] flex items-center justify-start">
          <button
            type="button"
            class="inline-flex items-center gap-[4px] text-[var(--color-theme-level-1)] text-[12px] leading-[18px] font-[600] transition-opacity duration-200 hover:opacity-80"
            @click="emit('toggle-children', comment)"
          >
            {{ comment.isChildrenExpanded ? collapseText : getReplySummaryText(comment) }}
            <SmartImage
              alt=""
              :src="comment.isChildrenExpanded ? ExpandUpDoubleIcon : ExpandDownDoubleIcon"
              class="w-[8px] h-[7px] opacity-85"
            />
          </button>
        </div>
      </div>
    </template>

    <div
      v-else-if="!isCommentLoading"
      class="review-comment-state flex h-[40px] items-center justify-center rounded-[7px] mb-[10px] mt-[10px] px-[12px] text-[12px] text-[var(--color-text-level-3)]"
    >
      {{ noCommentsText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import SmartImage from '@/components/common/SmartImage.vue'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?url'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?url'
import CommentIcon from '@/static/svg/game/detail/comment/comment.svg?component'
import UnzanIcon from '@/static/svg/game/detail/comment/unzan.svg?component'
import ZanIcon from '@/static/svg/game/detail/comment/zan.svg?component'
import type { ReviewCommentViewItem } from './review-types'

defineProps<{
  sortedCommentList: ReviewCommentViewItem[]
  isCommentLoading: boolean
  loadingCommentsText: string
  refreshingCommentsText: string
  noCommentsText: string
  collapseText: string
  expandText: string
}>()

const emit = defineEmits<{
  'reply-click': [comment: ReviewCommentViewItem]
  'toggle-like': [comment: ReviewCommentViewItem]
  'toggle-dislike': [comment: ReviewCommentViewItem]
  'toggle-children': [comment: ReviewCommentViewItem]
  'avatar-error': [comment: ReviewCommentViewItem]
}>()

const getReplySummaryText = (comment: ReviewCommentViewItem) => {
  const count = Math.max(0, Number(comment.replyCount || comment.children.length || 0))
  const replyLabel = count === 1 ? 'Reply' : 'Replies'
  return `${count} ${replyLabel}`
}
</script>

<style scoped>
.review-comment-state {
  background: #202424;
}

:global(:root.light .review-comment-state) {
  background: #f4f4f4;
}

.review-comment-avatar {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 999px;
}

.review-comment-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.review-comment-actions-child {
  margin-right: 2px;
}

.review-comment-meta-name {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
}

.review-comment-meta-time {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  opacity: 0.9;
}

.review-comment-content {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
}

.review-comment-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 12px;
  min-width: 14px;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--color-theme-level-1);
  color: var(--color-text-level-4);
  font-size: 8px;
  line-height: 1;
  font-weight: 700;
  transform: translate(-50%, 0);
}

.review-comment-action-icon {
  width: 18px;
  height: 18px;
  min-width: 18px;
}

.review-comment-like-icon {
  color: var(--color-icon-level-2);
}

.review-comment-like-icon :deep(path) {
  fill: currentColor;
}

.comment-like-icon-active {
  color: var(--color-theme-level-1);
}

.review-comment-action-icon :deep(path) {
  fill: var(--color-icon-level-2);
}

.comment-like-icon-active :deep(path) {
  fill: currentColor;
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
