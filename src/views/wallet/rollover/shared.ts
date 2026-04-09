import type { QueryInspectPageForm, QueryInspectPageResult } from '@/api/interface/record.interface'
import { createBetHistoryTimeOptions } from '../betHistory/shared'
import { formatTimestamp } from '@/utils/date'
import { formatBalance, getCurrentCurrency } from '@/utils/locale'

type TranslateFn = (key: string) => string

export type QueryRecord = QueryInspectPageResult['records'][number]
export type FilterValue = string | string[] | undefined

export interface Item {
  id: number
  gameName: string
  direction: 'add' | 'dec'
  amount: string
  actualTurnover: string
  requiredTurnover: string
  currency: string
  time: string
  createdAt: string
  applicableGames: string
  status: boolean
  rawData?: QueryRecord
}

export interface RolloverFilterValues {
  time: string
  status: string
  type: string
}

export interface SelectOption {
  label: string
  value: string
}

type FilterInput = Partial<Record<string, FilterValue>>

export const ROLLOVER_PAGE_SIZE = 10

export const ROLLOVER_CHANGE_TYPE_VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '13', '14']

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

export const createEmptyRolloverItem = (t: TranslateFn): Item => ({
  id: 0,
  gameName: '--',
  direction: 'add',
  amount: '--',
  actualTurnover: '--',
  requiredTurnover: '--',
  currency: getCurrentCurrency(),
  time: '--',
  createdAt: '--',
  applicableGames: t('wallet.allGames'),
  status: true
})

export const createDefaultRolloverFilterValues = (): RolloverFilterValues => ({
  time: 'all',
  status: 'all',
  type: 'all'
})

export const createRolloverTimeOptions = createBetHistoryTimeOptions

export const createRolloverStatusOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('transaction.completed'), value: '0' },
  { label: t('transaction.notCompleted'), value: '1' }
]

export const createRolloverTypeOptions = (t: TranslateFn): SelectOption[] => [
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

export const normalizeRolloverFilterValues = (values: FilterInput): RolloverFilterValues => ({
  time: getSingleFilterValue(values.time),
  status: getSingleFilterValue(values.status),
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

export const getRolloverTypeLabel = (changeType: number, t: TranslateFn) => {
  const translationKey = TRANSACTION_TYPE_KEY_MAP[changeType]
  return translationKey
    ? t(`transaction.typeOptions.${translationKey}`)
    : String(changeType || '--')
}

export const formatSignedAmount = (amount?: number) => {
  const numericValue = Number(amount ?? 0)
  const prefix = numericValue >= 0 ? '+' : '-'
  return `${prefix}${formatBalance(Math.abs(numericValue), 2)}`
}

export const mapRecordToItem = (record: QueryRecord, t: TranslateFn): Item => ({
  id: record.rowId,
  gameName: getRolloverTypeLabel(record.changeType, t),
  direction: record.amount >= 0 ? 'add' : 'dec',
  amount: formatSignedAmount(record.amount),
  actualTurnover: formatSignedAmount(record.betAmount),
  requiredTurnover: formatSignedAmount(record.currentBetAmount),
  currency: record.currency || getCurrentCurrency(),
  time: formatTimestamp(record.createTime),
  createdAt: formatTimestamp(record.createTime),
  applicableGames: t('wallet.allGames'),
  status: record.status === 0,
  rawData: record
})

export const buildRolloverQueryForm = (params: {
  page: number
  pageSize: number
  filterValues: FilterInput
}): QueryInspectPageForm => {
  const normalized = normalizeRolloverFilterValues(params.filterValues)
  const { startTime, endTime } = getTimeRange(normalized.time)

  return {
    startTime,
    endTime,
    page: { current: params.page, size: params.pageSize },
    state: normalized.status === 'all' ? null : Number(normalized.status),
    changeTypes: normalized.type === 'all' ? [...ROLLOVER_CHANGE_TYPE_VALUES] : [normalized.type]
  }
}

export const hasMoreByTotal = (
  total: number | undefined,
  page: number,
  pageSize: number,
  count: number
) => (typeof total === 'number' ? page * pageSize < total : count >= pageSize)
