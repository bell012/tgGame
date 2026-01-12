import { onBeforeUnmount, watch, type Ref } from 'vue'

//当弹窗显示时锁住页面背景滚动，但允许弹窗内部的可滚动区域用手指正常上下滑动。

let lockCount = 0
const isScrollableY = (el: HTMLElement) => {
  const style = window.getComputedStyle(el)
  const oy = style.overflowY
  return (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight
}

const stopTouchMove = (e: TouchEvent) => {
  let el = e.target as HTMLElement | null
  while (el && el !== document.body && el !== document.documentElement) {
    if (isScrollableY(el)) return
    el = el.parentElement
  }

  e.preventDefault()
}

function lock() {
  if (lockCount === 0) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('touchmove', stopTouchMove, { passive: false })
  }
  lockCount++
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = ''
    document.removeEventListener('touchmove', stopTouchMove)
  }
}

/**
 * visible=true 时锁 body 滚动；visible=false 解锁
 *
 */
export function useLockBodyScroll(visible: Ref<boolean> | (() => boolean)) {
  const get = typeof visible === 'function' ? visible : () => visible.value

  watch(get, v => (v ? lock() : unlock()), { immediate: true })

  onBeforeUnmount(() => {
    if (get()) unlock()
  })
}
