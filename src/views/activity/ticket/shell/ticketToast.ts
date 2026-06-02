import { reactive } from 'vue'
import { closeTicketDialog } from './ticketDialog'
import type { OpenTicketToastOptions, TicketGameId } from '../shared/types'

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
  closeTicketDialog()
}

export function switchTicketGame(gameId: TicketGameId) {
  globalTicketToastState.gameId = gameId
}
