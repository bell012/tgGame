<template>
  <!-- 消息搜索全屏覆盖层。 -->
  <section
    class="z-[110] flex flex-col bg-bg-1"
    :class="props.displayMode === 'pc' ? 'absolute inset-0' : 'fixed inset-0'"
  >
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
          class="min-w-0 flex-1 bg-transparent text-[14px] text-text-1 outline-none placeholder:text-text-2 [&::-webkit-search-cancel-button]:appearance-none"
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

    <!-- 未输入关键字时按端区分定位的提示文案。 -->
    <p
      v-if="!query"
      class="absolute left-1/2 text-center font-[400]"
      :class="
        props.displayMode === 'pc'
          ? 'top-1/2 w-[186px] -translate-x-1/2 -translate-y-[362px] text-[14px] leading-[20px] text-common-100'
          : 'top-[233.67px] w-[162px] -translate-x-1/2 text-[12px] leading-[14.67px] text-text-3'
      "
    >
      {{ t('chatPublic.searchHint') }}
    </p>

    <!-- 搜索命中后的当前会话历史结果列表。 -->
    <div
      v-else-if="searchResults.length"
      class="min-h-0 flex-1 overflow-y-auto px-[14px] py-[20px]"
    >
      <section
        class="mx-auto flex flex-col"
        :class="props.displayMode === 'pc' ? 'w-[356px] gap-[10px]' : 'min-w-[0px] gap-[20px]'"
      >
        <!-- 单条搜索结果：头像、昵称、消息预览、时间与分割线。 -->
        <div
          v-for="result in searchResults"
          :key="result.id"
          class="flex flex-col items-end"
          :class="props.displayMode === 'pc' ? 'gap-[16px]' : 'gap-[17px]'"
        >
          <button
            type="button"
            class="flex w-full items-center text-left"
            :class="props.displayMode === 'pc' ? 'h-[40px] gap-[10px]' : 'h-[42.67px] gap-[9px]'"
            @click="$emit('locate', result.id, query.trim())"
          >
            <!-- 每条结果展示该消息发送者的头像，接口未返回时使用本地默认头像。 -->
            <span class="size-[40px] shrink-0 overflow-hidden rounded-full">
              <img
                :src="resolveChatMediaUrl(result.authorAvatar) || avatarUrl"
                alt=""
                class="size-full object-cover"
              />
            </span>

            <!-- 昵称、消息预览与时间。 -->
            <span
              class="flex min-w-0 flex-1 items-start"
              :class="props.displayMode === 'pc' ? 'gap-[10px]' : 'gap-[2px]'"
            >
              <span
                class="flex min-w-0 flex-1 flex-col items-start"
                :class="props.displayMode === 'pc' ? 'gap-[4px]' : 'gap-[10px]'"
              >
                <strong
                  class="max-w-full truncate text-text-1"
                  :class="
                    props.displayMode === 'pc'
                      ? 'text-[14px] font-[700] leading-[17px]'
                      : 'text-[15px] font-[500] leading-[18px]'
                  "
                >
                  {{
                    decodeAuthorName(result.authorName) ||
                    (result.direction === 'outgoing'
                      ? t('chatPublic.you')
                      : t('chatPublic.customerServiceList'))
                  }}
                </strong>
                <!-- 搜索结果内容，并高亮当前匹配的关键字。 -->
                <span
                  class="w-full truncate text-text-2"
                  :class="
                    props.displayMode === 'pc'
                      ? 'text-[12px] font-[400] leading-[15px]'
                      : 'text-[12px] font-[400] leading-[14.67px]'
                  "
                >
                  <template
                    v-for="(part, index) in getChatTextHighlightParts(
                      getSearchResultText(result),
                      query
                    )"
                    :key="index"
                  >
                    <span :class="part.matched ? 'text-theme-primary' : ''">{{ part.text }}</span>
                  </template>
                </span>
              </span>
              <time
                class="shrink-0 whitespace-nowrap text-text-3"
                :class="
                  props.displayMode === 'pc'
                    ? 'text-[12px] font-[400] leading-[15px]'
                    : 'text-[12px] font-[400] leading-[14.67px]'
                "
              >
                {{ formatChatMessageTime(result.timestamp) }}
                {{ getChatTimePeriod(result.timestamp) }}
              </time>
            </span>
          </button>

          <!-- 搜索结果分割线。 -->
          <span
            class="h-px bg-opacity-6"
            :class="props.displayMode === 'pc' ? 'w-[306px]' : 'w-[298px]'"
          ></span>
        </div>

        <!-- PC 设计稿在结果列表末尾展示结束文案。 -->
        <p
          v-if="props.displayMode === 'pc'"
          class="w-full text-center text-[12px] font-[400] leading-[15px] text-text-3"
        >
          {{ t('chatPublic.noMore') }}
        </p>
      </section>
    </div>

    <!-- 搜索请求结束后无结果时的主题空状态。 -->
    <div v-else class="flex flex-1 items-center justify-center">
      <span
        v-if="searching"
        class="size-7 animate-spin rounded-full border-2 border-opacity-15 border-t-theme-primary"
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
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import avatarUrl from '@/static/img/chat/public/customer-service-luna.jpg'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import SearchIcon from '@/static/svg/chat/public/search.svg?component'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatChatMessageTime,
  getChatPlainText,
  getChatTextHighlightParts,
  getChatTimePeriod,
  resolveChatMediaUrl
} from '../shared'
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

defineEmits<{ close: []; locate: [messageId: string, keyword: string] }>()

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
const decodeAuthorName = (name?: string) => {
  if (!name) return ''

  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}
/** 搜索层显示后自动聚焦输入框，减少一次额外点击。 */
onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})
</script>
