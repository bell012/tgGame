<template>
  <!-- 可滚动的会话消息历史。 -->
  <div
    ref="scrollRef"
    data-chat-message-list
    class="min-h-0 flex-1 overflow-y-auto"
    :class="props.displayMode === 'pc' ? 'px-[12px] py-[12px]' : 'px-[14px] py-[14px]'"
    @scroll="handleScroll"
  >
    <!-- 从本地缓存读取更早历史时显示的轻量加载提示。 -->
    <p v-if="props.loadingOlderMessages" class="py-[6px] text-center text-[12px] text-text-3">
      {{ t('common.loading') }}
    </p>

    <!-- 消息气泡列表。 -->
    <div class="flex flex-col gap-[10px] pb-2">
      <template v-for="message in messages" :key="message.id">
        <div
          :data-chat-message-id="message.id"
          :class="
            message.id === props.highlightMessageId
              ? '  -my-[6px] py-[6px] -mx-[7px] bg-opacity-6 px-[7px]'
              : ''
          "
        >
          <RedPacketMessage
            v-if="message.type === 'red-pack'"
            :claimed="props.claimedRedPacketIds.includes(String(message.redPacket?.id ?? ''))"
            :display-mode="props.displayMode"
            :loading="props.redPacketClaimingMessageIds.includes(message.id)"
            :message="message"
            @claim="$emit('claim-red-packet', $event)"
            @view-claimed="$emit('view-claimed-red-packet', $event)"
          />
          <RedPacketSystemMessage
            v-else-if="message.type === 'system' && message.system?.type === 'red-packet-claimed'"
            :service-name="message.system.serviceName"
          />
          <ImageMessage
            v-else-if="message.type === 'image'"
            :display-mode="props.displayMode"
            :message="message"
            @focus="handleFocus"
            @retry="$emit('retry', $event)"
            @view="$emit('view-image', $event)"
          />
          <VideoMessage
            v-else-if="message.type === 'video'"
            :display-mode="props.displayMode"
            :message="message"
            @focus="handleFocus"
            @retry="$emit('retry', $event)"
            @view="$emit('view-video', $event)"
          />
          <!-- 回复消息 -->
          <MessageBubble
            v-else-if="
              message.type !== 'auto-reply' ||
              Boolean(message.text) ||
              (!message.imageList?.length && !message.autoReplyType?.includes('video'))
            "
            :display-mode="props.displayMode"
            :highlight-keyword="
              message.id === props.highlightMessageId ? props.highlightKeyword : ''
            "
            :message="message"
            @focus="handleFocus"
            @retry="$emit('retry', $event)"
          />
        </div>
      </template>
    </div>

    <!-- 消息聚焦后的回复操作浮层。 -->
    <div
      v-if="focusedMessage"
      ref="replyActionRef"
      class="fixed z-[75] h-[43.72px] w-[54.33px] -translate-x-1/2"
      :style="actionStyle"
    >
      <!-- SVG 画板预留了边距；按 1/3 缩放后与浮层实际可视区域对齐。 -->
      <component
        :is="theme === 'dark' ? ReplyDarkIcon : ReplyLightIcon"
        aria-hidden="true"
        class="pointer-events-none absolute -left-[13.33px] -top-[12px] h-[70.67px] w-[81px] max-w-none"
      />
      <button
        type="button"
        class="absolute left-0 top-0 z-10 flex h-[36px] w-full items-center justify-center"
        @click="handleReplyClick"
      >
        <span class="text-[13px] font-[400] leading-[15.67px] text-text-1">
          {{ t('chatPublic.reply') }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ReplyDarkIcon from '@/static/svg/chat/public/reply-dark.svg?component'
import ReplyLightIcon from '@/static/svg/chat/public/reply-light.svg?component'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getMessagePreview } from '../shared'
import type { ChatMessage, ChatReplyTarget } from '../types'
import ImageMessage from './image-message.vue'
import MessageBubble from './message-bubble.vue'
import RedPacketMessage from './red-packet-message.vue'
import RedPacketSystemMessage from './red-packet-system-message.vue'
import VideoMessage from './video-message.vue'

const props = withDefaults(
  defineProps<{
    messages: ChatMessage[]
    redPacketClaimingMessageIds?: string[]
    claimedRedPacketIds?: string[]
    hasMoreCachedMessages?: boolean
    loadingOlderMessages?: boolean
    displayMode?: 'h5' | 'pc'
    highlightMessageId?: string
    highlightKeyword?: string
  }>(),
  {
    redPacketClaimingMessageIds: () => [],
    claimedRedPacketIds: () => [],
    hasMoreCachedMessages: false,
    loadingOlderMessages: false,
    displayMode: 'h5',
    highlightMessageId: '',
    highlightKeyword: ''
  }
)
const emit = defineEmits<{
  reply: [target: ChatReplyTarget]
  'view-image': [message: ChatMessage]
  'view-video': [message: ChatMessage]
  'claim-red-packet': [message: ChatMessage]
  'view-claimed-red-packet': [message: ChatMessage]
  'load-older': []
  retry: [message: ChatMessage]
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)

const scrollRef = ref<HTMLElement | null>(null)
const replyActionRef = ref<HTMLElement | null>(null)
const focusedMessage = ref<ChatMessage | null>(null)
const focusedMessageElement = ref<HTMLElement | null>(null)
const actionStyle = ref({ left: '50%', top: '36%' })
let shouldIgnoreNextFocus = false
let requestedOlderMessages = false
let previousScrollHeight = 0
let previousScrollTop = 0

/** 关闭当前回复操作浮层，并清理选中消息的定位信息。 */
const dismissReplyAction = () => {
  focusedMessage.value = null
  focusedMessageElement.value = null
}

/** 滚动到消息列表顶部时请求下一页本地历史，同时保存当前位置用于插入后的高度补偿。 */
const handleScroll = () => {
  dismissReplyAction()

  const container = scrollRef.value
  if (
    !container ||
    container.scrollTop > 24 ||
    !props.hasMoreCachedMessages ||
    props.loadingOlderMessages ||
    requestedOlderMessages
  ) {
    return
  }

  requestedOlderMessages = true
  previousScrollHeight = container.scrollHeight
  previousScrollTop = container.scrollTop
  emit('load-older')
}

/** 将指定消息滚动到可视区域中央，供搜索结果点击后定位使用。 */
const scrollToMessage = async (messageId: string) => {
  await nextTick()
  const target = Array.from(
    scrollRef.value?.querySelectorAll<HTMLElement>('[data-chat-message-id]') ?? []
  ).find(element => element.dataset.chatMessageId === messageId)
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
  const replyToType =
    message.type === 'image' ? 'image' : message.type === 'video' ? 'video' : 'text'
  emit('reply', {
    id: message.id,
    author:
      message.authorName ||
      (message.direction === 'outgoing' ? t('chatPublic.you') : t('chatPublic.customerService')),
    preview:
      replyToType === 'image'
        ? t('chatPublic.image')
        : replyToType === 'video'
          ? t('chatPublic.video')
          : getMessagePreview(message),
    photoCount: message.type === 'image' ? 1 : undefined,
    mediaUrl:
      message.type === 'image'
        ? message.image || message.imageList?.[0]?.imgUrl
        : message.type === 'video'
          ? message.video
          : undefined,
    replyToUserId: message.authorId || '',
    replyToUserName:
      message.authorName ||
      (message.direction === 'outgoing' ? t('chatPublic.you') : t('chatPublic.customerService')),
    replyToType
  })
  dismissReplyAction()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown, true)
})

/** 本地旧记录插入顶部后补偿滚动高度，保持用户正在查看的消息位置不变。 */
watch(
  () => props.loadingOlderMessages,
  async loading => {
    if (loading || !requestedOlderMessages) return

    await nextTick()
    if (scrollRef.value) {
      scrollRef.value.scrollTop =
        previousScrollTop + scrollRef.value.scrollHeight - previousScrollHeight
    }
    requestedOlderMessages = false
    previousScrollHeight = 0
    previousScrollTop = 0
  }
)

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
})

defineExpose({
  /** 供父组件在新增消息或切换会话后调用，确保最新消息可见。 */
  scrollToBottom: () => {
    nextTick(() => {
      if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    })
  },
  /** 供搜索结果点击后调用，滚动到对应的历史消息。 */
  scrollToMessage
})
</script>
