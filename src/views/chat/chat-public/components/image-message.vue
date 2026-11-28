<template>
  <!-- 图片消息气泡。 -->
  <div
    class="flex w-full"
    :class="message.direction === 'outgoing' ? 'justify-end' : 'justify-start'"
  >
    <div class="relative flex max-w-full flex-col gap-[6px]">
      <button
        v-for="(url, index) in imageUrls"
        :key="`${url}-${index}`"
        type="button"
        data-chat-message-bubble
        class="relative overflow-hidden"
        :class="props.displayMode === 'pc' ? 'rounded-[18px]' : 'rounded-[10px]'"
        @click="handleClick"
        @contextmenu.prevent="handleReply"
        @pointerdown="startLongPress"
        @pointerleave="clearLongPress"
        @pointerup="clearLongPress"
        @pointercancel="clearLongPress"
      >
        <img
          :src="url"
          alt=""
          class="block h-auto w-auto object-contain"
          :class="
            props.displayMode === 'pc'
              ? 'max-h-[360px] max-w-[249px]'
              : 'max-h-[420px] max-w-[240px]'
          "
        />
        <!-- 图片消息的时间与已读状态，只放在最后一张上。 -->
        <div
          v-if="props.showTime && index === imageUrls.length - 1"
          class="absolute flex items-center gap-[4px] rounded-full text-common-100"
          :class="
            props.displayMode === 'pc'
              ? 'bottom-[6px] right-[6px] bg-mask-20 px-[4px] py-[2px] text-[12px] leading-[15px]'
              : 'bottom-[7px] right-[7px] bg-mask-40 px-[7px] py-[3px] text-[10px]'
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
      </button>

      <!-- 图片发送失败时显示在消息左侧中部的重发按钮。 -->
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
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatMessage } from '../types'

const props = withDefaults(
  defineProps<{ message: ChatMessage; displayMode?: 'h5' | 'pc'; showTime?: boolean }>(),
  {
    displayMode: 'h5',
    showTime: true
  }
)
const { t } = useI18n()
const emit = defineEmits<{
  view: [message: ChatMessage]
  focus: [message: ChatMessage, event: MouseEvent, target: HTMLElement | null]
  retry: [message: ChatMessage]
}>()

/** 同一条消息里的全部图片；群发可能在 imageList 中带多张。 */
const imageUrls = computed(() => {
  const urls = (props.message.imageList ?? []).map(image => image.imgUrl).filter(Boolean)
  if (props.message.image && !urls.includes(props.message.image)) {
    urls.unshift(props.message.image)
  }
  return urls
})

const longPressTriggered = ref(false)
let longPressTimer: ReturnType<typeof setTimeout> | undefined

/** 清理图片长按计时器，防止短按也被识别为回复操作。 */
const clearLongPress = () => {
  if (!longPressTimer) return
  clearTimeout(longPressTimer)
  longPressTimer = undefined
}

/** 长按图片消息时打开引用回复操作，短按仍保持图片预览。 */
const startLongPress = (event: PointerEvent) => {
  longPressTriggered.value = false
  clearLongPress()
  const target = event.currentTarget as HTMLElement | null
  longPressTimer = setTimeout(() => {
    longPressTimer = undefined
    longPressTriggered.value = true
    emit('focus', props.message, event, target)
  }, 450)
}

/** 处理图片短按预览，避免长按后额外打开图片查看器。 */
const handleClick = () => {
  if (longPressTriggered.value) {
    longPressTriggered.value = false
    return
  }
  emit('view', props.message)
}

/** 处理桌面端图片右键引用回复。 */
const handleReply = (event: MouseEvent) => {
  clearLongPress()
  emit('focus', props.message, event, event.currentTarget as HTMLElement | null)
}

onBeforeUnmount(clearLongPress)
</script>
