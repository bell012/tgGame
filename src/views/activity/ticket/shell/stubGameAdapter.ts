import type { Component } from 'vue'
import type { TicketGameId } from '../shared/types'
import type { TicketGameAdapter } from './gameRegistry'

export const createStubGameAdapter = (
  gameId: TicketGameId,
  component: Component
): TicketGameAdapter => ({
  gameId,
  component,
  resolveProps: () => ({}),
  resolveListeners: () => ({})
})
