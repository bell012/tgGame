import type { UseTicketResult } from '@/api/interface/activity'

import {
  openTicketReceiveDialog,
  openTicketResultDialog,
  type OpenTicketResultDialogOptions
} from '../../shell/ticketDialog'
import { buildResultDialogFromUse } from './mapWheelConfig'

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
 * cash 中奖：先弹结果浮窗，关闭时再由结果弹窗内部跳转到“领取下一张票券”浮窗；
 * 其他结果类型：若返回了 nextTickets 则直接短路到领取浮窗，否则正常弹结果浮窗。
 */
export const openTicketResultDialogFromUse = (
  result: UseTicketResult,
  extras: ResultDialogExtras = {}
) => {
  const base = buildResultDialogFromUse(result)
  const nextTickets = result.nextTickets ?? []

  if (base.variant === 'cash') {
    openTicketResultDialog({ ...base, ...extras, nextTickets })
    return
  }

  if (nextTickets.length > 0) {
    openTicketReceiveDialog({ nextTickets })
    return
  }

  openTicketResultDialog({ ...base, ...extras })
}
