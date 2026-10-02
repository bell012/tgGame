<template>
  <!-- 输入框上方的引用回复预览。 -->
  <div class="flex items-center gap-[8px] border-t border-opacity-10 bg-bg-2 px-[10px] py-[7px]">
    <!-- 被引用消息摘要。 -->
    <div
      class="min-w-0 flex flex-1 items-center gap-[8px] border-l-[4px] border-theme-primary pl-[8px]"
    >
      <!-- 图片或视频引用在摘要右侧展示 35px 缩略图。 -->
      <img
        v-if="replyMediaType === 'image'"
        :src="target.mediaUrl"
        alt=""
        class="h-[35px] w-[35px] shrink-0 rounded-[3px] object-cover"
      />
      <video
        v-else-if="replyMediaType === 'video'"
        :src="target.mediaUrl"
        aria-hidden="true"
        muted
        playsinline
        preload="auto"
        class="h-[35px] w-[35px] shrink-0 rounded-[3px] bg-common-0 object-cover"
      ></video>
      <div class="min-w-0 flex-1">
        <p class="text-[12px] font-medium text-theme-primary">
          {{ t('chatPublic.replyTo', { name: target.author }) }}
        </p>
        <div class="mt-[2px] flex items-center gap-[6px] text-[11px] text-text-2">
          <span v-if="target.photoCount" class="shrink-0">{{ t('chatPublic.onePhoto') }}</span>
          <span class="truncate">{{ target.preview }}</span>
        </div>
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatReplyTarget } from '../types'

const { t } = useI18n()

const props = defineProps<{ target: ChatReplyTarget }>()
defineEmits<{ close: [] }>()

/** 只有媒体地址存在时才渲染缩略图，旧引用记录继续使用文字摘要。 */
const replyMediaType = computed(() => {
  const { mediaUrl, replyToType } = props.target
  return mediaUrl && (replyToType === 'image' || replyToType === 'video') ? replyToType : null
})
</script>
