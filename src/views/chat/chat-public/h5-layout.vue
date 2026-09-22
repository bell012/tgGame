<template>
  <!-- H5 客服页面根容器。 -->
  <div
    class="chat-public-h5 fixed inset-x-0 top-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    :class="activeConversation ? 'bottom-0 z-[60]' : 'bottom-[60px] z-20'"
  >
    <!-- 未选择会话时的客服列表页面。 -->
    <template v-if="!activeConversation">
      <!-- 客服列表头部。 -->
      <header class="flex h-[49px] shrink-0 items-center bg-bg-2 px-[10px]">
        <button
          type="button"
          class="flex size-[33px] items-center justify-center rounded-[8px] bg-opacity-6"
          @click="handleListBack"
        >
          <ArrowLeftIcon class="size-[14px] text-text-1" />
        </button>
        <h1 class="min-w-0 flex-1 text-center text-[16px] font-bold leading-[19px] text-text-1">
          {{ t('chatPublic.customerServiceList') }}
        </h1>
        <span class="size-[33px] shrink-0" />
      </header>
      <ConversationList :conversations="conversations" @select="handleConversationSelect" />
    </template>

    <!-- 已选择会话时的对话内容层。 -->
    <div v-else class="fixed inset-0 z-[60] bg-bg-1">
      <!-- 当前客服的会话内容。 -->
      <ConversationView
        ref="conversationViewRef"
        :conversation="activeConversation"
        :messages="messages"
        :mode="mode"
        :draft="draft"
        :reply-target="replyTarget"
        @back="handleConversationBack"
        @search="searchVisible = true"
        @reply="startReply"
        @issue="handleIssueSelect"
        @update:draft="setDraft"
        @send="handleSend"
        @emoji="toggleEmoji"
        @media="toggleMedia"
        @cancel-reply="cancelReply"
        @emoji-select="handleEmojiSelect"
        @emoji-delete="handleEmojiDelete"
        @photo="openImageComposer"
        @camera="openImageComposer"
        @view-image="openImageViewer"
      />

      <!-- 会话页内触发的快捷问题弹层。 -->
      <QuickIssueSheet
        :visible="quickIssueVisible"
        :active-issue="activeIssue"
        @close="quickIssueVisible = false"
        @send="handleQuickIssueSend"
      />
    </div>

    <!-- 消息搜索覆盖层。 -->
    <ChatSearchOverlay
      v-if="searchVisible"
      @close="searchVisible = false"
      @locate="handleSearchLocate"
    />
    <!-- 图片预览覆盖层。 -->
    <ChatImagePreview
      v-if="previewImage"
      :src="previewImage"
      :mode="previewMode"
      @close="closeImagePreview"
      @send="handleImagePreviewSend"
    />
  </div>
</template>

<script setup lang="ts">
import mockImageUrl from '@/static/img/chat/public/chat-image-sample.jpg'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ChatImagePreview from './components/chat-image-preview.vue'
import ChatSearchOverlay from './components/chat-search-overlay.vue'
import ConversationList from './components/conversation-list.vue'
import ConversationView from './components/conversation-view.vue'
import QuickIssueSheet from './components/quick-issue-sheet.vue'
import { useChatComposer } from './composables/use-chat-composer'
import { useConversationList } from './composables/use-conversation-list'
import { useMessageList } from './composables/use-message-list'
import { useSendMessage } from './composables/use-send-message'
import type { ChatMessage, ConversationItem, QuickIssue } from './types'

const { t } = useI18n()
const router = useRouter()

const { conversations } = useConversationList()
const { messages } = useMessageList()
const { sendText, sendImage } = useSendMessage(messages)
const {
  draft,
  mode,
  replyTarget,
  setDraft,
  toggleEmoji,
  toggleMedia,
  startReply,
  cancelReply,
  resetAfterSend
} = useChatComposer()

const activeConversation = ref<ConversationItem | null>(null)
const quickIssueVisible = ref(false)
const activeIssue = ref<QuickIssue | null>(null)
const searchVisible = ref(false)
const previewImage = ref('')
const previewMode = ref<'compose' | 'viewer'>('compose')
const conversationViewRef = ref<InstanceType<typeof ConversationView> | null>(null)

/** 在消息新增或切换会话后，将消息区域滚动到最底部。 */
const scrollToBottom = () => {
  nextTick(() => conversationViewRef.value?.scrollToBottom())
}

/** 从客服列表返回上一个页面。 */
const handleListBack = () => {
  router.back()
}

/** 选择客服会话，并显示该客服的静态消息记录。 */
const handleConversationSelect = (conversation: ConversationItem) => {
  activeConversation.value = conversation
  scrollToBottom()
}

/** 退出当前会话，清理仅属于会话页的临时交互状态。 */
const handleConversationBack = () => {
  activeConversation.value = null
  quickIssueVisible.value = false
  activeIssue.value = null
  resetAfterSend()
}

/** 打开图片发送前的本地静态预览。 */
const openImageComposer = () => {
  previewMode.value = 'compose'
  previewImage.value = mockImageUrl
}

/** 查看会话中的图片消息。 */
const openImageViewer = (message: ChatMessage) => {
  if (!message.image) return
  previewMode.value = 'viewer'
  previewImage.value = message.image
}

/** 关闭图片预览并恢复当前会话。 */
const closeImagePreview = () => {
  previewImage.value = ''
  mode.value = 'idle'
}

/** 确认图片预览后，将本地示例图片追加到消息列表。 */
const handleImagePreviewSend = () => {
  if (!previewImage.value) return
  sendImage(previewImage.value)
  closeImagePreview()
  scrollToBottom()
}

/** 从搜索结果返回会话并定位到当前消息区域。 */
const handleSearchLocate = () => {
  searchVisible.value = false
  scrollToBottom()
}

/** 打开所选快捷问题的固定问答弹层。 */
const handleIssueSelect = (issue: QuickIssue) => {
  activeIssue.value = issue
  quickIssueVisible.value = true
}

/** 将快捷问题的静态文案追加为一条用户消息。 */
const handleQuickIssueSend = (text: string) => {
  if (!text) return
  sendText(text)
  quickIssueVisible.value = false
  activeIssue.value = null
  scrollToBottom()
}

/** 发送输入框草稿，并在发送后重置编辑器状态。 */
const handleSend = () => {
  if (!draft.value.trim()) return
  sendText(draft.value, replyTarget.value)
  resetAfterSend()
  scrollToBottom()
}

/** 将选中的表情追加到当前输入草稿中。 */
const handleEmojiSelect = (emoji: string) => {
  setDraft(`${draft.value}${emoji}`)
  mode.value = 'emoji'
}

/** 按 Unicode 字符删除草稿末尾的一个表情或文字。 */
const handleEmojiDelete = () => {
  setDraft(Array.from(draft.value).slice(0, -1).join(''))
  mode.value = 'emoji'
}
</script>

<style scoped>
:global(body:has(.chat-public-h5) .bottom-tab-bar) {
  background: var(--color-background-level-2);
}

:global(body:has(.chat-public-h5) .bottom-tab-bar .tab-item) {
  color: var(--color-text-level-2);
}

:global(body:has(.chat-public-h5) .bottom-tab-bar .tab-item.active) {
  color: var(--color-theme-level-1);
}

:global(body:has(.chat-public-h5) .bottom-tab-bar .tab-item .text-text-2) {
  color: var(--color-text-level-2);
}

:global(body:has(.chat-public-h5) .bottom-tab-bar .tab-item .text-theme-primary) {
  color: var(--color-theme-level-1);
}
</style>
