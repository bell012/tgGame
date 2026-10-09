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
        <div class="relative h-[36px] min-w-0 w-[213px]">
          <!-- 昵称、状态和最后消息分别使用固定槽位，空值不会影响其他元素坐标。 -->
          <div class="absolute inset-x-0 top-0 flex h-[17px] items-center gap-[6px]">
            <span
              class="min-w-0 max-w-[159px] truncate text-[14px] font-[700] leading-[17px] text-text-1"
            >
              {{ displayName }}
            </span>
            <span
              v-if="isOnline"
              class="flex h-4 shrink-0 items-center justify-center rounded-[4px] bg-theme-3 px-[4px] text-[10px] font-[400] leading-3 text-theme-primary"
            >
              {{ t('chatPublic.online') }}
            </span>
          </div>
          <span
            class="absolute inset-x-0 bottom-0 truncate text-[13px] font-[400] leading-4 text-text-2"
          >
            {{ lastMessagePreview }}
          </span>
        </div>
      </div>

      <!-- PC 未读数量与最后消息时间。 -->
      <div class="relative h-[36px] w-[35px] shrink-0">
        <span
          v-if="unreadCount > 0"
          class="absolute right-0 top-[2px] flex size-[14px] items-center justify-center rounded-full bg-[#FC3C3C] text-[10px] font-[400] leading-3 text-common-100"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
        <span
          class="absolute bottom-0 right-0 w-[35px] text-right text-[13px] font-[400] leading-[16px] text-text-3"
        >
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
    class="flex h-[65px] w-full items-center justify-between rounded-[10px] bg-bg-2 py-[10px] pl-[10px] pr-[14px] text-left active:opacity-80"
    @click="$emit('select', conversation)"
  >
    <!-- 左侧头像与客服信息区域。 -->
    <div class="flex h-[45px] min-w-0 w-[266.33px] shrink-0 items-center gap-[15.33px]">
      <!-- 客服头像与在线标记。 -->
      <div class="relative size-[45px] shrink-0">
        <!-- 头像图片按 Figma 尺寸溢出后裁剪，保持封面放大效果。 -->
        <div class="relative size-full overflow-hidden rounded-[6px]">
          <img :src="avatarUrl" alt="" class="size-full object-cover" />
        </div>
        <OnlineIcon
          v-if="conversationStatus !== 'offline'"
          class="absolute -right-[3.33px] bottom-0 z-[1] size-[8px]"
        />
      </div>

      <!-- 昵称、状态与消息均按固定纵向槽位定位。 -->
      <div class="relative h-[39.33px] min-w-0 flex-1">
        <div class="absolute inset-x-0 top-0 flex h-[17px] items-center gap-[5px]">
          <span class="max-w-[159px] truncate text-[14px] font-[500] leading-[17px] text-text-1">
            {{ displayName }}
          </span>
          <span
            class="flex h-[16px] shrink-0 items-center justify-center rounded-[3px] bg-theme-3 px-[6px] text-[10px] font-[400] leading-[12px] text-theme-primary"
          >
            {{ t(getConversationStatusKey(conversationStatus)) }}
          </span>
        </div>
        <p
          class="absolute inset-x-0 bottom-0 truncate text-[12px] font-[400] leading-[14.67px] text-text-2"
        >
          {{ lastMessagePreview }}
        </p>
      </div>
    </div>

    <!-- 未读数量与最后消息时间固定锚定在右侧上下位置。 -->
    <div class="relative h-[38.33px] w-[29px] shrink-0">
      <span
        v-if="unreadCount > 0"
        class="absolute right-0 top-0 flex h-[18px] min-w-[24.67px] items-center justify-center rounded-[9px] bg-secondary-2 px-[5px] text-[12px] font-[400] leading-[20px] text-common-100"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
      <span
        class="absolute inset-x-0 bottom-0 whitespace-nowrap text-right text-[11px] font-[400] leading-[13.33px] text-text-2"
      >
        {{ lastMessageTime }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import OnlineIcon from '@/static/svg/chat/public/online.svg?component'
import { computed, defineEmits, defineProps, withDefaults } from 'vue'
import { useI18n } from 'vue-i18n'
import { getConversationStatusKey, resolveChatMediaUrl, resolveConversationStatus } from '../shared'
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

/** 直接展示 IndexedDB 最新消息预先格式化的 time；无本地历史时保持为空。 */
const lastMessageTime = computed(() => String(props.conversation.lastMessageTime ?? '').trim())

/** 优先展示接口返回的最新未读消息；未返回时保持本地消息预览逻辑。 */
const lastMessagePreview = computed(() => {
  const lastUnreadMessage = props.conversation.lastUnreadMessage
  if (lastUnreadMessage) {
    if (lastUnreadMessage.contentType === 'image') return '[图片消息]'
    return lastUnreadMessage.content || ''
  }

  if (props.conversation.lastMessageType === 'image') return '[图片消息]'
  if (props.conversation.lastMessageType === 'video') return '[视频消息]'
  return props.conversation.lastMessage || ''
})

/** 将后台头像文件名或绝对地址转换为可显示地址。 */
const avatarUrl = computed(() => resolveChatMediaUrl(props.conversation.avatar))
</script>
