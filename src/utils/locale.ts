/**
 * 语言与币种的统一配置和工具集合。
 *
 * - 语言配置
 * - 语言前缀处理
 * - 语言显示文案
 * - 币种格式化工具
 */
export const LOCALE_CONFIG = {
  eng: {
    code: 'eng',
    label: 'English',
    urlPrefix: '',
    searchKeywords: ['english', 'eng']
  },
  zh: {
    code: 'zh',
    label: '简体中文',
    urlPrefix: 'zh',
    searchKeywords: ['简体中文', 'zh']
  }
} as const

/**
 * 系统支持的语言 code 列表。
 *
 */
export const SUPPORTED_LOCALES = Object.keys(LOCALE_CONFIG) as Locale[]

/**
 * 系统支持的语言类型。
 *
 * 类型值来自 `LOCALE_CONFIG` 的 key，例如：`eng`、`zh`。
 */
export type Locale = keyof typeof LOCALE_CONFIG

/**
 * 语言选项类型。
 *
 * 主要用于语言下拉、弹窗列表等 UI 组件。
 */
export type LocaleOption = { code: Locale; label: string }

/**
 * 手机区号选项类型
 */
export type AreaCodeOption = {
  code: string
  display: string
  label: string
}

/**
 * 系统默认语言。
 *
 * 默认语言通常不带 URL 前缀。
 */
export const DEFAULT_LOCALE: Locale = 'eng'

/**
 * 系统支持的手机号区号配置。
 *
 */
export const AREA_CODE_CONFIG = {
  PH: {
    code: '63',
    display: '+63',
    label: 'Philippines'
  }
} as const

/**
 * 系统支持的手机号区号 key。
 *
 */
export type AreaCodeKey = keyof typeof AREA_CODE_CONFIG

/**
 * 系统默认手机号区号 key。
 *
 */
export const DEFAULT_AREA_CODE_KEY: AreaCodeKey = 'PH'

/**
 * 获取默认手机号区号。
 * @returns 默认区号字符串，例如 `63`
 * @example
 */
export const getDefaultAreaCode = (): string => {
  return AREA_CODE_CONFIG[DEFAULT_AREA_CODE_KEY].code
}

/**
 * 获取默认手机号区号展示文案。
 * @returns 默认区号展示字符串，例如 `+63`
 * @example
 */
export const getDefaultAreaCodeDisplay = (): string => {
  return AREA_CODE_CONFIG[DEFAULT_AREA_CODE_KEY].display
}

/**
 * 获取系统支持的手机号区号选项。
 * @returns 区号选项数组，可直接用于下拉或弹窗列表
 * @example
 */
export const getAreaCodeOptions = (): AreaCodeOption[] => {
  return Object.values(AREA_CODE_CONFIG).map(item => ({ ...item }))
}

const normalizePathname = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return normalizedPath || '/'
}

const splitPath = (path: string) => {
  const normalizedPath = path || '/'
  const suffixIndex = normalizedPath.search(/[?#]/)

  if (suffixIndex === -1) {
    return {
      pathname: normalizePathname(normalizedPath),
      suffix: ''
    }
  }

  return {
    pathname: normalizePathname(normalizedPath.slice(0, suffixIndex) || '/'),
    suffix: normalizedPath.slice(suffixIndex)
  }
}

/**
 * 判断给定值是否为系统支持的语言。
 * @param value - 待判断的语言值
 * @returns 是否为受支持的语言 code
 * @example
 */
export const isSupportedLocale = (value?: string | null): value is Locale => {
  return Boolean(value && Object.prototype.hasOwnProperty.call(LOCALE_CONFIG, value))
}

/**
 * 从路由参数中解析语言。
 * @param routeParam - 路由中的 locale 参数
 * @returns 匹配到的语言；未匹配时返回 null
 * @example
 */
export const getLocaleFromRouteParam = (routeParam?: string | null): Locale | null => {
  if (!routeParam) {
    return null
  }

  const locale = SUPPORTED_LOCALES.find(code => {
    const config = LOCALE_CONFIG[code]
    return config.urlPrefix === routeParam || config.code === routeParam
  })

  return locale ?? null
}

/**
 * 解析任意语言值为系统内部合法语言。
 * @param value - 任意来源的语言值，如 localStorage、route param、i18n 值
 * @returns 解析后的合法语言 code；无法识别时返回默认语言
 * @example
 */
export const resolveLocale = (value?: string | null): Locale => {
  if (isSupportedLocale(value)) {
    return value
  }

  return getLocaleFromRouteParam(value) ?? DEFAULT_LOCALE
}

/**
 * 获取当前本地存储中的语言。
 * @returns localStorage 中保存的合法语言；不存在或非法时返回默认语言
 * @example
 */
export const getStoredLocale = (): Locale => {
  return resolveLocale(localStorage.getItem('language'))
}

/**
 * 获取用户真实已持久化保存的语言。
 * @returns 已保存的合法语言；如果尚未保存则返回 null
 * @example
 */
export const getPersistedLocale = (): Locale | null => {
  const storedLocale = localStorage.getItem('language')

  if (!storedLocale) {
    return null
  }

  return isSupportedLocale(storedLocale) ? storedLocale : getLocaleFromRouteParam(storedLocale)
}

/**
 * 获取指定语言对应的完整配置。
 * @param locale - 语言 code
 * @returns 对应的语言配置；未传或非法时返回默认语言配置
 * @example
 */
export const getLocaleConfig = (locale?: string | null) => {
  return LOCALE_CONFIG[resolveLocale(locale)]
}

/**
 * 获取指定语言的显示名称。
 * @param locale - 语言 code
 * @returns 语言显示文案，如 `English`、`简体中文`
 * @example
 */
export const getLocaleLabel = (locale?: string | null): string => {
  return getLocaleConfig(locale).label
}

/**
 * 获取指定语言的搜索关键字列表。
 * @param locale - 语言 code
 * @returns 可用于搜索匹配的关键字数组
 * @example
 */
export const getLocaleSearchKeywords = (locale?: string | null): string[] => {
  return [...getLocaleConfig(locale).searchKeywords]
}

/**
 * 获取语言选项列表。
 * @returns 供 UI 使用的语言选项数组
 * @example
 */
export const getLocaleOptions = (): LocaleOption[] => {
  return SUPPORTED_LOCALES.map(code => ({
    code,
    label: LOCALE_CONFIG[code].label
  }))
}

/**
 * 获取指定语言对应的 URL 前缀。
 * @param locale - 语言 code
 * @returns URL 前缀；默认语言通常为空字符串
 * @example
 */
export const getLocalePrefix = (locale?: string | null): string => {
  return getLocaleConfig(locale).urlPrefix
}

/**
 * 判断指定语言是否为默认语言。
 * @param locale - 语言 code
 * @returns 是否为默认语言
 * @example
 */
export const isDefaultLocale = (locale?: string | null): boolean => {
  return resolveLocale(locale) === DEFAULT_LOCALE
}

/**
 * 移除路径中的语言前缀。
 * @param path - 原始路径
 * @returns 去掉语言前缀后的路径，并保留 query/hash
 * @example
 */
export const stripLocalePrefix = (path: string): string => {
  const { pathname, suffix } = splitPath(path)
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length > 0 && getLocaleFromRouteParam(segments[0])) {
    const strippedPath = `/${segments.slice(1).join('/')}`
    return `${strippedPath === '/' ? '/' : strippedPath || '/'}${suffix}`
  }

  return `${pathname}${suffix}`
}

/**
 * 为路径补上指定语言前缀。
 * @param path - 原始路径
 * @param locale - 目标语言
 * @returns 带有目标语言前缀的路径，并保留 query/hash
 * @example
 */
export const withLocalePrefix = (path: string, locale?: string | null): string => {
  const { pathname, suffix } = splitPath(stripLocalePrefix(path))
  const prefix = getLocalePrefix(locale)

  if (!prefix) {
    return `${pathname}${suffix}`
  }

  const normalizedPath = pathname === '/' ? '' : pathname
  return `/${prefix}${normalizedPath}${suffix}`
}

/**
 * 语言代码转换：将存储的语言代码转换为 i18n 使用的语言代码
 * @param language - 存储的语言代码 (zh 或 eng)
 * @returns i18n 使用的语言代码 (zh 或 eng)
 * @example
 */
export const getLanguageCode = (language?: string): string => {
  return resolveLocale(language || localStorage.getItem('language'))
}

/**
 * i18n 语言代码转换为存储的语言代码
 * @param i18nLocale - i18n 使用的语言代码 (zh 或 eng)
 * @returns 存储的语言代码 (zh 或 eng)
 * @example
 */
export const getStorageLanguageCode = (i18nLocale: string): string => {
  return resolveLocale(i18nLocale)
}

/**
 * 获取当前币种代码
 * @returns 当前币种代码，默认为 PHP
 * @example
 */
export const getCurrentCurrency = (): string => {
  const currency = localStorage.getItem('currency')
  if (!currency || currency === 'none') {
    return 'PHP'
  }
  return currency
}

/**
 * 获取币种符号
 * @param currency - 币种代码（可选，默认使用当前币种）
 * @returns 币种符号
 * @example
 */
export const getCurrencySymbol = (currency?: string): string => {
  const currencyCode = currency || getCurrentCurrency()

  const currencyMap: Record<string, string> = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    BTC: '₿'
  }

  return currencyMap[currencyCode.toUpperCase()] || currencyCode.toUpperCase() + ' '
}

/**
 * 格式化余额
 * @param balance - 余额数值
 * @param decimals - 小数位数，默认为 2
 * @returns 格式化后的余额字符串
 * @example
 */
export const formatBalance = (balance?: number, decimals: number = 2): string => {
  if (balance === undefined || balance === null) return '0.00'
  return balance.toFixed(decimals)
}

/**
 * 获取币种符号和格式化后的余额
 * @param balance - 余额数值
 * @param currency - 币种代码（可选）
 * @param decimals - 小数位数，默认为 2
 * @returns 币种符号 + 格式化后的余额
 * @example
 */
export const getFormattedBalance = (
  balance?: number,
  currency?: string,
  decimals: number = 2
): string => {
  const symbol = getCurrencySymbol(currency)
  const formattedBalance = formatBalance(balance, decimals)
  return `${symbol}${formattedBalance}`
}
