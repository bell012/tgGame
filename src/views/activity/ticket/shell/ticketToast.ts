import type { MbTicketRecord } from '@/api/interface/activity'
import { findMbTicketsByGameId } from '../shared/mappers/mbTicketMapper'
import { reactive } from 'vue'
import { closeTicketDialog } from './ticketDialog'
import type { OpenTicketToastOptions, TicketGameId } from '../shared/types'

interface GlobalTicketToastState {
  visible: boolean
  gameId: TicketGameId
  activeTicketRecord: MbTicketRecord | null
  mbTicketRecords: MbTicketRecord[]
  taskPopVisible: boolean
  /** 最近一次 useTicket 消耗的票券，结果弹窗关闭后用于刷新列表并选中下一项 */
  lastConsumedTicketRecord: MbTicketRecord | null
  /** 红包等无结果弹窗的玩法：递增后由 Shell 复用 refreshSessionAfterResultDismiss */
  sessionRefreshSeq: number
}

export const globalTicketToastState = reactive<GlobalTicketToastState>({
  visible: false,
  gameId: 'lucky_spin',
  activeTicketRecord: null,
  mbTicketRecords: [],
  taskPopVisible: false,
  lastConsumedTicketRecord: null,
  sessionRefreshSeq: 0
})

export const setTicketSession = (record: MbTicketRecord, records: MbTicketRecord[]) => {
  globalTicketToastState.activeTicketRecord = record
  globalTicketToastState.mbTicketRecords = records
}

export const clearTicketSession = () => {
  globalTicketToastState.activeTicketRecord = null
  globalTicketToastState.mbTicketRecords = []
  globalTicketToastState.taskPopVisible = false
  globalTicketToastState.lastConsumedTicketRecord = null
}

export const getActiveTicketParams = () => {
  const record = globalTicketToastState.activeTicketRecord
  if (!record) return {}

  return {
    ticketId: record.ticketId,
    rowId: record.rowId
  }
}

export function openTicketToast(options: OpenTicketToastOptions) {
  globalTicketToastState.gameId = options.gameId
  globalTicketToastState.visible = true
}

export function closeTicketToast() {
  globalTicketToastState.visible = false
  clearTicketSession()
  closeTicketDialog()
}

export function switchTicketGame(gameId: TicketGameId, record?: MbTicketRecord | null) {
  if (record) {
    globalTicketToastState.activeTicketRecord = record
  } else {
    const matches = findMbTicketsByGameId(globalTicketToastState.mbTicketRecords, gameId)

    if (matches.length > 0) {
      globalTicketToastState.activeTicketRecord = matches[0]!
    }
  }

  globalTicketToastState.gameId = gameId
}

export const setActiveTicketRecord = (record: MbTicketRecord | null) => {
  globalTicketToastState.activeTicketRecord = record
}

export const openTicketTaskPop = () => {
  globalTicketToastState.taskPopVisible = true
}

export const closeTicketTaskPop = () => {
  globalTicketToastState.taskPopVisible = false
}

/** 红包等原地开奖玩法：请求与结果弹窗关闭相同的列表刷新 */
export const requestTicketSessionRefresh = () => {
  globalTicketToastState.sessionRefreshSeq += 1
}
