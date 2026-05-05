import quickTaskIcon from '@/static/img/referral/quick-action-task.png'
import quickDetailsIcon from '@/static/img/referral/quick-action-details.png'
import quickRulesIcon from '@/static/img/referral/quick-action-rules.png'
import quickGuideIcon from '@/static/img/referral/quick-action-guide.png'
import referralBanner from '@/static/img/referral/referral-banner.png'
import commissionCoinIcon from '@/static/img/referral/referral-coin.png'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

export type ReferralQuickActionId = 'tasks' | 'details' | 'rules' | 'guide'

export interface ReferralShareChannelApiItem {
  openStatus?: unknown
  shareDomainImage?: unknown
  shareDomainUrl?: unknown
  shareName?: unknown
  site?: unknown
  sort?: unknown
}

export interface ReferralQuickAction {
  id: ReferralQuickActionId
  label: string
  icon: string
}

export interface ReferralSocialChannel {
  openStatus: number
  shareDomainImage: string
  shareDomainUrl: string
  shareName: string
  site: string
  sort: number
}

/**
 * 将分享图标字段转换为可用图片地址。
 */
export const toReferralSocialChannelImageUrl = (value: unknown) => {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue
  }

  const imageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
  const imagePath = normalizedValue.replace(/^\/+/, '')

  return imageBaseUrl ? `${imageBaseUrl}/${imagePath}` : normalizedValue
}

/**
 * 将接口返回的分享渠道配置转换为页面可用数据。
 */
export const buildReferralSocialChannelsFromApi = (result: unknown): ReferralSocialChannel[] => {
  if (!Array.isArray(result)) {
    return []
  }

  return result
    .filter(item => Number((item as ReferralShareChannelApiItem)?.openStatus ?? 1) === 1)
    .map((item, index) => {
      const channelItem = (item ?? {}) as ReferralShareChannelApiItem
      const shareName = String(channelItem.shareName ?? '').trim()
      const shareDomainImage = toReferralSocialChannelImageUrl(channelItem.shareDomainImage)
      const shareDomainUrl = String(channelItem.shareDomainUrl ?? '').trim()
      const site = String(channelItem.site ?? '').trim()
      const sort = Number(channelItem.sort)

      return {
        openStatus: Number(channelItem.openStatus ?? 1),
        shareDomainImage,
        shareDomainUrl,
        shareName,
        site,
        sort: Number.isFinite(sort) ? sort : index
      }
    })
    .filter(
      item =>
        Boolean(item.shareName) && Boolean(item.shareDomainImage) && Boolean(item.shareDomainUrl)
    )
    .sort((left, right) => left.sort - right.sort)
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
 * 生成推荐页榜单祝贺文案。
 */
export const createReferralMarqueeMessages = (t: TranslateFn): string[] => [
  t('referral.h5.marquee', { account: '877*****' }),
  t('referral.h5.marquee', { account: '665*****' }),
  t('referral.h5.marquee', { account: '901*****' })
]

/**
 * 生成推荐文案弹窗预设文案列表。
 */
export const createReferralMessagePresets = (t: TranslateFn): string[] => [
  t('referral.messagePopup.presets.exclusiveRewards'),
  t('referral.messagePopup.presets.earnTogether'),
  t('referral.messagePopup.presets.unlockBonus')
]

/**
 * 构建推荐页默认分享链接。
 */
export const getDefaultReferralLink = () => 'https://www.tggame.com/invite/877*****'

/**
 * 构建推荐页复制文案内容。
 */
export const buildReferralShareMessage = (message: string, referralLink: string) =>
  [String(message ?? '').trim(), String(referralLink ?? '').trim()].filter(Boolean).join(' ')
