import type {
  MemberPayOrderSyncItem,
  QueryMemberPayOrderPageRecord,
  QueryPayOrderByOrderIdResult,
  TradePushMessage
} from '@/api/interface/wallet'

export type PayOrderType = '0' | '1'
export type PayOrderTypeInput = PayOrderType | 0 | 1 | string | number | null | undefined
export type PayOrderStatusInput = number | string | null | undefined
export type PayOrderDisplayStatus = 'pending' | 'success' | 'failed' | 'processing' | 'locked'
export type TradeMessageSource = 'mqtt' | 'sync'

export interface OrderStatusCacheItem {
  orderId: string
  orderType: PayOrderType
  status: number
  messageTime: number
  busiAmount?: number | string
  currency?: string
}

export type OrderStatusMap = Record<string, OrderStatusCacheItem>

export interface TradeMessageStreamItem extends OrderStatusCacheItem {
  key: string
  source: TradeMessageSource
  amount?: number | string
  msgType?: number
  orderStatus?: number
  isFirst?: number
  payId?: string
  createTime?: number
}

const DEPOSIT_STATUS_TEXT_MAP: Record<number, string> = {
  0: '订单创建成功',
  1: '成功',
  2: '失败',
  3: '处理中'
}

const WITHDRAW_STATUS_TEXT_MAP: Record<number, string> = {
  0: '订单创建成功',
  1: '锁定',
  2: '失败',
  3: '成功',
  4: '处理中',
  5: '代付失败'
}

const DEPOSIT_DISPLAY_STATUS_MAP: Record<number, PayOrderDisplayStatus> = {
  0: 'pending',
  1: 'success',
  2: 'failed',
  3: 'processing'
}

const WITHDRAW_DISPLAY_STATUS_MAP: Record<number, PayOrderDisplayStatus> = {
  0: 'pending',
  1: 'locked',
  2: 'failed',
  3: 'success',
  4: 'processing',
  5: 'failed'
}

const DISPLAY_STATUS_TEXT_MAP: Record<PayOrderDisplayStatus, string> = {
  pending: '待处理',
  success: '成功',
  failed: '失败',
  processing: '处理中',
  locked: '锁定'
}

export const normalizePayOrderType = (orderType: PayOrderTypeInput): PayOrderType => {
  const normalized = String(orderType ?? '').trim()
  return normalized === '1' ? '1' : '0'
}

export const normalizePayOrderStatus = (status: PayOrderStatusInput) => {
  const numericValue = Number(status)
  return Number.isFinite(numericValue) ? numericValue : 0
}

// 返回充提订单的精确状态文案。
export const getPayOrderStatusText = (
  orderType: PayOrderTypeInput,
  status: PayOrderStatusInput
) => {
  const normalizedOrderType = normalizePayOrderType(orderType)
  const normalizedStatus = normalizePayOrderStatus(status)

  if (normalizedOrderType === '1') {
    return WITHDRAW_STATUS_TEXT_MAP[normalizedStatus] ?? WITHDRAW_STATUS_TEXT_MAP[4]
  }

  return DEPOSIT_STATUS_TEXT_MAP[normalizedStatus] ?? DEPOSIT_STATUS_TEXT_MAP[3]
}

// 返回页面统一展示层使用的状态类型。
export const getPayOrderDisplayStatus = (
  orderType: PayOrderTypeInput,
  status: PayOrderStatusInput
): PayOrderDisplayStatus => {
  const normalizedOrderType = normalizePayOrderType(orderType)
  const normalizedStatus = normalizePayOrderStatus(status)

  if (normalizedOrderType === '1') {
    return WITHDRAW_DISPLAY_STATUS_MAP[normalizedStatus] ?? 'processing'
  }

  return DEPOSIT_DISPLAY_STATUS_MAP[normalizedStatus] ?? 'processing'
}

export const getPayOrderDisplayStatusText = (
  orderType: PayOrderTypeInput,
  status: PayOrderStatusInput
) => DISPLAY_STATUS_TEXT_MAP[getPayOrderDisplayStatus(orderType, status)]

export const getTradeMessageDedupKey = (
  messageTime: number,
  orderId: string,
  status: PayOrderStatusInput
) => `${messageTime}_${orderId}_${normalizePayOrderStatus(status)}`

export const compareTradeMessageStreamItem = (
  left: TradeMessageStreamItem,
  right: TradeMessageStreamItem
) => {
  if (left.messageTime !== right.messageTime) {
    return right.messageTime - left.messageTime
  }

  if (left.orderId !== right.orderId) {
    return left.orderId.localeCompare(right.orderId)
  }

  return left.status - right.status
}

export const isTradePushMessage = (value: unknown): value is TradePushMessage => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'orderId' in value && 'orderType' in value
}

export const isTradeMessageTypeSupported = (msgType: unknown) => {
  const normalizedType = Number(msgType)
  return normalizedType === 2 || normalizedType === 3 || normalizedType === 4
}

export const normalizeTradePushMessage = (message: TradePushMessage): TradeMessageStreamItem => {
  const orderType = normalizePayOrderType(message.orderType)
  const status = normalizePayOrderStatus(message.status ?? message.orderStatus)
  const messageTime = Number(message.createTime ?? Date.now())

  return {
    key: getTradeMessageDedupKey(messageTime, String(message.orderId), status),
    source: 'mqtt',
    orderId: String(message.orderId),
    orderType,
    status,
    messageTime,
    amount: message.amount,
    busiAmount: message.amount,
    currency: message.currency,
    msgType: Number(message.msgType),
    orderStatus: message.orderStatus,
    isFirst: message.isFirst,
    payId: message.payId,
    createTime: message.createTime
  }
}

export const normalizeMemberPayOrderSyncRecord = (
  record: MemberPayOrderSyncItem
): TradeMessageStreamItem => {
  const status = normalizePayOrderStatus(record.status)
  const messageTime = Number(record.messageTime ?? Date.now())

  return {
    key: getTradeMessageDedupKey(messageTime, String(record.orderId), status),
    source: 'sync',
    orderId: String(record.orderId),
    orderType: normalizePayOrderType(record.orderType),
    status,
    messageTime,
    busiAmount: record.busiAmount,
    currency: record.currency
  }
}

export const shouldReplaceOrderStatusCacheItem = (
  previousItem: OrderStatusCacheItem | undefined,
  nextItem: OrderStatusCacheItem
) => {
  if (!previousItem) {
    return true
  }

  return nextItem.messageTime >= previousItem.messageTime
}

export const applyOrderStatusCacheToOrderRecord = <
  T extends Pick<QueryMemberPayOrderPageRecord, 'orderId' | 'status' | 'orderType'> & {
    busiAmount?: number | string
    currency?: string
  }
>(
  record: T,
  orderStatusMap: OrderStatusMap
) => {
  const cachedItem = orderStatusMap[String(record.orderId)]

  if (!cachedItem) {
    return record
  }

  return {
    ...record,
    orderType: cachedItem.orderType,
    status: cachedItem.status,
    busiAmount: cachedItem.busiAmount ?? record.busiAmount,
    currency: cachedItem.currency ?? record.currency
  }
}

export const applyOrderStatusCacheToOrderDetail = (
  detail: QueryPayOrderByOrderIdResult,
  orderStatusMap: OrderStatusMap
) => {
  const cachedItem = orderStatusMap[String(detail.orderId)]

  if (!cachedItem) {
    return detail
  }

  return {
    ...detail,
    orderType: cachedItem.orderType,
    status: cachedItem.status,
    busiAmount: cachedItem.busiAmount ?? detail.busiAmount,
    currency: cachedItem.currency ?? detail.currency
  }
}
