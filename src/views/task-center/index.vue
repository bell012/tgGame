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
          :tabs="taskTabs"
          active-tab-key="general"
          :overview="taskOverview"
          :activity="taskActivity"
          :tasks="taskFigmaItems"
        />
      </div>
    </div>

    <!-- PC 静态任务页 -->
    <PcLayout
      v-else
      title="Task"
      :tabs="taskTabs"
      active-tab-key="general"
      :overview="taskOverview"
      :activity="taskActivity"
      :tasks="taskFigmaItems"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Api from '@/api'
import type { GameTaskConfigItem, MemberActiveValueResult } from '@/api/interface/task-center'
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
  createTaskTabs,
  createTaskTodayTimeRange,
  taskFigmaItems,
  type TaskActivityData,
  type TaskOverviewData
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

/** 保存活动度接口原始结果，供倒计时每秒刷新时复用。 */
const memberActiveValue = ref<MemberActiveValueResult | null>(null)

/** 保存活动度倒计时定时器，离开页面时必须清理。 */
let taskActivityResetTimer: ReturnType<typeof setInterval> | undefined

/** H5 与 PC 共用同一份已排序、已本地化的栏目数据。 */
const taskTabs = computed(() =>
  createTaskTabs(taskConfigs.value, getLanguageCode(localeStore.currentLanguage))
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
  void fetchTaskOverview()
  void fetchMemberActiveValue()
})

onBeforeUnmount(() => {
  clearTaskActivityResetTimer()
})
</script>
