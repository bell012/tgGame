<template>
  <!-- 单个客服会话完整页面。 -->
  <div
    class="flex h-full min-h-0 flex-col overflow-hidden"
    :class="props.displayMode === 'pc' ? 'bg-bg-5' : 'bg-bg-1'"
  >
    <!-- 会话头部信息。 -->
    <ChatHeader
      :display-mode="props.displayMode"
      :conversation="conversation"
      :typing="typing"
      @back="$emit('back')"
      @search="$emit('search')"
    />

    <!-- 消息历史列表。 -->
    <MessageList
      ref="messageListRef"
      :display-mode="props.displayMode"
      :messages="messages"
      :claimed-red-packet-ids="claimedRedPacketIds"
      :has-more-cached-messages="hasMoreCachedMessages"
      :loading-older-messages="loadingOlderMessages"
      :red-packet-claiming-message-ids="redPacketClaimingMessageIds"
      @claim-red-packet="$emit('claim-red-packet', $event)"
      @load-older="$emit('load-older')"
      @reply="$emit('reply', $event)"
      @retry="$emit('retry', $event)"
      @view-image="$emit('view-image', $event)"
      @view-video="$emit('view-video', $event)"
    />

    <!-- 快捷问题入口。 -->
    <QuickIssueBar
      :display-mode="props.displayMode"
      :issues="issues"
      @select="$emit('issue', $event)"
    />

    <!-- 文本输入与媒体操作区域。 -->
    <ChatComposer
      :display-mode="props.displayMode"
      :model-value="draft"
      :reply-target="replyTarget"
      @update:model-value="$emit('update:draft', $event)"
      @send="$emit('send')"
      @emoji="$emit('emoji')"
      @media="$emit('media')"
      @cancel-reply="$emit('cancel-reply')"
    />

    <!-- 表情面板。 -->
    <EmojiPanel
      v-if="mode === 'emoji'"
      @select="$emit('emoji-select', $event)"
      @delete="$emit('emoji-delete')"
      @send="$emit('send')"
    />
    <!-- 图片选择面板。 -->
    <ImagePickerPanel
      v-else-if="mode === 'media'"
      @photo="$emit('photo', $event)"
      @camera="$emit('camera', $event)"
    />

    <!-- 图片或视频上传期间覆盖当前会话，并在屏幕中线展示 Loading。 -->
    <div
      v-if="props.uploadingMedia"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-mask-60-1"
      role="status"
      aria-live="polite"
    >
      <span
        aria-label="Loading"
        class="size-[36px] animate-spin rounded-full border-[3px] border-common-100/25 border-t-theme-primary"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  ChatComposerMode,
  ChatMessage,
  ChatReplyTarget,
  ConversationItem,
  QuickIssue
} from '../types'
import ChatComposer from './chat-composer.vue'
import ChatHeader from './chat-header.vue'
import EmojiPanel from './emoji-panel.vue'
import ImagePickerPanel from './image-picker-panel.vue'
import MessageList from './message-list.vue'
import QuickIssueBar from './quick-issue-bar.vue'

const props = withDefaults(
  defineProps<{
    conversation: ConversationItem
    messages: ChatMessage[]
    mode: ChatComposerMode
    draft: string
    replyTarget: ChatReplyTarget | null
    issues: QuickIssue[]
    redPacketClaimingMessageIds?: string[]
    claimedRedPacketIds?: string[]
    hasMoreCachedMessages?: boolean
    loadingOlderMessages?: boolean
    uploadingMedia?: boolean
    typing?: boolean
    displayMode?: 'h5' | 'pc'
  }>(),
  {
    displayMode: 'h5',
    redPacketClaimingMessageIds: () => [],
    claimedRedPacketIds: () => [],
    hasMoreCachedMessages: false,
    loadingOlderMessages: false,
    uploadingMedia: false
  }
)

defineEmits<{
  back: []
  search: []
  reply: [target: ChatReplyTarget]
  'claim-red-packet': [message: ChatMessage]
  'load-older': []
  retry: [message: ChatMessage]
  issue: [issue: QuickIssue]
  'update:draft': [value: string]
  send: []
  emoji: []
  media: []
  'cancel-reply': []
  'emoji-select': [emoji: string]
  'emoji-delete': []
  photo: [files: File[]]
  camera: [files: File[]]
  'view-image': [message: ChatMessage]
  'view-video': [message: ChatMessage]
}>()

const messageListRef = ref<InstanceType<typeof MessageList> | null>(null)

defineExpose({
  /** 向父级暴露消息区滚动能力，避免父级直接依赖内部 DOM。 */
  scrollToBottom: () => messageListRef.value?.scrollToBottom(),
  /** 向父级暴露指定消息滚动能力，供搜索定位结果使用。 */
  scrollToMessage: (messageId: string) => messageListRef.value?.scrollToMessage(messageId)
})
</script>
