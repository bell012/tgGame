import type { TicketGameId, TicketVoucherFooterData } from '../../shared/types'
import { getGameIcon } from '../../shared/constants'
import { getTicketModalTheme } from '../../shared/design-tokens'
import { computed, ref, watch } from 'vue'

const VISIBLE_COUNT = 5

export function useTicketVoucherSwitcher(props: TicketVoucherFooterData) {
  const startIndex = ref(0)

  const resolveIcon = (item: { id: string; icon?: string }) => item.icon ?? getGameIcon(item.id)

  const activeItemStyle = computed(() => {
    const gameId = (props.activeGameId ??
      props.games[props.activeIndex]?.id ??
      'lucky_spin') as TicketGameId
    const theme = getTicketModalTheme(gameId)
    return {
      borderColor: theme.activeBorder,
      boxShadow: theme.activeGlow
    }
  })

  const visibleItems = computed(() => {
    const end = Math.min(startIndex.value + VISIBLE_COUNT, props.games.length)
    return props.games.slice(startIndex.value, end)
  })

  watch(
    () => props.activeIndex,
    index => {
      if (index < startIndex.value) {
        startIndex.value = Math.max(0, index)
      } else if (index >= startIndex.value + VISIBLE_COUNT) {
        startIndex.value = Math.max(0, index - VISIBLE_COUNT + 1)
      }
    }
  )

  const isActive = (index: number) => index === props.activeIndex

  return {
    startIndex,
    resolveIcon,
    activeItemStyle,
    visibleItems,
    isActive
  }
}
