import type { ComputedRef } from 'vue'
import { onUnmounted, watch } from 'vue'

export function useTicketEscapeClose(visible: ComputedRef<boolean>, handleClosePage: () => void) {
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    handleClosePage()
  }

  watch(visible, nextVisible => {
    if (nextVisible) {
      document.addEventListener('keydown', handleEscapeKey)
      return
    }
    document.removeEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey)
  })
}
