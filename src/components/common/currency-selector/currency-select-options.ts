import { SITE_CONFIG_STORAGE_KEY, type SiteConfig } from '@/stores/siteConfig'
import { getCurrencyImageByCode, normalizeCurrencyCode } from '@/utils/locale'

export type CurrencyOptionItem = {
  value: string
  label: string
  icon: string
}

const DEFAULT_CURRENCY_CODES = ['PHP', 'USDT', 'XRP', 'DOGE']

const dedupeCurrencyCodes = (codes: string[]) => {
  return Array.from(new Set(codes))
}

const parseCurrencyCodes = (rawCurrency: unknown) => {
  if (Array.isArray(rawCurrency)) {
    return dedupeCurrencyCodes(rawCurrency.map(normalizeCurrencyCode).filter(Boolean))
  }

  if (typeof rawCurrency === 'string') {
    return dedupeCurrencyCodes(
      rawCurrency
        .split(',')
        .map(item => normalizeCurrencyCode(item))
        .filter(Boolean)
    )
  }

  return []
}

const getConfigCurrencyField = (siteConfig: SiteConfig | null | undefined): unknown => {
  if (!siteConfig || typeof siteConfig !== 'object' || Array.isArray(siteConfig)) {
    return ''
  }
  return (
    (siteConfig as Record<string, unknown>).baseSiteConfig as Record<string, unknown> | undefined
  )?.supportCurrency
}

const readCachedCurrencyCodes = () => {
  const rawConfig = localStorage.getItem(SITE_CONFIG_STORAGE_KEY)
  if (!rawConfig) {
    return []
  }

  try {
    const parsed = JSON.parse(rawConfig) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return []
    }

    return parseCurrencyCodes(
      ((parsed as Record<string, unknown>).baseSiteConfig as Record<string, unknown> | undefined)
        ?.supportCurrency
    )
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getCurrencySelectOptionsFromCache = (
  siteConfig: SiteConfig | null | undefined
): CurrencyOptionItem[] => {
  const codesFromStore = parseCurrencyCodes(getConfigCurrencyField(siteConfig))
  const currencyCodes = codesFromStore.length ? codesFromStore : readCachedCurrencyCodes()
  const normalizedCodes = currencyCodes.length ? currencyCodes : DEFAULT_CURRENCY_CODES

  return normalizedCodes.map(code => ({
    value: code,
    label: code,
    icon: getCurrencyImageByCode(code)
  }))
}
