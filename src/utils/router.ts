import router from '@/router'
import i18n from '@/i18n'
import {
  getLocaleFromRouteParam,
  getLocalePrefix,
  getStorageLanguageCode,
  isDefaultLocale,
  type Locale,
  withLocalePrefix
} from './locale'

/**
 * 获取当前语言前缀
 */
export const getCurrentLocale = (): string => {
  const currentRoute = router.currentRoute.value
  const routeLocale = getLocaleFromRouteParam(currentRoute.params.locale as string | undefined)

  if (routeLocale) {
    return routeLocale
  }

  return getStorageLanguageCode(String(i18n.global.locale.value))
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
  const fullPath = withLocalePrefix(normalizedPath, locale)

  const routeOptions: any = {
    path: fullPath,
    query: options?.query
  }

  if (options?.state) {
    routeOptions.state = options.state
  }

  if (options?.replace) {
    return router.replace(routeOptions)
  } else {
    return router.push(routeOptions)
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
  const routeName = isDefaultLocale(locale) ? name : `Locale${name}`
  const routeOptions: any = {
    name: routeName,
    params: isDefaultLocale(locale)
      ? options?.params
      : {
          ...options?.params,
          locale: getLocalePrefix(locale)
        },
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
  const currentFullPath = currentRoute.fullPath
  const newPath = withLocalePrefix(currentFullPath, locale)
  i18n.global.locale.value = locale
  localStorage.setItem('language', getStorageLanguageCode(locale))

  if (newPath === currentFullPath) {
    return
  }

  router.replace(newPath)
}
