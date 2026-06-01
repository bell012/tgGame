import { reactive } from 'vue'
import type { OpenTicketToastOptions, TicketGameId } from './types'

interface GlobalTicketToastState {
  visible: boolean
  gameId: TicketGameId
}

export const globalTicketToastState = reactive<GlobalTicketToastState>({
  visible: false,
  gameId: 'lucky_spin'
})

export function openTicketToast(options: OpenTicketToastOptions) {
  globalTicketToastState.gameId = options.gameId
  globalTicketToastState.visible = true
}

export function closeTicketToast() {
  globalTicketToastState.visible = false
}

export function switchTicketGame(gameId: TicketGameId) {
  globalTicketToastState.gameId = gameId
}
