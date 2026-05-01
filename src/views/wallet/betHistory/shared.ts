import type { QueryOrderInfoPageForm, QueryOrderInfoResult } from '@/api/interface/record.interface'
import { getCurrentCurrency, formatBalance } from '@/utils/locale'
import { formatTimestamp } from '@/utils/date'
import { getGameImage, getGameName, getPlatformList, getPlatformName } from '@/utils/global-dic'
import bet from '@/static/img/personalCenter/bet.png'

type TranslateFn = (key: string) => string
export type QueryRecord = QueryOrderInfoResult['records'][number]
export type FilterValue = string | string[] | undefined

export interface Item {
  id: string
  gameType: string
  gameName: string
  gameIcon: string
  betAmount: string
  result: 'win' | 'loss'
  resultAmount: string
  currency: string
  orderNo: string
  createdAt: string
  time: string
  rawData: QueryRecord
}

export interface BetHistoryFilterValues {
  time: string
  platform: string
  winlost: string
  status: string
  gameType: string
}

export interface SelectOption {
  label: string
  value: string
}

type FilterInput = Partial<Record<string, FilterValue>>

export const BET_HISTORY_PAGE_SIZE = 10

export const createDefaultBetHistoryFilterValues = (): BetHistoryFilterValues => ({
  time: 'all',
  platform: 'all',
  winlost: 'all',
  status: 'all',
  gameType: 'all'
})

// 筛选日期
export const createBetHistoryTimeOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('betHistory.filterOptions.today'), value: 'today' },
  { label: t('betHistory.filterOptions.yesterday'), value: 'yesterday' },
  { label: t('betHistory.filterOptions.last3Days'), value: 'last3days' },
  { label: t('betHistory.filterOptions.last15Days'), value: 'last15days' },
  { label: t('betHistory.filterOptions.last30Days'), value: 'last30days' }
]

// 筛选输赢
export const createBetHistoryWinlostOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('betHistory.win'), value: '1' },
  { label: t('betHistory.loss'), value: '0' }
]

// 筛选状态
export const createBetHistoryStatusOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('betHistory.filterOptions.settled'), value: '1' },
  { label: t('betHistory.filterOptions.unsettled'), value: '0' }
]

// 筛选游戏
export const createBetHistoryGameTypeOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('betHistory.filterOptions.lottery'), value: 'CP' },
  { label: t('betHistory.filterOptions.sports'), value: 'TY' },
  { label: t('betHistory.filterOptions.live'), value: 'ZR' },
  { label: t('betHistory.filterOptions.electronic'), value: 'DZ' },
  { label: t('betHistory.filterOptions.chess'), value: 'QP' },
  { label: t('betHistory.filterOptions.fishing'), value: 'BY' },
  { label: t('betHistory.filterOptions.esports'), value: 'DJ' }
]

// 筛选平台
export const createBetHistoryPlatformOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  ...getPlatformList().map(item => ({
    label: getPlatformName(item.platformCode) || item.platformCode,
    value: item.platformCode
  }))
]

export const getSingleFilterValue = (value: FilterValue) =>
  Array.isArray(value) ? (value[0] ?? 'all') : (value ?? 'all')

export const normalizeBetHistoryFilterValues = (values: FilterInput): BetHistoryFilterValues => ({
  time: getSingleFilterValue(values.time),
  platform: getSingleFilterValue(values.platform),
  winlost: getSingleFilterValue(values.winlost),
  status: getSingleFilterValue(values.status),
  gameType: getSingleFilterValue(values.gameType)
})

const getTimeRange = (value: string) => {
  const now = new Date()
  const endOfDay = (date: Date) => new Date(date.setHours(23, 59, 59, 999)).getTime()
  const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0)).getTime()

  if (value === 'all') return { secondStartTime: null, secondEndTime: null }
  if (value === 'today')
    return { secondStartTime: startOfDay(new Date(now)), secondEndTime: now.getTime() }
  if (value === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return {
      secondStartTime: startOfDay(new Date(yesterday)),
      secondEndTime: endOfDay(new Date(yesterday))
    }
  }

  const dayMap: Record<string, number> = { last3days: 3, last15days: 15, last30days: 30 }
  const days = dayMap[value]
  if (!days) return { secondStartTime: null, secondEndTime: null }

  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - (days - 1))
  return { secondStartTime: startOfDay(startDate), secondEndTime: now.getTime() }
}

export const getBetHistoryGameTypeLabel = (code: string, t: TranslateFn) => {
  const labelMap: Record<string, string> = {
    CP: t('betHistory.filterOptions.lottery'),
    TY: t('betHistory.filterOptions.sports'),
    ZR: t('betHistory.filterOptions.live'),
    DZ: t('betHistory.filterOptions.electronic'),
    QP: t('betHistory.filterOptions.chess'),
    BY: t('betHistory.filterOptions.fishing'),
    DJ: t('betHistory.filterOptions.esports')
  }

  return labelMap[code] || code || '--'
}

/**
 * 列表项的唯一标识。
 */
const resolveBetHistoryItemId = (record: QueryRecord) => {
  if (record.betId) {
    return String(record.betId)
  }

  if (record.issueId) {
    return String(record.issueId)
  }

  if (record.rowId !== null && record.rowId !== undefined) {
    return String(record.rowId)
  }

  return [
    record.memberRowId,
    record.platformCode,
    record.gameCode,
    record.betTime,
    record.createTime,
    record.betAmount,
    record.gameAmount
  ]
    .map(value => String(value ?? ''))
    .join('-')
}

/**
 * 页面展示数据。
 */
export const mapRecordToItem = (record: QueryRecord, t: TranslateFn): Item => {
  const gameType = getBetHistoryGameTypeLabel(record.sysGameTypeCode, t)
  const currency = record.currency || getCurrentCurrency()
  const gameName = getGameName('game_code', `${record.platformCode}|${record.gameCode}`) || '-'
  const gameIcon = getGameImage(record.platformCode, record.gameCode) || bet

  return {
    id: resolveBetHistoryItemId(record),
    gameType,
    gameName,
    gameIcon,
    betAmount: formatBalance(record.betAmount, 2),
    result: record.gameAmount >= 0 ? 'win' : 'loss',
    resultAmount: formatBalance(Math.abs(record.gameAmount), 2),
    currency,
    orderNo: record.betId || record.issueId || String(record.rowId),
    createdAt: formatTimestamp(record.createTime || record.betTime),
    time: formatTimestamp(record.betTime),
    rawData: record
  }
}

export const buildBetHistoryQueryForm = (params: {
  page: number
  pageSize: number
  filterValues: FilterInput
}): QueryOrderInfoPageForm => {
  const normalized = normalizeBetHistoryFilterValues(params.filterValues)
  const { secondStartTime, secondEndTime } = getTimeRange(normalized.time)

  return {
    secondStartTime,
    secondEndTime,
    winlost: normalized.winlost === 'all' ? null : Number(normalized.winlost),
    page: { current: params.page, size: params.pageSize },
    param: {
      currency: getCurrentCurrency(),
      sysGameTypeCode: normalized.gameType === 'all' ? null : normalized.gameType,
      platformCode: normalized.platform === 'all' ? null : normalized.platform,
      gameCode: null,
      status: normalized.status === 'all' ? null : Number(normalized.status)
    }
  }
}

export const hasMoreByTotal = (
  total: number | undefined,
  page: number,
  pageSize: number,
  count: number
) => (typeof total === 'number' ? page * pageSize < total : count >= pageSize)
