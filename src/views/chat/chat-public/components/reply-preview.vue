<template>
  <!-- 输入框上方的引用回复预览。 -->
  <div class="flex items-center gap-[8px] border-t border-opacity-10 bg-bg-2 px-[10px] py-[7px]">
    <!-- 被引用消息摘要。 -->
    <div class="min-w-0 flex-1 border-l-[4px] border-theme-primary pl-[8px]">
      <p class="text-[12px] font-medium text-theme-primary">
        {{ t('chatPublic.replyTo', { name: target.author }) }}
      </p>
      <div class="mt-[2px] flex items-center gap-[6px] text-[11px] text-text-2">
        <span v-if="target.photoCount" class="shrink-0">{{ t('chatPublic.onePhoto') }}</span>
        <span class="truncate">{{ target.preview }}</span>
      </div>
    </div>
    <button
      type="button"
      class="flex size-[24px] items-center justify-center"
      @click="$emit('close')"
    >
      <CloseIcon class="size-[12px]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/chat/public/reply-close.svg?component'
import { useI18n } from 'vue-i18n'
import type { ChatReplyTarget } from '../types'

const { t } = useI18n()

defineProps<{ target: ChatReplyTarget }>()
defineEmits<{ close: [] }>()
</script>
