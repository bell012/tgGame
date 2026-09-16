/** 任务中心模块通用业务响应结构。 */
export interface TaskCenterApiResponse<TResult> {
  code: string
  message: string
  success?: boolean
  result: TResult
}

/** 任务中心栏目多语言名称。 */
export interface GameTaskConfigLanguageItem {
  languageCode?: string
  name?: string
}

/** 游戏任务栏目配置。 */
export interface GameTaskConfigItem {
  columnCode?: string
  enable?: number
  languageCode?: GameTaskConfigLanguageItem[]
  name?: string
}

/** 查询会员当日数据概览请求参数。 */
export interface QueryMemberDataOverviewForm {
  startTime: number
  endTime: number
  currency: string
}

/** 查询会员当日数据概览响应结果。 */
export interface MemberDataOverviewResult {
  currency?: string
  depositAmount?: number | string
  betAmount?: number | string
}

/** 单档活动度宝箱奖励配置。 */
export interface MemberActiveValueRewardConfigItem {
  activityValue?: number | string
  betMultiple?: number | string
  bonusAmount?: number | string
}

/** 会员当前活动度及宝箱领取状态。 */
export interface MemberActiveValueResult {
  rewardConfig?: string | MemberActiveValueRewardConfigItem[]
  claimedRewardConfig?: unknown[]
  activeValue?: number | string
  claimedActivityValue?: number | string
  resetType?: number
  periodKey?: string
  claimedActivityValues?: Array<number | string>
}

/** 查询会员任务列表请求参数。 */
export interface QueryMemberTasksForm {
  page: {
    current: number
    size: number
  }
  currency: string
}

/** 查询新人固定任务请求参数。 */
export interface QueryEntrantTasksForm {
  page: {
    current: number
    size: number
  }
  currency: string
}

/** 查询新人固定任务中的任务项。 */
export interface EntrantTaskItem {
  rowId: string | number
  taskType?: string
  taskName?: string
  taskDesc?: string
  currency?: string
  enable?: number
  activeNumber?: number | string
  amount?: number | string
  rewardsType?: number
}

/** 新人固定任务进度项。 */
export interface EntrantTaskScheduleItem {
  taskId: string | number
  status?: number | string | boolean
}

/** 普通游戏任务的单项条件进度。 */
export interface TaskConditionProgressItem {
  code?: string
  completed?: boolean
  currentValue?: number | string
  name?: string
  show?: boolean
  targetValue?: number | string
}

/** 普通任务进度项。 */
export interface TaskScheduleItem {
  taskId: string | number
  conditionProgressList?: TaskConditionProgressItem[]
  rechargeAmount?: number | string
}

/** 查询会员任务列表中的任务项。 */
export interface MemberTaskItem {
  rowId: string | number
  taskType?: string
  taskName?: string
  taskDesc?: string
  taskIcon?: string
  currency?: string
  enable?: number
  columnCode?: string
  startDate?: number
  endDate?: number
  activeNumber?: number | string
  amount?: number | string
  rewardAmount?: number | string
  rewardMinAmount?: number | string
  rewardMaxAmount?: number | string
  rewardRatio?: number | string
  rechargeAmount?: number
  rechargeNum?: number
  betAmount?: number
  winAmount?: number
  lostAmount?: number
  betRate?: number
  rewardDisplayType?: string
  rewardConfig?: string
  sortNum?: number
  bindGames?: string[]
  platformGameCodes?: string[]
}
