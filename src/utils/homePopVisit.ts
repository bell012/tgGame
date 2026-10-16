import router from '@/router'

// 模块状态在组件重新挂载后仍然保留；整页刷新时会重新初始化。
// 仅用于请求前后的去重判断，不参与模板渲染，因此无需使用响应式状态。
export const homePopVisitState = {
  hasShown: false
}

const removeHomePopRouteGuard = router.afterEach((to, _from, failure) => {
  // 成功离开首页后重置，再次进入首页时仍按公告原有规则判断是否展示。
  // 首页与多语言首页之间切换不重置，避免初始化语言导致重复弹出。
  if (!failure && to.name !== 'Home' && to.name !== 'LocaleHome') {
    homePopVisitState.hasShown = false
  }
})

// 开发环境热更新时移除旧监听，避免重复注册路由钩子。
if (import.meta.hot) {
  import.meta.hot.dispose(removeHomePopRouteGuard)
}
