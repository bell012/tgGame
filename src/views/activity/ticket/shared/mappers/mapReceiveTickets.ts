import type { UseTicketResult } from '@/api/interface/activity'

import {
  openTicketReceiveDialog,
  openTicketResultDialog,
  type OpenTicketResultDialogOptions
} from '../../shell/ticketDialog'
import { hasTicketIdentity, prepareReceiveTickets } from '../ticketPostTrigger'
import { buildResultDialogFromAmount, buildResultDialogFromUse } from './mapWheelConfig'
import { normalizeMbTicketRecords } from './mbTicketMapper'

export const openTicketReceivePopFromUseResult = async (result: UseTicketResult) => {
  const nextTickets = await prepareReceiveTickets(
    normalizeMbTicketRecords(result.nextTickets ?? []).filter(hasTicketIdentity)
  )
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
 * nextTickets 为空数组时不显示下一步；仅 nextTickets 未返回时才回退 triggerConfig。
 * 这里把 use 接口返回的 nextTickets 透传进弹窗状态，供下一轮领取浮窗展示。
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
