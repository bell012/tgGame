import type { MbTicketRecord } from '@/api/interface/activity'
import type { InjectionKey, Ref } from 'vue'
import type { TicketPrize, TicketActivitySession } from '../shared/types'
import { getActiveTicketParams } from './ticketToast'

export interface TicketActivityContext {
  activeTicketRecord: Ref<MbTicketRecord | null>
  getActiveTicketParams: typeof getActiveTicketParams
}

export const TICKET_ACTIVITY_CONTEXT_KEY: InjectionKey<TicketActivityContext> =
  Symbol('ticketActivityContext')

/** 玩法动态组件运行时上下文（由 TicketActivityOrchestrator provide） */
export interface TicketGameRuntimeContext {
  activitySession: Ref<TicketActivitySession | null>
  isInteractionLocked: Ref<boolean>
  /** 大转盘专用运行时（其它玩法为 undefined） */
  spin?: {
    wheelPrizes: Ref<TicketPrize[]>
    canSpin: Ref<boolean>
    registerWheelRef: (el: unknown) => void
    onGo: () => void
    onSpinEnd: () => void
  }
}

export const TICKET_GAME_RUNTIME_CONTEXT_KEY: InjectionKey<TicketGameRuntimeContext> = Symbol(
  'ticketGameRuntimeContext'
)
