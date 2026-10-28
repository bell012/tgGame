import { onDeactivated, onScopeDispose, ref, watch } from 'vue'

/** PC 快捷金额只增强鼠标操作；触屏仍使用浏览器原生横向滚动。 */
export const useQuickAmountsScroll = () => {
  const scrollElement = ref<HTMLElement | null>(null)
  const dragging = ref(false)
  let pointerId: number | null = null
  let startX = 0
  let startScrollLeft = 0
  let blockClick = false
  let activeElement: HTMLElement | null = null

  const endDrag = () => {
    const element = activeElement
    const id = pointerId
    pointerId = null
    activeElement = null
    dragging.value = false
    if (id !== null && element?.hasPointerCapture(id)) element.releasePointerCapture(id)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') {
      endDrag()
      blockClick = false
      return
    }
    if (event.button !== 0) return
    endDrag()
    blockClick = false
    const element = scrollElement.value
    if (!element || element.scrollWidth <= element.clientWidth) return
    pointerId = event.pointerId
    activeElement = element
    startX = event.clientX
    startScrollLeft = element.scrollLeft
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId || !activeElement) return
    if (!(event.buttons & 1)) {
      endDrag()
      return
    }
    const distance = event.clientX - startX
    if (!dragging.value && Math.abs(distance) <= 4) return
    if (!dragging.value) {
      dragging.value = true
      blockClick = true
      activeElement.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
    activeElement.scrollLeft = Math.max(
      0,
      Math.min(activeElement.scrollWidth - activeElement.clientWidth, startScrollLeft - distance)
    )
  }

  const onPointerEnd = (event: PointerEvent) => {
    if (event.pointerId === pointerId) endDrag()
  }
  const onPointerLeave = () => {
    if (!dragging.value) endDrag()
  }
  const onClickCapture = (event: MouseEvent) => {
    // 键盘激活的 detail 为 0，不拦截；新一轮鼠标按下会清除上次拖动标记。
    if (!blockClick || event.detail === 0) return
    blockClick = false
    event.preventDefault()
    event.stopPropagation()
  }
  const onWheel = (event: WheelEvent) => {
    const element = scrollElement.value
    if (!element || event.ctrlKey || element.scrollWidth <= element.clientWidth) return
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (!delta) return
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1
    event.preventDefault()
    element.scrollLeft = Math.max(
      0,
      Math.min(element.scrollWidth - element.clientWidth, element.scrollLeft + delta * unit)
    )
  }

  watch(scrollElement, endDrag, { flush: 'sync' })
  onDeactivated(endDrag)
  onScopeDispose(endDrag)

  return {
    scrollElement,
    dragging,
    endDrag,
    onPointerDown,
    onPointerMove,
    onPointerEnd,
    onPointerLeave,
    onClickCapture,
    onWheel
  }
}
