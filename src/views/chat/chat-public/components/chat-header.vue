<template>
  <!-- 当前客服会话头部。 -->
  <header
    class="flex shrink-0 items-center bg-bg-2"
    :class="props.displayMode === 'pc' ? 'h-[58px] px-[12px]' : 'h-[49px] px-[14px]'"
  >
    <button
      type="button"
      class="flex shrink-0 items-center justify-center bg-opacity-6"
      :class="
        props.displayMode === 'pc' ? 'size-[30px] rounded-[6px]' : 'size-[33px] rounded-[8px]'
      "
      @click="$emit('back')"
    >
      <ArrowLeftIcon class="size-[14px]" />
    </button>

    <!-- 客服头像、名称与在线状态。 -->
    <div
      class="flex min-w-0 flex-1 items-center gap-[10px]"
      :class="props.displayMode === 'pc' ? 'ml-[12px]' : 'ml-[14px]'"
    >
      <div
        class="relative shrink-0"
        :class="props.displayMode === 'pc' ? 'size-[40px]' : 'size-[34px]'"
      >
        <!-- 头像图片独立裁剪，避免覆盖层图标被截断。 -->
        <div class="size-full overflow-hidden rounded-full">
          <img :src="avatarUrl" alt="" class="size-full object-cover" />
        </div>
        <OnlineIcon class="absolute -bottom-[2px] -right-[2px] z-[1] size-[7px]" />
      </div>
      <div class="min-w-0" :class="props.displayMode === 'pc' ? 'flex items-center gap-[6px]' : ''">
        <h1
          class="truncate text-text-1"
          :class="
            props.displayMode === 'pc'
              ? 'text-[14px] font-bold'
              : 'text-[15px] font-medium leading-[18px]'
          "
        >
          {{
            props.displayMode === 'pc'
              ? displayName
              : t('chatPublic.customerServiceName', { name: displayName })
          }}
        </h1>
        <p
          class="text-theme-primary"
          :class="
            props.displayMode === 'pc'
              ? 'rounded-[4px] bg-theme-primary/15 px-[4px] py-[2px] text-[10px] leading-[12px]'
              : 'mt-[2px] text-[11px] leading-[13px]'
          "
        >
          {{ statusText }}
        </p>
      </div>
    </div>

    <button
      type="button"
      class="flex shrink-0 items-center justify-center bg-opacity-6"
      :class="
        props.displayMode === 'pc' ? 'size-[30px] rounded-[6px]' : 'size-[33px] rounded-[8px]'
      "
      :aria-label="t('chatPublic.search')"
      @click="$emit('search')"
    >
      <SearchIcon :class="props.displayMode === 'pc' ? 'size-[16px]' : 'size-[20px]'" />
    </button>
  </header>
</template>

<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import OnlineIcon from '@/static/svg/chat/public/online.svg?component'
import SearchIcon from '@/static/svg/chat/public/search.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getConversationStatusKey, resolveChatMediaUrl, resolveConversationStatus } from '../shared'
import type { ConversationItem } from '../types'

const props = defineProps<{
  conversation: ConversationItem
  typing?: boolean
  displayMode?: 'h5' | 'pc'
}>()

defineEmits<{ back: []; search: [] }>()

const { t } = useI18n()

/** 根据后台原始 nickName 与 account 生成客服显示名称。 */
const displayName = computed(() => props.conversation.nickName || props.conversation.account || '')

/** 将后台头像文件名或绝对地址转换为可显示地址。 */
const avatarUrl = computed(() => resolveChatMediaUrl(props.conversation.avatar))

/** 优先显示正在输入状态，否则显示当前客服的在线状态。 */
const statusText = computed(() =>
  t(
    getConversationStatusKey(
      props.typing ? 'typing' : resolveConversationStatus(props.conversation.onlineStatus)
    )
  )
)
</script>
