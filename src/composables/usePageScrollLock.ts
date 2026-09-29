import {
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onScopeDispose,
  toValue,
  watch,
  type WatchSource
} from 'vue'

interface ScrollLockOptions {
  preventTouchMove?: boolean
}

// 每个实例只释放自己的锁，最后一个实例关闭后恢复页面。
const owners = new Map<symbol, boolean>()
let touchGuardAttached = false
let lockedScrollY = 0

let previousHtmlOverflow = ''
let previousHtmlOverscrollBehavior = ''
let previousBodyOverflow = ''
let previousBodyPosition = ''
let previousBodyTop = ''
let previousBodyWidth = ''
let previousBodyOverscrollBehavior = ''

const stopTouchMove = (event: TouchEvent) => {
  let element = event.target instanceof Element ? event.target : null
  while (element && element !== document.body && element !== document.documentElement) {
    const overflow = window.getComputedStyle(element).overflowY
    if (
      (overflow === 'auto' || overflow === 'scroll') &&
      element.scrollHeight > element.clientHeight
    ) {
      return
    }
    element = element.parentElement
  }
  if (event.cancelable) event.preventDefault()
}

const syncTouchGuard = () => {
  const needed = [...owners.values()].some(Boolean)
  if (needed === touchGuardAttached) return
  if (needed) {
    document.addEventListener('touchmove', stopTouchMove, { passive: false })
  } else {
    document.removeEventListener('touchmove', stopTouchMove)
  }
  touchGuardAttached = needed
}

const lockPageScroll = (owner: symbol, preventTouchMove: boolean) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (owners.has(owner)) return

  if (owners.size === 0) {
    const html = document.documentElement
    const body = document.body
    lockedScrollY = window.scrollY
    previousHtmlOverflow = html.style.overflow
    previousHtmlOverscrollBehavior = html.style.overscrollBehavior
    previousBodyOverflow = body.style.overflow
    previousBodyPosition = body.style.position
    previousBodyTop = body.style.top
    previousBodyWidth = body.style.width
    previousBodyOverscrollBehavior = body.style.overscrollBehavior
    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${lockedScrollY}px`
    body.style.width = '100%'
    body.style.overscrollBehavior = 'none'
  }

  owners.set(owner, preventTouchMove)
  syncTouchGuard()
}

const unlockPageScroll = (owner: symbol) => {
  if (!owners.delete(owner)) return
  syncTouchGuard()
  if (owners.size > 0) return

  const html = document.documentElement
  const body = document.body
  html.style.overflow = previousHtmlOverflow
  html.style.overscrollBehavior = previousHtmlOverscrollBehavior
  body.style.overflow = previousBodyOverflow
  body.style.position = previousBodyPosition
  body.style.top = previousBodyTop
  body.style.width = previousBodyWidth
  body.style.overscrollBehavior = previousBodyOverscrollBehavior
  window.scrollTo(0, lockedScrollY)
}

/** 页面或弹窗可见时锁住背景；停用、卸载时释放。 */
export const usePageScrollLock = (
  activeSource: WatchSource<boolean>,
  options: ScrollLockOptions = {}
) => {
  const owner = Symbol('page-scroll-lock')
  let active = true
  let disposed = false

  const syncLockState = (shouldLock: boolean) => {
    if (shouldLock && active && !disposed) {
      lockPageScroll(owner, options.preventTouchMove === true)
    } else {
      unlockPageScroll(owner)
    }
  }
  const stop = watch(activeSource, syncLockState, { immediate: true, flush: 'sync' })
  const dispose = () => {
    disposed = true
    stop()
    unlockPageScroll(owner)
  }

  onDeactivated(() => {
    active = false
    unlockPageScroll(owner)
  })
  onActivated(() => {
    active = true
    syncLockState(toValue(activeSource))
  })
  onBeforeUnmount(dispose)
  onScopeDispose(dispose)
}

// 热更新前还原样式，避免旧模块的锁留在页面上。
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const owner of owners.keys()) unlockPageScroll(owner)
  })
}
