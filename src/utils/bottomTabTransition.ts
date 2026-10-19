import { nextTick } from 'vue'
import router from '@/router'
import { getCurrentLocale, navigateTo } from '@/utils/router'
import { withLocalePrefix } from '@/utils/locale'

const TAB_NAMES = ['Home', 'explore', 'casino', 'sports']
const tabModuleRequests = new WeakMap<object, Promise<void>>()

/** 空闲预取与手指按下时的优先预取共用任务，只加载代码，不提前挂载页面或触发业务接口。 */
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

const getTabIndex = (name: unknown) => {
  const normalizedName = String(name || '').replace(/^Locale/, '')
  return TAB_NAMES.indexOf(normalizedName === 'casinoTabKey' ? 'casino' : normalizedName)
}

const shouldUseSnapshotTransition = () => {
  // 安卓使用直接合成滑动：导航不再等待整屏快照捕获，减少点击后的停顿。
  // iOS 保留现有快照动画；不支持快照的浏览器也使用相同的直接滑动流程。
  const isAndroid = /Android/i.test(navigator.userAgent)
  return !isAndroid && typeof document.startViewTransition === 'function'
}

let activeTransition: ViewTransition | null = null
let activeTargetPath = ''
let navigationVersion = 0

export const isBottomTabSnapshotActive = () => activeTransition !== null

export const cancelBottomTabTransition = () => {
  navigationVersion += 1
  activeTransition?.skipTransition()
  activeTransition = null
  activeTargetPath = ''
  delete document.documentElement.dataset.bottomTabMotion
}

/** 其他入口跳转时立即结束旧的 Tab 动画，让详情页与客服的抽屉动画正常接管。 */
export const cancelUnrelatedTabTransition = (fullPath: string) => {
  // 搜索页首次进入会同步 query，仍属于同一目标页，不因此中断入场动画。
  if (activeTransition && router.resolve(fullPath).path !== activeTargetPath) {
    cancelBottomTabTransition()
  }
}

/** 按平台选择动画方式，页面始终复用缓存，避免同时布局两个长列表。 */
export const navigateBottomTab = async (path: string) => {
  cancelBottomTabTransition()
  const version = navigationVersion
  const from = router.currentRoute.value
  const to = router.resolve(withLocalePrefix(path, getCurrentLocale()))
  const fromIndex = getTabIndex(from.name)
  const toIndex = getTabIndex(to.name)

  // slideTransition 始终交给原来的抽屉流程，客服也遵循相同规则。
  // 安卓与旧版 WebView 直接导航，由布局播放完整横向滑入，不等待快照准备。
  if (
    from.meta.slideTransition ||
    to.meta.slideTransition ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex === toIndex ||
    !shouldUseSnapshotTransition() ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return navigateTo(path)
  }

  activeTargetPath = to.path
  document.documentElement.dataset.bottomTabMotion = toIndex > fromIndex ? 'left' : 'right'
  const transition = document.startViewTransition(async () => {
    // 新点击已接管导航时，不再执行尚未开始的旧跳转。
    if (version !== navigationVersion) return
    const failure = await navigateTo(path)
    // 等页面激活和滚动恢复完成后再捕获新画面，避免动画结束时补一次滚动。
    await nextTick()
    if (failure || version !== navigationVersion) transition.skipTransition()
  })
  activeTransition = transition

  // 浏览器取消快照、页面进入后台等情况只跳过动画，不重试或重复执行导航。
  void transition.ready.catch(() => {})
  const cleanup = () => {
    if (activeTransition !== transition) return
    activeTransition = null
    activeTargetPath = ''
    delete document.documentElement.dataset.bottomTabMotion
  }
  void transition.finished.then(cleanup, cleanup)
  await transition.updateCallbackDone
}
