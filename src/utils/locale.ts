/**
 * 语言和币种统一管理工具
 */

/**
 * 语言代码转换：将存储的语言代码转换为 i18n 使用的语言代码
 * @param language - 存储的语言代码 (zh-CN 或 en)
 * @returns i18n 使用的语言代码 (zh 或 eng)
 * @example
 */
export const getLanguageCode = (language?: string): string => {
  const lang = language || localStorage.getItem('language') || 'eng'
  return lang === 'zh-CN' ? 'zh' : 'eng'
}

/**
 * i18n 语言代码转换为存储的语言代码
 * @param i18nLocale - i18n 使用的语言代码 (zh 或 eng)
 * @returns 存储的语言代码 (zh-CN 或 en)
 * @example
 */
export const getStorageLanguageCode = (i18nLocale: string): string => {
  return i18nLocale === 'zh' ? 'zh-CN' : 'en'
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
