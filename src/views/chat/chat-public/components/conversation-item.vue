<template>
  <!-- 单个客服会话入口。 -->
  <button
    type="button"
    class="flex w-full items-center text-left active:opacity-80"
    :class="
      props.displayMode === 'pc'
        ? 'h-[60px] gap-[10px] border-b border-common-100/[0.04] px-[10px] py-[10px]'
        : 'min-h-[75px] gap-[15px] rounded-[10px] bg-bg-2 px-[10px] py-[10px]'
    "
    @click="$emit('select', conversation)"
  >
    <!-- 客服头像与在线标记。 -->
    <div
      class="relative shrink-0"
      :class="props.displayMode === 'pc' ? 'size-[40px] rounded-full' : 'size-[55px] rounded-[9px]'"
    >
      <!-- 头像图片独立裁剪，避免覆盖层图标被截断。 -->
      <div
        class="size-full overflow-hidden"
        :class="props.displayMode === 'pc' ? 'rounded-full' : 'rounded-[9px]'"
      >
        <img :src="avatarUrl" alt="" class="size-full object-cover" />
      </div>
      <OnlineIcon
        v-if="conversationStatus !== 'offline'"
        class="absolute -bottom-[2px] -right-[2px] z-[1] size-[8px]"
      />
    </div>

    <!-- 客服名称、状态与最后一条消息。 -->
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-[6px]">
        <span class="truncate text-[14px] font-medium text-text-1">{{ displayName }}</span>
        <span
          class="rounded-[3px] bg-theme-primary/15 px-[6px] py-[2px] text-[10px] leading-[12px] text-theme-primary"
        >
          {{ t(getConversationStatusKey(conversationStatus)) }}
        </span>
      </div>
      <p
        class="truncate text-[12px] text-text-2"
        :class="props.displayMode === 'pc' ? 'mt-[3px]' : 'mt-[9px]'"
      >
        {{ conversation.lastMessage || '' }}
      </p>
    </div>

    <!-- 未读数量与最后消息时间。 -->
    <div class="flex w-[42px] shrink-0 flex-col items-end self-stretch pt-[2px]">
      <span
        v-if="unreadCount > 0"
        class="flex min-w-[18px] items-center justify-center rounded-[9px] bg-secondary-2 px-[5px] text-[12px] font-medium leading-[18px] text-common-100"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
      <span class="mt-auto pb-[1px] text-[11px] text-text-2">{{ lastMessageTime }}</span>
    </div>
    <ArrowLeftIcon
      v-if="props.displayMode === 'pc'"
      class="size-[16px] shrink-0 -rotate-180 text-text-2"
    />
  </button>
</template>

<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import OnlineIcon from '@/static/svg/chat/public/online.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatChatTime,
  getConversationStatusKey,
  resolveChatMediaUrl,
  resolveConversationStatus
} from '../shared'
import type { ConversationItem } from '../types'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{ conversation: ConversationItem; displayMode?: 'h5' | 'pc' }>(),
  { displayMode: 'h5' }
)
defineEmits<{ select: [conversation: ConversationItem] }>()

/** 根据后台原始 nickName 与 account 生成客服显示名称。 */
const displayName = computed(() => props.conversation.nickName || props.conversation.account || '')

/** 根据后台原始 onlineStatus 生成页面状态，不修改会话原对象。 */
const conversationStatus = computed(() =>
  resolveConversationStatus(props.conversation.onlineStatus)
)

/** 根据后台原始 unreadCount 生成可安全展示的未读数量。 */
const unreadCount = computed(() => Math.max(0, Number(props.conversation.unreadCount) || 0))

/** 根据后台原始 lastMessageTime 格式化最后消息时间。 */
const lastMessageTime = computed(() => {
  const value = Number(props.conversation.lastMessageTime)
  return Number.isFinite(value) && value > 0 ? formatChatTime(value) : ''
})

/** 将后台头像文件名或绝对地址转换为可显示地址。 */
const avatarUrl = computed(() => resolveChatMediaUrl(props.conversation.avatar))
</script>
