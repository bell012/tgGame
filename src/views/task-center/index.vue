<template>
  <div>
    <!-- H5 任务页 -->
    <div v-if="isMobile" class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden">
      <!-- Figma 顶部导航栏 -->
      <H5Header :title="t('taskCenter.pageTitle')" />

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
          :claiming-task-ids="claimingTaskIdList"
          :claim-actions-disabled="isClaimProcessing"
          :claim-all-loading="isClaimAllLoading"
          :activity-claiming-value="activityClaimingValue"
          @tab-click="handleTaskTabClick"
          @open-task-info="handleOpenTaskInfo"
          @go-task="handleGoToTask"
          @claim="handleTaskClaim"
          @claim-all="handleClaimAll"
          @claim-activity-chest="handleActivityChestClaim"
        />
      </div>
    </div>

    <!-- PC 任务页 -->
    <PcLayout
      v-else
      :title="t('taskCenter.pageTitle')"
      :tabs="taskTabs"
      :active-tab-key="activeTaskTabKey"
      :overview="taskOverview"
      :activity="taskActivity"
      :tasks="visibleTaskItems"
      :tasks-loading="taskListLoading"
      :claiming-task-ids="claimingTaskIdList"
      :claim-actions-disabled="isClaimProcessing"
      :claim-all-loading="isClaimAllLoading"
      :activity-claiming-value="activityClaimingValue"
      @tab-click="handleTaskTabClick"
      @open-task-info="handleOpenTaskInfo"
      @go-task="handleGoToTask"
      @claim="handleTaskClaim"
      @claim-all="handleClaimAll"
      @claim-activity-chest="handleActivityChestClaim"
    />

    <!-- 当前点击任务对应的说明弹窗。 -->
    <TaskInfoPopup
      v-model:visible="showTaskInfoPopup"
      :mode="isMobile ? 'mobile' : 'pc'"
      :task="selectedTaskInfo"
      :claim-loading="selectedTaskInfo ? claimingTaskIds.has(selectedTaskInfo.id) : false"
      :claim-actions-disabled="isClaimProcessing"
      @go-task="handleGoToTask"
      @claim="handleTaskClaim"
    />

    <!-- 阶梯任务存在更高未完成档位时的领取二次确认。 -->
    <TaskTierClaimReminderPopup
      v-model:visible="showTierClaimReminder"
      :mode="isMobile ? 'mobile' : 'pc'"
      @confirm="handleTierClaimReminderConfirm"
    />

    <!-- 领取接口成功后展示的任务中心专用奖励提示。 -->
    <TaskClaimSuccessToast
      v-if="taskClaimSuccessToast"
      :visible="true"
      :mode="isMobile ? 'mobile' : 'pc'"
      :bonus-amount="taskClaimSuccessToast.bonusAmount"
      :activity-points="taskClaimSuccessToast.activityPoints"
      @update:visible="handleTaskClaimSuccessToastVisibilityChange"
    />

    <!-- 活动度宝箱领取成功后复用意见反馈的成功弹窗视觉。 -->
    <FeedbackClaimSuccessPopup
      :show="showActivityClaimSuccessPopup"
      :claim-success-amount="activityClaimSuccessAmount"
      :feedback-star-icon="feedbackStarIcon"
      :feedback-ellipse-icon="feedbackEllipseIcon"
      :feedback-bow-icon="feedbackBowIcon"
      @close="handleCloseActivityClaimSuccessPopup"
    />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  EntrantTaskItem,
  EntrantTaskScheduleItem,
  GameTaskConfigItem,
  MemberActiveValueResult,
  MemberTaskItem,
  TaskScheduleItem
} from '@/api/interface/task-center'
import H5Header from '@/components/common/H5Header.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useIsMobile } from '@/composables/useMediaQuery'
import feedbackBowIcon from '@/static/svg/feedback/hdj.svg?url'
import feedbackEllipseIcon from '@/static/svg/feedback/ellipse.svg?url'
import feedbackStarIcon from '@/static/svg/feedback/star.svg?url'
import { useLocaleStore } from '@/stores/locale'
import { getCurrencySymbol, getLanguageCode } from '@/utils/locale'
import { globalShowToast } from '@/utils/toast'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FeedbackClaimSuccessPopup from '../personalCenter/feedback/components/feedback-claim-success-popup.vue'
import TaskClaimSuccessToast from './components/TaskClaimSuccessToast.vue'
import TaskInfoPopup from './components/TaskInfoPopup.vue'
import TaskPageContent from './components/TaskPageContent.vue'
import TaskTierClaimReminderPopup from './components/TaskTierClaimReminderPopup.vue'
import PcLayout from './pc-layout.vue'
import {
  createEntrantTaskViewItems,
  createGeneralTaskViewItems,
  createMemberTaskViewItems,
  createTaskActivityData,
  createTaskActivityReset,
  createTaskTabs,
  createTaskTodayTimeRange,
  type TaskActivityData,
  type TaskActivityNode,
  type TaskInfoPopupData,
  type TaskOverviewData,
  type TaskTabKey,
  type TaskViewItem
} from './shared'
import { executeTaskCenterGoToTask } from './taskCenterNavigation'

const isMobile = useIsMobile()
const localeStore = useLocaleStore()
const { currentCurrencyCode } = useDisplayCurrency()
const { t } = useI18n()

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

/** 保存新人固定任务完成状态，独立用于新人福利进度计算。 */
const entrantTaskSchedules = ref<EntrantTaskScheduleItem[]>([])

/** 保存普通任务条件进度，独立用于普通任务进度计算。 */
const memberTaskSchedules = ref<TaskScheduleItem[]>([])

/** 任务列表首次请求期间展示骨架屏，避免使用 Figma 示例卡片。 */
const taskListLoading = ref(true)

/** 当前选中栏目默认固定为 General。 */
const activeTaskTabKey = ref<TaskTabKey>('general')

/** 控制当前任务的说明弹窗显示状态。 */
const showTaskInfoPopup = ref(false)

/** 控制阶梯任务领取前的二次确认弹窗。 */
const showTierClaimReminder = ref(false)

/** 任务中心领取成功提示所需的真实奖励数据。 */
const taskClaimSuccessToast = ref<{
  bonusAmount: string
  activityPoints?: string
} | null>(null)

/** 保存用户点击的任务说明数据，供 H5 与 PC 弹窗共用。 */
const selectedTaskInfo = ref<TaskInfoPopupData | null>(null)

/** 暂存需要二次确认的阶梯任务，用户确认后才调用领取接口。 */
const pendingTierClaimTask = ref<TaskViewItem | TaskInfoPopupData | null>(null)

/** 保存正在单独领取的任务 ID，供卡片与说明弹窗展示 loading。 */
const claimingTaskIds = ref<Set<string>>(new Set())

/** 控制一键领取接口 loading，避免和单个领取并发提交。 */
const isClaimAllLoading = ref(false)

/** 保存当前正在领取的活动度档位，用于节点 action 区域 loading。 */
const activityClaimingValue = ref<string | null>(null)

/** 控制活动度宝箱领取成功弹窗。 */
const showActivityClaimSuccessPopup = ref(false)

/** 传入成功弹窗的宝箱奖励金额，包含当前账户币种符号。 */
const activityClaimSuccessAmount = ref('')

/** 保存活动度接口原始结果，供倒计时每秒刷新时复用。 */
const memberActiveValue = ref<MemberActiveValueResult | null>(null)

/** 保存活动度倒计时定时器，离开页面时必须清理。 */
let taskActivityResetTimer: ReturnType<typeof setInterval> | undefined

/** 获取当前页面语言对应的后台任务语言代码。 */
const currentTaskLanguageCode = computed(() => getLanguageCode(localeStore.currentLanguage))

/** 获取当前账户币种对应的项目统一符号。 */
const currentCurrencySymbol = computed(() => getCurrencySymbol(currentCurrencyCode.value))

/** 将 Set 转为数组后传给子组件，使任务卡可响应领取 loading 的变化。 */
const claimingTaskIdList = computed(() => [...claimingTaskIds.value])

/** 任一领取请求进行中时，禁用其他领取入口以避免重复提交。 */
const isClaimProcessing = computed(() => isClaimAllLoading.value || claimingTaskIds.value.size > 0)

/** 为共享栏目数据提供当前语言下的固定栏目文案。 */
const taskCenterTabLabels = computed(() => ({
  general: t('taskCenter.general'),
  entrant: t('taskCenter.entrant')
}))

/** H5 与 PC 共用同一份已排序、已本地化的栏目数据。 */
const taskTabs = computed(() =>
  createTaskTabs(
    taskConfigs.value,
    currentTaskLanguageCode.value,
    entrantTasks.value.length > 0,
    taskCenterTabLabels.value
  )
)

/** 将新人固定任务转换为卡片数据。 */
const entrantTaskItems = computed(() =>
  createEntrantTaskViewItems(
    entrantTasks.value,
    currentTaskLanguageCode.value,
    entrantTaskSchedules.value
  )
)

/** 将会员任务转换为卡片数据。 */
const memberTaskItems = computed(() =>
  createMemberTaskViewItems(
    memberTasks.value,
    currentTaskLanguageCode.value,
    memberTaskSchedules.value
  )
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

/** 查询任务列表及各自进度，任一接口失败不影响其他数据展示。 */
const fetchTaskLists = async () => {
  taskListLoading.value = true

  const queryForm = {
    page: {
      current: 1,
      size: 1000
    },
    currency: currentCurrencyCode.value
  }
  const [entrantResult, memberResult, entrantScheduleResult, memberScheduleResult] =
    await Promise.allSettled([
      Api.taskCenter.queryEntrantTasks(queryForm, { showErrorToast: false }),
      Api.taskCenter.queryMemberTasks(queryForm, { showErrorToast: false }),
      Api.taskCenter.queryEntrantTaskSchedule({ showErrorToast: false }),
      Api.taskCenter.queryTaskSchedule({ showErrorToast: false })
    ])

  entrantTasks.value = entrantResult.status === 'fulfilled' ? entrantResult.value : []
  memberTasks.value = memberResult.status === 'fulfilled' ? memberResult.value : []
  entrantTaskSchedules.value =
    entrantScheduleResult.status === 'fulfilled' ? entrantScheduleResult.value : []
  memberTaskSchedules.value =
    memberScheduleResult.status === 'fulfilled' ? memberScheduleResult.value : []
  taskListLoading.value = false
}

/** 领取新人任务成功后仅刷新新人任务状态，最终展示以后端结果为准。 */
const refreshEntrantTaskSchedules = async () => {
  try {
    entrantTaskSchedules.value = await Api.taskCenter.queryEntrantTaskSchedule({
      showErrorToast: false
    })
  } catch {
    // 刷新失败时保留当前展示状态，避免错误覆盖原有任务数据。
  }
}

/** 领取普通任务成功后仅刷新普通任务进度，最终展示以后端结果为准。 */
const refreshMemberTaskSchedules = async () => {
  try {
    memberTaskSchedules.value = await Api.taskCenter.queryTaskSchedule({ showErrorToast: false })
  } catch {
    // 刷新失败时保留当前展示状态，避免错误覆盖原有任务数据。
  }
}

/** 切换当前任务栏目。 */
const handleTaskTabClick = (tabKey: TaskTabKey) => {
  activeTaskTabKey.value = tabKey
}

/** 打开用户当前点击任务的说明弹窗。 */
const handleOpenTaskInfo = (task: TaskViewItem) => {
  selectedTaskInfo.value = task.popup
  showTaskInfoPopup.value = true
}

/** 根据当前设备形态执行任务中心“去完成”的专用跳转。 */
const handleGoToTask = (task: TaskViewItem | TaskInfoPopupData) => {
  // 任务说明弹窗与注册弹窗共用遮罩层时，必须先关闭前者避免覆盖目标页面。
  showTaskInfoPopup.value = false
  void executeTaskCenterGoToTask(task, { isMobile: isMobile.value })
}

/** 更新指定单领按钮的 loading 集合，确保 Vue 能追踪 Set 的替换。 */
const setTaskClaimLoading = (taskId: string, loading: boolean) => {
  const nextClaimingTaskIds = new Set(claimingTaskIds.value)

  if (loading) {
    nextClaimingTaskIds.add(taskId)
  } else {
    nextClaimingTaskIds.delete(taskId)
  }

  claimingTaskIds.value = nextClaimingTaskIds
}

/** 规范领取金额文本，保留后台金额的原始精度。 */
const formatTaskClaimAmount = (amount: unknown) => String(amount ?? '').trim() || '0'

/** 规范可选活动度文本；接口未提供有效值时不展示活动度奖励行。 */
const formatOptionalActivityPoints = (activityPoints: unknown) => {
  const pointsText = String(activityPoints ?? '').trim()

  return pointsText || undefined
}

/** 展示任务中心专用领取成功提示，而不复用全局单行 Toast。 */
const showTaskClaimSuccessToast = (bonusAmount: unknown, activityPoints?: unknown) => {
  taskClaimSuccessToast.value = {
    bonusAmount: formatTaskClaimAmount(bonusAmount),
    activityPoints: formatOptionalActivityPoints(activityPoints)
  }
}

/** 展示领取接口的后端失败原因，缺省时使用统一的本地化文案。 */
const showTaskClaimError = (message: unknown) => {
  const errorMessage = String(message ?? '').trim() || t('taskCenter.claimFailed')

  globalShowToast({
    message: errorMessage,
    type: 'fail'
  })
}

/** 从请求异常中提取可展示错误信息。 */
const getTaskClaimRequestErrorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : t('taskCenter.claimFailed')

/** 判断当前任务是否具备有效的领取记录 ID。 */
const hasTaskClaimRowId = (task: TaskViewItem | TaskInfoPopupData) => {
  const rowId = task.claimRowId

  return rowId !== undefined && rowId !== null && String(rowId).trim() !== ''
}

/** 执行单个任务的领取请求，并在成功后刷新对应任务进度。 */
const claimSingleTask = async (task: TaskViewItem | TaskInfoPopupData) => {
  if (isClaimProcessing.value || !hasTaskClaimRowId(task)) {
    if (!hasTaskClaimRowId(task)) {
      showTaskClaimError(t('taskCenter.claimRecordMissing'))
    }
    return
  }

  setTaskClaimLoading(task.id, true)

  try {
    if (task.source === 'entrant') {
      const response = await Api.taskCenter.obtainEntrantTaskAmount(
        { rowId: task.claimRowId! },
        { showErrorToast: false }
      )

      if (response.code !== 'C2') {
        showTaskClaimError(response.message)
        return
      }

      showTaskInfoPopup.value = false
      // 当前新人领取接口只返回奖金金额，未返回活动度时不展示活动度奖励行。
      showTaskClaimSuccessToast(response.result)
      await refreshEntrantTaskSchedules()
      return
    }

    const response = await Api.taskCenter.obtainTaskAmount(
      {
        rowId: task.claimRowId!,
        taskType: task.taskType
      },
      { showErrorToast: false }
    )

    if (response.code !== 'C2') {
      showTaskClaimError(response.message)
      return
    }

    showTaskInfoPopup.value = false
    // 普通任务领取接口只返回实际奖金金额，不能使用任务配置 activeNumber 伪造活动度奖励。
    showTaskClaimSuccessToast(response.result)
    await refreshMemberTaskSchedules()
  } catch (error) {
    showTaskClaimError(getTaskClaimRequestErrorMessage(error))
  } finally {
    setTaskClaimLoading(task.id, false)
  }
}

/** 阶梯任务仍有更高未完成档位时先显示奖励提升提醒，其余任务直接领取。 */
const handleTaskClaim = (task: TaskViewItem | TaskInfoPopupData) => {
  if (isClaimProcessing.value) {
    return
  }

  if (task.requiresTierClaimReminder) {
    // 从说明弹窗触发时先关闭该弹窗，避免两个 Dialog 同时展示。
    selectedTaskInfo.value = null
    showTaskInfoPopup.value = false
    pendingTierClaimTask.value = task
    showTierClaimReminder.value = true
    return
  }

  void claimSingleTask(task)
}

/** 用户确认阶梯任务领取后，使用此前暂存的外层任务数据发送单领请求。 */
const handleTierClaimReminderConfirm = () => {
  const task = pendingTierClaimTask.value
  pendingTierClaimTask.value = null

  if (task) {
    void claimSingleTask(task)
  }
}

/** 一键领取全部奖励，成功后刷新新人和普通任务的后端状态。 */
const handleClaimAll = async () => {
  if (isClaimProcessing.value) {
    return
  }

  isClaimAllLoading.value = true

  try {
    const response = await Api.taskCenter.obtainAllBonus({ showErrorToast: false })

    if (response.code !== 'C2') {
      showTaskClaimError(response.message)
      return
    }

    showTaskClaimSuccessToast(response.result)
    await Promise.all([refreshEntrantTaskSchedules(), refreshMemberTaskSchedules()])
  } catch (error) {
    showTaskClaimError(getTaskClaimRequestErrorMessage(error))
  } finally {
    isClaimAllLoading.value = false
  }
}

/** 格式化活动度宝箱奖励金额，保留后台原始金额精度并拼接当前币种符号。 */
const formatActivityGiftBoxBonusAmount = (node: TaskActivityNode) =>
  `${currentCurrencySymbol.value}${String(node.bonusAmount ?? '0').trim() || '0'}`

/** 领取当前可领取的活动度宝箱，并在成功后重新查询后端领取状态。 */
const handleActivityChestClaim = async (node: TaskActivityNode) => {
  if (node.state !== 'claimable' || activityClaimingValue.value) {
    return
  }

  activityClaimingValue.value = String(node.activityValue)

  try {
    const response = await Api.taskCenter.receiveGiftBox(
      { activityValue: node.activityValue },
      { showErrorToast: false }
    )

    if (response.code !== 'C2') {
      showTaskClaimError(response.message)
      return
    }

    activityClaimSuccessAmount.value = formatActivityGiftBoxBonusAmount(node)
    showActivityClaimSuccessPopup.value = true
    await fetchMemberActiveValue()
  } catch (error) {
    showTaskClaimError(getTaskClaimRequestErrorMessage(error))
  } finally {
    activityClaimingValue.value = null
  }
}

/** 关闭活动度宝箱领取成功弹窗。 */
const handleCloseActivityClaimSuccessPopup = () => {
  showActivityClaimSuccessPopup.value = false
}

/** Toast 自动消失后清空任务中心领取成功提示数据。 */
const handleTaskClaimSuccessToastVisibilityChange = (visible: boolean) => {
  if (!visible) {
    taskClaimSuccessToast.value = null
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
  void fetchTaskLists()
  void fetchTaskOverview()
  void fetchMemberActiveValue()
})

onBeforeUnmount(() => {
  clearTaskActivityResetTimer()
})
</script>
