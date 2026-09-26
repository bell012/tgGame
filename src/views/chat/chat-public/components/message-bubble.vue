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
            class="mb-[6px] min-w-[190px] rounded-[4px] border-l-[4px] border-theme-primary px-[8px] py-[2px] bg-bg-2"
          >
            <p class="text-[11px] font-medium text-theme-primary">{{ message.reply.author }}</p>
            <p class="mt-[2px] truncate text-[11px] text-text-2">{{ message.reply.preview }}</p>
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
            {{ message.text }}
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
              v-if="message.direction === 'outgoing' && message.read"
              :src="messageReadStatusImage"
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
        aria-label="Retry"
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
import type { ChatMessage } from '../types'

const props = withDefaults(defineProps<{ message: ChatMessage; displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})
const emit = defineEmits<{
  focus: [message: ChatMessage, event: MouseEvent, target: HTMLElement | null]
  retry: [message: ChatMessage]
}>()

/** 将当前消息气泡的原生交互事件上抛，用于定位回复操作浮层。 */
const handleFocus = (event: MouseEvent) => {
  emit('focus', props.message, event, event.currentTarget as HTMLElement | null)
}
</script>
