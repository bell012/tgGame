import type { QueryAcctHisPageForm, QueryAcctHisPageResult } from '@/api/interface/record.interface'
import { formatTimestamp } from '@/utils/date'
import { getCurrentCurrency, getFormattedBalance } from '@/utils/locale'

type TranslateFn = (key: string) => string

export type QueryRecord = QueryAcctHisPageResult['records'][number]
export type FilterValue = string | string[] | undefined

export interface Item {
  id: number
  gameType: string
  gameName: string
  direction: 'add' | 'dec'
  betAmount: string
  profit: string
  currency: string
  orderNo: string
  createdAt: string
  time: string
  remarks: string
  rawData?: QueryRecord
}

export interface TransactionFilterValues {
  time: string
  type: string
}

export interface SelectOption {
  label: string
  value: string
}

type FilterInput = Partial<Record<string, FilterValue>>

export const TRANSACTION_PAGE_SIZE = 10

export const TRANSACTION_CHANGE_TYPE_VALUES = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '13',
  '14'
]

const TRANSACTION_TYPE_KEY_MAP: Record<number, string> = {
  1: 'gameSwitch',
  2: 'memberDeposit',
  3: 'memberWithdraw',
  4: 'memberWithdrawReturn',
  5: 'manualDeposit',
  6: 'manualDeduction',
  7: 'bonusGift',
  8: 'commissionClaim',
  9: 'currencyExchange',
  13: 'vipIncome',
  14: 'bonusExchange'
}

export const createEmptyTransactionItem = (): Item => ({
  id: 0,
  gameType: '--',
  gameName: '--',
  direction: 'add',
  betAmount: '--',
  profit: '--',
  currency: getCurrentCurrency(),
  orderNo: '',
  createdAt: '--',
  time: '--',
  remarks: '--'
})

export const createDefaultTransactionFilterValues = (): TransactionFilterValues => ({
  time: 'all',
  type: 'all'
})

// 时间筛选
export const createTransactionTimeOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('betHistory.filterOptions.today'), value: 'today' },
  { label: t('betHistory.filterOptions.yesterday'), value: 'yesterday' },
  { label: t('betHistory.filterOptions.last3Days'), value: 'last3days' },
  { label: t('betHistory.filterOptions.last15Days'), value: 'last15days' },
  { label: t('betHistory.filterOptions.last30Days'), value: 'last30days' }
]

// 交易类型
export const createTransactionTypeOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('transaction.typeOptions.gameSwitch'), value: '1' },
  { label: t('transaction.typeOptions.memberDeposit'), value: '2' },
  { label: t('transaction.typeOptions.memberWithdraw'), value: '3' },
  { label: t('transaction.typeOptions.memberWithdrawReturn'), value: '4' },
  { label: t('transaction.typeOptions.manualDeposit'), value: '5' },
  { label: t('transaction.typeOptions.manualDeduction'), value: '6' },
  { label: t('transaction.typeOptions.bonusGift'), value: '7' },
  { label: t('transaction.typeOptions.commissionClaim'), value: '8' },
  { label: t('transaction.typeOptions.currencyExchange'), value: '9' },
  { label: t('transaction.typeOptions.vipIncome'), value: '13' },
  { label: t('transaction.typeOptions.bonusExchange'), value: '14' }
]

export const getSingleFilterValue = (value: FilterValue) =>
  Array.isArray(value) ? (value[0] ?? 'all') : (value ?? 'all')

export const normalizeTransactionFilterValues = (values: FilterInput): TransactionFilterValues => ({
  time: getSingleFilterValue(values.time),
  type: getSingleFilterValue(values.type)
})

const getTimeRange = (value: string) => {
  const now = new Date()
  const endOfDay = (date: Date) => new Date(date.setHours(23, 59, 59, 999)).getTime()
  const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0)).getTime()

  if (value === 'all') return { startTime: null, endTime: null }
  if (value === 'today') return { startTime: startOfDay(new Date(now)), endTime: now.getTime() }
  if (value === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return {
      startTime: startOfDay(new Date(yesterday)),
      endTime: endOfDay(new Date(yesterday))
    }
  }

  const dayMap: Record<string, number> = { last3days: 3, last15days: 15, last30days: 30 }
  const days = dayMap[value]

  if (!days) {
    return { startTime: null, endTime: null }
  }

  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - (days - 1))
  return { startTime: startOfDay(startDate), endTime: now.getTime() }
}

export const getTransactionTypeLabel = (changeType: number, t: TranslateFn) => {
  const translationKey = TRANSACTION_TYPE_KEY_MAP[changeType]
  return translationKey
    ? t(`transaction.typeOptions.${translationKey}`)
    : String(changeType || '--')
}

export const formatSignedTransactionAmount = (amount: number, currency: string) => {
  const prefix = amount >= 0 ? '+' : '-'
  return `${prefix}${getFormattedBalance(Math.abs(amount), currency, 2)}`
}

export const mapRecordToItem = (record: QueryRecord, t: TranslateFn): Item => {
  const currency = record.currency || getCurrentCurrency()
  const gameName = getTransactionTypeLabel(record.changeType, t)

  return {
    id: record.accountChangeId,
    gameType: gameName,
    gameName,
    direction: record.busiAmount >= 0 ? 'add' : 'dec',
    betAmount: formatSignedTransactionAmount(record.busiAmount, currency),
    profit: getFormattedBalance(record.newBalance, currency, 2),
    currency,
    orderNo: String(record.accountChangeId),
    createdAt: formatTimestamp(record.createTime),
    time: formatTimestamp(record.createTime),
    remarks: record.changeNote || record.backNote || '--',
    rawData: record
  }
}

export const buildTransactionQueryForm = (params: {
  page: number
  pageSize: number
  filterValues: FilterInput
}): QueryAcctHisPageForm => {
  const normalized = normalizeTransactionFilterValues(params.filterValues)
  const { startTime, endTime } = getTimeRange(normalized.time)

  return {
    startTime,
    endTime,
    page: { current: params.page, size: params.pageSize },
    param: {
      currency: getCurrentCurrency()
    },
    changeTypes: normalized.type === 'all' ? [...TRANSACTION_CHANGE_TYPE_VALUES] : [normalized.type]
  }
}

export const hasMoreByTotal = (
  total: number | undefined,
  page: number,
  pageSize: number,
  count: number
) => (typeof total === 'number' ? page * pageSize < total : count >= pageSize)
