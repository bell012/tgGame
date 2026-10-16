import { onBeforeUnmount } from 'vue'
import type { Router } from 'vue-router'

/** 在触摸开始时协调 iOS 抽屉返回手势，并处理浏览器原生历史返回的兜底。 */
export function useNativeHistoryTransition(router: Router, canSwipeBack: () => boolean) {
  let pendingNativePath: string | null = null
  let nativePath: string | null = null
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  // iOS 原生手势不一定向页面派发触摸事件，hasUAVisualTransition 也可能为 false。
  // 统一在 Vue Router 的 history.go 入口标记应用发起的返回/前进，涵盖 router.back/go。
  const history = router.options.history
  const originalGo = history.go
  let appPopPending = false
  let appPopPosition: number | null = null
  const trackedGo: typeof history.go = (delta, triggerListeners) => {
    const position = history.state.position
    appPopPending = true
    appPopPosition = typeof position === 'number' ? position + delta : null
    originalGo.call(history, delta, triggerListeners)
  }
  if (isIOS) history.go = trackedGo

  // 只在路由抽屉的左边缘接管手势。需要在 touchstart 阻止浏览器的原生返回，
  // 等到 popstate 再关闭 CSS 动画时，浏览器已经播放过自己的历史快照了。
  let swipe: { identifier: number; x: number; y: number; path: string } | null = null
  const handleTouchStart = (event: TouchEvent) => {
    swipe = null
    if (!canSwipeBack() || !history.state.back || event.touches.length !== 1) return
    const touch = event.touches[0]
    if (touch.clientX > 30 || !event.cancelable) return
    const target = event.target instanceof Element ? event.target : null
    if (!target?.closest('[data-route-drawer]')) return
    // 保留边缘按钮、链接和输入控件的正常点击与聚焦。
    if (target.closest('button, a, input, textarea, select, [role="button"], [contenteditable]')) {
      return
    }

    event.preventDefault()
    if (!event.defaultPrevented) return
    swipe = {
      identifier: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      path: router.currentRoute.value.fullPath
    }
  }
  const handleTouchMove = (event: TouchEvent) => {
    if (!swipe) return
    if (event.touches.length !== 1) {
      swipe = null
      return
    }
    if (event.cancelable) event.preventDefault()
  }
  const handleTouchEnd = (event: TouchEvent) => {
    const gesture = swipe
    swipe = null
    if (!gesture || event.type === 'touchcancel') return
    if (!canSwipeBack() || router.currentRoute.value.fullPath !== gesture.path) return
    const touch = Array.from(event.changedTouches).find(
      touch => touch.identifier === gesture.identifier
    )
    if (!touch) return
    const dx = touch.clientX - gesture.x
    const dy = Math.abs(touch.clientY - gesture.y)
    if (dx < 50 || dx <= dy * 1.2) return

    if (event.cancelable) event.preventDefault()
    // 复用按钮返回：一次手势只提交一次导航，由原有抽屉动画负责退场。
    router.back()
  }

  const handlePopState = (event: PopStateEvent) => {
    const isAppPop =
      appPopPending && (appPopPosition === null || event.state?.position === appPopPosition)
    appPopPending = false
    appPopPosition = null
    const hasNativeTransition = event.hasUAVisualTransition === true || (isIOS && !isAppPop)
    // Vue Router 的 popstate 监听先更新 history.location，再异步执行导航守卫。
    pendingNativePath = hasNativeTransition
      ? router.resolve(router.options.history.location).fullPath
      : null
  }

  window.addEventListener('popstate', handlePopState)
  if (isIOS) {
    window.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true })
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true, capture: true })
  }
  const removeAfterEach = router.afterEach((to, _from, failure) => {
    swipe = null
    nativePath = !failure && to.fullPath === pendingNativePath ? to.fullPath : null
    pendingNativePath = null
  })
  const removeErrorHandler = router.onError(() => {
    swipe = null
    pendingNativePath = null
    nativePath = null
    appPopPending = false
    appPopPosition = null
  })
  onBeforeUnmount(() => {
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('touchstart', handleTouchStart, true)
    window.removeEventListener('touchmove', handleTouchMove, true)
    window.removeEventListener('touchend', handleTouchEnd, true)
    window.removeEventListener('touchcancel', handleTouchEnd, true)
    if (history.go === trackedGo) history.go = originalGo
    removeAfterEach()
    removeErrorHandler()
  })

  return (fullPath: string) => {
    const shouldSkipTransition = nativePath === fullPath
    nativePath = null
    return shouldSkipTransition
  }
}
