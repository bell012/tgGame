<template>
  <div>
    <div
      v-if="isCommentLoading && !sortedCommentList.length"
      class="flex items-center justify-center gap-[8px] bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[18px] px-[12px]"
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
      class="flex items-center justify-center gap-[8px] bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[10px] py-[10px] px-[12px]"
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
        <div class="flex justify-between">
          <div class="flex text-[12px] items-center gap-[8px]">
            <SmartImage
              alt=""
              :src="comment.avatarUrl"
              class="size-[26px] rounded-[26px]"
              @error="emit('avatar-error', comment)"
            />
            <div class="text-[var(--color-text-level-2)]">{{ comment.memberName }}</div>
            <div class="text-[var(--color-text-level-3)]">{{ comment.timeText }}</div>
          </div>
          <div class="flex items-center gap-[10px]">
            <div>
              <SmartImage
                alt=""
                :src="CommentIcon"
                class="size-[16px] cursor-pointer"
                @click="emit('reply-click', comment)"
              />
            </div>
            <div class="relative">
              <SmartImage
                alt=""
                :src="ZanIcon"
                class="size-[16px] cursor-pointer transition duration-200"
                :class="{ 'comment-like-icon-active': comment.isLiked }"
                @click="emit('toggle-like', comment)"
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
                @click="emit('toggle-dislike', comment)"
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
                  <SmartImage
                    alt=""
                    :src="child.avatarUrl"
                    class="size-[26px] rounded-[26px]"
                    @error="emit('avatar-error', child)"
                  />
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
                      @click="emit('toggle-like', child)"
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
                      @click="emit('toggle-dislike', child)"
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
            @click="emit('toggle-children', comment)"
          >
            {{ comment.isChildrenExpanded ? collapseText : expandText }}
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
      {{ noCommentsText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import SmartImage from '@/components/common/SmartImage.vue'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?url'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?url'
import CommentIcon from '@/static/svg/game/detail/comment/comment.svg?url'
import UnzanIcon from '@/static/svg/game/detail/comment/unzan.svg?url'
import ZanIcon from '@/static/svg/game/detail/comment/zan.svg?url'
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
</script>

<style scoped>
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
