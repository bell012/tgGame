import Api from '@/api'
import type {
  QueryPayColumnItem,
  QueryMemberPayOrderPageForm,
  QueryMemberPayOrderPageRecord
} from '@/api/interface/wallet'
import { getOrderStatusColorClass, getOrderStatusText } from '@/constants/orderStatus'
import usdtIcon from '@/static/img/crypto/USDT.png'
import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import shopeePayIcon from '@/static/svg/coin/shopeePay.svg?url'
import { formatTimestamp } from '@/utils/date'
import { getCurrentCurrency, getFormattedBalance, getLanguageCode } from '@/utils/locale'

type TranslateFn = (key: string) => string
export interface OrderTypeMeta {
  icon: string
  label: string
}
export type OrderTypeIconMap = Record<string, OrderTypeMeta>

export type OrderTab = 'deposits' | 'withdrawals'
export type OrderStatus = string
export type OrderTimeFilter =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last3days'
  | 'last15days'
  | 'last30days'
export type OrderTypeFilter = 'all' | 'gcash' | 'maya' | 'grabpay' | 'shopeepay' | 'usdt'
export type OrderStatusFilter = 'all' | 'success' | 'failed' | 'processing'

export interface SelectOption {
  label: string
  value: string
}

export interface MyOrdersFilterValues {
  time: OrderTimeFilter
  type: OrderTypeFilter
  status: OrderStatusFilter
}

export const MY_ORDERS_PAGE_SIZE = 20

const TYPE_ICON_MAP: Record<Exclude<OrderTypeFilter, 'all'>, string> = {
  gcash: gCashIcon,
  maya: mayaIcon,
  grabpay: grabPayIcon,
  shopeepay: shopeePayIcon,
  usdt: usdtIcon
}

const toOrderTypeImageUrl = (value?: string) => {
  if (!value) return ''
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

/**
 * 创建默认筛选值。
 */
export const createDefaultMyOrdersFilterValues = (): MyOrdersFilterValues => ({
  time: 'all',
  type: 'all',
  status: 'all'
})

/**
 * 创建日期筛选项。
 */
export const createMyOrdersTimeOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('betHistory.filterOptions.today'), value: 'today' },
  { label: t('betHistory.filterOptions.yesterday'), value: 'yesterday' },
  { label: t('betHistory.filterOptions.last3Days'), value: 'last3days' },
  { label: t('betHistory.filterOptions.last15Days'), value: 'last15days' },
  { label: t('betHistory.filterOptions.last30Days'), value: 'last30days' }
]

/**
 * 创建类型筛选项。
 */
export const createMyOrdersTypeOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: 'GCash', value: 'gcash' },
  { label: 'Maya', value: 'maya' },
  { label: 'GrabPay', value: 'grabpay' },
  { label: 'ShopeePay', value: 'shopeepay' },
  { label: 'USDT', value: 'usdt' }
]

/**
 * 创建状态筛选项。
 */
export const createMyOrdersStatusOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('deposit.status.success'), value: 'success' },
  { label: t('deposit.status.failed'), value: 'failed' },
  { label: t('deposit.status.processing'), value: 'processing' }
]

/**
 * 格式化订单显示金额。
 */
export const formatOrderAmount = (amount: number, currency: string) =>
  getFormattedBalance(amount, currency, 2)

/**
 * 复制文本，优先使用 Clipboard API，失败时降级为 execCommand。
 */
export const copyTextWithFallback = async (value: string): Promise<boolean> => {
  if (!value) return false

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // Fall through to the legacy copy path.
  }

  if (typeof document === 'undefined') return false

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

/**
 * 解析支付方式名称，兼容 JSON 字符串和纯文本。
 */
export const parseOrderMethodName = (subColumnName?: unknown, localeKey = 'eng') => {
  if (typeof subColumnName !== 'string' || !subColumnName) return ''

  try {
    const parsedName = JSON.parse(subColumnName)

    return (
      parsedName?.[localeKey] ||
      parsedName?.eng ||
      parsedName?.en ||
      parsedName?.zh ||
      subColumnName
    )
  } catch {
    return subColumnName
  }
}

const resolveTypeValueByMethodName = (methodName: string): Exclude<OrderTypeFilter, 'all'> => {
  const normalized = methodName.trim().toLowerCase()

  if (normalized.includes('gcash')) return 'gcash'
  if (normalized.includes('maya')) return 'maya'
  if (normalized.includes('grabpay') || normalized.includes('grab pay')) return 'grabpay'
  if (normalized.includes('shopeepay') || normalized.includes('shopee pay')) return 'shopeepay'
  return 'usdt'
}

/**
 * 返回订单支付方式筛选值。
 */
export const getMyOrderTypeValue = (
  record: QueryMemberPayOrderPageRecord,
  localeKey = 'eng'
): Exclude<OrderTypeFilter, 'all'> =>
  resolveTypeValueByMethodName(parseOrderMethodName(record.subColumnName, localeKey))

/**
 * 返回订单支付方式名称。
 */
export const getMyOrderTypeLabel = (
  record: QueryMemberPayOrderPageRecord,
  localeKey = 'eng',
  orderTypeIconMap: OrderTypeIconMap = {}
) => {
  const columnLabel = orderTypeIconMap[String(record.columnCode ?? '')]?.label

  if (String(record.orderType) === '1' && columnLabel) {
    return columnLabel
  }

  return parseOrderMethodName(record.subColumnName, localeKey)
}

/**
 * 返回订单支付方式图标。
 */
export const getMyOrderTypeIcon = (
  record: QueryMemberPayOrderPageRecord,
  localeKey = 'eng',
  orderTypeIconMap: OrderTypeIconMap = {}
) =>
  orderTypeIconMap[String(record.columnCode ?? '')]?.icon ||
  TYPE_ICON_MAP[getMyOrderTypeValue(record, localeKey)]

/**
 * 加载订单支付方式图标映射。
 */
export const loadMyOrderTypeIconMap = async (): Promise<OrderTypeIconMap> => {
  const response = await Api.wallet.queryPayColumnPage({
    page: {
      current: 1,
      size: 9999
    },
    languageCode: getLanguageCode(),
    currency: getCurrentCurrency(),
    param: {
      columnCode: ''
    }
  })

  if (!response.success) {
    throw new Error(response.message || 'queryPayColumnPage failed')
  }

  const result: QueryPayColumnItem[] = Array.isArray(response.result) ? response.result : []

  return result.reduce<OrderTypeIconMap>((iconMap, item) => {
    const iconUrl = toOrderTypeImageUrl(item.defaultOrderIcon)
    const label = String(item.columnName ?? '').trim()

    if (!iconUrl && !label) return iconMap

    iconMap[String(item.columnCode)] = {
      icon: iconUrl,
      label
    }
    return iconMap
  }, {})
}

/**
 * 格式化订单时间。
 */
export const formatMyOrderTime = (timestamp?: number) => {
  return formatTimestamp(timestamp)
}

/**
 * 返回订单状态展示文案。
 */
export const getMyOrderStatusText = (
  tab: OrderTab,
  status: number | string | null | undefined,
  t: TranslateFn
) => getOrderStatusText(tab === 'deposits' ? 'deposit' : 'withdraw', status, t)

/**
 * 返回订单状态文本颜色类。
 */
export const getMyOrderStatusClass = (tab: OrderTab, status: number | string | null | undefined) =>
  getOrderStatusColorClass(tab === 'deposits' ? 'deposit' : 'withdraw', status)

const getStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime()

const getEndOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime()

/**
 * 根据日期筛选返回时间范围。
 */
export const getMyOrdersTimeRange = (filter: OrderTimeFilter) => {
  const now = new Date()

  if (filter === 'all') {
    return {
      startTime: null,
      endTime: null
    }
  }

  if (filter === 'today') {
    return {
      startTime: getStartOfDay(now),
      endTime: now.getTime()
    }
  }

  if (filter === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    return {
      startTime: getStartOfDay(yesterday),
      endTime: getEndOfDay(yesterday)
    }
  }

  const days = filter === 'last3days' ? 3 : filter === 'last15days' ? 15 : 30
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - (days - 1))

  return {
    startTime: getStartOfDay(startDate),
    endTime: now.getTime()
  }
}

/**
 * 根据状态筛选返回接口状态参数。
 */
export const getMyOrdersStatusParam = (tab: OrderTab, status: OrderStatusFilter) => {
  if (status === 'all') return ''

  if (tab === 'deposits') {
    if (status === 'success') return '1'
    if (status === 'failed') return '2'
    return '3'
  }

  if (status === 'success') return '3'
  if (status === 'failed') return '2'
  return ['0', '1', '4']
}

/**
 * 构建订单分页查询参数。
 */
export const buildMyOrdersQueryParams = (
  tab: OrderTab,
  filters: MyOrdersFilterValues,
  current: number,
  size: number
): QueryMemberPayOrderPageForm => {
  const { startTime, endTime } = getMyOrdersTimeRange(filters.time)

  return {
    page: {
      current,
      size
    },
    columnCode: filters.type ?? '',
    status: getMyOrdersStatusParam(tab, filters.status),
    startTime,
    endTime,
    param: {
      orderType: tab === 'deposits' ? 0 : 1
    }
  }
}

/**
 * 判断订单是否命中类型筛选。
 */
export const matchMyOrdersTypeFilter = (
  record: QueryMemberPayOrderPageRecord,
  type: OrderTypeFilter,
  localeKey = 'eng'
) => {
  if (type === 'all') return true
  return getMyOrderTypeValue(record, localeKey) === type
}
