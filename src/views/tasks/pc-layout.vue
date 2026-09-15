<template>
  <!-- PC 任务页：严格对应 Figma 的 1336px 双栏主体。 -->
  <main class="min-h-screen bg-bg-1 pb-10 pt-20">
    <div class="mx-auto flex w-full max-w-[1336px] flex-col gap-4">
      <!-- Figma 页面标题 -->
      <h1 class="h-6 text-xl font-[700] leading-6 text-text-1">{{ props.title }}</h1>

      <div class="flex items-start gap-6">
        <!-- Figma 左侧 280px 栏目导航 -->
        <aside class="flex h-[584px] w-[280px] shrink-0 flex-col gap-2 rounded-[12px] bg-bg-2 p-4">
          <div
            v-for="tab in props.tabs"
            :key="tab.key"
            class="flex h-12 w-full items-center gap-4 rounded-[8px] px-4"
            :class="tab.key === props.activeTabKey ? 'bg-theme-primary text-text-4' : 'text-text-2'"
          >
            <!-- 复用项目现有栏目图标。 -->
            <component
              :is="newSideIcons[tab.iconKey]"
              class="h-6 w-6 shrink-0"
              :class="tab.key === props.activeTabKey ? 'brightness-0' : ''"
            />
            <span
              class="font-[400] text-base leading-[19px]"
              :class="tab.key === props.activeTabKey ? 'font-[700] text-text-4' : 'text-text-2'"
            >
              {{ tab.label }}
            </span>
          </div>
        </aside>

        <!-- Figma 右侧 1032px 内容区 -->
        <TaskPageContent
          mode="pc"
          class="w-[1032px] shrink-0"
          :tabs="props.tabs"
          :active-tab-key="props.activeTabKey"
          :overview="props.overview"
          :activity="props.activity"
          :tasks="props.tasks"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import newSideIcons from '@/static/svg/side/newIcon'
import TaskPageContent from './components/TaskPageContent.vue'
import type {
  TaskActivityData,
  TaskOverviewData,
  TaskTabItem,
  TaskTabKey,
  TaskViewItem
} from './shared'

interface Props {
  title: string
  tabs: TaskTabItem[]
  activeTabKey: TaskTabKey
  overview: TaskOverviewData
  activity: TaskActivityData
  tasks: TaskViewItem[]
}

const props = defineProps<Props>()
</script>
