/** 领取任务奖金（activityCode 16） */
export interface ObtainTaskAmountForm {
  rowId: string | number
  taskType?: number
  tierNo?: number
  verifyCode?: string
}

export interface ObtainTaskAmountResult {
  rewardAmount?: number
  amount?: number
  success?: boolean
}

export interface ObtainTaskAmountResponse {
  code: string
  message: string
  success?: boolean
  result?: ObtainTaskAmountResult
}

/** 领取新人福利任务奖金（activityCode 17） */
export interface ObtainEntrantTaskAmountForm {
  rowId?: string | number
  verifyCode?: string
}

export interface ObtainEntrantTaskAmountResult {
  rewardAmount?: number
  amount?: number
  success?: boolean
}

export interface ObtainEntrantTaskAmountResponse {
  code: string
  message: string
  success?: boolean
  result?: ObtainEntrantTaskAmountResult
}

/** 任务栏目多语言名称。 */
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

/** 获取游戏任务栏目配置响应。 */
export interface GetGameTaskConfigResponse {
  code: string
  message: string
  success?: boolean
  result?: GameTaskConfigItem[]
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

/** 查询会员任务列表响应。 */
export interface QueryMemberTasksResponse {
  code: string
  message: string
  success?: boolean
  result?: MemberTaskItem[]
}
