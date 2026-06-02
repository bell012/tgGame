import type { QueryAcctHisPageForm, QueryAcctHisPageResult } from '@/api/interface/record.interface'
import { formatTimestamp } from '@/utils/date'
import { getCurrentCurrency, formatBalance } from '@/utils/locale'

type TranslateFn = (key: string) => string

export type QueryRecord = QueryAcctHisPageResult['records'][number]
export type FilterValue = string | string[] | undefined

export interface Item {
  id: number
  gameType: string
  gameName: string
  direction: 'add' | 'dec'
  betAmount: string
  signedBetAmount: string
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
  1: 'game',
  2: 'deposit',
  3: 'withdraw',
  4: 'refund',
  5: 'manual_Deposit',
  6: 'system_Deduction',
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

export const createEmptyTransactionItem = (): Item => ({
  id: 0,
  gameType: '--',
  gameName: '--',
  direction: 'add',
  betAmount: '--',
  signedBetAmount: '--',
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
  { label: t('transaction.typeOptions.game'), value: '1' },
  { label: t('transaction.typeOptions.deposit'), value: '2' },
  { label: t('transaction.typeOptions.withdraw'), value: '3' },
  { label: t('transaction.typeOptions.refund'), value: '4' },
  { label: t('transaction.typeOptions.manual_Deposit'), value: '5' },
  { label: t('transaction.typeOptions.system_Deduction'), value: '6' },
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

export const formatSignedTransactionAmount = (amount: number) => {
  const prefix = amount >= 0 ? '+' : '-'
  return `${prefix}${formatBalance(Math.abs(amount), 2)}`
}

const getTransactionDeltaAmount = (record: QueryRecord) => {
  if (Number(record.changeType) === 1) {
    const winLoseAmount = Number(record.winLoseAmount)

    if (Number.isFinite(winLoseAmount)) {
      return winLoseAmount
    }
  }

  const newBalance = Number(record.newBalance ?? 0)
  const oldBalance = Number(record.oldBalance ?? 0)

  if (!Number.isFinite(newBalance) || !Number.isFinite(oldBalance)) {
    return 0
  }

  return newBalance - oldBalance
}

export const mapRecordToItem = (record: QueryRecord, t: TranslateFn): Item => {
  const currency = record.currency || getCurrentCurrency()
  const gameName = getTransactionTypeLabel(record.changeType, t)
  const deltaAmount = getTransactionDeltaAmount(record)

  return {
    id: record.accountChangeId,
    gameType: gameName,
    gameName,
    direction: deltaAmount >= 0 ? 'add' : 'dec',
    betAmount: formatBalance(Math.abs(deltaAmount), 2),
    signedBetAmount: formatSignedTransactionAmount(deltaAmount),
    profit: formatBalance(record.newBalance, 2),
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
