import router from '@/router'
import i18n from '@/i18n'

/**
 * 获取当前语言前缀
 */
export const getCurrentLocale = (): string => {
  const currentRoute = router.currentRoute.value
  const locale = currentRoute.params.locale as string
  if (locale && ['zh', 'en'].includes(locale)) {
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
export const navigateTo = (path: string, options?: { replace?: boolean; query?: Record<string, any> }) => {
  const locale = getCurrentLocale()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const fullPath = locale ? `/${locale}${normalizedPath}` : normalizedPath
  if (options?.replace) {
    router.replace({ path: fullPath, query: options?.query })
  } else {
    router.push({ path: fullPath, query: options?.query })
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
export const switchLanguage = (locale: 'zh' | 'en') => {
  const currentRoute = router.currentRoute.value
  const currentPath = currentRoute.path
  const pathWithoutLocale = currentPath.replace(/^\/(zh|en)/, '') || '/'
  const newPath = locale === 'zh' ? `/zh${pathWithoutLocale}` : pathWithoutLocale
  i18n.global.locale.value = locale
  localStorage.setItem('language', locale === 'zh' ? 'zh-CN' : 'en')
  router.push(newPath)
}

