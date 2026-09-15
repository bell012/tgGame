<template>
  <div>
    <!-- H5 任务页 -->
    <div v-if="isMobile" class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden">
      <!-- Figma 顶部导航栏 -->
      <H5Header title="Task" />

      <!-- H5 页面滚动内容 -->
      <div class="flex-1 overflow-y-auto">
        <TaskPageContent
          mode="mobile"
          :tabs="taskTabs"
          :active-tab-key="activeTaskTabKey"
          :overview="taskOverview"
          :activity="taskActivity"
          :tasks="visibleTaskItems"
          :tasks-loading="taskListLoading"
          @tab-click="handleTaskTabClick"
        />
      </div>
    </div>

    <!-- PC 任务页 -->
    <PcLayout
      v-else
      title="Task"
      :tabs="taskTabs"
      :active-tab-key="activeTaskTabKey"
      :overview="taskOverview"
      :activity="taskActivity"
      :tasks="visibleTaskItems"
      :tasks-loading="taskListLoading"
      @tab-click="handleTaskTabClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Api from '@/api'
import type {
  EntrantTaskItem,
  GameTaskConfigItem,
  MemberActiveValueResult,
  MemberTaskItem
} from '@/api/interface/task-center'
import H5Header from '@/components/common/H5Header.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLocaleStore } from '@/stores/locale'
import { getLanguageCode } from '@/utils/locale'
import TaskPageContent from './components/TaskPageContent.vue'
import PcLayout from './pc-layout.vue'
import {
  createTaskActivityData,
  createTaskActivityReset,
  createEntrantTaskViewItems,
  createGeneralTaskViewItems,
  createMemberTaskViewItems,
  createTaskTabs,
  createTaskTodayTimeRange,
  type TaskActivityData,
  type TaskOverviewData,
  type TaskTabKey
} from './shared'

const isMobile = useIsMobile()
const localeStore = useLocaleStore()
const { currentCurrencyCode } = useDisplayCurrency()

/** 保存后台任务栏目原始配置，语言变化时可重新计算名称。 */
const taskConfigs = ref<GameTaskConfigItem[]>([])

/** 任务页当日统计初始值，接口返回后替换为真实金额。 */
const taskOverview = ref<TaskOverviewData>({
  deposit: '0.00',
  validBets: '0.00'
})

/** 活动度数据未返回前保持空值，由页面展示骨架屏。 */
const taskActivity = ref<TaskActivityData | null>(null)

/** 保存新人固定任务原始数据，供 General 与新人福利栏目共用。 */
const entrantTasks = ref<EntrantTaskItem[]>([])

/** 保存会员任务原始数据，供 General 与动态栏目共用。 */
const memberTasks = ref<MemberTaskItem[]>([])

/** 任务列表首次请求期间展示骨架屏，避免使用 Figma 示例卡片。 */
const taskListLoading = ref(true)

/** 当前选中栏目默认固定为 General。 */
const activeTaskTabKey = ref<TaskTabKey>('general')

/** 保存活动度接口原始结果，供倒计时每秒刷新时复用。 */
const memberActiveValue = ref<MemberActiveValueResult | null>(null)

/** 保存活动度倒计时定时器，离开页面时必须清理。 */
let taskActivityResetTimer: ReturnType<typeof setInterval> | undefined

/** 获取当前页面语言对应的后台任务语言代码。 */
const currentTaskLanguageCode = computed(() => getLanguageCode(localeStore.currentLanguage))

/** H5 与 PC 共用同一份已排序、已本地化的栏目数据。 */
const taskTabs = computed(() =>
  createTaskTabs(taskConfigs.value, currentTaskLanguageCode.value, entrantTasks.value.length > 0)
)

/** 将新人固定任务转换为卡片数据。 */
const entrantTaskItems = computed(() =>
  createEntrantTaskViewItems(entrantTasks.value, currentTaskLanguageCode.value)
)

/** 将会员任务转换为卡片数据。 */
const memberTaskItems = computed(() =>
  createMemberTaskViewItems(memberTasks.value, currentTaskLanguageCode.value)
)

/** 根据当前栏目筛选任务：General 合并、新人福利仅 entrant、其他栏目仅 member。 */
const visibleTaskItems = computed(() => {
  if (activeTaskTabKey.value === 'general') {
    return createGeneralTaskViewItems(entrantTaskItems.value, memberTaskItems.value)
  }

  const activeTab = taskTabs.value.find(tab => tab.key === activeTaskTabKey.value)

  if (activeTab?.isEntrant) {
    return entrantTaskItems.value
  }

  if (!activeTab?.columnCode) {
    return []
  }

  return memberTaskItems.value.filter(task => task.columnCodes.includes(activeTab.columnCode!))
})

/** 配置刷新后若当前栏目不再存在，安全地回退到 General。 */
watch(
  taskTabs,
  tabs => {
    if (!tabs.some(tab => tab.key === activeTaskTabKey.value)) {
      activeTaskTabKey.value = 'general'
    }
  },
  { immediate: true }
)

/** 进入任务页时获取游戏任务栏目配置。 */
const fetchTaskConfigs = async () => {
  try {
    taskConfigs.value = await Api.taskCenter.getGameTaskConfig({ showErrorToast: false })
  } catch {
    // 请求失败时保留固定 General，避免导航区域为空。
    taskConfigs.value = []
  }
}

/** 查询新人固定任务与会员任务，任一接口失败不影响另一类任务展示。 */
const fetchTaskLists = async () => {
  taskListLoading.value = true

  const queryForm = {
    page: {
      current: 1,
      size: 1000
    },
    currency: currentCurrencyCode.value
  }
  const [entrantResult, memberResult] = await Promise.allSettled([
    Api.taskCenter.queryEntrantTasks(queryForm, { showErrorToast: false }),
    Api.taskCenter.queryMemberTasks(queryForm, { showErrorToast: false })
  ])

  entrantTasks.value = entrantResult.status === 'fulfilled' ? entrantResult.value : []
  memberTasks.value = memberResult.status === 'fulfilled' ? memberResult.value : []
  taskListLoading.value = false
}

/** 切换当前任务栏目。 */
const handleTaskTabClick = (tabKey: TaskTabKey) => {
  activeTaskTabKey.value = tabKey
}

/** 保留后台金额原始精度，避免截断或四舍五入。 */
const formatTaskOverviewAmount = (value: unknown) => {
  if (value === null || value === undefined) {
    return '0'
  }

  const amountText = String(value).trim()

  return amountText && Number.isFinite(Number(amountText)) ? amountText : '0'
}

/** 查询当前账户当天的存款总额与有效投注总额。 */
const fetchTaskOverview = async () => {
  try {
    const overview = await Api.taskCenter.queryMemberDataOverview({
      ...createTaskTodayTimeRange(),
      currency: currentCurrencyCode.value
    })

    taskOverview.value = {
      deposit: formatTaskOverviewAmount(overview.depositAmount),
      validBets: formatTaskOverviewAmount(overview.betAmount)
    }
  } catch {
    // 概览请求失败时保留 0.00，避免展示不准确的示例金额。
    taskOverview.value = {
      deposit: '0.00',
      validBets: '0.00'
    }
  }
}

/** 根据已缓存的活动度重置类型更新当前倒计时。 */
const refreshTaskActivityReset = () => {
  if (!taskActivity.value || !memberActiveValue.value) {
    return
  }

  taskActivity.value = {
    ...taskActivity.value,
    reset: createTaskActivityReset(memberActiveValue.value.resetType)
  }
}

/** 启动活动度倒计时的每秒刷新，避免重复创建定时器。 */
const startTaskActivityResetTimer = () => {
  if (taskActivityResetTimer) {
    clearInterval(taskActivityResetTimer)
  }

  taskActivityResetTimer = setInterval(refreshTaskActivityReset, 1_000)
}

/** 清理活动度倒计时定时器，避免离开页面后持续执行。 */
const clearTaskActivityResetTimer = () => {
  if (!taskActivityResetTimer) {
    return
  }

  clearInterval(taskActivityResetTimer)
  taskActivityResetTimer = undefined
}

/** 查询当前会员的活动度及可领取宝箱档位。 */
const fetchMemberActiveValue = async () => {
  try {
    memberActiveValue.value = await Api.taskCenter.queryMemberActiveValue({ showErrorToast: false })
    taskActivity.value = createTaskActivityData(memberActiveValue.value)
    startTaskActivityResetTimer()
  } catch {
    // 请求失败不回退到示例数据，继续显示骨架屏。
    taskActivity.value = null
    memberActiveValue.value = null
    clearTaskActivityResetTimer()
  }
}

onMounted(() => {
  void fetchTaskConfigs()
  void fetchTaskLists()
  void fetchTaskOverview()
  void fetchMemberActiveValue()
})

onBeforeUnmount(() => {
  clearTaskActivityResetTimer()
})
</script>
