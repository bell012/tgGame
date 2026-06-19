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
 * 弹结果浮窗：是否触发下一轮票券统一由结果弹窗关闭时按已消耗票券的
 * enableTrigger/triggerConfig 决定（见 useTicketResultDialog.close），
 * 不再依赖 use 接口返回的 nextTickets，避免 enableTrigger=0 时误触发。
 */
export const openTicketResultDialogFromUse = (
  result: UseTicketResult,
  extras: ResultDialogExtras = {}
) => {
  const base = buildResultDialogFromUse(result)
  openTicketResultDialog({ ...base, ...extras })
}

/** 非大转盘玩法：按 rewardAmount 判断结果 */
export const openTicketResultDialogFromAmount = (
  result: UseTicketResult,
  extras: ResultDialogExtras = {}
) => {
  const base = buildResultDialogFromAmount(result)
  openTicketResultDialog({ ...base, ...extras })
}
