import { nextTick } from 'vue'
import router from '@/router'
import { getCurrentLocale, navigateTo } from '@/utils/router'
import { withLocalePrefix } from '@/utils/locale'

const TAB_NAMES = ['Home', 'explore', 'casino', 'sports']
const getTabIndex = (name: unknown) => {
  const normalizedName = String(name || '').replace(/^Locale/, '')
  return TAB_NAMES.indexOf(normalizedName === 'casinoTabKey' ? 'casino' : normalizedName)
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

/** 使用浏览器快照做整屏滑动，真实页面仍只激活一次，不同时布局两个长列表。 */
export const navigateBottomTab = async (path: string) => {
  cancelBottomTabTransition()
  const version = navigationVersion
  const from = router.currentRoute.value
  const to = router.resolve(withLocalePrefix(path, getCurrentLocale()))
  const fromIndex = getTabIndex(from.name)
  const toIndex = getTabIndex(to.name)

  // slideTransition 始终交给原来的抽屉流程，客服也遵循相同规则。
  // 旧版 WebView 使用布局中的普通滑动降级，不影响正常导航。
  if (
    from.meta.slideTransition ||
    to.meta.slideTransition ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex === toIndex ||
    typeof document.startViewTransition !== 'function' ||
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
