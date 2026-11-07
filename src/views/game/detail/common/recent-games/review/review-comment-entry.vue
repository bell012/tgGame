<template>
  <div class="flex items-center gap-[10px] mt-[10px]">
    <img v-if="showAvatar" alt="" :src="avatarUrl" class="review-entry-avatar" />
    <div
      class="review-comment-entry-box flex-1 flex justify-between items-center rounded-[7px] px-[12px] cursor-pointer"
      @click="emit('open')"
    >
      <div class="review-comment-entry-placeholder text-[var(--color-text-level-2)]">
        {{ placeholderText }}
      </div>
      <EmoIcon class="review-emoji-icon size-[18px]" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/game/detail/styles/colors.css'
import EmoIcon from '@/static/svg/game/detail/comment/emo.svg?component'

defineProps<{
  avatarUrl: string
  placeholderText: string
  showAvatar?: boolean
}>()

const emit = defineEmits<{
  open: []
}>()
</script>

<style scoped lang="scss">
.review-comment-entry-box {
  background: var(--color-recent-games-panel);
  height: 40px;
}

.review-comment-entry-placeholder {
  font-size: 12px;
  line-height: 16px;
}

.review-entry-avatar {
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 50px;
  object-fit: cover;
}

@media (min-width: 1024px) {
  .review-comment-entry-box {
    height: 44px;
  }

  .review-comment-entry-placeholder {
    font-size: 13px;
    line-height: 18px;
  }

  .review-entry-avatar {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: 44px;
  }
}

.review-emoji-icon {
  color: var(--color-recent-games-emoji);
}

.review-emoji-icon :deep(path) {
  fill: currentColor;
}
</style>
