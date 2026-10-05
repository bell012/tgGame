<template>
  <!-- 文本或引用消息气泡。 -->
  <div
    class="group flex w-full"
    :class="message.direction === 'outgoing' ? 'justify-end' : 'justify-start'"
  >
    <div class="relative max-w-[82%]">
      <button
        type="button"
        data-chat-message-bubble
        class="text-left"
        :class="message.direction === 'outgoing' ? 'items-end' : 'items-start'"
        @click="handleFocus"
        @contextmenu.prevent="handleFocus"
      >
        <!-- 当前消息气泡，内部同时承载引用摘要、回复内容与发送时间。 -->
        <div
          class="relative"
          :class="[
            props.displayMode === 'pc'
              ? 'rounded-[10px] px-[10px] py-[6px]'
              : 'rounded-[6px] px-[11px] py-[7px]',
            'bg-bg-3'
          ]"
        >
          <!-- 被引用消息的简要预览。 -->
          <div
            v-if="message.reply"
            class="mb-[6px] flex min-w-[190px] items-center gap-[8px] rounded-[4px] border-l-[4px] border-theme-primary bg-bg-2 px-[8px] py-[2px]"
          >
            <!-- 图片或视频引用在摘要右侧展示 35px 缩略图。 -->
            <img
              v-if="replyMediaType === 'image'"
              :src="message.reply.mediaUrl"
              alt=""
              class="h-[35px] w-[35px] shrink-0 rounded-[3px] object-cover"
            />
            <video
              v-else-if="replyMediaType === 'video'"
              :src="message.reply.mediaUrl"
              aria-hidden="true"
              muted
              playsinline
              preload="metadata"
              class="h-[35px] w-[35px] shrink-0 rounded-[3px] bg-common-0 object-cover"
            ></video>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-medium text-theme-primary">{{ message.reply.author }}</p>
              <p class="mt-[2px] truncate text-[11px] text-text-2">
                <template v-for="(part, index) in replyHighlightParts" :key="index">
                  <span :class="part.matched ? 'text-theme-primary' : ''">{{ part.text }}</span>
                </template>
              </p>
            </div>
          </div>

          <!-- 当前回复消息内容。 -->
          <i
            aria-hidden="true"
            class="absolute top-[10px] size-0 border-y-[5px] border-y-transparent"
            :class="
              message.direction === 'outgoing'
                ? '-right-[6px] border-l-[7px] border-l-bg-2'
                : '-left-[6px] border-r-[7px] border-r-bg-3'
            "
          />
          <p
            class="whitespace-pre-wrap break-words text-text-1"
            :class="
              props.displayMode === 'pc'
                ? 'text-[14px] leading-[17px]'
                : 'text-[15px] leading-[20px]'
            "
          >
            <template v-for="(part, index) in messageHighlightParts" :key="index">
              <span :class="part.matched ? 'text-theme-primary' : ''">{{ part.text }}</span>
            </template>
          </p>
          <div
            class="flex items-center justify-end gap-[4px] text-text-3"
            :class="
              props.displayMode === 'pc'
                ? 'mt-[4px] text-[12px] leading-[15px]'
                : 'mt-[1px] text-[10px] leading-[12px]'
            "
          >
            <span>{{ message.time }}</span>
            <span v-if="message.period">{{ message.period }}</span>
            <img
              v-if="message.direction === 'outgoing'"
              :src="message.status === 'sent' ? messageReadStatusImage : messageSendingStatusImage"
              alt=""
              class="h-[10px] w-[15px] object-contain"
            />
          </div>
        </div>
      </button>

      <!-- 发送失败时显示在消息左侧中部的重发按钮。 -->
      <button
        v-if="message.direction === 'outgoing' && message.status === 'failed'"
        type="button"
        class="absolute -left-[40px] top-1/2 flex size-[26px] -translate-y-1/2 items-center justify-center"
        :aria-label="t('chatPublic.retry')"
        @click.stop="$emit('retry', message)"
      >
        <img :src="messageRetryIcon" alt="" class="size-[26px] object-contain" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import messageReadStatusImage from '@/static/img/chat/public/message-read-status.png'
import messageRetryIcon from '@/static/img/chat/public/message-retry.png'
import messageSendingStatusImage from '@/static/img/chat/public/message-sending-status.png'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getChatTextHighlightParts } from '../shared'
import type { ChatMessage } from '../types'

const props = withDefaults(
  defineProps<{ message: ChatMessage; displayMode?: 'h5' | 'pc'; highlightKeyword?: string }>(),
  {
    displayMode: 'h5',
    highlightKeyword: ''
  }
)
const emit = defineEmits<{
  focus: [message: ChatMessage, event: MouseEvent, target: HTMLElement | null]
  retry: [message: ChatMessage]
}>()
const { t } = useI18n()

/** 生成当前消息正文的关键词高亮片段。 */
const messageHighlightParts = computed(() =>
  getChatTextHighlightParts(props.message.text, props.highlightKeyword)
)

/** 生成引用摘要的关键词高亮片段。 */
const replyHighlightParts = computed(() =>
  getChatTextHighlightParts(props.message.reply?.preview, props.highlightKeyword)
)

/** 只有媒体地址存在时才渲染缩略图，旧引用记录继续使用文字摘要。 */
const replyMediaType = computed(() => {
  const reply = props.message.reply
  return reply?.mediaUrl && (reply.replyToType === 'image' || reply.replyToType === 'video')
    ? reply.replyToType
    : null
})

/** 将当前消息气泡的原生交互事件上抛，用于定位回复操作浮层。 */
const handleFocus = (event: MouseEvent) => {
  emit('focus', props.message, event, event.currentTarget as HTMLElement | null)
}
</script>
