import emptyDarkImage from '@/static/img/explore/default.png'
import emptyLightImage from '@/static/img/explore/default_white.png'
import avatarImage from '@/static/img/home/avatar.png'
import invitePosterFallbackImage from '@/static/img/personalCenter/yaoqing.png'
import invitePosterImage from '@/static/img/personalCenter/yaoqing2.png'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

export type ReferralDetailsTabValue = 'friends' | 'stats' | 'reward-history' | 'claim-history'
export type ReferralDetailsFriendStatus = 'active' | 'inactive'

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
  avatar: string
  vipLevel: string
  deposit: string | number
  validBets: string | number
  createTime: string
  status: ReferralDetailsFriendStatus
  statusText: string
}

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
export const createReferralDetailsSummaryList = (t: TranslateFn): ReferralDetailsSummaryItem[] => [
  {
    label: t('referral.detailsPage.summary.newFriends'),
    value: 5
  },
  {
    label: t('referral.detailsPage.summary.activeFriends'),
    value: 111
  },
  {
    label: t('referral.detailsPage.summary.validBets'),
    value: '9999.00'
  }
]

/**
 * 生成推荐详情页好友列表示例数据。
 */
export const createReferralDetailsFriends = (t: TranslateFn): ReferralDetailsFriendItem[] => [
  {
    id: '200020202',
    avatar: avatarImage,
    vipLevel: 'VIP1',
    deposit: 0,
    validBets: 0,
    createTime: '12/18/2026 11:14:15 AM',
    status: 'active',
    statusText: t('referral.detailsPage.status.active')
  },
  {
    id: '200020203',
    avatar: avatarImage,
    vipLevel: 'VIP1',
    deposit: 0,
    validBets: 0,
    createTime: '12/18/2026 11:14:15 AM',
    status: 'inactive',
    statusText: t('referral.detailsPage.status.inactive')
  }
]
