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

export const ROLLOVER_CHANGE_TYPE_VALUES = [
  '2',
  '5',
  '14',
  '47',
  '7',
  '10',
  '11',
  '13',
  '8',
  '15',
  '33',
  '20',
  '21',
  '35',
  '60',
  '66',
  '70',
  '71',
  '72',
  '80',
  '73',
  '75',
  '76',
  '74',
  '82'
]

const TRANSACTION_TYPE_KEY_MAP: Record<number, string> = {
  2: 'deposit',
  5: 'manual_Deposit',
  14: 'deposit_Bonus',
  47: 'withdrawa_Bonus',
  7: 'bonus_Credit',
  10: 'weekly_Bonus',
  11: 'monthly_Bonus',
  13: 'VIP_Upgrade_Bonus',
  8: 'rebate',
  15: 'task_Reward',
  33: 'feedback_Reward',
  20: 'commission',
  21: 'referral_Bonus',
  35: 'referral_Spin',
  60: 'red_Packet',
  66: 'check-in_Reward',
  70: 'login_Reward',
  71: 'download_Reward',
  72: 'sign-up_Reward',
  80: 'bonus_Event_Reward',
  73: 'cash_Voucher',
  75: 'golden_Egg_Voucher',
  76: 'lucky_Spin_Voucher',
  74: 'red_Packet_Voucher',
  82: 'mystery_Box_Voucher'
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
  { label: t('transaction.completed'), value: '1' },
  { label: t('transaction.notCompleted'), value: '0' }
]

export const createRolloverTypeOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('transaction.typeOptions.deposit'), value: '2' },
  { label: t('transaction.typeOptions.manual_Deposit'), value: '5' },
  { label: t('transaction.typeOptions.deposit_Bonus'), value: '14' },
  { label: t('transaction.typeOptions.withdrawa_Bonus'), value: '47' },
  { label: t('transaction.typeOptions.bonus_Credit'), value: '7' },
  { label: t('transaction.typeOptions.weekly_Bonus'), value: '10' },
  { label: t('transaction.typeOptions.monthly_Bonus'), value: '11' },
  { label: t('transaction.typeOptions.VIP_Upgrade_Bonus'), value: '13' },
  { label: t('transaction.typeOptions.rebate'), value: '8' },
  { label: t('transaction.typeOptions.task_Reward'), value: '15' },
  { label: t('transaction.typeOptions.feedback_Reward'), value: '33' },
  { label: t('transaction.typeOptions.commission'), value: '20' },
  { label: t('transaction.typeOptions.referral_Bonus'), value: '21' },
  { label: t('transaction.typeOptions.referral_Spin'), value: '35' },
  { label: t('transaction.typeOptions.red_Packet'), value: '60' },
  { label: t('transaction.typeOptions.check-in_Reward'), value: '66' },
  { label: t('transaction.typeOptions.login_Reward'), value: '70' },
  { label: t('transaction.typeOptions.download_Reward'), value: '71' },
  { label: t('transaction.typeOptions.sign-up_Reward'), value: '72' },
  { label: t('transaction.typeOptions.bonus_Event_Reward'), value: '80' },
  { label: t('transaction.typeOptions.cash_Voucher'), value: '73' },
  { label: t('transaction.typeOptions.golden_Egg_Voucher'), value: '75' },
  { label: t('transaction.typeOptions.lucky_Spin_Voucher'), value: '76' },
  { label: t('transaction.typeOptions.red_Packet_Voucher'), value: '74' },
  { label: t('transaction.typeOptions.mystery_Box_Voucher'), value: '82' }
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
  actualTurnover: formatBalance(record.currentBetAmount),
  requiredTurnover: formatBalance(record.betAmount),
  currency: record.currency || getCurrentCurrency(),
  time: formatTimestamp(record.createTime),
  createdAt: formatTimestamp(record.createTime),
  applicableGames: t('wallet.allGames'),
  status: record.status === 1,
  rawData: record
})

// 过滤掉Required Turnover 小于等于0 整个item数据
export const shouldDisplayRolloverItem = (item: Item) => Number(item.requiredTurnover) > 0

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
