import type { MbTicketRecord } from '@/api/interface/activity'
import { findMbTicketsByGameId } from '../shared/mbTicketMapper'
import { reactive } from 'vue'
import { closeTicketDialog } from './ticketDialog'
import type { OpenTicketToastOptions, TicketGameId } from '../shared/types'

interface GlobalTicketToastState {
  visible: boolean
  gameId: TicketGameId
  activeTicketRecord: MbTicketRecord | null
  mbTicketRecords: MbTicketRecord[]
}

export const globalTicketToastState = reactive<GlobalTicketToastState>({
  visible: false,
  gameId: 'lucky_spin',
  activeTicketRecord: null,
  mbTicketRecords: []
})

export const setTicketSession = (record: MbTicketRecord, records: MbTicketRecord[]) => {
  globalTicketToastState.activeTicketRecord = record
  globalTicketToastState.mbTicketRecords = records
}

export const clearTicketSession = () => {
  globalTicketToastState.activeTicketRecord = null
  globalTicketToastState.mbTicketRecords = []
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
