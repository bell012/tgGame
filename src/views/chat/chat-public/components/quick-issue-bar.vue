<template>
  <!-- 可横向滚动的快捷问题栏。 -->
  <div
    class="shrink-0 overflow-x-auto px-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    :class="props.displayMode === 'pc' ? 'flex h-[42px] items-center py-[5px]' : 'py-[8px]'"
  >
    <!-- 快捷问题按钮列表。 -->
    <div class="flex min-w-max" :class="props.displayMode === 'pc' ? 'gap-[6px]' : 'gap-[8px]'">
      <button
        v-for="issue in issues"
        :key="issue.id"
        type="button"
        class="rounded-[6px] bg-bg-2 px-[10px] text-[14px] text-text-2 active:opacity-80"
        :class="props.displayMode === 'pc' ? 'h-[32px]' : 'h-[34px]'"
        @click="$emit('select', issue)"
      >
        {{ t(`chatPublic.${issue.labelKey}`) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { QuickIssue } from '../types'

const { t } = useI18n()

const props = withDefaults(defineProps<{ issues: QuickIssue[]; displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})
defineEmits<{ select: [issue: QuickIssue] }>()
</script>
