<template>
  <div class="mb-3.5 grid grid-cols-2 gap-0.5 rounded-[10px] bg-bg-2 p-0.5">
    <button
      type="button"
      class="h-[40px] rounded-[8px] text-[14px] font-[700] transition-all"
      :class="
        activeTab === 'create'
          ? 'bg-bg-3 text-text-1'
          : 'bg-transparent text-text-2 hover:text-text-1'
      "
      @click="emit('change', 'create')"
    >
      创建反馈
    </button>
    <button
      type="button"
      class="h-[40px] rounded-[8px] text-[14px] font-[700] transition-all"
      :class="
        activeTab === 'mine'
          ? 'bg-bg-3 text-text-1'
          : 'bg-transparent text-text-2 hover:text-text-1'
      "
      @click="emit('change', 'mine')"
    >
      我的反馈
    </button>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackTab } from '../types'

// 仅负责标签切换展示，业务状态仍由父组件统一维护。
defineProps<{
  activeTab: FeedbackTab
}>()

const emit = defineEmits<{
  change: [tab: FeedbackTab]
}>()
</script>
