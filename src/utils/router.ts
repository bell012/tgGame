import router from '@/router'
import i18n from '@/i18n'
import { getStorageLanguageCode, SUPPORTED_LOCALES, type Locale } from './locale'

/**
 * 获取当前语言前缀
 */
export const getCurrentLocale = (): string => {
  const currentRoute = router.currentRoute.value
  const locale = currentRoute.params.locale as string
  if (locale && SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale
  }
  const currentLang = i18n.global.locale.value
  return currentLang === 'zh' ? 'zh' : ''
}

/**
 * 导航到指定路径（自动处理语言前缀）
 * @param path - 目标路径
 * @param options - 可选的路由选项
 * @example
 */
export const navigateTo = (
  path: string,
  options?: { replace?: boolean; query?: Record<string, any>; state?: any }
) => {
  const locale = getCurrentLocale()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const fullPath = locale ? `/${locale}${normalizedPath}` : normalizedPath

  const routeOptions: any = {
    path: fullPath,
    query: options?.query
  }

  if (options?.state) {
    routeOptions.state = options.state
  }

  if (options?.replace) {
    router.replace(routeOptions)
  } else {
    router.push(routeOptions)
  }
}

/**
 * 导航到指定路由名称（自动处理语言前缀）
 * @param name - 路由名称
 * @param options - 可选的路由选项
 * @example
 */
export const navigateToName = (
  name: string,
  options?: { replace?: boolean; params?: Record<string, any>; query?: Record<string, any> }
) => {
  const locale = getCurrentLocale()
  const routeName = locale ? `Locale${name}` : name
  const routeOptions: any = {
    name: routeName,
    params: options?.params,
    query: options?.query
  }

  if (options?.replace) {
    router.replace(routeOptions)
  } else {
    router.push(routeOptions)
  }
}

/**
 * 切换语言并跳转到对应的语言路由
 * @param locale - 目标语言
 * @example
 */
export const switchLanguage = (locale: Locale) => {
  const currentRoute = router.currentRoute.value
  const currentPath = currentRoute.path
  const pathWithoutLocale = currentPath.replace(/^\/(zh|eng)/, '') || '/'
  const newPath = locale === 'zh' ? `/zh${pathWithoutLocale}` : pathWithoutLocale
  i18n.global.locale.value = locale === 'zh' ? 'zh' : 'eng'
  localStorage.setItem('language', getStorageLanguageCode(locale))
  router.push(newPath)
}
