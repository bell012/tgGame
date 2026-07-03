/** 领取新人福利任务奖金 */
export interface ObtainEntrantTaskAmountForm {
  // 后续按后端文档补充参数
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
