<template>
  <!-- 可滚动的会话消息历史。 -->
  <div
    ref="scrollRef"
    data-chat-message-list
    class="min-h-0 flex-1 overflow-y-auto"
    :class="props.displayMode === 'pc' ? 'px-[12px] py-[12px]' : 'px-[14px] py-[14px]'"
    @scroll="dismissReplyAction"
  >
    <!-- 消息气泡列表。 -->
    <div class="flex flex-col gap-[10px] pb-2">
      <template v-for="message in messages" :key="message.id">
        <ImageMessage
          v-if="message.type === 'image'"
          :display-mode="props.displayMode"
          :message="message"
          @focus="handleFocus"
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
      ref="replyActionRef"
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
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
const replyActionRef = ref<HTMLElement | null>(null)
const focusedMessage = ref<ChatMessage | null>(null)
const focusedMessageElement = ref<HTMLElement | null>(null)
const actionStyle = ref({ left: '50%', top: '36%' })
let shouldIgnoreNextFocus = false

/** 关闭当前回复操作浮层，并清理选中消息的定位信息。 */
const dismissReplyAction = () => {
  focusedMessage.value = null
  focusedMessageElement.value = null
}

/** 点击当前浮层和所选消息以外的区域时，关闭回复操作浮层。 */
const handleDocumentPointerDown = (event: PointerEvent) => {
  if (!focusedMessage.value) return

  const target = event.target as Node | null
  const isActionClick = Boolean(target && replyActionRef.value?.contains(target))
  const isSelectedMessageClick = Boolean(target && focusedMessageElement.value?.contains(target))
  if (isActionClick || isSelectedMessageClick) return

  // 点击另一条消息时仅关闭当前操作，避免同一次点击立即打开新的回复浮层。
  shouldIgnoreNextFocus =
    target instanceof Element && Boolean(target.closest('[data-chat-message-bubble]'))
  dismissReplyAction()
}

/** 将回复操作浮层定位在所选消息气泡正上方，并避免超出视口。 */
const handleFocus = async (
  message: ChatMessage,
  event: MouseEvent,
  messageElement: HTMLElement | null
) => {
  if (shouldIgnoreNextFocus) {
    shouldIgnoreNextFocus = false
    return
  }

  focusedMessage.value = message
  focusedMessageElement.value = messageElement
  await nextTick()

  const target = messageElement || (event.currentTarget as HTMLElement | null)
  if (!target) return

  const targetRect = target.getBoundingClientRect()
  const actionWidth = replyActionRef.value?.offsetWidth || 80
  const actionHeight = replyActionRef.value?.offsetHeight || 40
  const viewportPadding = 8
  const targetCenter = targetRect.left + targetRect.width / 2
  const left = Math.min(
    Math.max(targetCenter, actionWidth / 2 + viewportPadding),
    window.innerWidth - actionWidth / 2 - viewportPadding
  )
  const top = Math.max(viewportPadding, targetRect.top - actionHeight - viewportPadding)

  actionStyle.value = {
    left: `${left}px`,
    top: `${top}px`
  }
}

/** 将当前聚焦消息转换为引用回复目标，并关闭操作浮层。 */
const handleReplyClick = () => {
  if (!focusedMessage.value) return

  const message = focusedMessage.value
  emit('reply', {
    id: message.id,
    author: message.authorName || (message.direction === 'outgoing' ? 'You' : 'Customer Service'),
    preview: message.type === 'image' ? '图片' : getMessagePreview(message),
    photoCount: message.type === 'image' ? 1 : undefined,
    replyToUserId: message.authorId || '',
    replyToUserName:
      message.authorName || (message.direction === 'outgoing' ? 'You' : 'Customer Service'),
    replyToType: message.type === 'image' ? 'image' : 'text'
  })
  dismissReplyAction()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
})

defineExpose({
  /** 供父组件在新增消息或切换会话后调用，确保最新消息可见。 */
  scrollToBottom: () => {
    nextTick(() => {
      if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    })
  }
})
</script>
