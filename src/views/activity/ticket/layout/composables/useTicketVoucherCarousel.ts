import {
  TICKET_MOBILE_LAYOUT,
  VOUCHER_CAROUSEL_GAP,
  VOUCHER_CAROUSEL_ITEM_SIZE,
  VOUCHER_CAROUSEL_VISIBLE_SLOTS
} from '../../shared/layout-tokens/ticketMobileLayout'
import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, toValue, watch } from 'vue'

export {
  VOUCHER_CAROUSEL_GAP,
  VOUCHER_CAROUSEL_ITEM_SIZE,
  VOUCHER_CAROUSEL_VISIBLE_SLOTS
} from '../../shared/layout-tokens/ticketMobileLayout'

export const VOUCHER_CAROUSEL_TRACK_WIDTH = TICKET_MOBILE_LAYOUT.voucherCarousel.trackWidth

type UseTicketVoucherCarouselOptions = {
  gamesCount: Ref<number> | ComputedRef<number>
  activeIndex: Ref<number> | ComputedRef<number>
}

const SCROLL_RETRY_FRAMES = 2

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
      paddingInline: `calc(50% - ${TICKET_MOBILE_LAYOUT.voucherCarousel.activeSlotSize / 2}px)`
    }
  })

  const setItemRef = (element: unknown, index: number) => {
    itemRefs.value[index] = (element as HTMLElement | null) ?? null
  }

  const scrollToActiveIndexFallback = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const viewport = viewportRef.value
    if (!viewport || !isScrollable.value) {
      return
    }

    // 轨道 paddingInline = 50% - activeSlotSize/2，选中项居中时 scrollLeft 恰为 index * stride
    const itemStride = VOUCHER_CAROUSEL_ITEM_SIZE + VOUCHER_CAROUSEL_GAP
    const scrollLeft = index * itemStride
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth)

    viewport.scrollTo({
      left: Math.min(maxScroll, Math.max(0, scrollLeft)),
      behavior
    })
  }

  const scrollToActiveIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!isScrollable.value) {
      return true
    }

    const target = itemRefs.value[index]

    if (target) {
      target.scrollIntoView({ behavior, block: 'nearest', inline: 'center' })
      return true
    }

    return false
  }

  const scrollToActiveIndexWithRetry = (
    index: number,
    behavior: ScrollBehavior = 'smooth',
    retriesLeft = SCROLL_RETRY_FRAMES
  ) => {
    if (scrollToActiveIndex(index, behavior)) {
      return
    }

    if (retriesLeft <= 0) {
      scrollToActiveIndexFallback(index, behavior)
      return
    }

    requestAnimationFrame(() => {
      scrollToActiveIndexWithRetry(index, behavior, retriesLeft - 1)
    })
  }

  const syncScrollToActive = (behavior: ScrollBehavior = 'smooth') => {
    const index = toValue(options.activeIndex)

    void nextTick(() => {
      requestAnimationFrame(() => {
        scrollToActiveIndexWithRetry(index, behavior)
      })
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
    () => toValue(options.gamesCount),
    () => {
      itemRefs.value = []
    },
    { flush: 'pre' }
  )

  watch(
    () => [toValue(options.gamesCount), toValue(options.activeIndex)] as const,
    ([gamesCount], [prevGamesCount]) => {
      const behavior = gamesCount !== prevGamesCount ? 'auto' : 'smooth'
      syncScrollToActive(behavior)
    },
    { flush: 'post' }
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
