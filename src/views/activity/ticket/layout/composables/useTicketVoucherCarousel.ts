import {
  TICKET_MOBILE_LAYOUT,
  VOUCHER_CAROUSEL_GAP,
  VOUCHER_CAROUSEL_ITEM_SIZE,
  VOUCHER_CAROUSEL_VISIBLE_SLOTS
} from '../../shared/ticketMobileLayout'
import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, toValue, watch } from 'vue'

export {
  VOUCHER_CAROUSEL_GAP,
  VOUCHER_CAROUSEL_ITEM_SIZE,
  VOUCHER_CAROUSEL_VISIBLE_SLOTS
} from '../../shared/ticketMobileLayout'

export const VOUCHER_CAROUSEL_TRACK_WIDTH = TICKET_MOBILE_LAYOUT.voucherCarousel.trackWidth

type UseTicketVoucherCarouselOptions = {
  gamesCount: Ref<number> | ComputedRef<number>
  activeIndex: Ref<number> | ComputedRef<number>
}

export function useTicketVoucherCarousel(options: UseTicketVoucherCarouselOptions) {
  const viewportRef = ref<HTMLElement | null>(null)
  const itemRefs = ref<(HTMLElement | null)[]>([])

  const showArrows = computed(() => toValue(options.gamesCount) > VOUCHER_CAROUSEL_VISIBLE_SLOTS)
  const isScrollable = showArrows

  const trackPaddingStyle = computed(() => {
    if (!isScrollable.value) {
      return undefined
    }

    return {
      paddingInline: `calc(50% - ${VOUCHER_CAROUSEL_ITEM_SIZE / 2}px)`
    }
  })

  const setItemRef = (element: unknown, index: number) => {
    itemRefs.value[index] = (element as HTMLElement | null) ?? null
  }

  const scrollToActiveIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!isScrollable.value) {
      return
    }

    const viewport = viewportRef.value
    const target = itemRefs.value[index]

    if (target) {
      target.scrollIntoView({ behavior, block: 'nearest', inline: 'center' })
      return
    }

    if (!viewport) {
      return
    }

    const itemStride = VOUCHER_CAROUSEL_ITEM_SIZE + VOUCHER_CAROUSEL_GAP
    const scrollLeft = index * itemStride - (viewport.clientWidth - VOUCHER_CAROUSEL_ITEM_SIZE) / 2
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth)

    viewport.scrollTo({
      left: Math.min(maxScroll, Math.max(0, scrollLeft)),
      behavior
    })
  }

  const syncScrollToActive = (behavior: ScrollBehavior = 'smooth') => {
    void nextTick(() => {
      scrollToActiveIndex(toValue(options.activeIndex), behavior)
    })
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    syncScrollToActive('auto')

    if (typeof ResizeObserver === 'undefined' || !viewportRef.value) {
      return
    }

    resizeObserver = new ResizeObserver(() => {
      scrollToActiveIndex(toValue(options.activeIndex), 'auto')
    })
    resizeObserver.observe(viewportRef.value)
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  watch(
    () => toValue(options.activeIndex),
    () => syncScrollToActive('smooth')
  )

  watch(
    () => toValue(options.gamesCount),
    () => syncScrollToActive('auto')
  )

  return {
    viewportRef,
    showArrows,
    isScrollable,
    trackPaddingStyle,
    setItemRef,
    scrollToActiveIndex,
    syncScrollToActive
  }
}
