import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { SITE_CONFIG_STORAGE_KEY, useSiteConfigStore, type SiteConfig } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency, getFormattedBalance, formatBalance } from '@/utils/locale'
import { getBalanceByCurrency, type BalanceCarrier } from '@/utils/balance'
import {
  getCurrencyIconByCode,
  getCurrencySelectOptionsFromCache,
  type CurrencyOptionItem
} from '@/components/common/currency-selector/currency-select-options'

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

type CachedSiteConfig = {
  baseSiteConfig?: {
    supportCurrency?: unknown
  }
}

export const readDisplayCurrencyCodesFromSiteConfig = (
  siteConfig: SiteConfig | null | undefined
) => {
  if (siteConfig && typeof siteConfig === 'object' && !Array.isArray(siteConfig)) {
    return parseDisplayCurrencyCodes(
      (siteConfig as CachedSiteConfig).baseSiteConfig?.supportCurrency
    )
  }

  const rawConfig = localStorage.getItem(SITE_CONFIG_STORAGE_KEY)
  if (!rawConfig) {
    return []
  }

  try {
    const parsed = JSON.parse(rawConfig) as CachedSiteConfig
    return parseDisplayCurrencyCodes(parsed?.baseSiteConfig?.supportCurrency)
  } catch (error) {
    console.error(error)
    return []
  }
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

  /** 合并多币种余额：acctInfo 优先，userInfo 补全缺失字段 */
  const balanceCarrier = computed<BalanceCarrier | null>(() => {
    if (!acctInfo.value && !userInfo.value) {
      return null
    }

    return {
      ...(userInfo.value ?? {}),
      ...(acctInfo.value ?? {})
    }
  })

  const getDisplayBalanceByCode = (code: string) => {
    const normalizedCode = normalizeDisplayCurrencyCode(code)
    if (!normalizedCode) {
      return 0
    }

    return getBalanceByCurrency(balanceCarrier.value, normalizedCode, {
      fallbackToCurrentBalance: false
    })
  }

  const currentBalance = computed(() => getDisplayBalanceByCode(currentCurrencyCode.value))

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
      const balance = getDisplayBalanceByCode(code)

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
