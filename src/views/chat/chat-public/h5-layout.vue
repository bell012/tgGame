<template>
  <!-- H5 客服页面根容器。 -->
  <div
    class="chat-public-h5 fixed inset-x-0 top-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    :class="activeConversation ? 'bottom-auto z-[60]' : 'chat-public-h5-with-tab z-20'"
    :style="activeConversation ? chatViewportStyle : undefined"
  >
    <!-- 未选择会话时的客服列表页面。 -->
    <template v-if="!activeConversation">
      <!-- 客服列表头部。 -->
      <header
        class="chat-public-h5-list-header flex h-[49px] shrink-0 items-center bg-bg-2 px-[10px]"
      >
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
      <ConversationList
        :conversations="conversations"
        :loading="loadingConversations"
        @refresh="loadConversations({ silent: true })"
        @select="handleConversationSelect"
      />
    </template>

    <!-- 已选择会话时的对话内容层。 -->
    <div v-else class="absolute inset-0 z-[60] bg-bg-1">
      <!-- 当前客服的会话内容。 -->
      <ConversationView
        ref="conversationViewRef"
        :conversation="activeConversation"
        :messages="messages"
        :issues="quickIssues"
        :claimed-red-packet-ids="claimedRedPacketIds"
        :has-more-cached-messages="hasMoreCachedMessages"
        :loading-older-messages="loadingOlderMessages"
        :red-packet-claiming-message-ids="redPacketClaimingMessageIds"
        :uploading-media="uploadingImage"
        :highlight-message-id="highlightMessageId"
        :highlight-keyword="highlightKeyword"
        :keyboard-visible="keyboardVisible"
        :mode="mode"
        :draft="draft"
        :reply-target="replyTarget"
        @back="handleConversationBack"
        @search="searchVisible = true"
        @reply="startReply"
        @claim-red-packet="handleRedPacketClaim"
        @load-older="handleLoadOlderMessages"
        @issue="handleIssueSelect"
        @retry="handleRetryMessage"
        @update:draft="setDraft"
        @send="handleSend"
        @emoji="toggleEmoji"
        @emoji-close="handleEmojiPanelClose"
        @media="toggleMedia"
        @composer-focus="handleComposerFocus"
        @composer-interact="closeQuickIssue"
        @cancel-reply="cancelReply"
        @emoji-select="handleEmojiSelect"
        @emoji-delete="handleEmojiDelete"
        @photo="sendSelectedMedia"
        @camera="sendSelectedMedia"
        @view-image="openImageViewer"
        @view-video="openVideoViewer"
      />

      <!-- 红包领取成功提示。 -->
      <RedPacketSuccessPopup
        v-if="redPacketSuccessAmount !== null"
        :amount="redPacketSuccessAmount"
        :currency="redPacketSuccessCurrency"
        @close="closeRedPacketSuccess"
      />

      <!-- 会话页内触发的快捷问题弹层。 -->
      <QuickIssueSheet
        :visible="quickIssueVisible"
        :active-issue="activeIssue"
        :items="autoReplyItems"
        :loading="loadingAutoReplies"
        @close="quickIssueVisible = false"
        @send="handleQuickIssueSend"
      />
    </div>

    <!-- 消息搜索覆盖层。 -->
    <ChatSearchOverlay
      v-if="searchVisible"
      :conversation="activeConversation"
      :search-messages="searchCurrentConversationMessages"
      @close="searchVisible = false"
      @locate="handleSearchLocate"
    />
    <!-- 图片预览覆盖层。 -->
    <ChatImagePreview
      v-if="previewImage || pendingMediaFiles.length"
      :src="previewImage"
      :media-files="pendingMediaFiles"
      :mode="previewMode"
      @close="closeImagePreview"
      @remove="removePendingMedia"
      @send="sendPendingMedia"
    />
    <!-- H5 视频预览覆盖层。 -->
    <ChatVideoPreview v-if="previewVideo" :src="previewVideo" @close="previewVideo = ''" />
  </div>
</template>

<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import type { AutoReplyItem } from '@/api/interface/chat'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import {
  computed,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ChatImagePreview from './components/chat-image-preview.vue'
import ChatVideoPreview from './components/chat-video-preview.vue'
import ChatSearchOverlay from './components/chat-search-overlay.vue'
import ConversationList from './components/conversation-list.vue'
import ConversationView from './components/conversation-view.vue'
import QuickIssueSheet from './components/quick-issue-sheet.vue'
import RedPacketSuccessPopup from './components/red-packet-success-popup.vue'
import { useChatComposer } from './composables/use-chat-composer'
import { useChatRuntime } from './composables/use-chat-runtime'
import type { ChatMessage, ConversationItem, QuickIssue } from './types'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const { acctInfo, userInfo } = storeToRefs(userStore)
const isLoggedIn = computed(() => Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId))
// 仅处理“以游客身份进入当前客服页后登录”的场景；已登录用户进入后切换账号不关闭页面。
const enteredAsGuest = ref(!isLoggedIn.value)
let hasClosedAfterGuestLogin = false
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
  redPacketSuccessCurrency,
  hasMoreCachedMessages,
  loadingOlderMessages,
  initialize,
  selectConversation,
  leaveConversation,
  loadOlderMessages,
  loadConversations,
  searchCurrentConversationMessages,
  locateCurrentConversationMessage,
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
const searchVisible = ref(false)
const highlightMessageId = ref('')
const highlightKeyword = ref('')
const previewImage = ref('')
const previewMode = ref<'compose' | 'viewer'>('viewer')
const pendingMediaFiles = ref<File[]>([])
const previewVideo = ref('')
const conversationViewRef = ref<InstanceType<typeof ConversationView> | null>(null)
const visualViewportHeight = ref<number | null>(null)
const layoutViewportWidth = ref<number | null>(null)
const visualViewportOffsetTop = ref(0)
const maximumVisualViewportHeight = ref(0)

/**
 * iOS/Android 软键盘不一定会缩小 layout viewport。让固定容器覆盖可视视口，
 * 保持 Header 在可见区域顶部，输入框在键盘上沿。
 */
const syncVisualViewport = () => {
  const viewport = window.visualViewport
  if (!viewport) {
    visualViewportHeight.value = null
    return
  }

  // 用布局视口宽度识别横竖屏切换；可视视口宽度也会随 Safari 缩放而变化。
  const width = document.documentElement.clientWidth
  if (layoutViewportWidth.value !== null && Math.abs(width - layoutViewportWidth.value) > 1) {
    maximumVisualViewportHeight.value = viewport.height
  } else {
    maximumVisualViewportHeight.value = Math.max(maximumVisualViewportHeight.value, viewport.height)
  }
  layoutViewportWidth.value = width
  visualViewportHeight.value = viewport.height
  visualViewportOffsetTop.value = viewport.offsetTop
}
const chatViewportStyle = computed(() =>
  visualViewportHeight.value
    ? {
        top: `${Math.max(0, visualViewportOffsetTop.value)}px`,
        height: `${visualViewportHeight.value}px`
      }
    : { height: '100%' }
)
const keyboardVisible = computed(
  () => maximumVisualViewportHeight.value - (visualViewportHeight.value ?? 0) > 120
)

// 游客会话的 Socket 使用 TEMP_* 身份。登录后关闭当前客服页，避免同一会话中混用游客与会员身份。
watch(isLoggedIn, loggedIn => {
  if (!enteredAsGuest.value || !loggedIn || hasClosedAfterGuestLogin) return

  hasClosedAfterGuestLogin = true
  leaveConversation()
  router.back()
})

// 会话层是固定覆盖页。锁住底层文档，避免 iOS 为聚焦输入框滚动首页/路由背景；
// 未启用 preventTouchMove，MessageList 仍保留自己的原生纵向滚动。
usePageScrollLock(() => Boolean(activeConversation.value))

/** 关闭快捷问题层并清空当前分类。 */
const closeQuickIssue = () => {
  quickIssueVisible.value = false
  activeIssue.value = null
}

/** 在消息新增或切换会话后，将消息区域滚动到最底部。 */
const scrollToBottom = () => {
  nextTick(() => conversationViewRef.value?.scrollToBottom())
}

/** 从客服列表返回上一个页面。 */
const handleListBack = () => {
  router.back()
}

/** 选择客服会话，读取本地消息缓存并建立当前客服的 Socket 连接。 */
const handleConversationSelect = async (conversation: ConversationItem) => {
  highlightMessageId.value = ''
  highlightKeyword.value = ''
  await selectConversation(conversation)
  scrollToBottom()
}

/** 退出当前会话，清理仅属于会话页的临时交互状态。 */
const handleConversationBack = async () => {
  await leaveConversation()
  // 保留已有列表并在后台刷新，返回列表时不重新显示骨架屏。
  await loadConversations({ silent: true })
  highlightMessageId.value = ''
  highlightKeyword.value = ''
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

/** 查看会话中的图片消息。 */
const openImageViewer = (message: ChatMessage) => {
  if (!message.image) return
  pendingMediaFiles.value = []
  previewMode.value = 'viewer'
  previewImage.value = message.image
}

/** 打开 H5 会话中的视频消息预览页。 */
const openVideoViewer = (message: ChatMessage) => {
  if (!message.video) return
  previewVideo.value = message.video
}

/** 关闭图片预览并恢复当前会话。 */
const closeImagePreview = () => {
  previewImage.value = ''
  pendingMediaFiles.value = []
  mode.value = 'idle'
}

/** 暂时跳过发送前预览：相册或相机选中媒体后立即依次上传发送。 */
const sendSelectedMedia = async (files: File[]) => {
  mode.value = 'idle'
  for (const file of files.slice(0, 9)) {
    await sendMediaFile(file)
  }
  scrollToBottom()
}

/** 从待发送媒体列表中移除用户取消的文件。 */
const removePendingMedia = (index: number) => {
  pendingMediaFiles.value = pendingMediaFiles.value.filter((_, itemIndex) => itemIndex !== index)
  if (!pendingMediaFiles.value.length) closeImagePreview()
}

/** 依次上传并发送用户确认的图片或视频，保证消息显示顺序与选择顺序一致。 */
const sendPendingMedia = async () => {
  const files = [...pendingMediaFiles.value]
  closeImagePreview()
  for (const file of files) {
    await sendMediaFile(file)
  }
  scrollToBottom()
}

/** 从搜索结果返回会话并定位到当前消息区域。 */
const handleSearchLocate = async (messageId: string, keyword: string) => {
  const located = await locateCurrentConversationMessage(messageId)
  searchVisible.value = false
  if (located) {
    highlightMessageId.value = messageId
    highlightKeyword.value = keyword
    await nextTick()
    conversationViewRef.value?.scrollToMessage(messageId)
  }
}

/** 打开所选自动回复分类，并请求其对应的后台问题列表。 */
const handleIssueSelect = async (issue: QuickIssue) => {
  mode.value = 'idle'
  activeIssue.value = issue
  quickIssueVisible.value = true
  await loadAutoReplies(issue)
}

/** 发送自动回复请求，并等待服务端推送 autoReplyResp 内容。 */
const handleQuickIssueSend = (item: AutoReplyItem) => {
  if (sendAutoReplyMessage(item)) {
    quickIssueVisible.value = false
    activeIssue.value = null
  }
  scrollToBottom()
}

/** 发送输入框草稿，并在发送后重置编辑器状态。 */
const handleSend = () => {
  if (!draft.value.trim()) return
  sendTextMessage(draft.value, replyTarget.value)
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

/** 点击表情面板以外的区域时收起面板，保留当前草稿内容。 */
const handleEmojiPanelClose = () => {
  if (mode.value === 'emoji') {
    mode.value = draft.value.trim() ? 'typing' : 'idle'
  }
}

/** 用户点回输入框时，收起与软键盘互斥的功能面板。 */
const handleComposerFocus = () => {
  closeQuickIssue()
  if (mode.value === 'emoji' || mode.value === 'media') {
    mode.value = draft.value.trim() ? 'typing' : 'idle'
  }
}

/** 首次进入客服页时并行请求在线客服和自动回复分类。 */
onMounted(() => {
  syncVisualViewport()
  window.visualViewport?.addEventListener('resize', syncVisualViewport)
  window.visualViewport?.addEventListener('scroll', syncVisualViewport)
  void initialize()
})

onBeforeUnmount(() => {
  window.visualViewport?.removeEventListener('resize', syncVisualViewport)
  window.visualViewport?.removeEventListener('scroll', syncVisualViewport)
})

// 再次进入时先展示已缓存的客服列表，后台静默更新，避免整页重新显示加载占位。
let hasActivated = false
onActivated(() => {
  if (hasActivated) {
    void loadConversations({ silent: true })
  }
  hasActivated = true
})

onDeactivated(() => {
  // 页面进入缓存也要结束当前会话，提交已读并断开 Socket、心跳，避免后台持续运行。
  leaveConversation()
  closeRedPacketSuccess()
  closeQuickIssue()
  searchVisible.value = false
  closeImagePreview()
  previewVideo.value = ''
  resetAfterSend()
})

/** 在缓存加载、发送或服务端推送新增消息后保持最新消息可见。 */
watch(
  () => messages.value[messages.value.length - 1]?.id,
  () => scrollToBottom()
)
</script>

<style scoped>
.chat-public-h5-with-tab {
  bottom: calc(60px + var(--app-shell-bottom-safe-offset));
}
</style>

<style scoped>
:global(body:has(.chat-public-h5) .bottom-tab-bar) {
  background: var(--color-background-level-2);
}

/* 客服列表由抽屉承载时底栏仍可点击；进入具体会话后恢复层级，由会话覆盖底栏。 */
:global(body:has(.chat-public-h5-with-tab) .bottom-tab-bar) {
  z-index: 200;
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
