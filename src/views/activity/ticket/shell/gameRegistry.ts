import type { Component } from 'vue'
import type { TicketGameId } from '../shared/types'
import GoldenEggGrid from '../components/golden-egg/GoldenEggGrid.vue'
import MysteryBoxGrid from '../components/mystery-box/MysteryBoxGrid.vue'
import CashVoucherClaim from '../components/cash-voucher/CashVoucherClaim.vue'
import RedPacketOpen from '../components/lucky-red-envelope/RedPacketOpen.vue'
import { luckySpinAdapter } from '../components/lucky-spin/luckySpinAdapter'
import { createStubGameAdapter } from './stubGameAdapter'
import type { TicketGameRuntimeContext } from './ticketActivityContext'

export interface TicketGameAdapter {
  gameId: TicketGameId
  component: Component
  resolveProps: (ctx: TicketGameRuntimeContext) => Record<string, unknown>
  resolveListeners: (ctx: TicketGameRuntimeContext) => Record<string, (...args: unknown[]) => void>
  registerRef?: (el: unknown, ctx: TicketGameRuntimeContext) => void
  onReset?: () => void
  onResultDismiss?: (ctx: TicketGameRuntimeContext) => void | Promise<void>
}

const cashVoucherAdapter: TicketGameAdapter = {
  gameId: 'cash_voucher',
  component: CashVoucherClaim,
  resolveProps: () => ({}),
  resolveListeners: () => ({})
}

const redEnvelopeAdapter: TicketGameAdapter = {
  gameId: 'lucky_red_envelope',
  component: RedPacketOpen,
  resolveProps: () => ({}),
  resolveListeners: () => ({})
}

export const TICKET_GAME_ADAPTERS: Record<TicketGameId, TicketGameAdapter> = {
  lucky_spin: luckySpinAdapter,
  golden_egg: createStubGameAdapter('golden_egg', GoldenEggGrid),
  mystery_box: createStubGameAdapter('mystery_box', MysteryBoxGrid),
  cash_voucher: cashVoucherAdapter,
  lucky_red_envelope: redEnvelopeAdapter
}

export function getTicketGameAdapter(gameId: TicketGameId): TicketGameAdapter {
  return TICKET_GAME_ADAPTERS[gameId] ?? TICKET_GAME_ADAPTERS.golden_egg
}

/** @deprecated use getTicketGameAdapter */
export function getTicketGameComponent(gameId: TicketGameId): Component {
  return getTicketGameAdapter(gameId).component
}

export function isTicketGameImplemented(gameId: TicketGameId): boolean {
  return gameId === 'lucky_spin' || gameId === 'lucky_red_envelope'
}
