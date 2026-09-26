<template>
  <!-- 消息搜索全屏覆盖层。 -->
  <section class="fixed inset-0 z-[110] flex flex-col bg-bg-1">
    <!-- 搜索输入头部。 -->
    <header class="flex h-[49px] shrink-0 items-center gap-[12px] bg-bg-2 px-[14px]">
      <button
        type="button"
        class="flex size-[33px] shrink-0 items-center justify-center rounded-[8px] bg-opacity-6"
        :aria-label="t('chatPublic.close')"
        @click="$emit('close')"
      >
        <ArrowLeftIcon class="size-[14px] text-text-1" />
      </button>

      <label
        class="flex h-[36px] min-w-0 flex-1 items-center gap-[9px] rounded-[8px] bg-bg-3 px-[10px]"
      >
        <SearchIcon class="size-[18px] shrink-0 text-text-2" />
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          class="min-w-0 flex-1 bg-transparent text-[14px] text-text-1 outline-none placeholder:text-text-2"
          :placeholder="t('chatPublic.search')"
        />
        <button
          v-if="query"
          type="button"
          class="flex size-[20px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10 text-[18px] leading-none text-text-2"
          :aria-label="t('chatPublic.close')"
          @click="query = ''"
        >
          ×
        </button>
      </label>
    </header>

    <!-- 未输入关键字时的提示区域。 -->
    <div
      v-if="!query"
      class="flex flex-1 items-center justify-center pb-[120px] px-[30px] text-center"
    >
      <p class="text-[14px] leading-[17px] text-text-3">{{ t('chatPublic.searchHint') }}</p>
    </div>

    <!-- 搜索命中后的当前会话历史结果列表。 -->
    <div
      v-else-if="searchResults.length"
      class="min-h-0 flex-1 overflow-y-auto px-[14px] py-[14px]"
    >
      <button
        v-for="result in searchResults"
        :key="result.id"
        type="button"
        class="flex w-full items-center gap-[12px] border-b border-common-100/[0.04] py-[12px] text-left"
        @click="$emit('locate', result.id)"
      >
        <img
          :src="props.conversation?.avatar || avatarUrl"
          alt=""
          class="size-[50px] shrink-0 rounded-full object-cover"
        />
        <span class="min-w-0 flex-1">
          <span class="flex items-center justify-between gap-[10px]">
            <strong class="truncate text-[16px] font-medium leading-[19px] text-text-1">{{
              props.conversation?.nickName || t('chatPublic.customerServiceList')
            }}</strong>
            <time class="shrink-0 text-[12px] text-text-3">
              {{ formatChatMessageTime(result.timestamp) }}
              {{ getChatTimePeriod(result.timestamp) }}
            </time>
          </span>
          <span class="mt-[7px] block truncate text-[14px] leading-[17px] text-text-2">
            {{ getSearchResultText(result) }}
          </span>
        </span>
      </button>
      <p class="py-[18px] text-center text-[14px] text-text-3">{{ t('chatPublic.noMore') }}</p>
    </div>

    <!-- 搜索请求结束后无结果时的主题空状态。 -->
    <div v-else class="flex flex-1 items-center justify-center">
      <span
        v-if="searching"
        class="size-7 animate-spin rounded-full border-2 border-common-100/20 border-t-theme-primary"
      ></span>
      <ThemedEmptyState
        v-else
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        :image-alt="t('chatPublic.noSearchResults')"
        :message="t('chatPublic.noSearchResults')"
        :container-class="
          props.displayMode === 'pc'
            ? 'flex flex-1 justify-center px-6 py-10'
            : 'flex flex-1 justify-center px-6 pb-[72px]'
        "
        image-class="h-[200px] w-[220px] object-contain"
        text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import avatarUrl from '@/static/img/chat/public/customer-service-luna.jpg'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import SearchIcon from '@/static/svg/chat/public/search.svg?component'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatChatMessageTime, getChatPlainText, getChatTimePeriod } from '../shared'
import type { ChatMessage, ConversationItem } from '../types'

import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'

const props = withDefaults(
  defineProps<{
    displayMode?: 'h5' | 'pc'
    conversation?: ConversationItem | null
    searchMessages: (keyword: string) => Promise<ChatMessage[]>
  }>(),
  {
    displayMode: 'h5'
  }
)

defineEmits<{ close: []; locate: [messageId: string] }>()

const { t } = useI18n()
const query = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const searchResults = ref<ChatMessage[]>([])
const searching = ref(false)
let searchRequestId = 0

/** 生成搜索结果的纯文本预览，避免富文本自动回复直接注入页面。 */
const getSearchResultText = (message: ChatMessage) =>
  getChatPlainText(message.text || message.socketContent || message.reply?.preview || '')

/** 监听关键字变化并查询当前客服会话的 IndexedDB 历史记录。 */
watch(query, async value => {
  const keyword = value.trim()
  const requestId = ++searchRequestId
  if (!keyword) {
    searchResults.value = []
    searching.value = false
    return
  }

  searching.value = true
  try {
    const results = await props.searchMessages(keyword)
    if (requestId === searchRequestId) {
      searchResults.value = results
    }
  } finally {
    if (requestId === searchRequestId) {
      searching.value = false
    }
  }
})

/** 搜索层显示后自动聚焦输入框，减少一次额外点击。 */
onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})
</script>
