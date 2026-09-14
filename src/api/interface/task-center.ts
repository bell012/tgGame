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
  amount?: number
  rewardAmount?: number
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
