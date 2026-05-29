import type { LuckySpinInfoResult, LuckySpinResult } from '@/components/common/lucky-spin/types'

export interface LuckySpinInfoResponse {
  code: number
  message: string
  success: boolean
  result?: LuckySpinInfoResult
}

export interface LuckySpinDrawResponse {
  code: number
  message: string
  success: boolean
  result?: LuckySpinResult
}
