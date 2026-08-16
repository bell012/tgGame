import type { RewardCenterBonusItem, RewardCenterRecord } from '@/api/interface/reward-center'
import type { QueryAcctHisPageResult } from '@/api/interface/record.interface'
import { getSingleFilterValue, getTimeRange } from '@/views/wallet/transaction/shared'
import {
  formatBalance,
  getCurrentCurrency,
  getFormattedBalance,
  getLanguageCode
} from '@/utils/locale'
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
  [REWARD_CENTER_ACTIVITY_CODE.TASK]: 'task',
  [REWARD_CENTER_ACTIVITY_CODE.ENTRANT_TASK]: 'entrantTask'
}

const REWARD_CENTER_CHANGE_TYPE_KEY_MAP: Record<number, string> = {
  1: 'game',
  2: 'deposit',
  3: 'withdraw',
  4: 'refund',
  5: 'manualDeposit',
  6: 'systemDeduction',
  7: 'bonusCredit',
  8: 'rebate',
  9: 'currencyTransfer',
  10: 'weeklyBonus',
  11: 'monthlyBonus',
  13: 'vipUpgradeBonus',
  14: 'depositBonus',
  15: 'taskReward',
  16: 'bet',
  17: 'win',
  18: 'pointsExchange',
  19: 'activityPoints',
  20: 'commission',
  21: 'referralBonus',
  22: 'newcomerBenefit',
  23: 'reliefFundEvent',
  24: 'redPacketReward',
  25: 'checkInEvent',
  26: 'rebateEvent',
  27: 'rechargeEvent',
  28: 'redemptionCodeEvent',
  29: 'agentEvent',
  30: 'promotionSubmissionEvent',
  31: 'agentRebateEvent',
  32: 'luckyBonus',
  33: 'feedbackReward',
  35: 'referralSpin',
  38: 'dailyBonus',
  39: 'thirdPartyBet',
  40: 'cancelThirdPartyBet',
  41: 'vaultChange',
  42: 'liveBattleBet',
  43: 'liveBattleWin',
  44: 'liveBattleTournamentReward',
  45: 'manualPointsCredit',
  46: 'manualPointsDeduction',
  47: 'withdrawalBonus',
  48: 'treasureBoxBonus',
  50: 'memberTransfer',
  51: 'lotteryWin',
  52: 'registrationFee',
  54: 'tournamentBonus',
  55: 'handlingFee',
  56: 'ticketRegistrationFee',
  57: 'tournamentTicket',
  58: 'tournamentEventReward',
  59: 'loanTransferOut',
  60: 'redPacketEvent',
  62: 'memberCredit',
  63: 'memberDeduction',
  64: 'agentCommission',
  65: 'doubleOrNothing',
  66: 'checkInReward',
  67: 'rechargeBonusReward',
  68: 'jackpotEvent',
  69: 'starTurnoverReward',
  70: 'loginReward',
  71: 'downloadReward',
  72: 'signUpReward',
  73: 'cashVoucher',
  74: 'redPacketVoucher',
  75: 'goldenEggVoucher',
  76: 'luckySpinVoucher',
  77: 'groupBuyReward',
  78: 'gameToContractAccount',
  79: 'contractToGameAccount',
  80: 'bonusEventReward',
  81: 'redPacketEventReward',
  82: 'mysteryBoxVoucher',
  83: 'platformToMainAccount',
  84: 'designatedAccountWin',
  85: 'designatedAccountReset'
}

const pickPendingBonusRowId = (item: RewardCenterBonusItem) => {
  const candidates = [item.activityId, item.rowId, item.id]

  for (const candidate of candidates) {
    if (candidate != null && candidate !== '') {
      return candidate
    }
  }

  return undefined
}

const buildPendingBonusListId = (item: RewardCenterBonusItem, index: number) => {
  const rowId = pickPendingBonusRowId(item)
  if (rowId != null) {
    return String(rowId)
  }

  if (item.startDate != null) {
    return `${item.activityCode}-${item.startDate}-${index}`
  }

  return `${item.activityCode}-${index}`
}

const resolveRewardCenterLanguageNames = (items?: RewardCenterBonusItem['activityName']) => {
  if (!items?.length) {
    return {
      activityName: '',
      fallbackActivityName: ''
    }
  }

  const languageCode = getLanguageCode()
  const matched = items.find(item => item.languageCode === languageCode && item.name)
  return {
    activityName: String(matched?.name || '').trim(),
    fallbackActivityName: String(items[0]?.name || '').trim()
  }
}

export const getRewardCenterRecordId = (record: RewardCenterRecord) => {
  if (record.listId) {
    return record.listId
  }

  if (record.rowId != null && record.rowId !== '') {
    return String(record.rowId)
  }

  return ''
}

export const mapBonusToRewardRecord = (
  item: RewardCenterBonusItem,
  index: number
): RewardCenterRecord => {
  const { activityName, fallbackActivityName } = resolveRewardCenterLanguageNames(item.activityName)

  return {
    listId: buildPendingBonusListId(item, index),
    rowId: pickPendingBonusRowId(item),
    activityCode: item.activityCode,
    activityName,
    fallbackActivityName,
    moneyType: item.moneyType,
    rewardAmount: Math.abs(Number(item.amount ?? 0)),
    createTime: item.startDate
  }
}

/** 每条 bonus 单独展示，同 activityCode 多条保留各自 rowId */
export const mapBonusItemsToPendingRecords = (
  items: RewardCenterBonusItem[]
): RewardCenterRecord[] => items.map(mapBonusToRewardRecord)

export const resolvePendingBonusActivityName = (record: RewardCenterRecord, t: TranslateFn) => {
  const activityName = String(record.activityName || '').trim()
  if (activityName) {
    return activityName
  }

  if (record.activityCode != null) {
    const key = REWARD_CENTER_ACTIVITY_TYPE_KEY_MAP[record.activityCode]
    if (key) {
      return t(`rewardCenter.activityTypes.${key}`)
    }
  }

  return String(record.fallbackActivityName || '').trim() || '--'
}

export const isPendingRewardClaimable = (record: RewardCenterRecord) => {
  const activityCode = record.activityCode

  if (activityCode == null || !isSupportedPendingClaimActivityCode(activityCode)) {
    return false
  }

  return true
}

export const REWARD_CENTER_FETCH_SIZE = 100
export const REWARD_CENTER_CLAIMED_PAGE_SIZE = 20

export type AcctHisBonusRecord = QueryAcctHisPageResult['records'][number]

export const buildRewardCenterPendingQuery = () => ({
  currency: getCurrentCurrency()
})

export const buildRewardCenterClaimAllQuery = buildRewardCenterPendingQuery

export const REWARD_CENTER_TABS: RewardCenterTab[] = ['pending', 'claimed']

export const createDefaultRewardCenterFilterValues = (): RewardCenterFilterValues => ({
  time: 'all'
})

export const createRewardCenterTimeOptions = (t: TranslateFn) => [
  { label: t('rewardCenter.filterOptions.all'), value: 'all' },
  { label: t('rewardCenter.filterOptions.today'), value: 'today' },
  { label: t('rewardCenter.filterOptions.yesterday'), value: 'yesterday' },
  { label: t('rewardCenter.filterOptions.last3Days'), value: 'last3days' },
  { label: t('rewardCenter.filterOptions.last15Days'), value: 'last15days' },
  { label: t('rewardCenter.filterOptions.last30Days'), value: 'last30days' }
]

export const getRewardCenterTimeLabel = (t: TranslateFn, value: string) => {
  const normalized = getSingleFilterValue(value)
  if (!normalized || normalized === 'all') {
    return t('rewardCenter.filterOptions.all')
  }

  const option = createRewardCenterTimeOptions(t).find(item => item.value === normalized)
  return option?.label ?? t('rewardCenter.filterOptions.all')
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
  rewardAmount: Math.abs(Number(record.busiAmount ?? 0)),
  claimTime: record.createTime,
  createTime: record.createTime,
  changeType: record.changeType,
  changeNote: String(record.changeNote?.trim() || '')
})

export const resolveClaimedBonusActivityName = (record: RewardCenterRecord, t: TranslateFn) => {
  if (record.changeType != null) {
    const key = REWARD_CENTER_CHANGE_TYPE_KEY_MAP[record.changeType]
    if (key) {
      return t(`rewardCenter.changeTypes.${key}`)
    }
  }

  return String(record.changeNote || '').trim() || '--'
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
  const amount = Number(record.rewardAmount ?? 0)
  const timestamp = mode === 'claimed' ? (record.claimTime ?? record.createTime) : record.createTime

  return {
    id: getRewardCenterRecordId(record),
    activityName:
      mode === 'claimed'
        ? resolveClaimedBonusActivityName(record, t)
        : resolvePendingBonusActivityName(record, t),
    amountText: formatBalance(amount, 2),
    upToAmountText: t('rewardCenter.upTo', {
      amount: formatBalance(amount, 2)
    }),
    timeText: timestamp ? formatDisplayTime(timestamp) : '--',
    raw: record
  }
}

/** 奖励中心页面汇总：仅数字，不带货币符号 */
export const formatRewardCenterSummaryTotal = (value: number | string | undefined) =>
  formatBalance(Number(value ?? 0), 2)

/** 顶部领取弹窗金额：币种符号 + 金额 */
export const formatRewardCenterPopupAmount = (value: number | string | undefined) =>
  getFormattedBalance(Number(value ?? 0), getCurrentCurrency(), 2)

/** 领取成功弹窗 amount：仅数字文本，符号由 ClaimSuccessPopup 处理 */
export const formatRewardCenterClaimAmount = (value: number | string | undefined) =>
  formatBalance(Number(value ?? 0), 2)
