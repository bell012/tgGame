import type { Router } from 'vue-router'
import { reactive } from 'vue'
import { createPopupId } from './popupSession'

// 模块状态在组件重新挂载后仍然保留；整页刷新时会重新初始化。
// 公共访问标识驱动各弹窗检查；首页语言切换和组件重挂载沿用同一次访问。
export const homePopVisitState = reactive({ hasShown: false, id: '', isHome: false })

const beginVisit = () => {
  homePopVisitState.id = createPopupId()
  homePopVisitState.hasShown = false
}

export const initHomePopupVisits = (router: Router) => {
  const removeHomePopRouteGuard = router.afterEach((to, _from, failure) => {
    // 成功离开首页后重置，再次进入首页时仍按公告原有规则判断是否展示。
    // 首页与多语言首页之间切换不重置，避免初始化语言导致重复弹出。
    if (failure) return
    const isHome = to.name === 'Home' || to.name === 'LocaleHome'
    if (isHome && !homePopVisitState.isHome) beginVisit()
    homePopVisitState.isHome = isHome
    if (!isHome) {
      homePopVisitState.hasShown = false
    }
  })

  const handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted && homePopVisitState.isHome) beginVisit()
  }
  window.addEventListener('pageshow', handlePageShow)

  // 开发环境热更新时移除旧监听，避免重复注册路由钩子。
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      removeHomePopRouteGuard()
      window.removeEventListener('pageshow', handlePageShow)
    })
  }
}
