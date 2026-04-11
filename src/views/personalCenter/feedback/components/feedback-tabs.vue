<template>
  <div v-if="isPcMode" class="mb-3.5 border-b border-[rgba(255,255,255,0.08)]">
    <div class="grid grid-cols-2">
      <button
        type="button"
        class="feedback-tab-pc-button"
        :class="{ 'feedback-tab-pc-button-active': activeTab === 'create' }"
        @click="emit('change', 'create')"
      >
        创建反馈
      </button>
      <button
        type="button"
        class="feedback-tab-pc-button"
        :class="{ 'feedback-tab-pc-button-active': activeTab === 'mine' }"
        @click="emit('change', 'mine')"
      >
        我的反馈
      </button>
    </div>
  </div>

  <div v-else class="mb-3.5 grid grid-cols-2 gap-0.5 rounded-[10px] bg-bg-2 p-0.5">
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
  isPcMode?: boolean
}>()

const emit = defineEmits<{
  change: [tab: FeedbackTab]
}>()
</script>

<style scoped>
.feedback-tab-pc-button {
  position: relative;
  height: 52px;
  border: none;
  background: transparent;
  color: var(--color-text-level-3);
  font-size: 31rpx;
  font-weight: 700;
  transition: color 0.2s ease;
}

.feedback-tab-pc-button-active {
  color: var(--color-text-level-1);
}

.feedback-tab-pc-button-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  height: 3px;
  width: 100%;
  border-radius: 9999px;
  background: var(--color-theme-level-1);
  transform: translateX(-50%);
}
</style>
