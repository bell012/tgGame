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
      :mode="mode"
      :draft="draft"
      :reply-target="replyTarget"
      @back="handleConversationBack"
      @reply="startReply"
      @issue="handleIssueSelect"
      @update:draft="setDraft"
      @send="handleSend"
      @emoji="toggleEmoji"
      @media="toggleMedia"
      @cancel-reply="cancelReply"
      @emoji-select="handleEmojiSelect"
      @emoji-delete="handleEmojiDelete"
      @photo="handleMockPhoto"
      @camera="handleMockPhoto"
    />

    <!-- PC 快捷问题弹层。 -->
    <QuickIssueSheet
      display-mode="pc"
      :visible="quickIssueVisible"
      :active-issue="activeIssue"
      @close="quickIssueVisible = false"
      @send="handleQuickIssueSend"
    />
  </aside>
</template>

<script setup lang="ts">
import mockImageUrl from '@/static/img/chat/public/chat-image-sample.jpg'
import CloseIcon from '@/static/svg/close.svg?component'
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ConversationList from './components/conversation-list.vue'
import ConversationView from './components/conversation-view.vue'
import QuickIssueSheet from './components/quick-issue-sheet.vue'
import { useChatComposer } from './composables/use-chat-composer'
import { useConversationList } from './composables/use-conversation-list'
import { useMessageList } from './composables/use-message-list'
import { useSendMessage } from './composables/use-send-message'
import type { ConversationItem, QuickIssue } from './types'

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

// PC 端首次进入客服路由时不预选会话，先展示客服会话列表。
const activeConversation = ref<ConversationItem | null>(null)
const quickIssueVisible = ref(false)
const activeIssue = ref<QuickIssue | null>(null)

/** 选择 PC 客服后显示对应的静态会话内容。 */
const handleConversationSelect = (conversation: ConversationItem) => {
  activeConversation.value = conversation
  nextTick(() => scrollToBottom())
}

/** 从对话返回客服会话列表，并清理会话内的临时状态。 */
const handleConversationBack = () => {
  activeConversation.value = null
  quickIssueVisible.value = false
  activeIssue.value = null
  resetAfterSend()
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

/** 打开 PC 端所选快捷问题的固定问答弹层。 */
const handleIssueSelect = (issue: QuickIssue) => {
  activeIssue.value = issue
  quickIssueVisible.value = true
}

/** 将快捷问题文案作为用户消息写入本地静态消息列表。 */
const handleQuickIssueSend = (text: string) => {
  if (text) sendText(text)
  quickIssueVisible.value = false
  activeIssue.value = null
  scrollToBottom()
}

/** 发送当前输入草稿，并恢复编辑器初始状态。 */
const handleSend = () => {
  if (!draft.value.trim()) return
  sendText(draft.value, replyTarget.value)
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

/** 使用本地示例图片模拟 PC 端图片发送，后续替换为真实上传流程。 */
const handleMockPhoto = () => {
  sendImage(mockImageUrl)
  mode.value = 'idle'
  scrollToBottom()
}
</script>
