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

    <!-- 搜索命中后的消息结果列表。 -->
    <div
      v-else-if="filteredResults.length"
      class="min-h-0 flex-1 overflow-y-auto px-[14px] py-[14px]"
    >
      <button
        v-for="result in filteredResults"
        :key="result.id"
        type="button"
        class="flex w-full items-center gap-[12px] border-b border-common-100/[0.04] py-[12px] text-left"
        @click="$emit('locate')"
      >
        <img :src="avatarUrl" alt="" class="size-[50px] shrink-0 rounded-full object-cover" />
        <span class="min-w-0 flex-1">
          <span class="flex items-center justify-between gap-[10px]">
            <strong class="truncate text-[16px] font-medium leading-[19px] text-text-1">{{
              result.name
            }}</strong>
            <time class="shrink-0 text-[12px] text-text-3">{{ result.time }}</time>
          </span>
          <span class="mt-[7px] block truncate text-[14px] leading-[17px] text-text-2">
            {{ result.content }}
          </span>
        </span>
      </button>
      <p class="py-[18px] text-center text-[14px] text-text-3">{{ t('chatPublic.noMore') }}</p>
    </div>

    <!-- 无搜索结果时的空状态。 -->
    <div v-else class="flex flex-1 items-center justify-center pb-[120px]">
      <p class="text-[14px] text-text-3">{{ t('chatPublic.noSearchResults') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import avatarUrl from '@/static/img/chat/public/customer-service-luna.jpg'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import SearchIcon from '@/static/svg/chat/public/search.svg?component'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SEARCH_RESULTS } from '../shared'

defineEmits<{ close: []; locate: [] }>()

const { t } = useI18n()
const query = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

/** 根据用户输入筛选本地静态搜索结果。 */
const filteredResults = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return []

  return SEARCH_RESULTS.filter(item =>
    `${item.name} ${item.content}`.toLowerCase().includes(keyword)
  )
})

/** 搜索层显示后自动聚焦输入框，减少一次额外点击。 */
onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})
</script>
