<template>
  <!-- 客服会话列表滚动容器。 -->
  <div
    class="flex min-h-0 flex-1 flex-col overflow-y-auto"
    :class="props.displayMode === 'pc' ? 'px-0 py-0' : 'px-[14px] py-[14px]'"
  >
    <!-- 有数据时的会话条目列表。 -->
    <div
      v-if="conversations.length"
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
  defineProps<{ conversations: ConversationItemType[]; displayMode?: 'h5' | 'pc' }>(),
  { displayMode: 'h5' }
)
defineEmits<{ select: [conversation: ConversationItemType] }>()
</script>
