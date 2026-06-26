import type { RewardCenterRecord } from '@/api/interface/reward-center'
import {
  createDefaultTransactionFilterValues,
  createTransactionTimeOptions,
  getSingleFilterValue,
  getTimeRange,
  type SelectOption
} from '@/views/wallet/transaction/shared'
import { formatBalance } from '@/utils/locale'
import { formatDisplayTime } from '@/utils/date'

export type RewardCenterTab = 'pending' | 'claimed'

export type RewardCenterFilterValues = {
  time: string
}

export interface RewardCenterListItem {
  id: string
  activityName: string
  amountText: string
  upToAmountText: string
  isRandomAmount: boolean
  timeText: string
  raw: RewardCenterRecord
}

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

export const REWARD_CENTER_FETCH_SIZE = 100

export const REWARD_CENTER_TABS: RewardCenterTab[] = ['pending', 'claimed']

export const REWARD_TYPE_RANDOM = 1

export const createDefaultRewardCenterFilterValues = (): RewardCenterFilterValues => ({
  time: createDefaultTransactionFilterValues().time
})

export const createRewardCenterTimeOptions = (t: TranslateFn): SelectOption[] =>
  createTransactionTimeOptions(t)

export const getRewardCenterTimeLabel = (t: TranslateFn, value: string) => {
  const normalized = getSingleFilterValue(value)
  if (!normalized || normalized === 'all') {
    return t('betHistory.filterOptions.all')
  }

  const option = createRewardCenterTimeOptions(t).find(item => item.value === normalized)
  return option?.label ?? t('betHistory.filterOptions.all')
}

export const normalizeRewardCenterFilterValues = (
  values: Partial<Record<string, string | string[]>>
): RewardCenterFilterValues => ({
  time: getSingleFilterValue(values.time)
})

export const buildRewardCenterClaimedQuery = (params: {
  page: number
  pageSize: number
  filterValues: Partial<Record<string, string | string[]>>
}) => {
  const normalized = normalizeRewardCenterFilterValues(params.filterValues)
  const { startTime, endTime } = getTimeRange(normalized.time)

  return {
    startTime,
    endTime,
    page: {
      current: params.page,
      size: params.pageSize
    }
  }
}

export const getRewardCenterDesktopTabClass = (isActive: boolean) => {
  const base =
    'flex h-12 w-full items-center justify-center rounded-lg px-4 cursor-pointer transition-colors'

  if (isActive) {
    return `${base} bg-theme-primary font-bold text-text-4`
  }

  return `${base} font-normal text-text-2`
}

export const getRewardCenterMobileTabClass = (isActive: boolean) => {
  const base =
    'box-border flex h-9 shrink-0 items-center justify-center rounded-[18px] px-4 py-2 transition-colors'

  if (isActive) {
    return `${base} bg-theme-primary`
  }

  return `${base} bg-bg-2`
}

export const getRewardCenterMobileTabTextClass = (isActive: boolean) =>
  isActive ? 'text-xs font-[700] text-text-4' : 'text-xs font-[500] text-text-2'

export const mapRewardCenterRecord = (
  record: RewardCenterRecord,
  t: TranslateFn,
  mode: RewardCenterTab
): RewardCenterListItem => {
  const rewardType = Number(record.rewardType ?? 0)
  const isRandomAmount = rewardType === REWARD_TYPE_RANDOM
  const amount = Number(record.rewardAmount ?? 0)
  const timestamp = mode === 'claimed' ? (record.claimTime ?? record.createTime) : record.createTime

  return {
    id: String(record.rowId ?? ''),
    activityName: String(record.activityName || '--'),
    amountText: isRandomAmount ? t('rewardCenter.randomAmount') : formatBalance(amount, 2),
    upToAmountText: t('rewardCenter.upTo', {
      amount: formatBalance(amount, 2)
    }),
    isRandomAmount,
    timeText: timestamp ? formatDisplayTime(timestamp) : '--',
    raw: record
  }
}

export const formatRewardCenterTotal = (value: number | string | undefined) =>
  formatBalance(Number(value ?? 0), 2)
