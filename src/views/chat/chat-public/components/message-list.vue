<template>
  <!-- 可滚动的会话消息历史。 -->
  <div
    ref="scrollRef"
    data-chat-message-list
    class="min-h-0 flex-1 overflow-y-auto"
    :class="props.displayMode === 'pc' ? 'px-[12px] py-[12px]' : 'px-[14px] py-[14px]'"
  >
    <!-- 消息气泡列表。 -->
    <div class="flex flex-col gap-[10px] pb-2">
      <template v-for="message in messages" :key="message.id">
        <ImageMessage
          v-if="message.type === 'image'"
          :display-mode="props.displayMode"
          :message="message"
          @view="$emit('view-image', $event)"
        />
        <MessageBubble
          v-else
          :display-mode="props.displayMode"
          :message="message"
          @focus="handleFocus"
        />
      </template>
    </div>

    <!-- 消息聚焦后的回复操作浮层。 -->
    <div
      v-if="focusedMessage"
      class="fixed z-[75] -translate-x-1/2 rounded-[8px] bg-bg-2 px-[18px] py-[10px] shadow-xl"
      :style="actionStyle"
    >
      <button type="button" class="text-[13px] text-text-1" @click="handleReplyClick">
        {{ t('chatPublic.reply') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getMessagePreview } from '../shared'
import type { ChatMessage, ChatReplyTarget } from '../types'
import ImageMessage from './image-message.vue'
import MessageBubble from './message-bubble.vue'

const props = withDefaults(defineProps<{ messages: ChatMessage[]; displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})
const emit = defineEmits<{
  reply: [target: ChatReplyTarget]
  'view-image': [message: ChatMessage]
}>()

const { t } = useI18n()

const scrollRef = ref<HTMLElement | null>(null)
const focusedMessage = ref<ChatMessage | null>(null)
const actionStyle = ref({ left: '50%', top: '36%' })

/** 长按或聚焦消息后，按消息方向显示对应位置的回复操作浮层。 */
const handleFocus = async (message: ChatMessage) => {
  focusedMessage.value = message
  await nextTick()
  actionStyle.value = {
    left: message.direction === 'outgoing' ? '68%' : '35%',
    top: '36%'
  }
}

/** 将当前聚焦消息转换为引用回复目标，并关闭操作浮层。 */
const handleReplyClick = () => {
  if (!focusedMessage.value) return

  const message = focusedMessage.value
  emit('reply', {
    id: message.id,
    author: message.direction === 'outgoing' ? 'Sky' : 'AK',
    preview: getMessagePreview(message),
    photoCount: message.type === 'image' ? 1 : undefined
  })
  focusedMessage.value = null
}

defineExpose({
  /** 供父组件在新增消息或切换会话后调用，确保最新消息可见。 */
  scrollToBottom: () => {
    nextTick(() => {
      if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    })
  }
})
</script>
