import type {
  EntrantTaskItem,
  EntrantTaskScheduleItem,
  GameTaskConfigItem,
  MemberActiveValueResult,
  MemberActiveValueRewardConfigItem,
  MemberTaskItem,
  TaskConditionProgressItem,
  TaskScheduleItem
} from '@/api/interface/task-center'

/** 任务栏目键由后台 columnCode 动态生成。 */
export type TaskTabKey = string

/** Figma 静态栏目展示数据。 */
export interface TaskTabItem {
  key: TaskTabKey
  columnCode?: string
  isEntrant?: boolean
  label: string
  iconKey: string
  mobileWidth: number
}

/** Figma 静态统计数据。 */
export interface TaskOverviewData {
  deposit: string
  validBets: string
}

/** 计算浏览器本地时区当天的起止时间戳。 */
export const createTaskTodayTimeRange = (date = new Date()) => {
  const startDate = new Date(date)
  const endDate = new Date(date)

  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  return {
    startTime: startDate.getTime(),
    endTime: endDate.getTime()
  }
}

/** 活动度奖励节点展示数据。 */
export interface TaskActivityNode {
  action: 'Claimed' | 'Claim' | 'Open'
  activity: string
  state: 'claimed' | 'claimable' | 'locked'
  bonusAmount?: string
  betMultiple?: string
}

/** 活动度奖励区域展示数据。 */
export interface TaskActivityData {
  currentActivity: string
  nodes: TaskActivityNode[]
  reset: {
    days: string
    hours: string
    minutes: string
    seconds: string
  }
}

/** 活动度接口未返回有效重置类型时，保持倒计时为空。 */
const EMPTY_TASK_ACTIVITY_RESET = {
  days: '',
  hours: '',
  minutes: '',
  seconds: ''
}

/** 将倒计时数值补齐为两位文本。 */
const padTaskActivityResetUnit = (value: number) => String(value).padStart(2, '0')

/** 根据重置类型计算下一个活动度周期的结束时间。 */
const createTaskActivityResetDeadline = (resetType: unknown, date: Date) => {
  const normalizedResetType = Number(resetType)
  const resetDate = new Date(date)

  if (normalizedResetType === 1) {
    // 日结：当天 24:00，即次日 00:00。
    resetDate.setDate(resetDate.getDate() + 1)
    resetDate.setHours(0, 0, 0, 0)

    return resetDate
  }

  if (normalizedResetType === 2) {
    // 周结：本周日 24:00，即下周一 00:00。
    const daysUntilNextMonday = resetDate.getDay() === 0 ? 1 : 8 - resetDate.getDay()

    resetDate.setDate(resetDate.getDate() + daysUntilNextMonday)
    resetDate.setHours(0, 0, 0, 0)

    return resetDate
  }

  if (normalizedResetType === 3) {
    // 月结：当月最后一天 24:00，即下月 1 日 00:00。
    resetDate.setMonth(resetDate.getMonth() + 1, 1)
    resetDate.setHours(0, 0, 0, 0)

    return resetDate
  }

  return null
}

/** 根据活动度重置类型生成当前时刻对应的剩余倒计时。 */
export const createTaskActivityReset = (resetType: unknown, date = new Date()) => {
  const deadline = createTaskActivityResetDeadline(resetType, date)

  if (!deadline) {
    return EMPTY_TASK_ACTIVITY_RESET
  }

  const remainingMilliseconds = Math.max(0, deadline.getTime() - date.getTime())
  const remainingSeconds = Math.floor(remainingMilliseconds / 1000)
  const days = Math.floor(remainingSeconds / 86_400)
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600)
  const minutes = Math.floor((remainingSeconds % 3_600) / 60)
  const seconds = remainingSeconds % 60

  return {
    days: padTaskActivityResetUnit(days),
    hours: padTaskActivityResetUnit(hours),
    minutes: padTaskActivityResetUnit(minutes),
    seconds: padTaskActivityResetUnit(seconds)
  }
}

/** 将后台可能为数字或文本的活动度数值规范为数值。 */
const toTaskActivityNumber = (value: unknown) => {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

/** 保留后台活动度和奖励的原始展示精度。 */
const formatTaskActivityValue = (value: unknown) => {
  const valueText = String(value ?? '').trim()

  return valueText || '0'
}

/** 解析后台以 JSON 字符串返回的活动度奖励列表。 */
const parseTaskActivityRewardConfigs = (rewardConfig: unknown) => {
  let parsedRewardConfig = rewardConfig

  if (typeof rewardConfig === 'string') {
    try {
      parsedRewardConfig = JSON.parse(rewardConfig)
    } catch {
      return [] as MemberActiveValueRewardConfigItem[]
    }
  }

  return Array.isArray(parsedRewardConfig)
    ? (parsedRewardConfig as MemberActiveValueRewardConfigItem[])
    : []
}

/** 创建活动度节点时，提取后端已领取的活动度档位。 */
const createClaimedActivityValueSet = (activity: MemberActiveValueResult) => {
  const claimedActivityValues = new Set<number>()

  for (const activityValue of activity.claimedActivityValues ?? []) {
    const normalizedActivityValue = toTaskActivityNumber(activityValue)

    if (normalizedActivityValue !== null) {
      claimedActivityValues.add(normalizedActivityValue)
    }
  }

  return claimedActivityValues
}

/** 根据当前活动度和已领取档位，生成活动度宝箱展示数据。 */
export const createTaskActivityData = (activity: MemberActiveValueResult): TaskActivityData => {
  const currentActivity = toTaskActivityNumber(activity.activeValue) ?? 0
  const claimedActivityValue = toTaskActivityNumber(activity.claimedActivityValue) ?? 0
  const claimedActivityValues = createClaimedActivityValueSet(activity)
  const rewardConfigs = parseTaskActivityRewardConfigs(activity.rewardConfig)

  return {
    currentActivity: formatTaskActivityValue(activity.activeValue),
    nodes: rewardConfigs
      .filter(rewardConfig => toTaskActivityNumber(rewardConfig.activityValue) !== null)
      .map(rewardConfig => {
        const activityValue = toTaskActivityNumber(rewardConfig.activityValue)!
        const isClaimed =
          claimedActivityValues.has(activityValue) ||
          (claimedActivityValues.size === 0 && claimedActivityValue >= activityValue)
        const state = isClaimed
          ? 'claimed'
          : currentActivity >= activityValue
            ? 'claimable'
            : 'locked'

        return {
          action: state === 'claimed' ? 'Claimed' : state === 'claimable' ? 'Claim' : 'Open',
          activity: formatTaskActivityValue(rewardConfig.activityValue),
          state,
          bonusAmount: formatTaskActivityValue(rewardConfig.bonusAmount),
          betMultiple: formatTaskActivityValue(rewardConfig.betMultiple)
        }
      }),
    // 使用后台 resetType 计算倒计时，不展示 Figma 静态时间。
    reset: createTaskActivityReset(activity.resetType)
  }
}

/** 任务卡片统一展示数据。 */
export interface TaskViewItem {
  id: string
  source: 'entrant' | 'member'
  title: string
  description: string
  activity?: string
  reward?: string
  rewardUsesCurrency: boolean
  columnCodes: string[]
  progress?: number
  action?: 'Go to Task' | 'Claim' | 'Completed'
}

/** 固定显示在首位的 General 栏目。 */
const GENERAL_TASK_TAB: TaskTabItem = {
  key: 'general',
  label: 'General',
  iconKey: 'gameCategoriesIcon',
  mobileWidth: 103
}

/** 按栏目文字的显示宽度计算 H5 胶囊按钮宽度。 */
const getTaskTabMobileWidth = (label: string) => {
  const displayLength = Array.from(label).reduce(
    (total, character) => total + (character.charCodeAt(0) > 127 ? 2 : 1),
    0
  )

  return Math.min(160, Math.max(86, displayLength * 7 + 52))
}

/** 规范本地或后台语言代码，统一连字符与下划线差异。 */
const normalizeTaskLanguageCode = (languageCode: unknown) =>
  String(languageCode ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')

/** 将本地语言代码转换为可匹配后台多语言字段的候选值。 */
const getTaskTabLanguageCodes = (languageCode: string) => {
  const normalizedLanguageCode = normalizeTaskLanguageCode(languageCode)
  const baseLanguageCode = normalizedLanguageCode.split('-')[0]
  const languageCodes = [normalizedLanguageCode, baseLanguageCode]

  if (baseLanguageCode === 'zh') {
    languageCodes.push('zh-cn')
  }

  if (baseLanguageCode === 'en' || normalizedLanguageCode === 'eng') {
    languageCodes.push('eng', 'en', 'en-us')
  }

  return [...new Set(languageCodes.filter(Boolean))]
}

/** 根据当前界面语言获取任务栏目名称，缺少翻译时退回后台默认名称。 */
const getTaskTabLabel = (item: GameTaskConfigItem, languageCode: string) => {
  const languageCodes = getTaskTabLanguageCodes(languageCode)
  const localizedName = item.languageCode?.find(languageItem => {
    const itemLanguageCode = normalizeTaskLanguageCode(languageItem.languageCode)

    return languageCodes.includes(itemLanguageCode) && String(languageItem.name ?? '').trim()
  })?.name

  return String(localizedName ?? item.name ?? item.columnCode ?? '').trim()
}

/** 创建本地固定的新人福利栏目，只在新人任务接口返回数据时显示。 */
const createEntrantTaskTab = (): TaskTabItem => ({
  key: 'entrant',
  isEntrant: true,
  label: '新人福利',
  iconKey: 'gameCategoriesIcon',
  mobileWidth: getTaskTabMobileWidth('新人福利')
})

/** 将后台栏目配置转换为 H5 与 PC 共用的导航数据。 */
export const createTaskTabs = (
  taskConfigs: GameTaskConfigItem[] | undefined,
  languageCode: string,
  showEntrantTab: boolean
): TaskTabItem[] => {
  const enabledConfigs = (taskConfigs ?? []).filter(item => Number(item.enable) === 1)
  const seenColumnCodes = new Set<string>()

  const createConfigTab = (item: GameTaskConfigItem): TaskTabItem | null => {
    const columnCode = String(item.columnCode ?? '').trim()
    const label = getTaskTabLabel(item, languageCode)

    if (!columnCode || !label || seenColumnCodes.has(columnCode)) {
      return null
    }

    seenColumnCodes.add(columnCode)

    return {
      key: `column-${columnCode}`,
      columnCode,
      label,
      // 后台未提供栏目图标，暂统一复用通用任务图标。
      iconKey: 'gameCategoriesIcon',
      mobileWidth: getTaskTabMobileWidth(label)
    }
  }

  const configTabs = enabledConfigs
    .map(createConfigTab)
    .filter((item): item is TaskTabItem => Boolean(item))

  return [GENERAL_TASK_TAB, ...(showEntrantTab ? [createEntrantTaskTab()] : []), ...configTabs]
}

/** 解析后台 JSON 格式的多语言任务名称或描述。 */
const parseTaskLocalizedText = (value: unknown) => {
  if (typeof value !== 'string') {
    return {}
  }

  try {
    const parsedValue = JSON.parse(value)

    return parsedValue && typeof parsedValue === 'object'
      ? (parsedValue as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

/** 根据当前界面语言获取任务多语言文本，缺失时回退英文、中文或任意有效文本。 */
const getTaskLocalizedText = (value: unknown, languageCode: string) => {
  const localizedTexts = parseTaskLocalizedText(value)
  const languageCodes = getTaskTabLanguageCodes(languageCode)
  const textEntries = Object.entries(localizedTexts).map(([key, text]) => [
    normalizeTaskLanguageCode(key),
    String(text ?? '').trim()
  ])

  const matchedText = languageCodes
    .map(code => textEntries.find(([key, text]) => key === code && text)?.[1])
    .find(Boolean)

  return (
    matchedText ??
    textEntries.find(([key, text]) => ['eng', 'en', 'zh', 'zh-cn'].includes(key) && text)?.[1] ??
    textEntries.find(([, text]) => text)?.[1] ??
    ''
  )
}

/** 将后台金额或活动度原值转为可展示文本，不补零、不四舍五入。 */
const getTaskDisplayValue = (value: unknown) => {
  const valueText = String(value ?? '').trim()

  return valueText || undefined
}

/** 将逗号分隔的后台栏目编码转为可筛选的数组。 */
const createTaskColumnCodes = (columnCode: unknown) => {
  return String(columnCode ?? '')
    .split(',')
    .map(code => code.trim())
    .filter(Boolean)
}

/** 根据会员任务奖励展示类型生成奖励文案及币种符号显示规则。 */
const createMemberTaskReward = (task: MemberTaskItem) => {
  const rewardDisplayType = String(task.rewardDisplayType ?? '')
    .trim()
    .toLowerCase()

  // random：随机金额奖励，展示最小金额至最大金额并显示当前币种符号。
  if (rewardDisplayType === 'random') {
    const rewardMinAmount = getTaskDisplayValue(task.rewardMinAmount)
    const rewardMaxAmount = getTaskDisplayValue(task.rewardMaxAmount)

    return {
      reward:
        rewardMinAmount && rewardMaxAmount
          ? `${rewardMinAmount}~${rewardMaxAmount}`
          : (rewardMinAmount ?? rewardMaxAmount),
      rewardUsesCurrency: true
    }
  }

  // ratio：固定比例奖励，展示比例百分比，不显示当前币种符号。
  if (rewardDisplayType === 'ratio') {
    const rewardRatio = getTaskDisplayValue(task.rewardRatio)

    return {
      reward: rewardRatio === undefined ? undefined : `${rewardRatio}%`,
      rewardUsesCurrency: false
    }
  }

  // fixed：固定金额奖励，展示 rewardAmount 并显示当前币种符号。
  if (rewardDisplayType === 'fixed') {
    return {
      reward: getTaskDisplayValue(task.rewardAmount ?? task.amount),
      rewardUsesCurrency: true
    }
  }

  // 兼容未返回奖励类型的旧数据，默认按固定金额奖励展示。
  return {
    reward: getTaskDisplayValue(task.rewardAmount ?? task.amount),
    rewardUsesCurrency: true
  }
}

/** 将任务 ID 转为统一键值，用于关联任务列表与进度列表。 */
const createTaskScheduleKey = (taskId: string | number) => String(taskId).trim()

/** 将任务进度列表转换为按 taskId 查询的映射。 */
const createTaskScheduleMap = <TSchedule extends { taskId: string | number }>(
  schedules: TSchedule[] | undefined
) => new Map((schedules ?? []).map(schedule => [createTaskScheduleKey(schedule.taskId), schedule]))

/** 将当前值与目标值转换为 0 至 100 的进度百分比。 */
const createTaskProgressPercentage = (currentValue: unknown, targetValue: unknown) => {
  const current = Math.abs(Number(currentValue))
  const target = Number(targetValue)

  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    return 0
  }

  return Math.min(current / target, 1) * 100
}

/** 判断新人固定任务状态是否已完成，已完成与已领取均展示 100%。 */
const isEntrantTaskCompleted = (status: EntrantTaskScheduleItem['status']) => {
  // boolean：后台直接返回完成布尔值时，使用其原始值。
  if (typeof status === 'boolean') {
    return status
  }

  // number：0 表示未完成，正数状态表示已完成或已领取。
  if (typeof status === 'number') {
    return status > 0
  }

  // string：兼容字符串状态值，明确识别完成或已领取状态。
  return ['1', 'true', 'completed', 'claimed', 'done', 'finished'].includes(
    String(status ?? '')
      .trim()
      .toLowerCase()
  )
}

/** 计算新人固定任务进度：只根据 queryEntrantTaskSchedule 的完成状态显示 0% 或 100%。 */
const createEntrantTaskProgress = (schedule: EntrantTaskScheduleItem | undefined) =>
  isEntrantTaskCompleted(schedule?.status) ? 100 : 0

/** 计算 GAME 游戏任务进度：多个条件的当前完成比例取平均值。 */
const createGameTaskProgress = (conditionProgressList: TaskConditionProgressItem[] | undefined) => {
  const conditionProgresses = (conditionProgressList ?? []).map(condition =>
    createTaskProgressPercentage(condition.currentValue, condition.targetValue)
  )

  if (conditionProgresses.length === 0) {
    return 0
  }

  const averageProgress =
    conditionProgresses.reduce((total, progress) => total + progress, 0) /
    conditionProgresses.length

  // 游戏任务平均进度最多保留两位小数，避免展示浮点计算误差。
  return Number(averageProgress.toFixed(2))
}

/** 计算 CZ 充值任务进度：当前累计充值金额除以任务目标累计充值金额。 */
const createRechargeTaskProgress = (task: MemberTaskItem, schedule: TaskScheduleItem) =>
  createTaskProgressPercentage(schedule.rechargeAmount, task.rechargeAmount)

/** 计算普通任务进度；无法匹配 taskId 或暂未支持的类型统一展示 0%。 */
const createMemberTaskProgress = (task: MemberTaskItem, schedule: TaskScheduleItem | undefined) => {
  if (!schedule) {
    return 0
  }

  const taskType = String(task.taskType ?? '')
    .trim()
    .toUpperCase()

  // GAME：游戏任务，多个 conditionProgressList 条件进度取平均值。
  if (taskType === 'GAME') {
    return createGameTaskProgress(schedule.conditionProgressList)
  }

  // CZ：充值任务，使用当前累计充值金额与目标累计充值金额计算进度。
  if (taskType === 'CZ') {
    return createRechargeTaskProgress(task, schedule)
  }

  // XYZ：幸运抽奖任务，等待后续接口规则，当前展示 0%。
  if (taskType === 'XYZ') {
    return 0
  }

  // TG：代理赚钱任务，等待后续接口规则，当前展示 0%。
  if (taskType === 'TG') {
    return 0
  }

  // 未知类型：没有计算规则时不推断进度，统一展示 0%。
  return 0
}

/** 将新人固定任务或会员任务的基础字段转换为任务卡片统一模型。 */
const createTaskViewItem = (
  item: EntrantTaskItem | MemberTaskItem,
  source: TaskViewItem['source'],
  languageCode: string,
  progress: number
): TaskViewItem => {
  const activeNumber = getTaskDisplayValue(item.activeNumber)
  const rewardInfo =
    source === 'entrant'
      ? {
          reward: getTaskDisplayValue(item.amount),
          rewardUsesCurrency: true
        }
      : createMemberTaskReward(item as MemberTaskItem)

  return {
    id: `${source}-${item.rowId}`,
    source,
    title: getTaskLocalizedText(item.taskName, languageCode) || String(item.taskType ?? item.rowId),
    description: getTaskLocalizedText(item.taskDesc, languageCode),
    activity: activeNumber === undefined ? undefined : `+${activeNumber}`,
    ...rewardInfo,
    columnCodes: 'columnCode' in item ? createTaskColumnCodes(item.columnCode) : [],
    progress
  }
}

/** 创建新人固定任务卡片：rowId 与 taskId 匹配后仅展示 0% 或 100%。 */
export const createEntrantTaskViewItems = (
  tasks: EntrantTaskItem[] | undefined,
  languageCode: string,
  schedules: EntrantTaskScheduleItem[] | undefined
) => {
  const scheduleMap = createTaskScheduleMap(schedules)

  return (tasks ?? []).map(item => {
    const schedule = scheduleMap.get(createTaskScheduleKey(item.rowId))

    return createTaskViewItem(item, 'entrant', languageCode, createEntrantTaskProgress(schedule))
  })
}

/** 创建会员任务卡片：rowId 与 taskId 匹配后，根据任务类型计算进度。 */
export const createMemberTaskViewItems = (
  tasks: MemberTaskItem[] | undefined,
  languageCode: string,
  schedules: TaskScheduleItem[] | undefined
) => {
  const scheduleMap = createTaskScheduleMap(schedules)

  return (tasks ?? []).map(item => {
    const schedule = scheduleMap.get(createTaskScheduleKey(item.rowId))

    return createTaskViewItem(
      item,
      'member',
      languageCode,
      createMemberTaskProgress(item, schedule)
    )
  })
}

/** 合并 General 栏目的任务，保证新人任务始终排在会员任务前。 */
export const createGeneralTaskViewItems = (
  entrantTasks: TaskViewItem[],
  memberTasks: TaskViewItem[]
) => [...entrantTasks, ...memberTasks]
