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
      class="relative shrink-0 overflow-hidden"
      :class="props.displayMode === 'pc' ? 'size-[40px] rounded-full' : 'size-[55px] rounded-[9px]'"
    >
      <img :src="conversation.avatar" alt="" class="size-full object-cover" />
      <OnlineIcon
        v-if="conversation.status !== 'offline'"
        class="absolute bottom-[1px] right-[1px] size-[8px]"
      />
    </div>

    <!-- 客服名称、状态与最后一条消息。 -->
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-[6px]">
        <span class="truncate text-[14px] font-medium text-text-1">{{ conversation.name }}</span>
        <span
          class="rounded-[3px] bg-theme-primary/15 px-[6px] py-[2px] text-[10px] leading-[12px] text-theme-primary"
        >
          {{ t(getConversationStatusKey(conversation.status)) }}
        </span>
      </div>
      <p
        class="truncate text-[12px] text-text-2"
        :class="props.displayMode === 'pc' ? 'mt-[3px]' : 'mt-[9px]'"
      >
        {{ conversation.lastMessage }}
      </p>
    </div>

    <!-- 未读数量与最后消息时间。 -->
    <div class="flex w-[42px] shrink-0 flex-col items-end self-stretch pt-[2px]">
      <span
        v-if="conversation.unread > 0"
        class="flex min-w-[18px] items-center justify-center rounded-[9px] bg-secondary-2 px-[5px] text-[12px] font-medium leading-[18px] text-common-100"
      >
        {{ conversation.unread > 99 ? '99+' : conversation.unread }}
      </span>
      <span class="mt-auto pb-[1px] text-[11px] text-text-2">{{ conversation.time }}</span>
    </div>
    <ArrowLeftIcon
      v-if="props.displayMode === 'pc'"
      class="size-[16px] shrink-0 -rotate-180 text-text-2"
    />
  </button>
</template>

<script setup lang="ts">
import OnlineIcon from '@/static/svg/chat/public/online.svg?component'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { useI18n } from 'vue-i18n'
import { getConversationStatusKey } from '../shared'
import type { ConversationItem } from '../types'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{ conversation: ConversationItem; displayMode?: 'h5' | 'pc' }>(),
  { displayMode: 'h5' }
)
defineEmits<{ select: [conversation: ConversationItem] }>()
</script>
