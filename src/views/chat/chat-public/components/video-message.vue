<template>
  <!-- 视频消息气泡。 -->
  <div
    class="flex w-full"
    :class="props.message.direction === 'outgoing' ? 'justify-end' : 'justify-start'"
  >
    <div class="relative">
      <div
        class="relative overflow-hidden bg-common-0"
        :class="
          props.displayMode === 'pc'
            ? 'h-[180px] w-[220px] rounded-[18px]'
            : 'h-[188px] w-[220px] rounded-[10px]'
        "
      >
        <!-- 点击视频区域后打开项目内的视频预览页。 -->
        <video
          :src="props.message.video"
          playsinline
          preload="metadata"
          aria-label="Play video"
          class="h-full w-full bg-common-0 object-contain"
          @click="$emit('view', props.message)"
        />

        <!-- 视频消息中央的全屏播放提示图标，不拦截视频本身的点击事件。 -->
        <VideoPlayPauseIcon
          aria-hidden="true"
          class="pointer-events-none absolute left-1/2 top-1/2 size-[36px] -translate-x-1/2 -translate-y-1/2"
        />

        <!-- 视频消息的时间与已读状态。 -->
        <div
          class="absolute flex items-center gap-[4px] rounded-full bg-mask-40 text-common-100"
          :class="
            props.displayMode === 'pc'
              ? 'bottom-[6px] right-[6px] px-[4px] py-[2px] text-[12px] leading-[15px]'
              : 'bottom-[7px] right-[7px] px-[7px] py-[3px] text-[10px]'
          "
        >
          <span>{{ props.message.time }}</span>
          <span v-if="props.message.period">{{ props.message.period }}</span>
          <img
            v-if="props.message.direction === 'outgoing'"
            :src="
              props.message.status === 'sent' ? messageReadStatusImage : messageSendingStatusImage
            "
            alt=""
            class="h-[10px] w-[15px] object-contain"
          />
        </div>
      </div>

      <!-- 视频发送失败时显示在消息左侧中部的重发按钮。 -->
      <button
        v-if="props.message.direction === 'outgoing' && props.message.status === 'failed'"
        type="button"
        class="absolute -left-[20px] top-1/2 flex size-[12px] -translate-y-1/2 items-center justify-center"
        aria-label="Retry"
        @click="$emit('retry', props.message)"
      >
        <img :src="messageRetryIcon" alt="" class="size-[12px] object-contain" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import messageReadStatusImage from '@/static/img/chat/public/message-read-status.png'
import messageRetryIcon from '@/static/img/chat/public/message-retry.png'
import messageSendingStatusImage from '@/static/img/chat/public/message-sending-status.png'
import VideoPlayPauseIcon from '@/static/svg/chat/public/video-play-pause.svg?component'
import type { ChatMessage } from '../types'

const props = withDefaults(defineProps<{ message: ChatMessage; displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})

defineEmits<{ retry: [message: ChatMessage]; view: [message: ChatMessage] }>()
</script>
