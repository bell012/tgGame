<template>
  <div class="flex items-center gap-[10px] mt-[10px]">
    <img v-if="showAvatar" alt="" :src="avatarUrl" class="size-[44px] rounded-[44px]" />
    <div
      class="flex-1 flex h-[50px] justify-between items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[4px] px-[12px] cursor-pointer"
      @click="emit('open')"
    >
      <div class="text-[12px] text-[var(--color-text-level-2)]">
        {{ placeholderText }}
      </div>
      <SmartImage alt="" :src="EmoIcon" class="size-[18px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SmartImage from '@/components/common/SmartImage.vue'
import EmoIcon from '@/static/svg/game/detail/comment/emo.svg?url'

defineProps<{
  avatarUrl: string
  placeholderText: string
  showAvatar?: boolean
}>()

const emit = defineEmits<{
  open: []
}>()
</script>
