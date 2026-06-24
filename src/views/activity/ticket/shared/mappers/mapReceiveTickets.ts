import type { UseTicketResult } from '@/api/interface/activity'

import {
  openTicketReceiveDialog,
  openTicketResultDialog,
  type OpenTicketResultDialogOptions
} from '../../shell/ticketDialog'
import { buildResultDialogFromAmount, buildResultDialogFromUse } from './mapWheelConfig'

export const openTicketReceivePopFromUseResult = (result: UseTicketResult) => {
  const nextTickets = result.nextTickets ?? []
  if (nextTickets.length === 0) return false

  openTicketReceiveDialog({
    nextTickets
  })

  return true
}

type ResultDialogExtras = Partial<
  Omit<OpenTicketResultDialogOptions, 'variant' | 'highlightText' | 'nextTickets'>
>

/**
 * 弹结果浮窗：是否触发下一轮仍由已消耗票券的 enableTrigger 决定（见
 * useTicketResultDialog.close / resolveNextRoundTickets，避免 enableTrigger=0 时误触发）；
 * 这里把 use 接口返回的完整 nextTickets 透传进弹窗状态，供下一轮领取浮窗
 * 展示票券名称 / 说明 / 过期时间。
 */
export const openTicketResultDialogFromUse = (
  result: UseTicketResult,
  extras: ResultDialogExtras = {}
) => {
  const base = buildResultDialogFromUse(result)
  openTicketResultDialog({ nextTickets: result.nextTickets ?? [], ...base, ...extras })
}

/** 非大转盘玩法：按 rewardAmount 判断结果 */
export const openTicketResultDialogFromAmount = (
  result: UseTicketResult,
  extras: ResultDialogExtras = {}
) => {
  const base = buildResultDialogFromAmount(result)
  openTicketResultDialog({ nextTickets: result.nextTickets ?? [], ...base, ...extras })
}
