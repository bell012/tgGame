<template>
  <!-- PC 单个客服会话卡片。 -->
  <div
    v-if="props.displayMode === 'pc'"
    class="flex h-[60px] w-[356px] items-center justify-between overflow-hidden rounded-[10px] bg-bg-2 pl-[10px]"
  >
    <!-- PC 消息主体。 -->
    <button
      type="button"
      class="flex h-[40px] w-[310px] items-center justify-between text-left active:opacity-80"
      @click="$emit('select', conversation)"
    >
      <!-- PC 左侧头像、昵称与消息。 -->
      <div class="flex h-[40px] w-[263px] items-center gap-[10px]">
        <!-- PC 客服头像与在线圆点。 -->
        <div class="relative size-[40px] shrink-0">
          <img :src="avatarUrl" alt="" class="size-[40px] rounded-full object-cover" />
          <span
            v-if="isOnline"
            class="absolute bottom-[2px] right-[2px] size-[6px] rounded-full border border-common-100 bg-theme-primary"
          />
        </div>

        <!-- PC 昵称、状态与最后消息。 -->
        <div class="flex h-[36px] min-w-0 w-[213px] flex-col items-start gap-[3px]">
          <div class="flex h-[17px] items-center gap-[6px]">
            <span class="max-w-[120px] truncate text-[14px] font-[700] leading-[17px] text-text-1">
              {{ displayName }}
            </span>
            <span
              v-if="isOnline"
              class="flex h-4 items-center justify-center rounded-[4px] bg-theme-3 px-[4px] text-[10px] font-[400] leading-3 text-theme-primary"
            >
              {{ t('chatPublic.online') }}
            </span>
          </div>
          <span class="w-full truncate text-[13px] font-[400] leading-4 text-text-2">
            {{ conversation.lastMessage || '' }}
          </span>
        </div>
      </div>

      <!-- PC 未读数量与最后消息时间。 -->
      <div
        class="flex h-[36px] w-[35px] shrink-0 flex-col items-end justify-end gap-[4px] pt-[2px]"
      >
        <span
          v-if="unreadCount > 0"
          class="flex size-[14px] items-center justify-center rounded-full bg-[#FC3C3C] text-[10px] font-[400] leading-3 text-common-100"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
        <span class="whitespace-nowrap text-right text-[13px] font-[400] leading-4 text-text-3">
          {{ lastMessageTime }}
        </span>
      </div>
    </button>

    <!-- PC 右侧进入会话按钮。 -->
    <button
      type="button"
      class="flex h-[60px] w-5 shrink-0 items-center justify-center bg-bg-3"
      :aria-label="t('chatPublic.customerServiceName', { name: displayName })"
      @click="$emit('select', conversation)"
    >
      <ArrowDownIcon class="size-4 -rotate-90 text-text-3" />
    </button>
  </div>

  <!-- H5 单个客服会话入口。 -->
  <button
    v-else
    type="button"
    class="flex min-h-[75px] w-full items-center gap-[15px] rounded-[10px] bg-bg-2 px-[10px] py-[10px] text-left active:opacity-80"
    @click="$emit('select', conversation)"
  >
    <!-- 客服头像与在线标记。 -->
    <div class="relative size-[55px] shrink-0 rounded-[9px]">
      <!-- 头像图片独立裁剪，避免覆盖层图标被截断。 -->
      <div class="size-full overflow-hidden rounded-[9px]">
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
          class="inline-flex min-w-[48px] justify-center rounded-[3px] bg-theme-3 px-[6px] py-[2px] text-[10px] leading-[12px] text-theme-primary"
        >
          {{ t(getConversationStatusKey(conversationStatus)) }}
        </span>
      </div>
      <p class="mt-[9px] truncate text-[12px] text-text-2">
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
  </button>
</template>

<script setup lang="ts">
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
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

/** 判断当前客服是否在线，供 PC 状态圆点与状态标签复用。 */
const isOnline = computed(() => conversationStatus.value !== 'offline')

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
