import { SITE_CONFIG_STORAGE_KEY, type SiteConfig } from '@/stores/siteConfig'
import ADAIcon from '@/static/svg/coin/ADA.black.svg?url'
import BNBIcon from '@/static/svg/coin/BNB.black.svg?url'
import BTCIcon from '@/static/svg/coin/BTC.black.svg?url'
import DefaultCurrencyIcon from '@/static/svg/coin/CURRENCY.default.svg?url'
import DOGEIcon from '@/static/svg/coin/DOGE.black.svg?url'
import ETHIcon from '@/static/svg/coin/ETH.black.svg?url'
import MATICIcon from '@/static/svg/coin/MATIC.black.svg?url'
import SOLIcon from '@/static/svg/coin/SOL.black.svg?url'
import TRXIcon from '@/static/svg/coin/TRX.black.svg?url'
import USDCIcon from '@/static/svg/coin/USDC.black.svg?url'
import USDTIcon from '@/static/svg/coin/USDT.black.svg?url'
import XRPIcon from '@/static/svg/coin/XRP.black.svg?url'
import CNYFlagIcon from '@/static/img/flag/CNY.webp'
import PHPFlagIcon from '@/static/img/flag/php.png'
import USDFlagIcon from '@/static/img/flag/USD.webp'

export type CurrencyOptionItem = {
  value: string
  label: string
  icon: string
}

const DEFAULT_CURRENCY_CODES = ['PHP', 'USDT', 'XRP', 'DOGE']

const CURRENCY_ICON_MAP: Record<string, string> = {
  ADA: ADAIcon,
  BNB: BNBIcon,
  BTC: BTCIcon,
  CNY: CNYFlagIcon,
  DOGE: DOGEIcon,
  ETH: ETHIcon,
  MATIC: MATICIcon,
  PHP: PHPFlagIcon,
  SOL: SOLIcon,
  TRX: TRXIcon,
  USD: USDFlagIcon,
  USDC: USDCIcon,
  USDT: USDTIcon,
  XRP: XRPIcon,
  XPR: XRPIcon
}

const DYNAMIC_ICON_COLORS = [
  '#2E90FA',
  '#34C759',
  '#FF9F0A',
  '#AF52DE',
  '#FF5A5F',
  '#00B8D9',
  '#22C55E',
  '#3B82F6'
]

const currencyIconCache = new Map<string, string>()

const getHash = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

const getCurrencyBadgeText = (currencyCode: string) => {
  const normalized = currencyCode.replace(/[^A-Z0-9]/g, '')
  if (!normalized) {
    return '$'
  }
  return normalized.slice(0, 2)
}

const buildCurrencyBadgeIcon = (currencyCode: string) => {
  const hash = getHash(currencyCode)
  const bgColor = DYNAMIC_ICON_COLORS[hash % DYNAMIC_ICON_COLORS.length]
  const text = getCurrencyBadgeText(currencyCode)

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="${bgColor}" />
  <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
  <text x="32" y="38" text-anchor="middle" font-size="24" font-family="Arial, sans-serif" font-weight="700" fill="#FFFFFF">${text}</text>
</svg>`.trim()

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const getCurrencyIcon = (currencyCode: string) => {
  const fixedIcon = CURRENCY_ICON_MAP[currencyCode]
  if (fixedIcon) {
    return fixedIcon
  }

  const cachedIcon = currencyIconCache.get(currencyCode)
  if (cachedIcon) {
    return cachedIcon
  }

  if (!currencyCode) {
    return DefaultCurrencyIcon
  }

  const dynamicIcon = buildCurrencyBadgeIcon(currencyCode)
  currencyIconCache.set(currencyCode, dynamicIcon)
  return dynamicIcon
}

const normalizeCurrencyCode = (value: unknown) => {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

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
  return (siteConfig as Record<string, unknown>).currency
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

    return parseCurrencyCodes((parsed as Record<string, unknown>).currency)
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
    icon: getCurrencyIcon(code)
  }))
}
