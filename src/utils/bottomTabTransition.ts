import router from '@/router'
import { getCurrentLocale, navigateTo } from '@/utils/router'
import { withLocalePrefix } from '@/utils/locale'

const tabModuleRequests = new WeakMap<object, Promise<void>>()

/** 预加载 Tab 路由组件，不挂载页面，也不请求页面数据。 */
export const preloadBottomTabRoute = (path: string): Promise<void> => {
  const target = router.resolve(withLocalePrefix(path, getCurrentLocale()))
  const record = target.matched[target.matched.length - 1]
  const loader = record?.components?.default
  if (typeof loader !== 'function') return Promise.resolve()

  const pending = tabModuleRequests.get(loader)
  if (pending) return pending

  const request = Promise.resolve()
    .then(() => (loader as () => Promise<unknown>)())
    .then(() => {})
    .catch(error => {
      // 失败后允许正式导航或下一次预取重试。
      tabModuleRequests.delete(loader)
      throw error
    })
  tabModuleRequests.set(loader, request)
  return request
}

/** 直接切换到 H5 底部 Tab 对应的路由。 */
export const navigateBottomTab = (path: string) => navigateTo(path)
