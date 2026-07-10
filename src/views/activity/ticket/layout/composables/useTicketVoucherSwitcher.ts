import type { TicketGameId, TicketVoucherFooterData, VoucherGameItem } from '../../shared/types'
import { getGameIcon } from '../../shared/constants'
import { getTicketModalTheme } from '../../shared/design-tokens'
import { computed } from 'vue'

export const VOUCHER_GRID_COLUMNS = 5

export interface VoucherGridSlot extends VoucherGameItem {
  isPlaceholder?: boolean
  gameIndex?: number
}

export const buildVoucherGridSlots = (games: VoucherGameItem[]): VoucherGridSlot[] => {
  const slots: VoucherGridSlot[] = games.map((item, gameIndex) => ({
    ...item,
    gameIndex,
    isPlaceholder: false
  }))

  const remainder = slots.length % VOUCHER_GRID_COLUMNS
  if (remainder > 0) {
    for (let i = 0; i < VOUCHER_GRID_COLUMNS - remainder; i++) {
      slots.push({
        id: `voucher-grid-placeholder-${slots.length}`,
        isPlaceholder: true
      })
    }
  }

  return slots
}

export function useTicketVoucherSwitcher(props: TicketVoucherFooterData) {
  const resolveIcon = (item: { icon?: string; gameId?: TicketGameId }) =>
    item.icon ?? getGameIcon(item.gameId ?? 'lucky_spin')

  const gridSlots = computed(() => buildVoucherGridSlots(props.games))

  const resolveActiveTheme = () => {
    const gameId = (props.activeGameId ??
      props.games[props.activeIndex]?.gameId ??
      'lucky_spin') as TicketGameId
    return getTicketModalTheme(gameId)
  }

  const activeItemStyle = computed(() => {
    const theme = resolveActiveTheme()
    return {
      borderColor: theme.activeBorder,
      boxShadow: theme.activeGlow
    }
  })

  const countHighlightColor = computed(() => resolveActiveTheme().countHighlight)

  const isSlotActive = (slot: VoucherGridSlot) =>
    !slot.isPlaceholder && slot.gameIndex === props.activeIndex

  const isGameActive = (gameIndex: number) => gameIndex === props.activeIndex

  return {
    gridSlots,
    resolveIcon,
    activeItemStyle,
    countHighlightColor,
    isSlotActive,
    isGameActive
  }
}
