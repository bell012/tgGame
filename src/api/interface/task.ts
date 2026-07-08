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
