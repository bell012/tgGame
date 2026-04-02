import gCashIcon from '@/static/img/payment/gCash.png'
import grabPayIcon from '@/static/img/payment/grabPay.png'
import mayaIcon from '@/static/img/payment/maya.png'
import usdtIcon from '@/static/img/crypto/USDT.png'
import shopeePayIcon from '@/static/svg/coin/shopeePay.svg?url'
import { getFormattedBalance } from '@/utils/locale'

type TranslateFn = (key: string) => string

export type OrderTab = 'deposits' | 'withdrawals'
export type OrderStatus = 'Success' | 'Failed' | 'Processing'
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

export interface MyOrderItem {
  id: string
  tab: OrderTab
  typeValue: Exclude<OrderTypeFilter, 'all'>
  typeLabel: string
  icon: string
  currency: string
  amount: number
  paymentAmount: number
  bonusAmount: number
  orderNo: string
  status: OrderStatus
  createdAt: string
  timeLabel: string
  timeGroup: Exclude<OrderTimeFilter, 'all'>
}

export interface MyOrdersPageResult {
  items: MyOrderItem[]
  total: number
}

export const MY_ORDERS_PAGE_SIZE = 10

const TYPE_LABEL_MAP: Record<Exclude<OrderTypeFilter, 'all'>, string> = {
  gcash: 'GCash',
  maya: 'Maya',
  grabpay: 'GrabPay',
  shopeepay: 'ShopeePay',
  usdt: 'USDT'
}

const TYPE_ICON_MAP: Record<Exclude<OrderTypeFilter, 'all'>, string> = {
  gcash: gCashIcon,
  maya: mayaIcon,
  grabpay: grabPayIcon,
  shopeepay: shopeePayIcon,
  usdt: usdtIcon
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
export const createMyOrdersTypeOptions = (): SelectOption[] => [
  { label: 'All', value: 'all' },
  { label: 'GCash', value: 'gcash' },
  { label: 'Maya', value: 'maya' },
  { label: 'GrabPay', value: 'grabpay' },
  { label: 'ShopeePay', value: 'shopeepay' },
  { label: 'USDT', value: 'usdt' }
]

/**
 * 创建状态筛选项。
 */
export const createMyOrdersStatusOptions = (): SelectOption[] => [
  { label: 'All', value: 'all' },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
  { label: 'Processing', value: 'processing' }
]

/**
 * 格式化订单显示金额。
 */
export const formatOrderAmount = (amount: number, currency: string) =>
  getFormattedBalance(amount, currency, 2)

/**
 * 根据订单状态返回筛选值。
 */
export const toStatusFilterValue = (status: OrderStatus): OrderStatusFilter => {
  const normalized = status.toLowerCase()
  if (normalized === 'success') return 'success'
  if (normalized === 'failed') return 'failed'
  return 'processing'
}

/**
 * 过滤订单列表。
 */
export const filterMyOrders = (
  items: MyOrderItem[],
  filters: MyOrdersFilterValues
): MyOrderItem[] => {
  return items.filter(item => {
    const matchTime = filters.time === 'all' || item.timeGroup === filters.time
    const matchType = filters.type === 'all' || item.typeValue === filters.type
    const matchStatus =
      filters.status === 'all' || toStatusFilterValue(item.status) === filters.status
    return matchTime && matchType && matchStatus
  })
}

/**
 * 截取分页数据。
 */
export const sliceMyOrdersByPage = (
  items: MyOrderItem[],
  page: number,
  pageSize: number
): MyOrdersPageResult => {
  const safePage = Math.max(1, page)
  const safePageSize = Math.max(1, pageSize)
  const start = (safePage - 1) * safePageSize
  return {
    items: items.slice(start, start + safePageSize),
    total: items.length
  }
}

/**
 * 判断是否还有下一页。
 */
export const hasMoreMyOrders = (total: number, page: number, pageSize: number) =>
  page * pageSize < total

/**
 * 创建模拟订单数据。
 */
const createMockOrder = (params: {
  index: number
  tab: OrderTab
  typeValue: Exclude<OrderTypeFilter, 'all'>
  amount: number
  paymentAmount: number
  bonusAmount: number
  status: OrderStatus
  createdAt: string
  timeLabel: string
  timeGroup: Exclude<OrderTimeFilter, 'all'>
}) => ({
  id: `${params.tab}-${params.index}`,
  tab: params.tab,
  typeValue: params.typeValue,
  typeLabel: TYPE_LABEL_MAP[params.typeValue],
  icon: TYPE_ICON_MAP[params.typeValue],
  currency: 'PHP',
  amount: params.amount,
  paymentAmount: params.paymentAmount,
  bonusAmount: params.bonusAmount,
  orderNo: `ts07684567467467467${params.index}`,
  status: params.status,
  createdAt: params.createdAt,
  timeLabel: params.timeLabel,
  timeGroup: params.timeGroup
})

export const MOCK_DEPOSIT_ORDERS: MyOrderItem[] = [
  createMockOrder({
    index: 1,
    tab: 'deposits',
    typeValue: 'gcash',
    amount: 1000,
    paymentAmount: 500,
    bonusAmount: 50,
    status: 'Success',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: 'Just now',
    timeGroup: 'today'
  }),
  createMockOrder({
    index: 2,
    tab: 'deposits',
    typeValue: 'grabpay',
    amount: 1000,
    paymentAmount: 500,
    bonusAmount: 0,
    status: 'Processing',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: 'Today 11:14 AM',
    timeGroup: 'today'
  }),
  createMockOrder({
    index: 3,
    tab: 'deposits',
    typeValue: 'maya',
    amount: 1000,
    paymentAmount: 500,
    bonusAmount: 50,
    status: 'Success',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: 'Yesterday 11:14 AM',
    timeGroup: 'yesterday'
  }),
  createMockOrder({
    index: 4,
    tab: 'deposits',
    typeValue: 'shopeepay',
    amount: 1000,
    paymentAmount: 500,
    bonusAmount: 0,
    status: 'Success',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: '12/18/2026 11:14:15 AM',
    timeGroup: 'last30days'
  }),
  createMockOrder({
    index: 5,
    tab: 'deposits',
    typeValue: 'usdt',
    amount: 1000,
    paymentAmount: 500,
    bonusAmount: 0,
    status: 'Failed',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: '12/18/2026 11:14:15 AM',
    timeGroup: 'last30days'
  }),
  createMockOrder({
    index: 6,
    tab: 'deposits',
    typeValue: 'gcash',
    amount: 1500,
    paymentAmount: 1500,
    bonusAmount: 100,
    status: 'Success',
    createdAt: '03/28/2026 09:20:11 AM',
    timeLabel: '03/28/2026 09:20:11 AM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 7,
    tab: 'deposits',
    typeValue: 'maya',
    amount: 2000,
    paymentAmount: 2000,
    bonusAmount: 150,
    status: 'Processing',
    createdAt: '03/27/2026 03:15:20 PM',
    timeLabel: '03/27/2026 03:15:20 PM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 8,
    tab: 'deposits',
    typeValue: 'grabpay',
    amount: 800,
    paymentAmount: 800,
    bonusAmount: 0,
    status: 'Failed',
    createdAt: '03/26/2026 08:16:04 PM',
    timeLabel: '03/26/2026 08:16:04 PM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 9,
    tab: 'deposits',
    typeValue: 'shopeepay',
    amount: 1200,
    paymentAmount: 1200,
    bonusAmount: 80,
    status: 'Success',
    createdAt: '03/25/2026 07:11:09 PM',
    timeLabel: '03/25/2026 07:11:09 PM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 10,
    tab: 'deposits',
    typeValue: 'usdt',
    amount: 3000,
    paymentAmount: 3000,
    bonusAmount: 0,
    status: 'Success',
    createdAt: '03/24/2026 10:05:18 AM',
    timeLabel: '03/24/2026 10:05:18 AM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 11,
    tab: 'deposits',
    typeValue: 'gcash',
    amount: 500,
    paymentAmount: 500,
    bonusAmount: 0,
    status: 'Processing',
    createdAt: '03/23/2026 02:22:33 PM',
    timeLabel: '03/23/2026 02:22:33 PM',
    timeGroup: 'last30days'
  }),
  createMockOrder({
    index: 12,
    tab: 'deposits',
    typeValue: 'grabpay',
    amount: 2200,
    paymentAmount: 2200,
    bonusAmount: 100,
    status: 'Success',
    createdAt: '03/22/2026 01:18:46 PM',
    timeLabel: '03/22/2026 01:18:46 PM',
    timeGroup: 'last30days'
  })
]

export const MOCK_WITHDRAWAL_ORDERS: MyOrderItem[] = [
  createMockOrder({
    index: 101,
    tab: 'withdrawals',
    typeValue: 'gcash',
    amount: 1200,
    paymentAmount: 1200,
    bonusAmount: 0,
    status: 'Success',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: 'Just now',
    timeGroup: 'today'
  }),
  createMockOrder({
    index: 102,
    tab: 'withdrawals',
    typeValue: 'grabpay',
    amount: 850,
    paymentAmount: 850,
    bonusAmount: 0,
    status: 'Processing',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: 'Today 11:14 AM',
    timeGroup: 'today'
  }),
  createMockOrder({
    index: 103,
    tab: 'withdrawals',
    typeValue: 'maya',
    amount: 400,
    paymentAmount: 400,
    bonusAmount: 0,
    status: 'Success',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: 'Yesterday 11:14 AM',
    timeGroup: 'yesterday'
  }),
  createMockOrder({
    index: 104,
    tab: 'withdrawals',
    typeValue: 'shopeepay',
    amount: 950,
    paymentAmount: 950,
    bonusAmount: 0,
    status: 'Success',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: '12/18/2026 11:14:15 AM',
    timeGroup: 'last30days'
  }),
  createMockOrder({
    index: 105,
    tab: 'withdrawals',
    typeValue: 'usdt',
    amount: 650,
    paymentAmount: 650,
    bonusAmount: 0,
    status: 'Failed',
    createdAt: '12/18/2026 11:14:15 AM',
    timeLabel: '12/18/2026 11:14:15 AM',
    timeGroup: 'last30days'
  }),
  createMockOrder({
    index: 106,
    tab: 'withdrawals',
    typeValue: 'gcash',
    amount: 430,
    paymentAmount: 430,
    bonusAmount: 0,
    status: 'Success',
    createdAt: '03/28/2026 09:20:11 AM',
    timeLabel: '03/28/2026 09:20:11 AM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 107,
    tab: 'withdrawals',
    typeValue: 'maya',
    amount: 1800,
    paymentAmount: 1800,
    bonusAmount: 0,
    status: 'Processing',
    createdAt: '03/27/2026 03:15:20 PM',
    timeLabel: '03/27/2026 03:15:20 PM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 108,
    tab: 'withdrawals',
    typeValue: 'grabpay',
    amount: 300,
    paymentAmount: 300,
    bonusAmount: 0,
    status: 'Failed',
    createdAt: '03/26/2026 08:16:04 PM',
    timeLabel: '03/26/2026 08:16:04 PM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 109,
    tab: 'withdrawals',
    typeValue: 'shopeepay',
    amount: 1400,
    paymentAmount: 1400,
    bonusAmount: 0,
    status: 'Success',
    createdAt: '03/25/2026 07:11:09 PM',
    timeLabel: '03/25/2026 07:11:09 PM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 110,
    tab: 'withdrawals',
    typeValue: 'usdt',
    amount: 2100,
    paymentAmount: 2100,
    bonusAmount: 0,
    status: 'Success',
    createdAt: '03/24/2026 10:05:18 AM',
    timeLabel: '03/24/2026 10:05:18 AM',
    timeGroup: 'last15days'
  }),
  createMockOrder({
    index: 111,
    tab: 'withdrawals',
    typeValue: 'gcash',
    amount: 780,
    paymentAmount: 780,
    bonusAmount: 0,
    status: 'Processing',
    createdAt: '03/23/2026 02:22:33 PM',
    timeLabel: '03/23/2026 02:22:33 PM',
    timeGroup: 'last30days'
  })
]
