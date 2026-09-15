<template>
  <div>
    <!-- H5 静态任务页 -->
    <div v-if="isMobile" class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden">
      <!-- Figma 顶部导航栏 -->
      <H5Header title="Task" />

      <!-- H5 页面滚动内容 -->
      <div class="flex-1 overflow-y-auto">
        <TaskPageContent
          mode="mobile"
          :tabs="taskFigmaTabs"
          active-tab-key="general"
          :overview="taskFigmaOverview"
          :activity="taskFigmaActivity"
          :tasks="taskFigmaItems"
        />
      </div>
    </div>

    <!-- PC 静态任务页 -->
    <PcLayout
      v-else
      title="Task"
      :tabs="taskFigmaTabs"
      active-tab-key="general"
      :overview="taskFigmaOverview"
      :activity="taskFigmaActivity"
      :tasks="taskFigmaItems"
    />
  </div>
</template>

<script setup lang="ts">
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import TaskPageContent from './components/TaskPageContent.vue'
import PcLayout from './pc-layout.vue'
import { taskFigmaActivity, taskFigmaItems, taskFigmaOverview, taskFigmaTabs } from './shared'

const isMobile = useIsMobile()
</script>
