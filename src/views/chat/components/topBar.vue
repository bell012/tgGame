<template>
  <!-- 旧版聊天室顶部工具栏。 -->
  <div
    class="fixed left-0 top-0 flex h-[60px] w-full items-center justify-between bg-bg-5 px-4 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)]"
  >
    <!-- 聊天频道选择器。 -->
    <div>
      <button class="bg-bg-1 rounded-lg flex items-center justify-center">
        <span class="text-text-1">Global</span>
        <span class="fill-text-1 w-5 h-5 flex items-center justify-center">
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </button>
    </div>
    <!-- 顶部功能按钮组。 -->
    <div class="flex items-center justify-between">
      <button class="bg-bg-1 rounded-lg flex items-center justify-center">
        <InformIcon class="w-[18px] h-[18px] fill-text-1" />
      </button>
      <button class="bg-bg-1 rounded-lg flex items-center justify-center">
        <img :src="popupShow ? RankCloseIcon : RankIcon" class="w-[18px] h-[18px]" />
      </button>
      <button class="bg-bg-1 rounded-lg flex items-center justify-center">
        <CloseIcon class="h-2.5 w-2.5 text-text-1" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import InformIcon from '@/static/svg/chat/inform.svg?component'
import RankCloseIcon from '@/static/svg/chat/rank_close.webp'
import RankIcon from '@/static/svg/chat/rank.webp'
import { ref } from 'vue'

const popupShow = ref(false)
</script>
<style scoped lang="scss">
.top-nav {
  background-color: var(--color-background-level-5);
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.05);
}
</style>
