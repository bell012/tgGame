<template>
  <!-- 文本或引用消息气泡。 -->
  <div
    class="group flex w-full"
    :class="message.direction === 'outgoing' ? 'justify-end' : 'justify-start'"
  >
    <button
      type="button"
      class="max-w-[82%] text-left"
      :class="message.direction === 'outgoing' ? 'items-end' : 'items-start'"
      @click="$emit('focus', message)"
      @contextmenu.prevent="$emit('focus', message)"
    >
      <!-- 被引用消息的简要预览。 -->
      <div
        v-if="message.reply"
        class="mb-[4px] min-w-[190px] rounded-[4px] border-l-[4px] border-theme-primary bg-bg-2 px-[10px] py-[6px]"
      >
        <p class="text-[11px] font-medium text-theme-primary">{{ message.reply.author }}</p>
        <p class="mt-[2px] truncate text-[11px] text-text-2">{{ message.reply.preview }}</p>
      </div>

      <!-- 当前消息内容与发送时间。 -->
      <div
        class="relative"
        :class="[
          props.displayMode === 'pc'
            ? 'rounded-[10px] px-[10px] py-[6px]'
            : 'rounded-[6px] px-[11px] py-[7px]',
          message.direction === 'outgoing' ? 'bg-bg-2' : 'bg-bg-3'
        ]"
      >
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
            props.displayMode === 'pc' ? 'text-[14px] leading-[17px]' : 'text-[15px] leading-[20px]'
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
  </div>
</template>

<script setup lang="ts">
import messageReadStatusImage from '@/static/img/chat/public/message-read-status.png'
import type { ChatMessage } from '../types'

const props = withDefaults(defineProps<{ message: ChatMessage; displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})
defineEmits<{ focus: [message: ChatMessage] }>()
</script>
