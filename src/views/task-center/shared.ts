import type {
  GameTaskConfigItem,
  MemberActiveValueResult,
  MemberActiveValueRewardConfigItem
} from '@/api/interface/task-center'

/** 任务栏目键由后台 columnCode 动态生成。 */
export type TaskTabKey = string

/** Figma 静态栏目展示数据。 */
export interface TaskTabItem {
  key: TaskTabKey
  columnCode?: string
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

/** Figma 静态任务卡片数据。 */
export interface TaskViewItem {
  id: string
  title: string
  activity: string
  reward: string
  progress: number
  action: 'Go to Task' | 'Claim' | 'Completed'
}

/** 固定显示在首位的 General 栏目。 */
const GENERAL_TASK_TAB: TaskTabItem = {
  key: 'general',
  label: 'General',
  iconKey: 'gameCategoriesIcon',
  mobileWidth: 103
}

/** 新人福利的多语言名称，用于将该栏目固定排在第二位。 */
const NEW_USER_TASK_TAB_NAMES = new Set(['新人福利', 'new user benefit', 'new user benefits'])

/** 按栏目文字的显示宽度计算 H5 胶囊按钮宽度。 */
const getTaskTabMobileWidth = (label: string) => {
  const displayLength = Array.from(label).reduce(
    (total, character) => total + (character.charCodeAt(0) > 127 ? 2 : 1),
    0
  )

  return Math.min(160, Math.max(86, displayLength * 7 + 52))
}

/** 将本地语言代码转换为可匹配后台多语言字段的候选值。 */
const getTaskTabLanguageCodes = (languageCode: string) => {
  const normalizedLanguageCode = String(languageCode ?? '')
    .trim()
    .toLowerCase()

  return normalizedLanguageCode === 'zh' ? ['zh', 'zh-cn'] : ['eng', 'en', 'en-us']
}

/** 根据当前界面语言获取任务栏目名称，缺少翻译时退回后台默认名称。 */
const getTaskTabLabel = (item: GameTaskConfigItem, languageCode: string) => {
  const languageCodes = getTaskTabLanguageCodes(languageCode)
  const localizedName = item.languageCode?.find(languageItem => {
    const itemLanguageCode = String(languageItem.languageCode ?? '')
      .trim()
      .toLowerCase()

    return languageCodes.includes(itemLanguageCode) && String(languageItem.name ?? '').trim()
  })?.name

  return String(localizedName ?? item.name ?? item.columnCode ?? '').trim()
}

/** 判断后台栏目是否为新人福利，满足时固定排在 General 后。 */
const isNewUserTaskTab = (item: GameTaskConfigItem) => {
  return [item.name, ...(item.languageCode?.map(languageItem => languageItem.name) ?? [])].some(
    name =>
      NEW_USER_TASK_TAB_NAMES.has(
        String(name ?? '')
          .trim()
          .toLowerCase()
      )
  )
}

/** 将后台栏目配置转换为 H5 与 PC 共用的导航数据。 */
export const createTaskTabs = (
  taskConfigs: GameTaskConfigItem[] | undefined,
  languageCode: string
): TaskTabItem[] => {
  const enabledConfigs = (taskConfigs ?? []).filter(item => Number(item.enable) === 1)
  const newUserConfigs = enabledConfigs.filter(isNewUserTaskTab)
  const otherConfigs = enabledConfigs.filter(item => !isNewUserTaskTab(item))
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

  const configTabs = [...newUserConfigs, ...otherConfigs]
    .map(createConfigTab)
    .filter((item): item is TaskTabItem => Boolean(item))

  return [GENERAL_TASK_TAB, ...configTabs]
}

/** 按 Figma 示例生成固定的任务卡片。 */
export const taskFigmaItems: TaskViewItem[] = [
  {
    id: 'download-login',
    title: 'Download & Log In',
    activity: '+0',
    reward: '18~188',
    progress: 0,
    action: 'Go to Task'
  },
  {
    id: 'slots-bet-500',
    title: 'Slots - Bet 500',
    activity: '+5',
    reward: '18',
    progress: 100,
    action: 'Completed'
  },
  {
    id: 'slots-bet-5000',
    title: 'Slots - Bet 5,000',
    activity: '+10',
    reward: '5%',
    progress: 100,
    action: 'Claim'
  },
  {
    id: 'game-bet-5000',
    title: 'Slots - Bet 5,000',
    activity: '+10',
    reward: '5%',
    progress: 100,
    action: 'Go to Task'
  }
]
