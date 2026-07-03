import type { RewardCenterBonusItem, RewardCenterRecord } from '@/api/interface/reward-center'
import type { QueryAcctHisPageResult } from '@/api/interface/record.interface'
import {
  createDefaultTransactionFilterValues,
  createTransactionTimeOptions,
  getSingleFilterValue,
  getTimeRange,
  getTransactionTypeLabel,
  type SelectOption
} from '@/views/wallet/transaction/shared'
import { formatBalance, getCurrentCurrency, getFormattedBalance } from '@/utils/locale'
import { formatDisplayTime } from '@/utils/date'
import { REWARD_CENTER_ACTIVITY_CODE, isSupportedPendingClaimActivityCode } from './pendingClaim'

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

const REWARD_CENTER_ACTIVITY_TYPE_KEY_MAP: Record<number, string> = {
  [REWARD_CENTER_ACTIVITY_CODE.REBATE]: 'rebate',
  [REWARD_CENTER_ACTIVITY_CODE.RECHARGE]: 'recharge',
  [REWARD_CENTER_ACTIVITY_CODE.CHECK_IN]: 'checkIn',
  [REWARD_CENTER_ACTIVITY_CODE.RESCUE]: 'rescue',
  [REWARD_CENTER_ACTIVITY_CODE.AGENT_COMMISSION]: 'agentCommission',
  [REWARD_CENTER_ACTIVITY_CODE.REBATE_CASHBACK]: 'rebateCashback',
  [REWARD_CENTER_ACTIVITY_CODE.VIP_DAY]: 'vipDay',
  [REWARD_CENTER_ACTIVITY_CODE.VIP_WEEK]: 'vipWeek',
  [REWARD_CENTER_ACTIVITY_CODE.VIP_MONTH]: 'vipMonth',
  [REWARD_CENTER_ACTIVITY_CODE.VIP_UPGRADE]: 'vipUpgrade',
  [REWARD_CENTER_ACTIVITY_CODE.MATCH]: 'match',
  [REWARD_CENTER_ACTIVITY_CODE.TASK]: 'task',
  [REWARD_CENTER_ACTIVITY_CODE.ENTRANT_TASK]: 'entrantTask'
}

export const getRewardCenterActivityTypeLabel = (activityCode: number, t: TranslateFn) => {
  const key = REWARD_CENTER_ACTIVITY_TYPE_KEY_MAP[activityCode]
  return key ? t(`rewardCenter.activityTypes.${key}`) : String(activityCode || '--')
}

export const getRewardCenterRecordId = (record: RewardCenterRecord) => {
  if (record.rowId != null && record.rowId !== '') {
    return String(record.rowId)
  }

  return ''
}

export const buildPendingBonusRecordId = (item: RewardCenterBonusItem, index: number) => {
  if (item.rowId != null && item.rowId !== '') {
    return item.rowId
  }

  const createTime = item.createTime ?? item.modifyTime
  if (createTime != null) {
    return `${item.activityCode}-${createTime}`
  }

  return `${item.activityCode}-${index}`
}

export const mapBonusToRewardRecord = (
  item: RewardCenterBonusItem,
  index: number
): RewardCenterRecord => ({
  rowId: buildPendingBonusRecordId(item, index),
  activityCode: item.activityCode,
  activityName: String(item.activityName?.trim() || ''),
  rewardType: Number(item.rewardType ?? 0),
  rewardAmount: Math.abs(Number(item.rewardAmount ?? item.amount ?? item.busiAmount ?? 0)),
  createTime: item.createTime ?? item.modifyTime
})

/** 单条领取按 activityCode 路由，合并同类型待领取项避免重复 Claim */
export const consolidatePendingRecordsByActivityCode = (
  records: RewardCenterRecord[]
): RewardCenterRecord[] => {
  const byCode = new Map<number, RewardCenterRecord>()
  const withoutCode: RewardCenterRecord[] = []

  for (const record of records) {
    const code = record.activityCode
    if (code == null) {
      withoutCode.push(record)
      continue
    }

    const existing = byCode.get(code)
    if (!existing) {
      byCode.set(code, { ...record })
      continue
    }

    existing.rewardAmount = Number(existing.rewardAmount ?? 0) + Number(record.rewardAmount ?? 0)

    if (!String(existing.activityName || '').trim() && String(record.activityName || '').trim()) {
      existing.activityName = record.activityName
    }

    if (existing.createTime == null && record.createTime != null) {
      existing.createTime = record.createTime
    }
  }

  return [...byCode.values(), ...withoutCode]
}

export const mapBonusItemsToPendingRecords = (
  items: RewardCenterBonusItem[]
): RewardCenterRecord[] =>
  consolidatePendingRecordsByActivityCode(items.map(mapBonusToRewardRecord))

export const resolvePendingBonusActivityName = (record: RewardCenterRecord, t: TranslateFn) => {
  const activityName = String(record.activityName || '').trim()
  if (activityName) {
    return activityName
  }

  if (record.activityCode != null) {
    return getRewardCenterActivityTypeLabel(record.activityCode, t)
  }

  return '--'
}

export const isPendingRewardClaimable = (record: RewardCenterRecord) => {
  const activityCode = record.activityCode
  return activityCode != null && isSupportedPendingClaimActivityCode(activityCode)
}

export const REWARD_CENTER_FETCH_SIZE = 100
export const REWARD_CENTER_CLAIMED_PAGE_SIZE = 20

export type AcctHisBonusRecord = QueryAcctHisPageResult['records'][number]

export const buildRewardCenterPendingQuery = () => ({
  currency: getCurrentCurrency()
})

export const buildRewardCenterClaimAllQuery = buildRewardCenterPendingQuery

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
    param: {
      currency: getCurrentCurrency()
    },
    page: {
      current: params.page,
      size: params.pageSize
    }
  }
}

export const mapAcctHisBonusToRewardRecord = (record: AcctHisBonusRecord): RewardCenterRecord => ({
  rowId: record.accountChangeId,
  activityName: String(record.changeNote?.trim() || ''),
  rewardType: 0,
  rewardAmount: Math.abs(Number(record.busiAmount ?? 0)),
  claimTime: record.createTime,
  createTime: record.createTime,
  changeType: record.changeType
})

export const resolveClaimedBonusActivityName = (record: RewardCenterRecord, t: TranslateFn) => {
  const changeNote = String(record.activityName || '').trim()
  if (changeNote) {
    return changeNote
  }

  if (record.changeType != null) {
    return getTransactionTypeLabel(record.changeType, t)
  }

  return '--'
}

export const sumClaimedBonusAmount = (records: RewardCenterRecord[]) =>
  records.reduce((sum, record) => sum + Number(record.rewardAmount ?? 0), 0)

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
    id: getRewardCenterRecordId(record),
    activityName:
      mode === 'claimed'
        ? resolveClaimedBonusActivityName(record, t)
        : resolvePendingBonusActivityName(record, t),
    amountText: isRandomAmount ? t('rewardCenter.randomAmount') : formatBalance(amount, 2),
    upToAmountText: t('rewardCenter.upTo', {
      amount: formatBalance(amount, 2)
    }),
    isRandomAmount,
    timeText: timestamp ? formatDisplayTime(timestamp) : '--',
    raw: record
  }
}

/** 汇总栏展示：币种符号 + 金额 */
export const formatRewardCenterSummaryTotal = (value: number | string | undefined) =>
  getFormattedBalance(Number(value ?? 0), getCurrentCurrency(), 2)

/** 领取成功弹窗 amount：仅数字文本，符号由 ClaimSuccessPopup 处理 */
export const formatRewardCenterClaimAmount = (value: number | string | undefined) =>
  formatBalance(Number(value ?? 0), 2)
