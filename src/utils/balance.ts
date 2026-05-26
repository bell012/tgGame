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

export type BalanceFieldKey = (typeof balanceFieldMap)[keyof typeof balanceFieldMap]

export type BalanceCarrier = Partial<Record<BalanceFieldKey, number>> & {
  balance?: number
  [key: string]: unknown
}

export type GetBalanceByCurrencyOptions = {
  /** 找不到币种字段时是否回退到 data.balance（当前活跃钱包余额） */
  fallbackToCurrentBalance?: boolean
}

export const getBalanceFieldKey = (currency: string) => {
  return balanceFieldMap[currency.toUpperCase() as keyof typeof balanceFieldMap]
}

export const getBalanceByCurrency = (
  data: BalanceCarrier | null | undefined,
  currency: string,
  options: GetBalanceByCurrencyOptions = {}
) => {
  const { fallbackToCurrentBalance = true } = options

  if (!data || !currency) {
    return 0
  }

  const currencyCode = currency.trim().toUpperCase()
  const balanceKey = getBalanceFieldKey(currencyCode)

  if (balanceKey && typeof data[balanceKey] === 'number') {
    return data[balanceKey] as number
  }

  const dynamicBalanceKey = `balance${currencyCode.charAt(0)}${currencyCode.slice(1).toLowerCase()}`
  const dynamicBalanceValue = data[dynamicBalanceKey]
  if (typeof dynamicBalanceValue === 'number') {
    return dynamicBalanceValue
  }

  if (fallbackToCurrentBalance && typeof data.balance === 'number') {
    const activeCurrency = String(data.currency ?? '')
      .trim()
      .toUpperCase()
    if (activeCurrency === currencyCode) {
      return data.balance
    }
  }

  return 0
}
