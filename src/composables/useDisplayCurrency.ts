import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { SITE_CONFIG_STORAGE_KEY, useSiteConfigStore, type SiteConfig } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency, getFormattedBalance, formatBalance } from '@/utils/locale'
import {
  getCurrencyIconByCode,
  getCurrencySelectOptionsFromCache,
  type CurrencyOptionItem
} from '@/components/common/currency-selector/currency-select-options'

type CachedSiteConfig = {
  currency?: unknown
}

const balanceFieldMap = {
  BRL: 'balanceBrl',
  CNY: 'balanceCny',
  IDR: 'balanceIdr',
  INR: 'balanceInr',
  JPY: 'balanceJpy',
  KRW: 'balanceKrw',
  MXN: 'balanceMxn',
  MYR: 'balanceMyr',
  PHP: 'balancePhp',
  SGD: 'balanceSgd',
  USD: 'balanceUsd',
  USDT: 'balanceUsdt',
  VND: 'balanceVnd'
} as const

type BalanceFieldKey = (typeof balanceFieldMap)[keyof typeof balanceFieldMap]
type BalanceCarrier = Partial<Record<BalanceFieldKey, number>> & {
  balance?: number
  currency?: string
}

export type DisplayCurrencyOption = {
  code: string
  icon: string
  balanceText: string
}

export const normalizeDisplayCurrencyCode = (value: unknown) => {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

export const parseDisplayCurrencyCodes = (rawCurrency: unknown) => {
  if (Array.isArray(rawCurrency)) {
    return Array.from(new Set(rawCurrency.map(normalizeDisplayCurrencyCode).filter(Boolean)))
  }

  if (typeof rawCurrency === 'string') {
    return Array.from(
      new Set(
        rawCurrency
          .split(',')
          .map(item => normalizeDisplayCurrencyCode(item))
          .filter(Boolean)
      )
    )
  }

  return []
}

export const readDisplayCurrencyCodesFromSiteConfig = (
  siteConfig: SiteConfig | null | undefined
) => {
  if (siteConfig && typeof siteConfig === 'object' && !Array.isArray(siteConfig)) {
    return parseDisplayCurrencyCodes((siteConfig as CachedSiteConfig).currency)
  }

  const rawConfig = localStorage.getItem(SITE_CONFIG_STORAGE_KEY)
  if (!rawConfig) {
    return []
  }

  try {
    const parsed = JSON.parse(rawConfig) as CachedSiteConfig
    return parseDisplayCurrencyCodes(parsed?.currency)
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getBalanceByCurrency = (
  data: BalanceCarrier | null | undefined,
  currencyCode: string
) => {
  if (!data || !currencyCode) {
    return undefined
  }

  const balanceKey = balanceFieldMap[currencyCode as keyof typeof balanceFieldMap]
  if (balanceKey && typeof data[balanceKey] === 'number') {
    return data[balanceKey]
  }

  const dynamicBalanceKey = `balance${currencyCode.charAt(0)}${currencyCode.slice(1).toLowerCase()}`
  const dynamicBalanceValue = (data as Record<string, unknown>)[dynamicBalanceKey]
  if (typeof dynamicBalanceValue === 'number') {
    return dynamicBalanceValue
  }

  return typeof data.balance === 'number' ? data.balance : undefined
}

export const useDisplayCurrency = () => {
  const localeStore = useLocaleStore()
  const siteConfigStore = useSiteConfigStore()
  const userStore = useUserStore()
  const { acctInfo, userInfo } = storeToRefs(userStore)
  const { config } = storeToRefs(siteConfigStore)

  const currentCurrencyCode = computed(() => {
    const selectedCurrency = normalizeDisplayCurrencyCode(localeStore.currentCurrency)

    if (selectedCurrency && selectedCurrency !== 'NONE') {
      return selectedCurrency
    }

    return normalizeDisplayCurrencyCode(
      acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
    )
  })

  const currencySelectOptions = computed<CurrencyOptionItem[]>(() => {
    const baseOptions = getCurrencySelectOptionsFromCache(config.value)
    const currentCode = currentCurrencyCode.value

    if (!currentCode || baseOptions.some(item => item.value === currentCode)) {
      return baseOptions
    }

    return [
      {
        value: currentCode,
        label: currentCode,
        icon: getCurrencyIconByCode(currentCode)
      },
      ...baseOptions
    ]
  })

  const currentCurrencyOption = computed(() => {
    return (
      currencySelectOptions.value.find(item => item.value === currentCurrencyCode.value) ??
      currencySelectOptions.value[0]
    )
  })

  const currentBalance = computed(() => {
    return (
      getBalanceByCurrency(acctInfo.value as BalanceCarrier | null, currentCurrencyCode.value) ??
      getBalanceByCurrency(userInfo.value as BalanceCarrier | null, currentCurrencyCode.value) ??
      acctInfo.value?.balancePhp ??
      userInfo.value?.balancePhp ??
      0
    )
  })

  const currentBalanceAmountText = computed(() => formatBalance(currentBalance.value, 2))
  const currentBalanceText = computed(() =>
    getFormattedBalance(currentBalance.value, currentCurrencyCode.value, 2)
  )
  const currentCurrencyIcon = computed(() => getCurrencyIconByCode(currentCurrencyCode.value))

  const currencyOptions = computed<DisplayCurrencyOption[]>(() => {
    const codesFromConfig = readDisplayCurrencyCodesFromSiteConfig(config.value)
    const fallbackCode =
      currentCurrencyCode.value || normalizeDisplayCurrencyCode(getCurrentCurrency()) || 'PHP'
    const mergedCodes = [...codesFromConfig]

    if (!mergedCodes.includes(currentCurrencyCode.value)) {
      mergedCodes.unshift(currentCurrencyCode.value)
    }

    const codes = mergedCodes.length ? mergedCodes : [fallbackCode]

    return codes.map(code => {
      const balance =
        getBalanceByCurrency(acctInfo.value as BalanceCarrier | null, code) ??
        getBalanceByCurrency(userInfo.value as BalanceCarrier | null, code) ??
        0

      return {
        code,
        icon: getCurrencyIconByCode(code),
        balanceText: getFormattedBalance(balance, code, 2)
      }
    })
  })

  const setDisplayCurrency = (code: string) => {
    const selectedCode = normalizeDisplayCurrencyCode(code)
    if (!selectedCode) {
      return
    }

    localeStore.setCurrency(selectedCode)
  }

  return {
    currentCurrencyCode,
    currentCurrencyIcon,
    currentCurrencyOption,
    currentBalance,
    currentBalanceAmountText,
    currentBalanceText,
    currencyOptions,
    currencySelectOptions,
    setDisplayCurrency
  }
}
