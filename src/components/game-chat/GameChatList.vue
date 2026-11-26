<template>
  <!-- 各游戏共用的聊天列表容器。 -->
  <section
    class="relative h-full min-h-0 overflow-hidden text-[13px] leading-[1.35] text-text-1"
    aria-label="Game chat"
  >
    <!-- 仅本次页面会话的消息可以滚动。 -->
    <div
      ref="messageList"
      class="absolute inset-x-0 top-1 bottom-[21px] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      @scroll="updateScrollPosition"
    >
      <!-- 游戏决定每种消息的具体渲染方式。 -->
      <div class="flex min-h-full flex-col items-start gap-1.5 pt-6">
        <template v-for="message in messages" :key="message.id">
          <slot :message="message" />
        </template>
      </div>
    </div>
    <!-- 游戏自行提供渐隐蒙层与返回底部的按钮。 -->
    <slot name="overlay" :scroll-to-bottom="scrollToBottom" />
  </section>
</template>

<script setup lang="ts" generic="T extends GameChatItem">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { GameChatItem } from '@/composables/useGameChatFeed'

const props = defineProps<{ messages: T[] }>()
defineSlots<{
  default(props: { message: T }): unknown
  overlay(props: { scrollToBottom: () => void }): unknown
}>()

const messageList = ref<HTMLElement | null>(null)
const atBottom = ref(true)

/** 滚动到最新消息。 */
function scrollToBottom() {
  if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
  atBottom.value = true
}

/** 记录用户是否正在查看列表底部。 */
function updateScrollPosition() {
  const list = messageList.value
  if (list) atBottom.value = list.scrollHeight - list.scrollTop - list.clientHeight < 12
}

/** 只有原本位于底部时才跟随新消息。 */
async function syncMessagesScroll() {
  const shouldFollow = atBottom.value
  await nextTick()
  if (shouldFollow) scrollToBottom()
}

/** 初次进入从列表顶部展示公告和历史消息。 */
async function initializeScroll() {
  await nextTick()
  if (messageList.value) messageList.value.scrollTop = 0
  updateScrollPosition()
}

watch(
  () => props.messages,
  async (messages, previousMessages) => {
    const newest = messages[messages.length - 1]
    const previousNewest = previousMessages?.[previousMessages.length - 1]
    // 公告前插或历史补入不改变当前阅读位置；实时消息才按需跟随底部。
    if (!previousNewest || !newest || newest.id === previousNewest.id || newest.source === 'http') {
      await nextTick()
      updateScrollPosition()
      return
    }
    await syncMessagesScroll()
  }
)
onMounted(initializeScroll)
</script>
