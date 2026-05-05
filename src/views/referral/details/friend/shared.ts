import avatarImage from '@/static/img/home/avatar.png'
import emptyDarkImage from '@/static/img/explore/default.png'
import emptyLightImage from '@/static/img/explore/default_white.png'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

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

/**
 * 返回好友详情页空状态深色资源。
 */
export const getReferralFriendDetailEmptyDarkImage = () => emptyDarkImage

/**
 * 返回好友详情页空状态浅色资源。
 */
export const getReferralFriendDetailEmptyLightImage = () => emptyLightImage

/**
 * 生成好友详情页会员基础信息。
 */
export const createReferralFriendDetailMember = (
  account = '200020202'
): ReferralFriendDetailMemberInfo => ({
  account,
  userId: 'wh******y3',
  name: 'Martin',
  avatar: avatarImage,
  vipLevel: 'VIP1',
  lastLoginTime: '12/18/2026 11:14:15 AM'
})

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
 * 生成游戏统计汇总数据。
 */
export const createReferralFriendDetailGameSummary = (
  t: TranslateFn
): ReferralFriendDetailSummaryItem[] => [
  {
    label: t('referral.friendDetailPage.summary.validBets'),
    value: 5
  },
  {
    label: t('referral.friendDetailPage.summary.profit'),
    value: '9999.00'
  }
]

/**
 * 生成充值统计汇总数据。
 */
export const createReferralFriendDetailTopUpSummary = (
  t: TranslateFn
): ReferralFriendDetailSummaryItem[] => [
  {
    label: t('referral.friendDetailPage.summary.depositAmount'),
    value: '9999.00'
  },
  {
    label: t('referral.friendDetailPage.summary.numberOfDeposits'),
    value: 5
  }
]

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
  t: TranslateFn
): ReferralFriendDetailTableRow[] =>
  Array.from({ length: 10 }, (_, index) => {
    const isPositive = index % 2 === 0

    return {
      id: `game-${index + 1}`,
      name: t('referral.friendDetailPage.tableValues.slots'),
      amount: isPositive ? '9999.00' : '100.00',
      countOrProfit: isPositive ? '+9999.00' : '-100.00'
    }
  })

/**
 * 生成充值统计表格数据。
 */
export const createReferralFriendDetailTopUpRows = (): ReferralFriendDetailTableRow[] =>
  Array.from({ length: 10 }, (_, index) => ({
    id: `topup-${index + 1}`,
    name: 'USDT',
    amount: '0.00',
    countOrProfit: 0
  }))
