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

export const getBalanceFieldKey = (currency: string) => {
  return balanceFieldMap[currency.toUpperCase() as keyof typeof balanceFieldMap]
}

export const getBalanceByCurrency = (data: BalanceCarrier | null | undefined, currency: string) => {
  if (!data) {
    return 0
  }

  const balanceKey = getBalanceFieldKey(currency)

  if (balanceKey && typeof data[balanceKey] === 'number') {
    return data[balanceKey] as number
  }

  return typeof data.balance === 'number' ? data.balance : 0
}
