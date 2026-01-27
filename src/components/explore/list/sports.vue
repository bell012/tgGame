<template>
  <div class="flex flex-col w-full overflow-hidden">
    <!-- 1. 标题栏 -->
    <div class="flex items-center justify-between mb-2.5 mt-2.5">
      <div class="font-bold text-text-1 text-sm">足球</div>
      <div
        class="px-2 py-1 bg-[var(--color-background-level-3)] flex items-center rounded-md cursor-pointer"
      >
        <div class="text-xs text-text-1 font-[700] mr-1">{{ t('locales.search.all') }}</div>
        <RightArrow class="w-2 h-2 fill-none stroke-text-1" />
      </div>
    </div>
    <!-- 2. 横向滚动容器 -->
    <!-- snap-x snap-mandatory: 开启滚动捕捉 -->
    <div class="flex overflow-x-auto snap-x snap-mandatory gap-3 px-0 scroll-container">
      <!-- 3. 单个卡片模块 -->
      <!-- w-[calc(100vw-28px)]:显示一屏 -->
      <!-- snap-start: 停止滚动时自动居左对齐 -->
      <div
        v-for="inx in 6"
        :key="inx"
        class="w-full flex-none lg:w-1/2 xl:w-1/3 shrink-0 snap-start px-2.5 py-2.5 flex flex-col bg-[var(--color-background-level-2)] rounded-lg"
      >
        <!-- 卡片顶部：联赛信息 -->
        <div class="flex items-center justify-between mb-2.5">
          <div class="text-text-1 text-xs font-bold flex items-center truncate mr-2">
            <span>足球</span>
            <span class="w-1 h-1 rounded-full bg-[var(--color-text-level-1)] mx-1"></span>
            <span>Bengal Super League</span>
          </div>
          <!-- 现场标签 -->
          <div
            class="px-1 py-[3px] rounded bg-[var(--color-secondary-level-3)] text-[10px] font-bold flex items-center"
          >
            <PlayIcon class="w-2.5 h-2.5" />
            <span class="ml-0.5 text-xs font-bold text-theme-primary">现场</span>
          </div>
        </div>

        <!-- 卡片中部：对阵信息 -->
        <div class="flex items-center my-2.5 px-2 justify-between">
          <!-- 队 A -->
          <div class="flex flex-col items-center w-1/3">
            <img src="@/static/img/explore/a.png" class="w-9 h-9 mb-2" />
            <div
              class="text-text-1 text-xs font-bold text-center leading-tight break-words line-clamp-2"
            >
              JHR Royal City FC
            </div>
          </div>

          <!-- 比分/时间 -->
          <div class="flex flex-col items-center w-1/3">
            <div class="text-text-1 text-lg font-bold mb-2.5">1&nbsp;:&nbsp;1</div>
            <div class="text-text-2 text-xs">上半场</div>
          </div>

          <!-- 队 B -->
          <div class="flex flex-col items-center w-1/3">
            <img src="@/static/img/explore/b.png" class="w-9 h-9 mb-2" />

            <div
              class="text-text-1 text-xs font-bold text-center leading-tight break-words line-clamp-2"
            >
              Howrah Hooghly Warriors
            </div>
          </div>
        </div>

        <!-- 卡片底部：赔率按钮 -->
        <div class="grid grid-cols-4 gap-2 mt-2.5">
          <div
            class="px-4.5 bg-[var(--color-secondary-level-1)] rounded-lg flex items-center justify-center text-xs font-bold py-2.5"
          >
            <span class="text-text-1 mr-1.5">1</span>
            <span class="text-[var(--color-secondary-level-2)]">2.35</span>
          </div>
          <div
            class="px-4.5 bg-[var(--color-secondary-level-1)] rounded-lg flex items-center justify-center text-xs font-bold py-2.5"
          >
            <span class="text-text-1 mr-1.5">平局</span>
            <span class="text-[var(--color-secondary-level-2)]">2.65</span>
          </div>
          <div
            class="px-4.5 bg-[var(--color-secondary-level-1)] rounded-lg flex items-center justify-center text-xs font-bold py-2.5"
          >
            <span class="text-text-1 mr-1.5">2</span>
            <span class="text-[var(--color-secondary-level-2)]">3.4</span>
          </div>
          <div
            class="px-4.5 bg-[var(--color-opacity-6)] rounded-lg flex items-center justify-center text-xs font-bold py-2.5"
          >
            +4
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'
import PlayIcon from '@/static/svg/explore/play.svg?component'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
<style lang="scss" scoped>
/* 适用于特定元素的滚动条 */
.scroll-container {
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-background-level-2) var(--color-background-level-1);
}
</style>
