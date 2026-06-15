import type {
  TicketActivitySession,
  TicketGameId,
  TicketModalHeaderData,
  TicketVoucherFooterData,
  WinnerTickerItem
} from '../../shared/types'
import type { Component } from 'vue'

/** 活动页玩法区 + 会话数据（Mobile / Desktop 共用） */
export interface TicketActivityCoreProps {
  isLoading: boolean
  loadError: boolean
  isInteractionLocked: boolean
  activitySession: TicketActivitySession | null
  headerData: TicketModalHeaderData
  gameId: TicketGameId
  gameComponent: Component
  gameComponentProps: Record<string, unknown>
  gameComponentListeners: Record<string, (...args: unknown[]) => void>
  setGameRef: (el: unknown) => void
  winnerRecords: WinnerTickerItem[]
  voucherSwitcherProps: TicketVoucherFooterData
}

export type TicketActivityLayoutProps = TicketActivityCoreProps

export type TicketActivityContentProps = TicketActivityCoreProps & {
  stateLayout: 'mobile' | 'desktop'
  panelStyle?: Record<string, string>
}

export const ticketActivityCoreEmitNames = [
  'close',
  'open-reminder',
  'retry',
  'select',
  'prev',
  'next',
  'open-voucher-list'
] as const

export type TicketActivityCoreEmits = {
  close: []
  'open-reminder': []
  retry: []
  select: [index: number]
  prev: []
  next: []
  'open-voucher-list': []
}
