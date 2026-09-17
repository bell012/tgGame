import type {
  EntrantTaskItem,
  EntrantTaskScheduleItem,
  GameTaskConfigItem,
  MemberActiveValueResult,
  MemberActiveValueRewardConfigItem,
  MemberTaskItem,
  TaskConditionProgressItem,
  TaskScheduleItem,
  TaskTierProgressItem
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

/** 任务卡片操作按钮状态。 */
export type TaskActionState = 'go-to-task' | 'claim' | 'completed' | 'wait-settle' | 'expired'

/** 任务说明弹窗的进度卡展示类型。 */
export type TaskInfoPopupVariant = 'compact' | 'detailed'

/** 任务说明弹窗中充值金额型任务的当前值与目标值。 */
export interface TaskInfoPopupRechargeProgress {
  currentAmount: string
  targetAmount: string
}

/** 任务说明弹窗中单张条件进度卡的数据。 */
export interface TaskInfoPopupDetailCard {
  action: TaskActionState
  conditions: TaskConditionProgressItem[]
  id: string
  progress: number
  /** 阶梯任务当前档位的后台奖励文案，仅由 tierProgressList 提供。 */
  rewardText?: string
}

/** 任务说明弹窗所需的完整展示数据。 */
export interface TaskInfoPopupData {
  action: TaskActionState
  description: string
  detailCards: TaskInfoPopupDetailCard[]
  platformGameCodes: string[]
  progress: number
  rechargeProgress?: TaskInfoPopupRechargeProgress
  /** 阶梯任务存在可领取档位且更高档未完成时，领取前需要二次确认。 */
  requiresTierClaimReminder: boolean
  taskType: string
  title: string
  variant: TaskInfoPopupVariant
}

/** 创建任务说明弹窗时需要补充的进度模型数据。 */
interface TaskInfoPopupContent {
  detailCards: TaskInfoPopupDetailCard[]
  rechargeProgress?: TaskInfoPopupRechargeProgress
  requiresTierClaimReminder: boolean
  variant: TaskInfoPopupVariant
}

/** 任务卡片统一展示数据。 */
export interface TaskViewItem {
  id: string
  source: 'entrant' | 'member'
  taskType: string
  platformGameCodes: string[]
  title: string
  description: string
  activity?: string
  reward?: string
  rewardUsesCurrency: boolean
  columnCodes: string[]
  /** 阶梯任务存在更高未完成档位时，卡片领取按钮需要先显示提醒弹窗。 */
  requiresTierClaimReminder: boolean
  popup: TaskInfoPopupData
  progress?: number
  action: TaskActionState
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

/** 将数值限制在 0 至 100 的有效进度范围内。 */
const clampTaskProgress = (progress: number) => Math.min(Math.max(progress, 0), 100)

/** 将任务领取状态统一为大写文本，兼容后台空值。 */
const normalizeTaskClaimStatus = (claimStatus: unknown) =>
  String(claimStatus ?? '')
    .trim()
    .toUpperCase()

/** 将单个条件的当前值与目标值转换为 0 至 100 的进度百分比。 */
const createTaskProgressPercentage = (condition: TaskConditionProgressItem) => {
  const target = Number(condition.targetValue)

  // 目标值无效时不能除以零，改由后台 completed 标识确定完成状态。
  if (!Number.isFinite(target) || target <= 0) {
    return condition.completed ? 100 : 0
  }

  const current = Math.abs(Number(condition.currentValue))

  if (!Number.isFinite(current)) {
    return 0
  }

  return clampTaskProgress((current / target) * 100)
}

/** 根据新人任务 status 精确映射操作按钮状态。 */
const createEntrantTaskActionState = (
  schedule: EntrantTaskScheduleItem | undefined
): TaskActionState => {
  switch (Number(schedule?.status)) {
    // 1：已完成任务条件，奖励待领取。
    case 1:
      return 'claim'
    // 2：奖励已领取，任务已结束。
    case 2:
      return 'completed'
    // 0 或未匹配到进度记录：任务尚未完成。
    default:
      return 'go-to-task'
  }
}

/** 根据操作按钮状态计算新人固定任务进度，仅展示 0% 或 100%。 */
const createEntrantTaskProgress = (action: TaskActionState) => (action === 'go-to-task' ? 0 : 100)

/** 计算条件型任务进度：多个条件的当前完成比例取平均值。 */
const createConditionTaskProgress = (
  conditionProgressList: TaskConditionProgressItem[] | undefined
) => {
  const conditionProgresses = (conditionProgressList ?? []).map(createTaskProgressPercentage)

  if (conditionProgresses.length === 0) {
    return 0
  }

  const averageProgress =
    conditionProgresses.reduce((total, progress) => total + progress, 0) /
    conditionProgresses.length

  // 条件型任务平均进度最多保留两位小数，避免展示浮点计算误差。
  return Number(clampTaskProgress(averageProgress).toFixed(2))
}

/** 判断普通会员任务是否属于累计充值金额型任务。 */
const isRechargeAmountTask = (taskType: MemberTaskItem['taskType']) =>
  new Set(['CZ', 'CZ2', 'CZ3', 'CZ4', 'CZ5']).has(
    String(taskType ?? '')
      .trim()
      .toUpperCase()
  )

/** 判断给定时间戳是否与当前浏览器本地日期属于同一天。 */
const isTaskSameLocalDay = (timestamp: unknown, currentDate: Date) => {
  const date = new Date(Number(timestamp))

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === currentDate.getFullYear() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getDate() === currentDate.getDate()
  )
}

/** 计算累计充值金额型任务进度，并处理不允许跨天累计的旧进度。 */
const createRechargeAmountTaskProgress = (
  task: MemberTaskItem,
  schedule: TaskScheduleItem,
  currentDate: Date
) => {
  // acrossDay 为 0 时，只能使用今天写入的累计充值进度。
  if (Number(task.acrossDay) === 0 && !isTaskSameLocalDay(schedule.modifyTime, currentDate)) {
    return 0
  }

  const targetRechargeAmount = Number(task.rechargeAmount)
  const currentRechargeAmount = Number(schedule.rechargeAmount)

  if (
    !Number.isFinite(targetRechargeAmount) ||
    targetRechargeAmount <= 0 ||
    !Number.isFinite(currentRechargeAmount)
  ) {
    return 0
  }

  return Number(clampTaskProgress((currentRechargeAmount / targetRechargeAmount) * 100).toFixed(2))
}

/** 按档位编号升序整理阶梯任务进度，避免依赖接口数组顺序。 */
const createSortedTierProgresses = (tierProgressList: TaskTierProgressItem[] | undefined) => {
  return [...(tierProgressList ?? [])].sort((firstTier, secondTier) => {
    const firstTierNo = Number(firstTier.tierNo)
    const secondTierNo = Number(secondTier.tierNo)

    if (!Number.isFinite(firstTierNo) || !Number.isFinite(secondTierNo)) {
      return 0
    }

    return firstTierNo - secondTierNo
  })
}

/** 获取阶梯任务的首档进度，用于外层任务卡进度计算。 */
const getFirstTierProgress = (tierProgressList: TaskTierProgressItem[] | undefined) =>
  createSortedTierProgresses(tierProgressList)[0]

/** 仅 rewardModel = 2 的普通会员任务按阶梯任务结构处理。 */
const isTierTaskSchedule = (schedule: TaskScheduleItem) => Number(schedule.rewardModel) === 2

/** 兼容后端可能以布尔值或文本下发的“存在更高未完成档位”标识。 */
const hasHigherUnfinishedTier = (value: unknown) =>
  value === true ||
  String(value ?? '')
    .trim()
    .toLowerCase() === 'true'

/** 判断阶梯任务领取时是否仍有更高档位可继续挑战。 */
const shouldShowTierClaimReminder = (
  schedule: TaskScheduleItem | undefined,
  action: TaskActionState
) => {
  if (!schedule || action !== 'claim' || !isTierTaskSchedule(schedule)) {
    return false
  }

  const tierProgresses = createSortedTierProgresses(schedule.tierProgressList)

  return tierProgresses.some((tier, index) => {
    if (normalizeTaskClaimStatus(tier.claimStatus) !== 'CLAIMABLE') {
      return false
    }

    // 优先使用后端明确标识；缺失时按后续档位是否未完成进行兼容判断。
    return (
      hasHigherUnfinishedTier(tier.hasHigherUnfinishedTier) ||
      tierProgresses
        .slice(index + 1)
        .some(higherTier => normalizeTaskClaimStatus(higherTier.claimStatus) === 'UN_FINISHED')
    )
  })
}

/** 根据纯状态型任务的领取状态生成 0% 或 100% 进度。 */
const createStatusTaskProgress = (claimStatus: unknown) => {
  switch (normalizeTaskClaimStatus(claimStatus)) {
    // CLAIMABLE：任务条件已达成，奖励待领取。
    case 'CLAIMABLE':
      return 100
    // CLAIMED：奖励已领取。
    case 'CLAIMED':
      return 100
    // WAIT_SETTLE：条件已达成，等待后台结算。
    case 'WAIT_SETTLE':
      return 100
    // UN_FINISHED、未知或空状态统一视为未完成。
    default:
      return 0
  }
}

/** 根据普通任务 claimStatus 精确映射操作按钮状态。 */
const createMemberTaskActionState = (
  claimStatus: TaskScheduleItem['claimStatus'],
  isExpired: boolean
): TaskActionState => {
  // 已过期优先展示已过期状态，但进度仍保留前面模型计算的结果。
  if (isExpired) {
    return 'expired'
  }

  const normalizedClaimStatus = normalizeTaskClaimStatus(claimStatus)

  switch (normalizedClaimStatus) {
    // CLAIMABLE：任务已达到领取条件，奖励待领取。
    case 'CLAIMABLE':
      return 'claim'
    // CLAIMED：奖励已领取，任务已结束。
    case 'CLAIMED':
      return 'completed'
    // WAIT_SETTLE：条件已完成，但暂未到结算或领取时间。
    case 'WAIT_SETTLE':
      return 'wait-settle'
    // UN_FINISHED 或未知状态：任务尚未完成。
    default:
      return 'go-to-task'
  }
}

/** 判断任务结束时间是否已超过当前浏览器本地时间。 */
const isMemberTaskExpired = (task: MemberTaskItem, currentDate: Date) => {
  const endDate = Number(task.endDate)

  return Number.isFinite(endDate) && endDate > 0 && currentDate.getTime() > endDate
}

/** 计算普通会员任务进度；无法匹配 taskId 时统一展示 0%。 */
const createMemberTaskProgress = (
  task: MemberTaskItem,
  schedule: TaskScheduleItem | undefined,
  currentDate: Date
) => {
  if (!schedule) {
    return 0
  }

  const claimStatus = normalizeTaskClaimStatus(schedule.claimStatus)

  // WAIT_SETTLE：等待结算的任务无需继续计算条件，固定展示 100%。
  if (claimStatus === 'WAIT_SETTLE') {
    return 100
  }

  // CZ、CZ2 至 CZ5：按累计充值金额计算任务进度。
  if (isRechargeAmountTask(task.taskType)) {
    return createRechargeAmountTaskProgress(task, schedule, currentDate)
  }

  // 阶梯任务：已领取或可领取时固定 100%，未完成时展示最小 tierNo 档位的条件进度。
  if (isTierTaskSchedule(schedule)) {
    if (claimStatus === 'CLAIMABLE' || claimStatus === 'CLAIMED') {
      return 100
    }

    return createConditionTaskProgress(
      getFirstTierProgress(schedule.tierProgressList)?.conditionProgressList
    )
  }

  // 普通条件型任务：只要存在条件列表即可计算，不限制 taskType。
  if ((schedule.conditionProgressList?.length ?? 0) > 0) {
    return createConditionTaskProgress(schedule.conditionProgressList)
  }

  // 其余任务没有可计算条件，按领取状态作为最终兜底。
  return createStatusTaskProgress(claimStatus)
}

/** 判断普通任务是否应直接展示 100% 的已完成或延迟奖励状态。 */
const shouldForceMemberTaskProgressComplete = (schedule: TaskScheduleItem) => {
  const claimStatus = normalizeTaskClaimStatus(schedule.claimStatus)

  // CLAIMED：奖励已领取，页面进度固定展示完成。
  if (claimStatus === 'CLAIMED') {
    return true
  }

  // 延迟奖励在可领取或待结算时，条件已满足，页面固定展示完成。
  return (
    schedule.hasDeferredReward === true &&
    (claimStatus === 'WAIT_SETTLE' || claimStatus === 'CLAIMABLE')
  )
}

/** 按 rewardModel 计算普通会员任务在页面中的最终展示进度。 */
const createMemberTaskDisplayProgress = (
  task: MemberTaskItem,
  processInfo: TaskScheduleItem | undefined,
  currentDate: Date
) => {
  // 无匹配进度项时，普通会员任务统一展示 0%。
  if (!processInfo) {
    return 0
  }

  // rewardModel = 2：阶梯任务没有进度明细时无法确定当前档位，展示 0%。
  if (Number(processInfo.rewardModel) === 2) {
    if (shouldForceMemberTaskProgressComplete(processInfo)) {
      return 100
    }

    // 阶梯未强制完成时，按 tierNo 升序使用第一档条件计算进度。
    return createConditionTaskProgress(
      getFirstTierProgress(processInfo.tierProgressList)?.conditionProgressList
    )
  }

  // 非阶梯任务：已领取或延迟奖励已满足时固定展示 100%。
  if (shouldForceMemberTaskProgressComplete(processInfo)) {
    return 100
  }

  // 普通条件型任务优先按条件平均值展示，避免仅依赖领取状态。
  if ((processInfo.conditionProgressList?.length ?? 0) > 0) {
    return createConditionTaskProgress(processInfo.conditionProgressList)
  }

  // 充值金额型、纯状态型等没有条件列表的任务，沿用既有 task.progress 计算。
  return createMemberTaskProgress(task, processInfo, currentDate)
}

/** 将接口原始金额保留为弹窗展示文本，缺省时展示 0。 */
const formatTaskInfoProgressValue = (value: unknown) => getTaskDisplayValue(value) ?? '0'

/** 计算弹窗单张详细进度卡的进度，待结算状态固定显示 100%。 */
const createTaskInfoDetailProgress = (
  claimStatus: unknown,
  conditionProgressList: TaskConditionProgressItem[] | undefined
) => {
  if (normalizeTaskClaimStatus(claimStatus) === 'WAIT_SETTLE') {
    return 100
  }

  if ((conditionProgressList?.length ?? 0) > 0) {
    return createConditionTaskProgress(conditionProgressList)
  }

  return createStatusTaskProgress(claimStatus)
}

/** 创建阶梯任务的全部详细进度卡，每一档独立使用自身状态和条件列表。 */
const createTierTaskInfoDetailCards = (
  tierProgressList: TaskTierProgressItem[] | undefined
): TaskInfoPopupDetailCard[] =>
  createSortedTierProgresses(tierProgressList).map((tier, index) => {
    const tierNo = formatTaskInfoProgressValue(tier.tierNo ?? index + 1)

    return {
      action: createMemberTaskActionState(tier.claimStatus, false),
      conditions: tier.conditionProgressList ?? [],
      id: `tier-${tierNo}-${index}`,
      progress: createTaskInfoDetailProgress(tier.claimStatus, tier.conditionProgressList),
      rewardText: tier.rewardText
    }
  })

/** 创建普通会员条件型任务的单张详细进度卡。 */
const createMemberTaskInfoDetailCard = (
  task: MemberTaskItem,
  schedule: TaskScheduleItem,
  action: TaskActionState,
  progress: number
): TaskInfoPopupDetailCard => ({
  action,
  conditions: schedule.conditionProgressList ?? [],
  id: `task-${task.rowId}`,
  progress
})

/** 创建新人福利任务的精简说明弹窗数据。 */
const createEntrantTaskInfoPopupContent = (): TaskInfoPopupContent => ({
  detailCards: [],
  requiresTierClaimReminder: false,
  variant: 'compact'
})

/** 创建普通会员任务的说明弹窗进度模型数据。 */
const createMemberTaskInfoPopupContent = (
  task: MemberTaskItem,
  schedule: TaskScheduleItem | undefined,
  action: TaskActionState,
  progress: number
): TaskInfoPopupContent => {
  const requiresTierClaimReminder = shouldShowTierClaimReminder(schedule, action)

  // 充值金额型任务使用精简卡，展示当前充值金额与目标充值金额。
  if (isRechargeAmountTask(task.taskType)) {
    return {
      detailCards: [],
      rechargeProgress: {
        currentAmount: formatTaskInfoProgressValue(schedule?.rechargeAmount),
        targetAmount: formatTaskInfoProgressValue(task.rechargeAmount)
      },
      requiresTierClaimReminder,
      variant: 'compact'
    }
  }

  // 阶梯任务必须将全部档位传入弹窗，每档分别展示自身状态与进度。
  if (schedule && isTierTaskSchedule(schedule) && (schedule.tierProgressList?.length ?? 0) > 0) {
    return {
      detailCards: createTierTaskInfoDetailCards(schedule.tierProgressList),
      requiresTierClaimReminder,
      variant: 'detailed'
    }
  }

  // 普通任务只要有条件列表，即使用单张详细进度卡展示。
  if (schedule && (schedule.conditionProgressList?.length ?? 0) > 0) {
    return {
      detailCards: [createMemberTaskInfoDetailCard(task, schedule, action, progress)],
      requiresTierClaimReminder,
      variant: 'detailed'
    }
  }

  // 无条件明细的普通任务回退到精简说明卡。
  return {
    detailCards: [],
    requiresTierClaimReminder,
    variant: 'compact'
  }
}

/** 将新人固定任务或会员任务的基础字段转换为任务卡片统一模型。 */
const createTaskViewItem = (
  item: EntrantTaskItem | MemberTaskItem,
  source: TaskViewItem['source'],
  languageCode: string,
  progress: number,
  action: TaskActionState,
  popupContent: TaskInfoPopupContent
): TaskViewItem => {
  const activeNumber = getTaskDisplayValue(item.activeNumber)
  const rewardInfo =
    source === 'entrant'
      ? {
          reward: getTaskDisplayValue(item.amount),
          rewardUsesCurrency: true
        }
      : createMemberTaskReward(item as MemberTaskItem)

  const title =
    getTaskLocalizedText(item.taskName, languageCode) || String(item.taskType ?? item.rowId)
  const description = getTaskLocalizedText(item.taskDesc, languageCode)

  return {
    id: `${source}-${item.rowId}`,
    source,
    taskType: String(item.taskType ?? '').trim(),
    platformGameCodes: Array.isArray(item.platformGameCodes)
      ? item.platformGameCodes.map(code => String(code ?? '').trim()).filter(Boolean)
      : [],
    title,
    description,
    activity: activeNumber === undefined ? undefined : `+${activeNumber}`,
    ...rewardInfo,
    columnCodes: 'columnCode' in item ? createTaskColumnCodes(item.columnCode) : [],
    requiresTierClaimReminder: popupContent.requiresTierClaimReminder,
    popup: {
      action,
      description,
      progress,
      taskType: String(item.taskType ?? '').trim(),
      platformGameCodes: Array.isArray(item.platformGameCodes)
        ? item.platformGameCodes.map(code => String(code ?? '').trim()).filter(Boolean)
        : [],
      title,
      ...popupContent
    },
    progress,
    action
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
    const action = createEntrantTaskActionState(schedule)

    return createTaskViewItem(
      item,
      'entrant',
      languageCode,
      createEntrantTaskProgress(action),
      action,
      createEntrantTaskInfoPopupContent()
    )
  })
}

/** 创建会员任务卡片：rowId 与 taskId 匹配后，根据进度记录类型计算进度。 */
export const createMemberTaskViewItems = (
  tasks: MemberTaskItem[] | undefined,
  languageCode: string,
  schedules: TaskScheduleItem[] | undefined
) => {
  const scheduleMap = createTaskScheduleMap(schedules)
  // 同一批任务使用同一时刻计算跨天和过期状态，避免临界秒出现显示不一致。
  const currentDate = new Date()

  return (tasks ?? []).map(item => {
    const schedule = scheduleMap.get(createTaskScheduleKey(item.rowId))
    const action = createMemberTaskActionState(
      schedule?.claimStatus,
      isMemberTaskExpired(item, currentDate)
    )
    const progress = createMemberTaskDisplayProgress(item, schedule, currentDate)

    return createTaskViewItem(
      item,
      'member',
      languageCode,
      progress,
      action,
      createMemberTaskInfoPopupContent(item, schedule, action, progress)
    )
  })
}

/** 合并 General 栏目的任务，保证新人任务始终排在会员任务前。 */
export const createGeneralTaskViewItems = (
  entrantTasks: TaskViewItem[],
  memberTasks: TaskViewItem[]
) => [...entrantTasks, ...memberTasks]
