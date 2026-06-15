import { getTicketGameAdapter } from '../../shell/gameRegistry'
import { TICKET_GAME_RUNTIME_CONTEXT_KEY } from '../../shell/ticketActivityContext'
import type { TicketActivitySession, TicketGameId } from '../../shared/types'
import type { MaybeRefOrGetter } from 'vue'
import { computed, inject, toValue } from 'vue'

export function useTicketGameSlot(props: {
  gameId: MaybeRefOrGetter<TicketGameId>
  activitySession: MaybeRefOrGetter<TicketActivitySession | null>
  activeGameIndex: MaybeRefOrGetter<number>
}) {
  const gameRuntimeContext = inject(TICKET_GAME_RUNTIME_CONTEXT_KEY)

  const gameAdapter = computed(() => getTicketGameAdapter(toValue(props.gameId)))

  const gameComponent = computed(() => gameAdapter.value.component)

  const gameComponentProps = computed(() => {
    if (!gameRuntimeContext) return {}
    void gameRuntimeContext.spin
    return gameAdapter.value.resolveProps(gameRuntimeContext)
  })

  const gameComponentListeners = computed(() => {
    if (!gameRuntimeContext) return {}
    void gameRuntimeContext.spin
    return gameAdapter.value.resolveListeners(gameRuntimeContext)
  })

  const setGameRef = (el: unknown) => {
    if (!gameRuntimeContext) return
    void gameRuntimeContext.spin
    gameAdapter.value.registerRef?.(el, gameRuntimeContext)
  }

  const voucherSwitcherProps = computed(() => {
    const session = toValue(props.activitySession)
    return {
      games: session?.voucherGames ?? [],
      activeIndex: toValue(props.activeGameIndex),
      totalVouchers: session?.totalVouchers ?? 0,
      activeGameId: toValue(props.gameId)
    }
  })

  return {
    gameComponent,
    gameComponentProps,
    gameComponentListeners,
    setGameRef,
    voucherSwitcherProps
  }
}
