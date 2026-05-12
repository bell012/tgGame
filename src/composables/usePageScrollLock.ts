import { onBeforeUnmount, watch, type WatchSource } from 'vue'

/**
 * 页面滚动锁的全局状态。
 *
 * 是为了让多个页面 / 弹窗 / 抽屉可以共享同一套锁状态。
 *
 * 例如：
 * - A 页面已经锁住 body
 * - 此时又打开了 B 弹窗，也要锁 body
 * - 只有当 A / B 都释放后，才真正恢复页面滚动
 */
let lockCount = 0

/** 当前锁定页面时记录的页面纵向滚动位置。 */
let lockedScrollY = 0

/** 锁定前 html / body 上的原始样式，解锁时需要完整恢复。 */
let previousHtmlOverflow = ''
let previousHtmlOverscrollBehavior = ''
let previousBodyOverflow = ''
let previousBodyPosition = ''
let previousBodyTop = ''
let previousBodyWidth = ''
let previousBodyOverscrollBehavior = ''

const lockPageScroll = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }
  if (lockCount === 0) {
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
  lockCount += 1
}

/**
 * 释放页面滚动锁。
 *
 * 只有当所有持有锁的页面 / 弹窗都释放完毕后，
 * 才会真正恢复 html / body 的原始样式。
 */
const unlockPageScroll = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined' || lockCount === 0) {
    return
  }
  lockCount -= 1
  if (lockCount > 0) {
    return
  }

  const html = document.documentElement
  const body = document.body

  /** 恢复进入锁定前的样式。 */
  html.style.overflow = previousHtmlOverflow
  html.style.overscrollBehavior = previousHtmlOverscrollBehavior
  body.style.overflow = previousBodyOverflow
  body.style.position = previousBodyPosition
  body.style.top = previousBodyTop
  body.style.width = previousBodyWidth
  body.style.overscrollBehavior = previousBodyOverscrollBehavior
  window.scrollTo(0, lockedScrollY)
}

/**
 * 根据响应式布尔值控制“页面滚动锁”。
 *
 * @param activeSource
 * 一个响应式布尔值来源：
 * - true: 锁定页面滚动
 * - false: 恢复页面滚动
 *
 * 适用场景：
 * - 全屏移动端页面
 * - 登录 / 注册抽屉
 * - 弹窗、遮罩、底部弹层
 *
 * 示例：
 * - usePageScrollLock(() => props.visible)
 * - usePageScrollLock(() => isMobile.value)
 */
export const usePageScrollLock = (activeSource: WatchSource<boolean>) => {
  let isLockedByCurrentInstance = false
  const syncLockState = (shouldLock: boolean) => {
    if (shouldLock && !isLockedByCurrentInstance) {
      lockPageScroll()
      isLockedByCurrentInstance = true
      return
    }

    if (!shouldLock && isLockedByCurrentInstance) {
      unlockPageScroll()
      isLockedByCurrentInstance = false
    }
  }
  watch(activeSource, syncLockState, { immediate: true })
  onBeforeUnmount(() => syncLockState(false))
}
