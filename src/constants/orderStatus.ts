export type OrderBizType = 'deposit' | 'withdraw'
export type OrderStatusRaw = number | string | null | undefined
export type OrderStatusTone = 'success' | 'failed' | 'processing'

const ORDER_STATUS_I18N_KEY_MAP: Record<OrderBizType, Record<number, string>> = {
  deposit: {
    0: 'deposit.status.pending',
    1: 'deposit.status.success',
    2: 'deposit.status.failed',
    3: 'deposit.status.processing'
  },
  withdraw: {
    0: 'withdraw.status.pending',
    1: 'withdraw.status.locked',
    2: 'withdraw.status.failed',
    3: 'withdraw.status.success',
    4: 'withdraw.status.processing',
    5: 'withdraw.status.pay_failed'
  }
}

const ORDER_STATUS_FALLBACK_CODE: Record<OrderBizType, number> = {
  deposit: 3,
  withdraw: 4
}

const ORDER_STATUS_TERMINAL_CODES: Record<OrderBizType, Set<number>> = {
  deposit: new Set([1, 2]),
  withdraw: new Set([2, 3, 5])
}

const ORDER_STATUS_LEGACY_ALIAS: Record<OrderBizType, Record<string, number>> = {
  deposit: {
    pending: 0,
    success: 1,
    failed: 2,
    processing: 3,
    loading: 3
  },
  withdraw: {
    pending: 0,
    locked: 1,
    failed: 2,
    success: 3,
    processing: 4,
    pay_failed: 5,
    payfailed: 5
  }
}

const ORDER_STATUS_TONE_MAP: Record<OrderBizType, Record<number, OrderStatusTone>> = {
  deposit: {
    1: 'success',
    2: 'failed'
  },
  withdraw: {
    3: 'success',
    2: 'failed',
    5: 'failed'
  }
}

const ORDER_STATUS_TONE_CLASS_MAP: Record<OrderStatusTone, string> = {
  success: 'text-assistGreen',
  failed: 'text-assistRed',
  processing: 'text-assistOrange'
}

const ORDER_STATUS_TONE_CSS_VAR_MAP: Record<OrderStatusTone, string> = {
  success: 'var(--color-assist-green)',
  failed: 'var(--color-assist-red)',
  processing: 'var(--color-assist-orange)'
}

export const normalizeOrderStatusCode = (bizType: OrderBizType, status: OrderStatusRaw) => {
  if (typeof status === 'number' && Number.isFinite(status)) {
    return status
  }

  if (typeof status !== 'string') {
    return undefined
  }

  const trimmed = status.trim()
  if (!trimmed) return undefined

  const numericValue = Number(trimmed)
  if (Number.isFinite(numericValue)) {
    return numericValue
  }

  const aliasKey = trimmed.toLowerCase().replace(/\s+/g, '_')
  return ORDER_STATUS_LEGACY_ALIAS[bizType][aliasKey]
}

export const getOrderStatusI18nKey = (bizType: OrderBizType, status: OrderStatusRaw) => {
  const code = normalizeOrderStatusCode(bizType, status) ?? ORDER_STATUS_FALLBACK_CODE[bizType]
  return (
    ORDER_STATUS_I18N_KEY_MAP[bizType][code] ??
    ORDER_STATUS_I18N_KEY_MAP[bizType][ORDER_STATUS_FALLBACK_CODE[bizType]]
  )
}

export const getOrderStatusText = (
  bizType: OrderBizType,
  status: OrderStatusRaw,
  t: (key: string) => string
) => t(getOrderStatusI18nKey(bizType, status))

export const getOrderStatusTone = (
  bizType: OrderBizType,
  status: OrderStatusRaw
): OrderStatusTone => {
  const code = normalizeOrderStatusCode(bizType, status)
  if (code === undefined) return 'processing'
  return ORDER_STATUS_TONE_MAP[bizType][code] ?? 'processing'
}

export const getOrderStatusColorClass = (bizType: OrderBizType, status: OrderStatusRaw) =>
  ORDER_STATUS_TONE_CLASS_MAP[getOrderStatusTone(bizType, status)]

export const getOrderStatusColorStyle = (bizType: OrderBizType, status: OrderStatusRaw) => ({
  color: ORDER_STATUS_TONE_CSS_VAR_MAP[getOrderStatusTone(bizType, status)]
})

export const isOrderTerminalStatus = (bizType: OrderBizType, status: OrderStatusRaw) => {
  const code = normalizeOrderStatusCode(bizType, status)
  if (code === undefined) return false
  return ORDER_STATUS_TERMINAL_CODES[bizType].has(code)
}
