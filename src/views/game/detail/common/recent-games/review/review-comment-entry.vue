<template>
  <div class="flex items-center gap-[10px] mt-[10px]">
    <img v-if="showAvatar" alt="" :src="avatarUrl" class="review-entry-avatar" />
    <div
      class="review-comment-entry-box flex-1 flex h-[40px] justify-between items-center rounded-[7px] px-[12px] cursor-pointer"
      @click="emit('open')"
    >
      <div class="text-[12px] text-[var(--color-text-level-2)]">
        {{ placeholderText }}
      </div>
      <EmoIcon class="review-emoji-icon size-[18px]" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
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
  background: #202424;
}

.review-entry-avatar {
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 50px;
  object-fit: cover;
}

.review-emoji-icon {
  color: #b3bec1;
}

.review-emoji-icon :deep(path) {
  fill: currentColor;
}

:global(:root.light .review-comment-entry-box) {
  background: #f4f4f4;
}

:global(:root.light .review-emoji-icon) {
  color: #6f7f80;
}
</style>
