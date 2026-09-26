<template>
  <!-- PC 客服右侧独立面板。 -->
  <aside class="chat-public-pc relative flex h-full w-full overflow-hidden bg-bg-5 font-inter">
    <!-- 未选择客服时的会话列表。 -->
    <section v-if="!activeConversation" class="flex min-h-0 w-full flex-col bg-bg-5">
      <!-- PC 会话列表头部。 -->
      <header class="flex h-[58px] shrink-0 items-center bg-bg-2 px-[12px]">
        <span class="size-[30px] shrink-0" />
        <h1 class="min-w-0 flex-1 text-center text-[16px] font-bold leading-[19px] text-text-1">
          {{ t('chatPublic.customerServiceList') }}
        </h1>
        <button
          type="button"
          class="flex size-[30px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
          :aria-label="t('chatPublic.close')"
          @click="handleClose"
        >
          <CloseIcon class="size-[15px] text-text-1" />
        </button>
      </header>
      <ConversationList
        display-mode="pc"
        :conversations="conversations"
        :loading="loadingConversations"
        @select="handleConversationSelect"
      />
    </section>
    <!-- 已选择客服时的会话内容。 -->

    <ConversationView
      v-if="activeConversation"
      class="w-full"
      display-mode="pc"
      :conversation="activeConversation"
      :messages="messages"
      :issues="quickIssues"
      :claimed-red-packet-ids="claimedRedPacketIds"
      :has-more-cached-messages="hasMoreCachedMessages"
      :loading-older-messages="loadingOlderMessages"
      :red-packet-claiming-message-ids="redPacketClaimingMessageIds"
      :uploading-media="uploadingImage"
      :mode="mode"
      :draft="draft"
      :reply-target="replyTarget"
      @back="handleConversationBack"
      @reply="startReply"
      @claim-red-packet="handleRedPacketClaim"
      @load-older="handleLoadOlderMessages"
      @issue="handleIssueSelect"
      @retry="handleRetryMessage"
      @update:draft="setDraft"
      @send="handleSend"
      @emoji="toggleEmoji"
      @media="toggleMedia"
      @cancel-reply="cancelReply"
      @emoji-select="handleEmojiSelect"
      @emoji-delete="handleEmojiDelete"
      @photo="openMediaPreview"
      @camera="openMediaPreview"
      @view-image="openImageViewer"
    />

    <!-- PC 端批量媒体发送预览。 -->
    <ChatImagePreview
      v-if="pcPreviewImage || pendingMediaFiles.length"
      :src="pcPreviewImage"
      :media-files="pendingMediaFiles"
      :mode="pcPreviewImage ? 'viewer' : 'compose'"
      display-mode="pc"
      @close="closeMediaPreview"
      @remove="removePendingMedia"
      @send="sendPendingMedia"
    />

    <!-- PC 端红包领取成功提示。 -->
    <RedPacketSuccessPopup
      v-if="redPacketSuccessAmount !== null"
      display-mode="pc"
      :amount="redPacketSuccessAmount"
      @close="closeRedPacketSuccess"
    />

    <!-- PC 快捷问题弹层。 -->
    <QuickIssueSheet
      display-mode="pc"
      :visible="quickIssueVisible"
      :active-issue="activeIssue"
      :items="autoReplyItems"
      :loading="loadingAutoReplies"
      @close="quickIssueVisible = false"
      @send="handleQuickIssueSend"
    />
  </aside>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import type { AutoReplyItem } from '@/api/interface/chat'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ChatImagePreview from './components/chat-image-preview.vue'
import ConversationList from './components/conversation-list.vue'
import ConversationView from './components/conversation-view.vue'
import QuickIssueSheet from './components/quick-issue-sheet.vue'
import RedPacketSuccessPopup from './components/red-packet-success-popup.vue'
import { useChatComposer } from './composables/use-chat-composer'
import { useChatRuntime } from './composables/use-chat-runtime'
import type { ChatMessage, ConversationItem, QuickIssue } from './types'

const { t } = useI18n()
const router = useRouter()
const {
  conversations,
  messages,
  quickIssues,
  autoReplyItems,
  activeConversation,
  loadingConversations,
  loadingAutoReplies,
  uploadingImage,
  redPacketClaimingMessageIds,
  claimedRedPacketIds,
  redPacketSuccessAmount,
  hasMoreCachedMessages,
  loadingOlderMessages,
  initialize,
  selectConversation,
  leaveConversation,
  loadOlderMessages,
  loadAutoReplies,
  sendTextMessage,
  retryMessage,
  claimRedPacket,
  closeRedPacketSuccess,
  sendAutoReplyMessage,
  sendMediaFile
} = useChatRuntime()
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

const quickIssueVisible = ref(false)
const activeIssue = ref<QuickIssue | null>(null)
const pendingMediaFiles = ref<File[]>([])
const pcPreviewImage = ref('')

/** 选择 PC 客服后读取缓存并建立当前客服的 Socket 连接。 */
const handleConversationSelect = async (conversation: ConversationItem) => {
  await selectConversation(conversation)
  nextTick(() => scrollToBottom())
}

/** 从对话返回客服会话列表，并清理会话内的临时状态。 */
const handleConversationBack = async () => {
  await leaveConversation()
  quickIssueVisible.value = false
  activeIssue.value = null
  resetAfterSend()
}

/** 用户上滑至消息列表顶部时，读取当前会话更早的一页本地缓存记录。 */
const handleLoadOlderMessages = () => {
  void loadOlderMessages()
}

/** 领取当前点击的客服红包，并在接口成功后显示领取结果。 */
const handleRedPacketClaim = (message: ChatMessage) => {
  void claimRedPacket(message)
}

/** 重新发送当前会话中连接失败的消息。 */
const handleRetryMessage = (message: ChatMessage) => {
  retryMessage(message)
}

/** 关闭 PC 聊天侧边抽屉并返回进入聊天前的页面。 */
const handleClose = () => {
  if (router.options.history.state.back) {
    router.back()
    return
  }

  void router.replace('/')
}

/** 在消息变更后将 PC 消息区域滚动至底部。 */
const scrollToBottom = () => {
  nextTick(() => {
    document
      .querySelector<HTMLElement>('.chat-public-pc [data-chat-message-list]')
      ?.scrollTo({ top: 999999 })
  })
}

/** 打开 PC 端所选自动回复分类并请求其问题列表。 */
const handleIssueSelect = async (issue: QuickIssue) => {
  activeIssue.value = issue
  quickIssueVisible.value = true
  await loadAutoReplies(issue)
}

/** 发送 PC 自动回复请求，并等待服务端推送对应回答。 */
const handleQuickIssueSend = (item: AutoReplyItem) => {
  if (sendAutoReplyMessage(item)) {
    quickIssueVisible.value = false
    activeIssue.value = null
  }
  scrollToBottom()
}

/** 发送当前输入草稿，并恢复编辑器初始状态。 */
const handleSend = () => {
  if (!draft.value.trim()) return
  sendTextMessage(draft.value, replyTarget.value)
  resetAfterSend()
  scrollToBottom()
}

/** 将选中的表情追加至 PC 端草稿内容。 */
const handleEmojiSelect = (emoji: string) => {
  setDraft(`${draft.value}${emoji}`)
  mode.value = 'emoji'
}

/** 删除 PC 端草稿末尾的一个 Unicode 字符。 */
const handleEmojiDelete = () => {
  setDraft(Array.from(draft.value).slice(0, -1).join(''))
  mode.value = 'emoji'
}

/** 打开 PC 端多张图片或视频的发送预览，用户确认后再上传。 */
const openMediaPreview = (files: File[]) => {
  pendingMediaFiles.value = files.slice(0, 9)
  pcPreviewImage.value = ''
}

/** 关闭 PC 媒体发送预览，并清空尚未发送的文件。 */
const closeMediaPreview = () => {
  pendingMediaFiles.value = []
  pcPreviewImage.value = ''
  mode.value = 'idle'
}

/** 打开 PC 会话历史中图片消息的预览弹窗。 */
const openImageViewer = (message: ChatMessage) => {
  if (!message.image) return
  pendingMediaFiles.value = []
  pcPreviewImage.value = message.image
}

/** 从 PC 待发送媒体列表中移除用户取消的文件。 */
const removePendingMedia = (index: number) => {
  pendingMediaFiles.value.splice(index, 1)
  if (!pendingMediaFiles.value.length) closeMediaPreview()
}

/** 依次上传并发送 PC 端用户确认的媒体文件。 */
const sendPendingMedia = async () => {
  const files = [...pendingMediaFiles.value]
  closeMediaPreview()
  for (const file of files) {
    await sendMediaFile(file)
  }
  scrollToBottom()
}

/** PC 客服路由首次进入时加载在线客服与自动回复分类。 */
onMounted(() => {
  void initialize()
})

/** 在缓存加载、发送或服务端推送新增消息后保持最新消息可见。 */
watch(
  () => messages.value[messages.value.length - 1]?.id,
  () => scrollToBottom()
)
</script>
