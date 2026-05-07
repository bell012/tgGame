import emptyDarkImage from '@/static/img/explore/default.png'
import emptyLightImage from '@/static/img/explore/default_white.png'
import avatarImage from '@/static/img/home/avatar.png'
import invitePosterFallbackImage from '@/static/img/personalCenter/yaoqing.png'
import invitePosterImage from '@/static/img/personalCenter/yaoqing2.png'
import type {
  QueryReferralDetailsClaimHistoryResult,
  QueryReferralDetailsRewardHistoryResult,
  QueryReferralDetailsTopUpStatsResult
} from '@/api/interface/agent'
import { formatTimestamp } from '@/utils/date'
import { formatBalance } from '@/utils/locale'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

export type ReferralDetailsTabValue = 'friends' | 'stats' | 'reward-history' | 'claim-history'
export type ReferralDetailsFriendStatus = 'active' | 'inactive'
export type ReferralDetailsDateFilterValue =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last3days'
  | 'last15days'
  | 'last30days'

export interface ReferralDetailsTabItem {
  label: string
  value: ReferralDetailsTabValue
}

export interface ReferralDetailsSummaryItem {
  label: string
  value: string | number
}

export interface ReferralDetailsFriendItem {
  id: string
  userId: string
  avatar: string
  vipId: number
  vipLevel: string
  deposit: string | number
  validBets: string | number
  createTime: string
  status: ReferralDetailsFriendStatus
  statusText: string
}

export interface ReferralDetailsTopUpSummaryItem {
  label: string
  value: string
}

export interface ReferralDetailsTopUpTableRow {
  method: string
  amount: string
  count: string
}

export interface ReferralDetailsClaimHistoryRow {
  id: string
  time: string
  reward: string
}

export interface ReferralDetailsRewardHistoryRow {
  id: string
  time: string
  commission: string
}

export interface ReferralDetailsStatsChartCard {
  title: string
  xAxisData: string[]
  seriesData: number[]
}

export interface ReferralDetailsFilterValues {
  time: ReferralDetailsDateFilterValue
}

export interface ReferralDetailsDateOption {
  label: string
  value: ReferralDetailsDateFilterValue
}

export interface ReferralDetailsApiMemberItem {
  creationTime?: number
  downloadSite?: string
  subBet?: number
  subRecharge?: number
  userAccount?: string
  userId?: string
  vipId?: number
}

export interface ReferralDetailsStatsResult {
  activeSubNum?: number
  memberList?: ReferralDetailsApiMemberItem[]
  newSub?: number
  subBet?: number
  subNum?: number
  subRecharge?: number
}

export type ReferralDetailsTopUpStatsResult = QueryReferralDetailsTopUpStatsResult
export type ReferralDetailsClaimHistoryResult = QueryReferralDetailsClaimHistoryResult
export type ReferralDetailsRewardHistoryResult = QueryReferralDetailsRewardHistoryResult

/**
 * 返回推荐详情页默认头像资源。
 */
export const getReferralDetailsAvatarImage = () => avatarImage

/**
 * 返回推荐详情页空状态深色资源。
 */
export const getReferralDetailsEmptyDarkImage = () => emptyDarkImage

/**
 * 返回推荐详情页空状态浅色资源。
 */
export const getReferralDetailsEmptyLightImage = () => emptyLightImage

/**
 * 返回推荐详情页邀请海报资源。
 */
export const getReferralDetailsInvitePosterImages = () => [
  invitePosterImage,
  invitePosterFallbackImage
]

/**
 * 返回推荐详情页默认日期筛选值。
 */
export const createDefaultReferralDetailsFilterValues = (): ReferralDetailsFilterValues => ({
  time: 'today'
})

/**
 * 返回推荐详情页日期筛选项。
 */
export const createReferralDetailsDateOptions = (t: TranslateFn): ReferralDetailsDateOption[] => [
  {
    label: t('referral.detailsPage.date.all'),
    value: 'all'
  },
  {
    label: t('referral.detailsPage.date.today'),
    value: 'today'
  },
  {
    label: t('referral.detailsPage.date.yesterday'),
    value: 'yesterday'
  },
  {
    label: t('referral.detailsPage.date.last3Days'),
    value: 'last3days'
  },
  {
    label: t('referral.detailsPage.date.last15Days'),
    value: 'last15days'
  },
  {
    label: t('referral.detailsPage.date.last30Days'),
    value: 'last30days'
  }
]

/**
 * 返回推荐详情页当前日期筛选文案。
 */
export const getReferralDetailsDateLabel = (
  t: TranslateFn,
  value: ReferralDetailsDateFilterValue
) => {
  const option = createReferralDetailsDateOptions(t).find(item => item.value === value)

  return option?.label ?? t('referral.detailsPage.date.today')
}

/**
 * 规范化推荐详情页日期筛选值。
 */
export const normalizeReferralDetailsFilterValues = (
  values: Partial<Record<string, string | string[]>>
): ReferralDetailsFilterValues => {
  const timeValue = values.time

  return {
    time: (Array.isArray(timeValue)
      ? timeValue[0]
      : (timeValue ?? 'today')) as ReferralDetailsDateFilterValue
  }
}

const getStartOfDay = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate.getTime()
}

const getEndOfDay = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(23, 59, 59, 999)
  return nextDate.getTime()
}

/**
 * 构建推荐详情页日期筛选请求参数。
 */
export const buildReferralDetailsDateRange = (value: ReferralDetailsDateFilterValue) => {
  if (value === 'all') {
    return {}
  }

  const now = new Date()

  if (value === 'today') {
    return {
      startTime: getStartOfDay(now),
      endTime: getEndOfDay(now)
    }
  }

  if (value === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    return {
      startTime: getStartOfDay(yesterday),
      endTime: getEndOfDay(yesterday)
    }
  }

  const dayCountMap: Record<
    Exclude<ReferralDetailsDateFilterValue, 'all' | 'today' | 'yesterday'>,
    number
  > = {
    last3days: 3,
    last15days: 15,
    last30days: 30
  }

  const dayCount = dayCountMap[value]
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - (dayCount - 1))

  return {
    startTime: getStartOfDay(startDate),
    endTime: getEndOfDay(now)
  }
}

/**
 * 生成推荐详情页顶部标签数据。
 */
export const createReferralDetailsTabs = (t: TranslateFn): ReferralDetailsTabItem[] => [
  {
    label: t('referral.detailsPage.tabs.friends'),
    value: 'friends'
  },
  {
    label: t('referral.detailsPage.tabs.stats'),
    value: 'stats'
  },
  {
    label: t('referral.detailsPage.tabs.rewardHistory'),
    value: 'reward-history'
  },
  {
    label: t('referral.detailsPage.tabs.claimHistory'),
    value: 'claim-history'
  }
]

/**
 * 生成推荐详情页统计卡片数据。
 */
export const createReferralDetailsSummaryList = (
  t: TranslateFn,
  result?: ReferralDetailsStatsResult | null
): ReferralDetailsSummaryItem[] => [
  {
    label: t('referral.detailsPage.summary.newFriends'),
    value: Number(result?.newSub ?? 0)
  },
  {
    label: t('referral.detailsPage.summary.activeFriends'),
    value: Number(result?.activeSubNum ?? 0)
  },
  {
    label: t('referral.detailsPage.summary.validBets'),
    value: formatBalance(Number(result?.subBet ?? 0), 2)
  }
]

/**
 * 生成推荐详情页好友列表数据。
 */
export const createReferralDetailsFriends = (
  t: TranslateFn,
  result?: ReferralDetailsStatsResult | null
): ReferralDetailsFriendItem[] =>
  (result?.memberList ?? []).map(item => {
    const isActive = Number(item.subBet ?? 0) > 0

    return {
      id: String(item.userAccount ?? item.userId ?? '--'),
      userId: String(item.userId ?? ''),
      avatar: avatarImage,
      vipId: Number(item.vipId ?? 0),
      vipLevel: `VIP${Number(item.vipId ?? 0)}`,
      deposit: formatBalance(Number(item.subRecharge ?? 0), 2),
      validBets: formatBalance(Number(item.subBet ?? 0), 2),
      createTime: formatTimestamp(item.creationTime),
      status: isActive ? 'active' : 'inactive',
      statusText: isActive
        ? t('referral.detailsPage.status.active')
        : t('referral.detailsPage.status.inactive')
    }
  })

const formatReferralDetailsMetric = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0'
  }

  return Number.isInteger(value) ? String(value) : formatBalance(value, 2)
}

/**
 * 生成推荐详情页充值统计汇总数据。
 */
export const createReferralDetailsTopUpSummary = (
  t: TranslateFn,
  result?: ReferralDetailsTopUpStatsResult | null
): ReferralDetailsTopUpSummaryItem[] => [
  {
    label: t('referral.detailsPage.topUpSummary.firstDepositors'),
    value: formatReferralDetailsMetric(Number(result?.subFirstRecharge ?? 0))
  },
  {
    label: t('referral.detailsPage.topUpSummary.depositors'),
    value: formatReferralDetailsMetric(Number(result?.subRechargeNum ?? 0))
  },
  {
    label: t('referral.detailsPage.topUpSummary.depositAmount'),
    value: formatReferralDetailsMetric(Number(result?.subRecharge ?? 0))
  }
]

/**
 * 生成推荐详情页充值统计表格数据。
 */
export const createReferralDetailsTopUpRows = (
  result?: ReferralDetailsTopUpStatsResult | null
): ReferralDetailsTopUpTableRow[] => [
  {
    method: 'USDT',
    amount: formatBalance(Number(result?.usdtSubRecharge ?? 0), 2),
    count: formatReferralDetailsMetric(Number(result?.usdtSubRechargeNum ?? 0))
  },
  {
    method: 'PAY',
    amount: formatBalance(Number(result?.paySubRecharge ?? 0), 2),
    count: formatReferralDetailsMetric(Number(result?.paySubRechargeNum ?? 0))
  },
  {
    method: 'UPAY',
    amount: formatBalance(Number(result?.upaySubRecharge ?? 0), 2),
    count: formatReferralDetailsMetric(Number(result?.upaySubRechargeNum ?? 0))
  }
]

/**
 * 计算推荐详情页领取记录总佣金。
 */
export const getReferralDetailsClaimHistoryTotalCommission = (
  result?: ReferralDetailsClaimHistoryResult | null
) =>
  formatBalance(
    (result?.records ?? []).reduce((sum, item) => sum + Number(item.commissionAmount ?? 0), 0),
    2
  )

/**
 * 返回推荐详情页领取记录币种。
 */
export const getReferralDetailsClaimHistoryCurrencyCode = (
  result?: ReferralDetailsClaimHistoryResult | null
) => String(result?.records?.[0]?.currencyCode ?? '')

/**
 * 生成推荐详情页领取记录表格数据。
 */
export const createReferralDetailsClaimHistoryRows = (
  result?: ReferralDetailsClaimHistoryResult | null
): ReferralDetailsClaimHistoryRow[] =>
  (result?.records ?? []).map(item => ({
    id: String(item.rowId ?? `${item.creationTime ?? 0}-${item.obtainType ?? 0}`),
    time: formatTimestamp(item.creationTime),
    reward: formatBalance(Number(item.amount ?? 0), 2)
  }))

/**
 * 计算推荐详情页佣金记录总佣金。
 */
export const getReferralDetailsRewardHistoryTotalCommission = (
  result?: ReferralDetailsRewardHistoryResult | null
) =>
  formatBalance(
    (result?.records ?? []).reduce(
      (sum, item) => sum + Number(item.commissionAmount ?? item.amount ?? 0),
      0
    ),
    2
  )

/**
 * 返回推荐详情页佣金记录币种。
 */
export const getReferralDetailsRewardHistoryCurrencyCode = (
  result?: ReferralDetailsRewardHistoryResult | null
) => String(result?.records?.[0]?.currencyCode ?? result?.records?.[0]?.currency ?? '')

/**
 * 生成推荐详情页佣金记录表格数据。
 */
export const createReferralDetailsRewardHistoryRows = (
  result?: ReferralDetailsRewardHistoryResult | null
): ReferralDetailsRewardHistoryRow[] =>
  (result?.records ?? []).map(item => ({
    id: String(item.rowId ?? `${item.createTime ?? item.creationTime ?? 0}`),
    time: formatTimestamp(item.createTime ?? item.creationTime ?? item.statisticsDate),
    commission: formatBalance(Number(item.commissionAmount ?? item.amount ?? 0), 2)
  }))
