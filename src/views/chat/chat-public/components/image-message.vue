<template>
  <!-- 图片消息气泡。 -->
  <div
    class="flex w-full"
    :class="message.direction === 'outgoing' ? 'justify-end' : 'justify-start'"
  >
    <button
      type="button"
      class="relative overflow-hidden"
      :class="props.displayMode === 'pc' ? 'rounded-[18px]' : 'rounded-[10px]'"
      @click="$emit('view', message)"
    >
      <img
        :src="message.image"
        alt=""
        class="object-cover"
        :class="props.displayMode === 'pc' ? 'size-[180px]' : 'size-[188px]'"
      />
      <!-- 图片消息的时间与已读状态。 -->
      <div
        class="absolute flex items-center gap-[4px] rounded-full bg-mask-40 text-common-100"
        :class="
          props.displayMode === 'pc'
            ? 'bottom-[6px] right-[6px] px-[4px] py-[2px] text-[12px] leading-[15px]'
            : 'bottom-[7px] right-[7px] px-[7px] py-[3px] text-[10px]'
        "
      >
        <span>{{ message.time }}</span>
        <span v-if="message.period">{{ message.period }}</span>
        <img
          v-if="message.read"
          :src="messageReadStatusImage"
          alt=""
          class="h-[10px] w-[15px] object-contain"
        />
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
defineEmits<{ view: [message: ChatMessage] }>()
</script>
