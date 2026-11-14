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
      <div class="flex min-h-full flex-col items-start justify-end gap-1.5 pt-6">
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

/** 初次显示时定位到最新消息。 */
async function initializeScroll() {
  await nextTick()
  scrollToBottom()
}

watch(() => props.messages, syncMessagesScroll)
onMounted(initializeScroll)
</script>
