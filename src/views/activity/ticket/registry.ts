import type { Component } from 'vue'
import type { TicketGameId } from './types'
import LuckySpinWheel from './components/LuckySpinWheel.vue'
import GoldenEggGrid from './components/GoldenEggGrid.vue'
import MysteryBoxGrid from './components/MysteryBoxGrid.vue'
import CashVoucherClaim from './components/CashVoucherClaim.vue'
import RedPacketOpen from './components/RedPacketOpen.vue'

export const TICKET_GAME_COMPONENTS: Record<TicketGameId, Component> = {
  lucky_spin: LuckySpinWheel,
  golden_egg: GoldenEggGrid,
  mystery_box: MysteryBoxGrid,
  cash_voucher: CashVoucherClaim,
  lucky_red_envelope: RedPacketOpen
}

export function getTicketGameComponent(gameId: TicketGameId): Component {
  return TICKET_GAME_COMPONENTS[gameId] ?? GoldenEggGrid
}

export function isTicketGameImplemented(gameId: TicketGameId): boolean {
  return gameId === 'lucky_spin'
}
