<template>
  <!-- PC 任务页：严格对应 Figma 的 1336px 双栏主体。 -->
  <main class="min-h-screen bg-bg-1 pb-10 mt-[16px]">
    <div class="mx-auto flex w-full max-w-[1336px] flex-col gap-4">
      <!-- Figma 页面标题 -->
      <h1 class="h-6 text-xl font-[700] leading-6 text-text-1">{{ props.title }}</h1>

      <div class="flex items-start gap-6">
        <!-- Figma 左侧 280px 栏目导航 -->
        <aside class="flex h-[584px] w-[280px] shrink-0 flex-col gap-2 rounded-[12px] bg-bg-2 p-4">
          <button
            v-for="tab in props.tabs"
            :key="tab.key"
            type="button"
            class="flex h-12 w-full items-center gap-4 rounded-[8px] px-4"
            :class="tab.key === props.activeTabKey ? 'bg-theme-primary text-text-4' : 'text-text-2'"
            @click="$emit('tab-click', tab.key)"
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
          </button>
        </aside>

        <!-- Figma 右侧 1032px 内容区与底部操作按钮共用同一宽度。 -->
        <div class="flex min-w-0 flex-1 shrink-0 flex-col gap-4">
          <TaskPageContent
            mode="pc"
            :tabs="props.tabs"
            :active-tab-key="props.activeTabKey"
            :overview="props.overview"
            :activity="props.activity"
            :tasks="props.tasks"
            :tasks-loading="props.tasksLoading"
            :claiming-task-ids="props.claimingTaskIds"
            :claim-actions-disabled="props.claimActionsDisabled"
            :claim-all-loading="props.claimAllLoading"
            :activity-claiming-value="props.activityClaimingValue"
            @tab-click="$emit('tab-click', $event)"
            @open-task-info="$emit('open-task-info', $event)"
            @go-task="$emit('go-task', $event)"
            @claim="$emit('claim', $event)"
            @claim-all="$emit('claim-all')"
            @claim-activity-chest="$emit('claim-activity-chest', $event)"
          />

          <!-- PC 底部操作按钮位于右侧任务内容区下方。 -->
          <button
            type="button"
            class="box-border flex h-10 w-full shrink-0 items-center justify-center gap-2.5 rounded-lg bg-theme-primary p-2 font-inter"
            :disabled="props.claimAllLoading || props.claimActionsDisabled"
            @click="$emit('claim-all')"
          >
            <span
              class="flex h-4 min-w-0 flex-1 items-center justify-center text-center text-[14px] font-[700] leading-[17px] text-text-4"
            >
              <span
                v-if="props.claimAllLoading"
                class="size-4 animate-spin rounded-full border-2 border-text-4/30 border-t-text-4"
                :aria-label="t('taskCenter.loading')"
              ></span>
              <template v-else>{{ t('taskCenter.claimAll') }}</template>
            </span>
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import newSideIcons from '@/static/svg/side/newIcon'
import { useI18n } from 'vue-i18n'
import TaskPageContent from './components/TaskPageContent.vue'
import type {
  TaskActivityData,
  TaskActivityNode,
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
  activity: TaskActivityData | null
  tasks: TaskViewItem[]
  tasksLoading: boolean
  claimingTaskIds?: string[]
  claimActionsDisabled?: boolean
  claimAllLoading?: boolean
  activityClaimingValue?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  claimingTaskIds: () => [],
  claimActionsDisabled: false,
  claimAllLoading: false,
  activityClaimingValue: null
})
const { t } = useI18n()

defineEmits<{
  'tab-click': [value: TaskTabKey]
  'open-task-info': [task: TaskViewItem]
  'go-task': [task: TaskViewItem]
  claim: [task: TaskViewItem]
  'claim-all': []
  'claim-activity-chest': [node: TaskActivityNode]
}>()
</script>
