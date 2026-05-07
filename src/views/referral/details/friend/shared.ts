import avatarImage from '@/static/img/home/avatar.png'
import emptyDarkImage from '@/static/img/explore/default.png'
import emptyLightImage from '@/static/img/explore/default_white.png'
import { formatTimestamp } from '@/utils/date'
import { formatBalance } from '@/utils/locale'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string
type CategoryLabelStrategy = (translate: TranslateFn) => string

export type ReferralFriendDetailDateTabValue =
  | 'today'
  | 'yesterday'
  | 'last-3-days'
  | 'last-15-days'
  | 'last-30-days'

export type ReferralFriendDetailStatsTabValue = 'game-stats' | 'top-up-stats'

export interface ReferralFriendDetailTabItem<TValue extends string> {
  label: string
  value: TValue
}

export interface ReferralFriendDetailMemberInfo {
  account: string
  userId: string
  name: string
  avatar: string
  vipLevel: string
  lastLoginTime: string
}

export interface ReferralFriendDetailSummaryItem {
  label: string
  value: string | number
}

export interface ReferralFriendDetailTableRow {
  id: string
  name: string
  amount: string | number
  countOrProfit: string | number
}

export interface ReferralFriendDetailMemberResult {
  depositFirstAmount?: number
  loginDate?: number
  memberId?: string
  memberName?: string
  nickName?: string
  rowId?: number
}

export interface ReferralFriendDetailGameStatItem {
  betAmount?: number
  gameAmount?: number
  sysGameTypeCode?: string
}

export interface ReferralFriendDetailTopUpStatResult {
  payRecharge?: number
  payRechargeNum?: number
  upayRecharge?: number
  upayRechargeNum?: number
  usdtRecharge?: number
  usdtRechargeNum?: number
}

/**
 * 分类名称策略（策略模式）：
 * 不同 sysGameTypeCode 对应不同国际化文案来源。
 */
const CATEGORY_LABEL_STRATEGIES: Record<string, CategoryLabelStrategy> = {
  CP: translate => translate('betHistory.filterOptions.lottery'),
  TY: translate => translate('betHistory.filterOptions.sports'),
  ZR: translate => translate('sidebar_menu.casino.children.live_casino'),
  SX: translate => translate('sidebar_menu.casino.children.live_casino'),
  DZ: translate => translate('sidebar_menu.casino.children.slots'),
  QP: translate => translate('sidebar_menu.casino.children.table_games'),
  BY: translate => translate('sidebar_menu.casino.children.fishing'),
  DJ: translate => translate('betHistory.filterOptions.esports')
}

const toSafeNumber = (value: unknown, fallback = 0) => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : fallback
}

const getVipLevelText = (vipId?: number | string) => {
  const nextVipId = toSafeNumber(vipId, 0)
  return nextVipId > 0 ? `VIP${nextVipId}` : '--'
}

const formatSignedAmount = (value: unknown) => {
  const nextValue = toSafeNumber(value, 0)

  if (nextValue > 0) {
    return `+${formatBalance(nextValue, 2)}`
  }

  if (nextValue < 0) {
    return `-${formatBalance(Math.abs(nextValue), 2)}`
  }

  return formatBalance(0, 2)
}

const buildDayStart = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate.getTime()
}

const buildDayEnd = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(23, 59, 59, 999)
  return nextDate.getTime()
}

const formatTopUpMethodName = (key: string) =>
  key.replace(/Recharge$/u, '').replace(/^./u, value => value.toUpperCase())

/**
 * 返回好友详情页空状态深色资源。
 */
export const getReferralFriendDetailEmptyDarkImage = () => emptyDarkImage

/**
 * 返回好友详情页空状态浅色资源。
 */
export const getReferralFriendDetailEmptyLightImage = () => emptyLightImage

/**
 * 生成好友详情页默认会员基础信息。
 */
export const createDefaultReferralFriendDetailMember = (
  userId = '',
  vipId?: number | string
): ReferralFriendDetailMemberInfo => ({
  account: '--',
  userId: String(userId ?? ''),
  name: '--',
  avatar: avatarImage,
  vipLevel: getVipLevelText(vipId),
  lastLoginTime: '--'
})

/**
 * 映射好友详情页会员基础信息。
 */
export const createReferralFriendDetailMember = (
  result?: ReferralFriendDetailMemberResult | null,
  vipId?: number | string
): ReferralFriendDetailMemberInfo => {
  const fallbackMember = createDefaultReferralFriendDetailMember(String(result?.rowId ?? ''), vipId)

  if (!result) {
    return fallbackMember
  }

  return {
    account: String(result.memberId ?? fallbackMember.account),
    userId: String(result.rowId ?? fallbackMember.userId),
    name: String(result.memberName || result.nickName || fallbackMember.name),
    avatar: avatarImage,
    vipLevel: getVipLevelText(vipId),
    lastLoginTime: formatTimestamp(result.loginDate)
  }
}

/**
 * 生成好友详情页日期标签。
 */
export const createReferralFriendDetailDateTabs = (
  t: TranslateFn
): ReferralFriendDetailTabItem<ReferralFriendDetailDateTabValue>[] => [
  {
    label: t('referral.friendDetailPage.dateTabs.today'),
    value: 'today'
  },
  {
    label: t('referral.friendDetailPage.dateTabs.yesterday'),
    value: 'yesterday'
  },
  {
    label: t('referral.friendDetailPage.dateTabs.last3Days'),
    value: 'last-3-days'
  },
  {
    label: t('referral.friendDetailPage.dateTabs.last15Days'),
    value: 'last-15-days'
  },
  {
    label: t('referral.friendDetailPage.dateTabs.last30Days'),
    value: 'last-30-days'
  }
]

/**
 * 生成好友详情页统计类型标签。
 */
export const createReferralFriendDetailStatsTabs = (
  t: TranslateFn
): ReferralFriendDetailTabItem<ReferralFriendDetailStatsTabValue>[] => [
  {
    label: t('referral.friendDetailPage.statsTabs.gameStats'),
    value: 'game-stats'
  },
  {
    label: t('referral.friendDetailPage.statsTabs.topUpStats'),
    value: 'top-up-stats'
  }
]

/**
 * 构建好友详情页日期筛选请求参数。
 */
export const buildReferralFriendDetailDateRange = (value: ReferralFriendDetailDateTabValue) => {
  const now = new Date()

  if (value === 'today') {
    return {
      startTime: buildDayStart(now),
      endTime: buildDayEnd(now)
    }
  }

  if (value === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    return {
      startTime: buildDayStart(yesterday),
      endTime: buildDayEnd(yesterday)
    }
  }

  const dayCountMap: Record<
    Exclude<ReferralFriendDetailDateTabValue, 'today' | 'yesterday'>,
    number
  > = {
    'last-3-days': 3,
    'last-15-days': 15,
    'last-30-days': 30
  }

  const dayCount = dayCountMap[value]
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - (dayCount - 1))

  return {
    startTime: buildDayStart(startDate),
    endTime: buildDayEnd(now)
  }
}

/**
 * 返回游戏分类展示文案。
 */
export const getReferralFriendDetailGameTypeLabel = (code: string, t: TranslateFn) => {
  const labelStrategy = CATEGORY_LABEL_STRATEGIES[String(code ?? '').trim()]

  return labelStrategy ? labelStrategy(t) : code || '--'
}

/**
 * 生成游戏统计汇总数据。
 */
export const createReferralFriendDetailGameSummary = (
  t: TranslateFn,
  rows: ReferralFriendDetailGameStatItem[] = []
): ReferralFriendDetailSummaryItem[] => {
  const totalBetAmount = rows.reduce((sum, item) => sum + toSafeNumber(item.betAmount), 0)
  const totalProfitAmount = rows.reduce((sum, item) => sum + toSafeNumber(item.gameAmount), 0)

  return [
    {
      label: t('referral.friendDetailPage.summary.validBets'),
      value: formatBalance(totalBetAmount, 2)
    },
    {
      label: t('referral.friendDetailPage.summary.profit'),
      value: formatSignedAmount(totalProfitAmount)
    }
  ]
}

/**
 * 生成充值统计汇总数据。
 */
export const createReferralFriendDetailTopUpSummary = (
  t: TranslateFn,
  result?: ReferralFriendDetailTopUpStatResult | null
): ReferralFriendDetailSummaryItem[] => {
  const depositAmount =
    toSafeNumber(result?.payRecharge) +
    toSafeNumber(result?.upayRecharge) +
    toSafeNumber(result?.usdtRecharge)
  const depositCount =
    toSafeNumber(result?.payRechargeNum) +
    toSafeNumber(result?.upayRechargeNum) +
    toSafeNumber(result?.usdtRechargeNum)

  return [
    {
      label: t('referral.friendDetailPage.summary.depositAmount'),
      value: formatBalance(depositAmount, 2)
    },
    {
      label: t('referral.friendDetailPage.summary.numberOfDeposits'),
      value: depositCount
    }
  ]
}

/**
 * 生成游戏统计表头。
 */
export const createReferralFriendDetailGameColumns = (t: TranslateFn) => [
  t('referral.friendDetailPage.table.game'),
  t('referral.friendDetailPage.table.validBets'),
  t('referral.friendDetailPage.table.profit')
]

/**
 * 生成充值统计表头。
 */
export const createReferralFriendDetailTopUpColumns = (t: TranslateFn) => [
  t('referral.friendDetailPage.table.paymentMethod'),
  t('referral.friendDetailPage.table.depositAmount'),
  t('referral.friendDetailPage.table.numberOfDeposits')
]

/**
 * 生成游戏统计表格数据。
 */
export const createReferralFriendDetailGameRows = (
  t: TranslateFn,
  rows: ReferralFriendDetailGameStatItem[] = []
): ReferralFriendDetailTableRow[] =>
  rows.map((item, index) => ({
    id: `game-${String(item.sysGameTypeCode ?? index)}`,
    name: getReferralFriendDetailGameTypeLabel(String(item.sysGameTypeCode ?? ''), t),
    amount: formatBalance(toSafeNumber(item.betAmount), 2),
    countOrProfit: formatSignedAmount(item.gameAmount)
  }))

/**
 * 生成充值统计表格数据。
 */
export const createReferralFriendDetailTopUpRows = (
  result?: ReferralFriendDetailTopUpStatResult | null
): ReferralFriendDetailTableRow[] => {
  const topUpEntries = [
    {
      key: 'payRecharge',
      amount: toSafeNumber(result?.payRecharge),
      count: toSafeNumber(result?.payRechargeNum)
    },
    {
      key: 'upayRecharge',
      amount: toSafeNumber(result?.upayRecharge),
      count: toSafeNumber(result?.upayRechargeNum)
    },
    {
      key: 'usdtRecharge',
      amount: toSafeNumber(result?.usdtRecharge),
      count: toSafeNumber(result?.usdtRechargeNum)
    }
  ]

  return topUpEntries.map(item => ({
    id: item.key,
    name: formatTopUpMethodName(item.key),
    amount: formatBalance(item.amount, 2),
    countOrProfit: item.count
  }))
}
