import facebookIcon from '@/static/img/referral/社交媒体.png'
import whatsappIcon from '@/static/img/referral/Group 1597886325 1.png'
import quickTaskIcon from '@/static/img/referral/Frame 2087330625.png'
import quickDetailsIcon from '@/static/img/referral/Frame 2087330625 (1).png'
import quickRulesIcon from '@/static/img/referral/Frame 2087330625 (2).png'
import quickGuideIcon from '@/static/img/referral/Frame 2087330625 (3).png'
import referralBanner from '@/static/img/referral/Frame 2131331296.png'
import commissionCoinIcon from '@/static/img/referral/金币.png'
import telegramIcon from '@/static/svg/game/detail/share/telegram.svg?url'
import tiktokIcon from '@/static/svg/game/detail/share/tiktok.svg?url'
import copyIcon from '@/static/svg/copy.svg?url'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

export type ReferralQuickActionId = 'tasks' | 'details' | 'rules' | 'guide'
export type ReferralSocialChannelId =
  | 'facebook'
  | 'whatsapp'
  | 'telegram'
  | 'telegram-group'
  | 'tiktok'
  | 'tiktok-live'
  | 'copy'

export interface ReferralQuickAction {
  id: ReferralQuickActionId
  label: string
  icon: string
}

export interface ReferralSocialChannel {
  id: ReferralSocialChannelId
  label: string
  icon: string
  iconClass?: string
}

/**
 * 生成推荐页顶部快捷入口数据。
 */
export const createReferralQuickActions = (t: TranslateFn): ReferralQuickAction[] => [
  {
    id: 'tasks',
    label: t('referral.h5.quickActions.tasks'),
    icon: quickTaskIcon
  },
  {
    id: 'details',
    label: t('referral.h5.quickActions.details'),
    icon: quickDetailsIcon
  },
  {
    id: 'rules',
    label: t('referral.h5.quickActions.rules'),
    icon: quickRulesIcon
  },
  {
    id: 'guide',
    label: t('referral.h5.quickActions.guide'),
    icon: quickGuideIcon
  }
]

/**
 * 返回推荐页横幅资源。
 */
export const getReferralBannerImage = () => referralBanner

/**
 * 返回佣金图标资源。
 */
export const getReferralCommissionCoinImage = () => commissionCoinIcon

/**
 * 生成推荐页社交分享渠道数据。
 */
export const createReferralSocialChannels = (t: TranslateFn): ReferralSocialChannel[] => [
  {
    id: 'facebook',
    label: t('referral.h5.shareChannels.facebook'),
    icon: facebookIcon
  },
  {
    id: 'whatsapp',
    label: t('referral.h5.shareChannels.whatsapp'),
    icon: whatsappIcon
  },
  {
    id: 'telegram',
    label: t('referral.h5.shareChannels.telegram'),
    icon: telegramIcon,
    iconClass: 'rounded-[15px] bg-[#1DC1FA] p-2.5'
  },
  {
    id: 'telegram-group',
    label: t('referral.h5.shareChannels.telegramGroup'),
    icon: telegramIcon,
    iconClass: 'rounded-[15px] bg-[#1DC1FA] p-2.5'
  },
  {
    id: 'tiktok',
    label: t('referral.h5.shareChannels.tiktok'),
    icon: tiktokIcon,
    iconClass: 'rounded-[15px] bg-[#111111] p-2.5'
  },
  {
    id: 'tiktok-live',
    label: t('referral.h5.shareChannels.tiktokLive'),
    icon: tiktokIcon,
    iconClass: 'rounded-[15px] bg-[#111111] p-2.5'
  },
  {
    id: 'copy',
    label: t('referral.copy'),
    icon: copyIcon,
    iconClass: 'rounded-[15px] bg-bg-3 p-2.5'
  }
]

/**
 * 生成推荐页榜单祝贺文案。
 */
export const createReferralMarqueeMessages = (t: TranslateFn): string[] => [
  t('referral.h5.marquee', { account: '877*****' }),
  t('referral.h5.marquee', { account: '665*****' }),
  t('referral.h5.marquee', { account: '901*****' })
]

/**
 * 构建推荐页默认分享链接。
 */
export const getDefaultReferralLink = () => 'https://www.tggame.com/invite/877*****'

/**
 * 构建推荐页默认分享文案。
 */
export const buildReferralShareMessage = (t: TranslateFn, referralLink: string) =>
  `${t('referral.shareDefaultText')} ${referralLink}`
