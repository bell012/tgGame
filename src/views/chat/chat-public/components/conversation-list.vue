<template>
  <!-- 客服会话列表滚动容器。 -->
  <div
    class="flex min-h-0 flex-1 flex-col overflow-y-auto"
    :class="props.displayMode === 'pc' ? 'px-0 py-0' : 'px-[14px] py-[14px]'"
  >
    <!-- 在线客服接口请求期间的会话列表骨架。 -->
    <div
      v-if="props.loading"
      aria-busy="true"
      class="flex flex-col animate-pulse"
      :class="props.displayMode === 'pc' ? 'gap-0' : 'gap-[10px] pb-4'"
    >
      <!-- 与实际客服会话行保持相同的 H5/PC 尺寸结构。 -->
      <div
        v-for="index in props.displayMode === 'pc' ? 6 : 5"
        :key="`conversation-skeleton-${index}`"
        class="flex w-full items-center"
        :class="
          props.displayMode === 'pc'
            ? 'h-[60px] gap-[10px]    px-[10px] py-[10px]'
            : 'min-h-[75px] gap-[15px] rounded-[10px] bg-bg-2 px-[10px] py-[10px]'
        "
      >
        <span
          class="shrink-0 rounded-full bg-opacity-6"
          :class="props.displayMode === 'pc' ? 'size-[40px]' : 'size-[55px] rounded-[9px]'"
        />
        <span class="min-w-0 flex-1">
          <i class="block h-[14px] w-[45%] rounded-[4px] bg-opacity-6" />
          <i class="mt-[10px] block h-[12px] w-[75%] rounded-[4px] bg-opacity-6" />
        </span>
        <i class="h-[12px] w-[28px] rounded-[4px] bg-opacity-6" />
      </div>
    </div>

    <!-- 有数据时的会话条目列表。 -->
    <div
      v-else-if="conversations.length"
      class="flex flex-col"
      :class="props.displayMode === 'pc' ? 'gap-0 pb-0' : 'gap-[10px] pb-4'"
    >
      <ConversationItem
        v-for="conversation in conversations"
        :key="conversation.id"
        :display-mode="props.displayMode"
        :conversation="conversation"
        @select="$emit('select', $event)"
      />
    </div>
    <!-- 无可用客服时显示主题空状态。 -->
    <EmptyState v-else :display-mode="props.displayMode" />
  </div>
</template>

<script setup lang="ts">
import type { ConversationItem as ConversationItemType } from '../types'
import ConversationItem from './conversation-item.vue'
import EmptyState from './empty-state.vue'

const props = withDefaults(
  defineProps<{
    conversations: ConversationItemType[]
    loading?: boolean
    displayMode?: 'h5' | 'pc'
  }>(),
  { loading: false, displayMode: 'h5' }
)
defineEmits<{ select: [conversation: ConversationItemType] }>()
</script>
