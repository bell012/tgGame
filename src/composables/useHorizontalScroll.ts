import { nextTick, onDeactivated, ref, watch, type WatchSource } from 'vue'

// 使tab栏在pc和H5中可以左右滑动，点击可以居中
type HorizontalScrollOptions = {
  /** 点击带 data-scroll-center 的子项后，将该项滚到视口中央。 */
  centerOnClick?: boolean
  /** 数据或分组更新后，将视口移到最右侧。 */
  endOnChange?: WatchSource<unknown>
}

const dragThreshold = 6
const limitScroll = (element: HTMLElement, left: number) =>
  Math.min(Math.max(left, 0), Math.max(0, element.scrollWidth - element.clientWidth))

/** 共用横向拖动和定位。触屏、触控板以及键盘继续使用浏览器原生滚动。 */
export function useHorizontalScroll(options: HorizontalScrollOptions = {}) {
  const viewport = ref<HTMLElement | null>(null)
  const dragging = ref(false)
  let centerRequest = 0
  let endDrag: (() => void) | undefined

  /** 等选中样式和宽度动画完成后，只滚动当前容器。 */
  const centerItem = async (item: HTMLElement) => {
    const request = ++centerRequest
    const element = viewport.value
    if (!element?.contains(item)) return

    await nextTick()
    item.getBoundingClientRect()
    const widthTransitions = item
      .getAnimations?.()
      .filter(animation => (animation as CSSTransition).transitionProperty === 'width')
    if (widthTransitions?.length) {
      await Promise.allSettled(widthTransitions.map(animation => animation.finished))
    }
    if (request !== centerRequest || !element.contains(item)) return

    const itemRect = item.getBoundingClientRect()
    const viewportLeft = element.getBoundingClientRect().left + element.clientLeft
    const left =
      element.scrollLeft +
      itemRect.left +
      itemRect.width / 2 -
      viewportLeft -
      element.clientWidth / 2
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollTo({
      left: limitScroll(element, left),
      behavior: reducedMotion ? 'instant' : 'smooth'
    })
  }

  watch(
    viewport,
    (element, _, onCleanup) => {
      if (!element) return
      let pointerId: number | null = null
      let startX = 0
      let startLeft = 0
      let suppressClick = false

      const stopDrag = () => {
        const id = pointerId
        pointerId = null
        dragging.value = false
        if (id !== null && element.hasPointerCapture(id)) element.releasePointerCapture(id)
      }
      endDrag = stopDrag

      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return
        stopDrag()
        centerRequest++
        suppressClick = false
        if (event.pointerType !== 'mouse' || element.scrollWidth <= element.clientWidth) return
        pointerId = event.pointerId
        startX = event.clientX
        startLeft = element.scrollLeft
      }

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerId !== pointerId) return
        if (!(event.buttons & 1)) {
          stopDrag()
          return
        }

        const distance = event.clientX - startX
        if (!dragging.value) {
          if (Math.abs(distance) <= dragThreshold) return
          dragging.value = true
          suppressClick = true
          element.setPointerCapture(event.pointerId)
        }
        event.preventDefault()
        element.scrollTo({ left: limitScroll(element, startLeft - distance), behavior: 'instant' })
      }

      const onPointerEnd = (event: PointerEvent) => {
        if (event.pointerId === pointerId) stopDrag()
      }
      const onPointerLeave = () => {
        if (!dragging.value) stopDrag()
      }

      /** 拦截拖动松手产生的点击，保留键盘触发的点击。 */
      const onClickCapture = (event: MouseEvent) => {
        if (!suppressClick || event.detail === 0) return
        suppressClick = false
        event.preventDefault()
        event.stopPropagation()
      }
      const onClick = (event: MouseEvent) => {
        if (!options.centerOnClick || !(event.target instanceof Element)) return
        const item = event.target.closest<HTMLElement>('[data-scroll-center]')
        if (item) void centerItem(item)
      }
      const preventNativeDrag = (event: Event) => event.preventDefault()

      element.addEventListener('pointerdown', onPointerDown)
      element.addEventListener('pointermove', onPointerMove)
      element.addEventListener('pointerup', onPointerEnd)
      element.addEventListener('pointercancel', onPointerEnd)
      element.addEventListener('lostpointercapture', onPointerEnd)
      element.addEventListener('pointerleave', onPointerLeave)
      element.addEventListener('click', onClickCapture, true)
      element.addEventListener('click', onClick)
      element.addEventListener('dragstart', preventNativeDrag)

      onCleanup(() => {
        centerRequest++
        stopDrag()
        endDrag = undefined
        element.removeEventListener('pointerdown', onPointerDown)
        element.removeEventListener('pointermove', onPointerMove)
        element.removeEventListener('pointerup', onPointerEnd)
        element.removeEventListener('pointercancel', onPointerEnd)
        element.removeEventListener('lostpointercapture', onPointerEnd)
        element.removeEventListener('pointerleave', onPointerLeave)
        element.removeEventListener('click', onClickCapture, true)
        element.removeEventListener('click', onClick)
        element.removeEventListener('dragstart', preventNativeDrag)
      })
    },
    { flush: 'sync' }
  )

  if (options.endOnChange) {
    watch(
      [viewport, options.endOnChange],
      ([element]) => {
        if (element) element.scrollTo({ left: element.scrollWidth, behavior: 'instant' })
      },
      { flush: 'post' }
    )
  }

  onDeactivated(() => {
    centerRequest++
    endDrag?.()
  })

  return { viewport, dragging, centerItem }
}
