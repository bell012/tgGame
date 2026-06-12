import type { Component } from 'vue'
import LuckySpinWheel from './LuckySpinWheel.vue'
import type { TicketGameAdapter } from '../../shell/gameRegistry'
import type { TicketGameRuntimeContext } from '../../shell/ticketActivityContext'

export const luckySpinAdapter: TicketGameAdapter = {
  gameId: 'lucky_spin',
  component: LuckySpinWheel as Component,
  resolveProps: (ctx: TicketGameRuntimeContext) => {
    if (!ctx.activitySession.value || !ctx.spin) return {}
    return {
      prizes: ctx.spin.wheelPrizes.value,
      disabled: !ctx.spin.canSpin.value || ctx.isInteractionLocked.value
    }
  },
  resolveListeners: (
    ctx: TicketGameRuntimeContext
  ): Record<string, (...args: unknown[]) => void> => {
    if (!ctx.spin) return {}
    return {
      go: ctx.spin.onGo,
      spinEnd: ctx.spin.onSpinEnd
    }
  },
  registerRef: (el, ctx) => {
    ctx.spin?.registerWheelRef(el)
  }
}
